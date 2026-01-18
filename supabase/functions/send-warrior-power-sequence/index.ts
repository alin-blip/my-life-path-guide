import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");
const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const BASE_URL = "https://warriorsos.com";

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
      subject: `${name}, Secretul Transformării în 7 Zile`,
      html: `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #ffffff; color: #1a1a1a; margin: 0; padding: 20px; line-height: 1.6;">
${trackingPixel}
<div style="max-width: 600px; margin: 0 auto;">

<p>Salut ${name},</p>

<p>Ieri ți-ai descoperit scorurile Warrior Power. Acum e timpul să acționezi!</p>

<p><strong>Ce vei învăța în Challenge-ul de 7 Zile:</strong></p>
<ul>
<li>Ziua 1: Viziunea ta pentru 2026</li>
<li>Ziua 2: Principiile succesului</li>
<li>Ziua 3: Stack-ul de dimineață</li>
<li>Ziua 4: Disciplina mentală</li>
<li>Ziua 5: Optimizare fizică</li>
<li>Ziua 6: Relații de calitate</li>
<li>Ziua 7: Plan de acțiune</li>
</ul>

<p>100% GRATUIT • 7 zile • 15 min/zi</p>

<p><a href="${BASE_URL}/challenge/1?utm_source=email&utm_medium=sequence&utm_campaign=warrior_power&utm_content=day2" style="color: #0066cc;">Începe Challenge-ul GRATUIT →</a></p>

<p>Mult succes!<br>Echipa Warrior SOS</p>

<p style="color: #666666; font-size: 12px; margin-top: 40px; padding-top: 20px; border-top: 1px solid #eeeeee;">
Mâine: Vom analiza cea mai slabă dimensiune a ta și cum să o îmbunătățești.<br><br>
<a href="${unsubscribeUrl}" style="color: #666666;">Dezabonare</a>
</p>

</div>
</body>
</html>`
    },
    3: {
      subject: `${name}, Dimensiunea ta cea mai slabă + Soluții`,
      html: `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #ffffff; color: #1a1a1a; margin: 0; padding: 20px; line-height: 1.6;">
${trackingPixel}
<div style="max-width: 600px; margin: 0 auto;">

<p>Salut ${name},</p>

${scores ? `<p>Analizând rezultatele tale, am identificat că <strong>${getDimensionName(getWeakestDimension(scores.scores).name)}</strong> este zona care necesită cea mai mare atenție (${getWeakestDimension(scores.scores).score}/24 puncte).</p>

<p><strong>3 Acțiuni pentru ${getDimensionName(getWeakestDimension(scores.scores).name)}:</strong></p>
<ol>
<li>Identifică 1 obicei negativ de eliminat</li>
<li>Adaugă 1 rutină zilnică de 10 minute</li>
<li>Monitorizează progresul săptămânal</li>
</ol>` : `<p>Am pregătit o analiză personalizată pentru tine bazată pe rezultatele quizului.</p>`}

<p>AI Coach-ul nostru poate crea un plan personalizat exact pentru nevoile tale.</p>

<p><a href="${BASE_URL}/stacks?utm_source=email&utm_medium=sequence&utm_campaign=warrior_power&utm_content=day3" style="color: #0066cc;">Explorează AI Coach →</a></p>

<p>Mult succes!<br>Echipa Warrior SOS</p>

<p style="color: #666666; font-size: 12px; margin-top: 40px; padding-top: 20px; border-top: 1px solid #eeeeee;">
Mâine: Rutina Campionilor de Dimineață - template-ul exact pentru succes.<br><br>
<a href="${unsubscribeUrl}" style="color: #666666;">Dezabonare</a>
</p>

</div>
</body>
</html>`
    },
    4: {
      subject: `${name}, Rutina de Dimineață a Campionilor`,
      html: `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #ffffff; color: #1a1a1a; margin: 0; padding: 20px; line-height: 1.6;">
${trackingPixel}
<div style="max-width: 600px; margin: 0 auto;">

<p>Salut ${name},</p>

<p>Studiile arată că primele 60 de minute ale zilei determină productivitatea și starea emoțională pentru restul zilei.</p>

<p><strong>Template Rutină de Dimineață (45 min):</strong></p>
<ul>
<li>5 min - Respirație și gratitudine</li>
<li>10 min - Meditație ghidată</li>
<li>15 min - Citit sau învățat</li>
<li>10 min - Mișcare fizică</li>
<li>5 min - Planificare zi</li>
</ul>

<p>Platforma noastră automatizează toți acești pași cu ghidare audio și tracking.</p>

<p><a href="${BASE_URL}/champion-routine?utm_source=email&utm_medium=sequence&utm_campaign=warrior_power&utm_content=day4" style="color: #0066cc;">Configurează Rutina Ta →</a></p>

<p>Mult succes!<br>Echipa Warrior SOS</p>

<p style="color: #666666; font-size: 12px; margin-top: 40px; padding-top: 20px; border-top: 1px solid #eeeeee;">
Mâine: Cum să folosești AI-ul pentru transformare accelerată.<br><br>
<a href="${unsubscribeUrl}" style="color: #666666;">Dezabonare</a>
</p>

</div>
</body>
</html>`
    },
    5: {
      subject: `${name}, AI Coach: Transformare 10x mai rapidă`,
      html: `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #ffffff; color: #1a1a1a; margin: 0; padding: 20px; line-height: 1.6;">
${trackingPixel}
<div style="max-width: 600px; margin: 0 auto;">

<p>Salut ${name},</p>

<p>Imaginează-ți să ai acces la 5 tipuri diferite de coach-i, disponibili oricând ai nevoie:</p>

<p><strong>AI Stacks disponibile:</strong></p>
<ul>
<li><strong>Performance Coach</strong> - Productivitate maximă</li>
<li><strong>Relationship Coach</strong> - Relații mai bune</li>
<li><strong>Therapist Coach</strong> - Sănătate emoțională</li>
<li><strong>Accountability Coach</strong> - Responsabilitate și tracking</li>
<li><strong>Meditation Guide</strong> - Meditații personalizate</li>
</ul>

${scores ? `<p>Bazat pe scorul tău de ${scores.total_score}/96, AI-ul va personaliza fiecare recomandare.</p>` : ''}

<p><a href="${BASE_URL}/stacks?utm_source=email&utm_medium=sequence&utm_campaign=warrior_power&utm_content=day5" style="color: #0066cc;">Încearcă AI Coach Gratuit →</a></p>

<p>Mult succes!<br>Echipa Warrior SOS</p>

<p style="color: #666666; font-size: 12px; margin-top: 40px; padding-top: 20px; border-top: 1px solid #eeeeee;">
Mâine: Comunitatea Brotherhood - puterea grupului.<br><br>
<a href="${unsubscribeUrl}" style="color: #666666;">Dezabonare</a>
</p>

</div>
</body>
</html>`
    },
    6: {
      subject: `${name}, Comunitatea Brotherhood te așteaptă`,
      html: `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #ffffff; color: #1a1a1a; margin: 0; padding: 20px; line-height: 1.6;">
${trackingPixel}
<div style="max-width: 600px; margin: 0 auto;">

<p>Salut ${name},</p>

<p>"Ești media celor 5 oameni cu care petreci cel mai mult timp."</p>

<p>În Brotherhood vei găsi bărbați cu aceleași valori, care te vor împinge să devii versiunea ta cea mai bună.</p>

<p><strong>Ce oferă Brotherhood:</strong></p>
<ul>
<li>Tribes tematice (Fitness, Business, Mindset)</li>
<li>Chat și suport comunitar</li>
<li>Leaderboard și competiție sănătoasă</li>
<li>Accountability partners</li>
<li>Conținut exclusiv</li>
</ul>

<p><a href="${BASE_URL}/brotherhood?utm_source=email&utm_medium=sequence&utm_campaign=warrior_power&utm_content=day6" style="color: #0066cc;">Alătură-te Brotherhood →</a></p>

<p>Mult succes!<br>Echipa Warrior SOS</p>

<p style="color: #666666; font-size: 12px; margin-top: 40px; padding-top: 20px; border-top: 1px solid #eeeeee;">
Mâine: Email-ul final cu oferta specială și recapitulare completă.<br><br>
<a href="${unsubscribeUrl}" style="color: #666666;">Dezabonare</a>
</p>

</div>
</body>
</html>`
    },
    7: {
      subject: `${name}, Oferta Specială + Planul Tău Complet`,
      html: `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #ffffff; color: #1a1a1a; margin: 0; padding: 20px; line-height: 1.6;">
${trackingPixel}
<div style="max-width: 600px; margin: 0 auto;">

<p>Salut ${name},</p>

<p>În ultimele 7 zile ți-am arătat exact ce ai nevoie pentru a-ți transforma viața.</p>

${scores ? `<p><strong>Scorul tău actual: ${scores.total_score}/96</strong><br>
Potențial de creștere: ${96 - scores.total_score} puncte</p>` : ''}

<p><strong>Ce primești cu Premium:</strong></p>
<ul>
<li>Acces complet la toate AI Stacks</li>
<li>Rutina Campionilor cu ghidare audio</li>
<li>Brotherhood Premium</li>
<li>Meditații personalizate nelimitate</li>
<li>Tracking avansat și analytics</li>
<li>Suport prioritar</li>
</ul>

<p><s>Preț normal: 49€/lună</s><br>
<strong>Preț special: 19€/lună</strong> (Economisești 60%!)</p>
    
    <div style="text-align: center; margin: 30px 0;">
      <a href="${BASE_URL}/pricing?utm_source=email&utm_medium=sequence&utm_campaign=warrior_power&utm_content=day7" style="display: inline-block; padding: 15px 40px; background: linear-gradient(135deg, #ec4899 0%, #be185d 100%); color: #ffffff; text-decoration: none; border-radius: 8px; font-weight: bold;">Activează Premium Acum →</a>
    </div>
    
    <p style="text-align: center; color: #888; font-size: 14px;">Oferta expiră în 48 de ore.</p>
  </div>
  <div style="padding: 20px 30px; text-align: center; color: #666; font-size: 12px; border-top: 1px solid rgba(255,255,255,0.1);">
    <p style="margin: 0;">© 2025 Warrior Power. Toate drepturile rezervate.</p>
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
          from: "Warrior Power <noreply@warriorsos.com>",
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
