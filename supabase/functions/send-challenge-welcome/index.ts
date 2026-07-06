import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { Resend } from "https://esm.sh/resend@2.0.0";
import { corsHeaders, requireUser, unauthorized, forbidden } from "../_shared/auth.ts";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY")!;

const resend = new Resend(RESEND_API_KEY);

interface WelcomeEmailRequest {
  email: string;
  name?: string;
  userId: string;
  language?: 'en' | 'ro';
}

const generateTrackingId = () => {
  // tracking_id column is UUID. Non-UUID strings fail insert -> dedup breaks -> duplicates.
  return crypto.randomUUID();
};

const getEmailTemplate = (
  name: string,
  referralLink: string,
  trackingPixelUrl: string,
  unsubscribeUrl: string,
  language: 'en' | 'ro'
) => {
  const isRo = language === 'ro';
  const firstName = name?.split(' ')[0] || 'Warrior';

  const subject = isRo 
    ? `Bine ai venit in Challenge, ${firstName}!`
    : `Welcome to the Challenge, ${firstName}!`;

  const html = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin: 0; padding: 0; background-color: #f4f4f5; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color: #f4f4f5;">
    <tr>
      <td align="center" style="padding: 40px 20px;">
        <table role="presentation" width="600" cellpadding="0" cellspacing="0" style="max-width: 600px; background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
          
          <tr>
            <td style="background-color: #18181b; padding: 24px 32px; text-align: center;">
              <h1 style="color: #ffffff; margin: 0; font-size: 20px; font-weight: 600; letter-spacing: 0.5px;">CEO Mind OS</h1>
            </td>
          </tr>

          <tr>
            <td style="padding: 32px;">
              <h2 style="color: #1a1a1a; font-size: 22px; margin: 0 0 16px 0; font-weight: 700;">
                ${isRo ? `Felicitari, ${firstName}!` : `Congratulations, ${firstName}!`}
              </h2>

              <p style="color: #4b5563; font-size: 16px; line-height: 1.6; margin: 0 0 20px 0;">
                ${isRo 
                  ? 'Ai facut primul pas. In urmatoarele 7 zile vei construi un sistem complet de claritate, executie si progres.'
                  : "You've taken the first step. Over the next 7 days, you'll build a complete system for clarity, execution, and progress."}
              </p>

              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-bottom: 24px;">
                <tr><td style="padding: 10px 0; border-bottom: 1px solid #f3f4f6;"><span style="color: #1a1a1a; font-weight: 600;">${isRo ? 'Ziua 1' : 'Day 1'}:</span> <span style="color: #4b5563;">${isRo ? 'Viziune si Claritate' : 'Vision & Clarity'}</span></td></tr>
                <tr><td style="padding: 10px 0; border-bottom: 1px solid #f3f4f6;"><span style="color: #1a1a1a; font-weight: 600;">${isRo ? 'Ziua 2' : 'Day 2'}:</span> <span style="color: #4b5563;">${isRo ? 'Corp, Spirit si Relatii' : 'Body, Spirit & Relationships'}</span></td></tr>
                <tr><td style="padding: 10px 0; border-bottom: 1px solid #f3f4f6;"><span style="color: #1a1a1a; font-weight: 600;">${isRo ? 'Ziua 3' : 'Day 3'}:</span> <span style="color: #4b5563;">${isRo ? 'Business si Executie' : 'Business & Execution'}</span></td></tr>
                <tr><td style="padding: 10px 0; border-bottom: 1px solid #f3f4f6;"><span style="color: #1a1a1a; font-weight: 600;">${isRo ? 'Ziua 4' : 'Day 4'}:</span> <span style="color: #4b5563;">${isRo ? 'Rutina Zilnica' : 'Daily Routine'}</span></td></tr>
                <tr><td style="padding: 10px 0; border-bottom: 1px solid #f3f4f6;"><span style="color: #1a1a1a; font-weight: 600;">${isRo ? 'Ziua 5' : 'Day 5'}:</span> <span style="color: #4b5563;">${isRo ? 'Accountability si Mindset' : 'Accountability & Mindset'}</span></td></tr>
                <tr><td style="padding: 10px 0; border-bottom: 1px solid #f3f4f6;"><span style="color: #1a1a1a; font-weight: 600;">${isRo ? 'Ziua 6' : 'Day 6'}:</span> <span style="color: #4b5563;">${isRo ? 'Gandire Strategica' : 'Strategic Thinking'}</span></td></tr>
                <tr><td style="padding: 10px 0;"><span style="color: #1a1a1a; font-weight: 600;">${isRo ? 'Ziua 7' : 'Day 7'}:</span> <span style="color: #4b5563;">${isRo ? 'Integrare Completa' : 'Complete Integration'}</span></td></tr>
              </table>

              <div style="text-align: center; margin: 32px 0;">
                <a href="https://ceomindos.com/challenge?utm_source=email&utm_medium=welcome&utm_campaign=challenge" 
                   style="display: inline-block; background-color: #18181b; color: #ffffff; text-decoration: none; padding: 14px 32px; border-radius: 6px; font-size: 16px; font-weight: 600;">
                  ${isRo ? 'Incepe Ziua 1' : 'Start Day 1'}
                </a>
              </div>

              <!-- Share Section (welcome only) -->
              <div style="background-color: #f9fafb; border-radius: 8px; padding: 20px; margin-top: 24px;">
                <p style="color: #1a1a1a; font-weight: 600; font-size: 14px; margin: 0 0 8px 0;">
                  ${isRo ? 'Invita un prieten' : 'Invite a friend'}
                </p>
                <p style="color: #6b7280; font-size: 13px; margin: 0 0 12px 0;">
                  ${isRo ? 'Challenge-ul e mai eficient cand ai un partener de accountability.' : 'The challenge is more effective with an accountability partner.'}
                </p>
                <p style="color: #4b5563; font-size: 13px; margin: 0; word-break: break-all;">${referralLink}</p>
              </div>
            </td>
          </tr>

          <tr>
            <td style="padding: 20px 32px; border-top: 1px solid #e5e7eb; text-align: center;">
              <p style="color: #9ca3af; margin: 0 0 8px 0; font-size: 12px;">CEO Mind OS</p>
              <a href="${unsubscribeUrl}" style="color: #9ca3af; font-size: 11px; text-decoration: underline;">${isRo ? 'Dezabonare' : 'Unsubscribe'}</a>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
  <img src="${trackingPixelUrl}" width="1" height="1" style="display:none;" alt="">
</body>
</html>`;

  return { subject, html };
};

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { user } = await requireUser(req);
    if (!user) return unauthorized();

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
    const { email, name, userId, language = 'ro' }: WelcomeEmailRequest = await req.json();

    if (!email || !userId) {
      throw new Error("Missing required fields: email and userId");
    }

    if (user.id !== userId) {
      return forbidden("userId must match authenticated user");
    }
    if ((user.email ?? "").toLowerCase() !== email.toLowerCase().trim()) {
      return forbidden("email must match authenticated user");
    }

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

    const trackingId = generateTrackingId();
    const referralLink = `https://ceomindos.com/challenge-landing?ref=${userId}`;
    const trackingPixelUrl = `${SUPABASE_URL}/functions/v1/track-email-open?t=${trackingId}`;
    const unsubscribeUrl = `${SUPABASE_URL}/functions/v1/unsubscribe-email?id=${trackingId}`;

    const { subject, html } = getEmailTemplate(name || '', referralLink, trackingPixelUrl, unsubscribeUrl, language);

    // RESERVE THE SLOT FIRST. UNIQUE(email, sequence_type) on 'challenge_welcome'
    // ensures concurrent invocations (SIGNED_IN + tab-refocus + another device)
    // cannot both pass the dedup check and both send.
    const { error: reserveErr } = await supabase.from('email_sequence_log').insert({
      email,
      sequence_type: 'challenge_welcome',
      tracking_id: trackingId,
      day_number: 1,
      sent_at: new Date().toISOString(),
    });
    if (reserveErr) {
      console.log(`Welcome email already reserved for ${email}, skipping (race). ${reserveErr.message}`);
      return new Response(JSON.stringify({ success: true, skipped: true, reason: 'already_sent' }), {
        status: 200,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    // Log intent for the dashboard.
    await supabase.from('email_send_log').insert({
      message_id: trackingId,
      template_name: 'challenge-welcome',
      recipient_email: email,
      status: 'pending',
      metadata: { user_id: userId, language },
    });

    let emailResponse: any;
    try {
      emailResponse = await resend.emails.send({
        from: "CEO Mind OS <noreply@ceomindos.com>",
        to: [email],
        subject,
        html,
      });
      console.log(`Welcome email sent to ${email}:`, emailResponse);

      await supabase.from('email_send_log').insert({
        message_id: trackingId,
        template_name: 'challenge-welcome',
        recipient_email: email,
        status: 'sent',
        metadata: {
          user_id: userId,
          language,
          resend_id: (emailResponse as any)?.data?.id || (emailResponse as any)?.id || null,
        },
      });
    } catch (sendErr: any) {
      await supabase.from('email_send_log').insert({
        message_id: trackingId,
        template_name: 'challenge-welcome',
        recipient_email: email,
        status: 'failed',
        error_message: (sendErr?.message || 'send failed').slice(0, 500),
        metadata: { user_id: userId, language },
      });
      throw sendErr;
    }


    return new Response(JSON.stringify({ success: true, trackingId }), {
      status: 200,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });

  } catch (error: any) {
    console.error("Error in send-challenge-welcome:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  }
};

serve(handler);
