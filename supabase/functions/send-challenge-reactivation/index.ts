import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { Resend } from "https://esm.sh/resend@2.0.0";
import { resolveLeadLanguage, type EmailLang } from "../_shared/resolve-lead-language.ts";
import { requireCronOrAdmin } from "../_shared/require-cron-or-admin.ts";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY")!;
const resend = new Resend(RESEND_API_KEY);

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

interface EmailContent { subject: string; body: string; ctaText: string; }

const getReactivationContent = (stepNumber: number, name: string, lang: EmailLang): EmailContent => {
  const firstName = name?.split(' ')[0] || '';
  const isEn = lang === 'en';

  const stepsRo: Record<number, EmailContent> = {
    1: { subject: firstName ? `${firstName}, ai uitat ceva important` : 'Ai uitat ceva important', body: 'Ai decis sa iti schimbi viata. Dar nu ai terminat ce ai inceput.\n\nZiua 1 dureaza 15 minute. In 15 minute poti avea mai multa claritate decat in ultimii 5 ani.', ctaText: 'Incepe Ziua 1' },
    2: { subject: 'E din cauza lipsei de timp, sau altceva?', body: 'Multi oameni nu incep pentru ca le e frica sa afle raspunsul la "Ce vreau de fapt?"\n\nChallenge-ul te ghideaza pas cu pas, fara sa te simti coplesit.', ctaText: 'Fa Primii 5 Minute' },
    3: { subject: 'Costul de a nu avea un plan', body: 'In ultimele 72 de ore, alti participanti si-au setat viziunea pentru 2026.\n\nFara plan clar = decizii reactive. Fara obiective = energie risipita. Fara directie = frustrare zilnica.', ctaText: 'Recupereaza Ziua 1' },
    4: { subject: firstName ? `${firstName}, te mai asteptam` : 'Te mai asteptam', body: 'Au trecut 5 zile. Alti participanti sunt deja la Ziua 5 — au rutina configurata si AI Coach activ.\n\nViata e ocupata. Dar tocmai de asta ai nevoie de un sistem.', ctaText: 'Incepe Astazi' },
    5: { subject: 'Nu pierde progresul de pana acum', body: 'Daca nu incepi azi, probabil nu vei incepe niciodata.\n\nDaca nu mai vrei sa primesti aceste emailuri, te poti dezabona mai jos.', ctaText: 'Vreau sa Incep' }
  };

  const stepsEn: Record<number, EmailContent> = {
    1: { subject: firstName ? `${firstName}, you forgot something important` : 'You forgot something important', body: "You decided to change your life. But you didn't finish what you started.\n\nDay 1 takes 15 minutes. In 15 minutes you can get more clarity than in the last 5 years.", ctaText: 'Start Day 1' },
    2: { subject: 'Is it lack of time, or something else?', body: 'Many people don\'t start because they\'re afraid to hear the answer to "What do I actually want?"\n\nThe Challenge walks you through step by step, without overwhelm.', ctaText: 'Take the First 5 Minutes' },
    3: { subject: 'The cost of not having a plan', body: 'In the last 72 hours, other participants have set their 2026 vision.\n\nNo clear plan = reactive decisions. No goals = wasted energy. No direction = daily frustration.', ctaText: 'Recover Day 1' },
    4: { subject: firstName ? `${firstName}, we're still saving your spot` : "We're still saving your spot", body: "5 days have passed. Other participants are already on Day 5 — routine configured, AI Coach active.\n\nLife is busy. That's exactly why you need a system.", ctaText: 'Start Today' },
    5: { subject: "Don't lose the progress you've made", body: "If you don't start today, you probably never will.\n\nIf you no longer want these emails, you can unsubscribe below.", ctaText: 'I Want to Start' }
  };

  const steps = isEn ? stepsEn : stepsRo;
  return steps[stepNumber] || steps[1];
};

const generateTrackingId = () => crypto.randomUUID();

