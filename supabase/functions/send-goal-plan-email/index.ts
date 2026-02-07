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

const getCategoryLabel = (category: string, isRo: boolean): string => {
  const labels: Record<string, { en: string; ro: string }> = {
    business: { en: 'Business', ro: 'Business' },
    body: { en: 'Body & Health', ro: 'Corp & Sanatate' },
    being: { en: 'Spirit & Mindset', ro: 'Spirit & Mindset' },
    balance: { en: 'Relationships', ro: 'Relatii' },
  };
  return labels[category]?.[isRo ? 'ro' : 'en'] || category;
};

const generateEmailHtml = (data: GoalPlanData): string => {
  const isRo = data.language === 'ro';
  
  const weeklyKeysHtml = data.weeklyKeys.map((key, idx) => `
    <div style="margin-bottom: 12px; padding: 14px 16px; background-color: #f9fafb; border-radius: 8px; border-left: 3px solid #111827;">
      <p style="margin: 0 0 6px 0; color: #111827; font-size: 15px; font-weight: 600;">
        ${isRo ? `Cheie ${idx + 1}` : `Key ${idx + 1}`}: ${key.title}
      </p>
      <p style="margin: 0 0 10px 0; color: #6b7280; font-size: 14px;">${key.objective}</p>
      ${key.steps && key.steps.length > 0 ? `
        <ul style="margin: 0; padding-left: 18px;">
          ${key.steps.map(step => `
            <li style="color: #4b5563; font-size: 13px; margin-bottom: 4px;">
              ${step.text} <span style="color: #9ca3af; font-size: 12px;">(${step.day})</span>
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
  <title>${isRo ? 'Planul Tau' : 'Your Plan'} - ${data.categoryLabel}</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f7f7f8;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color: #f7f7f8;">
    <tr>
      <td align="center" style="padding: 40px 20px;">
        <table role="presentation" width="600" cellpadding="0" cellspacing="0" style="max-width: 600px; background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 1px 3px rgba(0,0,0,0.08);">

          <!-- Header -->
          <tr>
            <td style="padding: 32px 32px 24px 32px; border-bottom: 1px solid #e5e7eb;">
              <p style="margin: 0 0 4px 0; font-size: 13px; font-weight: 600; color: #6b7280; text-transform: uppercase; letter-spacing: 0.5px;">WarriorOS</p>
              <h1 style="margin: 0; font-size: 24px; font-weight: 700; color: #111827;">
                ${isRo ? 'Planul Tau pentru' : 'Your Plan for'} ${data.categoryLabel}
              </h1>
            </td>
          </tr>

          <!-- Content -->
          <tr>
            <td style="padding: 28px 32px 32px 32px;">
              ${data.name ? `
                <p style="color: #374151; font-size: 16px; margin: 0 0 20px 0;">
                  ${isRo ? `Salut ${data.name},` : `Hi ${data.name},`}
                </p>
              ` : ''}

              ${isRo ? `<p style="color: #4b5563; font-size: 15px; line-height: 1.6; margin: 0 0 24px 0;">Felicitari pentru ca ai creat un plan. Mai jos gasesti un rezumat complet.</p>` : `<p style="color: #4b5563; font-size: 15px; line-height: 1.6; margin: 0 0 24px 0;">Congratulations on creating a plan. Below is your complete summary.</p>`}

              <!-- Annual Vision -->
              <div style="margin-bottom: 20px;">
                <p style="color: #111827; font-size: 14px; font-weight: 600; margin: 0 0 8px 0; text-transform: uppercase; letter-spacing: 0.3px;">
                  ${isRo ? 'Viziunea Anuala' : 'Annual Vision'}
                </p>
                <div style="background-color: #fffbeb; padding: 14px 16px; border-radius: 8px; border-left: 3px solid #f59e0b;">
                  <p style="margin: 0; color: #92400e; font-size: 15px; line-height: 1.6;">${data.annualVision}</p>
                </div>
              </div>

              <!-- Quarterly Milestone -->
              <div style="margin-bottom: 20px;">
                <p style="color: #111827; font-size: 14px; font-weight: 600; margin: 0 0 8px 0; text-transform: uppercase; letter-spacing: 0.3px;">
                  ${isRo ? 'Milestone Trimestrial' : 'Quarterly Milestone'}
                </p>
                <div style="background-color: #f0f9ff; padding: 14px 16px; border-radius: 8px; border-left: 3px solid #3b82f6;">
                  <p style="margin: 0; color: #1e40af; font-size: 15px; line-height: 1.6;">${data.quarterlyMilestone}</p>
                </div>
              </div>

              <!-- Monthly Focus -->
              <div style="margin-bottom: 20px;">
                <p style="color: #111827; font-size: 14px; font-weight: 600; margin: 0 0 8px 0; text-transform: uppercase; letter-spacing: 0.3px;">
                  ${isRo ? 'Focus Luna Aceasta' : "This Month's Focus"}
                </p>
                <div style="background-color: #f0fdf4; padding: 14px 16px; border-radius: 8px; border-left: 3px solid #22c55e;">
                  <p style="margin: 0; color: #166534; font-size: 15px; line-height: 1.6;">${data.monthlyFocus}</p>
                </div>
              </div>

              <!-- Weekly Keys -->
              <div style="margin-bottom: 24px;">
                <p style="color: #111827; font-size: 14px; font-weight: 600; margin: 0 0 12px 0; text-transform: uppercase; letter-spacing: 0.3px;">
                  ${isRo ? 'Cheile Saptamanale' : 'Weekly Keys'}
                </p>
                ${weeklyKeysHtml}
              </div>

              <!-- CTA -->
              <div style="text-align: center; margin-top: 28px;">
                <a href="https://warriorsos.com/door?utm_source=email&utm_medium=plan&utm_campaign=goal_plan" 
                   style="display: inline-block; background-color: #111827; color: #ffffff; text-decoration: none; padding: 14px 40px; border-radius: 8px; font-size: 15px; font-weight: 600;">
                  ${isRo ? 'Deschide The Door' : 'Open The Door'}
                </a>
              </div>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color: #f9fafb; padding: 20px 32px; text-align: center; border-top: 1px solid #e5e7eb;">
              <p style="color: #9ca3af; margin: 0; font-size: 12px;">
                WarriorOS
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `;
};

serve(async (req: Request) => {
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
      ? `Planul tau pentru ${data.categoryLabel} — WarriorOS`
      : `Your ${data.categoryLabel} Plan — WarriorOS`;

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
