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

function getEmailTemplate(dayNumber: number, name: string, trackingId: string): { subject: string; html: string } {
  const unsubscribeUrl = `${BASE_URL}/unsubscribe?id=${trackingId}`;
  const trackingPixel = `<img src="${BASE_URL}/api/track-open?id=${trackingId}" width="1" height="1" style="display:none;" />`;
  
  const templates: Record<number, { subject: string; html: string }> = {
    2: {
      subject: `${name}, Challenge-ul de 7 Zile te așteaptă! 🚀`,
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
    <p>Ieri ai descoperit scorul tău de viață. Acum e timpul să acționezi!</p>
    
    <div style="background: rgba(102, 126, 234, 0.1); padding: 20px; border-radius: 12px; margin: 20px 0;">
      <h3 style="margin: 0 0 15px 0; color: #667eea;">Ce vei învăța în Challenge:</h3>
      <ul style="margin: 0; padding-left: 20px; line-height: 1.8;">
        <li>✅ Ziua 1: Viziunea ta pentru 2026</li>
        <li>✅ Ziua 2: Principiile succesului</li>
        <li>✅ Ziua 3: Stack-ul de dimineață</li>
        <li>✅ Ziua 4: Disciplina mentală</li>
        <li>✅ Ziua 5: Optimizare fizică</li>
        <li>✅ Ziua 6: Relații de calitate</li>
        <li>✅ Ziua 7: Plan de acțiune complet</li>
      </ul>
    </div>
    
    <p><strong>100% GRATUIT</strong> • 7 zile • 15 min/zi</p>
    
    <div style="text-align: center; margin: 30px 0;">
      <a href="${BASE_URL}/challenge/1?utm_source=email&utm_medium=sequence&utm_campaign=life_score&utm_content=day2" style="display: inline-block; padding: 15px 40px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: #ffffff; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 16px;">Începe Challenge-ul GRATUIT →</a>
    </div>
    
    <p style="color: #888; font-size: 14px;">Mâine: Vei descoperi cum AI Coach-ul te poate ajuta să-ți atingi obiectivele mai rapid.</p>
  </div>
  <div style="padding: 20px 30px; text-align: center; color: #666; font-size: 12px; border-top: 1px solid rgba(255,255,255,0.1);">
    <p style="margin: 0;">© 2025 WarriorSOS. Toate drepturile rezervate.</p>
    <p style="margin: 5px 0 0 0;"><a href="${unsubscribeUrl}" style="color: #888;">Dezabonare</a></p>
  </div>
</div>
${trackingPixel}
</body>
</html>`
    },
    3: {
      subject: `${name}, Cum să îți folosești AI Coach-ul 🤖`,
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
      <ul style="margin: 0; padding-left: 20px; line-height: 1.8;">
        <li>🎯 <strong>Performance Coach</strong> - Productivitate maximă</li>
        <li>❤️ <strong>Relationship Coach</strong> - Relații mai bune</li>
        <li>🧠 <strong>Therapist Coach</strong> - Sănătate emoțională</li>
        <li>📊 <strong>Accountability Coach</strong> - Responsabilitate</li>
        <li>🧘 <strong>Meditation Guide</strong> - Meditații personalizate</li>
      </ul>
    </div>
    
    <p>Bazat pe planul tău de viață creat, AI-ul va personaliza fiecare recomandare pentru nevoile tale specifice.</p>
    
    <div style="text-align: center; margin: 30px 0;">
      <a href="${BASE_URL}/stacks?utm_source=email&utm_medium=sequence&utm_campaign=life_score&utm_content=day3" style="display: inline-block; padding: 15px 40px; background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%); color: #ffffff; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 16px;">Explorează AI Stacks →</a>
    </div>
    
    <p style="color: #888; font-size: 14px;">Mâine: Rutina de Dimineață care te transformă în campion.</p>
  </div>
  <div style="padding: 20px 30px; text-align: center; color: #666; font-size: 12px; border-top: 1px solid rgba(255,255,255,0.1);">
    <p style="margin: 0;">© 2025 WarriorSOS. Toate drepturile rezervate.</p>
    <p style="margin: 5px 0 0 0;"><a href="${unsubscribeUrl}" style="color: #888;">Dezabonare</a></p>
  </div>
</div>
${trackingPixel}
</body>
</html>`
    },
    4: {
      subject: `${name}, Rutina de Dimineață pentru Succes ☀️`,
      html: `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
<body style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #0f0f0f; color: #ffffff; margin: 0; padding: 20px;">
<div style="max-width: 600px; margin: 0 auto; background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%); border-radius: 16px; overflow: hidden;">
  <div style="background: linear-gradient(135deg, #22c55e 0%, #16a34a 100%); padding: 40px 30px; text-align: center;">
    <h1 style="margin: 0; font-size: 28px; color: #ffffff;">☀️ RUTINA CAMPIONILOR</h1>
    <p style="margin: 10px 0 0 0; color: rgba(255,255,255,0.9);">Prima oră definește ziua, ${name}</p>
  </div>
  <div style="padding: 30px;">
    <h2 style="color: #22c55e;">Salut ${name},</h2>
    <p>Studiile arată că primele 60 de minute ale zilei determină productivitatea și starea emoțională pentru restul zilei.</p>
    
    <div style="background: rgba(34, 197, 94, 0.1); padding: 20px; border-radius: 12px; margin: 20px 0;">
      <h3 style="margin: 0 0 15px 0; color: #22c55e;">Template Rutină (45 min):</h3>
      <ul style="margin: 0; padding-left: 20px; line-height: 1.8;">
        <li>🌅 5 min - Respirație și gratitudine</li>
        <li>🧘 10 min - Meditație ghidată</li>
        <li>📖 15 min - Citit sau învățat</li>
        <li>💪 10 min - Mișcare fizică</li>
        <li>📝 5 min - Planificare zi</li>
      </ul>
    </div>
    
    <p>Platforma noastră automatizează toți acești pași cu ghidare audio și tracking automat.</p>
    
    <div style="text-align: center; margin: 30px 0;">
      <a href="${BASE_URL}/champion-routine?utm_source=email&utm_medium=sequence&utm_campaign=life_score&utm_content=day4" style="display: inline-block; padding: 15px 40px; background: linear-gradient(135deg, #22c55e 0%, #16a34a 100%); color: #ffffff; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 16px;">Configurează Rutina Ta →</a>
    </div>
    
    <p style="color: #888; font-size: 14px;">Mâine: Sistemul Door pentru planificare săptămânală eficientă.</p>
  </div>
  <div style="padding: 20px 30px; text-align: center; color: #666; font-size: 12px; border-top: 1px solid rgba(255,255,255,0.1);">
    <p style="margin: 0;">© 2025 WarriorSOS. Toate drepturile rezervate.</p>
    <p style="margin: 5px 0 0 0;"><a href="${unsubscribeUrl}" style="color: #888;">Dezabonare</a></p>
  </div>
</div>
${trackingPixel}
</body>
</html>`
    },
    5: {
      subject: `${name}, Sistemul Door: Planificare Săptămânală 🚪`,
      html: `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
<body style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #0f0f0f; color: #ffffff; margin: 0; padding: 20px;">
<div style="max-width: 600px; margin: 0 auto; background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%); border-radius: 16px; overflow: hidden;">
  <div style="background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%); padding: 40px 30px; text-align: center;">
    <h1 style="margin: 0; font-size: 28px; color: #ffffff;">🚪 SISTEMUL DOOR</h1>
    <p style="margin: 10px 0 0 0; color: rgba(255,255,255,0.9);">Planificare Săptămânală, ${name}</p>
  </div>
  <div style="padding: 30px;">
    <h2 style="color: #f59e0b;">Salut ${name},</h2>
    <p>Planul tău anual de viață este pregătit. Acum e timpul să-l transformi în acțiuni concrete săptămânale.</p>
    
    <div style="background: rgba(245, 158, 11, 0.1); padding: 20px; border-radius: 12px; margin: 20px 0;">
      <h3 style="margin: 0 0 15px 0; color: #f59e0b;">Sistemul Door include:</h3>
      <ul style="margin: 0; padding-left: 20px; line-height: 1.8;">
        <li>📊 <strong>Misiuni Anuale</strong> - Obiective pe 12 luni</li>
        <li>🎯 <strong>Milestones 90 de zile</strong> - Checkpoint-uri trimestriale</li>
        <li>📅 <strong>Focus Lunar</strong> - Prioritatea lunii</li>
        <li>⚡ <strong>Acțiuni Săptămânale</strong> - Task-uri concrete</li>
        <li>✅ <strong>Review Săptămânal</strong> - Analiză progres</li>
      </ul>
    </div>
    
    <p>Planul tău de Life Score este deja integrat în Door. Doar trebuie să începi execuția!</p>
    
    <div style="text-align: center; margin: 30px 0;">
      <a href="${BASE_URL}/door?utm_source=email&utm_medium=sequence&utm_campaign=life_score&utm_content=day5" style="display: inline-block; padding: 15px 40px; background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%); color: #ffffff; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 16px;">Deschide Door →</a>
    </div>
    
    <p style="color: #888; font-size: 14px;">Mâine: Core 4 - Cele 4 activități zilnice pentru succes garantat.</p>
  </div>
  <div style="padding: 20px 30px; text-align: center; color: #666; font-size: 12px; border-top: 1px solid rgba(255,255,255,0.1);">
    <p style="margin: 0;">© 2025 WarriorSOS. Toate drepturile rezervate.</p>
    <p style="margin: 5px 0 0 0;"><a href="${unsubscribeUrl}" style="color: #888;">Dezabonare</a></p>
  </div>
</div>
${trackingPixel}
</body>
</html>`
    },
    6: {
      subject: `${name}, Core 4: Cele 4 Activități Zilnice 🎯`,
      html: `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
<body style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #0f0f0f; color: #ffffff; margin: 0; padding: 20px;">
<div style="max-width: 600px; margin: 0 auto; background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%); border-radius: 16px; overflow: hidden;">
  <div style="background: linear-gradient(135deg, #8b5cf6 0%, #6d28d9 100%); padding: 40px 30px; text-align: center;">
    <h1 style="margin: 0; font-size: 28px; color: #ffffff;">🎯 CORE 4</h1>
    <p style="margin: 10px 0 0 0; color: rgba(255,255,255,0.9);">4 Activități Zilnice, ${name}</p>
  </div>
  <div style="padding: 30px;">
    <h2 style="color: #8b5cf6;">Salut ${name},</h2>
    <p>Succesul nu vine din acțiuni mari ocazionale, ci din acțiuni mici făcute constant, zilnic.</p>
    
    <div style="background: rgba(139, 92, 246, 0.1); padding: 20px; border-radius: 12px; margin: 20px 0;">
      <h3 style="margin: 0 0 15px 0; color: #8b5cf6;">Cele 4 Core Activities:</h3>
      <div style="margin-bottom: 15px; padding: 12px; background: rgba(255,255,255,0.03); border-radius: 8px;">
        <p style="margin: 0; color: #fff;"><strong>1. 📖 Citește</strong> - 15 min dezvoltare personală</p>
      </div>
      <div style="margin-bottom: 15px; padding: 12px; background: rgba(255,255,255,0.03); border-radius: 8px;">
        <p style="margin: 0; color: #fff;"><strong>2. 💪 Mișcare</strong> - 30 min exercițiu fizic</p>
      </div>
      <div style="margin-bottom: 15px; padding: 12px; background: rgba(255,255,255,0.03); border-radius: 8px;">
        <p style="margin: 0; color: #fff;"><strong>3. 🧘 Reflecție</strong> - 10 min meditație/jurnal</p>
      </div>
      <div style="padding: 12px; background: rgba(255,255,255,0.03); border-radius: 8px;">
        <p style="margin: 0; color: #fff;"><strong>4. 🎯 Impact</strong> - 1 acțiune spre obiectiv</p>
      </div>
    </div>
    
    <p>Daily Flow te ghidează prin toate 4, cu tracking automat și celebrare la completare!</p>
    
    <div style="text-align: center; margin: 30px 0;">
      <a href="${BASE_URL}/daily-flow?utm_source=email&utm_medium=sequence&utm_campaign=life_score&utm_content=day6" style="display: inline-block; padding: 15px 40px; background: linear-gradient(135deg, #8b5cf6 0%, #6d28d9 100%); color: #ffffff; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 16px;">Începe Daily Flow →</a>
    </div>
    
    <p style="color: #888; font-size: 14px;">Mâine: Oferta specială finală - alege planul potrivit pentru tine!</p>
  </div>
  <div style="padding: 20px 30px; text-align: center; color: #666; font-size: 12px; border-top: 1px solid rgba(255,255,255,0.1);">
    <p style="margin: 0;">© 2025 WarriorSOS. Toate drepturile rezervate.</p>
    <p style="margin: 5px 0 0 0;"><a href="${unsubscribeUrl}" style="color: #888;">Dezabonare</a></p>
  </div>
</div>
${trackingPixel}
</body>
</html>`
    },
    7: {
      subject: `${name}, Oferta Specială + Accesul Tău Complet 🎁`,
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
    <p>În ultimele 7 zile ți-am arătat exact ce ai nevoie pentru a-ți transforma viața:</p>
    
    <div style="background: rgba(236, 72, 153, 0.1); padding: 20px; border-radius: 12px; margin: 20px 0;">
      <h3 style="margin: 0 0 15px 0; color: #ec4899;">Ce ai descoperit:</h3>
      <ul style="margin: 0; padding-left: 20px; line-height: 1.8;">
        <li>✅ Scorul tău de viață și zonele de îmbunătățit</li>
        <li>✅ Challenge-ul de 7 zile pentru transformare</li>
        <li>✅ AI Stacks pentru coaching personalizat</li>
        <li>✅ Rutina Campionilor de dimineață</li>
        <li>✅ Sistemul Door pentru planificare</li>
        <li>✅ Core 4 pentru consistență zilnică</li>
      </ul>
    </div>
    
    <div style="margin: 25px 0; padding: 20px; background: linear-gradient(135deg, rgba(236, 72, 153, 0.15), rgba(190, 24, 93, 0.15)); border-radius: 12px; border: 1px solid rgba(236, 72, 153, 0.3);">
      <h3 style="margin: 0 0 15px 0; text-align: center; color: #fff;">Alege Planul Potrivit:</h3>
      
      <div style="display: flex; gap: 15px; flex-wrap: wrap; justify-content: center;">
        <div style="flex: 1; min-width: 200px; padding: 20px; background: rgba(0,0,0,0.3); border-radius: 12px; text-align: center; border: 1px solid rgba(59, 130, 246, 0.5);">
          <p style="margin: 0; font-size: 14px; color: #888;">BASIC</p>
          <p style="margin: 5px 0; font-size: 28px; font-weight: bold; color: #3b82f6;">€9.90<span style="font-size: 14px; color: #888;">/lună</span></p>
          <p style="margin: 0; font-size: 12px; color: #888;">Acces complet platformă</p>
        </div>
        
        <div style="flex: 1; min-width: 200px; padding: 20px; background: rgba(0,0,0,0.3); border-radius: 12px; text-align: center; border: 2px solid #ec4899;">
          <p style="margin: 0; font-size: 14px; color: #ec4899;">PRO ⭐</p>
          <p style="margin: 5px 0; font-size: 28px; font-weight: bold; color: #ec4899;">€19.90<span style="font-size: 14px; color: #888;">/lună</span></p>
          <p style="margin: 0; font-size: 12px; color: #888;">+ AI nelimitat + suport prioritar</p>
        </div>
      </div>
    </div>
    
    <div style="text-align: center; margin: 30px 0;">
      <a href="${BASE_URL}/pricing?utm_source=email&utm_medium=sequence&utm_campaign=life_score&utm_content=day7" style="display: inline-block; padding: 18px 50px; background: linear-gradient(135deg, #ec4899 0%, #be185d 100%); color: #ffffff; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 18px; box-shadow: 0 8px 20px rgba(236, 72, 153, 0.4);">Alege Planul Tău →</a>
    </div>
    
    <p style="text-align: center; color: #888; font-size: 14px;">Planul tău de Life Score este gata și te așteaptă în platformă!</p>
  </div>
  <div style="padding: 20px 30px; text-align: center; color: #666; font-size: 12px; border-top: 1px solid rgba(255,255,255,0.1);">
    <p style="margin: 0;">© 2025 WarriorSOS. Toate drepturile rezervate.</p>
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

    // Get all subscribed life_score leads (vision_2026_quiz)
    const { data: leads, error: leadsError } = await supabase
      .from('email_leads')
      .select('id, email, name, created_at')
      .in('lead_magnet', ['vision_2026_quiz', 'life_score'])
      .eq('subscribed', true);

    if (leadsError) {
      throw new Error(`Error fetching leads: ${leadsError.message}`);
    }

    console.log(`Found ${leads?.length || 0} life_score leads`);

    const results: { email: string; day: number; status: string }[] = [];
    const now = new Date();

    for (const lead of (leads || [])) {
      const createdAt = new Date(lead.created_at);
      const daysSinceQuiz = Math.floor((now.getTime() - createdAt.getTime()) / (1000 * 60 * 60 * 24));
      
      // Determine which day email to send (2-7, day 1 is the immediate plan email)
      const dayNumber = daysSinceQuiz + 1;
      
      if (dayNumber < 2 || dayNumber > 7) {
        continue; // Skip if not in sequence range
      }

      // Check if email already sent for this day
      const { data: existingLog } = await supabase
        .from('email_sequence_log')
        .select('id')
        .eq('email', lead.email)
        .eq('sequence_type', 'life_score')
        .eq('day_number', dayNumber)
        .maybeSingle();

      if (existingLog) {
        console.log(`Email day ${dayNumber} already sent to ${lead.email}`);
        continue;
      }

      // Create tracking ID
      const trackingId = crypto.randomUUID();

      // Get email template
      const template = getEmailTemplate(
        dayNumber, 
        lead.name || 'Warrior', 
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
          from: "WarriorSOS <alin@eduforyou.co.uk>",
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
          sequence_type: 'life_score',
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
    console.error("Error in send-life-score-sequence:", error);
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
