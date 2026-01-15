import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Template-specific prompts
const TEMPLATE_PROMPTS: Record<string, { focus: string; structure: string }> = {
  'have-it-all': {
    focus: 'vizualizare completă a succesului în toate 4 arii',
    structure: `1. INTRODUCERE (1-2 min) - Relaxare și respirații profunde
2. VIZUALIZARE CORP (2 min) - Sănătate și energie
3. VIZUALIZARE SUFLET (2 min) - Pace interioară și claritate
4. VIZUALIZARE RELAȚII (2 min) - Conexiuni profunde
5. VIZUALIZARE BUSINESS (2 min) - Succes și abundență
6. INTEGRARE (2 min) - Afirmații puternice și ancorare`
  },
  'body-power': {
    focus: 'sănătate, forță fizică și vitalitate',
    structure: `1. INTRODUCERE (1 min) - Relaxare
2. CONȘTIENTIZARE CORPORALĂ (2 min) - Scanare a corpului
3. VIZUALIZARE CORP IDEAL (3 min) - Cum te vezi și te simți
4. ENERGIE ȘI VITALITATE (2 min) - Flux de energie
5. AFIRMAȚII CORP (2 min) - "Corpul meu este puternic..."`
  },
  'inner-peace': {
    focus: 'pace interioară, spiritualitate și conexiune cu sinele',
    structure: `1. RESPIRAȚIE CONȘTIENTĂ (2 min)
2. LINIȘTE INTERIOARĂ (3 min) - Spațiu de calm
3. CONEXIUNE SPIRITUALĂ (3 min) - Înălțime și expansiune
4. CLARITATE MENTALĂ (2 min) - Gânduri clare
5. ÎNTOARCERE ÎN PACE (2 min)`
  },
  'deep-relationships': {
    focus: 'relații profunde și împlinite cu cei dragi',
    structure: `1. DESCHIDERE INIMĂ (2 min) - Căldură și iubire
2. VIZUALIZARE FAMILIE (2 min) - Momente cu familia
3. VIZUALIZARE PRIETENI (2 min) - Conexiuni autentice
4. RECUNOȘTINȚĂ (2 min) - Apreciere pentru oameni
5. IUBIRE NECONDIȚONATĂ (2 min) - Afirmații despre relații`
  },
  'success-abundance': {
    focus: 'succes profesional, abundență și prosperitate',
    structure: `1. MINDSET DE SUCCES (2 min) - Convingeri despre succes
2. VIZUALIZARE CARIERĂ (3 min) - Te vezi la vârful carierei
3. ABUNDENȚĂ FINANCIARĂ (3 min) - Prosperitate și siguranță
4. IMPACT POZITIV (2 min) - Contribuția ta în lume
5. AFIRMAȚII BUSINESS (2 min) - "Eu merit succesul..."`
  },
  'daily-focus': {
    focus: 'claritate mentală și focus pentru sarcinile zilei',
    structure: `1. CENTRARE (1 min) - Respirație și prezență
2. CLARIFICARE INTENȚIE (2 min) - Prioritatea #1 de azi
3. VIZUALIZARE TASK-URI (2 min) - Te vezi completând sarcinile
4. STARE DE FLOW (2 min) - Concentrare perfectă
5. ANCORARE FOCUS (1 min) - Afirmații despre productivitate`
  },
  'morning-energy': {
    focus: 'energie și entuziasm pentru începutul zilei',
    structure: `1. TREZIRE CONȘTIENTĂ (1 min) - Recunoștință pentru o nouă zi
2. ENERGIE CORPORALĂ (2 min) - Vitalitate în corp
3. MINDSET POZITIV (2 min) - Gânduri optimiste
4. VIZUALIZARE ZIUA PERFECTĂ (2 min) - Cum arată ziua ta
5. AFIRMAȚII MATINALE (1 min) - "Astăzi este o zi minunată..."`
  },
  'deep-work': {
    focus: 'pregătire pentru sesiuni de lucru concentrat și productiv',
    structure: `1. ELIMINARE DISTRAGERI (1 min) - Liniștire mentală
2. CONECTARE CU SCOPUL (2 min) - De ce faci ce faci
3. STARE DE FLOW (3 min) - Concentrare profundă
4. VIZUALIZARE REZULTAT (2 min) - Munca completată
5. ANCORARE PRODUCTIVITATE (2 min)`
  },
  'deep-relaxation': {
    focus: 'relaxare profundă și eliberare completă a tensiunii',
    structure: `1. RESPIRAȚIE LENTĂ (2 min)
2. SCANARE CORPORALĂ (3 min) - Relaxare progresivă
3. ELIBERARE TENSIUNE (3 min) - Lasă să plece stresul
4. SPAȚIU DE CALM (4 min) - Loc sigur interior
5. REVENIRE LENTĂ (3 min)`
  },
  'peaceful-sleep': {
    focus: 'pregătire pentru un somn odihnitor și regenerator',
    structure: `1. TRANZIȚIE SEARĂ (2 min) - Închiderea zilei
2. RELAXARE PROGRESIVĂ (4 min) - Fiecare parte a corpului
3. ELIBERARE GÂNDURI (3 min) - Lasă gândurile să plece
4. LOC DE VIS (3 min) - Imagine liniștitoare
5. ADORMIRE LINĂ - Voce din ce în ce mai lentă`
  },
  'breath-calm': {
    focus: 'tehnici de respirație pentru calm și reducerea anxietății',
    structure: `1. CONȘTIENTIZARE RESPIRAȚIE (1 min)
2. RESPIRAȚIE 4-7-8 (3 min) - Ghidare pas cu pas
3. RESPIRAȚIE LINIȘTITOARE (2 min)
4. CALM INTERIOR (2 min) - Stare de pace`
  },
  'gratitude': {
    focus: 'cultivarea recunoștinței și aprecierii pentru viață',
    structure: `1. DESCHIDERE INIMĂ (2 min)
2. RECUNOȘTINȚĂ CORP (2 min) - Mulțumire pentru sănătate
3. RECUNOȘTINȚĂ OAMENI (2 min) - Apreciere pentru relații
4. RECUNOȘTINȚĂ REALIZĂRI (2 min) - Ce ai accomplisit
5. STARE DE ABUNDENȚĂ (2 min)`
  },
  'affirmations': {
    focus: 'afirmații puternice pentru reprogramarea convingerilor',
    structure: `1. PREGĂTIRE MENTALĂ (1 min)
2. AFIRMAȚII EU SUNT (3 min) - Identitate puternică
3. AFIRMAȚII EU MERIT (2 min) - Despre merit
4. AFIRMAȚII EU CREEZ (2 min) - Putere creatoare
5. ANCORARE (2 min) - Integrare afirmații`
  },
  'evening-reflection': {
    focus: 'reflecție de seară și încheiere pozitivă a zilei',
    structure: `1. TRANZIȚIE (1 min) - Oprire din ritmul zilei
2. CE AM FĂCUT BINE (2 min) - Celebrare realizări
3. CE AM ÎNVĂȚAT (2 min) - Lecții din ziua de azi
4. RECUNOȘTINȚĂ (2 min) - 3 lucruri pentru care ești recunoscător
5. PREGĂTIRE PENTRU MÂINE (1 min) - Intenție pozitivă`
  }
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Authentication check
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: authHeader } } }
    );
    const { data: { user }, error: authError } = await supabaseClient.auth.getUser();

    if (authError || !user) {
      return new Response(JSON.stringify({ error: 'Invalid token' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const { objectives, language = 'ro', templateId, templateContext } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    // Build objectives text
    const bodyObj = objectives?.body || '';
    const beingObj = objectives?.being || '';
    const balanceObj = objectives?.balance || '';
    const businessObj = objectives?.business || '';

    const systemPrompt = `Ești un ghid de meditație expert, cu o voce calmă și plină de compasiune. 
Creezi meditații personalizate bazate pe obiectivele și contextul utilizatorului.
Tonul tău este: calm, încurajator, prezent, folosind persoana a doua (tu).
NU include instrucțiuni de tipul "[pauză]" sau "[respiră]" în text - scrie doar ce se va auzi.
Scrie DOAR textul meditației, nimic altceva.`;

    let userPrompt: string;
    
    // Check if we're using a template
    if (templateId && TEMPLATE_PROMPTS[templateId]) {
      const template = TEMPLATE_PROMPTS[templateId];
      
      userPrompt = `Creează o meditație ghidată cu focus pe: ${template.focus}

${templateContext ? `CONTEXT PERSONALIZAT AL UTILIZATORULUI:
${templateContext}

` : ''}Structura meditației:
${template.structure}

Scrie meditația ca un text continuu, fluent, de aproximativ 8-12 minute, gata de citit cu voce tare.
Personalizează meditația folosind contextul și obiectivele furnizate.
Folosește un limbaj cald, încurajator și empowering.`;

    } else {
      // Default empowerment meditation (original behavior)
      userPrompt = `Creează o meditație ghidată de vizualizare și empowerment de aproximativ 8-10 minute bazată pe aceste obiective anuale:

CORP (Sănătate & Fitness): ${bodyObj || 'Nu este setat'}
SPIRITUALITATE (Creștere Personală): ${beingObj || 'Nu este setat'}
RELAȚII (Familie & Prieteni): ${balanceObj || 'Nu este setat'}
BUSINESS (Carieră & Finanțe): ${businessObj || 'Nu este setat'}

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

Scrie meditația ca un text continuu, fluent, gata de citit cu voce tare.`;
    }

    console.log('Generating meditation...', { templateId, hasContext: !!templateContext });

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
