// Lovable AI Gateway (Responses API, streamed) helpers for the "Who is right?" lead magnet.
const GATEWAY = "https://ai.gateway.lovable.dev/v1/responses";
const MODEL = "openai/gpt-6-astra";

export class AiError extends Error {
  constructor(public status: number, message: string) { super(message); }
}

async function streamJson(system: string, user: string, name: string, schema: Record<string, unknown>) {
  const key = Deno.env.get("LOVABLE_API_KEY");
  if (!key) throw new AiError(500, "LOVABLE_API_KEY missing");
  const res = await fetch(GATEWAY, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Lovable-API-Key": key,
      Authorization: `Bearer ${key}`,
      "X-Lovable-AIG-SDK": "fetch",
    },
    body: JSON.stringify({
      model: MODEL,
      stream: true,
      store: false,
      reasoning: { effort: "low" },
      input: [
        { role: "system", content: system },
        { role: "user", content: user },
      ],
      text: { format: { type: "json_schema", name, schema, strict: true } },
    }),
  });
  if (!res.ok || !res.body) {
    const t = await res.text().catch(() => "");
    throw new AiError(res.status, t.slice(0, 300) || `AI error ${res.status}`);
  }
  const reader = res.body.getReader();
  const dec = new TextDecoder();
  let buf = "";
  let out = "";
  let done = false;
  while (!done) {
    const r = await reader.read();
    if (r.done) break;
    buf += dec.decode(r.value, { stream: true });
    let idx;
    while ((idx = buf.indexOf("\n")) >= 0) {
      const line = buf.slice(0, idx).trim();
      buf = buf.slice(idx + 1);
      if (!line.startsWith("data:")) continue;
      const data = line.slice(5).trim();
      if (!data || data === "[DONE]") continue;
      try {
        const ev = JSON.parse(data);
        if (ev.type === "response.output_text.delta" && typeof ev.delta === "string") out += ev.delta;
        else if (ev.type === "response.failed" || ev.type === "error") {
          throw new AiError(502, ev?.response?.error?.message || ev?.message || "AI failed");
        } else if (ev.type === "response.completed") done = true;
      } catch (e) {
        if (e instanceof AiError) throw e;
      }
    }
  }
  if (!out.trim()) throw new AiError(502, "Empty AI response");
  return JSON.parse(out);
}

const str = { type: "string" };
const strArr = { type: "array", items: str };

const VERDICT_SCHEMA = {
  type: "object",
  additionalProperties: false,
  required: ["headline", "summary", "facts", "interpretations", "my_needs", "partner_needs", "responsibility_me", "responsibility_partner", "who_is_right", "distortions", "reconnect_phrase"],
  properties: {
    headline: str,
    summary: str,
    facts: strArr,
    interpretations: strArr,
    my_needs: strArr,
    partner_needs: strArr,
    responsibility_me: { type: "integer" },
    responsibility_partner: { type: "integer" },
    who_is_right: str,
    distortions: {
      type: "array",
      items: { type: "object", additionalProperties: false, required: ["name", "evidence"], properties: { name: str, evidence: str } },
    },
    reconnect_phrase: str,
  },
};

const PLAN_SCHEMA = {
  type: "object",
  additionalProperties: false,
  required: ["intro", "days", "repair_script", "exploration_questions", "emergency_protocol"],
  properties: {
    intro: str,
    days: {
      type: "array",
      items: { type: "object", additionalProperties: false, required: ["day", "title", "action", "intention"], properties: { day: { type: "integer" }, title: str, action: str, intention: str } },
    },
    repair_script: strArr,
    exploration_questions: strArr,
    emergency_protocol: strArr,
  },
};

export interface CoupleInput { name: string; language: "ro" | "en"; situation: string; my_perspective: string; partner_perspective: string }

