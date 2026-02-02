import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { Resend } from "https://esm.sh/resend@2.0.0";

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
    1: { // Immediately after Day 2
      en: {
        subject: `🎉 Congratulations on Day 2! Now comes the good part...`,
        headline: "You completed 2 days! You're in the top 30% of those who start.",
        body: `Days 3-7 are where the REAL magic happens:

🎯 Day 3: Business Plan + Domino Door (the execution system)
⚡ Day 4: AI Vision Board + Personalized Meditation
🧠 Day 5: Accountability Coach that knows EVERYTHING you need to do
💡 Day 6: Control over ideas that distract you
🏆 Day 7: Complete integration

Early Bird Trial: 7 free days - activate now`,
        ctaText: "Activate Free Trial",
        isUrgent: false
      },
      ro: {
        subject: `🎉 Felicitări pentru Ziua 2! Acum vine partea bună...`,
        headline: "Ai completat 2 zile! Ești în top 30% dintre cei care încep.",
        body: `Zilele 3-7 sunt unde se întâmplă magia ADEVĂRATĂ:

🎯 Ziua 3: Business Plan + Domino Door (sistemul de execuție)
⚡ Ziua 4: Vision Board AI + Meditație personalizată
🧠 Ziua 5: Accountability Coach care știe TOT ce ai de făcut
💡 Ziua 6: Control asupra ideilor care te distrag
🏆 Ziua 7: Integrare completă

Early Bird Trial: 7 zile gratuite - activează acum`,
        ctaText: "Activează Trial Gratuit",
        isUrgent: false
      }
    },
    2: { // 24h after Day 2
      en: {
        subject: `📉 Days 1-2 are just the foundation. Without 3-7 you lose everything.`,
        headline: "You have the vision. You have the objectives. But without a SYSTEM, everything stays on paper.",
        body: `What you lose without upgrade:

❌ Without Domino Door = no weekly execution
❌ Without AI Coach = no one holds you accountable
❌ Without Mind Coach = fears block you
❌ Without Idea Control = new ideas distract you

Don't let the vision die.`,
        ctaText: "Don't Let the Vision Die",
        isUrgent: false
      },
      ro: {
        subject: `📉 Zilele 1-2 sunt doar fundația. Fără 3-7 pierzi totul.`,
        headline: "Ai viziunea. Ai obiectivele. Dar fără SISTEM, totul rămâne pe hârtie.",
        body: `Ce pierzi fără upgrade:

❌ Fără Domino Door = fără execuție săptămânală
❌ Fără AI Coach = nimeni nu te ține responsabil
❌ Fără Mind Coach = fricile te blochează
❌ Fără Idea Control = ideile noi te distrag

Nu lăsa viziunea să moară.`,
        ctaText: "Nu Lăsa Viziunea să Moară",
        isUrgent: false
      }
    },
    3: { // 48h after Day 2
      en: {
        subject: `⚡ Others are already on Day 5. You?`,
        headline: "Warriors who activated the trial immediately are already on Day 5.",
        body: `They have:
✅ The weekly execution system configured
✅ The personalized daily routine
✅ The AI Coach active and guiding them

The trial is FREE for 7 days. Zero risk.`,
        ctaText: "Catch Up with Them",
        isUrgent: false
      },
      ro: {
        subject: `⚡ Alții sunt deja la Ziua 5. Tu?`,
        headline: "Warriorii care au activat trial-ul imediat sunt deja la Ziua 5.",
        body: `Ei au:
✅ Sistemul de execuție săptămânală configurat
✅ Rutina zilnică personalizată
✅ AI Coach-ul activ și ghidându-i

Trial-ul e GRATUIT 7 zile. Zero risc.`,
        ctaText: "Ajunge-i din Urmă",
        isUrgent: false
      }
    },
    4: { // 72h after Day 2
      en: {
        subject: `🎁 Last chance: 50% off first year`,
        headline: "Because you completed Days 1-2, I'm offering you something special.",
        body: `50% discount on the annual subscription - just for you.

Valid for 48 hours only.

This includes:
• All 7 days unlocked
• Domino Door weekly planning
• AI Accountability Coach
• Mind Coach for transforming fears
• Vision Board AI
• Personalized Meditation
• Priority support`,
        ctaText: "Activate the Offer",
        isUrgent: true
      },
      ro: {
        subject: `🎁 Ultima șansă: 50% off primul an`,
        headline: "Pentru că ai completat Zilele 1-2, îți ofer ceva special.",
        body: `50% reducere la abonamentul anual - doar pentru tine.

Valabil doar 48 de ore.

Include:
• Toate cele 7 zile deblocate
• Domino Door planificare săptămânală
• AI Accountability Coach
• Mind Coach pentru transformarea fricilor
• Vision Board AI
• Meditație Personalizată
• Suport prioritar`,
        ctaText: "Activează Oferta",
        isUrgent: true
      }
    },
    5: { // 5 days after Day 2 - final
      en: {
        subject: `🚨 Today is the last day for the offer`,
        headline: "You have two options: activate the free trial OR lose all progress.",
        body: `What you've accomplished:
✅ 2026 Vision - DONE
✅ Body/Spirit/Relationships Objectives - DONE

What's waiting for you in Days 3-7:
⏳ The system that makes it all happen

This is the last email about this offer.`,
        ctaText: "I WANT TO CONTINUE",
        isUrgent: true
      },
      ro: {
        subject: `🚨 Azi e ultima zi pentru ofertă`,
        headline: "Ai două opțiuni: activezi trial-ul gratuit SAU pierzi tot progresul.",
        body: `Ce ai realizat:
✅ Viziune 2026 - DONE
✅ Obiective Corp/Spirit/Relații - DONE

Ce te așteaptă în Zilele 3-7:
⏳ Sistemul care face totul să se întâmple

Acesta e ultimul email despre această ofertă.`,
        ctaText: "VREAU SĂ CONTINUI",
        isUrgent: true
      }
    }
  };

  return steps[stepNumber]?.[isRo ? 'ro' : 'en'] || steps[1][isRo ? 'ro' : 'en'];
};

