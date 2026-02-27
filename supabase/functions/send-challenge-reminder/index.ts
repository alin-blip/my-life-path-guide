import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");

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

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface ChallengeDay {
  day: number;
  titleRo: string;
  descRo: string;
}

const challengeDays: ChallengeDay[] = [
  { day: 1, titleRo: "Viziune si Claritate", descRo: "Descoperă toate instrumentele disponibile" },
  { day: 2, titleRo: "Corp si Spirit", descRo: "Obiective pentru sănătate și spirit" },
  { day: 3, titleRo: "Relatii si Business", descRo: "Obiective pentru relații și carieră" },
  { day: 4, titleRo: "Rutina Zilnica", descRo: "Configurează rutina matinală" },
  { day: 5, titleRo: "AI si Viziune", descRo: "Generează imagini și meditație personalizată" },
  { day: 6, titleRo: "Accountability", descRo: "Configurează sistemul de notificări" },
  { day: 7, titleRo: "Integrare Completa", descRo: "Recapitulare completă" },
];

function generateReminderEmail(name: string | null, currentDay: ChallengeDay): string {
  const displayName = name?.split(' ')[0] || '';
  const greeting = displayName ? `Salut ${displayName},` : 'Salut,';

  return `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
<body style="margin: 0; padding: 0; background-color: #f4f4f5; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color: #f4f4f5;">
    <tr>
      <td align="center" style="padding: 40px 20px;">
        <table role="presentation" width="600" cellpadding="0" cellspacing="0" style="max-width: 600px; background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
          <tr>
            <td style="background-color: #18181b; padding: 24px 32px; text-align: center;">
              <h1 style="color: #ffffff; margin: 0; font-size: 20px; font-weight: 600;">CEO Mind OS</h1>
            </td>
          </tr>
          <tr>
            <td style="padding: 32px;">
              <p style="color: #4b5563; font-size: 16px; line-height: 1.6; margin: 0 0 16px 0;">${greeting}</p>
              <h2 style="color: #1a1a1a; font-size: 20px; margin: 0 0 12px 0;">Ziua ${currentDay.day}: ${currentDay.titleRo}</h2>
              <p style="color: #4b5563; font-size: 16px; line-height: 1.6; margin: 0 0 24px 0;">${currentDay.descRo}</p>
              <div style="text-align: center; margin: 32px 0;">
                <a href="https://ceomindos.com/challenge/${currentDay.day}" 
                   style="display: inline-block; background-color: #18181b; color: #ffffff; text-decoration: none; padding: 14px 32px; border-radius: 6px; font-size: 16px; font-weight: 600;">
                  Incepe Ziua ${currentDay.day}
                </a>
              </div>
            </td>
          </tr>
          <tr>
            <td style="padding: 20px 32px; border-top: 1px solid #e5e7eb; text-align: center;">
              <p style="color: #9ca3af; margin: 0; font-size: 12px;">CEO Mind OS</p>
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
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const { data: participants, error: participantsError } = await supabase
      .from('email_leads')
      .select('*')
      .eq('lead_magnet', 'challenge_7_zile')
      .eq('subscribed', true);

    if (participantsError) throw participantsError;

    const results = [];

    for (const participant of participants || []) {
      const signupDate = new Date(participant.created_at);
      const now = new Date();
      const daysSinceSignup = Math.floor((now.getTime() - signupDate.getTime()) / (1000 * 60 * 60 * 24)) + 1;
      
      if (daysSinceSignup > 7) continue;
      
      const currentDay = challengeDays[daysSinceSignup - 1];
      if (!currentDay) continue;

      try {
        const subject = `Ziua ${currentDay.day}: ${currentDay.titleRo}`;
        const emailHtml = generateReminderEmail(participant.name, currentDay);
        const emailResponse = await sendEmail(participant.email, subject, emailHtml);

        results.push({ email: participant.email, day: currentDay.day, success: true, messageId: emailResponse?.id });
      } catch (emailError) {
        console.error(`Error sending to ${participant.email}:`, emailError);
        results.push({ email: participant.email, day: currentDay.day, success: false, error: String(emailError) });
      }
    }

    return new Response(
      JSON.stringify({ success: true, sent: results.filter(r => r.success).length, failed: results.filter(r => !r.success).length, results }),
      { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  } catch (error: any) {
    console.error("Error in send-challenge-reminder:", error);
    return new Response(JSON.stringify({ error: error.message }), { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } });
  }
};

serve(handler);
