import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY")!;

const SYSTEM_PROMPT = `Ești un asistent empatic în stilul lui Alin (CEO Mind OS). Userul scrie seara un "brain dump" — gânduri brute, neorganizate. Sarcina ta: clasifică fiecare gând/propoziție în 4 categorii și returnează DOAR prin tool-ul classify_brain_dump.

Categorii:
- "task" → o acțiune concretă de făcut (verb la imperativ/infinitiv: sun, trimit, fac, etc.). Pentru taskuri sugerează:
  * priority Eisenhower: 4=Urgent+Important (foc), 3=Important nu Urgent (ideal — planificat), 2=Urgent nu Important (delegă), 1=nici-nici (șterge)
  * suggestedDay: 'M','T','W','Th','F','Sa','Su' (default = mâine)
  * destination: 'hit' (focus al săptămânii) sau 'do' (mărunte)
- "thought" → o reflecție, frică, frustrare, observație, lecție, problemă neprocesată. Merge în Jurnal.
- "idea" → "ar fi mișto să...", "ce-ar fi dacă...", oportunități. Merge în Ideas Bank.
- "gratitude" → "mulțumesc pentru...", "sunt recunoscător că...". Merge în lista de recunoștință.

Reguli:
- Separă propozițiile/gândurile distincte (chiar dacă-s legate cu "și"/","/"+")
- Păstrează textul aproape verbatim (corectează doar ortografia gravă)
- Dacă userul scrie ceva ambiguu → marchează "thought"
- NU adăuga itemi inventați. NU rescrie complet. NU comenta.`;

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!,
      { global: { headers: { Authorization: authHeader } } }
    );
    const token = authHeader.replace("Bearer ", "");
    const { data: claims, error: claimsError } = await supabaseClient.auth.getClaims(token);
    if (claimsError || !claims?.claims) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { text } = await req.json();
    if (!text || typeof text !== "string" || text.trim().length < 2) {
      return new Response(JSON.stringify({ error: "Text is required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const tools = [
      {
        type: "function",
        function: {
          name: "classify_brain_dump",
          description: "Clasifică textul în itemi structurați.",
          parameters: {
            type: "object",
            properties: {
              items: {
                type: "array",
                items: {
                  type: "object",
                  properties: {
                    text: { type: "string", description: "Textul itemului, aproape verbatim" },
                    type: {
                      type: "string",
                      enum: ["task", "thought", "idea", "gratitude"],
                    },
                    priority: { type: "integer", enum: [1, 2, 3, 4], description: "Doar pentru task" },
                    suggestedDay: {
                      type: "string",
                      enum: ["M", "T", "W", "Th", "F", "Sa", "Su"],
                      description: "Doar pentru task",
                    },
                    destination: {
                      type: "string",
                      enum: ["hit", "do"],
                      description: "Doar pentru task",
                    },
                  },
                  required: ["text", "type"],
                },
              },
            },
            required: ["items"],
          },
        },
      },
    ];

    let attempt = 0;
    let response: Response | null = null;
    while (attempt < 3) {
      response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${LOVABLE_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "google/gemini-2.5-flash",
          messages: [
            { role: "system", content: SYSTEM_PROMPT },
            { role: "user", content: `Brain dump:\n\n${text}` },
          ],
          tools,
          tool_choice: { type: "function", function: { name: "classify_brain_dump" } },
        }),
      });
      if (response.ok) break;
      if (response.status === 429 || response.status === 402) break;
      attempt++;
      await new Promise((r) => setTimeout(r, 500 * attempt));
    }

    if (!response || !response.ok) {
      const status = response?.status ?? 500;
      const errText = response ? await response.text() : "no response";
      console.error("AI gateway error:", status, errText);
      return new Response(
        JSON.stringify({
          error: status === 429 ? "Rate limits exceeded" : status === 402 ? "Payment required" : "AI gateway error",
        }),
        { status, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const data = await response.json();
    const toolCall = data?.choices?.[0]?.message?.tool_calls?.[0];
    if (!toolCall?.function?.arguments) {
      console.error("No tool call returned", JSON.stringify(data).slice(0, 500));
      return new Response(JSON.stringify({ error: "AI did not return classification", items: [] }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    let parsed: { items: any[] };
    try {
      parsed = JSON.parse(toolCall.function.arguments);
    } catch {
      return new Response(JSON.stringify({ error: "Invalid AI response", items: [] }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ items: parsed.items ?? [] }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("evening-brain-dump error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
