import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");

async function sendEmail(to: string, subject: string, html: string) {
  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${RESEND_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: "Have It All <noreply@warriorsos.com>",
      to: [to],
      subject,
      html,
    }),
  });
  
  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Resend API error: ${error}`);
  }
  
  return response.json();
}

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface ChallengeDay {
  day: number;
  titleEn: string;
  titleRo: string;
  descEn: string;
  descRo: string;
}

const challengeDays: ChallengeDay[] = [
  { day: 1, titleEn: "Platform Tour", titleRo: "Tour Platformă", descEn: "Discover all the tools at your disposal", descRo: "Descoperă toate instrumentele disponibile" },
  { day: 2, titleEn: "Body + Being", titleRo: "Corp + Spirit", descEn: "Set objectives for health & inner peace", descRo: "Obiective pentru sănătate și spirit" },
  { day: 3, titleEn: "Balance + Business", titleRo: "Relații + Business", descEn: "Set objectives for relationships & career", descRo: "Obiective pentru relații și carieră" },
  { day: 4, titleEn: "Champion Routine", titleRo: "Rutina Campionului", descEn: "Configure your winning morning routine", descRo: "Configurează rutina matinală câștigătoare" },
  { day: 5, titleEn: "AI Vision", titleRo: "Viziune AI", descEn: "Generate images & personalized meditation", descRo: "Generează imagini și meditație personalizată" },
  { day: 6, titleEn: "Accountability", titleRo: "Accountability", descEn: "Set up your notification system", descRo: "Configurează sistemul de notificări" },
  { day: 7, titleEn: "Putting It All Together", titleRo: "Punem Totul Împreună", descEn: "Complete recap + Premium upgrade", descRo: "Recapitulare completă + Upgrade Premium" },
];

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Get all challenge participants who haven't completed all 7 days
    const { data: participants, error: participantsError } = await supabase
      .from('email_leads')
      .select('*')
      .eq('lead_magnet', 'challenge_7_zile')
      .eq('subscribed', true);

    if (participantsError) {
      throw participantsError;
    }

    const results = [];
    const baseUrl = Deno.env.get("SITE_URL") || "https://warriorsos.com";

    for (const participant of participants || []) {
      // Calculate which day they should be on based on signup date
      const signupDate = new Date(participant.created_at);
      const now = new Date();
      const daysSinceSignup = Math.floor((now.getTime() - signupDate.getTime()) / (1000 * 60 * 60 * 24)) + 1;
      
      // Only send reminders for days 1-7
      if (daysSinceSignup > 7) continue;
      
      const currentDay = challengeDays[daysSinceSignup - 1];
      if (!currentDay) continue;

      // Determine language (default to Romanian)
      const language = (participant.metadata as any)?.language || 'ro';
      const isEnglish = language === 'en';

      const emailHtml = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #ffffff; color: #1a1a1a; margin: 0; padding: 20px; line-height: 1.6;">
  <div style="max-width: 600px; margin: 0 auto;">
    
    <p>${participant.name ? `${isEnglish ? 'Hey' : 'Salut'} ${participant.name},` : `${isEnglish ? 'Hey' : 'Salut'},`}</p>
    
    <p><strong>${isEnglish ? `Day ${currentDay.day}` : `Ziua ${currentDay.day}`}: ${isEnglish ? currentDay.titleEn : currentDay.titleRo}</strong></p>
    
    <p>${isEnglish ? currentDay.descEn : currentDay.descRo}</p>
    
    <p><a href="${baseUrl}/challenge/${currentDay.day}" style="color: #0066cc;">${isEnglish ? 'Start Day' : 'Începe Ziua'} ${currentDay.day} →</a></p>
    
    <p>${isEnglish ? 'Good luck!' : 'Mult succes!'}<br>
    Echipa Warrior SOS</p>
    
    <p style="color: #666666; font-size: 12px; margin-top: 40px; padding-top: 20px; border-top: 1px solid #eeeeee;">
      ${isEnglish 
        ? 'You received this email because you joined the 7-Day Challenge.' 
        : 'Ai primit acest email pentru că te-ai înscris la Challenge-ul de 7 Zile.'}
    </p>
    
  </div>
</body>
</html>`;

      try {
        const subject = isEnglish 
          ? `🔥 Day ${currentDay.day}: ${currentDay.titleEn}` 
          : `🔥 Ziua ${currentDay.day}: ${currentDay.titleRo}`;
        
        const emailResponse = await sendEmail(participant.email, subject, emailHtml);

        results.push({
          email: participant.email,
          day: currentDay.day,
          success: true,
          messageId: emailResponse?.id
        });
      } catch (emailError) {
        console.error(`Error sending to ${participant.email}:`, emailError);
        results.push({
          email: participant.email,
          day: currentDay.day,
          success: false,
          error: String(emailError)
        });
      }
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        sent: results.filter(r => r.success).length,
        failed: results.filter(r => !r.success).length,
        results 
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  } catch (error: any) {
    console.error("Error in send-challenge-reminder:", error);
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
