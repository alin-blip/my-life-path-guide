import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";
import { resolveLeadLanguage, type EmailLang } from "../_shared/resolve-lead-language.ts";

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
const CHALLENGE_URL = 'https://ceomindos.com/challenge-7-zile';
const FUNCTIONS_URL = SUPABASE_URL?.replace('.supabase.co', '.functions.supabase.co');

interface EmailContent { subject: string; html: string; }

const generateTrackingId = () => crypto.randomUUID();
const t = (lang: EmailLang, ro: string, en: string) => (lang === 'en' ? en : ro);

function wrapEmail(lang: EmailLang, title: string, bodyContent: string, unsubscribeUrl: string, trackingPixelUrl: string): string {
  return `<!DOCTYPE html>
<html lang="${lang}">
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
<body style="margin:0; padding:0; background-color:#f7f7f8; font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,'Helvetica Neue',Arial,sans-serif;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#f7f7f8;">
    <tr><td align="center" style="padding:40px 20px;">
      <table role="presentation" width="600" cellpadding="0" cellspacing="0" style="max-width:600px; background-color:#ffffff; border-radius:12px; overflow:hidden; box-shadow:0 1px 3px rgba(0,0,0,0.08);">
        <tr><td style="padding:32px 32px 24px 32px; border-bottom:1px solid #e5e7eb;">
          <p style="margin:0 0 4px 0; font-size:13px; font-weight:600; color:#6b7280; text-transform:uppercase; letter-spacing:0.5px;">CEO Mind OS</p>
          <h1 style="margin:0; font-size:22px; font-weight:700; color:#111827; line-height:1.4;">${title}</h1>
        </td></tr>
        <tr><td style="padding:28px 32px 32px 32px;">${bodyContent}</td></tr>
        <tr><td style="background-color:#f9fafb; padding:20px 32px; text-align:center; border-top:1px solid #e5e7eb;">
          <p style="color:#9ca3af; margin:0 0 6px 0; font-size:12px;">CEO Mind OS</p>
          <a href="${unsubscribeUrl}" style="color:#9ca3af; font-size:11px; text-decoration:underline;">${t(lang, 'Dezabonare', 'Unsubscribe')}</a>
        </td></tr>
      </table>
    </td></tr>
  </table>
  <img src="${trackingPixelUrl}" width="1" height="1" style="display:none;" alt="" />
</body></html>`;
}

