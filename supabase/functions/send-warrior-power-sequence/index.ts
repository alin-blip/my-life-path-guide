import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { renderSequenceEmail, type EmailLang } from "../_shared/email-shell.ts";
import { resolveLeadLanguage } from "../_shared/resolve-lead-language.ts";

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");
const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const BASE_URL = "https://ceomindos.com";

interface WarriorPowerResult {
  scores: {
    body_fitness: number; body_nutrition: number;
    being_connection: number; being_certainty: number;
    balance_relationship: number; balance_family: number;
    business_mechanics: number; business_money: number;
  };
  total_score: number;
}

const DIM_NAMES: Record<string, { ro: string; en: string }> = {
  body: { ro: 'Corp', en: 'Body' },
  being: { ro: 'Ființă', en: 'Being' },
  balance: { ro: 'Echilibru', en: 'Balance' },
  business: { ro: 'Business', en: 'Business' },
};

function getWeakestDimension(scores: WarriorPowerResult["scores"]) {
  const d = {
    body: scores.body_fitness + scores.body_nutrition,
    being: scores.being_connection + scores.being_certainty,
    balance: scores.balance_relationship + scores.balance_family,
    business: scores.business_mechanics + scores.business_money,
  };
  let weakest: { name: keyof typeof d; score: number } = { name: 'body', score: d.body };
  for (const [k, v] of Object.entries(d)) {
    if (v < weakest.score) weakest = { name: k as keyof typeof d, score: v };
  }
  return weakest;
}

