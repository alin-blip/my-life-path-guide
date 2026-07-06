import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { Resend } from "https://esm.sh/resend@2.0.0";
import { resolveLeadLanguage } from "../_shared/resolve-lead-language.ts";
import { requireCronOrAdmin } from "../_shared/require-cron-or-admin.ts";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY")!;

const resend = new Resend(RESEND_API_KEY);

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

interface EmailContent {
  subject: string;
  headline: string;
  body: string;
  ctaText: string;
  isUrgent: boolean;
}

const getUpgradeContent = (stepNumber: number, name: string, language: 'en' | 'ro'): EmailContent => {
  const isRo = language === 'ro';
  const firstName = name?.split(' ')[0] || 'Warrior';

  const steps: Record<number, { en: EmailContent; ro: EmailContent }> = {
    1: {
      en: {
        subject: `Congratulations on Day 2 — here's what comes next`,
        headline: "You completed 2 days. You're in the top 30% of those who start.",
        body: `Days 3-7 are where the real progress happens:\n\n• Day 3: Business Plan + Domino Door (the execution system)\n• Day 4: AI Vision Board + Personalized Meditation\n• Day 5: Accountability Coach that tracks everything\n• Day 6: Control over distracting ideas\n• Day 7: Complete integration\n\nEarly Bird Trial: 7 free days — activate now.`,
        ctaText: "Activate Free Trial",
        isUrgent: false
      },
      ro: {
        subject: `Felicitari pentru Ziua 2 — ce urmeaza`,
        headline: "Ai completat 2 zile. Esti in top 30% dintre cei care incep.",
        body: `Zilele 3-7 sunt unde se intampla progresul real:\n\n• Ziua 3: Business Plan + Domino Door (sistemul de executie)\n• Ziua 4: Vision Board AI + Meditatie personalizata\n• Ziua 5: Accountability Coach care urmareste tot\n• Ziua 6: Control asupra ideilor care te distrag\n• Ziua 7: Integrare completa\n\nEarly Bird Trial: 7 zile gratuite — activeaza acum.`,
        ctaText: "Activeaza Trial Gratuit",
        isUrgent: false
      }
    },
    2: {
      en: {
        subject: `Days 1-2 are the foundation. Without 3-7, nothing sticks.`,
        headline: "You have the vision. You have the objectives. But without a system, everything stays on paper.",
        body: `What you miss without the full system:\n\n• No Domino Door = no weekly execution\n• No AI Coach = no accountability\n• No Mind Coach = fears block you\n• No Idea Control = new ideas distract you\n\nDon't let the vision stay on paper.`,
        ctaText: "Complete the System",
        isUrgent: false
      },
      ro: {
        subject: `Zilele 1-2 sunt fundatia. Fara 3-7 nu se intampla nimic.`,
        headline: "Ai viziunea. Ai obiectivele. Dar fara sistem, totul ramane pe hartie.",
        body: `Ce pierzi fara sistemul complet:\n\n• Fara Domino Door = fara executie saptamanala\n• Fara AI Coach = nimeni nu te tine responsabil\n• Fara Mind Coach = fricile te blocheaza\n• Fara Idea Control = ideile noi te distrag\n\nNu lasa viziunea sa ramana pe hartie.`,
        ctaText: "Completeaza Sistemul",
        isUrgent: false
      }
    },
    3: {
      en: {
        subject: `Others are already on Day 5`,
        headline: "Warriors who activated the trial immediately are already on Day 5.",
        body: `They have:\n• The weekly execution system configured\n• The personalized daily routine\n• The AI Coach active and guiding them\n\nThe trial is free for 7 days. Zero risk.`,
        ctaText: "Start Your Trial",
        isUrgent: false
      },
      ro: {
        subject: `Altii sunt deja la Ziua 5`,
        headline: "Warriorii care au activat trial-ul imediat sunt deja la Ziua 5.",
        body: `Ei au:\n• Sistemul de executie saptamanala configurat\n• Rutina zilnica personalizata\n• AI Coach-ul activ si ghidandu-i\n\nTrial-ul e gratuit 7 zile. Zero risc.`,
        ctaText: "Incepe Trial-ul",
        isUrgent: false
      }
    },
    4: {
      en: {
        subject: `Special offer: 50% off first year`,
        headline: "Because you completed Days 1-2, here's something special.",
        body: `50% discount on the annual subscription — just for you.\n\nValid for 48 hours.\n\nThis includes:\n• All 7 days unlocked\n• Domino Door weekly planning\n• AI Accountability Coach\n• Mind Coach for transforming fears\n• Vision Board AI\n• Personalized Meditation\n• Priority support`,
        ctaText: "Activate the Offer",
        isUrgent: true
      },
      ro: {
        subject: `Oferta speciala: 50% reducere primul an`,
        headline: "Pentru ca ai completat Zilele 1-2, iti ofer ceva special.",
        body: `50% reducere la abonamentul anual — doar pentru tine.\n\nValabil 48 de ore.\n\nInclude:\n• Toate cele 7 zile deblocate\n• Domino Door planificare saptamanala\n• AI Accountability Coach\n• Mind Coach pentru transformarea fricilor\n• Vision Board AI\n• Meditatie Personalizata\n• Suport prioritar`,
        ctaText: "Activeaza Oferta",
        isUrgent: true
      }
    },
    5: {
      en: {
        subject: `Last day for the offer`,
        headline: "You have two options: activate the free trial or lose the progress.",
        body: `What you've accomplished:\n• 2026 Vision — done\n• Body/Spirit/Relationships Objectives — done\n\nWhat's waiting for you in Days 3-7:\n• The system that makes it all happen\n\nThis is the last email about this offer.`,
        ctaText: "I Want to Continue",
        isUrgent: true
      },
      ro: {
        subject: `Ultima zi pentru oferta`,
        headline: "Ai doua optiuni: activezi trial-ul gratuit sau pierzi progresul.",
        body: `Ce ai realizat:\n• Viziune 2026 — done\n• Obiective Corp/Spirit/Relatii — done\n\nCe te asteapta in Zilele 3-7:\n• Sistemul care face totul sa se intample\n\nAcesta e ultimul email despre aceasta oferta.`,
        ctaText: "Vreau sa Continui",
        isUrgent: true
      }
    }
  };

  return steps[stepNumber]?.[isRo ? 'ro' : 'en'] || steps[1][isRo ? 'ro' : 'en'];
};

