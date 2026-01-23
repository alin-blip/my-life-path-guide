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
  emoji: string;
  color: string;
  tips: string[];
  tipsRo: string[];
}

const categoryInfo: Record<string, CategoryInfo> = {
  body: { 
    name: 'Body & Health', 
    nameRo: 'Corp & Sănătate', 
    emoji: '💪', 
    color: '#ef4444',
    tips: [
      'Start each morning with 10 minutes of stretching',
      'Drink 2L of water daily for optimal energy',
      'Add a 20-minute walk after meals'
    ],
    tipsRo: [
      'Începe fiecare dimineață cu 10 minute de stretching',
      'Bea 2L de apă zilnic pentru energie optimă',
      'Adaugă o plimbare de 20 minute după masă'
    ]
  },
  being: { 
    name: 'Spirit & Mindset', 
    nameRo: 'Spirit & Mindset', 
    emoji: '🧘', 
    color: '#8b5cf6',
    tips: [
      'Practice 5 minutes of guided meditation daily',
      'Evening journaling: 3 things you\'re grateful for',
      'Reduce social media time by 30 minutes'
    ],
    tipsRo: [
      'Practică 5 minute de meditație ghidată zilnic',
      'Journaling seara: 3 lucruri pentru care ești recunoscător',
      'Reduce timpul pe social media cu 30 minute'
    ]
  },
  balance: { 
    name: 'Relationships', 
    nameRo: 'Relații', 
    emoji: '❤️', 
    color: '#3b82f6',
    tips: [
      'Schedule a weekly date night',
      'Call someone you care about each week',
      'Put your phone away during dinner'
    ],
    tipsRo: [
      'Programează un date night săptămânal',
      'Sună pe cineva drag în fiecare săptămână',
      'Pune telefonul deoparte la cină'
    ]
  },
  business: { 
    name: 'Career & Business', 
    nameRo: 'Carieră & Business', 
    emoji: '🚀', 
    color: '#22c55e',
    tips: [
      'Define TOP 3 priorities every morning',
      'Block 2 hours of deep work without interruptions',
      'Review weekly objectives on Sunday evening'
    ],
    tipsRo: [
      'Definește TOP 3 priorități în fiecare dimineață',
      'Blochează 2 ore de deep work fără întreruperi',
      'Revizuiește obiectivele săptămânale duminică seara'
    ]
  },
  overall: { 
    name: 'Life Harmony', 
    nameRo: 'Armonia Vieții', 
    emoji: '⭐', 
    color: '#f59e0b',
    tips: [
      'Create a consistent morning ritual',
      'Measure your progress weekly',
      'Celebrate every small victory'
    ],
    tipsRo: [
      'Creează un ritual matinal consistent',
      'Măsoară-ți progresul săptămânal',
      'Celebrează fiecare victorie mică'
    ]
  },
};

