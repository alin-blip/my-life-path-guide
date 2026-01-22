import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY');

interface WeeklyKey {
  id: number;
  title: string;
  objective: string;
  steps: Array<{
    text: string;
    day: string;
    listType: 'hit' | 'do';
  }>;
  deadline?: string;
}

interface GoalPlanData {
  email: string;
  name?: string;
  category: string;
  categoryLabel: string;
  annualVision: string;
  quarterlyMilestone: string;
  monthlyFocus: string;
  weeklyKeys: WeeklyKey[];
  language?: 'en' | 'ro';
}

const getCategoryEmoji = (category: string): string => {
  switch (category) {
    case 'business': return '💼';
    case 'body': return '🏋️';
    case 'being': return '🧠';
    case 'balance': return '❤️';
    default: return '🎯';
  }
};

const generateEmailHtml = (data: GoalPlanData): string => {
  const isRo = data.language === 'ro';
  const emoji = getCategoryEmoji(data.category);
  
  const weeklyKeysHtml = data.weeklyKeys.map((key, idx) => `
    <div style="margin-bottom: 16px; padding: 16px; background: #f8f9fa; border-radius: 8px; border-left: 4px solid #8b5cf6;">
      <h4 style="margin: 0 0 8px 0; color: #1a1a1a; font-size: 16px;">
        ${isRo ? `Cheie ${idx + 1}` : `Key ${idx + 1}`}: ${key.title}
      </h4>
      <p style="margin: 0 0 12px 0; color: #666; font-size: 14px;">${key.objective}</p>
      ${key.steps && key.steps.length > 0 ? `
        <ul style="margin: 0; padding-left: 20px;">
          ${key.steps.map(step => `
            <li style="color: #444; font-size: 14px; margin-bottom: 4px;">
              ${step.text} <span style="color: #888; font-size: 12px;">(${step.day})</span>
            </li>
          `).join('')}
        </ul>
      ` : ''}
    </div>
  `).join('');

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${isRo ? 'Planul Tău' : 'Your Plan'} - ${data.categoryLabel}</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f5f5f5;">
  <div style="max-width: 600px; margin: 0 auto; background: white;">
    <!-- Header -->
    <div style="background: linear-gradient(135deg, #8b5cf6 0%, #6366f1 100%); padding: 40px 30px; text-align: center;">
      <h1 style="margin: 0; color: white; font-size: 28px; font-weight: bold;">
        ${emoji} ${isRo ? 'Planul Tău pentru' : 'Your Plan for'} ${data.categoryLabel}
      </h1>
      <p style="margin: 16px 0 0 0; color: rgba(255,255,255,0.9); font-size: 16px;">
        ${isRo ? 'Felicitări pentru că ai creat un plan!' : 'Congratulations on creating a plan!'}
      </p>
    </div>

    <!-- Content -->
    <div style="padding: 30px;">
      ${data.name ? `
        <p style="color: #666; font-size: 16px; margin-bottom: 24px;">
          ${isRo ? `Salut ${data.name}!` : `Hi ${data.name}!`}
        </p>
      ` : ''}

      <!-- Annual Vision -->
      <div style="margin-bottom: 24px;">
        <h2 style="color: #1a1a1a; font-size: 20px; margin: 0 0 12px 0; display: flex; align-items: center;">
          🎯 ${isRo ? 'Viziunea Anuală' : 'Annual Vision'}
        </h2>
        <div style="background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%); padding: 20px; border-radius: 12px;">
          <p style="margin: 0; color: #92400e; font-size: 16px; line-height: 1.6;">${data.annualVision}</p>
        </div>
      </div>

      <!-- Quarterly Milestone -->
      <div style="margin-bottom: 24px;">
        <h2 style="color: #1a1a1a; font-size: 20px; margin: 0 0 12px 0;">
          📅 ${isRo ? 'Milestone Trimestrial' : 'Quarterly Milestone'}
        </h2>
        <div style="background: #ede9fe; padding: 20px; border-radius: 12px;">
          <p style="margin: 0; color: #5b21b6; font-size: 16px; line-height: 1.6;">${data.quarterlyMilestone}</p>
        </div>
      </div>

      <!-- Monthly Focus -->
      <div style="margin-bottom: 24px;">
        <h2 style="color: #1a1a1a; font-size: 20px; margin: 0 0 12px 0;">
          🔥 ${isRo ? 'Focus Luna Aceasta' : 'This Month\'s Focus'}
        </h2>
        <div style="background: #dbeafe; padding: 20px; border-radius: 12px;">
          <p style="margin: 0; color: #1e40af; font-size: 16px; line-height: 1.6;">${data.monthlyFocus}</p>
        </div>
      </div>

      <!-- Weekly Keys -->
      <div style="margin-bottom: 24px;">
        <h2 style="color: #1a1a1a; font-size: 20px; margin: 0 0 16px 0;">
          🔑 ${isRo ? 'Cheile Săptămânale' : 'Weekly Keys'}
        </h2>
        ${weeklyKeysHtml}
      </div>

      <!-- CTA -->
      <div style="text-align: center; margin-top: 32px; padding: 24px; background: #f8f9fa; border-radius: 12px;">
        <p style="color: #666; margin: 0 0 16px 0; font-size: 14px;">
          ${isRo 
            ? 'Continuă să îți urmărești progresul în WarriorOS!' 
            : 'Continue tracking your progress in WarriorOS!'}
        </p>
        <a href="https://my-life-path-guide.lovable.app/door" 
           style="display: inline-block; background: linear-gradient(135deg, #8b5cf6 0%, #6366f1 100%); color: white; text-decoration: none; padding: 14px 32px; border-radius: 8px; font-weight: bold; font-size: 16px;">
          ${isRo ? 'Deschide The Door' : 'Open The Door'}
        </a>
      </div>
    </div>

    <!-- Footer -->
    <div style="padding: 24px; background: #1a1a1a; text-align: center;">
      <p style="margin: 0; color: #888; font-size: 12px;">
        © 2025 WarriorOS. ${isRo ? 'Toate drepturile rezervate.' : 'All rights reserved.'}
      </p>
    </div>
  </div>
</body>
</html>
  `;
};

serve(async (req: Request) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    if (!RESEND_API_KEY) {
      throw new Error('RESEND_API_KEY not configured');
    }

    const data: GoalPlanData = await req.json();
    
    if (!data.email) {
      throw new Error('Email is required');
    }

    const isRo = data.language === 'ro';
    const subject = isRo 
      ? `🎯 Planul tău pentru ${data.categoryLabel} - WarriorOS`
      : `🎯 Your ${data.categoryLabel} Plan - WarriorOS`;

    const emailHtml = generateEmailHtml(data);

    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: 'WarriorOS <noreply@warriorsos.com>',
        to: [data.email],
        subject,
        html: emailHtml,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Resend API error: ${errorText}`);
    }

    const result = await response.json();

    return new Response(
      JSON.stringify({ success: true, messageId: result.id }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );

  } catch (error) {
    console.error('Error sending goal plan email:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({ success: false, error: errorMessage }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    );
  }
});
