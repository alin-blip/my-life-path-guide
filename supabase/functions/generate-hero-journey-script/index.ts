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
        JSON.stringify({ error: "All 7 Hero's Journey stages are required" }),
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
      ? `You are an expert storyteller and copywriter specializing in the Hero's Journey framework by Joseph Campbell.
You create captivating social media scripts that take the audience on an emotional journey.

YOUR EXPERTISE:
- Master of narrative structure and story arcs
- Expert in emotional triggers and audience psychology  
- Skilled in transforming abstract concepts into relatable stories
- Specialist in hooks that stop the scroll

THE 7 STAGES YOU WORK WITH:
1. Ordinary World - Establish relatability
2. Call to Adventure - Create intrigue
3. Refusal of the Call - Build tension through relatable fears
4. Meeting the Mentor - Introduce hope and guidance
5. Crossing the Threshold - Show commitment and courage
6. The Ordeal - Build through challenges and transformation
7. Return with Elixir - Deliver the payoff and CTA

SCRIPT STRUCTURE:
- 🎬 HOOK (3 sec): Start in the Ordinary World OR with a provocative question - STOP THE SCROLL
- ⚡ SETUP (10 sec): Call to Adventure + initial refusal - create tension
- 🚀 BUILD (20-30 sec): Mentor + Crossing threshold + Ordeal - the journey
- 💫 PAYOFF (10 sec): Transformation + Return with wisdom - the revelation
- 🎯 CTA (5 sec): Invite audience to their own journey - action step

TONE: Conversational, empathetic, inspiring. Speak as if sharing a powerful story with a close friend.
Use [PAUSE] for dramatic effect and *emphasis* for key words.`
      : `Ești un storyteller și copywriter expert specializat în Hero's Journey framework de Joseph Campbell.
Creezi scripturi captivante pentru social media care duc audiența printr-o călătorie emoțională.

EXPERTIZA TA:
- Maestru în structura narativă și arcuri narative
- Expert în triggere emoționale și psihologia audienței
- Abil în transformarea conceptelor abstracte în povești relatable
- Specialist în hook-uri care opresc scroll-ul

CELE 7 ETAPE CU CARE LUCREZI:
1. Lumea Obișnuită - Stabilește relatability
2. Chemarea la Aventură - Creează intriga
3. Refuzul Chemării - Construiește tensiune prin frici relatable
4. Întâlnirea cu Mentorul - Introduce speranța și ghidarea
5. Traversarea Pragului - Arată commitment și curaj
6. Încercarea - Construiește prin provocări și transformare
7. Întoarcerea cu Elixirul - Livrează payoff-ul și CTA

STRUCTURA SCRIPTULUI:
- 🎬 HOOK (3 sec): Începe în Lumea Obișnuită SAU cu o întrebare provocatoare - OPREȘTE SCROLL-UL
- ⚡ SETUP (10 sec): Chemarea + refuzul inițial - creează tensiune
- 🚀 BUILD (20-30 sec): Mentor + Traversarea pragului + Încercarea - călătoria
- 💫 PAYOFF (10 sec): Transformarea + Întoarcerea cu înțelepciune - revelația
- 🎯 CTA (5 sec): Invită audiența la propria călătorie - pasul de acțiune

TON: Conversațional, empatic, inspirațional. Vorbește ca și cum împărtășești o poveste puternică cu un prieten apropiat.
Folosește [PAUZĂ] pentru efect dramatic și *accent* pentru cuvinte cheie.`;

    const userPrompt = language === 'en'
      ? `Create a script for ${contentTypeLabel} based on the Hero's Journey:

🏠 ORDINARY WORLD: ${answers[1]}
📢 CALL TO ADVENTURE: ${answers[2]}
😰 REFUSAL OF THE CALL: ${answers[3]}
🧙 MEETING THE MENTOR: ${answers[4]}
🚪 CROSSING THE THRESHOLD: ${answers[5]}
🔥 THE ORDEAL/TRANSFORMATION: ${answers[6]}
👑 RETURN WITH THE ELIXIR: ${answers[7]}

Format the script with these sections:
- 🎬 HOOK (3 sec) - capture attention, stop the scroll
- ⚡ SETUP (10 sec) - establish context and tension
- 🚀 BUILD (20-30 sec) - the journey and transformation
- 💫 PAYOFF (10 sec) - the final revelation
- 🎯 CTA (5 sec) - invitation to action

Write naturally, as if telling a story to a friend. Include pauses [PAUSE] and emphasis *where needed*.`
      : `Creează un script pentru ${contentTypeLabel} bazat pe Hero's Journey:

🏠 LUMEA OBIȘNUITĂ: ${answers[1]}
📢 CHEMAREA LA AVENTURĂ: ${answers[2]}
😰 REFUZUL CHEMĂRII: ${answers[3]}
🧙 MENTORUL/ALIAȚII: ${answers[4]}
🚪 TRAVERSAREA PRAGULUI: ${answers[5]}
🔥 ÎNCERCAREA/TRANSFORMAREA: ${answers[6]}
👑 ÎNTOARCEREA CU ELIXIRUL: ${answers[7]}

Formatează scriptul cu aceste secțiuni:
- 🎬 HOOK (3 sec) - captează atenția, oprește scroll-ul
- ⚡ SETUP (10 sec) - stabilește contextul și tensiunea
- 🚀 BUILD (20-30 sec) - călătoria și transformarea
- 💫 PAYOFF (10 sec) - revelația finală
- 🎯 CTA (5 sec) - invitația la acțiune

Scrie natural, ca și cum spui o poveste unui prieten. Include pauze [PAUZĂ] și accent *unde e nevoie*.`;

    console.log("Generating hero journey script for:", contentType, "language:", language);

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

    console.log("Hero journey script generated successfully");

    return new Response(
      JSON.stringify({ script }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error generating hero journey script:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Failed to generate script" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
