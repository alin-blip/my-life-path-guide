import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.80.0";

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");
const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface PowerResultsRequest {
  email: string;
  name: string;
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
}

interface DimensionInfo {
  name: string;
  emoji: string;
  score: number;
  maxScore: number;
  subScores: { name: string; score: number }[];
  level: string;
  color: string;
  interpretation: string;
  tips: string[];
}

function getLevelName(score: number): string {
  if (score <= 3) return 'Adormit';
  if (score <= 6) return 'Treaz';
  if (score <= 9) return 'Activ';
  return 'Accelerat';
}

function getLevelColor(score: number): string {
  if (score <= 3) return '#ef4444';
  if (score <= 6) return '#eab308';
  if (score <= 9) return '#3b82f6';
  return '#22c55e';
}

function getDimensionLevel(score: number): { level: string; color: string } {
  if (score <= 6) return { level: 'Adormit', color: '#ef4444' };
  if (score <= 12) return { level: 'Treaz', color: '#eab308' };
  if (score <= 18) return { level: 'Activ', color: '#3b82f6' };
  return { level: 'Accelerat', color: '#22c55e' };
}

function getInterpretation(dimension: string, level: string): string {
  const interpretations: Record<string, Record<string, string>> = {
    body: {
      'Adormit': 'Corpul tău are nevoie urgentă de atenție. Energia scăzută îți afectează toate celelalte arii ale vieții. Este momentul să faci din sănătatea fizică o prioritate.',
      'Treaz': 'Ai început să conștientizezi importanța corpului, dar consistența lipsește. Cu mici ajustări zilnice, poți face progrese semnificative.',
      'Activ': 'Ai o fundație solidă pentru sănătatea fizică. Acum e momentul să optimizezi și să duci lucrurile la nivelul următor.',
      'Accelerat': 'Excelent! Corpul tău este un templu bine întreținut. Continuă să menții acest standard și inspiră-i pe alții.'
    },
    being: {
      'Adormit': 'Te-ai deconectat de la sinele tău interior. Anxietatea și incertitudinea îți domină zilele. E timpul să redescoperi cine ești cu adevărat.',
      'Treaz': 'Ai momente de claritate, dar emoțiile încă te controlează. Practica zilnică de mindfulness te poate transforma.',
      'Activ': 'Ai o conexiune bună cu sinele interior. Acum poți aprofunda această relație și accesa niveluri mai înalte de conștiință.',
      'Accelerat': 'Ai o conexiune profundă cu ființa ta. Această pace interioară se reflectă în tot ce faci.'
    },
    balance: {
      'Adormit': 'Relațiile tale suferă. Fie te-ai izolat, fie conflictele sunt frecvente. E momentul să reconstruiești punți și să investești în conexiuni autentice.',
      'Treaz': 'Ai relații funcționale, dar superficiale. Cu mai multă prezență și vulnerabilitate, poți crea conexiuni profunde.',
      'Activ': 'Relațiile tale sunt sănătoase și îți oferă suport. Continuă să investești timp de calitate cu cei dragi.',
      'Accelerat': 'Ai relații excepționale care te împuternicesc. Ești un lider în comunitatea ta și inspiri pe alții.'
    },
    business: {
      'Adormit': 'Afacerea sau cariera ta stagnează. Lipsa de claritate și acțiune te țin pe loc. E timpul pentru o strategie clară și execuție consistentă.',
      'Treaz': 'Ai potențial nevalorificat. Cu focus și disciplină, poți transforma ideile în rezultate tangibile.',
      'Activ': 'Afacerea ta merge bine, dar există loc pentru creștere exponențială. E momentul să gândești mai mare.',
      'Accelerat': 'Ești un lider în domeniul tău. Continuă să inovezi și să creezi impact la scară mare.'
    }
  };
  return interpretations[dimension]?.[level] || '';
}