function getEmailContent(emailNumber: number, name: string | null, trackingId: string, lang: EmailLang): EmailContent {
  const displayName = name || (lang === 'en' ? 'Warrior' : 'Warrior');
  const trackingPixelUrl = `${FUNCTIONS_URL}/v1/track-email-open?t=${trackingId}`;
  const unsubscribeUrl = `${FUNCTIONS_URL}/v1/unsubscribe-email?id=${trackingId}`;
  const ctaUrl = `${CHALLENGE_URL}?utm_source=email&utm_campaign=challenge_promo&utm_content=email_${emailNumber}`;
  const isEn = lang === 'en';
  const greet = isEn ? `Hi ${displayName},` : `Salut ${displayName},`;

  const ctaButton = (text: string) => `
    <div style="text-align:center; margin:28px 0 0 0;">
      <a href="${ctaUrl}" style="display:inline-block; background-color:#111827; color:#ffffff; text-decoration:none; padding:14px 40px; border-radius:8px; font-size:15px; font-weight:600;">${text}</a>
    </div>`;

  const dayItem = (title: string, desc: string) => `
    <div style="padding:10px 14px; margin:8px 0; background-color:#f9fafb; border-left:3px solid #111827; border-radius:0 6px 6px 0;">
      <p style="margin:0; color:#111827; font-weight:600; font-size:14px;">${title}</p>
      <p style="margin:4px 0 0 0; color:#6b7280; font-size:13px;">${desc}</p>
    </div>`;

  const p = (text: string, style = '') =>
    `<p style="color:#4b5563; font-size:15px; line-height:1.6; margin:0 0 16px 0;${style}">${text}</p>`;

  switch (emailNumber) {
    case 1:
      return {
        subject: isEn ? 'Something special for you — free 7-day challenge' : 'Am ceva special pentru tine — Challenge gratuit de 7 zile',
        html: wrapEmail(lang, isEn ? 'Free Challenge: Have It All Lifestyle' : 'Challenge gratuit: Have It All Lifestyle', `
          ${p(greet)}
          ${p(isEn ? 'You already took the first step by trying one of our tools. But do you know what separates people who get results from people who only dream?' : 'Ai facut deja primul pas testand unul dintre instrumentele noastre. Dar stii ce diferentiaza oamenii care obtin rezultate de cei care doar viseaza?')}
          ${p(`<strong>${isEn ? 'A system.' : 'Un sistem.'}</strong>`)}
          ${p(isEn ? 'That\'s why we built the Have It All Lifestyle Challenge — a 100% free 7-day program.' : 'De aceea am creat Challenge-ul Have It All Lifestyle — un program de 7 zile 100% gratuit.')}
          <p style="color:#374151; font-size:14px; font-weight:600; margin:0 0 12px 0;">${isEn ? 'What you\'ll get:' : 'Ce vei primi:'}</p>
          ${dayItem(isEn ? 'Day 1: Your Declaration' : 'Ziua 1: Declaratia Ta', isEn ? 'Clear Napoleon Hill-style vision' : 'Viziune clara stil Napoleon Hill')}
          ${dayItem(isEn ? 'Day 2-3: Body + Spirit & Business' : 'Ziua 2-3: Corp + Spirit & Business', isEn ? 'Concrete goals for 4 areas of life' : 'Obiective concrete pentru 4 arii ale vietii')}
          ${dayItem(isEn ? 'Day 4: Champion Routine' : 'Ziua 4: Rutina Campionului', isEn ? 'Automated Morning Stack' : 'Morning Stack automatizat')}
          ${dayItem(isEn ? 'Day 5: AI Vision' : 'Ziua 5: Viziune AI', isEn ? 'Vision Board + personalized meditation' : 'Vision Board + Meditatie personalizata')}
          ${dayItem(isEn ? 'Day 6: Accountability' : 'Ziua 6: Accountability', isEn ? 'The system that keeps you responsible' : 'Sistemul care te tine responsabil')}
          ${dayItem(isEn ? 'Day 7: Integration' : 'Ziua 7: Integrare', isEn ? 'Everything working together' : 'Totul functioneaza impreuna')}
          ${ctaButton(isEn ? 'Start Day 1' : 'Incepe Ziua 1')}
          <p style="color:#9ca3af; text-align:center; font-size:13px; margin:16px 0 0 0;">${isEn ? '100% free. No card. No obligations.' : '100% gratuit. Fara card. Fara obligatii.'}</p>
        `, unsubscribeUrl, trackingPixelUrl)
      };

    case 2:
      return {
        subject: isEn ? 'Why 92% fail (and how to be in the 8%)' : 'De ce 92% dintre oameni esueaza (si cum sa fii in cei 8%)',
        html: wrapEmail(lang, isEn ? 'Why 92% fail' : 'De ce 92% esueaza', `
          ${p(greet)}
          ${p(isEn ? 'You know the biggest lie you tell yourself?' : 'Stii care e cea mai mare minciuna pe care ti-o spui?')}
          ${p(isEn ? '"I\'ll start Monday."' : '"Voi incepe luni."', 'font-style:italic;')}
          ${p(isEn ? '"When I have more time..."' : '"Cand voi avea mai mult timp..."', 'font-style:italic;')}
          ${p(isEn ? '"When I\'m more motivated..."' : '"Cand voi fi mai motivat..."', 'font-style:italic;')}
          ${p(`<strong>${isEn ? '92% of people never reach their goals.' : '92% dintre oameni nu isi ating niciodata obiectivele.'}</strong> ${isEn ? 'Not because they\'re not smart enough. Because they lack a system.' : 'Nu pentru ca nu sunt destul de inteligenti. Ci pentru ca le lipseste un sistem.'}`)}
          <p style="color:#374151; font-size:14px; font-weight:600; margin:0 0 12px 0;">${isEn ? 'The Challenge gives you:' : 'Challenge-ul iti ofera:'}</p>
          <ul style="color:#4b5563; margin:0 0 16px 0; padding-left:18px; line-height:1.8; font-size:14px;">
            <li>${isEn ? 'Clear vision (not vague "I want to be better")' : 'Viziune clara (nu vagi "vreau sa fiu mai bun")'}</li>
            <li>${isEn ? 'SMART goals for every area of life' : 'Obiective SMART pentru toate ariile vietii'}</li>
            <li>${isEn ? 'Morning routine that puts you into automatic action' : 'Rutina matinala care te pune automat in actiune'}</li>
            <li>${isEn ? 'AI Coach that guides you personally' : 'AI Coach care te ghideaza personal'}</li>
            <li>${isEn ? 'Accountability system that won\'t let you quit' : 'Sistem de accountability care nu te lasa sa renunti'}</li>
          </ul>
          ${ctaButton(isEn ? 'Be in the 8%' : 'Fii in cei 8%')}
        `, unsubscribeUrl, trackingPixelUrl)
      };

    case 3:
      return {
        subject: isEn ? 'What happens each day of the Challenge' : 'Ce se intampla in fiecare zi din Challenge',
        html: wrapEmail(lang, isEn ? '7 days of transformation — step by step' : '7 zile de transformare — pas cu pas', `
          ${p(greet)}
          ${p(`<strong>${isEn ? '7 days. 4 areas of life. 1 complete transformation.' : '7 zile. 4 arii ale vietii. 1 transformare completa.'}</strong>`)}
          ${dayItem(isEn ? 'Day 1: Vision Declaration' : 'Ziua 1: Declaratia de Viziune', isEn ? 'Write a Napoleon Hill-style personal declaration — exactly WHAT you want, WHEN, and WHAT you\'re willing to give.' : 'Scrii declaratia personala stil Napoleon Hill — exact CE vrei, CAND vrei si CE esti dispus sa dai.')}
          ${dayItem(isEn ? 'Day 2: Body + Spirit' : 'Ziua 2: Corp + Spirit', isEn ? 'Concrete goals for health, energy and inner peace.' : 'Obiective concrete pentru sanatate, energie si pace interioara.')}
          ${dayItem(isEn ? 'Day 3: Relationships + Business' : 'Ziua 3: Relatii + Business', isEn ? 'Goals for the relationships that matter and business growth.' : 'Obiective pentru relatiile care conteaza si cresterea in business.')}
          ${dayItem(isEn ? 'Day 4: Champion Routine' : 'Ziua 4: Rutina Campionului', isEn ? 'Configure your Morning Stack: meditation, visualization, workouts — automated.' : 'Configurezi Morning Stack-ul: meditatie, vizualizare, exercitii — automatizate.')}
          ${dayItem(isEn ? 'Day 5: AI Vision' : 'Ziua 5: Viziune AI', isEn ? 'AI generates vision-board images + guided meditation based on your goals.' : 'AI-ul genereaza imagini pentru vision board + meditatie ghidata bazata pe obiectivele tale.')}
          ${dayItem(isEn ? 'Day 6: Accountability' : 'Ziua 6: Accountability', isEn ? 'Configure the tracking system that keeps you responsible every day.' : 'Configurezi sistemul de tracking care te tine responsabil zilnic.')}
          ${dayItem(isEn ? 'Day 7: Integration' : 'Ziua 7: Integrare', isEn ? 'Put it all together. You know exactly what to do every day.' : 'Pui totul impreuna. Stii exact ce sa faci in fiecare zi.')}
          ${ctaButton(isEn ? 'Start the Transformation' : 'Incepe Transformarea')}
        `, unsubscribeUrl, trackingPixelUrl)
      };

    case 4:
      return {
        subject: isEn ? 'The free Challenge won\'t be available for long' : 'Challenge-ul gratuit nu va fi disponibil mult timp',
        html: wrapEmail(lang, isEn ? 'Limited time' : 'Timp limitat', `
          ${p(greet)}
          ${p(isEn ? 'The free 7-day Challenge is an investment on our side:' : 'Challenge-ul gratuit de 7 zile e o investitie din partea noastra:')}
          <ul style="color:#4b5563; margin:0 0 16px 0; padding-left:18px; line-height:1.8; font-size:14px;">
            <li>${isEn ? 'Personalized AI generating content for you' : 'AI personalizat care genereaza continut pentru tine'}</li>
            <li>${isEn ? 'Images & meditations built for your goals' : 'Imagini si meditatii create special pentru obiectivele tale'}</li>
            <li>${isEn ? 'Tracking & accountability system' : 'Sistem de tracking si accountability'}</li>
            <li>${isEn ? 'Step-by-step guidance every day' : 'Ghidare pas cu pas in fiecare zi'}</li>
          </ul>
          ${p(`${isEn ? 'All of this — <strong>100% free</strong>. But we can\'t sustain that forever.' : 'Toate acestea — <strong>100% gratuit</strong>. Dar nu putem sustine asta pentru totdeauna.'}`)}
          <div style="background-color:#fef2f2; border-left:3px solid #ef4444; padding:14px 16px; border-radius:0 8px 8px 0; margin-bottom:16px;">
            <p style="color:#991b1b; margin:0; font-size:14px; font-weight:600;">${isEn ? 'What you lose without a system:' : 'Ce pierzi fara un sistem:'}</p>
            <ul style="color:#7f1d1d; margin:8px 0 0 0; padding-left:16px; font-size:13px; line-height:1.6;">
              <li>${isEn ? 'You wake up asking "what should I do?"' : 'Te trezesti dimineata intrebandu-te "ce ar trebui sa fac?"'}</li>
              <li>${isEn ? 'Goals stay as unrealized dreams' : 'Obiectivele raman vise nerealizate'}</li>
              <li>${isEn ? 'Motivation comes and goes without results' : 'Motivatia vine si pleaca fara rezultate'}</li>
            </ul>
          </div>
          ${ctaButton(isEn ? 'Secure Your Spot' : 'Asigura-ti Locul')}
        `, unsubscribeUrl, trackingPixelUrl)
      };

    case 5:
      return {
        subject: isEn ? `Last chance, ${displayName}` : `Ultima sansa, ${displayName}`,
        html: wrapEmail(lang, isEn ? 'Last message — the choice is yours' : 'Ultimul mesaj — decizia e a ta', `
          ${p(`${displayName},`)}
          ${p(isEn ? 'In the last few days I showed you:' : 'In ultimele zile ti-am aratat:')}
          <ul style="color:#4b5563; margin:0 0 16px 0; padding-left:18px; line-height:1.8; font-size:14px;">
            <li>${isEn ? 'Why 92% fail and how to be in the 8%' : 'De ce 92% esueaza si cum sa fii in cei 8%'}</li>
            <li>${isEn ? 'Exactly what happens each day of the Challenge' : 'Exact ce se intampla in fiecare zi din Challenge'}</li>
            <li>${isEn ? 'Why this program is free now, but not for long' : 'De ce acest program e gratuit acum, dar nu pentru mult timp'}</li>
          </ul>
          <p style="color:#374151; font-size:15px; line-height:1.6; margin:0 0 12px 0;"><strong>${isEn ? 'In 7 days you\'ll have:' : 'In 7 zile vei avea:'}</strong></p>
          <ul style="color:#4b5563; margin:0 0 16px 0; padding-left:18px; line-height:1.8; font-size:14px;">
            <li>${isEn ? 'Clear vision for your life' : 'Viziune clara pentru viata ta'}</li>
            <li>${isEn ? 'Concrete goals for Body, Spirit, Relationships, Business' : 'Obiective concrete pentru Corp, Spirit, Relatii, Business'}</li>
            <li>${isEn ? 'Automated morning routine' : 'Rutina matinala automatizata'}</li>
            <li>${isEn ? 'Personal AI Coach' : 'AI Coach personal'}</li>
            <li>${isEn ? 'An accountability system that works' : 'Sistem de accountability care functioneaza'}</li>
          </ul>
          <div style="background-color:#f9fafb; border-radius:8px; padding:16px 20px; text-align:center; margin-bottom:16px;">
            <p style="color:#111827; font-size:15px; font-weight:600; margin:0 0 4px 0;">${isEn ? 'We made this challenge free because we know it works.' : 'Am facut acest challenge gratuit pentru ca stiu ca functioneaza.'}</p>
            <p style="color:#6b7280; font-size:13px; margin:0;">${isEn ? 'Tested on myself. Tested on hundreds of Warriors.' : 'L-am testat pe mine. L-am testat pe sute de Warriors.'}</p>
          </div>
          <p style="color:#374151; font-size:15px; line-height:1.6; margin:0;">${isEn ? 'Now it\'s your turn.' : 'Acum e randul tau.'} <strong>${isEn ? 'The choice is yours.' : 'Alegerea e a ta.'}</strong></p>
          ${ctaButton(isEn ? 'Start Now' : 'Incepe Acum')}
          <p style="color:#9ca3af; text-align:center; font-size:13px; margin:16px 0 0 0;">${isEn ? 'This is the last email in this series.' : 'Acesta e ultimul email din aceasta serie.'}</p>
        `, unsubscribeUrl, trackingPixelUrl)
      };

    default:
      throw new Error(`Invalid email number: ${emailNumber}`);
  }
}

