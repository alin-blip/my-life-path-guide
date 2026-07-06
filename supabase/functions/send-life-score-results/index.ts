import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.80.0";
import { authorizeUserOrRecentLead } from "../_shared/auth.ts";

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");
const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface LifeScoreResultsRequest {
  email: string;
  name: string;
  scores: {
    body: number;
    being: number;
    balance: number;
    business: number;
    overall: number;
  };
  language: 'en' | 'ro';
}

interface CategoryInfo {
  name: string;
  nameRo: string;
  tips: string[];
  tipsRo: string[];
}

const categoryInfo: Record<string, CategoryInfo> = {
  body: { 
    name: 'Body & Health', 
    nameRo: 'Corp & Sanatate',
    tips: [
      'Start each morning with 10 minutes of stretching',
      'Drink 2L of water daily for optimal energy',
      'Add a 20-minute walk after meals'
    ],
    tipsRo: [
      'Incepe fiecare dimineata cu 10 minute de stretching',
      'Bea 2L de apa zilnic pentru energie optima',
      'Adauga o plimbare de 20 minute dupa masa'
    ]
  },
  being: { 
    name: 'Spirit & Mindset', 
    nameRo: 'Spirit & Mindset',
    tips: [
      'Practice 5 minutes of guided meditation daily',
      'Evening journaling: 3 things you\'re grateful for',
      'Reduce social media time by 30 minutes'
    ],
    tipsRo: [
      'Practica 5 minute de meditatie ghidata zilnic',
      'Journaling seara: 3 lucruri pentru care esti recunoscator',
      'Reduce timpul pe social media cu 30 minute'
    ]
  },
  balance: { 
    name: 'Relationships', 
    nameRo: 'Relatii',
    tips: [
      'Schedule a weekly date night',
      'Call someone you care about each week',
      'Put your phone away during dinner'
    ],
    tipsRo: [
      'Programeaza un date night saptamanal',
      'Suna pe cineva drag in fiecare saptamana',
      'Pune telefonul deoparte la cina'
    ]
  },
  business: { 
    name: 'Career & Business', 
    nameRo: 'Cariera & Business',
    tips: [
      'Define TOP 3 priorities every morning',
      'Block 2 hours of deep work without interruptions',
      'Review weekly objectives on Sunday evening'
    ],
    tipsRo: [
      'Defineste TOP 3 prioritati in fiecare dimineata',
      'Blocheaza 2 ore de deep work fara intreruperi',
      'Revizuieste obiectivele saptamanale duminica seara'
    ]
  },
  overall: { 
    name: 'Life Harmony', 
    nameRo: 'Armonia Vietii',
    tips: [
      'Create a consistent morning ritual',
      'Measure your progress weekly',
      'Celebrate every small victory'
    ],
    tipsRo: [
      'Creeaza un ritual matinal consistent',
      'Masoara-ti progresul saptamanal',
      'Celebreaza fiecare victorie mica'
    ]
  },
};

function getLifeScoreLevel(score: number, maxScore: number = 20, isRo: boolean = true) {
  const percentage = (score / maxScore) * 100;
  
  if (percentage >= 80) {
    return {
      level: isRo ? 'Infloritoare' : 'Thriving',
      description: isRo 
        ? 'Excelent! Viata ta este in echilibru si inflorire.'
        : 'Excellent! Your life is balanced and thriving.'
    };
  } else if (percentage >= 60) {
    return {
      level: isRo ? 'In Crestere' : 'Growing',
      description: isRo
        ? 'Bun! Ai o fundatie solida cu spatiu de imbunatatire.'
        : 'Good! You have a solid foundation with room for improvement.'
    };
  } else if (percentage >= 40) {
    return {
      level: isRo ? 'In Dezvoltare' : 'Developing',
      description: isRo
        ? 'Esti pe drum! Focuseaza-te pe zonele cheie pentru progres.'
        : 'You\'re on your way! Focus on key areas for progress.'
    };
  } else {
    return {
      level: isRo ? 'Necesita Atentie' : 'Needs Attention',
      description: isRo
        ? 'E momentul schimbarii! Hai sa construim impreuna.'
        : 'Time for change! Let\'s build together.'
    };
  }
}