function inputBlock(i: CoupleInput) {
  return i.language === "ro"
    ? `Nume utilizator: ${i.name}\n\nSITUAȚIA:\n${i.situation}\n\nPERSPECTIVA MEA:\n${i.my_perspective}\n\nPERSPECTIVA PARTENERULUI (cum crede utilizatorul că o vede partenerul):\n${i.partner_perspective}`
    : `User name: ${i.name}\n\nSITUATION:\n${i.situation}\n\nMY PERSPECTIVE:\n${i.my_perspective}\n\nPARTNER'S PERSPECTIVE (as the user believes the partner sees it):\n${i.partner_perspective}`;
}

export function generateVerdict(i: CoupleInput) {
  const sys = i.language === "ro"
    ? `Ești "Coach", mediator de cuplu cu pregătire în psihologie (Gottman, CBT, comunicare nonviolentă). Analizezi obiectiv un conflict relatat de UN SINGUR partener. Fii cald, direct, echilibrat, fără să învinovățești. Nu pune diagnostice clinice. Dacă apar semne de abuz sau violență, spune clar în summary să caute ajutor specializat. Scrie în română. responsibility_me + responsibility_partner = 100. who_is_right: 2-4 fraze nuanțate (ex. "Amândoi aveți dreptate pe jumătate…"). facts: doar lucruri observabile. interpretations: presupuneri/judecăți ale fiecăruia. 2-4 distorsiuni cognitive cu dovezi din text. reconnect_phrase: o frază pe care utilizatorul o poate spune azi partenerului.`
    : `You are "Coach", a couples mediator trained in psychology (Gottman, CBT, nonviolent communication). You objectively analyze a conflict described by ONE partner. Be warm, direct, balanced, never blaming. No clinical diagnoses. If there are signs of abuse or violence, clearly say in the summary to seek specialized help. Write in English. responsibility_me + responsibility_partner = 100. who_is_right: 2-4 nuanced sentences. facts: only observable things. interpretations: assumptions/judgments from each side. 2-4 cognitive distortions with evidence from the text. reconnect_phrase: one sentence the user can say to their partner today.`;
  return streamJson(sys, inputBlock(i), "couple_verdict", VERDICT_SCHEMA);
}

export function generatePlan(i: CoupleInput, verdict: unknown) {
  const sys = i.language === "ro"
    ? `Ești "Coach", mediator de cuplu. Creezi un PROTOCOL DE DE-ESCALADARE de 7 zile, personalizat pe conflictul și verdictul de mai jos. Exact 7 zile (day 1..7), fiecare cu o acțiune concretă sub 15 minute și o intenție. repair_script: 4-6 fraze pe care utilizatorul le poate spune. exploration_questions: 5 întrebări pentru o conversație calmă. emergency_protocol: 4-5 pași dacă cearta reizbucnește. Română, ton cald și practic.`
    : `You are "Coach", a couples mediator. Create a 7-DAY DE-ESCALATION PROTOCOL personalized to the conflict and verdict below. Exactly 7 days (day 1..7), each with a concrete action under 15 minutes and an intention. repair_script: 4-6 sentences the user can say. exploration_questions: 5 questions for a calm conversation. emergency_protocol: 4-5 steps if the fight flares up again. English, warm and practical.`;
  return streamJson(sys, `${inputBlock(i)}\n\nVERDICT:\n${JSON.stringify(verdict)}`, "couple_plan", PLAN_SCHEMA);
}

export async function sendCoupleEmail(to: string, idempotencyKey: string, data: Record<string, unknown>) {
  const url = Deno.env.get("SUPABASE_URL")!;
  const key = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
  try {
    const r = await fetch(`${url}/functions/v1/send-transactional-email`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${key}`, apikey: key },
      body: JSON.stringify({ templateName: "couple-verdict", recipientEmail: to, idempotencyKey, templateData: data }),
    });
    if (!r.ok) console.error("couple email failed", r.status, (await r.text()).slice(0, 200));
    return r.ok;
  } catch (e) {
    console.error("couple email error", e);
    return false;
  }
}

export function resultUrl(language: string, token: string) {
  const base = Deno.env.get("SITE_URL") || "https://www.ceomindos.com";
  return language === "en" ? `${base}/en/who-is-right?t=${token}` : `${base}/cine-are-dreptate?t=${token}`;
}
