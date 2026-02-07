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

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    if (!RESEND_API_KEY) {
      throw new Error('RESEND_API_KEY lipseste din configuratia backend.');
    }
    if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
      throw new Error('Config backend incompleta.');
    }

    const body: PlanEmailRequest = await req.json();
    const { email, name = 'Warrior', planData, language = 'ro' } = body;

    console.log('Sending life score plan email to:', email, 'category:', planData.category);

    if (!email || !planData) {
      throw new Error('Email and planData are required');
    }

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
    const isRo = language === 'ro';

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

    const trackingId = crypto.randomUUID();
    const trackingPixel = `https://exsbnfmaadjyfblperas.supabase.co/functions/v1/track-email-open?t=${trackingId}`;
    const unsubscribeUrl = `https://warriorsos.com/unsubscribe?email=${encodeURIComponent(email)}&sequence=life_score`;
    const dashboardUrl = `https://warriorsos.com/door?utm_source=email&utm_medium=plan&utm_campaign=life_score`;

    // Weekly keys HTML
    const weeklyKeysHtml = planData.weeklyKeys.map((key) => `
      <div style="margin-bottom: 12px; padding: 14px 16px; background-color: #f9fafb; border-radius: 8px; border-left: 3px solid #111827;">
        <p style="margin: 0 0 6px 0; font-weight: 600; color: #111827; font-size: 14px;">${key.title}</p>
        ${key.steps?.map(step => `
          <p style="color: #6b7280; font-size: 13px; padding-left: 12px; margin: 4px 0;">
            &bull; ${step.text} <span style="color: #9ca3af;">(${step.day})</span>
          </p>
        `).join('') || ''}
      </div>
    `).join('');

    const emailHtml = `<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>${isRo ? 'Planul Tau de Viata' : 'Your Life Plan'}</title>
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
            <p style="margin: 0 0 4px 0; font-size: 13px; font-weight: 600; color: #6b7280; text-transform: uppercase; letter-spacing: 0.5px;">WarriorOS</p>
            <h1 style="margin: 0; font-size: 24px; font-weight: 700; color: #111827;">
              ${isRo ? 'Planul Tau pentru' : 'Your Plan for'} ${planData.categoryLabel}
            </h1>
            <p style="margin: 8px 0 0 0; color: #6b7280; font-size: 15px;">
              ${isRo ? `Felicitari, ${name}! Ai creat primul pas spre transformare.` : `Congratulations, ${name}! You've created the first step toward transformation.`}
            </p>
          </td>
        </tr>

        <!-- Annual Vision -->
        <tr>
          <td style="padding: 24px 32px 0 32px;">
            <p style="color: #111827; font-size: 14px; font-weight: 600; margin: 0 0 8px 0; text-transform: uppercase; letter-spacing: 0.3px;">
              ${isRo ? 'Viziunea Anuala' : 'Annual Vision'}
            </p>
            <div style="background-color: #fffbeb; padding: 14px 16px; border-radius: 8px; border-left: 3px solid #f59e0b;">
              <p style="margin: 0; color: #92400e; font-size: 15px; line-height: 1.6; font-style: italic;">"${planData.annualVision}"</p>
            </div>
          </td>
        </tr>

        <!-- 90-Day Milestone -->
        <tr>
          <td style="padding: 20px 32px 0 32px;">
            <p style="color: #111827; font-size: 14px; font-weight: 600; margin: 0 0 8px 0; text-transform: uppercase; letter-spacing: 0.3px;">
              ${isRo ? 'Milestone 90 Zile' : '90-Day Milestone'}
            </p>
            <div style="background-color: #f0f9ff; padding: 14px 16px; border-radius: 8px; border-left: 3px solid #3b82f6;">
              <p style="margin: 0; color: #1e40af; font-size: 15px; line-height: 1.6;">${planData.quarterlyMilestone}</p>
            </div>
          </td>
        </tr>

        <!-- Monthly Focus -->
        <tr>
          <td style="padding: 20px 32px 0 32px;">
            <p style="color: #111827; font-size: 14px; font-weight: 600; margin: 0 0 8px 0; text-transform: uppercase; letter-spacing: 0.3px;">
              ${isRo ? 'Focusul Lunar' : 'Monthly Focus'}
            </p>
            <div style="background-color: #f0fdf4; padding: 14px 16px; border-radius: 8px; border-left: 3px solid #22c55e;">
              <p style="margin: 0; color: #166534; font-size: 15px; line-height: 1.6;">${planData.monthlyFocus}</p>
            </div>
          </td>
        </tr>

        <!-- Weekly Keys -->
        <tr>
          <td style="padding: 24px 32px;">
            <p style="color: #111827; font-size: 14px; font-weight: 600; margin: 0 0 12px 0; text-transform: uppercase; letter-spacing: 0.3px;">
              ${isRo ? 'Cheile Saptamanii' : 'Weekly Keys'}
            </p>
            ${weeklyKeysHtml}
          </td>
        </tr>

        <!-- CTA -->
        <tr>
          <td style="padding: 0 32px 28px 32px; text-align: center;">
            <p style="margin: 0 0 16px 0; color: #4b5563; font-size: 15px;">
              ${isRo 
                ? 'Sarcinile tale sunt deja in sistemul Door.'
                : 'Your tasks are already in the Door system.'}
            </p>
            <a href="${dashboardUrl}" style="display: inline-block; background-color: #111827; color: #ffffff; text-decoration: none; padding: 14px 40px; border-radius: 8px; font-size: 15px; font-weight: 600;">
              ${isRo ? 'Acceseaza Dashboard' : 'Access Dashboard'}
            </a>
          </td>
        </tr>

        <!-- Footer -->
        <tr>
          <td style="background-color: #f9fafb; padding: 20px 32px; text-align: center; border-top: 1px solid #e5e7eb;">
            <p style="color: #9ca3af; margin: 0 0 6px 0; font-size: 12px;">WarriorOS</p>
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
        from: 'WarriorOS <noreply@warriorsos.com>',
        to: [email],
        subject: isRo 
          ? `${name}, planul tau pentru ${planData.categoryLabel} este gata`
          : `${name}, your ${planData.categoryLabel} plan is ready`,
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
