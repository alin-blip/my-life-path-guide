// Public edge function (no JWT) for the Marriage Evaluation lead magnet.
// - Validates input (25 answers, 1..5)
// - Computes per-axis scores (6 axes)
// - Calls Lovable AI Gateway (Gemini) for personalized diagnosis + plan
// - Stores lead in marriage_quiz_leads
// - Sends a branded email via Resend with the report
import { createClient } from "npm:@supabase/supabase-js@2.45.0";
import { z } from "npm:zod@3.23.8";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const AXES = [
  "cognitiva",
  "afectiva",
  "comportamentala",
  "volitiva",
  "profesionala",
  "spirituala",
] as const;
type Axis = (typeof AXES)[number];

// Maps question index (0..24) to axis. 25 questions = 4 per axis + 1 overall (assigned to "afectiva").
const QUESTION_AXIS: Axis[] = [
  // 0-3 cognitiva
  "cognitiva", "cognitiva", "cognitiva", "cognitiva",
  // 4-7 afectiva
  "afectiva", "afectiva", "afectiva", "afectiva",
  // 8-11 comportamentala
  "comportamentala", "comportamentala", "comportamentala", "comportamentala",
  // 12-15 volitiva
  "volitiva", "volitiva", "volitiva", "volitiva",
  // 16-19 profesionala
  "profesionala", "profesionala", "profesionala", "profesionala",
  // 20-23 spirituala
  "spirituala", "spirituala", "spirituala", "spirituala",
  // 24 overall -> afectiva
  "afectiva",
];

// `reverse`-scored questions (where high score = unhealthy).
// All questions are framed as "healthy statements", so reverse: false by default.
// We declare a few negatively framed ones if needed.
const REVERSE_INDICES = new Set<number>([2, 6, 10, 14, 18, 22]);

const BodySchema = z.object({
  email: z.string().trim().email().max(255),
  firstName: z.string().trim().max(80).optional().nullable(),
  language: z.enum(["ro", "en"]).default("ro"),
  marketingConsent: z.boolean().default(false),
  answers: z.array(z.number().int().min(1).max(5)).length(25),
});

function computeScores(answers: number[]) {
  const sums: Record<Axis, number> = {
    cognitiva: 0, afectiva: 0, comportamentala: 0,
    volitiva: 0, profesionala: 0, spirituala: 0,
  };
  const counts: Record<Axis, number> = {
    cognitiva: 0, afectiva: 0, comportamentala: 0,
    volitiva: 0, profesionala: 0, spirituala: 0,
  };
  answers.forEach((raw, i) => {
    const axis = QUESTION_AXIS[i];
    const v = REVERSE_INDICES.has(i) ? 6 - raw : raw; // 1..5
    sums[axis] += v;
    counts[axis] += 1;
  });
  const scores: Record<Axis, number> = { ...sums };
  AXES.forEach((a) => {
    // avg (1..5) -> 0..100
    const avg = counts[a] > 0 ? sums[a] / counts[a] : 0;
    scores[a] = Math.round(((avg - 1) / 4) * 100);
  });
  const overall = Math.round(
    AXES.reduce((acc, a) => acc + scores[a], 0) / AXES.length,
  );
  let band = "critic";
  if (overall >= 80) band = "excelent";
  else if (overall >= 65) band = "sanatos";
  else if (overall >= 50) band = "atentie";
  else if (overall >= 35) band = "fragil";
  return { scores, overall, band };
}

const AXIS_LABELS_RO: Record<Axis, string> = {
  cognitiva: "Cognitivă (gânduri, narațiuni)",
  afectiva: "Afectivă (emoții, intimitate)",
  comportamentala: "Comportamentală (ritualuri, prezență)",
  volitiva: "Volitivă (decizii, angajament)",
  profesionala: "Profesională (echilibrul muncă-familie)",
  spirituala: "Spirituală (valori, sens comun)",
};
const AXIS_LABELS_EN: Record<Axis, string> = {
  cognitiva: "Cognitive (thoughts, narratives)",
  afectiva: "Affective (emotions, intimacy)",
  comportamentala: "Behavioral (rituals, presence)",
  volitiva: "Volitional (decisions, commitment)",
  profesionala: "Professional (work-family balance)",
  spirituala: "Spiritual (values, shared meaning)",
};

