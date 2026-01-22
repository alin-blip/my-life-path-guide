import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.2";

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");

async function sendEmail(to: string, subject: string, html: string) {
  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${RESEND_API_KEY}`,
    },
    body: JSON.stringify({
      from: "MyLifePathGuide <noreply@my-life-path-guide.lovable.app>",
      to: [to],
      subject,
      html,
    }),
  });
  if (!res.ok) {
    throw new Error(`Failed to send email: ${await res.text()}`);
  }
  return res.json();
}

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Nurture templates based on lead magnet
const nurtureTemplates: Record<string, Record<number, { subject: string; html: (name: string) => string }>> = {
  vision_2026_quiz: {
    3: {
      subject: "🎯 Ai uitat de viziunea ta pentru 2026?",
      html: (name: string) => `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h1 style="color: #1a1a1a;">Salut ${name || 'Warrior'}!</h1>
          <p>Ai completat quiz-ul Vision 2026 și ai primit rezultate valoroase despre unde te afli acum.</p>
          <p>Dar... <strong>ce ai făcut cu ele?</strong></p>
          <p>Studiile arată că 92% dintre oameni renunță la obiective în primele 2 săptămâni. Nu pentru că nu vor, ci pentru că nu au un sistem.</p>
          <h2 style="color: #7c3aed;">Ce poți face azi:</h2>
          <ol>
            <li>Revizuiește rezultatele quiz-ului</li>
            <li>Alege UN singur obiectiv pe care să te concentrezi</li>
            <li>Folosește metoda STACK pentru a-l transforma în rutină zilnică</li>
          </ol>
          <a href="https://my-life-path-guide.lovable.app/vision-2026" 
             style="display: inline-block; background: #7c3aed; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; margin-top: 20px;">
            Revizuiește Rezultatele →
          </a>
          <p style="margin-top: 30px; color: #666;">
            Cu încredere în tine,<br>
            Echipa MyLifePathGuide
          </p>
        </div>
      `
    },
    5: {
      subject: "📋 3 Pași pentru a-ți transforma viziunea în realitate",
      html: (name: string) => `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h1 style="color: #1a1a1a;">Salut ${name || 'Warrior'}!</h1>
          <p>Știu că viața e ocupată. Dar asta nu înseamnă că visurile tale trebuie să aștepte.</p>
          <h2 style="color: #7c3aed;">3 Pași Simpli pentru Azi:</h2>
          <div style="background: #f5f3ff; padding: 20px; border-radius: 12px; margin: 20px 0;">
            <p><strong>1. Dimineața (5 min)</strong><br>
            Citește-ți declarația de viziune cu voce tare</p>
            <p><strong>2. În timpul zilei (10 min)</strong><br>
            Fă o acțiune mică spre obiectivul tău principal</p>
            <p><strong>3. Seara (5 min)</strong><br>
            Notează ce ai învățat azi</p>
          </div>
          <p>Acești 20 de minute îți pot schimba complet direcția în viață.</p>
          <a href="https://my-life-path-guide.lovable.app/challenge" 
             style="display: inline-block; background: #7c3aed; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; margin-top: 20px;">
            Începe Challenge-ul de 7 Zile →
          </a>
        </div>
      `
    },
    7: {
      subject: "🎁 Ultima șansă: 3 zile Trial Gratuit",
      html: (name: string) => `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h1 style="color: #1a1a1a;">${name || 'Warrior'}, nu mai amâna!</h1>
          <p>Am observat că nu ai activat încă accesul complet la platformă.</p>
          <p>Înțeleg - e greu să faci primul pas. De aceea îți ofer:</p>
          <div style="background: linear-gradient(135deg, #7c3aed, #a78bfa); color: white; padding: 30px; border-radius: 16px; text-align: center; margin: 20px 0;">
            <h2 style="margin: 0;">3 ZILE TRIAL GRATUIT</h2>
            <p style="margin: 10px 0 0;">Acces complet. Fără obligații. Card salvat, anulezi oricând.</p>
          </div>
          <p>Ce primești:</p>
          <ul>
            <li>✓ AI Coach personal 24/7</li>
            <li>✓ Rutina Champion structurată</li>
            <li>✓ Challenge de 7 zile</li>
            <li>✓ Comunitate de suport</li>
          </ul>
          <a href="https://my-life-path-guide.lovable.app/pricing" 
             style="display: inline-block; background: #7c3aed; color: white; padding: 16px 32px; text-decoration: none; border-radius: 8px; margin-top: 20px; font-weight: bold;">
            Activează Trial Gratuit →
          </a>
          <p style="margin-top: 30px; font-size: 12px; color: #666;">
            Oferta expiră în 24 ore.
          </p>
        </div>
      `
    }
  },
  warrior_power: {
    3: {
      subject: "💪 Ai descoperit Warrior Power Score-ul tău - ce urmează?",
      html: (name: string) => `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h1>Salut ${name || 'Warrior'}!</h1>
          <p>Ai făcut primul pas și ți-ai măsurat Warrior Power Score-ul.</p>
          <p>Dar un scor fără acțiune e doar un număr.</p>
          <p>Hai să-l transformăm în putere reală:</p>
          <a href="https://my-life-path-guide.lovable.app/warrior-power" 
             style="display: inline-block; background: #dc2626; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px;">
            Vezi Rezultatele Complete →
          </a>
        </div>
      `
    },
    5: {
      subject: "🔥 Cum să-ți crești Warrior Power cu 20% în 7 zile",
      html: (name: string) => `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h1>Metoda STACK, ${name || 'Warrior'}</h1>
          <p>Cea mai rapidă metodă de a-ți crește puterea interioară:</p>
          <ol>
            <li><strong>S</strong>tart - 5 min meditație/respirație</li>
            <li><strong>T</strong>ransform - transformă emoția în energie</li>
            <li><strong>A</strong>ct - o acțiune concretă</li>
            <li><strong>C</strong>ommit - angajament față de tine</li>
            <li><strong>K</strong>eep - menține consistența</li>
          </ol>
          <a href="https://my-life-path-guide.lovable.app/stack" 
             style="display: inline-block; background: #dc2626; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px;">
            Începe Prima Sesiune STACK →
          </a>
        </div>
      `
    },
    7: {
      subject: "⚔️ Upgrade: Devino un Warrior Complet",
      html: (name: string) => `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h1>${name || 'Warrior'}, e timpul să faci upgrade!</h1>
          <p>Ai văzut doar 10% din ce poate face platforma pentru tine.</p>
          <p>Cu acces complet primești:</p>
          <ul>
            <li>AI Coach care te cunoaște și te ghidează</li>
            <li>Rutina Champion personalizată</li>
            <li>Tracking zilnic al progresului</li>
            <li>Comunitate de Warriors</li>
          </ul>
          <a href="https://my-life-path-guide.lovable.app/pricing" 
             style="display: inline-block; background: #dc2626; color: white; padding: 16px 32px; text-decoration: none; border-radius: 8px; font-weight: bold;">
            3 Zile Trial Gratuit →
          </a>
        </div>
      `
    }
  },
  life_score: {
    3: {
      subject: "📊 Interpretarea completă a Life Score-ului tău",
      html: (name: string) => `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h1>Salut ${name || 'Warrior'}!</h1>
          <p>Ai completat Life Score Assessment și ai o imagine clară a situației tale actuale.</p>
          <p>Dar știi ce înseamnă cu adevărat fiecare scor?</p>
          <a href="https://my-life-path-guide.lovable.app/life-score" 
             style="display: inline-block; background: #22c55e; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px;">
            Vezi Interpretarea Completă →
          </a>
        </div>
      `
    },
    5: {
      subject: "🎯 3 Acțiuni pentru a-ți îmbunătăți viața ACUM",
      html: (name: string) => `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h1>${name || 'Warrior'}, acțiune!</h1>
          <p>Pe baza scorurilor tale, iată 3 acțiuni pe care le poți face ACUM:</p>
          <div style="background: #f0fdf4; padding: 20px; border-radius: 12px;">
            <p><strong>1. Zona cea mai slabă</strong> - dedică 15 min/zi acestei zone</p>
            <p><strong>2. Zona cea mai puternică</strong> - folosește-o ca fundament</p>
            <p><strong>3. Echilibru</strong> - conectează cele două zone</p>
          </div>
          <a href="https://my-life-path-guide.lovable.app/champion-routine" 
             style="display: inline-block; background: #22c55e; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px;">
            Creează-ți Rutina Personalizată →
          </a>
        </div>
      `
    },
    7: {
      subject: "🚀 Trial Gratuit: Transformă scorurile în rezultate",
      html: (name: string) => `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h1>${name || 'Warrior'}, e momentul!</h1>
          <p>Ai datele. Ai direcția. Tot ce-ți lipsește e sistemul.</p>
          <p>Cu platforma noastră primești exact asta - un sistem care funcționează.</p>
          <a href="https://my-life-path-guide.lovable.app/pricing" 
             style="display: inline-block; background: #22c55e; color: white; padding: 16px 32px; text-decoration: none; border-radius: 8px; font-weight: bold;">
            Începe 3 Zile Gratuit →
          </a>
        </div>
      `
    }
  }
};

// Default template for unknown lead magnets
const defaultTemplate: Record<number, { subject: string; html: (name: string) => string }> = {
  3: {
    subject: "👋 Nu te-am mai văzut pe aici...",
    html: (name: string) => `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <h1>Salut ${name || 'Warrior'}!</h1>
        <p>Am observat că nu ai mai revenit pe platformă.</p>
        <p>Suntem aici să te ajutăm să-ți atingi potențialul maxim.</p>
        <a href="https://my-life-path-guide.lovable.app" 
           style="display: inline-block; background: #7c3aed; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px;">
          Revino pe Platformă →
        </a>
      </div>
    `
  },
  5: {
    subject: "🎯 Ai nevoie de ajutor?",
    html: (name: string) => `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <h1>${name || 'Warrior'}, sunt aici pentru tine!</h1>
        <p>Dacă ai întrebări sau nelămuriri, răspunde la acest email.</p>
        <p>Sau explorează resursele noastre gratuite:</p>
        <a href="https://my-life-path-guide.lovable.app/challenge" 
           style="display: inline-block; background: #7c3aed; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px;">
          Challenge Gratuit de 7 Zile →
        </a>
      </div>
    `
  },
  7: {
    subject: "🎁 Ofertă specială pentru tine",
    html: (name: string) => `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <h1>Ultima șansă, ${name || 'Warrior'}!</h1>
        <p>Îți oferim 3 zile gratuite de acces complet.</p>
        <a href="https://my-life-path-guide.lovable.app/pricing" 
           style="display: inline-block; background: #7c3aed; color: white; padding: 16px 32px; text-decoration: none; border-radius: 8px; font-weight: bold;">
          Activează Trial Gratuit →
        </a>
      </div>
    `
  }
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    console.log("Starting nurture sequence send...");

    // Get unconverted leads (funnel_stage = 'lead', captured > 3 days ago)
    const threeDaysAgo = new Date();
    threeDaysAgo.setDate(threeDaysAgo.getDate() - 3);

    const { data: unconvertedLeads, error: leadsError } = await supabase
      .from("crm_contact_profiles")
      .select("*")
      .eq("funnel_stage", "lead")
      .lt("lead_captured_at", threeDaysAgo.toISOString());

    if (leadsError) {
      console.error("Error fetching leads:", leadsError);
      throw leadsError;
    }

    console.log(`Found ${unconvertedLeads?.length || 0} unconverted leads`);

    const results: { email: string; day: number; success: boolean; error?: string }[] = [];

    for (const lead of unconvertedLeads || []) {
      // Calculate days since lead captured
      const leadDate = new Date(lead.lead_captured_at);
      const daysSinceLead = Math.floor(
        (Date.now() - leadDate.getTime()) / (1000 * 60 * 60 * 24)
      );

      // Check which emails have already been sent
      const { data: sentEmails } = await supabase
        .from("email_sequence_log")
        .select("day_number")
        .eq("email", lead.email)
        .eq("sequence_type", "nurture");

      const sentDays = new Set(sentEmails?.map(e => e.day_number) || []);

      // Determine which email to send (day 3, 5, or 7)
      const emailDays = [3, 5, 7];
      const nextEmailDay = emailDays.find(d => 
        daysSinceLead >= d && !sentDays.has(d)
      );

      if (!nextEmailDay) {
        continue; // No email to send for this lead
      }

      // Get template based on lead source
      const leadSource = lead.lead_source || 'unknown';
      const templates = nurtureTemplates[leadSource] || defaultTemplate;
      const template = templates[nextEmailDay] || defaultTemplate[nextEmailDay];

      if (!template) {
        continue;
      }

      try {
        // Send email
        await sendEmail(
          lead.email,
          template.subject,
          template.html(lead.name || '')
        );

        // Log the sent email
        await supabase.from("email_sequence_log").insert({
          email: lead.email,
          day_number: nextEmailDay,
          sequence_type: "nurture",
          sent_at: new Date().toISOString()
        });

        results.push({ email: lead.email, day: nextEmailDay, success: true });
        console.log(`Sent day ${nextEmailDay} nurture email to ${lead.email}`);
      } catch (emailError) {
        console.error(`Error sending to ${lead.email}:`, emailError);
        results.push({ 
          email: lead.email, 
          day: nextEmailDay, 
          success: false, 
          error: emailError instanceof Error ? emailError.message : 'Unknown error'
        });
      }
    }

    const sent = results.filter(r => r.success).length;
    const failed = results.filter(r => !r.success).length;

    console.log(`Nurture sequence complete: ${sent} sent, ${failed} failed`);

    return new Response(
      JSON.stringify({ 
        success: true, 
        sent, 
        failed,
        results 
      }),
      { 
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200 
      }
    );

  } catch (error) {
    console.error("Error in send-nurture-sequence:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { 
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500 
      }
    );
  }
});
