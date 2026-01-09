import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { objectives, language = 'ro' } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    // Build objectives text
    const bodyObj = objectives.body || 'Nu este setat';
    const beingObj = objectives.being || 'Nu este setat';
    const balanceObj = objectives.balance || 'Nu este setat';
    const businessObj = objectives.business || 'Nu este setat';

    const systemPrompt = language === 'ro' 
      ? `Ești un ghid de meditație expert, cu o voce calmă și plină de compasiune. 
Creezi meditații de empowerment personalizate bazate pe obiectivele utilizatorului.
Tonul tău este: calm, încurajator, prezent, folosind persoana a doua (tu).
NU include instrucțiuni de tipul "[pauză]" sau "[respiră]" în text - scrie doar ce se va auzi.
Scrie DOAR textul meditației, nimic altceva.`
      : `You are an expert meditation guide with a calm, compassionate voice.
You create personalized empowerment meditations based on user objectives.
Your tone is: calm, encouraging, present, using second person (you).
Do NOT include instructions like "[pause]" or "[breathe]" - write only what will be spoken.
Write ONLY the meditation text, nothing else.`;

    const userPrompt = language === 'ro'
      ? `Creează o meditație ghidată de vizualizare și empowerment de aproximativ 8-10 minute bazată pe aceste obiective anuale:

CORP (Sănătate & Fitness): ${bodyObj}
SPIRITUALITATE (Creștere Personală): ${beingObj}
RELAȚII (Familie & Prieteni): ${balanceObj}
BUSINESS (Carieră & Finanțe): ${businessObj}

Structura meditației:

1. INTRODUCERE (1-2 min)
- Salut călduros
- Ghidare către relaxare
- 3 respirații profunde descrise fluid

2. VIZUALIZARE CORP (2 min)
- Descrie cum te simți când ai atins obiectivul de sănătate
- Imagini senzoriale: ce vezi, ce simți, ce auzi
- Emoții de bucurie și putere

3. VIZUALIZARE SPIRITUALITATE (2 min)
- Te vezi ca persoana care și-a atins obiectivul spiritual
- Liniștea interioară, claritatea mentală
- Conectare cu sinele superior

4. VIZUALIZARE RELAȚII (2 min)
- Imagine vie a relațiilor împlinite
- Momente de conexiune și iubire
- Recunoștință pentru oamenii din viață

5. VIZUALIZARE BUSINESS (2 min)
- Succesul profesional realizat
- Impactul pozitiv pe care îl ai
- Abundență și siguranță financiară

6. INTEGRARE ȘI AFIRMAȚII (1-2 min)
- 5-7 afirmații puternice care încep cu "Eu sunt...", "Eu merit...", "Eu creez..."
- Ancorare a stării de empowerment
- Întoarcere lentă în prezent

Scrie meditația ca un text continuu, fluent, gata de citit cu voce tare.`
      : `Create a guided visualization and empowerment meditation of about 8-10 minutes based on these annual objectives:

BODY (Health & Fitness): ${bodyObj}
SPIRITUALITY (Personal Growth): ${beingObj}
RELATIONSHIPS (Family & Friends): ${balanceObj}
BUSINESS (Career & Finances): ${businessObj}

Meditation structure:

1. INTRODUCTION (1-2 min)
- Warm greeting
- Guidance to relaxation
- 3 deep breaths described fluidly

2. BODY VISUALIZATION (2 min)
- Describe how you feel when you've achieved your health goal
- Sensory imagery: what you see, feel, hear
- Emotions of joy and power

3. SPIRITUALITY VISUALIZATION (2 min)
- See yourself as the person who achieved their spiritual goal
- Inner peace, mental clarity
- Connection with higher self

4. RELATIONSHIPS VISUALIZATION (2 min)
- Vivid image of fulfilled relationships
- Moments of connection and love
- Gratitude for people in your life

5. BUSINESS VISUALIZATION (2 min)
- Professional success achieved
- Positive impact you have
- Abundance and financial security

6. INTEGRATION AND AFFIRMATIONS (1-2 min)
- 5-7 powerful affirmations starting with "I am...", "I deserve...", "I create..."
- Anchoring the empowerment state
- Slow return to present

Write the meditation as continuous, flowing text, ready to be read aloud.`;

    console.log('Generating empowerment meditation...');

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
          { role: "user", content: userPrompt }
        ],
        max_tokens: 4000,
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limit exceeded. Please try again later." }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "Payment required. Please add credits." }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      throw new Error(`AI gateway error: ${response.status}`);
    }

    const data = await response.json();
    const meditationScript = data.choices?.[0]?.message?.content;

    if (!meditationScript) {
      throw new Error("No meditation script generated");
    }

    console.log('Meditation generated successfully, length:', meditationScript.length);

    return new Response(JSON.stringify({ 
      meditationScript,
      estimatedDuration: Math.round(meditationScript.split(' ').length / 120 * 60) // ~120 words per minute
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (error) {
    console.error('Error generating meditation:', error);
    return new Response(JSON.stringify({ 
      error: error instanceof Error ? error.message : 'Unknown error' 
    }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