const generateTrackingId = (stepNumber: number) => {
  return `challenge-upgrade-s${stepNumber}-${Date.now()}-${Math.random().toString(36).substring(2, 11)}`;
};

const getStepForUser = (day2CompletedAt: Date): number | null => {
  const now = new Date();
  const hoursSinceDay2 = (now.getTime() - day2CompletedAt.getTime()) / (1000 * 60 * 60);
  
  if (hoursSinceDay2 < 2) return 1;
  if (hoursSinceDay2 >= 24 && hoursSinceDay2 < 48) return 2;
  if (hoursSinceDay2 >= 48 && hoursSinceDay2 < 72) return 3;
  if (hoursSinceDay2 >= 72 && hoursSinceDay2 < 120) return 4;
  if (hoursSinceDay2 >= 120 && hoursSinceDay2 < 168) return 5;
  
  return null;
};

const getEmailTemplate = (
  content: EmailContent,
  trackingPixelUrl: string,
  unsubscribeUrl: string,
  language: 'en' | 'ro'
) => {
  const isRo = language === 'ro';

  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${content.subject}</title>
</head>
<body style="margin: 0; padding: 0; background-color: #f7f7f8; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color: #f7f7f8;">
    <tr>
      <td align="center" style="padding: 40px 20px;">
        <table role="presentation" width="600" cellpadding="0" cellspacing="0" style="max-width: 600px; background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 1px 3px rgba(0,0,0,0.08);">
          
          <!-- Header -->
          <tr>
            <td style="padding: 32px 32px 24px 32px; border-bottom: 1px solid #e5e7eb;">
              <p style="margin: 0 0 4px 0; font-size: 13px; font-weight: 600; color: #6b7280; text-transform: uppercase; letter-spacing: 0.5px;">CEO Mind OS</p>
              <h1 style="margin: 0; font-size: 22px; font-weight: 700; color: #111827; line-height: 1.4;">
                ${content.headline}
              </h1>
            </td>
          </tr>

          <!-- Main Content -->
          <tr>
            <td style="padding: 28px 32px 32px 32px;">
              
              <div style="color: #4b5563; font-size: 15px; line-height: 1.8; margin: 0 0 24px 0; white-space: pre-line;">
${content.body}
              </div>

              ${content.isUrgent ? `
              <div style="background-color: #fef2f2; border: 1px solid #fecaca; border-radius: 8px; padding: 14px 16px; text-align: center; margin-bottom: 24px;">
                <p style="color: #991b1b; margin: 0; font-size: 14px; font-weight: 600;">
                  ${isRo ? 'Oferta valabila doar 48 ore' : 'Offer valid for 48 hours only'}
                </p>
              </div>
              ` : ''}

              <!-- Primary CTA -->
              <div style="text-align: center; margin: 28px 0 0 0;">
                <a href="https://ceomindos.com/pricing?utm_source=email&utm_medium=upgrade&utm_campaign=day2complete" 
                   style="display: inline-block; background-color: #111827; color: #ffffff; text-decoration: none; padding: 14px 40px; border-radius: 8px; font-size: 15px; font-weight: 600;">
                  ${content.ctaText}
                </a>
              </div>

            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color: #f9fafb; padding: 20px 32px; text-align: center; border-top: 1px solid #e5e7eb;">
              <p style="color: #9ca3af; margin: 0 0 6px 0; font-size: 12px;">
                 CEO Mind OS
              </p>
              <a href="${unsubscribeUrl}" style="color: #9ca3af; font-size: 11px; text-decoration: underline;">
                ${isRo ? 'Dezabonare' : 'Unsubscribe'}
              </a>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
  <img src="${trackingPixelUrl}" width="1" height="1" style="display:none;" alt="">
</body>
</html>
  `;

  return { subject: content.subject, html };
};

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authFail = await requireCronOrAdmin(req, corsHeaders);
    if (authFail) return authFail;

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    const { data: progress, error: progressError } = await supabase
      .from('challenge_progress')
      .select('user_id, completed_at')
      .eq('day_number', 2)
      .eq('completed', true)
      .not('completed_at', 'is', null);

    if (progressError) throw progressError;

    let emailsSent = 0;
    const errors: string[] = [];

    for (const p of progress || []) {
      try {
        if (!p.completed_at) continue;

        const { data: subscriber } = await supabase
          .from('subscribers')
          .select('subscribed')
          .eq('user_id', p.user_id)
          .maybeSingle();

        if (subscriber?.subscribed) continue;

        const day2CompletedAt = new Date(p.completed_at);
        const stepNumber = getStepForUser(day2CompletedAt);
        
        if (!stepNumber) continue;

        const { data: userData, error: userError } = await supabase.auth.admin.getUserById(p.user_id);
        if (userError || !userData?.user?.email) continue;

        const email = userData.user.email;
        const name = userData.user.user_metadata?.full_name || userData.user.user_metadata?.name || '';

        const { data: emailLead } = await supabase
          .from('email_leads')
          .select('subscribed')
          .eq('email', email)
          .maybeSingle();

        if (emailLead && !emailLead.subscribed) continue;

        const { data: existingLog } = await supabase
          .from('email_sequence_log')
          .select('id')
          .eq('email', email)
          .eq('sequence_type', 'challenge_upgrade')
          .eq('step_number', stepNumber)
          .maybeSingle();

        if (existingLog) continue;

        const language = await resolveLeadLanguage(supabase, email);
        const content = getUpgradeContent(stepNumber, name, language);
        
        const trackingId = generateTrackingId(stepNumber);
        const trackingPixelUrl = `${SUPABASE_URL}/functions/v1/track-email-open?t=${trackingId}`;
        const unsubscribeUrl = `${SUPABASE_URL}/functions/v1/unsubscribe-email?id=${trackingId}`;

        const { subject, html } = getEmailTemplate(content, trackingPixelUrl, unsubscribeUrl, language);

         const emailResponse = await resend.emails.send({
           from: "CEO Mind OS <noreply@ceomindos.com>",
          to: [email],
          subject,
          html,
        });

        await supabase.from('email_sequence_log').insert({
          email,
          sequence_type: 'challenge_upgrade',
          tracking_id: trackingId,
          step_number: stepNumber,
          sent_at: new Date().toISOString(),
          metadata: {
            user_id: p.user_id,
            language,
            resend_id: (emailResponse as any)?.data?.id || null
          }
        });

        emailsSent++;
        console.log(`Upgrade email step ${stepNumber} sent to ${email}`);

      } catch (err: any) {
        errors.push(`Error for user ${p.user_id}: ${err.message}`);
        console.error(`Error processing user ${p.user_id}:`, err);
      }
    }

    return new Response(JSON.stringify({ 
      success: true, 
      emailsSent,
      errors: errors.length > 0 ? errors : undefined
    }), {
      status: 200,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });

  } catch (error: any) {
    console.error("Error in send-challenge-upgrade:", error);
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
