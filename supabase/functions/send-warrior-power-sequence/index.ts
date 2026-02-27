import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");
const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const BASE_URL = "https://ceomindos.com";

interface EmailLead {
  id: string;
  email: string;
  name: string | null;
  created_at: string;
}

interface WarriorPowerResult {
  scores: {
    body_fitness: number;
    body_nutrition: number;
    being_connection: number;
    being_certainty: number;
    balance_relationship: number;
    balance_family: number;
    business_mechanics: number;
    business_money: number;
  };
  total_score: number;
}

function getDimensionName(key: string): string {
  const names: Record<string, string> = {
    body: "Corp",
    being: "Ființă",
    balance: "Echilibru",
    business: "Business"
  };
  return names[key] || key;
}

function getWeakestDimension(scores: WarriorPowerResult["scores"]): { name: string; score: number } {
  const dimensionScores = {
    body: scores.body_fitness + scores.body_nutrition,
    being: scores.being_connection + scores.being_certainty,
    balance: scores.balance_relationship + scores.balance_family,
    business: scores.business_mechanics + scores.business_money
  };
  
  let weakest = { name: "body", score: dimensionScores.body };
  for (const [key, value] of Object.entries(dimensionScores)) {
    if (value < weakest.score) {
      weakest = { name: key, score: value };
    }
  }
  return weakest;
}

