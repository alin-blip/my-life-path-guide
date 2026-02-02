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
  hook: string;
  body: string;
  ctaText: string;
}

const getReactivationContent = (stepNumber: number, name: string, language: 'en' | 'ro'): EmailContent => {
  const isRo = language === 'ro';
  const firstName = name?.split(' ')[0] || 'Warrior';

  const steps: Record<number, { en: EmailContent; ro: EmailContent }> = {
    1: { // 24h
      en: {
        subject: `⏰ ${firstName}, you forgot something important...`,
        hook: "You did something rare yesterday - you decided to change your life. But you didn't finish what you started.",
        body: `You know what happens when you procrastinate? The enthusiasm dies. Motivation disappears. And in a week you'll say "I'll do it next time."

Day 1 takes 15 minutes. In 15 minutes you can have more clarity than in the last 5 years.`,
        ctaText: "Start Day 1 Now"
      },
      ro: {
        subject: `⏰ ${firstName}, ai uitat ceva important...`,
        hook: "Ai făcut ceva rar ieri - ai decis să îți schimbi viața. Dar nu ai terminat ce ai început.",
        body: `Știi ce se întâmplă când amâni? Entuziasmul moare. Motivația dispare. Și peste o săptămână îți spui "o să fac data viitoare."

Ziua 1 durează 15 minute. În 15 minute poți avea mai multă claritate decât în ultimii 5 ani.`,
        ctaText: "Începe Ziua 1 Acum"
      }
    },
    2: { // 48h
      en: {
        subject: `🤔 Is it because you don't have time, or because you're afraid of the answers?`,
        hook: "Many people don't start because they're afraid to find out the answer to 'What do I really want?'",
        body: `But that's exactly why the challenge exists - to guide you step by step, without feeling overwhelmed.

492 Warriors completed Day 1 this month. Will you?`,
        ctaText: "Take the First 5 Minutes Now"
      },
      ro: {
        subject: `🤔 E din cauză că nu ai timp, sau din cauză că ți-e frică de răspunsuri?`,
        hook: "Mulți oameni nu încep pentru că le e frică să afle răspunsul la 'Ce vreau de fapt?'",
        body: `Dar tocmai de asta challenge-ul există - să te ghideze pas cu pas, fără să te simți copleșit.

492 de Warriori au completat Ziua 1 luna asta. Tu?`,
        ctaText: "Fă Primii 5 Minute Acum"
      }
    },
    3: { // 72h
      en: {
        subject: `📉 The cost of not having a plan (is bigger than you think)`,
        hook: "In the last 72 hours, other Warriors have set their vision for 2026.",
        body: `Without a clear plan = reactive decisions
Without objectives = wasted energy
Without direction = daily frustration

Don't miss the momentum. Day 1 is ready for you.`,
        ctaText: "Catch Up on Day 1"
      },
      ro: {
        subject: `📉 Costul de a nu avea un plan (e mai mare decât crezi)`,
        hook: "În ultimele 72 de ore, alți Warriori și-au setat viziunea pentru 2026.",
        body: `Fără plan clar = decizii reactive
Fără obiective = energie risipită
Fără direcție = frustrare zilnică

Nu rata momentum-ul. Ziua 1 e gata pentru tine.`,
        ctaText: "Recuperează Ziua 1"
      }
    },
    4: { // 5 days
      en: {
        subject: `🔥 ${firstName}, we're still waiting... but not for long`,
        hook: "5 days have passed. Other Warriors are already on Day 5 - they have their routine configured and AI Coach active.",
        body: `Every day that passes is a day when others progress and you stagnate.

I understand - life is busy. But that's exactly why you need a system.`,
        ctaText: "Start Today"
      },
      ro: {
        subject: `🔥 ${firstName}, te mai așteptăm... dar nu mult`,
        hook: "Au trecut 5 zile. Alți Warriori sunt deja la Ziua 5 - au rutina configurată și AI Coach activ.",
        body: `Fiecare zi care trece e o zi în care alții progresează și tu stagnezi.

Înțeleg - viața e ocupată. Dar tocmai de asta ai nevoie de un sistem.`,
        ctaText: "Începe Astăzi"
      }
    },
    5: { // 7 days - last chance
      en: {
        subject: `🚨 FINAL NOTICE: The Challenge is Waiting`,
        hook: "This is my last attempt to bring you back.",
        body: `If you don't start today, you probably never will.

If you no longer want to receive these emails, you can unsubscribe below.`,
        ctaText: "YES, I WANT TO START"
      },
      ro: {
        subject: `🚨 ULTIMA NOTIFICARE: Challenge-ul te așteaptă`,
        hook: "Aceasta e ultima mea încercare de a te readuce.",
        body: `Dacă nu începi azi, probabil nu vei începe niciodată.

Dacă nu mai vrei să primești aceste emailuri, poți să te dezabonezi mai jos.`,
        ctaText: "DA, VREAU SĂ ÎNCEP"
      }
    }
  };

  return steps[stepNumber]?.[isRo ? 'ro' : 'en'] || steps[1][isRo ? 'ro' : 'en'];
};

const generateTrackingId = (stepNumber: number) => {
  return `challenge-reactivation-s${stepNumber}-${Date.now()}-${Math.random().toString(36).substring(2, 11)}`;
};

