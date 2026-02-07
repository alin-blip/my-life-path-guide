import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { Resend } from "https://esm.sh/resend@2.0.0";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY")!;
const resend = new Resend(RESEND_API_KEY);

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

interface EmailContent { subject: string; body: string; ctaText: string; }

const getReactivationContent = (stepNumber: number, name: string): EmailContent => {
  const firstName = name?.split(' ')[0] || '';
  const steps: Record<number, EmailContent> = {
    1: {
      subject: firstName ? `${firstName}, ai uitat ceva important` : 'Ai uitat ceva important',
      body: 'Ai decis sa iti schimbi viata. Dar nu ai terminat ce ai inceput.\n\nZiua 1 dureaza 15 minute. In 15 minute poti avea mai multa claritate decat in ultimii 5 ani.',
      ctaText: 'Incepe Ziua 1'
    },
    2: {
      subject: 'E din cauza lipsei de timp, sau altceva?',
      body: 'Multi oameni nu incep pentru ca le e frica sa afle raspunsul la "Ce vreau de fapt?"\n\nChallenge-ul te ghideaza pas cu pas, fara sa te simti copleșit.',
      ctaText: 'Fa Primii 5 Minute'
    },
    3: {
      subject: 'Costul de a nu avea un plan',
      body: 'In ultimele 72 de ore, alti participanti si-au setat viziunea pentru 2026.\n\nFara plan clar = decizii reactive. Fara obiective = energie risipita. Fara directie = frustrare zilnica.',
      ctaText: 'Recupereaza Ziua 1'
    },
    4: {
      subject: firstName ? `${firstName}, te mai asteptam` : 'Te mai asteptam',
      body: 'Au trecut 5 zile. Alti participanti sunt deja la Ziua 5 — au rutina configurata si AI Coach activ.\n\nViata e ocupata. Dar tocmai de asta ai nevoie de un sistem.',
      ctaText: 'Incepe Astazi'
    },
    5: {
      subject: 'Nu pierde progresul de pana acum',
      body: 'Daca nu incepi azi, probabil nu vei incepe niciodata.\n\nDaca nu mai vrei sa primesti aceste emailuri, te poti dezabona mai jos.',
      ctaText: 'Vreau sa Incep'
    }
  };
  return steps[stepNumber] || steps[1];
};

const generateTrackingId = (stepNumber: number) => `challenge-reactivation-s${stepNumber}-${Date.now()}-${Math.random().toString(36).substring(2, 11)}`;

const getStepForUser = (signupDate: Date): number | null => {
  const hoursSinceSignup = (Date.now() - signupDate.getTime()) / (1000 * 60 * 60);
  if (hoursSinceSignup >= 24 && hoursSinceSignup < 48) return 1;
  if (hoursSinceSignup >= 48 && hoursSinceSignup < 72) return 2;
  if (hoursSinceSignup >= 72 && hoursSinceSignup < 120) return 3;
  if (hoursSinceSignup >= 120 && hoursSinceSignup < 168) return 4;
  if (hoursSinceSignup >= 168 && hoursSinceSignup < 240) return 5;
  return null;
};

function buildEmail(content: EmailContent, trackingPixelUrl: string, unsubscribeUrl: string): string {
  return `<!DOCTYPE html>
<html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
<body style="margin: 0; padding: 0; background-color: #f4f4f5; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color: #f4f4f5;">
    <tr><td align="center" style="padding: 40px 20px;">
      <table role="presentation" width="600" cellpadding="0" cellspacing="0" style="max-width: 600px; background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
        <tr><td style="background-color: #18181b; padding: 24px 32px; text-align: center;"><h1 style="color: #ffffff; margin: 0; font-size: 20px; font-weight: 600;">WarriorOS</h1></td></tr>
        <tr><td style="padding: 32px;">
          <div style="color: #4b5563; font-size: 16px; line-height: 1.7; white-space: pre-line; margin: 0 0 24px 0;">${content.body}</div>
          <div style="text-align: center; margin: 32px 0;">
            <a href="https://warriorsos.com/challenge/1?utm_source=email&utm_medium=reactivation" style="display: inline-block; background-color: #18181b; color: #ffffff; text-decoration: none; padding: 14px 32px; border-radius: 6px; font-size: 16px; font-weight: 600;">${content.ctaText}</a>
          </div>
        </td></tr>
        <tr><td style="padding: 20px 32px; border-top: 1px solid #e5e7eb; text-align: center;">
          <p style="color: #9ca3af; margin: 0 0 8px 0; font-size: 12px;">WarriorOS</p>
          <a href="${unsubscribeUrl}" style="color: #9ca3af; font-size: 11px; text-decoration: underline;">Dezabonare</a>
        </td></tr>
      </table>
    </td></tr>
  </table>
  <img src="${trackingPixelUrl}" width="1" height="1" style="display:none;" alt="">
</body></html>`;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
    const tenDaysAgo = new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString();
    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();

    const { data: leads, error: leadsError } = await supabase
      .from('email_leads').select('email, created_at, metadata, subscribed, name')
      .eq('subscribed', true).gte('created_at', tenDaysAgo).lte('created_at', oneDayAgo);
    if (leadsError) throw leadsError;

    let emailsSent = 0;
    const errors: string[] = [];

    for (const lead of leads || []) {
      try {
        const { data: authUsers } = await supabase.auth.admin.listUsers();
        const authUser = authUsers?.users?.find(u => u.email === lead.email);
        if (!authUser) continue;

        const { data: progress } = await supabase
          .from('challenge_progress').select('day_number, completed')
          .eq('user_id', authUser.id).eq('day_number', 1).maybeSingle();
        if (progress?.completed) continue;

        const stepNumber = getStepForUser(new Date(lead.created_at));
        if (!stepNumber) continue;

        const { data: existingLog } = await supabase
          .from('email_sequence_log').select('id')
          .eq('email', lead.email).eq('sequence_type', 'challenge_reactivation').eq('step_number', stepNumber).maybeSingle();
        if (existingLog) continue;

        const name = authUser.user_metadata?.full_name || authUser.user_metadata?.name || lead.name || '';
        const content = getReactivationContent(stepNumber, name);
        const trackingId = generateTrackingId(stepNumber);
        const trackingPixelUrl = `${SUPABASE_URL}/functions/v1/track-email-open?t=${trackingId}`;
        const unsubscribeUrl = `${SUPABASE_URL}/functions/v1/unsubscribe-email?id=${trackingId}`;
        const html = buildEmail(content, trackingPixelUrl, unsubscribeUrl);

        await resend.emails.send({ from: "WarriorOS <noreply@warriorsos.com>", to: [lead.email], subject: content.subject, html });

        await supabase.from('email_sequence_log').insert({
          email: lead.email, sequence_type: 'challenge_reactivation', tracking_id: trackingId, step_number: stepNumber, sent_at: new Date().toISOString(),
          metadata: { user_id: authUser.id, resend_id: null }
        });
        emailsSent++;
      } catch (err: any) {
        errors.push(`${lead.email}: ${err.message}`);
      }
    }

    return new Response(JSON.stringify({ success: true, emailsSent, errors: errors.length > 0 ? errors : undefined }), { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } });
  } catch (error: any) {
    console.error("Error in send-challenge-reactivation:", error);
    return new Response(JSON.stringify({ error: error.message }), { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } });
  }
};

serve(handler);