async function sendEmail(to: string, subject: string, html: string): Promise<any> {
  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { "Authorization": `Bearer ${RESEND_API_KEY}`, "Content-Type": "application/json" },
    body: JSON.stringify({ from: "CEO Mind OS <noreply@ceomindos.com>", to: [to], subject, html }),
  });
  if (!response.ok) throw new Error(`Resend API error: ${await response.text()}`);
  return response.json();
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY || !RESEND_API_KEY) {
      throw new Error("Missing required environment variables");
    }
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    let body: { email?: string; emailNumber?: number; language?: EmailLang } = {};
    try { body = await req.json(); } catch {}

    const results: any[] = [];

    // MANUAL MODE
    if (body.email && body.emailNumber) {
      const lang: EmailLang = body.language === 'en'
        ? 'en'
        : body.language === 'ro'
          ? 'ro'
          : await resolveLeadLanguage(supabase, body.email);
      const trackingId = generateTrackingId();
      const emailContent = getEmailContent(body.emailNumber, null, trackingId, lang);
      try {
        const emailResponse = await sendEmail(body.email, emailContent.subject, emailContent.html);
        await supabase.from('email_sequence_log').insert({
          email: body.email, sequence_type: SEQUENCE_TYPE, email_number: body.emailNumber,
          tracking_id: trackingId, sent_at: new Date().toISOString(),
        });
        results.push({ email: body.email, emailNumber: body.emailNumber, success: true, messageId: emailResponse?.id, lang });
      } catch (error) {
        results.push({ email: body.email, emailNumber: body.emailNumber, success: false, error: String(error), lang });
      }
      return new Response(JSON.stringify({ mode: 'manual', results }), {
        status: 200, headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    // AUTOMATIC MODE
    const { data: leads, error: leadsError } = await supabase
      .from('email_leads')
      .select('*')
      .eq('subscribed', true)
      .in('lead_magnet', TARGET_LEAD_MAGNETS);
    if (leadsError) throw new Error(`Error fetching leads: ${leadsError.message}`);

    const { data: existingLogs, error: logsError } = await supabase
      .from('email_sequence_log')
      .select('*')
      .eq('sequence_type', SEQUENCE_TYPE);
    if (logsError) throw new Error(`Error fetching logs: ${logsError.message}`);

    const logsByEmail = new Map<string, any[]>();
    for (const log of existingLogs || []) {
      if (!logsByEmail.has(log.email)) logsByEmail.set(log.email, []);
      logsByEmail.get(log.email)!.push(log);
    }

    const now = new Date();

    for (const lead of leads || []) {
      const leadLogs = logsByEmail.get(lead.email) || [];
      leadLogs.sort((a, b) => b.day_number - a.day_number);
      const latestLog = leadLogs[0];
      let nextEmailNumber = 1;

      if (latestLog) {
        if (latestLog.day_number >= 5) continue;
        const lastSentAt = new Date(latestLog.sent_at);
        const hoursSinceLastEmail = (now.getTime() - lastSentAt.getTime()) / (1000 * 60 * 60);
        if (hoursSinceLastEmail < 24) continue;
        nextEmailNumber = latestLog.day_number + 1;
      }

      const lang: EmailLang = ((lead as any).language === 'en'
        ? 'en'
        : (lead as any).language === 'ro'
          ? 'ro'
          : await resolveLeadLanguage(supabase, lead.email));

      const trackingId = generateTrackingId();
      const emailContent = getEmailContent(nextEmailNumber, lead.name, trackingId, lang);

      try {
        await new Promise(resolve => setTimeout(resolve, 1000));
        const emailResponse = await sendEmail(lead.email, emailContent.subject, emailContent.html);
        await supabase.from('email_sequence_log').insert({
          email: lead.email, sequence_type: SEQUENCE_TYPE, day_number: nextEmailNumber,
          tracking_id: trackingId, sent_at: new Date().toISOString(),
        });
        results.push({ email: lead.email, emailNumber: nextEmailNumber, success: true, messageId: emailResponse?.id, lang });
      } catch (error) {
        console.error(`Error sending to ${lead.email}:`, error);
        results.push({ email: lead.email, emailNumber: nextEmailNumber, success: false, error: String(error), lang });
      }
    }

    const successCount = results.filter(r => r.success).length;
    const failCount = results.filter(r => !r.success).length;

    return new Response(JSON.stringify({
      mode: 'automatic', totalLeads: leads?.length || 0, sent: successCount, failed: failCount, results,
    }), { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } });
  } catch (error: any) {
    console.error("Error in send-challenge-promo-sequence:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500, headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  }
};

serve(handler);
