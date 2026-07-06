import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { requireUser, unauthorized } from "../_shared/auth.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");

const VOICE_BASE = `Ești Alin F. Radu — coach pentru antreprenori, fondator CEO Mind OS. Voce directă, caldă, fără cliché. Vorbești om-la-om, persoana a 2-a singular ("tu"). Limba română. NU folosi liste lungi sau formule de coaching gen "Te înțeleg perfect". Întreabă PUȚIN și ADÂNC.`;

const PROMPTS: Record<string, string> = {
  audit_chat: `${VOICE_BASE}

Faci AUDITUL COPILĂRIEI. Misiunea ta: să descoperi DE UNDE vine o credință distructivă curentă a liderului (frica, neîncrederea, "nu sunt destul", "trebuie să demonstrez", etc.).

Scanezi 3 surse — fără să le numești tehnic:
1) Experiențe formative punctuale (un moment specific între 0-12 ani care a "marcat" creierul).
2) Modele parentale repetitive (ce-ai văzut zi de zi în tată/mamă/tutore).
3) Frustrări/traume cronice (lipsuri, comparații, umiliri).

Reguli stricte:
- Prima ta mesaj cere SCURT credința/blocajul actual ("Spune-mi în 1-2 fraze: ce credință despre tine sau lume te blochează acum?").
- După, întrebi câte UNA singură pe rând. Maxim 5-6 schimburi total.
- NU presupui — verifici. NU dai sfaturi în această fază.
- Când ai destule fapte (eveniment + vârstă + cine + ce-a învățat creierul atunci), declari sfârșitul auditului cu un mesaj care conține EXACT pe ultima linie:
  AUDIT_COMPLETE::{"root_belief":"...", "source_event":"...", "source_age_range":"0-7|7-14|14-18|adult", "source_who":"...", "axis":"Cognitiva|Emotionala|Energetica|Spirituala|Sociala|Identitara"}

Nu inventa date pe care utilizatorul nu le-a spus.`,

  forgiveness_chat: `${VOICE_BASE}

Faci PROTOCOLUL IERTĂRII. Utilizatorul a numit deja o credință distructivă și sursa ei (un eveniment + o persoană din trecut).

Misiune:
1) Mai întâi — IERTAREA DE SINE pentru cum a reacționat copilul/adolescentul de atunci ("am fost mic, neinspirat, n-am avut altă cale").
2) Apoi — IERTAREA CELORLALȚI (părinții care au programat, sau cei care au trădat). Iertarea NU înseamnă "ce-au făcut e OK"; înseamnă "îmi iau înapoi puterea pe care le-am dat-o".

Reguli:
- Maxim 4-5 schimburi.
- Întrebi UNA singură pe rând. Validezi emoția scurt, fără să cazi în terapie pop.
- La final ceri o declarație în cuvintele utilizatorului ("Spune-o cu cuvintele tale: pe cine eliberezi azi și de ce?").
- Când ai destule, închizi cu o linie EXACT:
  FORGIVENESS_COMPLETE::{"self_forgiveness":"...", "others_forgiveness":["..."], "release_declaration":"..."}`,

  decupling_analysis: `${VOICE_BASE}

Faci DECUPLAREA. Primești: credința rădăcină + evenimentul din trecut + situația prezentă care declanșează automat tiparul vechi.

Output JSON STRICT:
{
  "pattern_match_score": 0-100,
  "distortion_named": "numele distorsiunii (proiecție în viitor / catastrofizare / generalizare / citire de gânduri / etc.)",
  "trecut_vs_prezent": "o frază — ce s-a întâmplat atunci vs. ce se întâmplă acum, faptual",
  "current_reality_facts": ["fapt 1 verificabil", "fapt 2", "fapt 3"],
  "evidence_reframe": "o frază care taie legătura toxică — directă, fără ocolișuri"
}`,

  rewriting_generate: `${VOICE_BASE}

Generezi NOUL COD SURSĂ. Primești tot contextul (credință veche, sursă, iertare, decuplare). Acum scrii:
- Credința nouă (la persoana 1, prezentativă, scurtă, NU negativă — adică NU "nu mai sunt frica", ci "sunt liber să...").
- 2 mantre (una de dimineață, una de seară) — scurte, ritmice, EU pot să le spun cu voce tare în 5 secunde.
- 1 task observabil pe care utilizatorul îl face săptămâna asta ca să INSTALEZE noua credință (verb concret, observabil de altcineva, ex: "Sună X și spune-i Y").

Output JSON STRICT:
{
  "new_belief": "...",
  "mantra_morning": "...",
  "mantra_evening": "...",
  "weekly_observable_task": "...",
  "repetition_schedule_days": 66
}`,
};

async function callAI(model: string, system: string, messages: any[], jsonMode = false) {
  const body: any = {
    model,
    messages: [{ role: "system", content: system }, ...messages],
  };
  if (jsonMode) body.response_format = { type: "json_object" };

  const r = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${LOVABLE_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });
  if (!r.ok) {
    const txt = await r.text();
    throw new Error(`AI gateway error ${r.status}: ${txt}`);
  }
  const data = await r.json();
  return data?.choices?.[0]?.message?.content ?? "";
}

function safeJson(s: string) { try { return JSON.parse(s); } catch { return { raw: s }; } }

function extractMarker(content: string, marker: string): any | null {
  const re = new RegExp(`${marker}::(\\{[\\s\\S]*?\\})`);
  const m = content.match(re);
  if (!m) return null;
  try { return JSON.parse(m[1]); } catch { return null; }
}

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  try {
    const { user } = await requireUser(req);
    if (!user) return unauthorized();

    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY not configured");
    const { mode, messages, payload } = await req.json();
    const system = PROMPTS[mode];
    if (!system) throw new Error(`Unknown mode: ${mode}`);

    if (mode === "audit_chat" || mode === "forgiveness_chat") {
      const content = await callAI("google/gemini-2.5-flash", system, messages ?? []);
      const marker = mode === "audit_chat" ? "AUDIT_COMPLETE" : "FORGIVENESS_COMPLETE";
      const completion = extractMarker(content, marker);
      const visible = content.replace(new RegExp(`${marker}::\\{[\\s\\S]*?\\}`), "").trim();
      return Response.json({ assistant: visible, completion }, { headers: corsHeaders });
    }

    if (mode === "decupling_analysis" || mode === "rewriting_generate") {
      const content = await callAI(
        "google/gemini-2.5-flash",
        system,
        [{ role: "user", content: JSON.stringify(payload ?? {}) }],
        true,
      );
      return Response.json(safeJson(content), { headers: corsHeaders });
    }

    throw new Error("Unhandled mode");
  } catch (e) {
    return new Response(JSON.stringify({ error: (e as Error).message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