// Step cadence in DAYS since enrollment/signup: 1, 3, 6, 10, 14
const getStepForDaysElapsed = (daysSince: number): number | null => {
  if (daysSince >= 1 && daysSince < 3) return 1;
  if (daysSince >= 3 && daysSince < 6) return 2;
  if (daysSince >= 6 && daysSince < 10) return 3;
  if (daysSince >= 10 && daysSince < 14) return 4;
  if (daysSince >= 14 && daysSince < 20) return 5;
  return null;
};

function buildEmail(content: EmailContent, trackingPixelUrl: string, unsubscribeUrl: string, lang: EmailLang, hasAccount: boolean): string {
  const unsubLabel = lang === 'en' ? 'Unsubscribe' : 'Dezabonare';
  // Send unauthenticated leads to /auth first (with redirect back to challenge day 1)
  const ctaUrl = hasAccount
    ? 'https://ceomindos.com/challenge/1?utm_source=email&utm_medium=reactivation&utm_campaign=win_back'
    : 'https://ceomindos.com/auth?redirect=/challenge/1&utm_source=email&utm_medium=reactivation&utm_campaign=win_back';
  return `<!DOCTYPE html>
<html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
<body style="margin:0;padding:0;background:#f4f4f5;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Arial,sans-serif;">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f4f4f5;"><tr><td align="center" style="padding:40px 20px;">
<table role="presentation" width="600" cellpadding="0" cellspacing="0" style="max-width:600px;background:#fff;border-radius:8px;overflow:hidden;box-shadow:0 1px 3px rgba(0,0,0,0.1);">
<tr><td style="background:#18181b;padding:24px 32px;text-align:center;"><h1 style="color:#fff;margin:0;font-size:20px;font-weight:600;">CEO Mind OS</h1></td></tr>
<tr><td style="padding:32px;">
<div style="color:#4b5563;font-size:16px;line-height:1.7;white-space:pre-line;margin:0 0 24px 0;">${content.body}</div>
<div style="text-align:center;margin:32px 0;"><a href="${ctaUrl}" style="display:inline-block;background:#18181b;color:#fff;text-decoration:none;padding:14px 32px;border-radius:6px;font-size:16px;font-weight:600;">${content.ctaText}</a></div>
</td></tr>
<tr><td style="padding:20px 32px;border-top:1px solid #e5e7eb;text-align:center;">
<p style="color:#9ca3af;margin:0 0 8px 0;font-size:12px;">CEO Mind OS</p>
<a href="${unsubscribeUrl}" style="color:#9ca3af;font-size:11px;text-decoration:underline;">${unsubLabel}</a>
</td></tr>
</table></td></tr></table>
<img src="${trackingPixelUrl}" width="1" height="1" style="display:none;" alt="">
</body></html>`;
}

interface Candidate {
  email: string;
  name: string | null;
  referenceDate: Date;  // enrollment date (manual) OR signup date (auto)
  isManual: boolean;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
  const authFail = await requireCronOrAdmin(req, corsHeaders);
  if (authFail) return authFail;

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    // Build candidate set from BOTH sources:
    // 1. Manual enrollments (admin-triggered, includes old leads outside 20d window)
    // 2. Auto: recent signups from email_leads within 20d
    const candidates = new Map<string, Candidate>();

    const { data: manual } = await supabase
      .from('challenge_reactivation_manual')
      .select('email, enrolled_at')
      .is('completed_at', null)
      .is('unsubscribed_at', null);

    for (const m of manual || []) {
      const key = m.email.toLowerCase();
      candidates.set(key, {
        email: m.email,
        name: null,
        referenceDate: new Date(m.enrolled_at),
        isManual: true,
      });
    }

    const twentyDaysAgo = new Date(Date.now() - 20 * 24 * 60 * 60 * 1000).toISOString();
    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
    const { data: leads } = await supabase
      .from('email_leads')
      .select('email, created_at, name, subscribed')
      .eq('subscribed', true)
      .gte('created_at', twentyDaysAgo)
      .lte('created_at', oneDayAgo)
      .like('source', 'challenge%');

