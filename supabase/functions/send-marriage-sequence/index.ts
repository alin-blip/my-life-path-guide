import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { renderSequenceEmail, type EmailLang } from "../_shared/email-shell.ts";
import { requireCronOrAdmin } from "../_shared/require-cron-or-admin.ts";

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");
const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const BASE_URL = "https://ceomindos.com";

function buildEmail(dayNumber: number, name: string, trackingId: string, lang: EmailLang, band: string | null) {
  const isEn = lang === 'en';
  const unsubscribeUrl = `${BASE_URL}/unsubscribe?id=${trackingId}`;
  const trackingPixel = `<img src="${BASE_URL}/api/track-open?id=${trackingId}" width="1" height="1" style="display:none;" />`;
  const utm = (c: string) => `utm_source=email&utm_medium=sequence&utm_campaign=marriage&utm_content=${c}`;
  const greet = isEn ? `Hi ${name},` : `Salut ${name},`;

  type DayDef = {
    subject: string; title: string; headline: string;
    gradient: string; accent: string; body: string;
    cta: string; ctaHref: string; next: string;
  };

  const gradient = 'linear-gradient(135deg, #ec4899 0%, #7c3aed 100%)';
  const accent = '#ec4899';

  const days: Record<number, DayDef> = {
    2: {
      subject: isEn ? `${name}, your marriage diagnostic — what it really means` : `${name}, diagnosticul relației tale — ce înseamnă cu adevărat`,
      title: isEn ? '💔 THE REAL DIAGNOSTIC' : '💔 DIAGNOSTICUL REAL',
      headline: isEn ? `Beyond the score, ${name}` : `Dincolo de scor, ${name}`,
      gradient, accent,
      body: `<h2 style="color:${accent};">${greet}</h2>
        <p>${isEn ? 'Yesterday you got your marriage score. Today, the truth behind it.' : 'Ieri ai primit scorul relației tale. Astăzi, adevărul din spatele lui.'}</p>
        <p>${isEn ? 'A relationship doesn\'t break in one big fight. It breaks in hundreds of small moments where one partner reached out and the other looked away.' : 'O relație nu se rupe într-o ceartă mare. Se rupe în sute de momente mici, în care unul a întins mâna și celălalt s-a uitat în altă parte.'}</p>
        <div style="background: rgba(236, 72, 153, 0.1); padding: 20px; border-radius: 12px; margin: 20px 0;">
          <p><strong>${isEn ? 'What most entrepreneurs miss:' : 'Ce ratează majoritatea antreprenorilor:'}</strong></p>
          <p>${isEn ? 'You optimize your business daily. You measure revenue, funnels, KPIs. But you never audit the relationship that carries you through every hard season.' : 'Îți optimizezi business-ul zilnic. Măsori venituri, funnels, KPI. Dar nu faci niciodată audit relației care te ține în picioare în fiecare sezon greu.'}</p>
        </div>
        <p>${isEn ? 'Tomorrow: the 4 axes that determine if a relationship thrives or slowly dies.' : 'Mâine: cele 4 axe care determină dacă o relație prosperă sau moare încet.'}</p>`,
      cta: isEn ? 'Open the full diagnostic →' : 'Deschide diagnosticul complet →',
      ctaHref: `${BASE_URL}/marriage-quiz?${utm('day2')}`,
      next: isEn ? 'The 4 axes of every strong marriage.' : 'Cele 4 axe ale oricărei relații puternice.',
    },
    4: {
      subject: isEn ? `${name}, the 4 axes: where you're strong, where you bleed` : `${name}, cele 4 axe: unde ești puternic, unde sângerezi`,
      title: isEn ? '🎯 THE 4 AXES' : '🎯 CELE 4 AXE',
      headline: isEn ? `Communication · Intimacy · Values · Trust` : `Comunicare · Intimitate · Valori · Încredere`,
      gradient, accent,
      body: `<h2 style="color:${accent};">${greet}</h2>
        <p>${isEn ? 'Every long relationship stands or falls on 4 axes:' : 'Orice relație lungă stă în picioare sau cade pe 4 axe:'}</p>
        <div style="background: rgba(236, 72, 153, 0.1); padding: 20px; border-radius: 12px; margin: 20px 0;">
          <p><strong>1. 💬 ${isEn ? 'Communication' : 'Comunicare'}</strong> — ${isEn ? 'Do you speak, or do you defend?' : 'Vorbiți, sau vă apărați?'}</p>
          <p><strong>2. ❤️ ${isEn ? 'Intimacy' : 'Intimitate'}</strong> — ${isEn ? 'Emotional AND physical. Both count.' : 'Emoțională ȘI fizică. Ambele contează.'}</p>
          <p><strong>3. 🧭 ${isEn ? 'Shared values' : 'Valori comune'}</strong> — ${isEn ? 'Do you build the same life, or two parallel ones?' : 'Construiți aceeași viață, sau două paralele?'}</p>
          <p><strong>4. 🤝 ${isEn ? 'Trust & reliability' : 'Încredere & fiabilitate'}</strong> — ${isEn ? 'Can your partner count on your word?' : 'Poate partenerul tău conta pe cuvântul tău?'}</p>
        </div>
        <p>${isEn ? 'Your quiz already pinpointed the axis that\'s dragging everything else down. Reopen it and read your diagnosis honestly.' : 'Quiz-ul tău a identificat deja axa care trage tot restul în jos. Redeschide-l și citește diagnosticul cu onestitate.'}</p>`,
      cta: isEn ? 'See my axes →' : 'Vezi axele mele →',
      ctaHref: `${BASE_URL}/marriage-quiz?${utm('day4')}`,
      next: isEn ? 'A 30-day repair plan you can actually run.' : 'Un plan de reparare pe 30 de zile pe care chiar îl poți urma.',
    },
    7: {
      subject: isEn ? `${name}, 30 days to repair — the plan` : `${name}, 30 de zile de reparare — planul`,
      title: isEn ? '📅 THE 30-DAY REPAIR PLAN' : '📅 PLANUL DE 30 DE ZILE',
      headline: isEn ? `Small daily moves, big shift, ${name}` : `Mișcări mici zilnice, schimbare mare, ${name}`,
      gradient, accent,
      body: `<h2 style="color:${accent};">${greet}</h2>
        <p>${isEn ? 'You don\'t need a couples retreat. You need 15 minutes a day, done consistently, for 30 days.' : 'Nu ai nevoie de un retreat de cuplu. Ai nevoie de 15 minute pe zi, făcute constant, timp de 30 de zile.'}</p>
        <div style="background: rgba(236, 72, 153, 0.1); padding: 20px; border-radius: 12px; margin: 20px 0;">
          <p><strong>${isEn ? 'Week 1 — Presence' : 'Săptămâna 1 — Prezență'}:</strong> ${isEn ? 'Daily 10-min check-in, phones down.' : 'Check-in zilnic 10 min, telefoanele jos.'}</p>
          <p><strong>${isEn ? 'Week 2 — Repair' : 'Săptămâna 2 — Reparație'}:</strong> ${isEn ? 'One old wound named and cleared.' : 'O rană veche numită și curățată.'}</p>
          <p><strong>${isEn ? 'Week 3 — Rebuild' : 'Săptămâna 3 — Reconstrucție'}:</strong> ${isEn ? 'One shared ritual, one shared goal.' : 'Un ritual comun, un obiectiv comun.'}</p>
          <p><strong>${isEn ? 'Week 4 — Repeat' : 'Săptămâna 4 — Repetare'}:</strong> ${isEn ? 'Turn it into the new normal.' : 'Transformă-l în noua normalitate.'}</p>
        </div>
        <p>${isEn ? 'The Marriage Stack in CEO Mind OS walks you through this — day by day, prompt by prompt.' : 'Marriage Stack din CEO Mind OS te ghidează prin asta — zi cu zi, prompt cu prompt.'}</p>`,
      cta: isEn ? 'Start the Marriage Stack →' : 'Începe Marriage Stack →',
      ctaHref: `${BASE_URL}/marriage?${utm('day7')}`,
      next: isEn ? 'The AI coach that sits between you and your partner.' : 'Coach-ul AI care stă între tine și partenerul tău.',
    },
    10: {
      subject: isEn ? `${name}, an AI coach that hears both sides` : `${name}, un coach AI care ascultă ambele părți`,
      title: isEn ? '🤖 THE MARRIAGE STACK' : '🤖 MARRIAGE STACK',
      headline: isEn ? `Not therapy. Operating system.` : `Nu terapie. Sistem de operare.`,
      gradient, accent,
      body: `<h2 style="color:${accent};">${greet}</h2>
        <p>${isEn ? 'Most couples fight about the surface — dishes, calendar, tone. The real fight is always underneath: an unmet need, an old wound, a broken agreement.' : 'Majoritatea cuplurilor se ceartă pe suprafață — vase, calendar, ton. Cearta reală e mereu dedesubt: o nevoie neîmplinită, o rană veche, o înțelegere ruptă.'}</p>
        <div style="background: rgba(236, 72, 153, 0.1); padding: 20px; border-radius: 12px; margin: 20px 0;">
          <p><strong>${isEn ? 'The Marriage Stack does 3 things:' : 'Marriage Stack face 3 lucruri:'}</strong></p>
          <ul style="margin:0; padding-left:20px;">
            <li>${isEn ? 'Separates fact from interpretation in each conflict' : 'Separă faptul de interpretare în fiecare conflict'}</li>
            <li>${isEn ? 'Names the destructured axis and the trigger root' : 'Numește axa destructurată și rădăcina trigger-ului'}</li>
            <li>${isEn ? 'Gives you a repair script and a 7-day plan' : 'Îți dă un script reparator și un plan de 7 zile'}</li>
          </ul>
        </div>
        <p>${isEn ? 'It\'s the tool I wish I had 10 years ago.' : 'E instrumentul pe care mi-aș fi dorit să-l am acum 10 ani.'}</p>
        <p style="color:#888;">— Alin</p>`,
      cta: isEn ? 'Open the Marriage Stack →' : 'Deschide Marriage Stack →',
      ctaHref: `${BASE_URL}/marriage?${utm('day10')}`,
      next: isEn ? 'Your access to CEO Mind OS — special offer.' : 'Accesul tău la CEO Mind OS — ofertă specială.',
    },
    14: {
      subject: isEn ? `${name}, your access to CEO Mind OS — special offer` : `${name}, accesul tău la CEO Mind OS — ofertă specială`,
      title: isEn ? '🎁 SPECIAL OFFER' : '🎁 OFERTĂ SPECIALĂ',
      headline: isEn ? `Body · Being · Balance · Business, ${name}` : `Body · Being · Balance · Business, ${name}`,
      gradient, accent,
      body: `<h2 style="color:${accent};">${greet}</h2>
        <p>${isEn ? 'Your marriage is one axis of 4. If it\'s wobbly, everything else pays for it — energy, focus, revenue, sleep.' : 'Relația ta e o axă din 4. Dacă ea șchioapătă, restul plătesc — energie, focus, venit, somn.'}</p>
        <p>${isEn ? 'CEO Mind OS is the operating system that keeps all 4 aligned:' : 'CEO Mind OS este sistemul de operare care ține toate 4 aliniate:'}</p>
        <div style="background: rgba(236, 72, 153, 0.1); padding: 20px; border-radius: 12px; margin: 20px 0;">
          <ul style="margin:0; padding-left:20px;">
            <li>${isEn ? 'Marriage Stack (this) + Parenting Stack' : 'Marriage Stack (acesta) + Parenting Stack'}</li>
            <li>${isEn ? 'Warrior Routine — mornings that actually land' : 'Rutina Războinicului — dimineți care chiar aterizează'}</li>
            <li>${isEn ? 'Domino Door — weekly strategic planning' : 'Domino Door — planificare săptămânală strategică'}</li>
            <li>${isEn ? 'Belief Reprogrammer — 4-phase childhood belief work' : 'Belief Reprogrammer — muncă pe credințe în 4 faze'}</li>
            <li>${isEn ? '5-day free trial. Cancel anytime.' : '5 zile trial gratuit. Anulezi oricând.'}</li>
          </ul>
        </div>`,
      cta: isEn ? 'Start 5-day free trial →' : 'Începe trial 5 zile gratuit →',
      ctaHref: `${BASE_URL}/pricing?${utm('day14')}`,
      next: '',
    },
  };

  const def = days[dayNumber];
  if (!def) return null;
  return {
    subject: def.subject,
    html: renderSequenceEmail({
      title: def.title,
      headline: def.headline,
      headerGradient: def.gradient,
      accent: def.accent,
      bodyHtml: def.body,
      ctaLabel: def.cta,
      ctaHref: def.ctaHref,
      nextTeaser: def.next || undefined,
      unsubscribeUrl,
      trackingPixel,
      lang,
    }),
  };
}

