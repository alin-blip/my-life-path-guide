import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");
const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform",
};

const TARGET_LEAD_MAGNETS = [
  'vision_2026_quiz',
  'vision_board',
  'vision_board_2026',
  'life_score',
  'life_score_60s',
  'warrior_power'
];

const SEQUENCE_TYPE = 'challenge_promo';
const CHALLENGE_URL = 'https://warriorsos.com/challenge-7-zile';
const FUNCTIONS_URL = SUPABASE_URL?.replace('.supabase.co', '.functions.supabase.co');

interface EmailContent {
  subject: string;
  html: string;
}

function generateTrackingId(): string {
  return crypto.randomUUID();
}

function getEmailContent(emailNumber: number, name: string | null, trackingId: string): EmailContent {
  const displayName = name || 'Warrior';
  const trackingPixelUrl = `${FUNCTIONS_URL}/v1/track-email-open?t=${trackingId}`;
  const unsubscribeUrl = `${FUNCTIONS_URL}/v1/unsubscribe-email?id=${trackingId}`;
  const utmParams = `utm_source=email&utm_campaign=challenge_promo&utm_content=email_${emailNumber}`;
  const ctaUrl = `${CHALLENGE_URL}?${utmParams}`;

  const wrapEmail = (title: string, bodyContent: string) => `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin: 0; padding: 0; background-color: #f7f7f8; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color: #f7f7f8;">
    <tr>
      <td align="center" style="padding: 40px 20px;">
        <table role="presentation" width="600" cellpadding="0" cellspacing="0" style="max-width: 600px; background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 1px 3px rgba(0,0,0,0.08);">
          
          <!-- Header -->
          <tr>
            <td style="padding: 32px 32px 24px 32px; border-bottom: 1px solid #e5e7eb;">
              <p style="margin: 0 0 4px 0; font-size: 13px; font-weight: 600; color: #6b7280; text-transform: uppercase; letter-spacing: 0.5px;">WarriorOS</p>
              <h1 style="margin: 0; font-size: 22px; font-weight: 700; color: #111827; line-height: 1.4;">
                ${title}
              </h1>
            </td>
          </tr>

          <!-- Content -->
          <tr>
            <td style="padding: 28px 32px 32px 32px;">
              ${bodyContent}
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color: #f9fafb; padding: 20px 32px; text-align: center; border-top: 1px solid #e5e7eb;">
              <p style="color: #9ca3af; margin: 0 0 6px 0; font-size: 12px;">WarriorOS</p>
              <a href="${unsubscribeUrl}" style="color: #9ca3af; font-size: 11px; text-decoration: underline;">Dezabonare</a>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
  <img src="${trackingPixelUrl}" width="1" height="1" style="display:none;" alt="" />
</body>
</html>`;

  const ctaButton = (text: string) => `
    <div style="text-align: center; margin: 28px 0 0 0;">
      <a href="${ctaUrl}" style="display: inline-block; background-color: #111827; color: #ffffff; text-decoration: none; padding: 14px 40px; border-radius: 8px; font-size: 15px; font-weight: 600;">
        ${text}
      </a>
    </div>`;

  const dayItem = (title: string, desc: string) => `
    <div style="padding: 10px 14px; margin: 8px 0; background-color: #f9fafb; border-left: 3px solid #111827; border-radius: 0 6px 6px 0;">
      <p style="margin: 0; color: #111827; font-weight: 600; font-size: 14px;">${title}</p>
      <p style="margin: 4px 0 0 0; color: #6b7280; font-size: 13px;">${desc}</p>
    </div>`;

  switch (emailNumber) {
    case 1:
      return {
        subject: 'Am ceva special pentru tine — Challenge gratuit de 7 zile',
        html: wrapEmail('Challenge gratuit: Have It All Lifestyle', `
          <p style="color: #374151; font-size: 15px; line-height: 1.6; margin: 0 0 16px 0;">Salut ${displayName},</p>
          <p style="color: #4b5563; font-size: 15px; line-height: 1.6; margin: 0 0 16px 0;">Ai facut deja primul pas testand unul dintre instrumentele noastre. Dar stii ce diferentiaza oamenii care obtin rezultate de cei care doar viseaza?</p>
          <p style="color: #374151; font-size: 15px; line-height: 1.6; margin: 0 0 16px 0;"><strong>Un sistem.</strong></p>
          <p style="color: #4b5563; font-size: 15px; line-height: 1.6; margin: 0 0 16px 0;">De aceea am creat Challenge-ul Have It All Lifestyle — un program de 7 zile 100% gratuit.</p>
          <p style="color: #374151; font-size: 14px; font-weight: 600; margin: 0 0 12px 0;">Ce vei primi:</p>
          ${dayItem('Ziua 1: Declaratia Ta', 'Viziune clara stil Napoleon Hill')}
          ${dayItem('Ziua 2-3: Corp + Spirit & Business', 'Obiective concrete pentru 4 arii ale vietii')}
          ${dayItem('Ziua 4: Rutina Campionului', 'Morning Stack automatizat')}
          ${dayItem('Ziua 5: Viziune AI', 'Vision Board + Meditatie personalizata')}
          ${dayItem('Ziua 6: Accountability', 'Sistemul care te tine responsabil')}
          ${dayItem('Ziua 7: Integrare', 'Totul functioneaza impreuna')}
          ${ctaButton('Incepe Ziua 1')}
          <p style="color: #9ca3af; text-align: center; font-size: 13px; margin: 16px 0 0 0;">100% gratuit. Fara card. Fara obligatii.</p>
        `)
      };

    case 2:
      return {
        subject: 'De ce 92% dintre oameni esueaza (si cum sa fii in cei 8%)',
        html: wrapEmail('De ce 92% esueaza', `
          <p style="color: #374151; font-size: 15px; line-height: 1.6; margin: 0 0 16px 0;">Salut ${displayName},</p>
          <p style="color: #4b5563; font-size: 15px; line-height: 1.6; margin: 0 0 16px 0;">Stii care e cea mai mare minciuna pe care ti-o spui?</p>
          <p style="color: #4b5563; font-size: 15px; line-height: 1.6; margin: 0 0 4px 0; font-style: italic;">"Voi incepe luni."</p>
          <p style="color: #4b5563; font-size: 15px; line-height: 1.6; margin: 0 0 4px 0; font-style: italic;">"Cand voi avea mai mult timp..."</p>
          <p style="color: #4b5563; font-size: 15px; line-height: 1.6; margin: 0 0 16px 0; font-style: italic;">"Cand voi fi mai motivat..."</p>
          <p style="color: #374151; font-size: 15px; line-height: 1.6; margin: 0 0 16px 0;"><strong>92% dintre oameni nu isi ating niciodata obiectivele.</strong> Nu pentru ca nu sunt destul de inteligenti. Ci pentru ca le lipseste un sistem.</p>
          <p style="color: #374151; font-size: 14px; font-weight: 600; margin: 0 0 12px 0;">Challenge-ul iti ofera:</p>
          <ul style="color: #4b5563; margin: 0 0 16px 0; padding-left: 18px; line-height: 1.8; font-size: 14px;">
            <li>Viziune clara (nu vagi "vreau sa fiu mai bun")</li>
            <li>Obiective SMART pentru toate ariile vietii</li>
            <li>Rutina matinala care te pune automat in actiune</li>
            <li>AI Coach care te ghideaza personal</li>
            <li>Sistem de accountability care nu te lasa sa renunti</li>
          </ul>
          ${ctaButton('Fii in cei 8%')}
        `)
      };

    case 3:
      return {
        subject: 'Ce se intampla in fiecare zi din Challenge',
        html: wrapEmail('7 zile de transformare — pas cu pas', `
          <p style="color: #374151; font-size: 15px; line-height: 1.6; margin: 0 0 16px 0;">Salut ${displayName},</p>
          <p style="color: #374151; font-size: 15px; line-height: 1.6; margin: 0 0 16px 0;"><strong>7 zile. 4 arii ale vietii. 1 transformare completa.</strong></p>
          ${dayItem('Ziua 1: Declaratia de Viziune', 'Scrii declaratia personala stil Napoleon Hill — exact CE vrei, CAND vrei si CE esti dispus sa dai.')}
          ${dayItem('Ziua 2: Corp + Spirit', 'Obiective concrete pentru sanatate, energie si pace interioara.')}
          ${dayItem('Ziua 3: Relatii + Business', 'Obiective pentru relatiile care conteaza si cresterea in business.')}
          ${dayItem('Ziua 4: Rutina Campionului', 'Configurezi Morning Stack-ul: meditatie, vizualizare, exercitii — automatizate.')}
          ${dayItem('Ziua 5: Viziune AI', 'AI-ul genereaza imagini pentru vision board + meditatie ghidata bazata pe obiectivele tale.')}
          ${dayItem('Ziua 6: Accountability', 'Configurezi sistemul de tracking care te tine responsabil zilnic.')}
          ${dayItem('Ziua 7: Integrare', 'Pui totul impreuna. Stii exact ce sa faci in fiecare zi.')}
          ${ctaButton('Incepe Transformarea')}
        `)
      };

    case 4:
      return {
        subject: 'Challenge-ul gratuit nu va fi disponibil mult timp',
        html: wrapEmail('Timp limitat', `
          <p style="color: #374151; font-size: 15px; line-height: 1.6; margin: 0 0 16px 0;">Salut ${displayName},</p>
          <p style="color: #4b5563; font-size: 15px; line-height: 1.6; margin: 0 0 16px 0;">Challenge-ul gratuit de 7 zile e o investitie din partea noastra:</p>
          <ul style="color: #4b5563; margin: 0 0 16px 0; padding-left: 18px; line-height: 1.8; font-size: 14px;">
            <li>AI personalizat care genereaza continut pentru tine</li>
            <li>Imagini si meditatii create special pentru obiectivele tale</li>
            <li>Sistem de tracking si accountability</li>
            <li>Ghidare pas cu pas in fiecare zi</li>
          </ul>
          <p style="color: #374151; font-size: 15px; line-height: 1.6; margin: 0 0 16px 0;">Toate acestea — <strong>100% gratuit</strong>. Dar nu putem sustine asta pentru totdeauna.</p>
          <div style="background-color: #fef2f2; border-left: 3px solid #ef4444; padding: 14px 16px; border-radius: 0 8px 8px 0; margin-bottom: 16px;">
            <p style="color: #991b1b; margin: 0; font-size: 14px; font-weight: 600;">Ce pierzi fara un sistem:</p>
            <ul style="color: #7f1d1d; margin: 8px 0 0 0; padding-left: 16px; font-size: 13px; line-height: 1.6;">
              <li>Te trezesti dimineata intrebandu-te "ce ar trebui sa fac?"</li>
              <li>Obiectivele raman vise nerealizate</li>
              <li>Motivatia vine si pleaca fara rezultate</li>
            </ul>
          </div>
          ${ctaButton('Asigura-ti Locul')}
        `)
      };

    case 5:
      return {
        subject: `Ultima sansa, ${displayName}`,
        html: wrapEmail('Ultimul mesaj — decizia e a ta', `
          <p style="color: #374151; font-size: 15px; line-height: 1.6; margin: 0 0 16px 0;">${displayName},</p>
          <p style="color: #4b5563; font-size: 15px; line-height: 1.6; margin: 0 0 16px 0;">In ultimele zile ti-am aratat:</p>
          <ul style="color: #4b5563; margin: 0 0 16px 0; padding-left: 18px; line-height: 1.8; font-size: 14px;">
            <li>De ce 92% esueaza si cum sa fii in cei 8%</li>
            <li>Exact ce se intampla in fiecare zi din Challenge</li>
            <li>De ce acest program e gratuit acum, dar nu pentru mult timp</li>
          </ul>
          <p style="color: #374151; font-size: 15px; line-height: 1.6; margin: 0 0 12px 0;"><strong>In 7 zile vei avea:</strong></p>
          <ul style="color: #4b5563; margin: 0 0 16px 0; padding-left: 18px; line-height: 1.8; font-size: 14px;">
            <li>Viziune clara pentru viata ta</li>
            <li>Obiective concrete pentru Corp, Spirit, Relatii, Business</li>
            <li>Rutina matinala automatizata</li>
            <li>AI Coach personal</li>
            <li>Sistem de accountability care functioneaza</li>
          </ul>
          <div style="background-color: #f9fafb; border-radius: 8px; padding: 16px 20px; text-align: center; margin-bottom: 16px;">
            <p style="color: #111827; font-size: 15px; font-weight: 600; margin: 0 0 4px 0;">Am facut acest challenge gratuit pentru ca stiu ca functioneaza.</p>
            <p style="color: #6b7280; font-size: 13px; margin: 0;">L-am testat pe mine. L-am testat pe sute de Warriors.</p>
          </div>
          <p style="color: #374151; font-size: 15px; line-height: 1.6; margin: 0 0 0 0;">Acum e randul tau. <strong>Alegerea e a ta.</strong></p>
          ${ctaButton('Incepe Acum')}
          <p style="color: #9ca3af; text-align: center; font-size: 13px; margin: 16px 0 0 0;">Acesta e ultimul email din aceasta serie.</p>
        `)
      };

    default:
      throw new Error(`Invalid email number: ${emailNumber}`);
  }
}