// Calculate which step user should receive based on signup date
const getStepForUser = (signupDate: Date): number | null => {
  const now = new Date();
  const hoursSinceSignup = (now.getTime() - signupDate.getTime()) / (1000 * 60 * 60);
  
  if (hoursSinceSignup >= 24 && hoursSinceSignup < 48) return 1;
  if (hoursSinceSignup >= 48 && hoursSinceSignup < 72) return 2;
  if (hoursSinceSignup >= 72 && hoursSinceSignup < 120) return 3; // 72-120h = 3-5 days
  if (hoursSinceSignup >= 120 && hoursSinceSignup < 168) return 4; // 120-168h = 5-7 days
  if (hoursSinceSignup >= 168 && hoursSinceSignup < 240) return 5; // 168-240h = 7-10 days
  
  return null; // Too old or too recent
};

const getEmailTemplate = (
  content: EmailContent,
  referralLink: string,
  trackingPixelUrl: string,
  unsubscribeUrl: string,
  language: 'en' | 'ro'
) => {
  const isRo = language === 'ro';

  const inviteMessage = isRo
    ? `Tocmai am început acest challenge și am o invitație exclusivă gratuită pentru tine.

Alătură-te aici 👇
${referralLink}`
    : `I just started this challenge and I have an exclusive free invite for you.

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
        <table role="presentation" width="600" cellpadding="0" cellspacing="0" style="max-width: 600px; background-color: #18181b; border-radius: 16px; overflow: hidden; border: 1px solid #ef444433;">
          
          <!-- Header -->
          <tr>
            <td style="background: linear-gradient(135deg, #dc2626 0%, #991b1b 100%); padding: 32px; text-align: center;">
              <h1 style="color: #ffffff; margin: 0; font-size: 24px; font-weight: 700;">
                ${content.hook}
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
                <a href="https://warriorsos.com/challenge/1?utm_source=email&utm_medium=reactivation&utm_campaign=abandoned" 
                   style="display: inline-block; background: linear-gradient(135deg, #f59e0b 0%, #ea580c 100%); color: #ffffff; text-decoration: none; padding: 16px 48px; border-radius: 8px; font-size: 18px; font-weight: 700;">
                  ${content.ctaText} →
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

    // Find users who:
    // 1. Have an email_leads entry (signed up)
    // 2. Either have no challenge_progress OR have day 1 incomplete
    // 3. Signed up between 24h and 10 days ago
    // 4. Are still subscribed

    const tenDaysAgo = new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString();
    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();

    const { data: leads, error: leadsError } = await supabase
      .from('email_leads')
      .select('email, created_at, metadata, subscribed, name')
      .eq('subscribed', true)
      .gte('created_at', tenDaysAgo)
      .lte('created_at', oneDayAgo);

    if (leadsError) throw leadsError;

    let emailsSent = 0;
    const errors: string[] = [];

    for (const lead of leads || []) {
      try {
        // Find user by email from auth
        const { data: authUsers } = await supabase.auth.admin.listUsers();
        const authUser = authUsers?.users?.find(u => u.email === lead.email);
        
        if (!authUser) continue;
        const userId = authUser.id;

        // Check if user has completed Day 1
        const { data: progress } = await supabase
          .from('challenge_progress')
          .select('day_number, completed')
          .eq('user_id', userId)
          .eq('day_number', 1)
          .maybeSingle();

        // Skip if Day 1 is complete
        if (progress?.completed) continue;

        // Calculate which step to send
        const signupDate = new Date(lead.created_at);
        const stepNumber = getStepForUser(signupDate);
        
        if (!stepNumber) continue; // Not in a valid window

        // Check if we already sent this step
        const { data: existingLog } = await supabase
          .from('email_sequence_log')
          .select('id')
          .eq('email', lead.email)
          .eq('sequence_type', 'challenge_reactivation')
          .eq('step_number', stepNumber)
          .maybeSingle();

        if (existingLog) continue;

        // Get user name from auth if possible
        const name = authUser.user_metadata?.full_name || authUser.user_metadata?.name || lead.name || '';

        const language = 'ro' as const;
        const content = getReactivationContent(stepNumber, name, language);
        
        const trackingId = generateTrackingId(stepNumber);
        const referralLink = `https://warriorsos.com/challenge-landing?ref=${userId}`;
        const trackingPixelUrl = `${SUPABASE_URL}/functions/v1/track-email-open?t=${trackingId}`;
        const unsubscribeUrl = `${SUPABASE_URL}/functions/v1/unsubscribe-email?id=${trackingId}`;

        const { subject, html } = getEmailTemplate(content, referralLink, trackingPixelUrl, unsubscribeUrl, language);

        // Send email
        const emailResponse = await resend.emails.send({
          from: "WarriorOS <noreply@warriorsos.com>",
          to: [lead.email],
          subject,
          html,
        });

        // Log the email
        await supabase.from('email_sequence_log').insert({
          email: lead.email,
          sequence_type: 'challenge_reactivation',
          tracking_id: trackingId,
          step_number: stepNumber,
          sent_at: new Date().toISOString(),
          metadata: {
            user_id: userId,
            language,
            resend_id: (emailResponse as any)?.data?.id || null
          }
        });

        emailsSent++;
        console.log(`Reactivation email step ${stepNumber} sent to ${lead.email}`);

      } catch (err: any) {
        errors.push(`Error for ${lead.email}: ${err.message}`);
        console.error(`Error processing ${lead.email}:`, err);
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
    console.error("Error in send-challenge-reactivation:", error);
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