function getTipsForDimension(dimension: string): string[] {
  const tips: Record<string, string[]> = {
    body: [
      '🏃 Începe fiecare zi cu 10 minute de mișcare - chiar și o plimbare rapidă contează',
      '💧 Bea 2L de apă zilnic - hidratarea îți crește energia cu 20%',
      '🥗 Adaugă o porție de legume la fiecare masă principală'
    ],
    being: [
      '🧘 Practică 5 minute de meditație dimineața - folosește ghidajul AI din aplicație',
      '📝 Scrie 3 lucruri pentru care ești recunoscător în fiecare seară',
      '🌅 Dedică 10 minute pentru reflecție și auto-observare zilnic'
    ],
    balance: [
      '💬 Inițiază o conversație semnificativă cu cineva drag în fiecare zi',
      '📱 Pune telefonul deoparte în timpul meselor cu familia',
      '❤️ Exprimă aprecierea pentru cei din jur - un simplu "mulțumesc" face diferența'
    ],
    business: [
      '🎯 Definește TOP 3 priorități în fiecare dimineață și focusează-te doar pe ele',
      '⏰ Blochează 2 ore de "deep work" fără întreruperi zilnic',
      '📊 Revizuiește-ți obiectivele săptămânale în fiecare duminică seara'
    ]
  };
  return tips[dimension] || [];
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    if (!RESEND_API_KEY) {
      throw new Error('RESEND_API_KEY lipsește din configurația backend.');
    }
    if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
      throw new Error('Config backend incompletă (SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY).');
    }

    const { email, name, scores }: PowerResultsRequest = await req.json();

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    // Calculate scores
    const totalScore = Object.values(scores).reduce((a, b) => a + b, 0);
    const percentage = Math.round((totalScore / 96) * 100);
    const overallLevel = getLevelName(Math.round(totalScore / 8));

    const dimensionScores = {
      body: scores.body_fitness + scores.body_nutrition,
      being: scores.being_connection + scores.being_certainty,
      balance: scores.balance_relationship + scores.balance_family,
      business: scores.business_mechanics + scores.business_money,
    };

    // Find weakest dimension
    const dimensions: DimensionInfo[] = [
      {
        name: 'CORPUL',
        emoji: '💪',
        score: dimensionScores.body,
        maxScore: 24,
        subScores: [
          { name: 'Fitness', score: scores.body_fitness },
          { name: 'Alimentație', score: scores.body_nutrition },
        ],
        ...getDimensionLevel(dimensionScores.body),
        interpretation: getInterpretation('body', getDimensionLevel(dimensionScores.body).level),
        tips: getTipsForDimension('body'),
      },
      {
        name: 'FIINȚA',
        emoji: '🧘',
        score: dimensionScores.being,
        maxScore: 24,
        subScores: [
          { name: 'Conexiune', score: scores.being_connection },
          { name: 'Certitudine', score: scores.being_certainty },
        ],
        ...getDimensionLevel(dimensionScores.being),
        interpretation: getInterpretation('being', getDimensionLevel(dimensionScores.being).level),
        tips: getTipsForDimension('being'),
      },
      {
        name: 'ECHILIBRU',
        emoji: '⚖️',
        score: dimensionScores.balance,
        maxScore: 24,
        subScores: [
          { name: 'Relații', score: scores.balance_relationship },
          { name: 'Familie', score: scores.balance_family },
        ],
        ...getDimensionLevel(dimensionScores.balance),
        interpretation: getInterpretation('balance', getDimensionLevel(dimensionScores.balance).level),
        tips: getTipsForDimension('balance'),
      },
      {
        name: 'BUSINESS',
        emoji: '💼',
        score: dimensionScores.business,
        maxScore: 24,
        subScores: [
          { name: 'Mecanică', score: scores.business_mechanics },
          { name: 'Bani', score: scores.business_money },
        ],
        ...getDimensionLevel(dimensionScores.business),
        interpretation: getInterpretation('business', getDimensionLevel(dimensionScores.business).level),
        tips: getTipsForDimension('business'),
      },
    ];

    // Sort to find weakest dimension
    const sortedDimensions = [...dimensions].sort((a, b) => a.score - b.score);
    const weakestDimension = sortedDimensions[0];

    // Get or create lead for tracking
    const { data: lead } = await supabase
      .from('email_leads')
      .select('id')
      .eq('email', email)
      .eq('lead_magnet', 'warrior_power')
      .single();

    // Create tracking ID
    const trackingId = crypto.randomUUID();

    // Log this as day 1 email
    if (lead) {
      await supabase.from('email_sequence_log').upsert(
        {
          lead_id: lead.id,
          email: email,
          sequence_type: 'warrior_power',
          day_number: 1,
          tracking_id: trackingId,
          sent_at: new Date().toISOString(),
        },
        { onConflict: 'lead_id,sequence_type,day_number' }
      );
    }

    const trackingPixel = `https://exsbnfmaadjyfblperas.supabase.co/functions/v1/track-email-open?t=${trackingId}`;
    const unsubscribeUrl = `https://warriorsos.com/unsubscribe?email=${encodeURIComponent(email)}&sequence=warrior_power`;
    const loginUrl = `https://warriorsos.com/auth?redirect=/fact-maps&utm_source=email&utm_medium=sequence&utm_campaign=warrior_power&utm_content=day1`;

    const emailHtml = `<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Rezultatele Tale Warrior Power</title>
</head>
<body style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #0a0a0f; color: #ffffff; margin: 0; padding: 0;">

<!-- Tracking Pixel -->
<img src="${trackingPixel}" width="1" height="1" style="display:none;" alt="" />

<div style="max-width: 640px; margin: 0 auto; background: linear-gradient(180deg, #0f0f1a 0%, #1a1a2e 100%);">

<!-- Header -->
<div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 50%, #f093fb 100%); padding: 50px 30px; text-align: center;">
  <div style="font-size: 48px; margin-bottom: 10px;">⚔️</div>
  <h1 style="margin: 0; font-size: 32px; font-weight: 800; color: #ffffff; text-transform: uppercase; letter-spacing: 2px;">WARRIOR POWER</h1>
  <p style="margin: 15px 0 0 0; font-size: 18px; color: rgba(255,255,255,0.9);">Rezultatele Tale Complete, ${name}!</p>
</div>

<!-- Main Score Section -->
<div style="padding: 50px 30px; text-align: center; background: radial-gradient(circle at center, rgba(102,126,234,0.1) 0%, transparent 70%);">
  <div style="display: inline-block; position: relative;">
    <div style="width: 160px; height: 160px; border-radius: 50%; background: linear-gradient(135deg, ${getLevelColor(Math.round(totalScore / 8))}22, ${getLevelColor(Math.round(totalScore / 8))}11); border: 5px solid ${getLevelColor(Math.round(totalScore / 8))}; display: flex; align-items: center; justify-content: center; margin: 0 auto;">
      <div style="text-align: center;">
        <div style="font-size: 56px; font-weight: 800; color: ${getLevelColor(Math.round(totalScore / 8))}; line-height: 1;">${totalScore}</div>
        <div style="font-size: 14px; color: #888; margin-top: 5px;">din 96</div>
      </div>
    </div>
  </div>
  
  <div style="margin-top: 25px;">
    <div style="display: inline-block; padding: 8px 24px; background: ${getLevelColor(Math.round(totalScore / 8))}22; border: 1px solid ${getLevelColor(Math.round(totalScore / 8))}44; border-radius: 30px;">
      <span style="color: ${getLevelColor(Math.round(totalScore / 8))}; font-weight: 700; font-size: 18px;">${overallLevel.toUpperCase()}</span>
    </div>
  </div>
  
  <p style="margin: 20px 0 0 0; color: #888; font-size: 16px;">
    Ai atins <strong style="color: #fff;">${percentage}%</strong> din potențialul tău total
  </p>
</div>

<!-- Dimension Cards -->
<div style="padding: 0 20px 30px 20px;">
  <h2 style="text-align: center; font-size: 20px; color: #fff; margin-bottom: 25px;">📊 Analiza Detaliată pe Dimensiuni</h2>
  
  ${dimensions.map(dim => `
  <div style="margin-bottom: 20px; padding: 25px; background: linear-gradient(135deg, rgba(255,255,255,0.05) 0%, rgba(255,255,255,0.02) 100%); border-radius: 16px; border: 1px solid rgba(255,255,255,0.08);">
    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 15px;">
      <div>
        <span style="font-size: 24px; margin-right: 10px;">${dim.emoji}</span>
        <span style="font-weight: 700; font-size: 18px; color: #fff;">${dim.name}</span>
      </div>
      <div style="text-align: right;">
        <span style="font-size: 24px; font-weight: 800; color: ${dim.color};">${dim.score}</span>
        <span style="color: #666; font-size: 14px;">/${dim.maxScore}</span>
      </div>
    </div>
    
    <!-- Progress Bar -->
    <div style="height: 8px; background: rgba(255,255,255,0.1); border-radius: 4px; margin-bottom: 15px; overflow: hidden;">
      <div style="height: 100%; width: ${Math.round((dim.score / dim.maxScore) * 100)}%; background: linear-gradient(90deg, ${dim.color}, ${dim.color}aa); border-radius: 4px;"></div>
    </div>
    
    <!-- Sub-scores -->
    <div style="display: flex; gap: 15px; margin-bottom: 15px;">
      ${dim.subScores.map(sub => `
      <div style="flex: 1; padding: 10px; background: rgba(0,0,0,0.3); border-radius: 8px; text-align: center;">
        <div style="font-size: 12px; color: #888; margin-bottom: 5px;">${sub.name}</div>
        <div style="font-size: 18px; font-weight: 700; color: #fff;">${sub.score}<span style="color: #666; font-size: 12px;">/12</span></div>
      </div>
      `).join('')}
    </div>
    
    <!-- Level Badge -->
    <div style="margin-bottom: 12px;">
      <span style="display: inline-block; padding: 4px 12px; background: ${dim.color}22; border: 1px solid ${dim.color}44; border-radius: 15px; color: ${dim.color}; font-size: 12px; font-weight: 600;">
        Nivel: ${dim.level}
      </span>
    </div>
    
    <!-- Interpretation -->
    <p style="margin: 0; color: #aaa; font-size: 14px; line-height: 1.6;">${dim.interpretation}</p>
  </div>
  `).join('')}
</div>

<!-- Personalized Tips Section -->
<div style="padding: 30px; background: linear-gradient(135deg, ${weakestDimension.color}11 0%, transparent 100%); border-top: 1px solid ${weakestDimension.color}33;">
  <h2 style="text-align: center; font-size: 20px; color: #fff; margin: 0 0 10px 0;">🎯 3 Acțiuni Prioritare</h2>
  <p style="text-align: center; color: #888; font-size: 14px; margin: 0 0 25px 0;">
    Bazate pe dimensiunea ta cea mai slabă: <strong style="color: ${weakestDimension.color};">${weakestDimension.name}</strong>
  </p>
  
  ${weakestDimension.tips.map((tip, index) => `
  <div style="display: flex; gap: 15px; margin-bottom: 15px; padding: 15px; background: rgba(255,255,255,0.03); border-radius: 12px; border-left: 3px solid ${weakestDimension.color};">
    <div style="flex-shrink: 0; width: 28px; height: 28px; background: ${weakestDimension.color}22; border-radius: 50%; display: flex; align-items: center; justify-content: center; color: ${weakestDimension.color}; font-weight: 700; font-size: 14px;">${index + 1}</div>
    <p style="margin: 0; color: #ddd; font-size: 14px; line-height: 1.6;">${tip}</p>
  </div>
  `).join('')}
</div>

<!-- CTA Section -->
<div style="padding: 50px 30px; text-align: center; background: linear-gradient(180deg, transparent 0%, rgba(102,126,234,0.15) 100%);">
  <div style="font-size: 40px; margin-bottom: 15px;">🚀</div>
  <h2 style="margin: 0 0 15px 0; font-size: 26px; color: #fff;">Începe Transformarea!</h2>
  <p style="margin: 0 0 30px 0; color: #aaa; font-size: 16px; line-height: 1.6; max-width: 400px; margin-left: auto; margin-right: auto;">
    Acum că știi exact unde te afli, e timpul să începi transformarea! Accesează <strong style="color: #fff;">Reality Map</strong> pentru coaching personalizat pe fiecare dimensiune.
  </p>
  
  <a href="${loginUrl}" style="display: inline-block; padding: 18px 50px; background: linear-gradient(135deg, #22c55e 0%, #16a34a 100%); color: #ffffff; text-decoration: none; border-radius: 12px; font-weight: 700; font-size: 18px; box-shadow: 0 10px 30px rgba(34,197,94,0.4);">
    Accesează Reality Map →
  </a>
  
  <p style="margin: 25px 0 0 0; color: #666; font-size: 13px;">
    Contul tău te așteaptă cu planul personalizat
  </p>
</div>

<!-- Next Email Teaser -->
<div style="padding: 25px 30px; background: rgba(255,255,255,0.02); border-top: 1px solid rgba(255,255,255,0.05); text-align: center;">
  <p style="margin: 0; color: #888; font-size: 14px;">
    📬 <strong style="color: #aaa;">Mâine primești:</strong> Secretul Transformării în 7 Zile
  </p>
</div>

<!-- Footer -->
<div style="padding: 30px; text-align: center; border-top: 1px solid rgba(255,255,255,0.05);">
  <p style="margin: 0 0 15px 0; color: #666; font-size: 12px;">
    © 2025 Warrior Power. Toate drepturile rezervate.
  </p>
  <p style="margin: 0; font-size: 11px;">
    <a href="${unsubscribeUrl}" style="color: #555; text-decoration: none;">Dezabonare</a>
  </p>
</div>

</div>
</body>
</html>`;

    const emailResponse = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: 'WarriorSOS <alin@warriorsos.com>',
        to: [email],
        subject: `${name}, Rezultatele Tale Warrior Power - Scor: ${totalScore}/96 (${percentage}%)`,
        html: emailHtml,
      }),
    });

    const emailData = await emailResponse.json().catch(() => ({}));

    if (!emailResponse.ok) {
      console.error('Resend error response:', { status: emailResponse.status, emailData });
      throw new Error(
        (emailData as any)?.message ?? (emailData as any)?.error ?? `Eroare la trimiterea emailului (status ${emailResponse.status}).`
      );
    }

    console.log('Email sent successfully:', emailData);

    return new Response(JSON.stringify({ success: true, emailId: (emailData as any).id }), {
      status: 200,
      headers: { 'Content-Type': 'application/json', ...corsHeaders },
    });
  } catch (error: any) {
    console.error("Error in send-power-results function:", error);
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
