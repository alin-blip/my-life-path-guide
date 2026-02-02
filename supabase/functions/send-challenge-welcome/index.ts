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

interface WelcomeEmailRequest {
  email: string;
  name?: string;
  userId: string;
  language?: 'en' | 'ro';
}

const generateTrackingId = () => {
  return `challenge-welcome-${Date.now()}-${Math.random().toString(36).substring(2, 11)}`;
};

const getEmailTemplate = (
  name: string,
  referralLink: string,
  trackingPixelUrl: string,
  unsubscribeUrl: string,
  language: 'en' | 'ro'
) => {
  const isRo = language === 'ro';
  const firstName = name?.split(' ')[0] || (isRo ? 'Warrior' : 'Warrior');

  const subject = isRo 
    ? `🎉 Felicitări, ${firstName}! Challenge-ul "Have It All Lifestyle" Începe Acum!`
    : `🎉 Congratulations, ${firstName}! The "Have It All Lifestyle" Challenge Starts Now!`;

  const inviteMessage = isRo
    ? `Tocmai am început acest challenge și am o invitație exclusivă gratuită pentru tine.

Uite ce se întâmplă în următoarele 7 zile:
• Ziua 1: Viziune & Claritate
• Ziua 2: Corp, Spirit & Relații
• Ziua 3: Business & Execuție
• Ziua 4: Rutina Zilnică de Execuție
• Ziua 5: Accountability & Mindset
• Ziua 6: Gândire Strategică & Idei
• Ziua 7: Continuitate & Creștere

Alătură-te aici 👇
${referralLink}`
    : `I just started this challenge and I have an exclusive free invite for you.

Here's what happens over the next 7 days:
• Day 1: Vision & Clarity
• Day 2: Body, Spirit & Relationships
• Day 3: Business & Execution
• Day 4: Daily Execution Routine
• Day 5: Accountability & Mindset
• Day 6: Strategic Thinking & Ideas
• Day 7: Continuity & Growth

Join me here 👇
${referralLink}`;

  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${subject}</title>
</head>
<body style="margin: 0; padding: 0; background-color: #0a0a0a; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color: #0a0a0a;">
    <tr>
      <td align="center" style="padding: 40px 20px;">
        <table role="presentation" width="600" cellpadding="0" cellspacing="0" style="max-width: 600px; background-color: #18181b; border-radius: 16px; overflow: hidden; border: 1px solid #f59e0b33;">
          
          <!-- Header -->
          <tr>
            <td style="background: linear-gradient(135deg, #f59e0b 0%, #ea580c 100%); padding: 32px; text-align: center;">
              <h1 style="color: #ffffff; margin: 0; font-size: 28px; font-weight: 700;">
                🎉 ${isRo ? 'Felicitări, Warrior!' : 'Congratulations, Warrior!'}
              </h1>
              <p style="color: #ffffff; margin: 12px 0 0 0; font-size: 16px; opacity: 0.9;">
                ${isRo ? 'Ai făcut primul pas. Majoritatea oamenilor nu ajung nici aici.' : "You've taken the first step. Most people never even get this far."}
              </p>
            </td>
          </tr>

          <!-- Main Content -->
          <tr>
            <td style="padding: 32px;">
              
              <!-- Problem Section -->
              <div style="background-color: #27272a; border-radius: 12px; padding: 24px; margin-bottom: 24px; border-left: 4px solid #ef4444;">
                <h2 style="color: #ef4444; margin: 0 0 16px 0; font-size: 18px;">
                  ${isRo ? '❌ Fără un plan clar...' : '❌ Without a clear plan...'}
                </h2>
                <ul style="color: #a1a1aa; margin: 0; padding-left: 20px; line-height: 1.8;">
                  <li>${isRo ? 'Trăiești pe pilot automat, reacționând la viață în loc să o creezi' : 'You live on autopilot, reacting to life instead of creating it'}</li>
                  <li>${isRo ? 'Zilele trec fără progres real către visurile tale' : 'Days pass without real progress toward your dreams'}</li>
                  <li>${isRo ? 'Te simți copleșit, fără direcție clară' : 'You feel overwhelmed, without clear direction'}</li>
                  <li>${isRo ? 'Energia și motivația fluctuează constant' : 'Energy and motivation fluctuate constantly'}</li>
                </ul>
              </div>

              <!-- Solution Section -->
              <div style="background-color: #27272a; border-radius: 12px; padding: 24px; margin-bottom: 24px; border-left: 4px solid #22c55e;">
                <h2 style="color: #22c55e; margin: 0 0 16px 0; font-size: 18px;">
                  ✅ ${isRo ? 'În următoarele 7 zile vei primi:' : 'In the next 7 days you will receive:'}
                </h2>
                <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
                  <tr>
                    <td style="padding: 8px 0; border-bottom: 1px solid #3f3f46;">
                      <span style="color: #f59e0b; font-weight: 600;">🔥 ${isRo ? 'Ziua 1' : 'Day 1'}:</span>
                      <span style="color: #e4e4e7;"> ${isRo ? 'Viziune & Claritate' : 'Vision & Clarity'}</span>
                      <p style="color: #71717a; margin: 4px 0 0 0; font-size: 13px;">${isRo ? 'Răspunzi la întrebări care îți schimbă perspectiva asupra vieții' : 'Answer questions that change your perspective on life'}</p>
                    </td>
                  </tr>
                  <tr>
                    <td style="padding: 8px 0; border-bottom: 1px solid #3f3f46;">
                      <span style="color: #f59e0b; font-weight: 600;">💪 ${isRo ? 'Ziua 2' : 'Day 2'}:</span>
                      <span style="color: #e4e4e7;"> ${isRo ? 'Corp, Spirit & Relații' : 'Body, Spirit & Relationships'}</span>
                      <p style="color: #71717a; margin: 4px 0 0 0; font-size: 13px;">${isRo ? 'Obiective clare pentru sănătate, echilibru interior și relații' : 'Clear objectives for health, inner balance and relationships'}</p>
                    </td>
                  </tr>
                  <tr>
                    <td style="padding: 8px 0; border-bottom: 1px solid #3f3f46;">
                      <span style="color: #f59e0b; font-weight: 600;">🎯 ${isRo ? 'Ziua 3' : 'Day 3'}:</span>
                      <span style="color: #e4e4e7;"> ${isRo ? 'Business & Domino Door' : 'Business & Domino Door'}</span>
                      <p style="color: #71717a; margin: 4px 0 0 0; font-size: 13px;">${isRo ? 'Sistemul de execuție săptămânală care garantează progres' : 'The weekly execution system that guarantees progress'}</p>
                    </td>
                  </tr>
                  <tr>
                    <td style="padding: 8px 0; border-bottom: 1px solid #3f3f46;">
                      <span style="color: #f59e0b; font-weight: 600;">⚡ ${isRo ? 'Ziua 4' : 'Day 4'}:</span>
                      <span style="color: #e4e4e7;"> ${isRo ? 'Warrior Routine' : 'Warrior Routine'}</span>
                      <p style="color: #71717a; margin: 4px 0 0 0; font-size: 13px;">${isRo ? 'Rutina ta zilnică automatizată + Vision Board AI' : 'Your automated daily routine + AI Vision Board'}</p>
                    </td>
                  </tr>
                  <tr>
                    <td style="padding: 8px 0; border-bottom: 1px solid #3f3f46;">
                      <span style="color: #f59e0b; font-weight: 600;">🧠 ${isRo ? 'Ziua 5' : 'Day 5'}:</span>
                      <span style="color: #e4e4e7;"> ${isRo ? 'Accountability & Mind Coach' : 'Accountability & Mind Coach'}</span>
                      <p style="color: #71717a; margin: 4px 0 0 0; font-size: 13px;">${isRo ? 'AI care te ține pe drumul cel bun și transformă fricile în acțiune' : 'AI that keeps you on track and transforms fears into action'}</p>
                    </td>
                  </tr>
                  <tr>
                    <td style="padding: 8px 0; border-bottom: 1px solid #3f3f46;">
                      <span style="color: #f59e0b; font-weight: 600;">💡 ${isRo ? 'Ziua 6' : 'Day 6'}:</span>
                      <span style="color: #e4e4e7;"> ${isRo ? 'Control Mental & Idei' : 'Mental Control & Ideas'}</span>
                      <p style="color: #71717a; margin: 4px 0 0 0; font-size: 13px;">${isRo ? 'Eisenhower Matrix pentru focus și prioritizare' : 'Eisenhower Matrix for focus and prioritization'}</p>
                    </td>
                  </tr>
                  <tr>
                    <td style="padding: 8px 0;">
                      <span style="color: #f59e0b; font-weight: 600;">🏆 ${isRo ? 'Ziua 7' : 'Day 7'}:</span>
                      <span style="color: #e4e4e7;"> ${isRo ? 'Continuitate & Creștere' : 'Continuity & Growth'}</span>
                      <p style="color: #71717a; margin: 4px 0 0 0; font-size: 13px;">${isRo ? 'Integrare completă și planul tău pentru următorii ani' : 'Complete integration and your plan for the next years'}</p>
                    </td>
                  </tr>
                </table>
              </div>

              <!-- Primary CTA -->
              <div style="text-align: center; margin: 32px 0;">
                <a href="https://warriorsos.com/challenge?utm_source=email&utm_medium=welcome&utm_campaign=challenge" 
                   style="display: inline-block; background: linear-gradient(135deg, #f59e0b 0%, #ea580c 100%); color: #ffffff; text-decoration: none; padding: 16px 48px; border-radius: 8px; font-size: 18px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px;">
                  ${isRo ? 'Începe Ziua 1 Acum →' : 'Start Day 1 Now →'}
                </a>
              </div>

              <!-- Invite Friends Section -->
              <div style="background: linear-gradient(135deg, #78350f 0%, #451a03 100%); border-radius: 12px; padding: 24px; margin-top: 32px; border: 1px solid #f59e0b33;">
                <h3 style="color: #fbbf24; margin: 0 0 12px 0; font-size: 18px;">
                  🎁 ${isRo ? 'Invită 1-3 Prieteni' : 'Invite 1-3 Friends'}
                </h3>
                <p style="color: #fcd34d; margin: 0 0 16px 0; font-size: 14px;">
                  ${isRo ? 'Ai o invitație exclusivă gratuită pentru prietenii tăi! Trimite-le acest mesaj:' : 'You have an exclusive free invite for your friends! Send them this message:'}
                </p>
                <div style="background-color: #0a0a0a; border-radius: 8px; padding: 16px; font-family: monospace; font-size: 13px; color: #d4d4d8; white-space: pre-wrap; line-height: 1.6;">
${inviteMessage}
                </div>
                <p style="color: #a16207; margin: 16px 0 0 0; font-size: 12px; text-align: center;">
                  ${isRo ? '👆 Copiază mesajul de mai sus și trimite-l prietenilor care vor să-și transforme viața' : '👆 Copy the message above and send it to friends who want to transform their lives'}
                </p>
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

  return { subject, html };
};

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
    const { email, name, userId, language = 'ro' }: WelcomeEmailRequest = await req.json();

    if (!email || !userId) {
      throw new Error("Missing required fields: email and userId");
    }

    // Check if we already sent a welcome email to this user
    const { data: existingLog } = await supabase
      .from('email_sequence_log')
      .select('id')
      .eq('email', email)
      .eq('sequence_type', 'challenge_welcome')
      .maybeSingle();

    if (existingLog) {
      console.log(`Welcome email already sent to ${email}, skipping`);
      return new Response(JSON.stringify({ success: true, skipped: true, reason: 'already_sent' }), {
        status: 200,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    // Generate unique tracking ID
    const trackingId = generateTrackingId();
    
    // Generate referral link
    const referralLink = `https://warriorsos.com/challenge-landing?ref=${userId}`;
    
    // Generate tracking pixel URL
    const trackingPixelUrl = `${SUPABASE_URL}/functions/v1/track-email-open?t=${trackingId}`;
    
    // Generate unsubscribe URL
    const unsubscribeUrl = `${SUPABASE_URL}/functions/v1/unsubscribe-email?id=${trackingId}`;

    // Get email template
    const { subject, html } = getEmailTemplate(name || '', referralLink, trackingPixelUrl, unsubscribeUrl, language);

    // Send email via Resend
    const emailResponse = await resend.emails.send({
      from: "WarriorOS <noreply@warriorsos.com>",
      to: [email],
      subject,
      html,
    });

    console.log(`Welcome email sent to ${email}:`, emailResponse);

    // Log the email
    await supabase.from('email_sequence_log').insert({
      email,
      sequence_type: 'challenge_welcome',
      tracking_id: trackingId,
      step_number: 1,
      sent_at: new Date().toISOString(),
      metadata: {
        user_id: userId,
        language,
        resend_id: (emailResponse as any)?.data?.id || (emailResponse as any)?.id || null,
        referral_link: referralLink
      }
    });

    return new Response(JSON.stringify({ success: true, trackingId }), {
      status: 200,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });

  } catch (error: any) {
    console.error("Error in send-challenge-welcome:", error);
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