const SEND_DAYS = [2, 4, 7, 10, 14];

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
  const authFail = await requireCronOrAdmin(req, corsHeaders);
  if (authFail) return authFail;

    if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) throw new Error("Missing Supabase configuration");
    if (!RESEND_API_KEY) throw new Error("Missing RESEND_API_KEY");
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    const { data: leads, error: leadsError } = await supabase
      .from('marriage_quiz_leads')
      .select('id, email, first_name, language, health_band, marketing_consent, created_at')
      .eq('marketing_consent', true);
    if (leadsError) throw new Error(`Error fetching leads: ${leadsError.message}`);

    const results: { email: string; day: number; status: string; lang: EmailLang }[] = [];
    const now = new Date();

    for (const lead of (leads || [])) {
      const createdAt = new Date(lead.created_at as any);
      const daysSince = Math.floor((now.getTime() - createdAt.getTime()) / (1000 * 60 * 60 * 24));
      const dayNumber = daysSince + 1;
      if (!SEND_DAYS.includes(dayNumber)) continue;

      const { data: existingLog } = await supabase
        .from('email_sequence_log')
        .select('id')
        .eq('email', lead.email)
        .eq('sequence_type', 'marriage')
        .eq('day_number', dayNumber)
        .maybeSingle();
      if (existingLog) continue;

      const lang: EmailLang = (lead as any).language === 'en' ? 'en' : 'ro';
      const trackingId = crypto.randomUUID();
      const displayName = (lead.first_name || '').split(' ')[0] || (lang === 'en' ? 'friend' : 'prieten');
      const template = buildEmail(dayNumber, displayName, trackingId, lang, (lead as any).health_band ?? null);
      if (!template) continue;

      const emailResponse = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: { "Content-Type": "application/json", "Authorization": `Bearer ${RESEND_API_KEY}` },
        body: JSON.stringify({
          from: "CEO Mind OS <noreply@ceomindos.com>",
          to: [lead.email],
          subject: template.subject,
          html: template.html,
        }),
      });

      if (!emailResponse.ok) {
        const errorText = await emailResponse.text();
        console.error(`Failed to send email to ${lead.email}:`, errorText);
        results.push({ email: lead.email, day: dayNumber, status: 'failed', lang });
        continue;
      }

      await supabase.from('email_sequence_log').insert({
        lead_id: lead.id,
        email: lead.email,
        sequence_type: 'marriage',
        day_number: dayNumber,
        tracking_id: trackingId,
      });

      results.push({ email: lead.email, day: dayNumber, status: 'sent', lang });
    }

    return new Response(JSON.stringify({ success: true, processed: results.length, results }), {
      status: 200, headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  } catch (error: any) {
    console.error("Error in send-marriage-sequence:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500, headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  }
};

serve(handler);
