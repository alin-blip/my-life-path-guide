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

interface PlanEmailRequest {
  email: string;
  name: string;
  planData: {
    category: string;
    categoryLabel: string;
    annualVision: string;
    quarterlyMilestone: string;
    monthlyFocus: string;
    weeklyKeys: Array<{
      title: string;
      steps?: Array<{ text: string; day: string }>;
    }>;
  };
  language: 'en' | 'ro';
}

const categoryInfo: Record<string, { name: string; nameRo: string; emoji: string; color: string }> = {
  body: { name: 'Body & Health', nameRo: 'Corp & Sănătate', emoji: '💪', color: '#ef4444' },
  being: { name: 'Spirit & Mindset', nameRo: 'Spirit & Mindset', emoji: '🧘', color: '#8b5cf6' },
  balance: { name: 'Relationships', nameRo: 'Relații', emoji: '⚖️', color: '#3b82f6' },
  business: { name: 'Business', nameRo: 'Business', emoji: '💼', color: '#22c55e' },
};

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    if (!RESEND_API_KEY) {
      throw new Error('RESEND_API_KEY lipsește din configurația backend.');
    }
    if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
      throw new Error('Config backend incompletă.');
    }

    const body: PlanEmailRequest = await req.json();
    const { email, name = 'Warrior', planData, language = 'ro' } = body;

    console.log('Sending life score plan email to:', email, 'category:', planData.category);

    if (!email || !planData) {
      throw new Error('Email and planData are required');
    }

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

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

    // Create tracking ID
    const trackingId = crypto.randomUUID();
    const info = categoryInfo[planData.category] || categoryInfo.business;

    const trackingPixel = `https://exsbnfmaadjyfblperas.supabase.co/functions/v1/track-email-open?t=${trackingId}`;
    const unsubscribeUrl = `https://warriorsos.com/unsubscribe?email=${encodeURIComponent(email)}&sequence=life_score`;
    const dashboardUrl = `https://warriorsos.com/door?utm_source=email&utm_medium=plan&utm_campaign=life_score`;
    const membershipUrl = `https://warriorsos.com/pricing?utm_source=email&utm_medium=plan&utm_campaign=life_score`;

    // Build weekly keys HTML
    const weeklyKeysHtml = planData.weeklyKeys.map((key, index) => `
      <div style="margin-bottom: 15px; padding: 15px; background: rgba(255,255,255,0.03); border-radius: 12px; border-left: 3px solid ${info.color};">
        <div style="font-weight: 700; color: #fff; margin-bottom: 8px;">🔑 ${key.title}</div>
        ${key.steps?.map(step => `
          <div style="color: #aaa; font-size: 13px; padding-left: 15px; margin-top: 5px;">
            • ${step.text} <span style="color: #666;">(${step.day})</span>
          </div>
        `).join('') || ''}
      </div>
    `).join('');

    const isRo = language === 'ro';
    
    const emailHtml = `<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>${isRo ? 'Planul Tău de Viață' : 'Your Life Plan'}</title>
</head>
<body style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #0a0a0f; color: #ffffff; margin: 0; padding: 0;">

<!-- Tracking Pixel -->
<img src="${trackingPixel}" width="1" height="1" style="display:none;" alt="" />

<div style="max-width: 640px; margin: 0 auto; background: linear-gradient(180deg, #0f0f1a 0%, #1a1a2e 100%);">

<!-- Header -->
<div style="background: linear-gradient(135deg, ${info.color}cc 0%, ${info.color}99 100%); padding: 40px 30px; text-align: center;">
  <div style="font-size: 48px; margin-bottom: 10px;">${info.emoji}</div>
  <h1 style="margin: 0; font-size: 28px; font-weight: 800; color: #ffffff; text-transform: uppercase; letter-spacing: 2px;">
    ${isRo ? 'PLANUL TĂU PENTRU' : 'YOUR PLAN FOR'} ${planData.categoryLabel.toUpperCase()}
  </h1>
  <p style="margin: 15px 0 0 0; font-size: 16px; color: rgba(255,255,255,0.9);">
    ${isRo ? `Felicitări, ${name}! Ai creat primul pas spre transformare.` : `Congratulations, ${name}! You've created the first step toward transformation.`}
  </p>
</div>

