import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.2";
import { resolveLeadLanguage, type EmailLang } from "../_shared/resolve-lead-language.ts";
import { requireCronOrAdmin } from "../_shared/require-cron-or-admin.ts";

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");

async function sendEmail(to: string, subject: string, html: string) {
  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${RESEND_API_KEY}` },
    body: JSON.stringify({ from: "CEO Mind OS <noreply@ceomindos.com>", to: [to], subject, html }),
  });
  if (!res.ok) throw new Error(`Failed to send email: ${await res.text()}`);
  return res.json();
}

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

function generateRecoveryEmail(name: string, day: number, lang: EmailLang): { subject: string; html: string } {
  const displayName = name || (lang === 'en' ? 'Warrior' : 'Warrior');
  const isEn = lang === 'en';

  const subjectsRo: Record<number, string> = {
    1: `${displayName}, continua de unde ai ramas`,
    2: `Esti in progres — continua cu Ziua 2`,
    3: `Nu lasa obstacolele sa te opreasca`,
    4: `Planul tau de actiune te asteapta`,
    5: `Metoda STACK — secretul Zilei 5`,
    6: `Mai ai o zi pana la final`,
    7: `Ultima zi — finalizeaza Challenge-ul`,
  };
  const subjectsEn: Record<number, string> = {
    1: `${displayName}, pick up where you left off`,
    2: `You're making progress — continue with Day 2`,
    3: `Don't let obstacles stop you`,
    4: `Your action plan is waiting`,
    5: `The STACK method — Day 5's secret`,
    6: `One day left until the finish`,
    7: `Final day — finish the Challenge`,
  };
  const descriptionsRo: Record<number, string> = {
    1: 'Ai inceput Challenge-ul dar nu ai completat inca Ziua 1. Dureaza doar 10 minute si vei avea claritate imediata.',
    2: 'Ai completat Ziua 1 si ai facut primul pas important. Ziua 2 te asteapta — defineste-ti identitatea.',
    3: 'Ziua 3 este despre identificarea obstacolelor. Tocmai de asta ai nevoie de acest exercitiu.',
    4: 'Ai trecut prin cele mai grele zile. Ziua 4 este despre planul concret. Mai sunt doar 4 zile.',
    5: 'In Ziua 5 inveti metoda STACK — sistemul pentru transformare rapida. Nu rata asta.',
    6: 'Ziua 6 este despre accountability — gasirea suportului de care ai nevoie. Maine e ultima zi.',
    7: 'Ai ajuns la Ziua 7 — totul se leaga. Nu renunta cand esti atat de aproape!',
  };
  const descriptionsEn: Record<number, string> = {
    1: "You started the Challenge but haven't completed Day 1 yet. It only takes 10 minutes and gives you immediate clarity.",
    2: "You finished Day 1 and took an important first step. Day 2 is waiting — define your identity.",
    3: 'Day 3 is about identifying obstacles. That is exactly why you need this exercise.',
    4: "You've been through the hardest days. Day 4 is about the concrete plan. Only 4 days left.",
    5: 'On Day 5 you learn the STACK method — the system for fast transformation. Do not miss this.',
    6: "Day 6 is about accountability — finding the support you need. Tomorrow is the last day.",
    7: "You've reached Day 7 — everything ties together. Do not quit when you're this close!",
  };

  const subject = (isEn ? subjectsEn : subjectsRo)[day] || (isEn ? `Continue the Challenge — Day ${day}` : `Continua Challenge-ul — Ziua ${day}`);
  const body = (isEn ? descriptionsEn : descriptionsRo)[day] || '';
  const greeting = isEn ? `Hi ${displayName},` : `Salut ${displayName},`;
  const cta = isEn ? `Continue Day ${day}` : `Continua Ziua ${day}`;
  const signoff = isEn ? 'Rooting for you,<br>The CEO Mind OS team' : 'Cu incredere in tine,<br>Echipa CEO Mind OS';

  const html = `<!DOCTYPE html>
<html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
<body style="margin:0;padding:0;background:#f4f4f5;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Arial,sans-serif;">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f4f4f5;"><tr><td align="center" style="padding:40px 20px;">
<table role="presentation" width="600" cellpadding="0" cellspacing="0" style="max-width:600px;background:#fff;border-radius:8px;overflow:hidden;box-shadow:0 1px 3px rgba(0,0,0,0.1);">
<tr><td style="background:#18181b;padding:24px 32px;text-align:center;"><h1 style="color:#fff;margin:0;font-size:20px;font-weight:600;">CEO Mind OS</h1></td></tr>
<tr><td style="padding:32px;">
<p style="color:#4b5563;font-size:16px;line-height:1.6;margin:0 0 16px 0;">${greeting}</p>
<p style="color:#4b5563;font-size:16px;line-height:1.6;margin:0 0 24px 0;">${body}</p>
<div style="text-align:center;margin:32px 0;"><a href="https://ceomindos.com/challenge/${day}" style="display:inline-block;background:#18181b;color:#fff;text-decoration:none;padding:14px 32px;border-radius:6px;font-size:16px;font-weight:600;">${cta}</a></div>
<p style="color:#9ca3af;font-size:14px;margin:24px 0 0 0;">${signoff}</p>
</td></tr>
<tr><td style="padding:20px 32px;border-top:1px solid #e5e7eb;text-align:center;"><p style="color:#9ca3af;margin:0;font-size:12px;">CEO Mind OS</p></td></tr>
</table></td></tr></table></body></html>`;

  return { subject, html };
}

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  const authFail = await requireCronOrAdmin(req, corsHeaders);
  if (authFail) return authFail;

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const { data: challengeProgress, error: progressError } = await supabase
      .from("challenge_progress").select("user_id, day_number, completed, created_at");
    if (progressError) throw progressError;

    const userProgress = new Map<string, { maxDay: number; lastIncomplete: number; createdAt: string }>();
    challengeProgress?.forEach(p => {
      const existing = userProgress.get(p.user_id);
      if (!existing) {
        userProgress.set(p.user_id, { maxDay: p.day_number, lastIncomplete: p.completed ? 0 : p.day_number, createdAt: p.created_at });
      } else {
        if (p.day_number > existing.maxDay) existing.maxDay = p.day_number;
        if (!p.completed && p.day_number > existing.lastIncomplete) existing.lastIncomplete = p.day_number;
      }
    });

    const { data: authUsers } = await supabase.auth.admin.listUsers();
    const userEmailMap = new Map(authUsers?.users?.map(u => [u.id, { email: u.email, name: u.user_metadata?.name || '' }]) || []);

    const { data: challengeLeads } = await supabase
      .from("email_leads").select("email, name, created_at").eq("lead_magnet", "challenge_7_zile");

    const today = new Date().toISOString().split('T')[0];
    const { data: sentToday } = await supabase
      .from("challenge_recovery_emails").select("email, stuck_on_day").gte("sent_at", today);

    const sentTodaySet = new Set(sentToday?.map(s => `${s.email}-${s.stuck_on_day}`) || []);
    const results: { email: string; day: number; success: boolean; error?: string }[] = [];

    for (const [userId, progress] of userProgress) {
      if (progress.lastIncomplete === 0) continue;
      const userData = userEmailMap.get(userId);
      if (!userData?.email) continue;
      const key = `${userData.email}-${progress.lastIncomplete}`;
      if (sentTodaySet.has(key)) continue;

      try {
        const lang = await resolveLeadLanguage(supabase, userData.email);
        const { subject, html } = generateRecoveryEmail(userData.name, progress.lastIncomplete, lang);
        await sendEmail(userData.email, subject, html);
        await supabase.from("challenge_recovery_emails").insert({ user_id: userId, email: userData.email, stuck_on_day: progress.lastIncomplete, sent_at: new Date().toISOString() });
        results.push({ email: userData.email, day: progress.lastIncomplete, success: true });
      } catch (emailError) {
        results.push({ email: userData.email, day: progress.lastIncomplete, success: false, error: emailError instanceof Error ? emailError.message : 'Unknown' });
      }
    }

    const twoDaysAgo = new Date();
    twoDaysAgo.setDate(twoDaysAgo.getDate() - 2);

    for (const lead of challengeLeads || []) {
      const hasProgress = [...userProgress.values()].some(p => userEmailMap.get(p.createdAt)?.email === lead.email);
      if (hasProgress) continue;
      const leadDate = new Date(lead.created_at);
      if (leadDate > twoDaysAgo) continue;
      const key = `${lead.email}-1`;
      if (sentTodaySet.has(key)) continue;

      try {
        const lang = await resolveLeadLanguage(supabase, lead.email);
        const { subject, html } = generateRecoveryEmail(lead.name || '', 1, lang);
        await sendEmail(lead.email, subject, html);
        await supabase.from("challenge_recovery_emails").insert({ email: lead.email, stuck_on_day: 1, sent_at: new Date().toISOString() });
        results.push({ email: lead.email, day: 1, success: true });
      } catch (emailError) {
        results.push({ email: lead.email, day: 1, success: false, error: emailError instanceof Error ? emailError.message : 'Unknown' });
      }
    }

    return new Response(JSON.stringify({ success: true, sent: results.filter(r => r.success).length, failed: results.filter(r => !r.success).length, results }), { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 });
  } catch (error) {
    console.error("Error in send-challenge-recovery:", error);
    return new Response(JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }), { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 });
  }
});
