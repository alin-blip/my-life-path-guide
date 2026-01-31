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
    const { answers, contentType, language = 'ro' } = await req.json();
    
    if (!answers || Object.keys(answers).length < 7) {
      return new Response(
        JSON.stringify({ error: "All 7 story elements are required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      console.error("LOVABLE_API_KEY is not configured");
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    const contentTypeLabel = language === 'en' 
      ? (contentType === 'reel' ? 'Reel/TikTok (60-90 seconds)' : contentType === 'video' ? 'YouTube video (3-5 minutes)' : 'social media post')
      : (contentType === 'reel' ? 'Reel/TikTok (60-90 secunde)' : contentType === 'video' ? 'video YouTube (3-5 minute)' : 'postare social media');

    const systemPrompt = language === 'en' 
      ? `You are an expert storytelling copywriter for social media content.
You create captivating scripts based on the 7 Elements of a Story:
Desire, Problem/Need, Opponent, Plan, Battle, Self-Revelation, Equilibrium.

Rules:
1. Powerful hook based on DESIRE + PROBLEM - stop the scroll in first 3 seconds
2. Introduce OPPONENT as a relatable obstacle
3. Present PLAN as concrete solution
4. BATTLE = the turning point moment
5. SELF-REVELATION = the key insight
6. EQUILIBRIUM = CTA + final vision
7. Conversational, empathetic, direct tone
8. Use emojis where appropriate for visibility
9. Structure clearly with sections labeled`
      : `Ești un copywriter expert în storytelling pentru conținut social media.
Creezi scripturi captivante bazate pe cele 7 Elemente ale unei Povești:
Dorință, Problemă/Nevoie, Oponent, Plan, Bătălie, Revelație, Echilibru.

Reguli:
1. Hook puternic bazat pe DORINȚĂ + PROBLEMĂ - oprește scroll-ul în primele 3 secunde
2. Introduce OPONENTUL ca obstacol relatable
3. Prezintă PLANUL ca soluție concretă
4. BĂTĂLIA = momentul de turning point
5. REVELAȚIA = insight-ul cheie
6. ECHILIBRUL = CTA + viziunea finală
7. Ton conversațional, empatic, direct
8. Folosește emoji-uri unde e cazul pentru vizibilitate
9. Structură clară cu secțiuni etichetate`;

    const userPrompt = language === 'en'
      ? `Create a script for ${contentTypeLabel} based on these story elements:

🎯 DESIRE (what audience wants): ${answers[1]}
💔 PROBLEM (what they're facing): ${answers[2]}
⚔️ OPPONENT (what blocks them): ${answers[3]}
📋 PLAN (the solution): ${answers[4]}
🔥 BATTLE (the test): ${answers[5]}
💡 REVELATION (the transformation): ${answers[6]}
✨ EQUILIBRIUM (the new state): ${answers[7]}

Format the script with these sections:
- 🎬 HOOK (3 sec) - based on desire + problem, stop the scroll
- ⚡ CONFLICT (10-15 sec) - opponent + stakes
- 🚀 JOURNEY (20-30 sec) - plan + battle  
- 💫 TRANSFORMATION (10 sec) - revelation + aha moment
- 🎯 CTA (5 sec) - equilibrium + call to action

Write naturally, as if speaking to a friend. Include pauses [PAUSE] and emphasis *where needed*.`
      : `Creează un script pentru ${contentTypeLabel} bazat pe aceste elemente:

🎯 DORINȚĂ (ce vrea audiența): ${answers[1]}
💔 PROBLEMĂ (ce înfruntă): ${answers[2]}
⚔️ OPONENT (ce îi blochează): ${answers[3]}
📋 PLAN (soluția): ${answers[4]}
🔥 BĂTĂLIE (testul): ${answers[5]}
💡 REVELAȚIE (transformarea): ${answers[6]}
✨ ECHILIBRU (starea nouă): ${answers[7]}

Formatează scriptul cu aceste secțiuni:
- 🎬 HOOK (3 sec) - bazat pe dorință + problemă, oprește scroll-ul
- ⚡ CONFLICT (10-15 sec) - oponent + mize
- 🚀 CĂLĂTORIA (20-30 sec) - plan + bătălie
- 💫 TRANSFORMARE (10 sec) - revelație + momentul aha
- 🎯 CTA (5 sec) - echilibru + apel la acțiune

Scrie natural, ca și cum vorbești cu un prieten. Include pauze [PAUZĂ] și accent *unde e nevoie*.`;

    console.log("Generating story script for:", contentType, "language:", language);

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

    console.log("Story script generated successfully");

    return new Response(
      JSON.stringify({ script }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error generating story script:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Failed to generate script" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
