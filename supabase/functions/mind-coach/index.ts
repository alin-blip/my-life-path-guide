import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
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

    const { messages, emotion, intensity, phase } = await req.json();
    
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY is not configured');
    }

    // ========== FETCH USER CONTEXT FROM DATABASE ==========
    
    // 1. Fetch user's missions (annual, quarterly, monthly objectives)
    const { data: missions } = await supabaseClient
      .from('missions')
      .select('mission_type, category, title, period, project_name')
      .eq('user_id', user.id)
      .order('mission_type', { ascending: true });

    // 2. Fetch current weekly plan (Domino Door)
    const { data: weeklyPlan } = await supabaseClient
      .from('weekly_planning')
      .select('domino_title, key_points, week_key, category')
      .eq('user_id', user.id)
      .order('updated_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    // 3. Fetch today's breakthroughs to check if already transformed
    const today = new Date().toISOString().split('T')[0];
    const { data: todayBreakthroughs } = await supabaseClient
      .from('breakthrough_logs')
      .select('*')
      .eq('user_id', user.id)
      .gte('created_at', today)
      .order('created_at', { ascending: false })
      .limit(3);

    // Build user context string
    let userContext = '';
    
    if (missions && missions.length > 0) {
      userContext += '\n\n📌 OBIECTIVELE UTILIZATORULUI:\n';
      const annual = missions.filter(m => m.mission_type === 'annual');
      const quarterly = missions.filter(m => m.mission_type === 'quarterly');
      
      if (annual.length > 0) {
        userContext += '\n🎯 VIZIUNE 2026:\n';
        annual.forEach(m => {
          userContext += `- ${m.category?.toUpperCase()}: ${m.title}\n`;
        });
      }
      
      if (quarterly.length > 0) {
        userContext += '\n📊 90 ZILE:\n';
        quarterly.forEach(m => {
          userContext += `- ${m.category?.toUpperCase()}: ${m.title}\n`;
        });
      }
    }

    if (weeklyPlan && weeklyPlan.domino_title) {
      userContext += '\n\n🎲 FOCUS SĂPTĂMÂNAL:\n';
      userContext += `Obiectiv principal: ${weeklyPlan.domino_title}\n`;
    }

    if (todayBreakthroughs && todayBreakthroughs.length > 0) {
      userContext += '\n\n✨ TRANSFORMĂRI DE AZI:\n';
      todayBreakthroughs.forEach((b: any) => {
        userContext += `- ${b.emotion_before} → ${b.emotion_after || 'în progres'}\n`;
      });
    }

    // ========== TONY ROBBINS SYSTEM PROMPT ==========
    
    const emotionLabel = emotion || 'necunoscut';
    const intensityLevel = intensity || 5;
    const currentPhase = phase || 1;
    
    const systemPrompt = `Tu ești Mind Coach-ul personal al utilizatorului - un ghid care transformă emoțiile negative în putere și acțiune, antrenat în stilul Tony Robbins.

CONTEXTUL ACTUAL:
- Utilizatorul se simte: ${emotionLabel}
- Intensitatea: ${intensityLevel}/10
- Faza curentă: ${currentPhase}/5

STILUL TĂU (Tony Robbins):
- Validezi ÎNTÂI emoția - "Înțeleg perfect ce simți... ${emotionLabel} la intensitate ${intensityLevel} este real și valid"
- Nu judeci NICIODATĂ
- Ajuți să identifice FAPTELE vs POVEȘTILE pe care și le spune
- Ghidezi spre ce POATE controla
- Transformi "problema" în "oportunitate de creștere"
- La final, ajuți să aleagă o STARE de putere pentru zi

STRUCTURA CONVERSAȚIEI (max 10-12 schimburi):

1. IDENTIFICARE (Faza 1 - 1-2 schimburi)
   - "Cum te simți acum?" / "Ce nume dai acestei stări?"
   - Validează emoția cu empatie profundă
   
2. INVESTIGARE (Faza 2 - 2-3 schimburi)
   - "Ce s-a întâmplat?" / "Care e povestea din spatele emoției?"
   - Ascultă cu atenție, caută detalii specifice
   
3. CLARIFICARE (Faza 3 - 2-3 schimburi)
   - "E această poveste 100% adevărată?"
   - "Ce ai dori de fapt să se întâmple?"
   - Separă faptele de interpretări
   
4. TRANSFORMARE (Faza 4 - 2-3 schimburi)
   - "Ce poți controla în această situație?"
   - "Ce lecție primești din asta?"
   - Găsește oportunitatea în dificultate
   
5. ACȚIUNE (Faza 5 - 1-2 schimburi)
   - "Cu ce energie vrei să continui ziua?"
   - "Ce acțiune concretă faci ACUM?"
   - Când ai obținut un commitment, folosește tool-ul complete_transformation

REGULI IMPORTANTE:
- Răspunsuri SCURTE și la obiect (2-4 propoziții)
- Pune O SINGURĂ întrebare la un moment dat
- Celebrează fiecare progres făcut
- Folosește emoji-uri moderat pentru a crea căldură
- Când utilizatorul a găsit claritatea, întreabă: "Cu ce energie vrei să începi această zi?"
- La final, rezumă transformarea și felicită-l
- Întreabă dacă vrea să adauge acțiunea în HIT List (add_to_hit_list tool)
- Dacă utilizatorul menționează un obicei nou pe care vrea să-l înceapă, folosește add_habit tool

EXEMPLU DE START (doar pentru Faza 1):
"${emotionLabel} la ${intensityLevel}/10... 💭 Înțeleg, și apreciez că ești onest cu tine însuți.

Spune-mi, ce s-a întâmplat care te face să te simți așa?"

PROGRESIE PRIN FAZE:
- Urmează faza indicată în context
- Nu sări peste faze
- Adaptează-te la ritmul utilizatorului
- Dacă utilizatorul este pregătit să avanseze, mergi la următoarea fază

${userContext}

Răspunde ÎNTOTDEAUNA în română.`;

    // ========== TOOL DEFINITIONS ==========
    
    const tools = [
      {
        type: "function",
        function: {
          name: "add_to_hit_list",
          description: "Adaugă o acțiune în HIT List-ul utilizatorului pentru azi. Folosește când utilizatorul s-a angajat la o acțiune concretă.",
          parameters: {
            type: "object",
            properties: {
              task: { type: "string", description: "Acțiunea de adăugat" },
              priority: { type: "string", enum: ["urgent", "important", "normal"], description: "Prioritatea task-ului" }
            },
            required: ["task"]
          }
        }
      },
      {
        type: "function",
        function: {
          name: "add_habit",
          description: "Sugerează adăugarea unui nou obicei zilnic. Folosește când utilizatorul menționează că vrea să înceapă un obicei nou.",
          parameters: {
            type: "object",
            properties: {
              name: { type: "string", description: "Numele obiceiului" },
              category: { type: "string", enum: ["body", "being", "balance", "business"], description: "Categoria obiceiului" }
            },
            required: ["name", "category"]
          }
        }
      },
      {
        type: "function",
        function: {
          name: "complete_transformation",
          description: "Marchează sesiunea de transformare ca fiind completă. Folosește când utilizatorul a ajuns la o stare de putere și s-a angajat la o acțiune.",
          parameters: {
            type: "object",
            properties: {
              emotion_before: { type: "string", description: "Emoția inițială" },
              emotion_after: { type: "string", description: "Emoția/starea de putere finală" },
              breakthrough_insight: { type: "string", description: "Insight-ul principal al transformării" },
              action_committed: { type: "string", description: "Acțiunea la care s-a angajat" }
            },
            required: ["emotion_before", "emotion_after"]
          }
        }
      }
    ];

    // ========== CALL AI GATEWAY ==========
    
    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-pro',
        messages: [
          { role: 'system', content: systemPrompt },
          ...messages,
        ],
        tools: tools,
        stream: true,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: 'Rate limit exceeded. Please try again later.' }), {
          status: 429,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: 'Payment required. Please add credits.' }), {
          status: 402,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      const errorText = await response.text();
      console.error('AI gateway error:', response.status, errorText);
      throw new Error(`AI gateway error: ${response.status}`);
    }

    // Return streaming response
    return new Response(response.body, {
      headers: { ...corsHeaders, 'Content-Type': 'text/event-stream' },
    });

  } catch (error) {
    console.error('Mind Coach error:', error);
    return new Response(JSON.stringify({ 
      error: error instanceof Error ? error.message : 'Unknown error' 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