async function sendEmail(to: string, subject: string, html: string): Promise<any> {
  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${RESEND_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: "WarriorOS <noreply@warriorsos.com>",
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

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY || !RESEND_API_KEY) {
      throw new Error("Missing required environment variables");
    }

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    let body: { email?: string; emailNumber?: number } = {};
    try {
      body = await req.json();
    } catch {
      // Empty body is fine for automatic mode
    }

    const results: any[] = [];

    // MANUAL MODE
    if (body.email && body.emailNumber) {
      console.log(`Manual mode: Sending email ${body.emailNumber} to ${body.email}`);
      
      const trackingId = generateTrackingId();
      const emailContent = getEmailContent(body.emailNumber, null, trackingId);
      
      try {
        const emailResponse = await sendEmail(body.email, emailContent.subject, emailContent.html);
        
        await supabase.from('email_sequence_log').insert({
          email: body.email,
          sequence_type: SEQUENCE_TYPE,
          email_number: body.emailNumber,
          tracking_id: trackingId,
          sent_at: new Date().toISOString()
        });

        results.push({
          email: body.email,
          emailNumber: body.emailNumber,
          success: true,
          messageId: emailResponse?.id
        });
      } catch (error) {
        results.push({
          email: body.email,
          emailNumber: body.emailNumber,
          success: false,
          error: String(error)
        });
      }

      return new Response(JSON.stringify({ 
        mode: 'manual',
        results 
      }), {
        status: 200,
        headers: { "Content-Type": "application/json", ...corsHeaders }
      });
    }

    // AUTOMATIC MODE
    console.log("Automatic mode: Processing all eligible leads");

    const { data: leads, error: leadsError } = await supabase
      .from('email_leads')
      .select('*')
      .eq('subscribed', true)
      .in('lead_magnet', TARGET_LEAD_MAGNETS);

    if (leadsError) {
      throw new Error(`Error fetching leads: ${leadsError.message}`);
    }

    console.log(`Found ${leads?.length || 0} eligible leads`);

    const { data: existingLogs, error: logsError } = await supabase
      .from('email_sequence_log')
      .select('*')
      .eq('sequence_type', SEQUENCE_TYPE);

    if (logsError) {
      throw new Error(`Error fetching logs: ${logsError.message}`);
    }

    const logsByEmail = new Map<string, any[]>();
    for (const log of existingLogs || []) {
      if (!logsByEmail.has(log.email)) {
        logsByEmail.set(log.email, []);
      }
      logsByEmail.get(log.email)!.push(log);
    }

    const now = new Date();

    for (const lead of leads || []) {
      const leadLogs = logsByEmail.get(lead.email) || [];
      
      leadLogs.sort((a, b) => b.day_number - a.day_number);
      
      const latestLog = leadLogs[0];
      let nextEmailNumber = 1;

      if (latestLog) {
        if (latestLog.day_number >= 5) {
          console.log(`${lead.email}: Sequence complete, skipping`);
          continue;
        }

        const lastSentAt = new Date(latestLog.sent_at);
        const hoursSinceLastEmail = (now.getTime() - lastSentAt.getTime()) / (1000 * 60 * 60);
        
        if (hoursSinceLastEmail < 24) {
          console.log(`${lead.email}: Only ${hoursSinceLastEmail.toFixed(1)}h since last email, waiting`);
          continue;
        }

        nextEmailNumber = latestLog.day_number + 1;
      }

      console.log(`${lead.email}: Sending email ${nextEmailNumber}`);

      const trackingId = generateTrackingId();
      const emailContent = getEmailContent(nextEmailNumber, lead.name, trackingId);

      try {
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        const emailResponse = await sendEmail(lead.email, emailContent.subject, emailContent.html);

        await supabase.from('email_sequence_log').insert({
          email: lead.email,
          sequence_type: SEQUENCE_TYPE,
          day_number: nextEmailNumber,
          tracking_id: trackingId,
          sent_at: new Date().toISOString()
        });

        results.push({
          email: lead.email,
          emailNumber: nextEmailNumber,
          success: true,
          messageId: emailResponse?.id
        });
      } catch (error) {
        console.error(`Error sending to ${lead.email}:`, error);
        results.push({
          email: lead.email,
          emailNumber: nextEmailNumber,
          success: false,
          error: String(error)
        });
      }
    }

    const successCount = results.filter(r => r.success).length;
    const failCount = results.filter(r => !r.success).length;

    console.log(`Completed: ${successCount} sent, ${failCount} failed`);

    return new Response(JSON.stringify({
      mode: 'automatic',
      totalLeads: leads?.length || 0,
      sent: successCount,
      failed: failCount,
      results
    }), {
      status: 200,
      headers: { "Content-Type": "application/json", ...corsHeaders }
    });

  } catch (error: any) {
    console.error("Error in send-challenge-promo-sequence:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders }
      }
    );
  }
};

serve(handler);