function getEmailTemplate(dayNumber: number, name: string, scores: WarriorPowerResult | null, trackingId: string): { subject: string; html: string } {
  const unsubscribeUrl = `${BASE_URL}/unsubscribe?id=${trackingId}`;
  const trackingPixel = `<img src="${BASE_URL}/api/track-open?id=${trackingId}" width="1" height="1" style="display:none;" />`;
  
  const templates: Record<number, { subject: string; html: string }> = {
    2: {
      subject: `${name}, Secretul Transformării în 7 Zile te așteaptă! 🚀`,
      html: `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
<body style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #0f0f0f; color: #ffffff; margin: 0; padding: 20px;">
<div style="max-width: 600px; margin: 0 auto; background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%); border-radius: 16px; overflow: hidden;">
  <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px 30px; text-align: center;">
    <h1 style="margin: 0; font-size: 28px; color: #ffffff;">⚡ TRANSFORMĂ-TE ÎN 7 ZILE</h1>
    <p style="margin: 10px 0 0 0; color: rgba(255,255,255,0.9);">Provocarea care îți schimbă viața, ${name}!</p>
  </div>
  <div style="padding: 30px;">
    <h2 style="color: #667eea;">Salut ${name},</h2>
    <p>Ieri ți-ai descoperit scorurile Warrior Power. Acum e timpul să acționezi!</p>
    
    <div style="background: rgba(102, 126, 234, 0.1); padding: 20px; border-radius: 12px; margin: 20px 0;">
      <h3 style="margin: 0 0 15px 0; color: #667eea;">Ce vei învăța în 7 zile:</h3>
      <ul style="margin: 0; padding-left: 20px;">
        <li>✅ Ziua 1: Viziunea ta pentru 2026</li>
        <li>✅ Ziua 2: Principiile succesului</li>
        <li>✅ Ziua 3: Stack-ul de dimineață</li>
        <li>✅ Ziua 4: Disciplina mentală</li>
        <li>✅ Ziua 5: Optimizare fizică</li>
        <li>✅ Ziua 6: Relații de calitate</li>
        <li>✅ Ziua 7: Plan de acțiune</li>
      </ul>
    </div>
    
    <p><strong>100% GRATUIT</strong> • 7 zile • 15 min/zi</p>
    
    <div style="text-align: center; margin: 30px 0;">
      <a href="${BASE_URL}/challenge/1?utm_source=email&utm_medium=sequence&utm_campaign=warrior_power&utm_content=day2" style="display: inline-block; padding: 15px 40px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: #ffffff; text-decoration: none; border-radius: 8px; font-weight: bold;">Începe Challenge-ul GRATUIT →</a>
    </div>
    
    <p style="color: #888; font-size: 14px;">Mâine: Vom analiza cea mai slabă dimensiune a ta și cum să o îmbunătățești.</p>
  </div>
  <div style="padding: 20px 30px; text-align: center; color: #666; font-size: 12px; border-top: 1px solid rgba(255,255,255,0.1);">
    <p style="margin: 0;">© 2025 CEO Mind OS. Toate drepturile rezervate.</p>
    <p style="margin: 5px 0 0 0;"><a href="${unsubscribeUrl}" style="color: #888;">Dezabonare</a></p>
  </div>
</div>
${trackingPixel}
</body>
</html>`
    },
    3: {
      subject: `${name}, Dimensiunea ta cea mai slabă + Soluții 📊`,
      html: `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
<body style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #0f0f0f; color: #ffffff; margin: 0; padding: 20px;">
<div style="max-width: 600px; margin: 0 auto; background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%); border-radius: 16px; overflow: hidden;">
  <div style="background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%); padding: 40px 30px; text-align: center;">
    <h1 style="margin: 0; font-size: 28px; color: #ffffff;">📊 ANALIZĂ PERSONALIZATĂ</h1>
    <p style="margin: 10px 0 0 0; color: rgba(255,255,255,0.9);">Dimensiunea care te ține pe loc, ${name}</p>
  </div>
  <div style="padding: 30px;">
    <h2 style="color: #f59e0b;">Salut ${name},</h2>
    ${scores ? `
    <p>Analizând rezultatele tale, am identificat că <strong>${getDimensionName(getWeakestDimension(scores.scores).name)}</strong> este zona care necesită cea mai mare atenție (${getWeakestDimension(scores.scores).score}/24 puncte).</p>
    
    <div style="background: rgba(245, 158, 11, 0.1); padding: 20px; border-radius: 12px; margin: 20px 0;">
      <h3 style="margin: 0 0 15px 0; color: #f59e0b;">3 Acțiuni pentru ${getDimensionName(getWeakestDimension(scores.scores).name)}:</h3>
      <ol style="margin: 0; padding-left: 20px;">
        <li>Identifică 1 obicei negativ de eliminat</li>
        <li>Adaugă 1 rutină zilnică de 10 minute</li>
        <li>Monitorizează progresul săptămânal</li>
      </ol>
    </div>
    ` : `<p>Am pregătit o analiză personalizată pentru tine bazată pe rezultatele quizului.</p>`}
    
    <p>AI Coach-ul nostru poate crea un plan personalizat exact pentru nevoile tale.</p>
    
    <div style="text-align: center; margin: 30px 0;">
      <a href="${BASE_URL}/stacks?utm_source=email&utm_medium=sequence&utm_campaign=warrior_power&utm_content=day3" style="display: inline-block; padding: 15px 40px; background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%); color: #ffffff; text-decoration: none; border-radius: 8px; font-weight: bold;">Explorează AI Coach →</a>
    </div>
    
    <p style="color: #888; font-size: 14px;">Mâine: Rutina Campionilor de Dimineață - template-ul exact pentru succes.</p>
  </div>
  <div style="padding: 20px 30px; text-align: center; color: #666; font-size: 12px; border-top: 1px solid rgba(255,255,255,0.1);">
    <p style="margin: 0;">© 2025 CEO Mind OS. Toate drepturile rezervate.</p>
    <p style="margin: 5px 0 0 0;"><a href="${unsubscribeUrl}" style="color: #888;">Dezabonare</a></p>
  </div>
</div>
${trackingPixel}
</body>
</html>`
    },
    4: {
      subject: `${name}, Rutina de Dimineață a Campionilor ☀️`,
      html: `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
<body style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #0f0f0f; color: #ffffff; margin: 0; padding: 20px;">
<div style="max-width: 600px; margin: 0 auto; background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%); border-radius: 16px; overflow: hidden;">
  <div style="background: linear-gradient(135deg, #22c55e 0%, #16a34a 100%); padding: 40px 30px; text-align: center;">
    <h1 style="margin: 0; font-size: 28px; color: #ffffff;">☀️ RUTINA CAMPIONILOR</h1>
    <p style="margin: 10px 0 0 0; color: rgba(255,255,255,0.9);">Prima oră care definește ziua, ${name}</p>
  </div>
  <div style="padding: 30px;">
    <h2 style="color: #22c55e;">Salut ${name},</h2>
    <p>Studiile arată că primele 60 de minute ale zilei determină productivitatea și starea emoțională pentru restul zilei.</p>
    
    <div style="background: rgba(34, 197, 94, 0.1); padding: 20px; border-radius: 12px; margin: 20px 0;">
      <h3 style="margin: 0 0 15px 0; color: #22c55e;">Template Rutină de Dimineață (45 min):</h3>
      <ul style="margin: 0; padding-left: 20px;">
        <li>🌅 5 min - Respirație și gratitudine</li>
        <li>🧘 10 min - Meditație ghidată</li>
        <li>📖 15 min - Citit sau învățat</li>
        <li>💪 10 min - Mișcare fizică</li>
        <li>📝 5 min - Planificare zi</li>
      </ul>
    </div>
    
    <p>Platforma noastră automatizează toți acești pași cu ghidare audio și tracking.</p>
    
    <div style="text-align: center; margin: 30px 0;">
      <a href="${BASE_URL}/champion-routine?utm_source=email&utm_medium=sequence&utm_campaign=warrior_power&utm_content=day4" style="display: inline-block; padding: 15px 40px; background: linear-gradient(135deg, #22c55e 0%, #16a34a 100%); color: #ffffff; text-decoration: none; border-radius: 8px; font-weight: bold;">Configurează Rutina Ta →</a>
    </div>
    
    <p style="color: #888; font-size: 14px;">Mâine: Cum să folosești AI-ul pentru transformare accelerată.</p>
  </div>
  <div style="padding: 20px 30px; text-align: center; color: #666; font-size: 12px; border-top: 1px solid rgba(255,255,255,0.1);">
    <p style="margin: 0;">© 2025 CEO Mind OS. Toate drepturile rezervate.</p>
    <p style="margin: 5px 0 0 0;"><a href="${unsubscribeUrl}" style="color: #888;">Dezabonare</a></p>
  </div>
</div>
${trackingPixel}
</body>
</html>`
    },
    5: {
      subject: `${name}, AI Coach: Transformare 10x mai rapidă 🤖`,
      html: `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
<body style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #0f0f0f; color: #ffffff; margin: 0; padding: 20px;">
<div style="max-width: 600px; margin: 0 auto; background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%); border-radius: 16px; overflow: hidden;">
  <div style="background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%); padding: 40px 30px; text-align: center;">
    <h1 style="margin: 0; font-size: 28px; color: #ffffff;">🤖 AI COACH PERSONAL</h1>
    <p style="margin: 10px 0 0 0; color: rgba(255,255,255,0.9);">Coaching disponibil 24/7, ${name}</p>
  </div>
  <div style="padding: 30px;">
    <h2 style="color: #3b82f6;">Salut ${name},</h2>
    <p>Imaginează-ți să ai acces la 5 tipuri diferite de coach-i, disponibili oricând ai nevoie:</p>
    
    <div style="background: rgba(59, 130, 246, 0.1); padding: 20px; border-radius: 12px; margin: 20px 0;">
      <h3 style="margin: 0 0 15px 0; color: #3b82f6;">AI Stacks disponibile:</h3>
      <ul style="margin: 0; padding-left: 20px;">
        <li>🎯 <strong>Performance Coach</strong> - Productivitate maximă</li>
        <li>❤️ <strong>Relationship Coach</strong> - Relații mai bune</li>
        <li>🧠 <strong>Therapist Coach</strong> - Sănătate emoțională</li>
        <li>📊 <strong>Accountability Coach</strong> - Responsabilitate și tracking</li>
        <li>🧘 <strong>Meditation Guide</strong> - Meditații personalizate</li>
      </ul>
    </div>
    ${scores ? `
    <p>Bazat pe scorul tău de ${scores.total_score}/96, AI-ul va personaliza fiecare recomandare.</p>
    ` : ''}
    
    <div style="text-align: center; margin: 30px 0;">
      <a href="${BASE_URL}/stacks?utm_source=email&utm_medium=sequence&utm_campaign=warrior_power&utm_content=day5" style="display: inline-block; padding: 15px 40px; background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%); color: #ffffff; text-decoration: none; border-radius: 8px; font-weight: bold;">Încearcă AI Coach Gratuit →</a>
    </div>
    
    <p style="color: #888; font-size: 14px;">Mâine: Comunitatea Brotherhood - puterea grupului.</p>
  </div>
  <div style="padding: 20px 30px; text-align: center; color: #666; font-size: 12px; border-top: 1px solid rgba(255,255,255,0.1);">
    <p style="margin: 0;">© 2025 CEO Mind OS. Toate drepturile rezervate.</p>
    <p style="margin: 5px 0 0 0;"><a href="${unsubscribeUrl}" style="color: #888;">Dezabonare</a></p>
  </div>
</div>
${trackingPixel}
</body>
</html>`
    },
    6: {
      subject: `${name}, Comunitatea Brotherhood te așteaptă 👥`,
      html: `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
<body style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #0f0f0f; color: #ffffff; margin: 0; padding: 20px;">
<div style="max-width: 600px; margin: 0 auto; background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%); border-radius: 16px; overflow: hidden;">
  <div style="background: linear-gradient(135deg, #8b5cf6 0%, #6d28d9 100%); padding: 40px 30px; text-align: center;">
    <h1 style="margin: 0; font-size: 28px; color: #ffffff;">👥 BROTHERHOOD</h1>
    <p style="margin: 10px 0 0 0; color: rgba(255,255,255,0.9);">Puterea comunității, ${name}</p>
  </div>
  <div style="padding: 30px;">
    <h2 style="color: #8b5cf6;">Salut ${name},</h2>
    <p>"Ești media celor 5 oameni cu care petreci cel mai mult timp."</p>
    
    <p>În Brotherhood vei găsi bărbați cu aceleași valori, care te vor împinge să devii versiunea ta cea mai bună.</p>
    
    <div style="background: rgba(139, 92, 246, 0.1); padding: 20px; border-radius: 12px; margin: 20px 0;">
      <h3 style="margin: 0 0 15px 0; color: #8b5cf6;">Ce oferă Brotherhood:</h3>
      <ul style="margin: 0; padding-left: 20px;">
        <li>🏆 Tribes tematice (Fitness, Business, Mindset)</li>
        <li>💬 Chat și suport comunitar</li>
        <li>📈 Leaderboard și competiție sănătoasă</li>
        <li>🎯 Accountability partners</li>
        <li>📚 Conținut exclusiv</li>
      </ul>
    </div>
    
    <div style="text-align: center; margin: 30px 0;">
      <a href="${BASE_URL}/brotherhood?utm_source=email&utm_medium=sequence&utm_campaign=warrior_power&utm_content=day6" style="display: inline-block; padding: 15px 40px; background: linear-gradient(135deg, #8b5cf6 0%, #6d28d9 100%); color: #ffffff; text-decoration: none; border-radius: 8px; font-weight: bold;">Alătură-te Brotherhood →</a>
    </div>
    
    <p style="color: #888; font-size: 14px;">Mâine: Email-ul final cu oferta specială și recapitulare completă.</p>
  </div>
  <div style="padding: 20px 30px; text-align: center; color: #666; font-size: 12px; border-top: 1px solid rgba(255,255,255,0.1);">
    <p style="margin: 0;">© 2025 CEO Mind OS. Toate drepturile rezervate.</p>
    <p style="margin: 5px 0 0 0;"><a href="${unsubscribeUrl}" style="color: #888;">Dezabonare</a></p>
  </div>
</div>
${trackingPixel}
</body>
</html>`
    },
    7: {
      subject: `${name}, Oferta Specială + Planul Tău Complet 🎁`,
      html: `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
<body style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #0f0f0f; color: #ffffff; margin: 0; padding: 20px;">
<div style="max-width: 600px; margin: 0 auto; background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%); border-radius: 16px; overflow: hidden;">
  <div style="background: linear-gradient(135deg, #ec4899 0%, #be185d 100%); padding: 40px 30px; text-align: center;">
    <h1 style="margin: 0; font-size: 28px; color: #ffffff;">🎁 OFERTĂ SPECIALĂ</h1>
    <p style="margin: 10px 0 0 0; color: rgba(255,255,255,0.9);">Doar pentru tine, ${name}</p>
  </div>
  <div style="padding: 30px;">
    <h2 style="color: #ec4899;">Salut ${name},</h2>
    <p>În ultimele 7 zile ți-am arătat exact ce ai nevoie pentru a-ți transforma viața.</p>
    
    ${scores ? `
    <div style="background: rgba(236, 72, 153, 0.1); padding: 20px; border-radius: 12px; margin: 20px 0; text-align: center;">
      <h3 style="margin: 0 0 10px 0; color: #ec4899;">Scorul tău actual: ${scores.total_score}/96</h3>
      <p style="margin: 0; color: #888;">Potențial de creștere: ${96 - scores.total_score} puncte</p>
    </div>
    ` : ''}
    
    <div style="background: rgba(236, 72, 153, 0.1); padding: 20px; border-radius: 12px; margin: 20px 0;">
      <h3 style="margin: 0 0 15px 0; color: #ec4899;">Ce primești cu Premium:</h3>
      <ul style="margin: 0; padding-left: 20px;">
        <li>✅ Acces complet la toate AI Stacks</li>
        <li>✅ Rutina Campionilor cu ghidare audio</li>
        <li>✅ Brotherhood Premium</li>
        <li>✅ Meditații personalizate nelimitate</li>
        <li>✅ Tracking avansat și analytics</li>
        <li>✅ Suport prioritar</li>
      </ul>
    </div>
    
    <div style="text-align: center; padding: 20px; background: linear-gradient(135deg, rgba(236, 72, 153, 0.2), rgba(190, 24, 93, 0.2)); border-radius: 12px; margin: 20px 0;">
      <p style="margin: 0 0 10px 0; text-decoration: line-through; color: #888;">Preț normal: 49€/lună</p>
      <p style="margin: 0; font-size: 32px; font-weight: bold; color: #ec4899;">19€/lună</p>
      <p style="margin: 5px 0 0 0; color: #22c55e;">Economisești 60%!</p>
    </div>
    
    <div style="text-align: center; margin: 30px 0;">
      <a href="${BASE_URL}/pricing?utm_source=email&utm_medium=sequence&utm_campaign=warrior_power&utm_content=day7" style="display: inline-block; padding: 15px 40px; background: linear-gradient(135deg, #ec4899 0%, #be185d 100%); color: #ffffff; text-decoration: none; border-radius: 8px; font-weight: bold;">Activează Premium Acum →</a>
    </div>
    
    <p style="text-align: center; color: #888; font-size: 14px;">Oferta expiră în 48 de ore.</p>
  </div>
  <div style="padding: 20px 30px; text-align: center; color: #666; font-size: 12px; border-top: 1px solid rgba(255,255,255,0.1);">
    <p style="margin: 0;">© 2025 CEO Mind OS. Toate drepturile rezervate.</p>
    <p style="margin: 5px 0 0 0;"><a href="${unsubscribeUrl}" style="color: #888;">Dezabonare</a></p>
  </div>
</div>
${trackingPixel}
</body>
</html>`
    }
  };
  
  return templates[dayNumber] || templates[2];
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
      throw new Error("Missing Supabase configuration");
    }

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    // Get all subscribed warrior_power leads
    const { data: leads, error: leadsError } = await supabase
      .from('email_leads')
      .select('id, email, name, created_at')
      .eq('lead_magnet', 'warrior_power')
      .eq('subscribed', true);

    if (leadsError) {
      throw new Error(`Error fetching leads: ${leadsError.message}`);
    }

    console.log(`Found ${leads?.length || 0} warrior_power leads`);

    const results: { email: string; day: number; status: string }[] = [];
    const now = new Date();

    for (const lead of (leads || [])) {
      const createdAt = new Date(lead.created_at);
      const daysSinceQuiz = Math.floor((now.getTime() - createdAt.getTime()) / (1000 * 60 * 60 * 24));
      
      // Determine which day email to send (2-7, day 1 is sent immediately)
      const dayNumber = daysSinceQuiz + 1; // Day 1 = 0 days ago, Day 2 = 1 day ago, etc.
      
      if (dayNumber < 2 || dayNumber > 7) {
        continue; // Skip if not in sequence range
      }

      // Check if email already sent for this day
      const { data: existingLog } = await supabase
        .from('email_sequence_log')
        .select('id')
        .eq('email', lead.email)
        .eq('sequence_type', 'warrior_power')
        .eq('day_number', dayNumber)
        .maybeSingle();

      if (existingLog) {
        console.log(`Email day ${dayNumber} already sent to ${lead.email}`);
        continue;
      }

      // Get quiz scores for personalization
      const { data: scoresData } = await supabase
        .from('warrior_power_results')
        .select('scores, total_score')
        .eq('email', lead.email)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      // Create tracking ID
      const trackingId = crypto.randomUUID();

      // Get email template
      const template = getEmailTemplate(
        dayNumber, 
        lead.name || 'Warrior', 
        scoresData as WarriorPowerResult | null,
        trackingId
      );

      // Send email via Resend
      const emailResponse = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${RESEND_API_KEY}`,
        },
        body: JSON.stringify({
          from: "Warrior Power <onboarding@resend.dev>",
          to: [lead.email],
          subject: template.subject,
          html: template.html,
        }),
      });

      if (!emailResponse.ok) {
        const errorText = await emailResponse.text();
        console.error(`Failed to send email to ${lead.email}:`, errorText);
        results.push({ email: lead.email, day: dayNumber, status: 'failed' });
        continue;
      }

      // Log the sent email
      await supabase
        .from('email_sequence_log')
        .insert({
          lead_id: lead.id,
          email: lead.email,
          sequence_type: 'warrior_power',
          day_number: dayNumber,
          tracking_id: trackingId,
        });

      console.log(`Sent day ${dayNumber} email to ${lead.email}`);
      results.push({ email: lead.email, day: dayNumber, status: 'sent' });
    }

    return new Response(JSON.stringify({ 
      success: true, 
      processed: results.length,
      results 
    }), {
      status: 200,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  } catch (error: any) {
    console.error("Error in send-warrior-power-sequence:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);
