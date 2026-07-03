import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";
import { Resend } from "https://esm.sh/resend@2.0.0";
import { resolveLeadLanguage, type EmailLang } from "../_shared/resolve-lead-language.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const log = (step: string, details?: any) => {
  console.log(`[SEND-CHALLENGE-DAY7-UPGRADE] ${step}${details ? ` - ${JSON.stringify(details)}` : ""}`);
};

const t = (lang: EmailLang, ro: string, en: string) => (lang === 'en' ? en : ro);

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    log("Start");
    const resendKey = Deno.env.get("RESEND_API_KEY");
    if (!resendKey) throw new Error("RESEND_API_KEY missing");

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { persistSession: false } },
    );
    const resend = new Resend(resendKey);

    let body: any = {};
    try { body = await req.json(); } catch {}

    const buildSubject = (lang: EmailLang, earlyBird: boolean) =>
      earlyBird
        ? t(lang, 'Felicitari! Ai terminat Challenge-ul — Oferta Early Bird', 'Congrats! You finished the Challenge — Early Bird Offer')
        : t(lang, 'Felicitari! Ai terminat Challenge-ul de 7 Zile', 'Congrats! You finished the 7-Day Challenge');

    if (body.email) {
      log("Manual mode", { email: body.email });
      const lang: EmailLang = body.language === 'en' ? 'en'
        : body.language === 'ro' ? 'ro'
          : await resolveLeadLanguage(supabase, body.email);

      const { data: subscriber } = await supabase
        .from("subscribers")
        .select("email, early_bird_expires_at")
        .eq("email", body.email)
        .single();

      const earlyBirdActive = subscriber?.early_bird_expires_at
        ? new Date(subscriber.early_bird_expires_at).getTime() > Date.now()
        : false;

      const html = generateDay7UpgradeEmail(body.email, earlyBirdActive, lang);
      const emailResult = await resend.emails.send({
        from: "CEO Mind OS <noreply@ceomindos.com>",
        to: [body.email],
        subject: buildSubject(lang, earlyBirdActive),
        html,
      });
      log("Manual email sent", { email: body.email, result: emailResult });
      return new Response(JSON.stringify({ success: true, sent: 1, lang }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Batch mode
    log("Batch mode - finding Day 7 completers");
    const now = new Date();
    const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    const twoDaysAgo = new Date(now.getTime() - 48 * 60 * 60 * 1000);

    const { data: day7Completers, error: progressError } = await supabase
      .from("challenge_progress")
      .select("user_id, completed_at")
      .eq("day_number", 7)
      .eq("completed", true)
      .gte("completed_at", twoDaysAgo.toISOString())
      .lte("completed_at", yesterday.toISOString());
    if (progressError) throw progressError;

    if (!day7Completers || day7Completers.length === 0) {
      return new Response(JSON.stringify({ success: true, sent: 0, message: "No Day 7 completers found" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const userIds = day7Completers.map(c => c.user_id);
    const { data: subscribers, error: subError } = await supabase
      .from("subscribers")
      .select("email, user_id, subscribed, early_bird_expires_at")
      .in("user_id", userIds)
      .eq("subscribed", false);
    if (subError) throw subError;

    if (!subscribers || subscribers.length === 0) {
      return new Response(JSON.stringify({ success: true, sent: 0, message: "All Day 7 completers are already subscribed" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    let sent = 0;
    const errors: string[] = [];

    for (const sub of subscribers) {
      try {
        const lang: EmailLang = await resolveLeadLanguage(supabase, sub.email);
        const earlyBirdActive = sub.early_bird_expires_at
          ? new Date(sub.early_bird_expires_at).getTime() > Date.now()
          : false;
        const html = generateDay7UpgradeEmail(sub.email, earlyBirdActive, lang);
        await resend.emails.send({
          from: "CEO Mind OS <noreply@ceomindos.com>",
          to: [sub.email],
          subject: buildSubject(lang, earlyBirdActive),
          html,
        });
        sent++;
        log("Email sent", { email: sub.email, earlyBirdActive, lang });
      } catch (e) {
        const msg = e instanceof Error ? e.message : String(e);
        errors.push(`${sub.email}: ${msg}`);
        log("Email error", { email: sub.email, error: msg });
      }
    }

    return new Response(JSON.stringify({ success: true, sent, errors }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error);
    log("Error", { message: msg });
    return new Response(JSON.stringify({ error: msg }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});

function generateDay7UpgradeEmail(_email: string, earlyBirdActive: boolean, lang: EmailLang): string {
  const isEn = lang === 'en';
  const appUrl = "https://ceomindos.com";

  const earlyBirdSection = earlyBirdActive ? `
    <div style="background-color:#f0fdf4; border:1px solid #bbf7d0; border-radius:8px; padding:20px; margin:24px 0; text-align:center;">
      <p style="color:#166534; font-size:13px; margin:0 0 8px 0; text-transform:uppercase; letter-spacing:0.5px; font-weight:600;">
        ${isEn ? 'Early Bird Offer Active' : 'Oferta Early Bird Activa'}
      </p>
      <p style="color:#111827; font-size:24px; font-weight:bold; margin:0;">
        <span style="text-decoration:line-through; color:#9ca3af;">€97</span>
        <span style="font-size:32px;">€49</span>/${isEn ? 'month' : 'luna'}
      </p>
      <p style="color:#4b5563; font-size:13px; margin:8px 0 0 0;">
        ${isEn ? 'Price is locked in now.' : 'Pretul se blocheaza acum.'}
      </p>
    </div>
  ` : '';

  return `
<!DOCTYPE html>
<html lang="${lang}">
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
<body style="margin:0; padding:0; background-color:#f7f7f8; font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#f7f7f8;">
    <tr><td align="center" style="padding:40px 20px;">
      <table role="presentation" width="600" cellpadding="0" cellspacing="0" style="max-width:600px; background-color:#ffffff; border-radius:12px; overflow:hidden; box-shadow:0 1px 3px rgba(0,0,0,0.08);">
        <tr><td style="padding:32px 32px 24px 32px; border-bottom:1px solid #e5e7eb;">
          <p style="margin:0 0 4px 0; font-size:13px; font-weight:600; color:#6b7280; text-transform:uppercase; letter-spacing:0.5px;">CEO Mind OS</p>
          <h1 style="margin:0; font-size:24px; font-weight:700; color:#111827;">
            ${isEn ? 'Congrats! You finished the Challenge.' : 'Felicitari! Ai terminat Challenge-ul.'}
          </h1>
        </td></tr>

        <tr><td style="padding:28px 32px 32px 32px;">
          <p style="color:#374151; font-size:16px; line-height:1.6; margin:0 0 20px 0;">
            ${isEn ? 'You did something few people do: <strong>you completed a full transformation program</strong>.' : 'Ai facut ceva ce putini reusesc: <strong>ai terminat un program complet de transformare</strong>.'}
          </p>
          <p style="color:#4b5563; font-size:15px; line-height:1.6; margin:0 0 16px 0;">
            ${isEn ? 'In these 7 days you discovered:' : 'In aceste 7 zile ai descoperit:'}
          </p>
          <ul style="color:#374151; font-size:15px; line-height:1.8; padding-left:20px; margin:0 0 24px 0;">
            <li>${isEn ? 'Your 2026 vision and how to make it real' : 'Viziunea ta pentru 2026 si cum sa o transformi in realitate'}</li>
            <li>${isEn ? 'How to balance body, spirit and relationships' : 'Cum sa iti echilibrezi corpul, spiritul si relatiile'}</li>
            <li>${isEn ? 'The Domino Door strategy for business goals' : 'Strategia Domino Door pentru obiective de business'}</li>
            <li>${isEn ? 'Warrior Routine — the champion\'s routine' : 'Warrior Routine — rutina campionilor'}</li>
            <li>${isEn ? 'AI Coaching for accountability & mindset' : 'AI Coaching pentru accountability si mindset'}</li>
            <li>${isEn ? 'How to turn ideas into concrete action' : 'Cum sa transformi ideile in actiuni concrete'}</li>
          </ul>

          ${earlyBirdSection}

          <h2 style="color:#111827; font-size:18px; margin:28px 0 16px 0;">
            ${isEn ? 'Continue with Membership' : 'Continua cu Membership'}
          </h2>

          <div style="background-color:#f9fafb; border-radius:8px; padding:16px 20px; margin-bottom:12px; border:1px solid #e5e7eb;">
            <div style="margin-bottom:8px;">
              <strong style="color:#111827; font-size:16px;">Basic</strong>
              <span style="color:#6b7280; font-size:14px; float:right;">${earlyBirdActive ? '€49' : '€97'}/${isEn ? 'mo' : 'luna'}</span>
            </div>
            <p style="color:#6b7280; font-size:13px; line-height:1.6; margin:0;">
              ${isEn ? 'Reality Map, Warrior Routine, Door, Stacks, Journal' : 'Harta Realitatii, Warrior Routine, Door, Stacks, Jurnal'}
            </p>
          </div>

          <div style="background-color:#f0f9ff; border-radius:8px; padding:16px 20px; margin-bottom:12px; border:1px solid #bae6fd;">
            <div style="margin-bottom:8px;">
              <strong style="color:#111827; font-size:16px;">Pro</strong>
              <span style="background-color:#dbeafe; color:#1e40af; font-size:11px; padding:2px 8px; border-radius:4px; margin-left:8px;">
                ${isEn ? 'Recommended' : 'Recomandat'}
              </span>
              <span style="color:#6b7280; font-size:14px; float:right;">€97/${isEn ? 'mo' : 'luna'}</span>
            </div>
            <p style="color:#6b7280; font-size:13px; line-height:1.6; margin:0;">
              ${isEn ? 'Everything in Basic + AI Accountability & Mind Coach, Breakthrough Tools, Courses, Monthly Q&A' : 'Tot din Basic + AI Accountability & Mind Coach, Breakthrough Tools, Cursuri, Q&A lunar'}
            </p>
          </div>

          <div style="background-color:#fffbeb; border-radius:8px; padding:16px 20px; margin-bottom:24px; border:1px solid #fde68a;">
            <div style="margin-bottom:8px;">
              <strong style="color:#111827; font-size:16px;">Elite</strong>
              <span style="color:#6b7280; font-size:14px; float:right;">€297/${isEn ? 'mo' : 'luna'}</span>
            </div>
            <p style="color:#6b7280; font-size:13px; line-height:1.6; margin:0;">
              ${isEn ? 'Everything in Pro + Warrior Launch Accelerator, Weekly LIVE coaching, Elite Brotherhood' : 'Tot din Pro + Warrior Launch Accelerator, Coaching LIVE saptamanal, Elite Brotherhood'}
            </p>
          </div>

          <div style="text-align:center; margin:28px 0 0 0;">
            <a href="${appUrl}/pricing?utm_source=email&utm_medium=day7upgrade&utm_campaign=challenge_complete" style="display:inline-block; background-color:#111827; color:#ffffff; text-decoration:none; padding:14px 40px; border-radius:8px; font-size:15px; font-weight:600;">
              ${isEn ? 'Choose Your Plan' : 'Alege Planul Tau'}
            </a>
          </div>
        </td></tr>

        <tr><td style="background-color:#f9fafb; padding:20px 32px; text-align:center; border-top:1px solid #e5e7eb;">
          <p style="color:#9ca3af; margin:0 0 6px 0; font-size:12px;">CEO Mind OS</p>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body></html>`;
}