    for (const l of leads || []) {
      const key = l.email.toLowerCase();
      if (candidates.has(key)) {
        // manual takes precedence, but capture name
        const c = candidates.get(key)!;
        if (!c.name && l.name) c.name = l.name;
        continue;
      }
      candidates.set(key, {
        email: l.email,
        name: l.name ?? null,
        referenceDate: new Date(l.created_at),
        isManual: false,
      });
    }

    // Preload auth users once
    const { data: authList } = await supabase.auth.admin.listUsers();
    const authByEmail = new Map<string, any>();
    for (const u of authList?.users || []) {
      if (u.email) authByEmail.set(u.email.toLowerCase(), u);
    }

    // Preload suppressed
    const { data: suppressed } = await supabase.from('suppressed_emails').select('email');
    const suppressedSet = new Set((suppressed || []).map((s: any) => s.email.toLowerCase()));

    let emailsSent = 0;
    const errors: string[] = [];
    const skipped: Record<string, number> = { suppressed: 0, no_step: 0, already_sent: 0, day1_completed: 0 };

    for (const c of candidates.values()) {
      try {
        const emailLower = c.email.toLowerCase();
        if (suppressedSet.has(emailLower)) { skipped.suppressed++; continue; }

        const authUser = authByEmail.get(emailLower);
        const hasAccount = !!authUser;

        // If has account AND completed day 1, skip entirely
        if (hasAccount) {
          const { data: progress } = await supabase
            .from('challenge_progress')
            .select('completed')
            .eq('user_id', authUser.id)
            .eq('day_number', 1)
            .maybeSingle();
          if (progress?.completed) { skipped.day1_completed++; continue; }
        }

        const daysSince = (Date.now() - c.referenceDate.getTime()) / (1000 * 60 * 60 * 24);
        const stepNumber = getStepForDaysElapsed(daysSince);
        if (!stepNumber) { skipped.no_step++; continue; }

        const { data: existingLog } = await supabase
          .from('email_sequence_log')
          .select('id')
          .eq('email', c.email)
          .eq('sequence_type', 'challenge_reactivation')
          .eq('day_number', stepNumber)
          .maybeSingle();
        if (existingLog) { skipped.already_sent++; continue; }

        const name = authUser?.user_metadata?.full_name || authUser?.user_metadata?.name || c.name || '';
        const lang = await resolveLeadLanguage(supabase, c.email);
        const content = getReactivationContent(stepNumber, name, lang);
        const trackingId = generateTrackingId();
        const trackingPixelUrl = `${SUPABASE_URL}/functions/v1/track-email-open?t=${trackingId}`;
        const unsubscribeUrl = `${SUPABASE_URL}/functions/v1/unsubscribe-email?id=${trackingId}`;
        const html = buildEmail(content, trackingPixelUrl, unsubscribeUrl, lang, hasAccount);

        await resend.emails.send({
          from: "CEO Mind OS <noreply@ceomindos.com>",
          to: [c.email],
          subject: content.subject,
          html,
        });

        await supabase.from('email_sequence_log').insert({
          email: c.email,
          sequence_type: 'challenge_reactivation',
          tracking_id: trackingId,
          day_number: stepNumber,
          sent_at: new Date().toISOString(),
          metadata: { user_id: authUser?.id || null, language: lang, has_account: hasAccount, is_manual: c.isManual }
        });

        // If step 5 sent, mark manual enrollment complete so we don't hold it forever
        if (c.isManual && stepNumber === 5) {
          await supabase
            .from('challenge_reactivation_manual')
            .update({ completed_at: new Date().toISOString() })
            .eq('email', c.email);
        }

        emailsSent++;
      } catch (err: any) {
        errors.push(`${c.email}: ${err.message}`);
      }
    }

    return new Response(
      JSON.stringify({ success: true, emailsSent, candidateCount: candidates.size, skipped, errors: errors.length > 0 ? errors : undefined }),
      { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  } catch (error: any) {
    console.error("Error in send-challenge-reactivation:", error);
    return new Response(JSON.stringify({ error: error.message }), { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } });
  }
};

serve(handler);
