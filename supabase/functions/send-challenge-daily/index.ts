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

interface DayContent {
  subject: string;
  emoji: string;
  title: string;
  description: string;
  benefits: string[];
  inviteMessage: string;
}

const getDayContent = (dayNumber: number, language: 'en' | 'ro'): DayContent => {
  const isRo = language === 'ro';
  
  const days: Record<number, { en: DayContent; ro: DayContent }> = {
    1: {
      en: {
        subject: '🔥 Day 1: Your 2026 Vision Starts Now',
        emoji: '🔥',
        title: 'Vision & Clarity',
        description: 'Today you answer the Napoleon Hill questions that will change your perspective on life.',
        benefits: [
          'Define your Definite Chief Aim for 2026',
          'Create your personal Fact Map across 4 life areas',
          'Set your target date and commitment'
        ],
        inviteMessage: `I just started this challenge and I have an exclusive free invite for you.

Here's what happens over the next 7 days:
• Day 1: Vision & Clarity
• Day 2: Body, Spirit & Relationships
• Day 3: Business & Execution
• Day 4: Daily Execution Routine
• Day 5: Accountability & Mindset
• Day 6: Strategic Thinking & Ideas
• Day 7: Continuity & Growth

Join me here 👇`
      },
      ro: {
        subject: '🔥 Ziua 1: Viziunea ta pentru 2026 începe acum',
        emoji: '🔥',
        title: 'Viziune & Claritate',
        description: 'Astăzi răspunzi la întrebările Napoleon Hill care îți vor schimba perspectiva asupra vieții.',
        benefits: [
          'Definește-ți Țelul Principal Definit pentru 2026',
          'Creează Fact Map-ul personal în 4 arii de viață',
          'Setează data țintă și angajamentul tău'
        ],
        inviteMessage: `Tocmai am început acest challenge și am o invitație exclusivă gratuită pentru tine.

Uite ce se întâmplă în următoarele 7 zile:
• Ziua 1: Viziune & Claritate
• Ziua 2: Corp, Spirit & Relații
• Ziua 3: Business & Execuție
• Ziua 4: Rutina Zilnică de Execuție
• Ziua 5: Accountability & Mindset
• Ziua 6: Gândire Strategică & Idei
• Ziua 7: Continuitate & Creștere

Alătură-te aici 👇`
      }
    },
    2: {
      en: {
        subject: '💪 Day 2: Body, Spirit & Relationships',
        emoji: '💪',
        title: 'Body, Spirit & Relationships',
        description: 'Today you set clear objectives for your health, inner balance, and meaningful relationships.',
        benefits: [
          'Define your health and fitness goals',
          'Create your spiritual growth plan',
          'Map your key relationships and actions'
        ],
        inviteMessage: `I'm on Day 2! Yesterday I set my vision for 2026. Today I'm working on Body, Spirit & Relationships.

Join the challenge here 👇`
      },
      ro: {
        subject: '💪 Ziua 2: Corp, Spirit & Echilibru',
        emoji: '💪',
        title: 'Corp, Spirit & Relații',
        description: 'Astăzi setezi obiective clare pentru sănătate, echilibru interior și relații semnificative.',
        benefits: [
          'Definește-ți obiectivele de sănătate și fitness',
          'Creează planul de creștere spirituală',
          'Mapează relațiile cheie și acțiunile necesare'
        ],
        inviteMessage: `Sunt în Ziua 2! Ieri mi-am setat viziunea pentru 2026. Azi lucrez la Corp, Spirit & Relații.

Alătură-te challenge-ului aici 👇`
      }
    },
    3: {
      en: {
        subject: '🎯 Day 3: Business + Domino Door System',
        emoji: '🎯',
        title: 'Business & Domino Door',
        description: 'Today you set up the weekly execution system that guarantees progress.',
        benefits: [
          'Define your 2026 business milestone',
          'Learn the Domino Door weekly planning system',
          'Create your first HIT/HOT/DO lists'
        ],
        inviteMessage: `Day 3! I've set my vision and life objectives. Today I'm building my weekly execution system with Domino Door.

Join me here 👇`
      },
      ro: {
        subject: '🎯 Ziua 3: Business + Sistemul Domino Door',
        emoji: '🎯',
        title: 'Business & Domino Door',
        description: 'Astăzi configurezi sistemul de execuție săptămânală care garantează progres.',
        benefits: [
          'Definește milestone-ul business pentru 2026',
          'Învață sistemul de planificare săptămânală Domino Door',
          'Creează primele liste HIT/HOT/DO'
        ],
        inviteMessage: `Ziua 3! Mi-am setat viziunea și obiectivele de viață. Azi îmi construiesc sistemul de execuție săptămânală cu Domino Door.

Alătură-te aici 👇`
      }
    },
    4: {
      en: {
        subject: '⚡ Day 4: Warrior Routine + AI Meditation',
        emoji: '⚡',
        title: 'Warrior Routine',
        description: 'Today you create your automated daily routine and AI-powered Vision Board.',
        benefits: [
          'Configure your personalized morning routine',
          'Generate your AI Vision Board images',
          'Set up guided meditation with your goals'
        ],
        inviteMessage: `Day 4! I've configured my Warrior Routine and created my AI Vision Board. The meditation is personalized with MY goals!

Join the challenge 👇`
      },
      ro: {
        subject: '⚡ Ziua 4: Warrior Routine + Meditație AI',
        emoji: '⚡',
        title: 'Warrior Routine',
        description: 'Astăzi îți creezi rutina zilnică automatizată și Vision Board-ul generat de AI.',
        benefits: [
          'Configurează rutina matinală personalizată',
          'Generează imaginile Vision Board cu AI',
          'Setează meditația ghidată cu obiectivele tale'
        ],
        inviteMessage: `Ziua 4! Mi-am configurat Warrior Routine și am creat Vision Board-ul cu AI. Meditația e personalizată cu obiectivele MELE!

Alătură-te challenge-ului 👇`
      }
    },
    5: {
      en: {
        subject: '🧠 Day 5: Accountability & Mind Coach',
        emoji: '🧠',
        title: 'Accountability & Mind Coach',
        description: 'Today you activate the AI that keeps you on track and transforms fears into action.',
        benefits: [
          'Meet your personal Accountability Coach AI',
          'Learn to transform fears and limiting beliefs',
          'Create your breakthrough action plan'
        ],
        inviteMessage: `Day 5! The Accountability Coach AI knows EVERYTHING I need to do. And the Mind Coach helps me transform fears into action.

This is game-changing 👇`
      },
      ro: {
        subject: '🧠 Ziua 5: Accountability & Mind Coach',
        emoji: '🧠',
        title: 'Accountability & Mind Coach',
        description: 'Astăzi activezi AI-ul care te ține pe drumul cel bun și transformă fricile în acțiune.',
        benefits: [
          'Cunoaște-ți Coach-ul personal de Accountability AI',
          'Învață să transformi fricile și convingerile limitatoare',
          'Creează planul de acțiune pentru breakthrough'
        ],
        inviteMessage: `Ziua 5! Accountability Coach-ul AI știe TOT ce am de făcut. Și Mind Coach-ul mă ajută să transform fricile în acțiune.

E game-changing 👇`
      }
    },
    6: {
      en: {
        subject: '💡 Day 6: Mental Control & Ideas',
        emoji: '💡',
        title: 'Mental Control & Ideas',
        description: 'Today you learn to control mental distractions and prioritize with Eisenhower Matrix.',
        benefits: [
          'Master the Eisenhower Matrix for focus',
          'Organize your idea inbox effectively',
          'Create systems for mental clarity'
        ],
        inviteMessage: `Day 6! I've learned to control distracting ideas using the Eisenhower Matrix. Mental clarity is incredible!

Only 1 day left 👇`
      },
      ro: {
        subject: '💡 Ziua 6: Control Mental & Idei',
        emoji: '💡',
        title: 'Control Mental & Idei',
        description: 'Astăzi înveți să controlezi distracțiile mentale și să prioritizezi cu Eisenhower Matrix.',
        benefits: [
          'Stăpânește Eisenhower Matrix pentru focus',
          'Organizează inbox-ul de idei eficient',
          'Creează sisteme pentru claritate mentală'
        ],
        inviteMessage: `Ziua 6! Am învățat să controlez ideile care mă distrag folosind Eisenhower Matrix. Claritatea mentală e incredibilă!

Mai e doar 1 zi 👇`
      }
    },
    7: {
      en: {
        subject: '🏆 Day 7: Completion & Growth!',
        emoji: '🏆',
        title: 'Continuity & Growth',
        description: 'Today you complete the challenge and integrate everything into your daily life.',
        benefits: [
          'Review your complete transformation',
          'Integrate all systems into daily habits',
          'Plan your next 90 days of growth'
        ],
        inviteMessage: `I just completed the 7-Day Challenge! My vision, objectives, weekly execution system, daily routine - everything is set.

Start your transformation 👇`
      },
      ro: {
        subject: '🏆 Ziua 7: Finalizare & Creștere!',
        emoji: '🏆',
        title: 'Continuitate & Creștere',
        description: 'Astăzi finalizezi challenge-ul și integrezi totul în viața ta zilnică.',
        benefits: [
          'Recapitulează transformarea completă',
          'Integrează toate sistemele în obiceiuri zilnice',
          'Planifică următoarele 90 de zile de creștere'
        ],
        inviteMessage: `Tocmai am terminat Challenge-ul de 7 Zile! Viziunea, obiectivele, sistemul de execuție săptămânală, rutina zilnică - totul e setat.

Începe-ți transformarea 👇`
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
  referralLink: string,
  trackingPixelUrl: string,
  unsubscribeUrl: string,
  language: 'en' | 'ro'
) => {
  const isRo = language === 'ro';
  const firstName = name?.split(' ')[0] || 'Warrior';
  const progressPercent = Math.round((dayNumber / 7) * 100);
  
  const inviteMessage = content.inviteMessage + '\n' + referralLink;

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
        <table role="presentation" width="600" cellpadding="0" cellspacing="0" style="max-width: 600px; background-color: #18181b; border-radius: 16px; overflow: hidden; border: 1px solid #f59e0b33;">
          
          <!-- Progress Bar Header -->
          <tr>
            <td style="padding: 24px 32px; background-color: #27272a;">
              <p style="color: #a1a1aa; margin: 0 0 8px 0; font-size: 12px; text-transform: uppercase; letter-spacing: 1px;">
                ${isRo ? 'Progresul tău' : 'Your Progress'}
              </p>
              <div style="background-color: #3f3f46; border-radius: 10px; height: 12px; overflow: hidden;">
                <div style="background: linear-gradient(90deg, #f59e0b 0%, #ea580c 100%); height: 100%; width: ${progressPercent}%; border-radius: 10px;"></div>
              </div>
              <p style="color: #fbbf24; margin: 8px 0 0 0; font-size: 14px; font-weight: 600;">
                ${isRo ? `Ziua ${dayNumber}/7 • ${progressPercent}% complet` : `Day ${dayNumber}/7 • ${progressPercent}% complete`}
              </p>
            </td>
          </tr>

          <!-- Header -->
          <tr>
            <td style="background: linear-gradient(135deg, #f59e0b 0%, #ea580c 100%); padding: 32px; text-align: center;">
              <h1 style="color: #ffffff; margin: 0; font-size: 32px;">
                ${content.emoji}
              </h1>
              <h2 style="color: #ffffff; margin: 12px 0 0 0; font-size: 24px; font-weight: 700;">
                ${content.title}
              </h2>
            </td>
          </tr>

          <!-- Main Content -->
          <tr>
            <td style="padding: 32px;">
              
              <p style="color: #e4e4e7; font-size: 16px; line-height: 1.6; margin: 0 0 24px 0;">
                ${isRo ? `Bună ${firstName}!` : `Hi ${firstName}!`}
              </p>

              <p style="color: #a1a1aa; font-size: 16px; line-height: 1.6; margin: 0 0 24px 0;">
                ${content.description}
              </p>

              <!-- Benefits List -->
              <div style="background-color: #27272a; border-radius: 12px; padding: 24px; margin-bottom: 24px;">
                <h3 style="color: #22c55e; margin: 0 0 16px 0; font-size: 16px;">
                  ✅ ${isRo ? 'Ce vei realiza astăzi:' : 'What you will accomplish today:'}
                </h3>
                <ul style="color: #e4e4e7; margin: 0; padding-left: 20px; line-height: 2;">
                  ${content.benefits.map(b => `<li>${b}</li>`).join('')}
                </ul>
              </div>

              <!-- Primary CTA -->
              <div style="text-align: center; margin: 32px 0;">
                <a href="https://warriorsos.com/challenge/${dayNumber}?utm_source=email&utm_medium=daily&utm_campaign=day${dayNumber}" 
                   style="display: inline-block; background: linear-gradient(135deg, #f59e0b 0%, #ea580c 100%); color: #ffffff; text-decoration: none; padding: 16px 48px; border-radius: 8px; font-size: 18px; font-weight: 700;">
                  ${isRo ? `Continuă Ziua ${dayNumber} →` : `Continue Day ${dayNumber} →`}
                </a>
              </div>

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

    // Get users who should receive daily emails
    // This finds users based on challenge_progress or email_leads signup date
    const { data: users, error: usersError } = await supabase
      .from('challenge_progress')
      .select('user_id, day_number, completed, created_at')
      .order('created_at', { ascending: false });

    if (usersError) {
      console.error('Error fetching users:', usersError);
      throw usersError;
    }

    // Group by user to get their latest progress
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
        // Calculate next day to send
        const nextDay = progress.completed ? Math.min(progress.dayNumber + 1, 7) : progress.dayNumber;
        
        // Skip if already completed day 7
        if (progress.dayNumber === 7 && progress.completed) continue;

        // Check if we already sent this day's email
        const { data: existingLog } = await supabase
          .from('email_sequence_log')
          .select('id')
          .eq('metadata->>user_id', userId)
          .eq('sequence_type', 'challenge_daily')
          .eq('step_number', nextDay)
          .maybeSingle();

        if (existingLog) continue;

        // Get user email from auth
        const { data: userData, error: userError } = await supabase.auth.admin.getUserById(userId);
        if (userError || !userData?.user?.email) continue;

        const email = userData.user.email;
        const name = userData.user.user_metadata?.full_name || userData.user.user_metadata?.name || '';
        
        // Check subscription status (to determine language preference)
        const { data: emailLead } = await supabase
          .from('email_leads')
          .select('subscribed, metadata')
          .eq('email', email)
          .maybeSingle();

        if (emailLead && !emailLead.subscribed) continue; // Unsubscribed

        const language = 'ro' as const; // Default to Romanian
        const content = getDayContent(nextDay, language);
        
        const trackingId = generateTrackingId(nextDay);
        const referralLink = `https://warriorsos.com/challenge-landing?ref=${userId}`;
        const trackingPixelUrl = `${SUPABASE_URL}/functions/v1/track-email-open?t=${trackingId}`;
        const unsubscribeUrl = `${SUPABASE_URL}/functions/v1/unsubscribe-email?id=${trackingId}`;

        const { subject, html } = getEmailTemplate(name, nextDay, content, referralLink, trackingPixelUrl, unsubscribeUrl, language);

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
