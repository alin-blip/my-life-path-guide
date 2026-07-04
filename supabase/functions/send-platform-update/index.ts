import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";
import { requireCronOrAdmin } from "../_shared/require-cron-or-admin.ts";

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");
const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

async function sendEmail(to: string, subject: string, html: string) {
  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${RESEND_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: "CEO Mind OS <noreply@ceomindos.com>",
      to: [to],
      subject,
      html,
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Resend API error: ${error}`);
  }

  return response.json();
}

function generatePlatformUpdateEmail(name: string | null): string {
  const displayName = name?.split(' ')[0] || '';
  const greeting = displayName ? `Salut ${displayName},` : 'Salut,';

  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin: 0; padding: 0; background-color: #f4f4f5; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color: #f4f4f5;">
    <tr>
      <td align="center" style="padding: 40px 20px;">
        <table role="presentation" width="600" cellpadding="0" cellspacing="0" style="max-width: 600px; background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
          
          <!-- Header -->
          <tr>
            <td style="background-color: #18181b; padding: 24px 32px; text-align: center;">
              <h1 style="color: #ffffff; margin: 0; font-size: 20px; font-weight: 600; letter-spacing: 0.5px;">
                 CEO Mind OS
              </h1>
            </td>
          </tr>

          <!-- Content -->
          <tr>
            <td style="padding: 32px;">
              <p style="color: #1a1a1a; font-size: 16px; line-height: 1.6; margin: 0 0 20px 0;">
                ${greeting}
              </p>

              <p style="color: #4b5563; font-size: 16px; line-height: 1.6; margin: 0 0 20px 0;">
                Am identificat si corectat o problema tehnica in modulul de creare obiective. Daca ai intampinat dificultati cand ai incercat sa setezi obiectivele in Challenge, totul functioneaza acum corect.
              </p>

              <p style="color: #4b5563; font-size: 16px; line-height: 1.6; margin: 0 0 24px 0;">
                Te invitam sa reincerci si sa continui de unde ai ramas. Progresul tau a fost salvat.
              </p>

              <!-- CTA -->
              <div style="text-align: center; margin: 32px 0;">
                <a href="https://ceomindos.com/challenge?utm_source=email&utm_medium=platform_update&utm_campaign=fix_notification" 
                   style="display: inline-block; background-color: #18181b; color: #ffffff; text-decoration: none; padding: 14px 32px; border-radius: 6px; font-size: 16px; font-weight: 600;">
                  Continua Challenge-ul
                </a>
              </div>

              <p style="color: #9ca3af; font-size: 14px; line-height: 1.6; margin: 24px 0 0 0;">
                Daca ai intrebari, raspunde direct la acest email.
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding: 20px 32px; border-top: 1px solid #e5e7eb; text-align: center;">
              <p style="color: #9ca3af; margin: 0; font-size: 12px;">
                CEO Mind OS &bull; ceomindos.com
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  const authFail = await requireCronOrAdmin(req, corsHeaders);
  if (authFail) return authFail;

  try {
    if (!RESEND_API_KEY) throw new Error("RESEND_API_KEY missing");

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    // Get all unique challenge subscribers
    const { data: leads, error: leadsError } = await supabase
      .from('email_leads')
      .select('email, name')
      .eq('subscribed', true)
      .like('lead_magnet', 'challenge%');

    if (leadsError) throw leadsError;

    // Deduplicate by email
    const uniqueEmails = new Map<string, string | null>();
    for (const lead of leads || []) {
      if (!uniqueEmails.has(lead.email)) {
        uniqueEmails.set(lead.email, lead.name);
      }
    }

    console.log(`Found ${uniqueEmails.size} unique challenge subscribers`);

    const results: { email: string; success: boolean; error?: string }[] = [];
    const subject = 'Update platforma — problema rezolvata';

    for (const [email, name] of uniqueEmails) {
      try {
        // Check if already sent
        const { data: existing } = await supabase
          .from('email_sequence_log')
          .select('id')
          .eq('email', email)
          .eq('sequence_type', 'platform_update')
          .maybeSingle();

        if (existing) {
          console.log(`Already sent to ${email}, skipping`);
          continue;
        }

        const html = generatePlatformUpdateEmail(name);
        await sendEmail(email, subject, html);

        // Log the email
        await supabase.from('email_sequence_log').insert({
          email,
          sequence_type: 'platform_update',
          sent_at: new Date().toISOString(),
          metadata: { type: 'goal_wizard_fix' }
        });

        results.push({ email, success: true });
        console.log(`Platform update sent to ${email}`);

        // Rate limit: 1 email/second
        await new Promise(resolve => setTimeout(resolve, 1000));
      } catch (err) {
        const msg = err instanceof Error ? err.message : String(err);
        console.error(`Error sending to ${email}:`, msg);
        results.push({ email, success: false, error: msg });
      }
    }

    const sent = results.filter(r => r.success).length;
    const failed = results.filter(r => !r.success).length;

    console.log(`Platform update complete: ${sent} sent, ${failed} failed`);

    return new Response(JSON.stringify({ success: true, sent, failed, results }), {
      status: 200,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });

  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error);
    console.error("Error in send-platform-update:", msg);
    return new Response(JSON.stringify({ error: msg }), {
      status: 500,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  }
};

serve(handler);