<!-- Annual Vision -->
<div style="padding: 30px; border-bottom: 1px solid rgba(255,255,255,0.05);">
  <div style="display: flex; align-items: center; gap: 10px; margin-bottom: 15px;">
    <span style="font-size: 24px;">🎯</span>
    <h2 style="margin: 0; font-size: 20px; color: #fff;">${isRo ? 'Viziunea Anuală' : 'Annual Vision'}</h2>
  </div>
  <p style="margin: 0; color: #ddd; font-size: 16px; line-height: 1.7; font-style: italic; padding: 15px; background: rgba(255,255,255,0.03); border-radius: 12px;">
    "${planData.annualVision}"
  </p>
</div>

<!-- 90-Day Milestone -->
<div style="padding: 30px; border-bottom: 1px solid rgba(255,255,255,0.05);">
  <div style="display: flex; align-items: center; gap: 10px; margin-bottom: 15px;">
    <span style="font-size: 24px;">🚀</span>
    <h2 style="margin: 0; font-size: 20px; color: #fff;">${isRo ? 'Milestone 90 Zile' : '90-Day Milestone'}</h2>
  </div>
  <p style="margin: 0; color: #ddd; font-size: 15px; line-height: 1.7; padding: 15px; background: rgba(255,255,255,0.03); border-radius: 12px;">
    ${planData.quarterlyMilestone}
  </p>
</div>

<!-- Monthly Focus -->
<div style="padding: 30px; border-bottom: 1px solid rgba(255,255,255,0.05);">
  <div style="display: flex; align-items: center; gap: 10px; margin-bottom: 15px;">
    <span style="font-size: 24px;">📅</span>
    <h2 style="margin: 0; font-size: 20px; color: #fff;">${isRo ? 'Focusul Lunar' : 'Monthly Focus'}</h2>
  </div>
  <p style="margin: 0; color: #ddd; font-size: 15px; line-height: 1.7; padding: 15px; background: rgba(255,255,255,0.03); border-radius: 12px;">
    ${planData.monthlyFocus}
  </p>
</div>

<!-- Weekly Keys -->
<div style="padding: 30px; background: rgba(102,126,234,0.1); border-top: 1px solid rgba(102,126,234,0.3);">
  <h2 style="text-align: center; font-size: 20px; color: #fff; margin: 0 0 20px 0;">🔑 ${isRo ? 'Cheile Săptămânii' : 'Weekly Keys'}</h2>
  ${weeklyKeysHtml}
</div>

<!-- CTA Section -->
<div style="padding: 50px 30px; text-align: center; background: linear-gradient(180deg, transparent 0%, rgba(34,197,94,0.15) 100%);">
  <div style="font-size: 40px; margin-bottom: 15px;">⚡</div>
  <h2 style="margin: 0 0 15px 0; font-size: 24px; color: #fff;">
    ${isRo ? 'Execută Planul Zilnic' : 'Execute Your Plan Daily'}
  </h2>
  <p style="margin: 0 0 30px 0; color: #aaa; font-size: 15px; line-height: 1.6;">
    ${isRo 
      ? 'Sarcinile tale sunt deja în sistemul Door. Accesează dashboard-ul pentru a le vedea și bifa zilnic.'
      : 'Your tasks are already in the Door system. Access the dashboard to see and check them off daily.'}
  </p>
  
  <a href="${dashboardUrl}" style="display: inline-block; padding: 18px 50px; background: linear-gradient(135deg, #22c55e 0%, #16a34a 100%); color: #ffffff; text-decoration: none; border-radius: 12px; font-weight: 700; font-size: 18px; box-shadow: 0 10px 30px rgba(34,197,94,0.4); margin-bottom: 15px;">
    ${isRo ? 'Accesează Dashboard →' : 'Access Dashboard →'}
  </a>
  
  <p style="margin: 20px 0 0 0; color: #666; font-size: 13px;">
    ${isRo ? 'Vrei să deblochezi toate cele 4 domenii?' : 'Want to unlock all 4 domains?'}
    <a href="${membershipUrl}" style="color: #888; text-decoration: underline; margin-left: 5px;">
      ${isRo ? 'Vezi Membership →' : 'View Membership →'}
    </a>
  </p>
</div>

<!-- Footer -->
<div style="padding: 30px; text-align: center; border-top: 1px solid rgba(255,255,255,0.05);">
  <p style="margin: 0 0 15px 0; color: #666; font-size: 12px;">
    © 2025 WarriorSOS. Toate drepturile rezervate.
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
        from: 'WarriorSOS <alin@eduforyou.co.uk>',
        to: [email],
        subject: isRo 
          ? `${info.emoji} ${name}, planul tău pentru ${planData.categoryLabel} este gata!`
          : `${info.emoji} ${name}, your ${planData.categoryLabel} plan is ready!`,
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
    console.error("Error in send-life-score-plan:", message);
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