async function callAI(
  lang: "ro" | "en",
  scores: Record<Axis, number>,
  overall: number,
  band: string,
  firstName: string | null | undefined,
) {
  const apiKey = Deno.env.get("LOVABLE_API_KEY");
  if (!apiKey) throw new Error("LOVABLE_API_KEY missing");

  const labels = lang === "ro" ? AXIS_LABELS_RO : AXIS_LABELS_EN;
  const axisList = AXES.map((a) => `- ${labels[a]}: ${scores[a]}/100`).join("\n");

  const sys = lang === "ro"
    ? `Ești coach relațional pentru antreprenori (CEO Mind OS - "Executive Marriage Audit"). Vocea: caldă, directă, fără clișee de terapie. Răspunzi STRICT cu JSON valid, fără text suplimentar.`
    : `You are a relational coach for entrepreneurs (CEO Mind OS - "Executive Marriage Audit"). Voice: warm, direct, no therapy clichés. Reply STRICTLY with valid JSON, no extra text.`;

  const userPrompt = lang === "ro"
    ? `Prenume: ${firstName || "Antreprenor"}
Scor general: ${overall}/100 (${band})
Scoruri pe axe:
${axisList}

Generează un raport JSON cu următoarea structură:
{
  "diagnosis": "2-3 fraze: o radiografie sinceră a relației, conectată DIRECT la viața de antreprenor (muncă, presiune, timp). Vocea lui Alin: empatic dar fără să cosmetizezi.",
  "strengths": ["3 puncte forte concrete bazate pe axele cu scor >65"],
  "risks": ["3 riscuri concrete bazate pe axele cu scor <50, formulate ca pattern-uri observate"],
  "plan_30_days": [
    {"week": 1, "focus": "...", "action": "1 acțiune concretă, măsurabilă, sub 15 min/zi"},
    {"week": 2, "focus": "...", "action": "..."},
    {"week": 3, "focus": "...", "action": "..."},
    {"week": 4, "focus": "...", "action": "..."}
  ],
  "first_step_today": "O acțiune de făcut în următoarele 24h, sub 5 minute"
}`
    : `First name: ${firstName || "Founder"}
Overall score: ${overall}/100 (${band})
Axis scores:
${axisList}

Generate a JSON report with this structure:
{
  "diagnosis": "2-3 sentences: an honest snapshot of the relationship, DIRECTLY connected to entrepreneur life (work, pressure, time). Warm but no sugarcoating.",
  "strengths": ["3 concrete strengths based on axes scoring >65"],
  "risks": ["3 concrete risks based on axes scoring <50, framed as observed patterns"],
  "plan_30_days": [
    {"week": 1, "focus": "...", "action": "1 concrete, measurable action under 15 min/day"},
    {"week": 2, "focus": "...", "action": "..."},
    {"week": 3, "focus": "...", "action": "..."},
    {"week": 4, "focus": "...", "action": "..."}
  ],
  "first_step_today": "One action to do in the next 24h, under 5 minutes"
}`;

  const res = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: "google/gemini-2.5-flash",
      messages: [
        { role: "system", content: sys },
        { role: "user", content: userPrompt },
      ],
      response_format: { type: "json_object" },
    }),
  });

  if (!res.ok) {
    const txt = await res.text();
    throw new Error(`AI gateway error ${res.status}: ${txt.slice(0, 200)}`);
  }
  const json = await res.json();
  const content = json?.choices?.[0]?.message?.content ?? "{}";
  try {
    return JSON.parse(content);
  } catch {
    return { diagnosis: content, strengths: [], risks: [], plan_30_days: [], first_step_today: "" };
  }
}

