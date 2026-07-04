import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { Resend } from "https://esm.sh/resend@2.0.0";
import { requireCronOrAdmin } from "../_shared/require-cron-or-admin.ts";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY")!;

const resend = new Resend(RESEND_API_KEY);

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

interface DayContent {
  subject: string;
  title: string;
  description: string;
  benefits: string[];
}

const getDayContent = (dayNumber: number, language: 'en' | 'ro'): DayContent => {
  const isRo = language === 'ro';
  
  const days: Record<number, { en: DayContent; ro: DayContent }> = {
    1: {
      en: {
        subject: 'Day 1: Your 2026 Vision Starts Now',
        title: 'Vision & Clarity',
        description: 'Today you answer the Napoleon Hill questions that will change your perspective on life.',
        benefits: [
          'Define your Definite Chief Aim for 2026',
          'Create your personal Fact Map across 4 life areas',
          'Set your target date and commitment'
        ],
      },
      ro: {
        subject: 'Ziua 1: Viziunea ta pentru 2026',
        title: 'Viziune & Claritate',
        description: 'Astazi raspunzi la intrebarile Napoleon Hill care iti vor schimba perspectiva asupra vietii.',
        benefits: [
          'Defineste-ti Telul Principal Definit pentru 2026',
          'Creeaza Fact Map-ul personal in 4 arii de viata',
          'Seteaza data tinta si angajamentul tau'
        ],
      }
    },
    2: {
      en: {
        subject: 'Day 2: Body, Spirit & Relationships',
        title: 'Body, Spirit & Relationships',
        description: 'Today you set clear objectives for your health, inner balance, and meaningful relationships.',
        benefits: [
          'Define your health and fitness goals',
          'Create your spiritual growth plan',
          'Map your key relationships and actions'
        ],
      },
      ro: {
        subject: 'Ziua 2: Corp, Spirit & Echilibru',
        title: 'Corp, Spirit & Relatii',
        description: 'Astazi setezi obiective clare pentru sanatate, echilibru interior si relatii semnificative.',
        benefits: [
          'Defineste-ti obiectivele de sanatate si fitness',
          'Creeaza planul de crestere spirituala',
          'Mapeaza relatiile cheie si actiunile necesare'
        ],
      }
    },
    3: {
      en: {
        subject: 'Day 3: Business + Domino Door System',
        title: 'Business & Domino Door',
        description: 'Today you set up the weekly execution system that guarantees progress.',
        benefits: [
          'Define your 2026 business milestone',
          'Learn the Domino Door weekly planning system',
          'Create your first HIT/HOT/DO lists'
        ],
      },
      ro: {
        subject: 'Ziua 3: Business + Sistemul Domino Door',
        title: 'Business & Domino Door',
        description: 'Astazi configurezi sistemul de executie saptamanala care garanteaza progres.',
        benefits: [
          'Defineste milestone-ul business pentru 2026',
          'Invata sistemul de planificare saptamanala Domino Door',
          'Creeaza primele liste HIT/HOT/DO'
        ],
      }
    },
    4: {
      en: {
        subject: 'Day 4: Warrior Routine + AI Meditation',
        title: 'Warrior Routine',
        description: 'Today you create your automated daily routine and AI-powered Vision Board.',
        benefits: [
          'Configure your personalized morning routine',
          'Generate your AI Vision Board images',
          'Set up guided meditation with your goals'
        ],
      },
      ro: {
        subject: 'Ziua 4: Warrior Routine + Meditatie AI',
        title: 'Warrior Routine',
        description: 'Astazi iti creezi rutina zilnica automatizata si Vision Board-ul generat de AI.',
        benefits: [
          'Configureaza rutina matinala personalizata',
          'Genereaza imaginile Vision Board cu AI',
          'Seteaza meditatia ghidata cu obiectivele tale'
        ],
      }
    },
    5: {
      en: {
        subject: 'Day 5: Accountability & Mind Coach',
        title: 'Accountability & Mind Coach',
        description: 'Today you activate the AI that keeps you on track and transforms fears into action.',
        benefits: [
          'Meet your personal Accountability Coach AI',
          'Learn to transform fears and limiting beliefs',
          'Create your breakthrough action plan'
        ],
      },
      ro: {
        subject: 'Ziua 5: Accountability & Mind Coach',
        title: 'Accountability & Mind Coach',
        description: 'Astazi activezi AI-ul care te tine pe drumul cel bun si transforma fricile in actiune.',
        benefits: [
          'Cunoaste-ti Coach-ul personal de Accountability AI',
          'Invata sa transformi fricile si convingerile limitatoare',
          'Creeaza planul de actiune pentru breakthrough'
        ],
      }
    },
    6: {
      en: {
        subject: 'Day 6: Mental Control & Ideas',
        title: 'Mental Control & Ideas',
        description: 'Today you learn to control mental distractions and prioritize with Eisenhower Matrix.',
        benefits: [
          'Master the Eisenhower Matrix for focus',
          'Organize your idea inbox effectively',
          'Create systems for mental clarity'
        ],
      },
      ro: {
        subject: 'Ziua 6: Control Mental & Idei',
        title: 'Control Mental & Idei',
        description: 'Astazi inveti sa controlezi distractiile mentale si sa prioritizezi cu Eisenhower Matrix.',
        benefits: [
          'Stapaneste Eisenhower Matrix pentru focus',
          'Organizeaza inbox-ul de idei eficient',
          'Creeaza sisteme pentru claritate mentala'
        ],
      }
    },
    7: {
      en: {
        subject: 'Day 7: Completion & Growth',
        title: 'Continuity & Growth',
        description: 'Today you complete the challenge and integrate everything into your daily life.',
        benefits: [
          'Review your complete transformation',
          'Integrate all systems into daily habits',
          'Plan your next 90 days of growth'
        ],
      },
      ro: {
        subject: 'Ziua 7: Finalizare & Crestere',
        title: 'Continuitate & Crestere',
        description: 'Astazi finalizezi challenge-ul si integrezi totul in viata ta zilnica.',
        benefits: [
          'Recapituleaza transformarea completa',
          'Integreaza toate sistemele in obiceiuri zilnice',
          'Planifica urmatoarele 90 de zile de crestere'
        ],
      }
    }
  };

  return days[dayNumber]?.[isRo ? 'ro' : 'en'] || days[1][isRo ? 'ro' : 'en'];
};

