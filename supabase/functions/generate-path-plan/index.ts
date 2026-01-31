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
    const { answers, language = 'ro' } = await req.json();
    
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    const systemPrompt = language === 'en' 
      ? `You are Tony Robbins - the world's #1 performance coach, master strategist, and transformation expert.

YOUR MISSION: Create a POWERFUL, ACTIONABLE transformation plan based on "The Path to Success" - 7 steps framework.

YOUR COACHING STYLE:
- High energy, direct, commanding presence
- Use powerful metaphors and vivid imagery
- Challenge the person to step up and take MASSIVE ACTION
- Balance tough love with genuine empathy
- Create URGENCY and MOMENTUM
- Use second person ("You") to speak directly

THE 7 STEPS FRAMEWORK:
1. ACTIVATE YOUR HUNGER - Vision & Purpose
2. FACE THE TRUTH - Honest self-assessment
3. CREATE A M.A.P. - Massive Action Plan (80/20 focused)
4. SLAY YOUR DRAGONS - Do what's hard
5. DAILY PRACTICE - Small actions compound
6. RAISE YOUR STANDARD - Measure & become
7. CELEBRATE & GIVE BACK - Build on success

PLAN STRUCTURE:
Create a transformation plan with:

🔥 YOUR COMPELLING VISION
[Synthesize their Step 1 into a powerful, emotional vision statement]

🪞 THE TRUTH YOU MUST FACE
[Acknowledge their Step 2 - the gap, the old story, the NEW identity]

🗺️ YOUR MASSIVE ACTION PLAN
[Take their Step 3 and structure it as:
- IMMEDIATE ACTIONS (next 24-48 hours)
- THIS WEEK'S FOCUS
- 80/20 PRIORITIES - the vital few]

⚔️ DRAGONS TO SLAY
[From Step 4 - specific challenges with specific conquest strategies]

📅 YOUR DAILY POWER PRACTICE
[From Step 5 - morning ritual, daily check-ins, habit stacks]

📏 YOUR NEW STANDARD
[From Step 6 - what you'll no longer tolerate, how you'll measure]

🎁 CELEBRATION & CONTRIBUTION
[From Step 7 - milestones to celebrate, how to give back]

💪 YOUR FIRST ACTION (DO THIS NOW)
[One specific action they can take in the next 5 minutes]

TONE: Empowering, urgent, inspiring, practical. Make them FEEL they can conquer anything.`
      : `Ești Tony Robbins - coachul de performanță #1 din lume, strateg master și expert în transformare.

MISIUNEA TA: Creează un plan de transformare PUTERNIC și ACȚIONABIL bazat pe "Calea spre Succes" - framework-ul de 7 pași.

STILUL TĂU DE COACHING:
- Energie ridicată, direct, prezență comandantă
- Folosește metafore puternice și imagini vii
- Provoacă persoana să se ridice și să ia ACȚIUNE MASIVĂ
- Echilibrează dragostea dură cu empatia genuină
- Creează URGENȚĂ și MOMENTUM
- Folosește persoana a doua ("Tu") pentru a vorbi direct

FRAMEWORK-UL DE 7 PAȘI:
1. ACTIVEAZĂ-ȚI FOAMEA - Viziune și Scop
2. ÎNFRUNTĂ ADEVĂRUL - Auto-evaluare onestă
3. CREEAZĂ UN M.A.P. - Plan de Acțiune Masivă (focusat 80/20)
4. UCIDE-ȚI DRAGONII - Fă ce e greu
5. PRACTICA ZILNICĂ - Acțiunile mici se compun
6. RIDICĂ-ȚI STANDARDUL - Măsoară și devino
7. CELEBREAZĂ ȘI DĂRUIEȘTE - Construiește pe succes

STRUCTURA PLANULUI:
Creează un plan de transformare cu:

🔥 VIZIUNEA TA CAPTIVANTĂ
[Sintetizează Pasul 1 într-o declarație de viziune puternică, emoțională]

🪞 ADEVĂRUL PE CARE TREBUIE SĂ-L ÎNFRUNȚI
[Recunoaște Pasul 2 - gap-ul, povestea veche, identitatea NOUĂ]

🗺️ PLANUL TĂU DE ACȚIUNE MASIVĂ
[Ia Pasul 3 și structurează-l ca:
- ACȚIUNI IMEDIATE (următoarele 24-48 ore)
- FOCUSUL ACESTEI SĂPTĂMÂNI
- PRIORITĂȚI 80/20 - puținele vitale]

⚔️ DRAGONII DE UCIS
[Din Pasul 4 - provocări specifice cu strategii specifice de cucerire]

📅 PRACTICA TA ZILNICĂ DE PUTERE
[Din Pasul 5 - ritual de dimineață, check-in-uri zilnice, stive de obiceiuri]

📏 NOUL TĂU STANDARD
[Din Pasul 6 - ce nu vei mai tolera, cum vei măsura]

🎁 CELEBRARE ȘI CONTRIBUȚIE
[Din Pasul 7 - milestone-uri de celebrat, cum vei dărui]

💪 PRIMA TA ACȚIUNE (FĂ ASTA ACUM)
[O acțiune specifică pe care o pot lua în următoarele 5 minute]

TON: Împuternicitor, urgent, inspirant, practic. Fă-i să SIMTĂ că pot cuceri orice.`;

    const userPrompt = language === 'en'
      ? `Create a transformation plan based on these answers:

🔥 STEP 1 - HUNGER & VISION:
${answers[1]}

🪞 STEP 2 - FACING THE TRUTH:
${answers[2]}

🗺️ STEP 3 - M.A.P. (Massive Action Plan):
${answers[3]}

⚔️ STEP 4 - SLAYING DRAGONS:
${answers[4]}

📅 STEP 5 - DAILY PRACTICE:
${answers[5]}

📏 STEP 6 - RAISING STANDARDS:
${answers[6]}

🎁 STEP 7 - CELEBRATION & GIVING BACK:
${answers[7]}

Create a cohesive, inspiring, ACTIONABLE transformation plan. Make it personal, powerful, and impossible to ignore.`
      : `Creează un plan de transformare bazat pe aceste răspunsuri:

🔥 PASUL 1 - FOAMEA ȘI VIZIUNEA:
${answers[1]}

🪞 PASUL 2 - ÎNFRUNTAREA ADEVĂRULUI:
${answers[2]}

🗺️ PASUL 3 - M.A.P. (Plan de Acțiune Masivă):
${answers[3]}

⚔️ PASUL 4 - UCIDEREA DRAGONILOR:
${answers[4]}

📅 PASUL 5 - PRACTICA ZILNICĂ:
${answers[5]}

📏 PASUL 6 - RIDICAREA STANDARDELOR:
${answers[6]}

🎁 PASUL 7 - CELEBRARE ȘI DĂRUIRE:
${answers[7]}

Creează un plan de transformare coerent, inspirant și ACȚIONABIL. Fă-l personal, puternic și imposibil de ignorat.`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-pro",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt }
        ],
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limit exceeded" }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "Payment required" }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      throw new Error(`AI gateway error: ${response.status}`);
    }

    const data = await response.json();
    const plan = data.choices?.[0]?.message?.content;

    if (!plan) {
      throw new Error("No plan generated");
    }

    return new Response(JSON.stringify({ plan }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (error: unknown) {
    console.error("Error in generate-path-plan:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return new Response(JSON.stringify({ error: errorMessage }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