function renderEmailHtml(
  lang: "ro" | "en",
  firstName: string | null | undefined,
  scores: Record<Axis, number>,
  overall: number,
  band: string,
  ai: any,
) {
  const labels = lang === "ro" ? AXIS_LABELS_RO : AXIS_LABELS_EN;
  const t = lang === "ro"
    ? {
        title: "Raportul tău - Evaluarea Căsătoriei",
        hello: `Salut${firstName ? ` ${firstName}` : ""},`,
        intro: "Iată raportul personalizat pe baza răspunsurilor tale:",
        overall: "Scor general",
        axes: "Scoruri pe cele 6 axe",
        diag: "Diagnoză",
        strengths: "Puncte forte",
        risks: "Atenție la",
        plan: "Plan 30 de zile",
        today: "Primul pas - astăzi",
        cta: "Deschide Marriage Stack (analiză profundă cu screenshots & audio)",
        ctaUrl: "https://www.ceomindos.com/marriage",
        footer: "CEO Mind OS - Executive Marriage Audit",
      }
    : {
        title: "Your Report - Marriage Evaluation",
        hello: `Hi${firstName ? ` ${firstName}` : ""},`,
        intro: "Here's your personalized report based on your answers:",
        overall: "Overall score",
        axes: "Scores across the 6 axes",
        diag: "Diagnosis",
        strengths: "Strengths",
        risks: "Watch out for",
        plan: "30-day plan",
        today: "First step - today",
        cta: "Open Marriage Stack (deep analysis with screenshots & audio)",
        ctaUrl: "https://www.ceomindos.com/marriage",
        footer: "CEO Mind OS - Executive Marriage Audit",
      };

  const axisRows = AXES.map((a) => {
    const s = scores[a];
    const color = s >= 65 ? "#22c55e" : s >= 50 ? "#f59e0b" : "#ef4444";
    return `<tr><td style="padding:6px 10px;color:#cbd5e1;font-size:14px;">${labels[a]}</td><td style="padding:6px 10px;text-align:right;font-weight:700;color:${color};">${s}/100</td></tr>`;
  }).join("");

  const planRows = (ai.plan_30_days || []).map((p: any) =>
    `<li style="margin-bottom:8px;color:#e2e8f0;"><strong>${lang === "ro" ? "Săpt." : "Week"} ${p.week} — ${p.focus}:</strong> ${p.action}</li>`,
  ).join("");

  const strengths = (ai.strengths || []).map((s: string) => `<li style="color:#86efac;">${s}</li>`).join("");
  const risks = (ai.risks || []).map((s: string) => `<li style="color:#fca5a5;">${s}</li>`).join("");

  return `<!doctype html><html><body style="margin:0;padding:0;background:#ffffff;font-family:Arial,sans-serif;">
  <div style="max-width:640px;margin:0 auto;background:#10172d;color:#e2e8f0;padding:32px 28px;border-radius:12px;">
    <h1 style="color:#fff;font-size:24px;margin:0 0 8px;">${t.title}</h1>
    <p style="color:#94a3b8;margin:0 0 24px;">${t.hello}</p>
    <p style="color:#e2e8f0;margin:0 0 20px;">${t.intro}</p>

    <div style="background:#0b1226;border:1px solid #1e293b;border-radius:10px;padding:20px;margin-bottom:20px;text-align:center;">
      <div style="color:#94a3b8;font-size:13px;letter-spacing:1px;text-transform:uppercase;">${t.overall}</div>
      <div style="font-size:56px;font-weight:800;color:${overall >= 65 ? "#22c55e" : overall >= 50 ? "#f59e0b" : "#ef4444"};line-height:1;margin-top:6px;">${overall}<span style="font-size:20px;color:#64748b;">/100</span></div>
      <div style="color:#cbd5e1;margin-top:6px;text-transform:capitalize;">${band}</div>
    </div>

    <h2 style="color:#fff;font-size:18px;margin:24px 0 8px;">${t.axes}</h2>
    <table style="width:100%;border-collapse:collapse;background:#0b1226;border-radius:8px;overflow:hidden;">${axisRows}</table>

    <h2 style="color:#fff;font-size:18px;margin:28px 0 8px;">${t.diag}</h2>
    <p style="color:#e2e8f0;line-height:1.6;">${ai.diagnosis || ""}</p>

    ${strengths ? `<h2 style="color:#fff;font-size:18px;margin:24px 0 8px;">${t.strengths}</h2><ul>${strengths}</ul>` : ""}
    ${risks ? `<h2 style="color:#fff;font-size:18px;margin:24px 0 8px;">${t.risks}</h2><ul>${risks}</ul>` : ""}

    ${planRows ? `<h2 style="color:#fff;font-size:18px;margin:24px 0 8px;">${t.plan}</h2><ol style="padding-left:18px;">${planRows}</ol>` : ""}

    ${ai.first_step_today ? `<div style="background:#1e293b;border-left:3px solid #f59e0b;padding:14px 16px;border-radius:6px;margin:20px 0;"><div style="color:#f59e0b;font-size:12px;text-transform:uppercase;letter-spacing:1px;margin-bottom:4px;">${t.today}</div><div style="color:#fff;">${ai.first_step_today}</div></div>` : ""}

    <div style="text-align:center;margin:32px 0 8px;">
      <a href="${t.ctaUrl}" style="display:inline-block;background:#f59e0b;color:#10172d;padding:14px 28px;border-radius:8px;text-decoration:none;font-weight:700;">${t.cta}</a>
    </div>
    <p style="color:#64748b;font-size:12px;text-align:center;margin-top:24px;">${t.footer}</p>
  </div>
  </body></html>`;
}

