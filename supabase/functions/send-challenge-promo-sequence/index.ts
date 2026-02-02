import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");
const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform",
};

// Target lead magnets (non-challenge)
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

  const emailStyles = `
    <style>
      body { margin: 0; padding: 0; background-color: #0a0a0a; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; }
      .container { max-width: 600px; margin: 0 auto; padding: 40px 20px; }
      .card { background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%); border-radius: 16px; padding: 40px; border: 1px solid #333; }
      .header { text-align: center; margin-bottom: 30px; }
      .title { color: #f59e0b; font-size: 28px; margin: 0; }
      .subtitle { color: #fff; font-size: 22px; margin: 10px 0; }
      .content { color: #d1d5db; font-size: 16px; line-height: 1.7; }
      .highlight { color: #f59e0b; font-weight: bold; }
      .cta-container { text-align: center; margin: 35px 0; }
      .cta-button { display: inline-block; background: linear-gradient(135deg, #f59e0b 0%, #ea580c 100%); color: #000 !important; padding: 16px 40px; border-radius: 8px; text-decoration: none; font-weight: bold; font-size: 18px; }
      .day-item { background: rgba(245, 158, 11, 0.1); border-left: 3px solid #f59e0b; padding: 12px 16px; margin: 10px 0; border-radius: 0 8px 8px 0; }
      .day-title { color: #f59e0b; font-weight: bold; margin: 0; }
      .day-desc { color: #9ca3af; margin: 5px 0 0 0; font-size: 14px; }
      .footer { margin-top: 40px; padding-top: 20px; border-top: 1px solid #333; text-align: center; }
      .footer-text { color: #6b7280; font-size: 12px; }
      .unsubscribe { color: #6b7280; font-size: 12px; text-decoration: underline; }
    </style>
  `;

  const footer = `
    <div class="footer">
      <p class="footer-text">WarriorOS • Have It All Lifestyle Challenge</p>
      <p class="footer-text">
        <a href="${unsubscribeUrl}" class="unsubscribe">Dezabonare</a>
      </p>
    </div>
    <img src="${trackingPixelUrl}" width="1" height="1" style="display:none;" alt="" />
  `;

  switch (emailNumber) {
    case 1:
      return {
        subject: '🎁 Am ceva special pentru tine — Challenge GRATUIT de 7 Zile',
        html: `
          <!DOCTYPE html>
          <html>
          <head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1.0">${emailStyles}</head>
          <body>
            <div class="container">
              <div class="card">
                <div class="header">
                  <h1 class="title">🎁 Challenge GRATUIT</h1>
                  <h2 class="subtitle">Have It All Lifestyle — 7 Zile</h2>
                </div>
                
                <div class="content">
                  <p>Salut ${displayName}! 👋</p>
                  
                  <p>Ai făcut deja primul pas testând unul dintre instrumentele noastre. Dar știi ce diferențiază oamenii care <span class="highlight">obțin rezultate</span> de cei care doar visează?</p>
                  
                  <p><strong>Un SISTEM.</strong></p>
                  
                  <p>De aceea am creat <span class="highlight">Challenge-ul Have It All Lifestyle</span> — un program de 7 zile 100% GRATUIT care îți oferă exact asta.</p>
                  
                  <p><strong>Ce vei primi în aceste 7 zile:</strong></p>
                  
                  <div class="day-item">
                    <p class="day-title">📋 Ziua 1: Declarația Ta</p>
                    <p class="day-desc">Viziune clară stil Napoleon Hill — ce vrei cu adevărat</p>
                  </div>
                  
                  <div class="day-item">
                    <p class="day-title">💪 Ziua 2-3: Corp + Spirit & Relații + Business</p>
                    <p class="day-desc">Obiective concrete pentru toate cele 4 arii ale vieții</p>
                  </div>
                  
                  <div class="day-item">
                    <p class="day-title">🌅 Ziua 4: Rutina Campionului</p>
                    <p class="day-desc">Morning Stack automatizat care te pune în mișcare</p>
                  </div>
                  
                  <div class="day-item">
                    <p class="day-title">🎨 Ziua 5: Viziune AI</p>
                    <p class="day-desc">Vision Board generat + Meditație personalizată</p>
                  </div>
                  
                  <div class="day-item">
                    <p class="day-title">🔔 Ziua 6: Accountability</p>
                    <p class="day-desc">Sistemul care te ține responsabil zilnic</p>
                  </div>
                  
                  <div class="day-item">
                    <p class="day-title">🚀 Ziua 7: Integrare Completă</p>
                    <p class="day-desc">Ciclul virtuos activat — totul funcționează împreună</p>
                  </div>
                </div>
                
                <div class="cta-container">
                  <a href="${ctaUrl}" class="cta-button">Începe Ziua 1 Acum →</a>
                </div>
                
                <p style="color: #9ca3af; text-align: center; font-size: 14px;">Este 100% gratuit. Fără card. Fără obligații.</p>
                
                ${footer}
              </div>
            </div>
          </body>
          </html>
        `
      };

    case 2:
      return {
        subject: '❌ De ce 92% dintre oameni eșuează (și cum să fii în cei 8%)',
        html: `
          <!DOCTYPE html>
          <html>
          <head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1.0">${emailStyles}</head>
          <body>
            <div class="container">
              <div class="card">
                <div class="header">
                  <h1 class="title">❌ Adevărul Dur</h1>
                  <h2 class="subtitle">De ce 92% eșuează</h2>
                </div>
                
                <div class="content">
                  <p>Salut ${displayName},</p>
                  
                  <p>Știi care e cea mai mare minciună pe care ți-o spui?</p>
                  
                  <p><em>"Voi începe luni."</em></p>
                  <p><em>"Când voi avea mai mult timp..."</em></p>
                  <p><em>"Când voi fi mai motivat..."</em></p>
                  
                  <p>Realitatea? <span class="highlight">92% dintre oameni nu își ating niciodată obiectivele.</span></p>
                  
                  <p>Nu pentru că nu sunt destul de inteligenți sau motivați. Ci pentru că le lipsește un <strong>SISTEM</strong>.</p>
                  
                  <p>Gândește-te: câte obiective ai avut anul trecut? Câte ai atins cu adevărat?</p>
                  
                  <p>Challenge-ul nostru de 7 zile îți oferă exact sistemul care te pune în cei <span class="highlight">8% care reușesc</span>:</p>
                  
                  <ul style="color: #d1d5db; line-height: 2;">
                    <li>✅ Viziune clară (nu vagi "vreau să fiu mai bun")</li>
                    <li>✅ Obiective SMART pentru toate ariile vieții</li>
                    <li>✅ Rutină matinală care te pune automat în acțiune</li>
                    <li>✅ AI Coach care te ghidează personal</li>
                    <li>✅ Sistem de accountability care nu te lasă să renunți</li>
                  </ul>
                </div>
                
                <div class="cta-container">
                  <a href="${ctaUrl}" class="cta-button">Fii în cei 8% →</a>
                </div>
                
                ${footer}
              </div>
            </div>
          </body>
          </html>
        `
      };

    case 3:
      return {
        subject: '🔥 Ce se întâmplă în fiecare zi din Challenge',
        html: `
          <!DOCTYPE html>
          <html>
          <head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1.0">${emailStyles}</head>
          <body>
            <div class="container">
              <div class="card">
                <div class="header">
                  <h1 class="title">🔥 7 Zile de Transformare</h1>
                  <h2 class="subtitle">Pas cu pas, zi cu zi</h2>
                </div>
                
                <div class="content">
                  <p>Salut ${displayName},</p>
                  
                  <p><strong>7 zile. 4 arii ale vieții. 1 transformare completă.</strong></p>
                  
                  <p>Lasă-mă să îți arăt exact ce se întâmplă în fiecare zi:</p>
                  
                  <div class="day-item">
                    <p class="day-title">🎯 ZIUA 1: Declarația Ta de Viziune</p>
                    <p class="day-desc">Scrii declarația ta personală stil Napoleon Hill. Nu "vreau să fiu bogat" — ci exact CE vrei, CÂND vrei și CE ești dispus să dai în schimb.</p>
                  </div>
                  
                  <div class="day-item">
                    <p class="day-title">💪 ZIUA 2: Corp + Spirit</p>
                    <p class="day-desc">Obiective concrete pentru sănătate, energie și pace interioară. Sistemul îți generează un plan personalizat.</p>
                  </div>
                  
                  <div class="day-item">
                    <p class="day-title">❤️ ZIUA 3: Relații + Business</p>
                    <p class="day-desc">Obiective pentru relațiile care contează și pentru creșterea în carieră/business.</p>
                  </div>
                  
                  <div class="day-item">
                    <p class="day-title">🌅 ZIUA 4: Rutina Campionului</p>
                    <p class="day-desc">Configurezi Morning Stack-ul tău: meditație, vizualizare, exerciții, toate automatizate.</p>
                  </div>
                  
                  <div class="day-item">
                    <p class="day-title">🎨 ZIUA 5: Viziune AI</p>
                    <p class="day-desc">AI-ul generează imagini personalizate pentru vision board + o meditație ghidată bazată pe obiectivele TALE.</p>
                  </div>
                  
                  <div class="day-item">
                    <p class="day-title">🔔 ZIUA 6: Accountability</p>
                    <p class="day-desc">Configurezi sistemul de notificări și tracking care te ține responsabil zilnic.</p>
                  </div>
                  
                  <div class="day-item">
                    <p class="day-title">🚀 ZIUA 7: Integrare</p>
                    <p class="day-desc">Pui totul împreună. Ciclul virtuos e activat. Știi EXACT ce să faci în fiecare zi.</p>
                  </div>
                  
                  <p style="margin-top: 25px;"><span class="highlight">După 7 zile, nu te vei mai întreba "ce ar trebui să fac azi?"</span></p>
                  <p>Vei ști EXACT. Și vei avea sistemul care te pune în acțiune automat.</p>
                </div>
                
                <div class="cta-container">
                  <a href="${ctaUrl}" class="cta-button">Începe Transformarea →</a>
                </div>
                
                ${footer}
              </div>
            </div>
          </body>
          </html>
        `
      };

    case 4:
      return {
        subject: '⏰ Locurile pentru Challenge sunt limitate',
        html: `
          <!DOCTYPE html>
          <html>
          <head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1.0">${emailStyles}</head>
          <body>
            <div class="container">
              <div class="card">
                <div class="header">
                  <h1 class="title">⏰ Timp Limitat</h1>
                  <h2 class="subtitle">Locurile se ocupă rapid</h2>
                </div>
                
                <div class="content">
                  <p>Salut ${displayName},</p>
                  
                  <p>Vreau să fiu sincer cu tine...</p>
                  
                  <p>Challenge-ul gratuit de 7 zile e o <span class="highlight">investiție uriașă</span> din partea noastră:</p>
                  
                  <ul style="color: #d1d5db; line-height: 2;">
                    <li>🤖 AI personalizat care generează conținut pentru TINE</li>
                    <li>🎨 Imagini și meditații create special pentru obiectivele tale</li>
                    <li>📊 Sistem de tracking și accountability</li>
                    <li>💬 Ghidare pas cu pas în fiecare zi</li>
                  </ul>
                  
                  <p>Toate acestea — <strong>100% gratuit</strong>.</p>
                  
                  <p>Dar nu putem susține asta pentru totdeauna. <span class="highlight">Următorul val de participanți va fi cu plată.</span></p>
                  
                  <p style="background: rgba(239, 68, 68, 0.1); border-left: 3px solid #ef4444; padding: 15px; border-radius: 0 8px 8px 0;">
                    <strong style="color: #ef4444;">Ce pierzi fără un sistem:</strong><br/>
                    • Te trezești dimineața întrebându-te "ce ar trebui să fac?"<br/>
                    • Obiectivele tale rămân vise nerealizate<br/>
                    • Motivația vine și pleacă fără rezultate concrete<br/>
                    • Timpul trece, iar tu ești în același loc
                  </p>
                  
                  <p>Nu lăsa asta să se întâmple.</p>
                </div>
                
                <div class="cta-container">
                  <a href="${ctaUrl}" class="cta-button">Asigură-ți Locul ACUM →</a>
                </div>
                
                ${footer}
              </div>
            </div>
          </body>
          </html>
        `
      };

    case 5:
      return {
        subject: `👋 Ultima șansă, ${displayName}`,
        html: `
          <!DOCTYPE html>
          <html>
          <head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1.0">${emailStyles}</head>
          <body>
            <div class="container">
              <div class="card">
                <div class="header">
                  <h1 class="title">👋 Ultimul Mesaj</h1>
                  <h2 class="subtitle">Decizia e a ta</h2>
                </div>
                
                <div class="content">
                  <p>${displayName},</p>
                  
                  <p>Nu vreau să mă gândesc că ai ratat asta.</p>
                  
                  <p>În ultimele zile ți-am arătat:</p>
                  
                  <ul style="color: #d1d5db; line-height: 2;">
                    <li>✅ De ce 92% dintre oameni eșuează (și cum să fii în cei 8%)</li>
                    <li>✅ Exact ce se întâmplă în fiecare zi din Challenge</li>
                    <li>✅ De ce acest program e gratuit ACUM, dar nu pentru mult timp</li>
                  </ul>
                  
                  <p><span class="highlight">În 7 zile vei avea:</span></p>
                  
                  <ul style="color: #d1d5db; line-height: 2;">
                    <li>🎯 Viziune clară pentru viața ta</li>
                    <li>📋 Obiective concrete pentru Corp, Spirit, Relații, Business</li>
                    <li>🌅 Rutină matinală automatizată</li>
                    <li>🤖 AI Coach personal</li>
                    <li>🔔 Sistem de accountability care funcționează</li>
                  </ul>
                  
                  <p style="background: rgba(245, 158, 11, 0.1); padding: 20px; border-radius: 8px; text-align: center;">
                    <strong style="color: #f59e0b; font-size: 18px;">Am făcut acest challenge gratuit pentru că ȘTIU că funcționează.</strong><br/>
                    <span style="color: #9ca3af;">L-am testat pe mine. L-am testat pe sute de Warriors.</span>
                  </p>
                  
                  <p>Acum e rândul tău.</p>
                  
                  <p>Sau poți continua să te trezești mâine întrebându-te "ce ar trebui să fac?"</p>
                  
                  <p><strong>Alegerea e a ta.</strong></p>
                </div>
                
                <div class="cta-container">
                  <a href="${ctaUrl}" class="cta-button">Ultimele 24 ore → Începe ACUM</a>
                </div>
                
                <p style="color: #6b7280; text-align: center; font-size: 14px; margin-top: 20px;">
                  Acesta e ultimul email din această serie. Sper să ne vedem în Challenge. 🔥
                </p>
                
                ${footer}
              </div>
            </div>
          </body>
          </html>
        `
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

    // Parse request body
    let body: { email?: string; emailNumber?: number } = {};
    try {
      body = await req.json();
    } catch {
      // Empty body is fine for automatic mode
    }

    const results: any[] = [];

    // MANUAL MODE: Send specific email to specific address
    if (body.email && body.emailNumber) {
      console.log(`Manual mode: Sending email ${body.emailNumber} to ${body.email}`);
      
      const trackingId = generateTrackingId();
      const emailContent = getEmailContent(body.emailNumber, null, trackingId);
      
      try {
        const emailResponse = await sendEmail(body.email, emailContent.subject, emailContent.html);
        
        // Log the email
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

    // AUTOMATIC MODE: Process all eligible leads
    console.log("Automatic mode: Processing all eligible leads");

    // Get all eligible leads
    const { data: leads, error: leadsError } = await supabase
      .from('email_leads')
      .select('*')
      .eq('subscribed', true)
      .in('lead_magnet', TARGET_LEAD_MAGNETS);

    if (leadsError) {
      throw new Error(`Error fetching leads: ${leadsError.message}`);
    }

    console.log(`Found ${leads?.length || 0} eligible leads`);

    // Get all existing sequence logs for these leads
    const { data: existingLogs, error: logsError } = await supabase
      .from('email_sequence_log')
      .select('*')
      .eq('sequence_type', SEQUENCE_TYPE);

    if (logsError) {
      throw new Error(`Error fetching logs: ${logsError.message}`);
    }

    // Create a map of email -> latest log
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
      
      // Sort logs by day_number descending to get the latest
      leadLogs.sort((a, b) => b.day_number - a.day_number);
      
      const latestLog = leadLogs[0];
      let nextEmailNumber = 1;

      if (latestLog) {
        // Check if they've completed the sequence
        if (latestLog.day_number >= 5) {
          console.log(`${lead.email}: Sequence complete, skipping`);
          continue;
        }

        // Check if 24 hours have passed since last email
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
        // Rate limit: Resend allows max 2 requests/second, add 1000ms delay for safety
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        const emailResponse = await sendEmail(lead.email, emailContent.subject, emailContent.html);

        // Log the email
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