function getLifeScoreLevel(score: number, maxScore: number = 20, isRo: boolean = true) {
  const percentage = (score / maxScore) * 100;
  
  if (percentage >= 80) {
    return {
      level: isRo ? 'Înfloritoare' : 'Thriving',
      color: '#22c55e',
      emoji: '🏆',
      description: isRo 
        ? 'Excelent! Viața ta este în echilibru și înflorire.'
        : 'Excellent! Your life is balanced and thriving.'
    };
  } else if (percentage >= 60) {
    return {
      level: isRo ? 'În Creștere' : 'Growing',
      color: '#3b82f6',
      emoji: '📈',
      description: isRo
        ? 'Bun! Ai o fundație solidă cu spațiu de îmbunătățire.'
        : 'Good! You have a solid foundation with room for improvement.'
    };
  } else if (percentage >= 40) {
    return {
      level: isRo ? 'În Dezvoltare' : 'Developing',
      color: '#f59e0b',
      emoji: '🌱',
      description: isRo
        ? 'Ești pe drum! Focusează-te pe zonele cheie pentru progres.'
        : 'You\'re on your way! Focus on key areas for progress.'
    };
  } else {
    return {
      level: isRo ? 'Necesită Atenție' : 'Needs Attention',
      color: '#ef4444',
      emoji: '⚡',
      description: isRo
        ? 'E momentul schimbării! Hai să construim împreună.'
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

    console.log('Sending life score results email to:', email, 'scores:', scores);

    if (!email || !scores) {
      throw new Error('Email and scores are required');
    }

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
    const isRo = language === 'ro';

    // Calculate total score
    const totalScore = scores.body + scores.being + scores.balance + scores.business + scores.overall;
    const maxScore = 20;
    const percentage = Math.round((totalScore / maxScore) * 100);
    const levelInfo = getLifeScoreLevel(totalScore, maxScore, isRo);
    const weakestCategory = getWeakestCategory(scores);
    const weakestInfo = categoryInfo[weakestCategory];

    // Get or create lead for tracking
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

    // Log email sequence
    await supabase.from('email_sequence_log').upsert({
      email,
      sequence_type: 'life_score',
      day_number: 1,
      sent_at: new Date().toISOString(),
    }, {
      onConflict: 'email,sequence_type,day_number'
    });

    // Create tracking ID
    const trackingId = crypto.randomUUID();
    const trackingPixel = `https://exsbnfmaadjyfblperas.supabase.co/functions/v1/track-email-open?t=${trackingId}`;
    const unsubscribeUrl = `https://warriorsos.com/unsubscribe?email=${encodeURIComponent(email)}&sequence=life_score`;
    const dashboardUrl = `https://warriorsos.com/dashboard?utm_source=email&utm_medium=results&utm_campaign=life_score`;

    // Build category cards HTML
    const categoryCardsHtml = Object.entries(scores).map(([category, score]) => {
      const info = categoryInfo[category];
      const catPercentage = Math.round((score / 4) * 100);
      const filledBars = Math.round(catPercentage / 10);
      const progressBar = '█'.repeat(filledBars) + '░'.repeat(10 - filledBars);
      
      return `
        <tr>
          <td style="padding: 12px 0; border-bottom: 1px solid rgba(255,255,255,0.05);">
            <table width="100%" cellpadding="0" cellspacing="0">
              <tr>
                <td width="40" style="font-size: 24px;">${info.emoji}</td>
                <td style="color: #fff; font-weight: 600;">${isRo ? info.nameRo : info.name}</td>
                <td width="60" style="text-align: right; color: ${info.color}; font-weight: 700;">${score}/4</td>
              </tr>
              <tr>
                <td colspan="3" style="padding-top: 5px;">
                  <span style="font-family: monospace; color: ${info.color}; font-size: 12px;">${progressBar}</span>
                  <span style="color: #888; font-size: 12px; margin-left: 10px;">${catPercentage}%</span>
                </td>
              </tr>
            </table>
          </td>
        </tr>
      `;
    }).join('');

    // Build tips HTML for weakest category
    const tips = isRo ? weakestInfo.tipsRo : weakestInfo.tips;
    const tipsHtml = tips.map(tip => `
      <div style="color: #ddd; font-size: 14px; padding: 8px 0 8px 20px; border-left: 2px solid ${weakestInfo.color}; margin-bottom: 8px;">
        ✓ ${tip}
      </div>
    `).join('');

    const emailHtml = `<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>${isRo ? 'Rezultatele Tale Life Score' : 'Your Life Score Results'}</title>
</head>
<body style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #0a0a0f; color: #ffffff; margin: 0; padding: 0;">

<!-- Tracking Pixel -->
<img src="${trackingPixel}" width="1" height="1" style="display:none;" alt="" />

<div style="max-width: 640px; margin: 0 auto; background: linear-gradient(180deg, #0f0f1a 0%, #1a1a2e 100%);">

<!-- Header -->
<div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px 30px; text-align: center;">
  <div style="font-size: 48px; margin-bottom: 10px;">⚡</div>
  <h1 style="margin: 0; font-size: 28px; font-weight: 800; color: #ffffff; text-transform: uppercase; letter-spacing: 2px;">
    LIFE SCORE 2026
  </h1>
  <p style="margin: 15px 0 0 0; font-size: 16px; color: rgba(255,255,255,0.9);">
    ${isRo ? `Rezultatele tale, ${name}!` : `Your results, ${name}!`}
  </p>
</div>

<!-- Main Score -->
<div style="padding: 40px 30px; text-align: center; background: rgba(102,126,234,0.1);">
  <div style="display: inline-block; width: 140px; height: 140px; border-radius: 50%; background: linear-gradient(135deg, ${levelInfo.color}33 0%, ${levelInfo.color}11 100%); border: 4px solid ${levelInfo.color}; position: relative;">
    <div style="position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); text-align: center;">
      <div style="font-size: 42px; font-weight: 800; color: #fff;">${totalScore}</div>
      <div style="font-size: 14px; color: #888;">/20</div>
    </div>
  </div>
  
  <div style="margin-top: 20px;">
    <span style="font-size: 32px; margin-right: 10px;">${levelInfo.emoji}</span>
    <span style="font-size: 24px; font-weight: 700; color: ${levelInfo.color}; text-transform: uppercase;">${levelInfo.level}</span>
  </div>
  
  <p style="margin: 15px 0 0 0; color: #aaa; font-size: 15px;">
    ${levelInfo.description}
  </p>
  
  <div style="margin-top: 15px; display: inline-block; padding: 8px 20px; background: ${levelInfo.color}22; border-radius: 20px; border: 1px solid ${levelInfo.color}44;">
    <span style="color: ${levelInfo.color}; font-weight: 600;">${percentage}%</span>
    <span style="color: #888; margin-left: 5px;">${isRo ? 'din potențial' : 'of potential'}</span>
  </div>
</div>

<!-- Category Breakdown -->
<div style="padding: 30px;">
  <h2 style="text-align: center; font-size: 18px; color: #fff; margin: 0 0 25px 0; text-transform: uppercase; letter-spacing: 1px;">
    ${isRo ? '📊 Detalii pe Categorii' : '📊 Category Breakdown'}
  </h2>
  
  <table width="100%" cellpadding="0" cellspacing="0">
    ${categoryCardsHtml}
  </table>
</div>

<!-- Focus Area -->
<div style="padding: 30px; background: linear-gradient(135deg, ${weakestInfo.color}22 0%, ${weakestInfo.color}11 100%); border-top: 2px solid ${weakestInfo.color}44;">
  <div style="text-align: center; margin-bottom: 20px;">
    <span style="font-size: 40px;">${weakestInfo.emoji}</span>
    <h2 style="margin: 10px 0 5px 0; font-size: 20px; color: #fff;">
      ${isRo ? '🎯 ZONA DE FOCUS' : '🎯 FOCUS AREA'}
    </h2>
    <p style="margin: 0; color: ${weakestInfo.color}; font-weight: 600; text-transform: uppercase;">
      ${isRo ? weakestInfo.nameRo : weakestInfo.name}
    </p>
    <p style="margin: 10px 0 0 0; color: #888; font-size: 13px;">
      ${isRo 
        ? 'Aceasta este categoria care necesită cea mai multă atenție. Iată 3 acțiuni concrete:'
        : 'This is the category that needs the most attention. Here are 3 concrete actions:'}
    </p>
  </div>
  
  ${tipsHtml}
</div>

<!-- CTA Section -->
<div style="padding: 50px 30px; text-align: center; background: linear-gradient(180deg, transparent 0%, rgba(102,126,234,0.15) 100%);">
  <div style="font-size: 40px; margin-bottom: 15px;">🚀</div>
  <h2 style="margin: 0 0 15px 0; font-size: 22px; color: #fff;">
    ${isRo ? 'Transformă Scorurile în Acțiune' : 'Transform Scores into Action'}
  </h2>
  <p style="margin: 0 0 30px 0; color: #aaa; font-size: 15px; line-height: 1.6;">
    ${isRo 
      ? 'Dashboard-ul tău personalizat te așteaptă cu planuri, trackere și ghidaj AI.'
      : 'Your personalized dashboard awaits with plans, trackers, and AI guidance.'}
  </p>
  
  <a href="${dashboardUrl}" style="display: inline-block; padding: 18px 50px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: #ffffff; text-decoration: none; border-radius: 12px; font-weight: 700; font-size: 18px; box-shadow: 0 10px 30px rgba(102,126,234,0.4);">
    ${isRo ? 'Accesează Dashboard →' : 'Access Dashboard →'}
  </a>
</div>

<!-- Footer -->
<div style="padding: 30px; text-align: center; border-top: 1px solid rgba(255,255,255,0.05);">
  <p style="margin: 0 0 15px 0; color: #666; font-size: 12px;">
    © 2025 WarriorSOS. ${isRo ? 'Toate drepturile rezervate.' : 'All rights reserved.'}
  </p>
  <p style="margin: 0; font-size: 11px;">
    <a href="${unsubscribeUrl}" style="color: #555; text-decoration: none;">${isRo ? 'Dezabonare' : 'Unsubscribe'}</a>
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
        subject: isRo 
          ? `${levelInfo.emoji} ${name}, scorul tău Life Score 2026: ${totalScore}/20`
          : `${levelInfo.emoji} ${name}, your Life Score 2026: ${totalScore}/20`,
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