async function sendEmail(to: string, subject: string, html: string) {
  const apiKey = Deno.env.get("RESEND_API_KEY");
  if (!apiKey) {
    console.warn("RESEND_API_KEY missing, skipping email");
    return { skipped: true };
  }
  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      from: "CEO Mind OS <onboarding@resend.dev>",
      to: [to],
      subject,
      html,
    }),
  });
  if (!res.ok) {
    const t = await res.text();
    console.error("Resend error", res.status, t.slice(0, 300));
    return { error: t };
  }
  return await res.json();
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const raw = await req.json();
    const parsed = BodySchema.safeParse(raw);
    if (!parsed.success) {
      return new Response(
        JSON.stringify({ error: "invalid_input", details: parsed.error.flatten().fieldErrors }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }
    const { email, firstName, language, marketingConsent, answers } = parsed.data;

    const { scores, overall, band } = computeScores(answers);

    let ai: any = {};
    try {
      ai = await callAI(language, scores, overall, band, firstName);
    } catch (e) {
      console.error("AI error", e);
      ai = {
        diagnosis: language === "ro"
          ? "Raportul tău complet va fi disponibil în câteva momente. Începe cu pașii din plan."
          : "Your full report will be available shortly. Start with the steps in the plan.",
        strengths: [], risks: [], plan_30_days: [], first_step_today: "",
      };
    }

    const url = Deno.env.get("SUPABASE_URL")!;
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const admin = createClient(url, serviceKey, { auth: { persistSession: false } });

    const ua = req.headers.get("user-agent") ?? null;
    const ipRaw = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "";
    const ipHash = ipRaw
      ? Array.from(new Uint8Array(await crypto.subtle.digest("SHA-256", new TextEncoder().encode(ipRaw))))
          .map((b) => b.toString(16).padStart(2, "0"))
          .join("")
          .slice(0, 32)
      : null;

    const html = renderEmailHtml(language, firstName, scores, overall, band, ai);
    const subject = language === "ro"
      ? "Raportul tău - Evaluarea Căsătoriei (CEO Mind OS)"
      : "Your Report - Marriage Evaluation (CEO Mind OS)";

    const emailRes = await sendEmail(email, subject, html);

    const { data: inserted, error: insErr } = await admin
      .from("marriage_quiz_leads")
      .insert({
        email,
        first_name: firstName ?? null,
        language,
        answers,
        axis_scores: scores,
        overall_score: overall,
        health_band: band,
        ai_diagnosis: ai.diagnosis ?? null,
        ai_plan: ai,
        marketing_consent: marketingConsent,
        user_agent: ua,
        ip_hash: ipHash,
        email_sent_at: (emailRes as any)?.id ? new Date().toISOString() : null,
      })
      .select("id")
      .single();

    if (insErr) console.error("insert error", insErr);

    return new Response(
      JSON.stringify({
        ok: true,
        leadId: inserted?.id ?? null,
        scores,
        overall,
        band,
        ai,
        emailSent: !!(emailRes as any)?.id,
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  } catch (e) {
    console.error("fatal", e);
    return new Response(
      JSON.stringify({ error: "server_error", message: String((e as Error).message ?? e) }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }
});