function buildEmail(
  dayNumber: number,
  name: string,
  scores: WarriorPowerResult | null,
  trackingId: string,
  lang: EmailLang,
): { subject: string; html: string } {
  const unsubscribeUrl = `${BASE_URL}/unsubscribe?id=${trackingId}`;
  const trackingPixel = `<img src="${BASE_URL}/api/track-open?id=${trackingId}" width="1" height="1" style="display:none;" />`;
  const utm = (c: string) => `utm_source=email&utm_medium=sequence&utm_campaign=warrior_power&utm_content=${c}`;
  const isEn = lang === 'en';
  const greet = isEn ? `Hi ${name},` : `Salut ${name},`;

  const weak = scores ? getWeakestDimension(scores.scores) : null;
  const weakName = weak ? DIM_NAMES[weak.name][lang] : '';

  type DayDef = {
    subject: string; title: string; headline: string;
    gradient: string; accent: string; body: string;
    cta: string; ctaHref: string; next: string;
  };

  const days: Record<number, DayDef> = {
    2: {
      subject: isEn ? `${name}, your 7-Day Transformation starts now 🚀` : `${name}, Secretul Transformării în 7 Zile te așteaptă! 🚀`,
      title: isEn ? '⚡ TRANSFORM IN 7 DAYS' : '⚡ TRANSFORMĂ-TE ÎN 7 ZILE',
      headline: isEn ? `The challenge that changes your life, ${name}!` : `Provocarea care îți schimbă viața, ${name}!`,
      gradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      accent: '#667eea',
      body: `<h2 style="color:#667eea;">${greet}</h2>
        <p>${isEn ? 'Yesterday you discovered your Warrior Power scores. Now it\'s time to act.' : 'Ieri ți-ai descoperit scorurile Warrior Power. Acum e timpul să acționezi!'}</p>
        <div style="background: rgba(102, 126, 234, 0.1); padding: 20px; border-radius: 12px; margin: 20px 0;">
          <h3 style="margin:0 0 15px 0; color:#667eea;">${isEn ? 'What you\'ll learn in 7 days:' : 'Ce vei învăța în 7 zile:'}</h3>
          <ul style="margin:0; padding-left:20px;">
            <li>${isEn ? 'Day 1: Your vision for 2026' : 'Ziua 1: Viziunea ta pentru 2026'}</li>
            <li>${isEn ? 'Day 2: Principles of success' : 'Ziua 2: Principiile succesului'}</li>
            <li>${isEn ? 'Day 3: Morning stack' : 'Ziua 3: Stack-ul de dimineață'}</li>
            <li>${isEn ? 'Day 4: Mental discipline' : 'Ziua 4: Disciplina mentală'}</li>
            <li>${isEn ? 'Day 5: Physical optimization' : 'Ziua 5: Optimizare fizică'}</li>
            <li>${isEn ? 'Day 6: Quality relationships' : 'Ziua 6: Relații de calitate'}</li>
            <li>${isEn ? 'Day 7: Action plan' : 'Ziua 7: Plan de acțiune'}</li>
          </ul>
        </div>
        <p><strong>${isEn ? '100% FREE • 7 days • 15 min/day' : '100% GRATUIT • 7 zile • 15 min/zi'}</strong></p>`,
      cta: isEn ? 'Start the FREE Challenge →' : 'Începe Challenge-ul GRATUIT →',
      ctaHref: `${BASE_URL}/challenge/1?${utm('day2')}`,
      next: isEn ? 'We\'ll analyze your weakest dimension and how to fix it.' : 'Vom analiza cea mai slabă dimensiune a ta și cum să o îmbunătățești.',
    },
    3: {
      subject: isEn ? `${name}, your weakest area + solutions 📊` : `${name}, Dimensiunea ta cea mai slabă + Soluții 📊`,
      title: isEn ? '📊 PERSONAL ANALYSIS' : '📊 ANALIZĂ PERSONALIZATĂ',
      headline: isEn ? `The area holding you back, ${name}` : `Dimensiunea care te ține pe loc, ${name}`,
      gradient: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
      accent: '#f59e0b',
      body: `<h2 style="color:#f59e0b;">${greet}</h2>
        ${scores && weak ? `<p>${isEn
          ? `Looking at your results, <strong>${weakName}</strong> needs the most attention (${weak.score}/24 points).`
          : `Analizând rezultatele tale, am identificat că <strong>${weakName}</strong> este zona care necesită cea mai mare atenție (${weak.score}/24 puncte).`}</p>
        <div style="background: rgba(245, 158, 11, 0.1); padding: 20px; border-radius: 12px; margin: 20px 0;">
          <h3 style="margin:0 0 15px 0; color:#f59e0b;">${isEn ? `3 actions for ${weakName}:` : `3 Acțiuni pentru ${weakName}:`}</h3>
          <ol style="margin:0; padding-left:20px;">
            <li>${isEn ? 'Identify 1 negative habit to remove' : 'Identifică 1 obicei negativ de eliminat'}</li>
            <li>${isEn ? 'Add 1 daily 10-min routine' : 'Adaugă 1 rutină zilnică de 10 minute'}</li>
            <li>${isEn ? 'Track progress weekly' : 'Monitorizează progresul săptămânal'}</li>
          </ol>
        </div>` : `<p>${isEn ? 'We prepared a personalized analysis based on your quiz.' : 'Am pregătit o analiză personalizată pentru tine bazată pe rezultatele quizului.'}</p>`}
        <p>${isEn ? 'Our AI Coach can create a plan tailored to your needs.' : 'AI Coach-ul nostru poate crea un plan personalizat exact pentru nevoile tale.'}</p>`,
      cta: isEn ? 'Explore AI Coach →' : 'Explorează AI Coach →',
      ctaHref: `${BASE_URL}/stacks?${utm('day3')}`,
      next: isEn ? 'The Champion Morning Routine — the exact template.' : 'Rutina Campionilor de Dimineață - template-ul exact pentru succes.',
    },
    4: {
      subject: isEn ? `${name}, the Champion Morning Routine ☀️` : `${name}, Rutina de Dimineață a Campionilor ☀️`,
      title: isEn ? '☀️ CHAMPION ROUTINE' : '☀️ RUTINA CAMPIONILOR',
      headline: isEn ? `The first hour that defines the day, ${name}` : `Prima oră care definește ziua, ${name}`,
      gradient: 'linear-gradient(135deg, #22c55e 0%, #16a34a 100%)',
      accent: '#22c55e',
      body: `<h2 style="color:#22c55e;">${greet}</h2>
        <p>${isEn ? 'Studies show the first 60 minutes of the day set productivity and mood for the rest.' : 'Studiile arată că primele 60 de minute ale zilei determină productivitatea și starea emoțională pentru restul zilei.'}</p>
        <div style="background: rgba(34, 197, 94, 0.1); padding: 20px; border-radius: 12px; margin: 20px 0;">
          <h3 style="margin:0 0 15px 0; color:#22c55e;">${isEn ? 'Morning Routine Template (45 min):' : 'Template Rutină de Dimineață (45 min):'}</h3>
          <ul style="margin:0; padding-left:20px;">
            <li>🌅 ${isEn ? '5 min — breath & gratitude' : '5 min - Respirație și gratitudine'}</li>
            <li>🧘 ${isEn ? '10 min — guided meditation' : '10 min - Meditație ghidată'}</li>
            <li>📖 ${isEn ? '15 min — read/learn' : '15 min - Citit sau învățat'}</li>
            <li>💪 ${isEn ? '10 min — movement' : '10 min - Mișcare fizică'}</li>
            <li>📝 ${isEn ? '5 min — plan the day' : '5 min - Planificare zi'}</li>
          </ul>
        </div>
        <p>${isEn ? 'Our platform automates every step with audio guidance and tracking.' : 'Platforma noastră automatizează toți acești pași cu ghidare audio și tracking.'}</p>`,
      cta: isEn ? 'Set up Your Routine →' : 'Configurează Rutina Ta →',
      ctaHref: `${BASE_URL}/champion-routine?${utm('day4')}`,
      next: isEn ? 'How to use AI for accelerated transformation.' : 'Cum să folosești AI-ul pentru transformare accelerată.',
    },
    5: {
      subject: isEn ? `${name}, AI Coach: 10x faster transformation 🤖` : `${name}, AI Coach: Transformare 10x mai rapidă 🤖`,
      title: isEn ? '🤖 PERSONAL AI COACH' : '🤖 AI COACH PERSONAL',
      headline: isEn ? `Coaching available 24/7, ${name}` : `Coaching disponibil 24/7, ${name}`,
      gradient: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)',
      accent: '#3b82f6',
      body: `<h2 style="color:#3b82f6;">${greet}</h2>
        <p>${isEn ? 'Imagine having access to 5 different coaches, whenever you need:' : 'Imaginează-ți să ai acces la 5 tipuri diferite de coach-i, disponibili oricând ai nevoie:'}</p>
        <div style="background: rgba(59, 130, 246, 0.1); padding: 20px; border-radius: 12px; margin: 20px 0;">
          <h3 style="margin:0 0 15px 0; color:#3b82f6;">${isEn ? 'AI Stacks available:' : 'AI Stacks disponibile:'}</h3>
          <ul style="margin:0; padding-left:20px;">
            <li>🎯 <strong>Performance Coach</strong> — ${isEn ? 'peak productivity' : 'Productivitate maximă'}</li>
            <li>❤️ <strong>Relationship Coach</strong> — ${isEn ? 'better relationships' : 'Relații mai bune'}</li>
            <li>🧠 <strong>Therapist Coach</strong> — ${isEn ? 'emotional health' : 'Sănătate emoțională'}</li>
            <li>📊 <strong>Accountability Coach</strong> — ${isEn ? 'tracking & responsibility' : 'Responsabilitate și tracking'}</li>
            <li>🧘 <strong>Meditation Guide</strong> — ${isEn ? 'personalized meditations' : 'Meditații personalizate'}</li>
          </ul>
        </div>
        ${scores ? `<p>${isEn ? `Based on your score of ${scores.total_score}/96, AI will personalize every recommendation.` : `Bazat pe scorul tău de ${scores.total_score}/96, AI-ul va personaliza fiecare recomandare.`}</p>` : ''}`,
      cta: isEn ? 'Try AI Coach Free →' : 'Încearcă AI Coach Gratuit →',
      ctaHref: `${BASE_URL}/stacks?${utm('day5')}`,
      next: isEn ? 'The Brotherhood community — the power of the group.' : 'Comunitatea Brotherhood - puterea grupului.',
    },
    6: {
      subject: isEn ? `${name}, the Brotherhood is waiting 👥` : `${name}, Comunitatea Brotherhood te așteaptă 👥`,
      title: isEn ? '👥 BROTHERHOOD' : '👥 BROTHERHOOD',
      headline: isEn ? `The power of community, ${name}` : `Puterea comunității, ${name}`,
      gradient: 'linear-gradient(135deg, #8b5cf6 0%, #6d28d9 100%)',
      accent: '#8b5cf6',
      body: `<h2 style="color:#8b5cf6;">${greet}</h2>
        <p>${isEn ? '"You are the average of the 5 people you spend the most time with."' : '"Ești media celor 5 oameni cu care petreci cel mai mult timp."'}</p>
        <p>${isEn ? 'Inside Brotherhood you\'ll find men with the same values who push you to become the best version of yourself.' : 'În Brotherhood vei găsi bărbați cu aceleași valori, care te vor împinge să devii versiunea ta cea mai bună.'}</p>
        <div style="background: rgba(139, 92, 246, 0.1); padding: 20px; border-radius: 12px; margin: 20px 0;">
          <h3 style="margin:0 0 15px 0; color:#8b5cf6;">${isEn ? 'What Brotherhood offers:' : 'Ce oferă Brotherhood:'}</h3>
          <ul style="margin:0; padding-left:20px;">
            <li>🏆 ${isEn ? 'Themed tribes (Fitness, Business, Mindset)' : 'Tribes tematice (Fitness, Business, Mindset)'}</li>
            <li>💬 ${isEn ? 'Chat & community support' : 'Chat și suport comunitar'}</li>
            <li>📈 ${isEn ? 'Leaderboard & healthy competition' : 'Leaderboard și competiție sănătoasă'}</li>
            <li>🎯 ${isEn ? 'Accountability partners' : 'Accountability partners'}</li>
            <li>📚 ${isEn ? 'Exclusive content' : 'Conținut exclusiv'}</li>
          </ul>
        </div>`,
      cta: isEn ? 'Join Brotherhood →' : 'Alătură-te Brotherhood →',
      ctaHref: `${BASE_URL}/brotherhood?${utm('day6')}`,
      next: isEn ? 'The final offer & complete recap.' : 'Email-ul final cu oferta specială și recapitulare completă.',
    },
    7: {
      subject: isEn ? `${name}, special offer + your complete plan 🎁` : `${name}, Oferta Specială + Planul Tău Complet 🎁`,
      title: isEn ? '🎁 SPECIAL OFFER' : '🎁 OFERTĂ SPECIALĂ',
      headline: isEn ? `Just for you, ${name}` : `Doar pentru tine, ${name}`,
      gradient: 'linear-gradient(135deg, #ec4899 0%, #be185d 100%)',
      accent: '#ec4899',
      body: `<h2 style="color:#ec4899;">${greet}</h2>
        <p>${isEn ? 'Over the last 7 days we showed you exactly what you need to transform your life.' : 'În ultimele 7 zile ți-am arătat exact ce ai nevoie pentru a-ți transforma viața.'}</p>
        ${scores ? `<div style="background: rgba(236, 72, 153, 0.1); padding: 20px; border-radius: 12px; margin: 20px 0; text-align:center;">
          <h3 style="margin:0 0 10px 0; color:#ec4899;">${isEn ? `Your current score: ${scores.total_score}/96` : `Scorul tău actual: ${scores.total_score}/96`}</h3>
          <p style="margin:0; color:#888;">${isEn ? `Growth potential: ${96 - scores.total_score} points` : `Potențial de creștere: ${96 - scores.total_score} puncte`}</p>
        </div>` : ''}
        <div style="background: rgba(236, 72, 153, 0.1); padding: 20px; border-radius: 12px; margin: 20px 0;">
          <h3 style="margin:0 0 15px 0; color:#ec4899;">${isEn ? 'What you get with Premium:' : 'Ce primești cu Premium:'}</h3>
          <ul style="margin:0; padding-left:20px;">
            <li>${isEn ? 'Full access to all AI Stacks' : 'Acces complet la toate AI Stacks'}</li>
            <li>${isEn ? 'Champion Routine with audio guidance' : 'Rutina Campionilor cu ghidare audio'}</li>
            <li>${isEn ? 'Premium Brotherhood' : 'Brotherhood Premium'}</li>
            <li>${isEn ? 'Unlimited personalized meditations' : 'Meditații personalizate nelimitate'}</li>
            <li>${isEn ? 'Advanced tracking & analytics' : 'Tracking avansat și analytics'}</li>
            <li>${isEn ? 'Priority support' : 'Suport prioritar'}</li>
          </ul>
        </div>
        <div style="text-align:center; padding: 20px; background: linear-gradient(135deg, rgba(236, 72, 153, 0.2), rgba(190, 24, 93, 0.2)); border-radius: 12px; margin: 20px 0;">
          <p style="margin:0 0 10px 0; text-decoration: line-through; color:#888;">${isEn ? 'Normal price: €49/month' : 'Preț normal: 49€/lună'}</p>
          <p style="margin:0; font-size:32px; font-weight:bold; color:#ec4899;">€19/${isEn ? 'month' : 'lună'}</p>
          <p style="margin:5px 0 0 0; color:#22c55e;">${isEn ? 'Save 60%!' : 'Economisești 60%!'}</p>
        </div>
        <p style="text-align:center; color:#888; font-size:14px;">${isEn ? 'Offer expires in 48 hours.' : 'Oferta expiră în 48 de ore.'}</p>`,
      cta: isEn ? 'Activate Premium Now →' : 'Activează Premium Acum →',
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
    if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) throw new Error("Missing Supabase configuration");
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    const { data: leads, error: leadsError } = await supabase
      .from('email_leads')
      .select('id, email, name, created_at, language')
      .eq('lead_magnet', 'warrior_power')
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
        .eq('sequence_type', 'warrior_power')
        .eq('day_number', dayNumber)
        .maybeSingle();
      if (existingLog) continue;

      const { data: scoresData } = await supabase
        .from('warrior_power_results')
        .select('scores, total_score')
        .eq('email', lead.email)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      const lang: EmailLang = ((lead as any).language === 'en'
        ? 'en'
        : (lead as any).language === 'ro'
          ? 'ro'
          : await resolveLeadLanguage(supabase, lead.email));

      const trackingId = crypto.randomUUID();
      const displayName = lead.name?.split(' ')[0] || (lang === 'en' ? 'Warrior' : 'Warrior');
      const template = buildEmail(dayNumber, displayName, scoresData as WarriorPowerResult | null, trackingId, lang);

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
        sequence_type: 'warrior_power',
        day_number: dayNumber,
        tracking_id: trackingId,
      });

      results.push({ email: lead.email, day: dayNumber, status: 'sent', lang });
    }

    return new Response(JSON.stringify({ success: true, processed: results.length, results }), {
      status: 200, headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  } catch (error: any) {
    console.error("Error in send-warrior-power-sequence:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500, headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  }
};

serve(handler);
