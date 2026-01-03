import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { topic, contentType } = await req.json();
    
    if (!topic) {
      return new Response(
        JSON.stringify({ error: "Topic is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      console.error("LOVABLE_API_KEY is not configured");
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    const systemPrompt = `Ești un copywriter expert pentru content creation pe social media. 
Creezi scripturi engaging, conversaționale și care captează atenția din prima secundă.

Reguli:
1. Hook puternic în primele 3 secunde - ceva care oprește scrollul
2. Structură clară: Hook → Problem → Solution → CTA
3. Limbaj conversațional, direct, ca și cum vorbești cu un prieten
4. Evită clișeele și limbajul corporate
5. Include emoji-uri unde e cazul pentru vizibilitate
6. Lungimea să fie optimă pentru ${contentType || 'video'} (60-90 secunde pentru Reels/TikTok, 3-5 minute pentru YouTube)
7. Scrie în română`;

    const userPrompt = `Creează un script pentru un ${contentType || 'video'} despre: ${topic}

Include:
1. HOOK (primele 3 secunde) - ceva care face publicul să se oprească
2. INTRO - prezintă problema sau contextul
3. CONȚINUT PRINCIPAL - 3-5 puncte cheie
4. CTA - ce vrei să facă publicul la final

Formatează clar fiecare secțiune.`;

    console.log("Generating script for topic:", topic, "type:", contentType);

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
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Rate limit exceeded. Please try again later." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: "Payment required. Please add credits to your workspace." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      
      throw new Error(`AI gateway error: ${response.status}`);
    }

    const data = await response.json();
    const script = data.choices?.[0]?.message?.content;

    if (!script) {
      throw new Error("No script generated");
    }

    console.log("Script generated successfully");

    return new Response(
      JSON.stringify({ script }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error generating script:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Failed to generate script" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