const generateTrackingId = (dayNumber: number) => {
  return `challenge-daily-d${dayNumber}-${Date.now()}-${Math.random().toString(36).substring(2, 11)}`;
};

const getEmailTemplate = (
  name: string,
  dayNumber: number,
  content: DayContent,
  trackingPixelUrl: string,
  unsubscribeUrl: string,
  language: 'en' | 'ro'
) => {
  const isRo = language === 'ro';
  const firstName = name?.split(' ')[0] || 'Warrior';
  const progressPercent = Math.round((dayNumber / 7) * 100);

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
              <h1 style="margin: 0; font-size: 24px; font-weight: 700; color: #111827;">
                ${content.title}
              </h1>
            </td>
          </tr>

          <!-- Progress Bar -->
          <tr>
            <td style="padding: 24px 32px 0 32px;">
              <p style="color: #6b7280; margin: 0 0 8px 0; font-size: 13px;">
                ${isRo ? `Ziua ${dayNumber} din 7` : `Day ${dayNumber} of 7`} — ${progressPercent}%
              </p>
              <div style="background-color: #e5e7eb; border-radius: 6px; height: 8px; overflow: hidden;">
                <div style="background-color: #111827; height: 100%; width: ${progressPercent}%; border-radius: 6px;"></div>
              </div>
            </td>
          </tr>

          <!-- Main Content -->
          <tr>
            <td style="padding: 24px 32px 32px 32px;">
              
              <p style="color: #374151; font-size: 16px; line-height: 1.6; margin: 0 0 20px 0;">
                ${isRo ? `Buna ${firstName},` : `Hi ${firstName},`}
              </p>

              <p style="color: #4b5563; font-size: 15px; line-height: 1.6; margin: 0 0 24px 0;">
                ${content.description}
              </p>

              <!-- Benefits List -->
              <div style="background-color: #f9fafb; border-radius: 8px; padding: 20px; margin-bottom: 24px; border: 1px solid #e5e7eb;">
                <p style="color: #111827; margin: 0 0 12px 0; font-size: 14px; font-weight: 600;">
                  ${isRo ? 'Ce vei realiza astazi:' : 'What you will accomplish today:'}
                </p>
                <ul style="color: #374151; margin: 0; padding-left: 18px; line-height: 1.8; font-size: 14px;">
                  ${content.benefits.map(b => `<li>${b}</li>`).join('')}
                </ul>
              </div>

              <!-- Primary CTA -->
              <div style="text-align: center; margin: 28px 0 0 0;">
                <a href="https://ceomindos.com/challenge/${dayNumber}?utm_source=email&utm_medium=daily&utm_campaign=day${dayNumber}" 
                   style="display: inline-block; background-color: #111827; color: #ffffff; text-decoration: none; padding: 14px 40px; border-radius: 8px; font-size: 15px; font-weight: 600;">
                  ${isRo ? `Continua Ziua ${dayNumber}` : `Continue Day ${dayNumber}`}
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

interface ManualRequest {
  email?: string;
  name?: string;
  userId?: string;
  dayNumber?: number;
  language?: 'en' | 'ro';
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  // Manual and automatic modes both require cron secret or admin JWT.
  const authFail = await requireCronOrAdmin(req, corsHeaders);
  if (authFail) return authFail;

  try {
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
    
    let manualRequest: ManualRequest | null = null;
    try {
      const body = await req.json();
      if (body.email) {
        manualRequest = body;
      }
    } catch {
      // No body or invalid JSON - proceed with automatic mode
    }

    // MANUAL MODE
    if (manualRequest?.email && manualRequest?.dayNumber) {
      const { email, name, dayNumber, language = 'ro' } = manualRequest;
      
      const content = getDayContent(dayNumber, language);
      const trackingId = generateTrackingId(dayNumber);
      const trackingPixelUrl = `${SUPABASE_URL}/functions/v1/track-email-open?t=${trackingId}`;
      const unsubscribeUrl = `${SUPABASE_URL}/functions/v1/unsubscribe-email?id=${trackingId}`;

      const { subject, html } = getEmailTemplate(
        name || 'Warrior', 
        dayNumber, 
        content, 
        trackingPixelUrl, 
        unsubscribeUrl, 
        language
      );

      const emailResponse = await resend.emails.send({
        from: "CEO Mind OS <noreply@ceomindos.com>",
        to: [email],
        subject,
        html,
      });

      console.log(`Manual email sent to ${email} for day ${dayNumber}`);

      return new Response(JSON.stringify({ 
        success: true, 
        emailsSent: 1,
        email,
        dayNumber,
        resendId: (emailResponse as any)?.data?.id
      }), {
        status: 200,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    // AUTOMATIC MODE
    const { data: users, error: usersError } = await supabase
      .from('challenge_progress')
      .select('user_id, day_number, completed, created_at')
      .order('created_at', { ascending: false });

    if (usersError) {
      console.error('Error fetching users:', usersError);
      throw usersError;
    }

    const userProgressMap = new Map<string, { dayNumber: number; completed: boolean }>();
    users?.forEach(p => {
      const existing = userProgressMap.get(p.user_id);
      if (!existing || p.day_number > existing.dayNumber) {
        userProgressMap.set(p.user_id, { dayNumber: p.day_number, completed: p.completed || false });
      }
    });

    let emailsSent = 0;
    const errors: string[] = [];

    for (const [userId, progress] of userProgressMap) {
      try {
        const nextDay = progress.completed ? Math.min(progress.dayNumber + 1, 7) : progress.dayNumber;
        
        if (progress.dayNumber === 7 && progress.completed) continue;

        const { data: existingLog } = await supabase
          .from('email_sequence_log')
          .select('id')
          .eq('metadata->>user_id', userId)
          .eq('sequence_type', 'challenge_daily')
          .eq('step_number', nextDay)
          .maybeSingle();

        if (existingLog) continue;

        const { data: userData, error: userError } = await supabase.auth.admin.getUserById(userId);
        if (userError || !userData?.user?.email) continue;

        const email = userData.user.email;
        const name = userData.user.user_metadata?.full_name || userData.user.user_metadata?.name || '';
        
        const { data: emailLead } = await supabase
          .from('email_leads')
          .select('subscribed, metadata, language')
          .eq('email', email)
          .maybeSingle();

        if (emailLead && !emailLead.subscribed) continue;

        // Resolve language: prefer user's saved preference, then lead's language, else 'ro'
        let language: 'ro' | 'en' = (emailLead?.language === 'en' ? 'en' : 'ro');
        try {
          const { data: prefLang } = await supabase.rpc('get_user_language_by_email', { user_email: email });
          if (prefLang === 'en' || prefLang === 'ro') language = prefLang;
        } catch {}
        const content = getDayContent(nextDay, language);
        
        const trackingId = generateTrackingId(nextDay);
        const trackingPixelUrl = `${SUPABASE_URL}/functions/v1/track-email-open?t=${trackingId}`;
        const unsubscribeUrl = `${SUPABASE_URL}/functions/v1/unsubscribe-email?id=${trackingId}`;

        const { subject, html } = getEmailTemplate(name, nextDay, content, trackingPixelUrl, unsubscribeUrl, language);

        const emailResponse = await resend.emails.send({
          from: "CEO Mind OS <noreply@ceomindos.com>",
          to: [email],
          subject,
          html,
        });

        await supabase.from('email_sequence_log').insert({
          email,
          sequence_type: 'challenge_daily',
          tracking_id: trackingId,
          step_number: nextDay,
          sent_at: new Date().toISOString(),
          metadata: {
            user_id: userId,
            language,
            resend_id: (emailResponse as any)?.data?.id || null
          }
        });

        emailsSent++;
        console.log(`Daily email sent to ${email} for day ${nextDay}`);

      } catch (err: any) {
        errors.push(`Error for user ${userId}: ${err.message}`);
        console.error(`Error processing user ${userId}:`, err);
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
    console.error("Error in send-challenge-daily:", error);
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
