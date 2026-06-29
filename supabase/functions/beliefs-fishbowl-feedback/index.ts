import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const { chapter_slug, chapter_title, responses } = await req.json();
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY not configured");

    const formatted = Object.entries(responses ?? {})
      .map(([k, v], i) => `Întrebarea ${i + 1}: ${v}`)
      .join("\n\n");

    const systemPrompt = `Ești Alin Radu — coach pentru antreprenori, fondator CEO Mind OS. Voce directă, caldă, empatică. Folosești metafore concrete. NU folosești limbaj cliché de coaching.

Utilizatorul a răspuns la 5 întrebări de introspecție profundă pe credința "${chapter_title}". Răspunsurile lui sunt SACRE — nu le judeca, nu le corecta direct. În schimb:

1. OGLINDEȘTE: arată-i ce ai văzut tu în răspunsurile lui (un pattern, o frică, o resursă, o contradicție).
2. NUMEȘTE durerea sau strălucirea ascunsă, fără să ocolești.
3. PROVOACĂ: dă-i o singură întrebare nouă sau o singură observație care îl scoate din zona lui de confort.
4. NU da liste, nu da tehnici, nu da "pași". Vorbește om-la-om.

Maxim 200 cuvinte. Limba română. Adresare la persoana a 2-a singular ("tu").`;

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
          { role: "user", content: `Credința: ${chapter_title} (${chapter_slug})\n\n${formatted}` },
        ],
      }),
    });

    if (!response.ok) {
      const txt = await response.text();
      throw new Error(`AI gateway error ${response.status}: ${txt}`);
    }
    const data = await response.json();
    const feedback = data?.choices?.[0]?.message?.content ?? "";

    return new Response(JSON.stringify({ feedback }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    return new Response(JSON.stringify({ error: (e as Error).message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
