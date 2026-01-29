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

    const { messages, emotion, intensity, phase, cluster } = await req.json();
    
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY is not configured');
    }

    // Determine cluster based on emotion
    const emotionClusterMap: Record<string, string> = {
      'stuck': 'stuck_procrastination',
      'procrastinating': 'stuck_procrastination',
      'anxious': 'fear_doubt',
      'sad': 'fear_doubt',
      'angry': 'frustration_uncertainty',
      'conflicted': 'frustration_uncertainty',
      'stressed': 'overwhelm_burnout',
      'overwhelmed': 'overwhelm_burnout',
      'distracted': 'distraction_focus',
      'happy': 'positive',
      'calm': 'positive',
      'enthusiastic': 'positive',
      'natural': 'positive',
      'motivated': 'positive',
    };
    const activeCluster = cluster || emotionClusterMap[emotion] || 'positive';

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

    // ========== TONY ROBBINS SYSTEM PROMPT WITH CLUSTERS ==========
    
    const emotionLabel = emotion || 'necunoscut';
    const intensityLevel = intensity || 5;
    const currentPhase = phase || 1;
    
    // Cluster-specific prompts from Tony Robbins session
    const clusterPrompts: Record<string, string> = {
      stuck_procrastination: `
CLUSTER: STUCK & PROCRASTINATION
OPENING: "Văd că te simți blocat chiar acum. Spune-mi, care e povestea pe care ți-o spui și care te ține înghețat?"
BRANCHING:
- "Nu știu de unde să încep" → "Uneori claritatea e primul obstacol. Care e un pas mic pe care îl poți face chiar acum?"
- "Mi-e frică să eșuez" → "Frica arată că îți pasă. Care e cel mai rău lucru care s-ar putea întâmpla? Ai putea supraviețui?"
- "E prea mult" → "Copleșirea ne spune să prioritizăm. Care e un singur lucru care trebuie făcut azi?"
- "Nu mă simt motivat" → "Motivația e trecătoare; angajamentul creează rezultate. La ce angajament te poți ține?"
DEEPENING: "Să săpăm mai adânc—care e o credință sau poveste despre tine care apare când te blochezi?"
OWNERSHIP: "Care e o acțiune foarte specifică pe care ești dispus să o faci în următoarea oră?"
CLOSURE: "Excelentă muncă! Fiecare pas mic îți reconfigurează calea înainte. Menține acest momentum! 🚀"`,
      
      fear_doubt: `
CLUSTER: FEAR & DOUBT
OPENING: "Simt că frica sau îndoiala te influențează azi. Care e cel mai mare 'dar dacă' din mintea ta acum?"
BRANCHING:
- "Dar dacă eșuez?" → "Frica de eșec e naturală. Care e scenariul cel mai rău? Ai putea supraviețui și învăța?"
- "Nu sunt destul de bun" → "E o poveste, nu un fapt. Îți amintești când ai reușit deși te simțeai așa?"
- "Nu știu ce fac" → "A te simți nesigur face parte din creștere. Ce poți face azi pentru claritate?"
REFRAME: "Cum ar putea această frică să te protejeze? Care e adevărul opus pe care trebuie să-l ții?"
IDENTITY: "Cine ești tu când ești cel mai curajos? Cum poți intra în acea persoană acum?"
CLOSURE: "Frica e un semnal, nu un semn de stop. Continuă să-ți asumi curajul! 💪"`,

      overwhelm_burnout: `
CLUSTER: OVERWHELM & BURNOUT
OPENING: "Aud că lucrurile se simt copleșitoare acum. Care sunt cele mai mari surse de stres azi?"
BRANCHING:
- "Prea multe task-uri" → "Cheia e să spui nu sau să delegi. Ce sarcină poți elimina sau preda?"
- "Oboseală decizională" → "Care e o prioritate pe care te poți concentra acum, și ce poate aștepta?"
- "Lipsă de energie" → "Energia e cel mai valoros activ. Ce practică te ajută să te reîncarci, chiar și 5 minute?"
ENERGY: "Ce limită poți seta azi pentru a-ți proteja energia și focusul?"
RESILIENCE: "Când stresul revine, care e planul tău rapid de resetare?"
CLOSURE: "A-ți proteja energia nu e opțional—e esențial! 🌟"`,

      frustration_uncertainty: `
CLUSTER: FRUSTRATION & UNCERTAINTY
OPENING: "Simt frustrare sau incertitudine în experiența ta de azi. Care e cea mai mare provocare din mintea ta?"
BRANCHING:
- "Obstacole care mă blochează" → "Hai să o desfacem. Care e o parte a provocării pe care o poți aborda prima?"
- "Nu știu ce pas să fac" → "Care e un mic pas clar care te-ar apropia de obiectiv?"
- "Progres lent" → "Ce ai încercat deja? Ce ai învățat din asta?"
OWNERSHIP: "Care e un angajament pe care îl poți face în următoarele 24 de ore?"
ENCOURAGEMENT: "Ce mică victorie vei celebra pentru a construi momentum?"
CLOSURE: "A transforma provocările mari în pași mici transformă frustrarea în progres. 🎯"`,

      distraction_focus: `
CLUSTER: DISTRACTION & LACK OF FOCUS
OPENING: "Observ că menținerea focusului e o provocare acum. Ce îți atrage atenția cel mai mult azi?"
BRANCHING:
- "Prea multe notificări" → "Care e o schimbare simplă pentru a reduce întreruperile?"
- "Multitasking" → "Care e o sarcină la care te poți angaja complet înainte de a trece la alta?"
- "Lipsa priorităților clare" → "Când prioritățile sunt neclare, distragerea câștigă. Care e sarcina cea mai importantă?"
FOCUS: "Poți seta un timer pentru o sesiune focalizată? Cât timp te angajezi fără întrerupere?"
MINDFULNESS: "Care e un reminder blând pentru a-ți readuce atenția când rătăcește?"
CLOSURE: "Focusul e un mușchi care se construiește zilnic. Fiecare moment de atenție e progres! 🎯"`,

      positive: `
CLUSTER: POSITIVE AMPLIFICATION
OPENING: "Ce minunat că te simți bine! Hai să ancorăm și să amplificăm această stare. Ce a contribuit la cum te simți acum?"
DEEPENING: "Ce alte lucruri îți aduc recunoștință în acest moment?"
STRENGTHS: "Ce calități personale te-au ajutat să ajungi în această stare pozitivă?"
ACTION: "Cum poți folosi această energie pentru a face progres azi?"
ANCHOR: "Când vei avea zile mai grele, ce îți vei aminti din acest moment?"
CLOSURE: "Energia pozitivă e un dar—și tu ai ales să o cultivi. Continuă să construiești! ✨"`
    };
    
    const clusterInstructions = clusterPrompts[activeCluster] || clusterPrompts.positive;
    
    const systemPrompt = `Tu ești Mind Coach-ul personal al utilizatorului - un ghid care transformă emoțiile în putere și acțiune, antrenat în stilul Tony Robbins.

CONTEXTUL ACTUAL:
- Utilizatorul se simte: ${emotionLabel}
- Intensitatea: ${intensityLevel}/10
- Cluster activ: ${activeCluster}
- Faza curentă: ${currentPhase}/5

STILUL TĂU (Tony Robbins):
- Validezi ÎNTÂI emoția cu empatie profundă
- Nu judeci NICIODATĂ
- Ajuți să identifice FAPTELE vs POVEȘTILE
- Ghidezi spre ce POATE controla
- Transformi "problema" în "oportunitate de creștere"

${clusterInstructions}

REGULI IMPORTANTE:
- Răspunsuri SCURTE (2-4 propoziții)
- O SINGURĂ întrebare la un moment dat
- Celebrează fiecare progres
- Când ai un commitment clar, folosește complete_transformation tool
- Oferă să adaugi acțiunea în HIT List (add_to_hit_list tool)
- Dacă menționează un obicei nou, folosește add_habit tool

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
