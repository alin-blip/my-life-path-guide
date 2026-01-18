import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.80.0";

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");
const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface VisionPlanRequest {
  email: string;
  name: string;
  language: 'en' | 'ro';
  scores: {
    body: number;
    being: number;
    balance: number;
    business: number;
  };
  goals: {
    body?: string;
    being?: string;
    balance?: string;
    business?: string;
  };
}

const categoryInfo = {
  body: { nameEn: 'Body', nameRo: 'Corp', emoji: '💪', color: '#22c55e' },
  being: { nameEn: 'Spirit', nameRo: 'Spirit', emoji: '🧘', color: '#8b5cf6' },
  balance: { nameEn: 'Balance', nameRo: 'Relații', emoji: '❤️', color: '#f43f5e' },
  business: { nameEn: 'Business', nameRo: 'Business', emoji: '💼', color: '#3b82f6' },
};

const getActionSteps = (category: string, language: 'en' | 'ro'): string[] => {
  const steps: Record<string, { en: string[]; ro: string[] }> = {
    body: {
      en: ['Start with 20 minutes of morning movement', 'Set a consistent sleep schedule', 'Track your energy for 2 weeks'],
      ro: ['Începe cu 20 minute de mișcare dimineața', 'Setează un program de somn consistent', 'Urmărește energia ta 2 săptămâni'],
    },
    being: {
      en: ['Begin a 10-minute morning meditation', 'Write 3 gratitude items daily', 'Practice box breathing when stressed'],
      ro: ['Începe cu 10 minute de meditație dimineața', 'Scrie 3 lucruri de recunoștință zilnic', 'Practică respirația box când ești stresat'],
    },
    balance: {
      en: ['Schedule 2 hours phone-free with family weekly', 'Reach out to one old friend this week', 'Plan a meaningful conversation'],
      ro: ['Programează 2 ore fără telefon cu familia săptămânal', 'Contactează un prieten vechi săptămâna aceasta', 'Planifică o conversație semnificativă'],
    },
    business: {
      en: ['Plan your week every Sunday with top 3 priorities', 'Identify your 20% that generates 80%', 'Block 2 hours for deep work daily'],
      ro: ['Planifică săptămâna duminica cu top 3 priorități', 'Identifică 20% care generează 80%', 'Blochează 2 ore pentru muncă profundă zilnic'],
    },
  };
  return steps[category]?.[language] || [];
};

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    if (!RESEND_API_KEY) {
      throw new Error('RESEND_API_KEY missing');
    }
    if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
      throw new Error('Supabase config incomplete');
    }

    const body: VisionPlanRequest = await req.json();
    const { email, name, language, scores, goals } = body;

    console.log('Sending vision plan email to:', email, 'with goals:', goals);

    if (!email) {
      throw new Error('Email is required');
    }

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
    const lang = language === 'en' ? 'en' : 'ro';

    // Create tracking ID
    const trackingId = crypto.randomUUID();

    // Log email send
    const { data: lead } = await supabase
      .from('email_leads')
      .select('id')
      .eq('email', email)
      .eq('lead_magnet', 'vision_2026_quiz')
      .maybeSingle();

    if (lead) {
      await supabase.from('email_sequence_log').upsert(
        {
          lead_id: lead.id,
          email: email,
          sequence_type: 'vision_2026_plan',
          day_number: 1,
          tracking_id: trackingId,
          sent_at: new Date().toISOString(),
        },
        { onConflict: 'lead_id,sequence_type,day_number' }
      );
    }

    const trackingPixel = `https://exsbnfmaadjyfblperas.supabase.co/functions/v1/track-email-open?t=${trackingId}`;
    const unsubscribeUrl = `https://warriorsos.com/unsubscribe?email=${encodeURIComponent(email)}&sequence=vision_2026`;
    const dashboardUrl = `https://warriorsos.com/door?tab=annual&utm_source=email&utm_medium=sequence&utm_campaign=vision_2026_plan`;
    const trialUrl = `https://warriorsos.com/auth?redirect=/door&plan=trial&utm_source=email&utm_medium=sequence&utm_campaign=vision_2026_plan`;

    // Sort categories by score (lowest first = priority)
    const sortedCategories = Object.entries(scores)
      .sort(([, a], [, b]) => a - b)
      .map(([cat]) => cat);

    // Build goals section HTML
    const goalsHtml = Object.entries(goals)
      .filter(([_, goal]) => goal && goal.trim())
      .map(([category, goal]) => {
        const info = categoryInfo[category as keyof typeof categoryInfo];
        const steps = getActionSteps(category, lang);
        const stepsHtml = steps.map((step, i) => `
          <tr>
            <td style="padding: 4px 0 4px 20px; font-size: 14px; color: #555555;">
              ${i + 1}. ${step}
            </td>
          </tr>
        `).join('');

        return `
        <tr>
          <td style="padding: 20px 0; border-bottom: 1px solid #e5e5e5;">
            <p style="margin: 0 0 8px 0; font-size: 18px; font-weight: 600; color: #1a1a1a;">
              ${info.emoji} ${lang === 'en' ? info.nameEn : info.nameRo}
            </p>
            <p style="margin: 0 0 4px 0; font-size: 13px; color: #888888;">
              ${lang === 'en' ? 'Your Score' : 'Scorul Tău'}: ${scores[category as keyof typeof scores]}/16
            </p>
            <p style="margin: 0 0 12px 0; font-size: 16px; color: #333333; line-height: 1.5; background-color: #f8f9fa; padding: 12px; border-radius: 6px; border-left: 4px solid ${info.color};">
              <strong>${lang === 'en' ? 'Goal' : 'Obiectiv'}:</strong> ${goal}
            </p>
            <p style="margin: 0 0 8px 0; font-size: 14px; font-weight: 600; color: #666666;">
              ${lang === 'en' ? 'First 3 Action Steps:' : 'Primii 3 Pași de Acțiune:'}
            </p>
            <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
              ${stepsHtml}
            </table>
          </td>
        </tr>
        `;
      })
      .join('');

    const priorityOrderHtml = sortedCategories.map((cat, idx) => {
      const info = categoryInfo[cat as keyof typeof categoryInfo];
      return `<span style="display: inline-block; margin: 4px; padding: 6px 12px; background-color: ${info.color}15; color: ${info.color}; border-radius: 20px; font-size: 13px; font-weight: 500;">${idx + 1}. ${lang === 'en' ? info.nameEn : info.nameRo}</span>`;
    }).join('');

    const emailHtml = `<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>${lang === 'en' ? 'Your 2026 Vision Plan' : 'Planul Tău de Viziune 2026'}</title>
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #ffffff; color: #1a1a1a; margin: 0; padding: 0;">

<img src="${trackingPixel}" width="1" height="1" style="display:none;" alt="" />

<table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="background-color: #ffffff;">
  <tr>
    <td style="padding: 20px;">
      <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="max-width: 600px; margin: 0 auto;">
        
        <!-- Header -->
        <tr>
          <td style="padding: 30px 0; text-align: center; border-bottom: 2px solid #1a1a1a;">
            <h1 style="margin: 0; font-size: 24px; font-weight: 700; color: #1a1a1a;">
              🎯 ${lang === 'en' ? 'YOUR 2026 VISION PLAN' : 'PLANUL TĂU DE VIZIUNE 2026'}
            </h1>
          </td>
        </tr>
        
        <!-- Greeting -->
        <tr>
          <td style="padding: 30px 0 20px 0;">
            <p style="margin: 0; font-size: 16px; color: #1a1a1a; line-height: 1.6;">
              ${lang === 'en' ? `Hey ${name},` : `Salut ${name},`}
            </p>
          </td>
        </tr>
        
        <!-- Intro -->
        <tr>
          <td style="padding: 0 0 25px 0;">
            <p style="margin: 0; font-size: 16px; color: #333333; line-height: 1.7;">
              ${lang === 'en' 
                ? 'Congratulations! You\'ve completed the Vision 2026 assessment and set your goals. Below is your personalized action plan.' 
                : 'Felicitări! Ai completat evaluarea Vision 2026 și ți-ai setat obiectivele. Mai jos găsești planul tău personalizat de acțiune.'}
            </p>
          </td>
        </tr>

        <!-- Priority Order -->
        <tr>
          <td style="padding: 20px; background-color: #fff8e6; border-radius: 8px; margin-bottom: 20px;">
            <p style="margin: 0 0 10px 0; font-size: 16px; font-weight: 600; color: #1a1a1a;">
              ${lang === 'en' ? '📊 Your Priority Focus Order:' : '📊 Ordinea Ta de Priorități:'}
            </p>
            <p style="margin: 0;">
              ${priorityOrderHtml}
            </p>
            <p style="margin: 12px 0 0 0; font-size: 13px; color: #666666;">
              ${lang === 'en' 
                ? 'Focus on areas with lower scores first for maximum impact.' 
                : 'Concentrează-te pe ariile cu scoruri mai mici pentru impact maxim.'}
            </p>
          </td>
        </tr>

        <!-- Spacer -->
        <tr><td style="height: 20px;"></td></tr>
        
        <!-- Goals Section -->
        <tr>
          <td style="padding: 0 0 15px 0;">
            <p style="margin: 0; font-size: 20px; font-weight: 600; color: #1a1a1a;">
              ${lang === 'en' ? 'Your Goals & Action Steps:' : 'Obiectivele Tale și Pașii de Acțiune:'}
            </p>
          </td>
        </tr>
        
        ${goalsHtml}
        
        <!-- Divider -->
        <tr>
          <td style="padding: 25px 0;">
            <hr style="border: none; border-top: 1px solid #e5e5e5; margin: 0;" />
          </td>
        </tr>
        
        <!-- CTA Section -->
        <tr>
          <td style="padding: 0 0 25px 0; text-align: center;">
            <p style="margin: 0 0 20px 0; font-size: 16px; color: #333333; line-height: 1.6;">
              <strong>${lang === 'en' ? 'Next Step:' : 'Pasul Următor:'}</strong> ${lang === 'en' 
                ? 'Get daily action tasks delivered to your dashboard and track your progress.' 
                : 'Primește task-uri zilnice în dashboard și urmărește-ți progresul.'}
            </p>
            <table role="presentation" cellspacing="0" cellpadding="0" border="0" style="margin: 0 auto;">
              <tr>
                <td style="background: linear-gradient(135deg, #f59e0b, #ef4444); border-radius: 8px;">
                  <a href="${trialUrl}" style="display: inline-block; padding: 16px 32px; font-size: 16px; font-weight: 600; color: #ffffff; text-decoration: none;">
                    ${lang === 'en' ? 'Start 3-Day Trial FREE →' : 'Începe Trial 3 Zile GRATUIT →'}
                  </a>
                </td>
              </tr>
            </table>
            <p style="margin: 15px 0 0 0; font-size: 14px; color: #666666;">
              <a href="${dashboardUrl}" style="color: #0066cc; text-decoration: underline;">${lang === 'en' ? 'Or access Dashboard (Free Plan) →' : 'Sau accesează Dashboard (Plan Gratuit) →'}</a>
            </p>
          </td>
        </tr>
        
        <!-- Footer -->
        <tr>
          <td style="padding: 20px 0; border-top: 1px solid #e5e5e5;">
            <p style="margin: 0 0 10px 0; font-size: 14px; color: #1a1a1a;">
              ${lang === 'en' ? 'To your success!' : 'Mult succes!'}<br/>
              ${lang === 'en' ? 'The LifeOS Team' : 'Echipa LifeOS'}
            </p>
            <p style="margin: 0; font-size: 12px; color: #999999;">
              <a href="${unsubscribeUrl}" style="color: #999999; text-decoration: underline;">${lang === 'en' ? 'Unsubscribe' : 'Dezabonare'}</a>
            </p>
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
        from: 'Vision 2026 <noreply@warriorsos.com>',
        to: [email],
        subject: lang === 'en' 
          ? `${name}, Your 2026 Vision Plan is Ready!` 
          : `${name}, Planul Tău de Viziune 2026 Este Gata!`,
        html: emailHtml,
      }),
    });

    if (!emailResponse.ok) {
      const errorText = await emailResponse.text();
      console.error('Resend API error:', errorText);
      throw new Error(`Resend API error: ${errorText}`);
    }

    const result = await emailResponse.json();
    console.log('Vision plan email sent successfully:', result);

    return new Response(
      JSON.stringify({ success: true, messageId: result.id }),
      {
        status: 200,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error);
    console.error("Error in send-vision-plan:", message);
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
