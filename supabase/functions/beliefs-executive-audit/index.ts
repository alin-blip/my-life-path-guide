import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { requireUser, unauthorized } from "../_shared/auth.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");

const CHAPTER_LABELS: Record<string, string> = {
  "bunatate": "Bunătate",
  "iubire-de-oameni": "Iubire de Oameni",
  "recunostinta": "Recunoștință",
  "iertare": "Iertare",
  "smerenia": "Smerenia",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const { user } = await requireUser(req);
    if (!user) return unauthorized();

    const { scores, overall } = await req.json();
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY not configured");

    const scoresList = Object.entries(scores ?? {})
      .map(([k, v]) => `- ${CHAPTER_LABELS[k] ?? k}: ${v}/100`)
      .join("\n");

    const systemPrompt = `Ești Alin Radu, coach pentru antreprenori. Analizezi rezultatul Auditului Executiv al celor 5 Credințe ale Liderului (Bunătate, Iubire de Oameni, Recunoștință, Iertare, Smerenia) la un antreprenor.

Generezi un JSON STRICT cu următoarea structură:
{
  "summary": "max 150 cuvinte, voce caldă-directă a lui Alin, oglindă a stării reale a liderului — fără cliché",
  "strategic_plan": {
    "tasks": [
      { "chapter": "Bunătate", "title": "...", "why": "...", "priority": "Înalt|Mediu|Scăzut" },
      ... (5-7 sarcini comportamentale concrete, corective, pe credințele cele mai slabe)
    ]
  }
}

Reguli:
- Sarcinile sunt COMPORTAMENTALE (ce face), nu conceptuale.
- Prioritizează credințele cu scor <60.
- Fiecare sarcină = un act observabil într-o săptămână (ex: "Sună 3 foști colaboratori și mulțumește-le concret pentru un lucru.")
- NU pune mai mult de 7 sarcini.
- "why" = 1 propoziție scurtă, conectată la scor.
- Limbă: română. Adresare "tu".`;

    const userPrompt = `Scor general: ${overall}/100\n\nScoruri pe credință:\n${scoresList}\n\nGenerează JSON-ul.`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
        response_format: { type: "json_object" },
      }),
    });

    if (!response.ok) {
      const txt = await response.text();
      throw new Error(`AI gateway error ${response.status}: ${txt}`);
    }
    const data = await response.json();
    const content = data?.choices?.[0]?.message?.content ?? "{}";
    let parsed: any = {};
    try {
      parsed = JSON.parse(content);
    } catch {
      parsed = { summary: content, strategic_plan: { tasks: [] } };
    }

    return new Response(JSON.stringify({
      summary: parsed.summary ?? "",
      strategic_plan: parsed.strategic_plan ?? { tasks: [] },
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    return new Response(JSON.stringify({ error: (e as Error).message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