const generateTrackingId = (stepNumber: number) => {
  return `challenge-upgrade-s${stepNumber}-${Date.now()}-${Math.random().toString(36).substring(2, 11)}`;
};

// Calculate which step user should receive based on Day 2 completion date
const getStepForUser = (day2CompletedAt: Date): number | null => {
  const now = new Date();
  const hoursSinceDay2 = (now.getTime() - day2CompletedAt.getTime()) / (1000 * 60 * 60);
  
  if (hoursSinceDay2 < 2) return 1; // Immediately (within 2 hours)
  if (hoursSinceDay2 >= 24 && hoursSinceDay2 < 48) return 2;
  if (hoursSinceDay2 >= 48 && hoursSinceDay2 < 72) return 3;
  if (hoursSinceDay2 >= 72 && hoursSinceDay2 < 120) return 4; // 72-120h = 3-5 days
  if (hoursSinceDay2 >= 120 && hoursSinceDay2 < 168) return 5; // 120-168h = 5-7 days
  
  return null; // Too old
};

const getEmailTemplate = (
  content: EmailContent,
  referralLink: string,
  trackingPixelUrl: string,
  unsubscribeUrl: string,
  language: 'en' | 'ro'
) => {
  const isRo = language === 'ro';
  
  const headerBg = content.isUrgent 
    ? 'linear-gradient(135deg, #dc2626 0%, #991b1b 100%)'
    : 'linear-gradient(135deg, #f59e0b 0%, #ea580c 100%)';

  const inviteMessage = isRo
    ? `Am terminat primele 2 zile din challenge și e incredibil! Ai viziunea, obiectivele, și acum lucrez la sistemul de execuție.

Alătură-te aici 👇
${referralLink}`
    : `I finished the first 2 days of the challenge and it's incredible! I have the vision, objectives, and now I'm working on the execution system.

Join me here 👇
${referralLink}`;

  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${content.subject}</title>
</head>
<body style="margin: 0; padding: 0; background-color: #0a0a0a; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color: #0a0a0a;">
    <tr>
      <td align="center" style="padding: 40px 20px;">
        <table role="presentation" width="600" cellpadding="0" cellspacing="0" style="max-width: 600px; background-color: #18181b; border-radius: 16px; overflow: hidden; border: 1px solid ${content.isUrgent ? '#ef444433' : '#f59e0b33'};">
          
          <!-- Header -->
          <tr>
            <td style="background: ${headerBg}; padding: 32px; text-align: center;">
              <h1 style="color: #ffffff; margin: 0; font-size: 22px; font-weight: 700; line-height: 1.4;">
                ${content.headline}
              </h1>
            </td>
          </tr>

          <!-- Main Content -->
          <tr>
            <td style="padding: 32px;">
              
              <div style="color: #a1a1aa; font-size: 16px; line-height: 1.8; margin: 0 0 24px 0; white-space: pre-line;">
${content.body}
              </div>

              <!-- Primary CTA -->
              <div style="text-align: center; margin: 32px 0;">
                <a href="https://warriorsos.com/pricing?utm_source=email&utm_medium=upgrade&utm_campaign=day2complete" 
                   style="display: inline-block; background: linear-gradient(135deg, #f59e0b 0%, #ea580c 100%); color: #ffffff; text-decoration: none; padding: 16px 48px; border-radius: 8px; font-size: 18px; font-weight: 700;">
                  ${content.ctaText} →
                </a>
              </div>

              ${content.isUrgent ? `
              <div style="background-color: #450a0a; border: 1px solid #dc2626; border-radius: 8px; padding: 16px; text-align: center; margin-bottom: 24px;">
                <p style="color: #fca5a5; margin: 0; font-size: 14px; font-weight: 600;">
                  ⏰ ${isRo ? 'Ofertă valabilă doar 48 ore' : 'Offer valid for 48 hours only'}
                </p>
              </div>
              ` : ''}

              <!-- Invite Friends Section -->
              <div style="background: linear-gradient(135deg, #78350f 0%, #451a03 100%); border-radius: 12px; padding: 24px; margin-top: 32px; border: 1px solid #f59e0b33;">
                <h3 style="color: #fbbf24; margin: 0 0 12px 0; font-size: 18px;">
                  🎁 ${isRo ? 'Invită 1-3 Prieteni' : 'Invite 1-3 Friends'}
                </h3>
                <p style="color: #fcd34d; margin: 0 0 16px 0; font-size: 14px;">
                  ${isRo ? 'Trimite-le acest mesaj:' : 'Send them this message:'}
                </p>
                <div style="background-color: #0a0a0a; border-radius: 8px; padding: 16px; font-family: monospace; font-size: 13px; color: #d4d4d8; white-space: pre-wrap; line-height: 1.6;">
${inviteMessage}
                </div>
              </div>

            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color: #0a0a0a; padding: 24px; text-align: center; border-top: 1px solid #27272a;">
              <p style="color: #71717a; margin: 0 0 8px 0; font-size: 12px;">
                WarriorOS • Have It All Lifestyle Challenge
              </p>
              <a href="${unsubscribeUrl}" style="color: #52525b; font-size: 11px; text-decoration: underline;">
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
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    // Find users who completed Day 2 but are not subscribers
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

        // Check if user is a subscriber
        const { data: subscriber } = await supabase
          .from('subscribers')
          .select('subscribed')
          .eq('user_id', p.user_id)
          .maybeSingle();

        if (subscriber?.subscribed) continue; // Already subscribed

        // Calculate which step to send
        const day2CompletedAt = new Date(p.completed_at);
        const stepNumber = getStepForUser(day2CompletedAt);
        
        if (!stepNumber) continue; // Not in a valid window

        // Get user info
        const { data: userData, error: userError } = await supabase.auth.admin.getUserById(p.user_id);
        if (userError || !userData?.user?.email) continue;

        const email = userData.user.email;
        const name = userData.user.user_metadata?.full_name || userData.user.user_metadata?.name || '';

        // Check if unsubscribed
        const { data: emailLead } = await supabase
          .from('email_leads')
          .select('subscribed')
          .eq('email', email)
          .maybeSingle();

        if (emailLead && !emailLead.subscribed) continue;

        // Check if we already sent this step
        const { data: existingLog } = await supabase
          .from('email_sequence_log')
          .select('id')
          .eq('email', email)
          .eq('sequence_type', 'challenge_upgrade')
          .eq('step_number', stepNumber)
          .maybeSingle();

        if (existingLog) continue;

        const language = 'ro' as const;
        const content = getUpgradeContent(stepNumber, name, language);
        
        const trackingId = generateTrackingId(stepNumber);
        const referralLink = `https://warriorsos.com/challenge-landing?ref=${p.user_id}`;
        const trackingPixelUrl = `${SUPABASE_URL}/functions/v1/track-email-open?t=${trackingId}`;
        const unsubscribeUrl = `${SUPABASE_URL}/functions/v1/unsubscribe-email?id=${trackingId}`;

        const { subject, html } = getEmailTemplate(content, referralLink, trackingPixelUrl, unsubscribeUrl, language);

        // Send email
        const emailResponse = await resend.emails.send({
          from: "WarriorOS <noreply@warriorsos.com>",
          to: [email],
          subject,
          html,
        });

        // Log the email
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