function getWeakestCategory(scores: Record<string, number>): string {
  let weakest = 'body';
  let minScore = scores.body;
  
  for (const [category, score] of Object.entries(scores)) {
    if (score < minScore) {
      minScore = score;
      weakest = category;
    }
  }
  
  return weakest;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    if (!RESEND_API_KEY) {
      throw new Error('RESEND_API_KEY is missing from backend configuration.');
    }
    if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
      throw new Error('Backend configuration incomplete.');
    }

    const body: LifeScoreResultsRequest = await req.json();
    const { email, name = 'Warrior', scores, language = 'ro' } = body;

    const authError = await authorizeUserOrRecentLead(req, email, 'life_score_quiz');
    if (authError) return authError;

    console.log('Sending life score results email to:', email, 'scores:', scores);

    if (!email || !scores) {
      throw new Error('Email and scores are required');
    }

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
    const isRo = language === 'ro';

    const totalScore = scores.body + scores.being + scores.balance + scores.business + scores.overall;
    const maxScore = 20;
    const percentage = Math.round((totalScore / maxScore) * 100);
    const levelInfo = getLifeScoreLevel(totalScore, maxScore, isRo);
    const weakestCategory = getWeakestCategory(scores);
    const weakestInfo = categoryInfo[weakestCategory];

    // Get or create lead
    const { data: existingLead } = await supabase
      .from('email_leads')
      .select('id')
      .eq('email', email)
      .eq('lead_magnet', 'life_score')
      .maybeSingle();

    if (!existingLead) {
      await supabase.from('email_leads').insert({
        email,
        name,
        lead_magnet: 'life_score',
        source: 'life_score_quiz',
      });
    }

    await supabase.from('email_sequence_log').upsert({
      email,
      sequence_type: 'life_score',
      day_number: 1,
      sent_at: new Date().toISOString(),
    }, {
      onConflict: 'email,sequence_type,day_number'
    });

    const trackingId = crypto.randomUUID();
    const trackingPixel = `https://exsbnfmaadjyfblperas.supabase.co/functions/v1/track-email-open?t=${trackingId}`;
     const unsubscribeUrl = `https://ceomindos.com/unsubscribe?email=${encodeURIComponent(email)}&sequence=life_score`;
     const dashboardUrl = `https://ceomindos.com/dashboard?utm_source=email&utm_medium=results&utm_campaign=life_score`;

    // Build category rows
    const categoryCardsHtml = Object.entries(scores).map(([category, score]) => {
      const info = categoryInfo[category];
      const catPercentage = Math.round((score / 4) * 100);
      const barWidth = Math.max(catPercentage, 5);
      
      return `
        <tr>
          <td style="padding: 10px 0; border-bottom: 1px solid #e5e7eb;">
            <table width="100%" cellpadding="0" cellspacing="0">
              <tr>
                <td style="color: #111827; font-weight: 600; font-size: 14px;">${isRo ? info.nameRo : info.name}</td>
                <td width="60" style="text-align: right; color: #111827; font-weight: 700; font-size: 14px;">${score}/4</td>
              </tr>
              <tr>
                <td colspan="2" style="padding-top: 6px;">
                  <div style="background-color: #e5e7eb; border-radius: 4px; height: 6px; overflow: hidden;">
                    <div style="background-color: #111827; height: 100%; width: ${barWidth}%; border-radius: 4px;"></div>
                  </div>
                </td>
              </tr>
            </table>
          </td>
        </tr>
      `;
    }).join('');

    // Build tips
    const tips = isRo ? weakestInfo.tipsRo : weakestInfo.tips;
    const tipsHtml = tips.map(tip => `
      <li style="color: #4b5563; font-size: 14px; margin-bottom: 6px;">${tip}</li>
    `).join('');

    const emailHtml = `<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>${isRo ? 'Rezultatele Tale Life Score' : 'Your Life Score Results'}</title>
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f7f7f8; color: #111827; margin: 0; padding: 0;">

<img src="${trackingPixel}" width="1" height="1" style="display:none;" alt="" />

<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color: #f7f7f8;">
  <tr>
    <td align="center" style="padding: 40px 20px;">
      <table role="presentation" width="600" cellpadding="0" cellspacing="0" style="max-width: 600px; background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 1px 3px rgba(0,0,0,0.08);">

        <!-- Header -->
        <tr>
          <td style="padding: 32px 32px 24px 32px; border-bottom: 1px solid #e5e7eb;">
            <p style="margin: 0 0 4px 0; font-size: 13px; font-weight: 600; color: #6b7280; text-transform: uppercase; letter-spacing: 0.5px;">CEO Mind OS</p>
            <h1 style="margin: 0; font-size: 24px; font-weight: 700; color: #111827;">
              Life Score 2026
            </h1>
            <p style="margin: 8px 0 0 0; font-size: 15px; color: #6b7280;">
              ${isRo ? `Rezultatele tale, ${name}.` : `Your results, ${name}.`}
            </p>
          </td>
        </tr>

        <!-- Main Score -->
        <tr>
          <td style="padding: 28px 32px; text-align: center;">
            <p style="margin: 0 0 4px 0; font-size: 48px; font-weight: 800; color: #111827;">${totalScore}<span style="font-size: 20px; color: #9ca3af;">/20</span></p>
            <p style="margin: 0 0 4px 0; font-size: 18px; font-weight: 700; color: #111827; text-transform: uppercase;">${levelInfo.level}</p>
            <p style="margin: 0; color: #6b7280; font-size: 14px;">${levelInfo.description}</p>
            <div style="margin-top: 12px; display: inline-block; padding: 6px 16px; background-color: #f3f4f6; border-radius: 20px;">
              <span style="color: #111827; font-weight: 600; font-size: 14px;">${percentage}%</span>
              <span style="color: #6b7280; font-size: 13px; margin-left: 4px;">${isRo ? 'din potential' : 'of potential'}</span>
            </div>
          </td>
        </tr>

        <!-- Category Breakdown -->
        <tr>
          <td style="padding: 0 32px 24px 32px;">
            <p style="color: #111827; font-size: 14px; font-weight: 600; margin: 0 0 12px 0; text-transform: uppercase; letter-spacing: 0.3px;">
              ${isRo ? 'Detalii pe Categorii' : 'Category Breakdown'}
            </p>
            <table width="100%" cellpadding="0" cellspacing="0">
              ${categoryCardsHtml}
            </table>
          </td>
        </tr>

        <!-- Focus Area -->
        <tr>
          <td style="padding: 24px 32px; background-color: #f9fafb; border-top: 1px solid #e5e7eb;">
            <p style="color: #111827; font-size: 14px; font-weight: 600; margin: 0 0 4px 0; text-transform: uppercase; letter-spacing: 0.3px;">
              ${isRo ? 'Zona de Focus' : 'Focus Area'}
            </p>
            <p style="color: #6b7280; font-size: 15px; font-weight: 600; margin: 0 0 12px 0;">
              ${isRo ? weakestInfo.nameRo : weakestInfo.name}
            </p>
            <p style="color: #6b7280; font-size: 13px; margin: 0 0 12px 0;">
              ${isRo 
                ? 'Aceasta este categoria care necesita cea mai multa atentie. 3 actiuni concrete:'
                : 'This category needs the most attention. 3 concrete actions:'}
            </p>
            <ul style="margin: 0; padding-left: 18px;">
              ${tipsHtml}
            </ul>
          </td>
        </tr>

        <!-- CTA -->
        <tr>
          <td style="padding: 28px 32px; text-align: center;">
            <p style="margin: 0 0 16px 0; color: #4b5563; font-size: 15px;">
              ${isRo ? 'Transforma scorurile in actiune.' : 'Transform scores into action.'}
            </p>
            <a href="${dashboardUrl}" style="display: inline-block; background-color: #111827; color: #ffffff; text-decoration: none; padding: 14px 40px; border-radius: 8px; font-size: 15px; font-weight: 600;">
              ${isRo ? 'Acceseaza Dashboard' : 'Access Dashboard'}
            </a>
          </td>
        </tr>

        <!-- Footer -->
        <tr>
          <td style="background-color: #f9fafb; padding: 20px 32px; text-align: center; border-top: 1px solid #e5e7eb;">
            <p style="color: #9ca3af; margin: 0 0 6px 0; font-size: 12px;">CEO Mind OS</p>
            <a href="${unsubscribeUrl}" style="color: #9ca3af; font-size: 11px; text-decoration: underline;">${isRo ? 'Dezabonare' : 'Unsubscribe'}</a>
          </td>
        </tr>

      </table>
    </td>
  </tr>
</table>
</body>
</html>`;

    const emailResponse = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: 'CEO Mind OS <noreply@ceomindos.com>',
        to: [email],
        subject: isRo 
          ? `${name}, scorul tau Life Score 2026: ${totalScore}/20`
          : `${name}, your Life Score 2026: ${totalScore}/20`,
        html: emailHtml,
      }),
    });

    if (!emailResponse.ok) {
      const errorText = await emailResponse.text();
      console.error('Resend API error:', errorText);
      throw new Error(`Resend API error: ${errorText}`);
    }

    const result = await emailResponse.json();
    console.log('Email sent successfully:', result);

    return new Response(
      JSON.stringify({ success: true, messageId: result.id }),
      {
        status: 200,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error);
    console.error("Error in send-life-score-results:", message);
    return new Response(
      JSON.stringify({ error: message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);
