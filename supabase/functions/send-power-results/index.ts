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
    const visionUrl = `https://warriorsos.com/vision-2026?utm_source=email&utm_medium=sequence&utm_campaign=warrior_power&utm_content=day1`;

    const emailHtml = `<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #ffffff; color: #1a1a1a; margin: 0; padding: 20px; line-height: 1.6;">
<img src="${trackingPixel}" width="1" height="1" style="display:none;" alt="" />
<div style="max-width: 600px; margin: 0 auto;">

<p>Salut ${name},</p>

<p>Iată rezultatele tale Warrior Power:</p>

<p><strong>Scor Total: ${totalScore}/96 (${percentage}%)</strong><br>
Nivel: ${overallLevel}</p>

<p>---</p>

<p><strong>Scoruri pe Dimensiuni:</strong></p>

${dimensions.map(dim => `<p><strong>${dim.emoji} ${dim.name}:</strong> ${dim.score}/${dim.maxScore} - ${dim.level}<br>
${dim.subScores.map(sub => `• ${sub.name}: ${sub.score}/12`).join('<br>')}</p>`).join('')}

<p>---</p>

<p><strong>Dimensiunea care necesită atenție:</strong> ${weakestDimension.name}</p>

<p><strong>3 Acțiuni Recomandate:</strong></p>
<ol>
${weakestDimension.tips.map(tip => `<li>${tip}</li>`).join('')}
</ol>

<p>---</p>

<p><strong>Pasul următor:</strong><br>
<a href="${visionUrl}" style="color: #0066cc;">Setează-ți Viziunea 2026 →</a></p>

<p>Mult succes!<br>
Echipa Warrior SOS</p>

<p style="color: #666666; font-size: 12px; margin-top: 40px; padding-top: 20px; border-top: 1px solid #eeeeee;">
Mâine primești: Secretul Transformării în 7 Zile<br><br>
<a href="${unsubscribeUrl}" style="color: #666666;">Dezabonare</a>
</p>

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
        from: 'Warrior Power <noreply@warriorsos.com>',
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
