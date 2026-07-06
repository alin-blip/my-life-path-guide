import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { renderSequenceEmail, type EmailLang } from "../_shared/email-shell.ts";
import { resolveLeadLanguage } from "../_shared/resolve-lead-language.ts";
import { requireCronOrAdmin } from "../_shared/require-cron-or-admin.ts";

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");
const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const BASE_URL = "https://ceomindos.com";

function buildEmail(dayNumber: number, name: string, trackingId: string, lang: EmailLang) {
  const isEn = lang === 'en';
  const unsubscribeUrl = `${BASE_URL}/unsubscribe?id=${trackingId}`;
  const trackingPixel = `<img src="${BASE_URL}/api/track-open?id=${trackingId}" width="1" height="1" style="display:none;" />`;
  const utm = (c: string) => `utm_source=email&utm_medium=sequence&utm_campaign=life_score&utm_content=${c}`;
  const greet = isEn ? `Hi ${name},` : `Salut ${name},`;

  type DayDef = {
    subject: string; title: string; headline: string;
    gradient: string; accent: string; body: string;
    cta: string; ctaHref: string; next: string;
  };

  const days: Record<number, DayDef> = {
    2: {
      subject: isEn ? `${name}, the 7-Day Challenge is waiting 🚀` : `${name}, Challenge-ul de 7 Zile te așteaptă! 🚀`,
      title: isEn ? '⚡ TRANSFORM IN 7 DAYS' : '⚡ TRANSFORMĂ-TE ÎN 7 ZILE',
      headline: isEn ? `The challenge that changes your life, ${name}!` : `Provocarea care îți schimbă viața, ${name}!`,
      gradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      accent: '#667eea',
      body: `<h2 style="color:#667eea;">${greet}</h2>
        <p>${isEn ? 'Yesterday you discovered your Life Score. Now it\'s time to act.' : 'Ieri ai descoperit scorul tău de viață. Acum e timpul să acționezi!'}</p>
        <div style="background: rgba(102, 126, 234, 0.1); padding: 20px; border-radius: 12px; margin: 20px 0;">
          <h3 style="margin:0 0 15px 0; color:#667eea;">${isEn ? 'What you\'ll learn:' : 'Ce vei învăța în Challenge:'}</h3>
          <ul style="margin:0; padding-left:20px;">
            <li>${isEn ? 'Day 1: Your vision for 2026' : 'Ziua 1: Viziunea ta pentru 2026'}</li>
            <li>${isEn ? 'Day 2: Principles of success' : 'Ziua 2: Principiile succesului'}</li>
            <li>${isEn ? 'Day 3: Morning stack' : 'Ziua 3: Stack-ul de dimineață'}</li>
            <li>${isEn ? 'Day 4: Mental discipline' : 'Ziua 4: Disciplina mentală'}</li>
            <li>${isEn ? 'Day 5: Physical optimization' : 'Ziua 5: Optimizare fizică'}</li>
            <li>${isEn ? 'Day 6: Quality relationships' : 'Ziua 6: Relații de calitate'}</li>
            <li>${isEn ? 'Day 7: Full action plan' : 'Ziua 7: Plan de acțiune complet'}</li>
          </ul>
        </div>
        <p><strong>${isEn ? '100% FREE • 7 days • 15 min/day' : '100% GRATUIT • 7 zile • 15 min/zi'}</strong></p>`,
      cta: isEn ? 'Start the FREE Challenge →' : 'Începe Challenge-ul GRATUIT →',
      ctaHref: `${BASE_URL}/challenge/1?${utm('day2')}`,
      next: isEn ? 'How the AI Coach helps you reach goals faster.' : 'Cum AI Coach-ul te poate ajuta să-ți atingi obiectivele mai rapid.',
    },
    3: {
      subject: isEn ? `${name}, how to use your AI Coach 🤖` : `${name}, Cum să îți folosești AI Coach-ul 🤖`,
      title: isEn ? '🤖 PERSONAL AI COACH' : '🤖 AI COACH PERSONAL',
      headline: isEn ? `Coaching available 24/7, ${name}` : `Coaching disponibil 24/7, ${name}`,
      gradient: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)',
      accent: '#3b82f6',
      body: `<h2 style="color:#3b82f6;">${greet}</h2>
        <p>${isEn ? 'Imagine 5 different coaches, whenever you need them:' : 'Imaginează-ți să ai acces la 5 tipuri diferite de coach-i, disponibili oricând ai nevoie:'}</p>
        <div style="background: rgba(59, 130, 246, 0.1); padding: 20px; border-radius: 12px; margin: 20px 0;">
          <h3 style="margin:0 0 15px 0; color:#3b82f6;">${isEn ? 'AI Stacks available:' : 'AI Stacks disponibile:'}</h3>
          <ul style="margin:0; padding-left:20px;">
            <li>🎯 <strong>Performance Coach</strong></li>
            <li>❤️ <strong>Relationship Coach</strong></li>
            <li>🧠 <strong>Therapist Coach</strong></li>
            <li>📊 <strong>Accountability Coach</strong></li>
            <li>🧘 <strong>Meditation Guide</strong></li>
          </ul>
        </div>
        <p>${isEn ? 'Based on your life plan, AI personalizes every recommendation to your needs.' : 'Bazat pe planul tău de viață creat, AI-ul va personaliza fiecare recomandare pentru nevoile tale specifice.'}</p>`,
      cta: isEn ? 'Explore AI Stacks →' : 'Explorează AI Stacks →',
      ctaHref: `${BASE_URL}/stacks?${utm('day3')}`,
      next: isEn ? 'The morning routine that makes you a champion.' : 'Rutina de Dimineață care te transformă în campion.',
    },
    4: {
      subject: isEn ? `${name}, the Morning Routine for Success ☀️` : `${name}, Rutina de Dimineață pentru Succes ☀️`,
      title: isEn ? '☀️ CHAMPION ROUTINE' : '☀️ RUTINA CAMPIONILOR',
      headline: isEn ? `The first hour defines your day, ${name}` : `Prima oră definește ziua, ${name}`,
      gradient: 'linear-gradient(135deg, #22c55e 0%, #16a34a 100%)',
      accent: '#22c55e',
      body: `<h2 style="color:#22c55e;">${greet}</h2>
        <p>${isEn ? 'The first 60 minutes of your day set the tone for everything.' : 'Studiile arată că primele 60 de minute ale zilei determină productivitatea și starea emoțională pentru restul zilei.'}</p>
        <div style="background: rgba(34, 197, 94, 0.1); padding: 20px; border-radius: 12px; margin: 20px 0;">
          <h3 style="margin:0 0 15px 0; color:#22c55e;">${isEn ? 'Routine Template (45 min):' : 'Template Rutină (45 min):'}</h3>
          <ul style="margin:0; padding-left:20px;">
            <li>🌅 ${isEn ? '5 min — breath & gratitude' : '5 min - Respirație și gratitudine'}</li>
            <li>🧘 ${isEn ? '10 min — guided meditation' : '10 min - Meditație ghidată'}</li>
            <li>📖 ${isEn ? '15 min — read/learn' : '15 min - Citit sau învățat'}</li>
            <li>💪 ${isEn ? '10 min — movement' : '10 min - Mișcare fizică'}</li>
            <li>📝 ${isEn ? '5 min — plan the day' : '5 min - Planificare zi'}</li>
          </ul>
        </div>`,
      cta: isEn ? 'Set up Your Routine →' : 'Configurează Rutina Ta →',
      ctaHref: `${BASE_URL}/champion-routine?${utm('day4')}`,
      next: isEn ? 'The Door system for efficient weekly planning.' : 'Sistemul Door pentru planificare săptămânală eficientă.',
    },
    5: {
      subject: isEn ? `${name}, the Door System: Weekly Planning 🚪` : `${name}, Sistemul Door: Planificare Săptămânală 🚪`,
      title: isEn ? '🚪 THE DOOR SYSTEM' : '🚪 SISTEMUL DOOR',
      headline: isEn ? `Weekly planning, ${name}` : `Planificare Săptămânală, ${name}`,
      gradient: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
      accent: '#f59e0b',
      body: `<h2 style="color:#f59e0b;">${greet}</h2>
        <p>${isEn ? 'Your annual life plan is ready. Now turn it into concrete weekly action.' : 'Planul tău anual de viață este pregătit. Acum e timpul să-l transformi în acțiuni concrete săptămânale.'}</p>
        <div style="background: rgba(245, 158, 11, 0.1); padding: 20px; border-radius: 12px; margin: 20px 0;">
          <h3 style="margin:0 0 15px 0; color:#f59e0b;">${isEn ? 'The Door system includes:' : 'Sistemul Door include:'}</h3>
          <ul style="margin:0; padding-left:20px;">
            <li>📊 <strong>${isEn ? 'Annual Missions' : 'Misiuni Anuale'}</strong></li>
            <li>🎯 <strong>${isEn ? '90-day Milestones' : 'Milestones 90 de zile'}</strong></li>
            <li>📅 <strong>${isEn ? 'Monthly Focus' : 'Focus Lunar'}</strong></li>
            <li>⚡ <strong>${isEn ? 'Weekly Actions' : 'Acțiuni Săptămânale'}</strong></li>
            <li>✅ <strong>${isEn ? 'Weekly Review' : 'Review Săptămânal'}</strong></li>
          </ul>
        </div>`,
      cta: isEn ? 'Open Door →' : 'Deschide Door →',
      ctaHref: `${BASE_URL}/door?${utm('day5')}`,
      next: isEn ? 'Core 4 — the 4 daily activities for guaranteed success.' : 'Core 4 - Cele 4 activități zilnice pentru succes garantat.',
    },
    6: {
      subject: isEn ? `${name}, Core 4: the 4 daily activities 🎯` : `${name}, Core 4: Cele 4 Activități Zilnice 🎯`,
      title: '🎯 CORE 4',
      headline: isEn ? `4 daily activities, ${name}` : `4 Activități Zilnice, ${name}`,
      gradient: 'linear-gradient(135deg, #8b5cf6 0%, #6d28d9 100%)',
      accent: '#8b5cf6',
      body: `<h2 style="color:#8b5cf6;">${greet}</h2>
        <p>${isEn ? 'Success is not big occasional actions — it\'s small daily ones done consistently.' : 'Succesul nu vine din acțiuni mari ocazionale, ci din acțiuni mici făcute constant, zilnic.'}</p>
        <div style="background: rgba(139, 92, 246, 0.1); padding: 20px; border-radius: 12px; margin: 20px 0;">
          <h3 style="margin:0 0 15px 0; color:#8b5cf6;">${isEn ? 'The 4 Core Activities:' : 'Cele 4 Core Activities:'}</h3>
          <p><strong>1. 📖 ${isEn ? 'Read' : 'Citește'}</strong> — ${isEn ? '15 min personal development' : '15 min dezvoltare personală'}</p>
          <p><strong>2. 💪 ${isEn ? 'Move' : 'Mișcare'}</strong> — ${isEn ? '30 min exercise' : '30 min exercițiu fizic'}</p>
          <p><strong>3. 🧘 ${isEn ? 'Reflect' : 'Reflecție'}</strong> — ${isEn ? '10 min meditation/journal' : '10 min meditație/jurnal'}</p>
          <p><strong>4. 🎯 ${isEn ? 'Impact' : 'Impact'}</strong> — ${isEn ? '1 action toward your goal' : '1 acțiune spre obiectiv'}</p>
        </div>`,
      cta: isEn ? 'Start Daily Flow →' : 'Începe Daily Flow →',
      ctaHref: `${BASE_URL}/daily-flow?${utm('day6')}`,
      next: isEn ? 'The final offer — pick the right plan.' : 'Oferta specială finală - alege planul potrivit pentru tine!',
    },
    7: {
      subject: isEn ? `${name}, special offer + your full access 🎁` : `${name}, Oferta Specială + Accesul Tău Complet 🎁`,
      title: isEn ? '🎁 SPECIAL OFFER' : '🎁 OFERTĂ SPECIALĂ',
      headline: isEn ? `Just for you, ${name}` : `Doar pentru tine, ${name}`,
      gradient: 'linear-gradient(135deg, #ec4899 0%, #be185d 100%)',
      accent: '#ec4899',
      body: `<h2 style="color:#ec4899;">${greet}</h2>
        <p>${isEn ? 'Over the last 7 days you saw everything you need to transform your life:' : 'În ultimele 7 zile ți-am arătat exact ce ai nevoie pentru a-ți transforma viața:'}</p>
        <div style="background: rgba(236, 72, 153, 0.1); padding: 20px; border-radius: 12px; margin: 20px 0;">
          <ul style="margin:0; padding-left:20px;">
            <li>${isEn ? 'Your Life Score and areas to improve' : 'Scorul tău de viață și zonele de îmbunătățit'}</li>
            <li>${isEn ? '7-day transformation challenge' : 'Challenge-ul de 7 zile pentru transformare'}</li>
            <li>${isEn ? 'AI Stacks for personalized coaching' : 'AI Stacks pentru coaching personalizat'}</li>
            <li>${isEn ? 'Champion morning routine' : 'Rutina Campionilor de dimineață'}</li>
            <li>${isEn ? 'Door system for planning' : 'Sistemul Door pentru planificare'}</li>
            <li>${isEn ? 'Core 4 for daily consistency' : 'Core 4 pentru consistență zilnică'}</li>
          </ul>
        </div>
        <div style="margin: 25px 0; padding: 20px; background: linear-gradient(135deg, rgba(236, 72, 153, 0.15), rgba(190, 24, 93, 0.15)); border-radius: 12px;">
          <h3 style="margin:0 0 15px 0; text-align:center; color:#fff;">${isEn ? 'Choose Your Plan:' : 'Alege Planul Potrivit:'}</h3>
          <p style="text-align:center; color:#fff;">
            <strong>BASIC</strong> — €9.90/${isEn ? 'month' : 'lună'}<br>
            <strong style="color:#ec4899;">PRO ⭐</strong> — €19.90/${isEn ? 'month' : 'lună'}
          </p>
        </div>
        <p style="text-align:center; color:#888; font-size:14px;">${isEn ? 'Your Life Score plan is waiting inside the platform!' : 'Planul tău de Life Score este gata și te așteaptă în platformă!'}</p>`,
      cta: isEn ? 'Choose Your Plan →' : 'Alege Planul Tău →',
      ctaHref: `${BASE_URL}/pricing?${utm('day7')}`,
      next: '',
    },
  };

  const def = days[dayNumber] || days[2];
  return {
    subject: def.subject,
    html: renderSequenceEmail({
      title: def.title,
      headline: def.headline,
      headerGradient: def.gradient,
      accent: def.accent,
      bodyHtml: def.body,
      ctaLabel: def.cta,
      ctaHref: def.ctaHref,
      nextTeaser: def.next || undefined,
      unsubscribeUrl,
      trackingPixel,
      lang,
    }),
  };
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
  const authFail = await requireCronOrAdmin(req, corsHeaders);
  if (authFail) return authFail;

    if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) throw new Error("Missing Supabase configuration");
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    const { data: leads, error: leadsError } = await supabase
      .from('email_leads')
      .select('id, email, name, created_at, language')
      .in('lead_magnet', ['vision_2026_quiz', 'life_score'])
      .eq('subscribed', true);
    if (leadsError) throw new Error(`Error fetching leads: ${leadsError.message}`);

    const results: { email: string; day: number; status: string; lang: EmailLang }[] = [];
    const now = new Date();

    for (const lead of (leads || [])) {
      const createdAt = new Date(lead.created_at);
      const daysSinceQuiz = Math.floor((now.getTime() - createdAt.getTime()) / (1000 * 60 * 60 * 24));
      const dayNumber = daysSinceQuiz + 1;
      if (dayNumber < 2 || dayNumber > 7) continue;

      const { data: existingLog } = await supabase
        .from('email_sequence_log')
        .select('id')
        .eq('email', lead.email)
        .eq('sequence_type', 'life_score')
        .eq('day_number', dayNumber)
        .maybeSingle();
      if (existingLog) continue;

      const lang: EmailLang = ((lead as any).language === 'en'
        ? 'en'
        : (lead as any).language === 'ro'
          ? 'ro'
          : await resolveLeadLanguage(supabase, lead.email));

      const trackingId = crypto.randomUUID();
      const displayName = lead.name?.split(' ')[0] || (lang === 'en' ? 'Warrior' : 'Warrior');
      const template = buildEmail(dayNumber, displayName, trackingId, lang);

      const emailResponse = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: { "Content-Type": "application/json", "Authorization": `Bearer ${RESEND_API_KEY}` },
        body: JSON.stringify({
          from: "CEO Mind OS <noreply@ceomindos.com>",
          to: [lead.email],
          subject: template.subject,
          html: template.html,
        }),
      });

      if (!emailResponse.ok) {
        const errorText = await emailResponse.text();
        console.error(`Failed to send email to ${lead.email}:`, errorText);
        results.push({ email: lead.email, day: dayNumber, status: 'failed', lang });
        continue;
      }

      await supabase.from('email_sequence_log').insert({
        lead_id: lead.id,
        email: lead.email,
        sequence_type: 'life_score',
        day_number: dayNumber,
        tracking_id: trackingId,
      });

      results.push({ email: lead.email, day: dayNumber, status: 'sent', lang });
    }

    return new Response(JSON.stringify({ success: true, processed: results.length, results }), {
      status: 200, headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  } catch (error: any) {
    console.error("Error in send-life-score-sequence:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500, headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  }
};

serve(handler);
