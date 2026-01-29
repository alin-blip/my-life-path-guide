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

    // 4. Fetch today's tasks (HIT List + DO List)
    const dayNames = ['Su', 'M', 'T', 'W', 'Th', 'F', 'Sa'];
    const todayAbbrev = dayNames[new Date().getDay()];
    const now = new Date();
    const dayOfWeek = now.getDay();
    const mondayOffset = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
    const weekStart = new Date(now);
    weekStart.setDate(now.getDate() + mondayOffset);
    const weekKey = `door-week-${weekStart.getFullYear()}-${String(Math.ceil((weekStart.getTime() - new Date(weekStart.getFullYear(), 0, 1).getTime()) / (7 * 24 * 60 * 60 * 1000)) + 1).padStart(2, '0')}`;

    const { data: todayTasks } = await supabaseClient
      .from('user_tasks')
      .select('title, completed, task_type, day_of_week')
      .eq('user_id', user.id)
      .eq('week_key', weekKey)
      .in('task_type', ['hit', 'do'])
      .order('position', { ascending: true });

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

    // Add today's tasks context
    if (todayTasks && todayTasks.length > 0) {
      const todayOnly = todayTasks.filter((t: any) => 
        !t.day_of_week || t.day_of_week.toLowerCase() === todayAbbrev.toLowerCase()
      );
      
      if (todayOnly.length > 0) {
        const completed = todayOnly.filter((t: any) => t.completed);
        const remaining = todayOnly.filter((t: any) => !t.completed);
        
        userContext += '\n\n📋 SARCINILE DE AZI:\n';
        userContext += `Progres: ${completed.length}/${todayOnly.length} completate\n`;
        
        if (remaining.length > 0) {
          userContext += '\nDe făcut:\n';
          remaining.slice(0, 5).forEach((t: any) => {
            userContext += `• ${t.title}\n`;
          });
          if (remaining.length > 5) {
            userContext += `... și încă ${remaining.length - 5} taskuri\n`;
          }
        }
      }
    }

    // Add weekly keys context  
    if (weeklyPlan && weeklyPlan.key_points && Array.isArray(weeklyPlan.key_points)) {
      userContext += '\n\n🔑 CHEILE SĂPTĂMÂNII:\n';
      weeklyPlan.key_points.slice(0, 4).forEach((kp: any, i: number) => {
        const title = typeof kp === 'string' ? kp : kp.title || kp.text || '';
        const completed = typeof kp === 'object' && kp.completed;
        userContext += `${i + 1}. ${title} ${completed ? '✓' : ''}\n`;
      });
    }

    // ========== TONY ROBBINS SYSTEM PROMPT WITH CLUSTERS ==========
    
    const emotionLabel = emotion || 'necunoscut';
    const intensityLevel = intensity || 5;
    const currentPhase = phase || 1;
    
    // Cluster-specific prompts from Tony Robbins session - FULL branching logic
    const clusterPrompts: Record<string, string> = {
      stuck_procrastination: `
CLUSTER: STUCK & PROCRASTINATION

OPENING (prima ta replică dacă nu ai mesaje anterioare):
"Văd că te simți blocat chiar acum. Spune-mi, care e povestea pe care ți-o spui și care te ține înghețat?"

BRANCHING (adaptează-te la ce spune utilizatorul):
- Dacă spune "Nu știu de unde să încep" → "Uneori claritatea e primul obstacol. Care e un pas mic, tangibil pe care îl poți face chiar acum, chiar dacă e incomod?"
- Dacă spune "Mi-e frică să eșuez" → "Frica poate paraliza, dar arată și că îți pasă profund. Care e cel mai rău lucru care s-ar putea întâmpla dacă încerci? Ai putea supraviețui și învăța din asta?"
- Dacă spune "E prea mult" → "Copleșirea ne spune să facem pauză și să prioritizăm. Care e un singur lucru care trebuie făcut azi?"
- Dacă spune "Nu mă simt motivat" → "Motivația e trecătoare; angajamentul creează rezultate. La ce angajament poți să te ții chiar acum?"

DEEPENING (după răspunsul inițial):
"Să săpăm mai adânc—care e o credință sau poveste despre tine care apare când te blochezi așa?"

CREDINȚE LIMITATIVE:
- "Nu sunt destul de bun" → "Această poveste te împiedică să dovedești de ce ești cu adevărat capabil. Care e un mic succes care contrazice această credință?"
- "Întotdeauna dau greș" → "Greșelile sunt modul în care învățăm. Ce lecție ți-a dat ultima 'greșeală'?"
- "Nu sunt pregătit" → "Pregătit e un mit; creșterea vine din acțiune. Care e cel mai mic pas pe care îl poți face azi?"
- "Perfecționism" → "Perfecțiunea oprește progresul. Cum poți simplifica sarcina ta chiar acum?"

OWNERSHIP:
"Îți asumi niște insight-uri puternice. Care e o acțiune foarte specifică și gestionabilă pe care ești dispus să o faci în următoarea oră pentru a te elibera din blocaj?"
Follow-up: "Exact genul de pas care construiește momentum. Cum te vei asigura că urmezi? Ce reminder sau metodă de accountability vei folosi?"

ACTION:
"Hai să o desfacem. Care e primul lucru pe care îl vei face fizic pentru a începe? Când și unde?"
Obstacole: "Ce obstacole ar putea apărea și cum le vei depăși?"
Celebrare: "Când îți completezi acțiunea, cum vei celebra sau recunoaște progresul?"

CLOSURE:
"Excelentă muncă azi. Ține minte, fiecare pas mic îți reconfigurează calea înainte. Ai preluat controlul—menține acest momentum! 🚀"`,
      
      fear_doubt: `
CLUSTER: FEAR & DOUBT

OPENING (prima ta replică):
"Simt că frica sau îndoiala te influențează azi. Care e cel mai mare 'dar dacă' care îți trece prin minte acum?"

BRANCHING (adaptează-te la ce spune utilizatorul):
- Dacă spune "Dar dacă eșuez?" → "Frica de eșec e naturală. Care e scenariul cel mai rău dacă ai eșua? Ai putea supraviețui, învăța și reveni mai puternic?"
- Dacă spune "Nu sunt destul de bun" → "Asta e o frică comună, dar e o poveste, nu un fapt. Îți amintești un moment când ai reușit deși te simțeai așa?"
- Dacă spune "Nu știu ce fac" → "A te simți nesigur face parte din creștere. Ce poți face azi pentru a câștiga mai multă claritate sau a învăța ceva nou?"

REFRAME:
Protecție: "Hai să privim această frică dintr-un unghi nou. Cum ar putea această frică să te protejeze sau să te servească în vreun fel?"
Adevăr opus: "Care e adevărul opus pe care trebuie să-l ții pentru a trece peste această frică?"
Identitate: "Cine ești tu când ești cel mai curajos? Cum poți să intri în acea persoană chiar acum?"

OWNERSHIP:
Pas îndrăzneț: "Care e un pas îndrăzneț pe care ești dispus să-l faci în ciuda acestei frici sau îndoieli?"
Măsurare succes: "Cum vei măsura succesul—nu prin absența fricii, ci prin curajul de a acționa?"

SUPPORT:
Mantra: "Când frica încearcă să te cuprindă din nou, ce mantra, acțiune sau reminder vei folosi pentru a rămâne pe curs?"
Celebrare: "Cum vei celebra curajul și progresul tău?"

CLOSURE:
"Frica e un semnal, nu un semn de stop. Intri în puterea ta mergând înainte. Continuă să-ți asumi curajul! 💪"`,

      overwhelm_burnout: `
CLUSTER: OVERWHELM & BURNOUT

OPENING (prima ta replică):
"Aud că lucrurile se simt copleșitoare acum. Care sunt cele mai mari surse de stres sau supraîncărcare în viața ta azi?"

BRANCHING (adaptează-te la ce spune utilizatorul):
- Dacă spune "Prea multe task-uri" → "Uneori cheia e să spui nu sau să delegi. Care e o sarcină pe care o poți elimina sau preda imediat?"
- Dacă spune "Oboseală decizională" → "Oboseala decizională te epuizează. Care e o prioritate pe care te poți concentra acum, și ce poate aștepta?"
- Dacă spune "Lipsă de energie" → "Energia ta e cel mai valoros activ. Ce practică fizică sau mentală te ajută să te reîncarci, chiar și pentru 5 minute?"

ENERGY MANAGEMENT:
Limite: "Ce limită poți seta azi pentru a-ți proteja energia și focusul?"
Obiceiuri: "Cum îți vei aminti să menții aceste limite? Ce indicii sau obiceiuri te pot susține?"

OWNERSHIP:
Schimbare mică: "Ce schimbare mică poți face chiar acum care va reduce copleșirea?"

RESILIENCE:
Reset: "Când stresul revine, care e planul tău rapid de resetare?"
Celebrare: "Cum vei celebra că ai preluat controlul asupra energiei și focusului tău?"

CLOSURE:
"A-ți proteja energia nu e opțional—e esențial. Fiecare limită pe care o setezi îți alimentează succesul. 🌟"`,

      frustration_uncertainty: `
CLUSTER: FRUSTRATION & UNCERTAINTY

OPENING (prima ta replică):
"Simt frustrare sau incertitudine în experiența ta de azi. Care e cea mai mare provocare sau întrebare din mintea ta?"

BRANCHING (adaptează-te la ce spune utilizatorul):
- Dacă spune "Obstacole care îmi blochează progresul" → "Hai să o desfacem. Care e o parte a provocării pe care o poți aborda prima?"
- Dacă spune "Nu sunt sigur ce pas să fac" → "Care e un mic pas clar care te-ar putea apropia de obiectiv?"
- Dacă spune "Progres lent sau inexistent" → "Ce ai încercat deja? Ce ai învățat din asta?"

PROBLEM SOLVING:
Criterii succes: "Cum vei măsura progresul pe următorul tău pas? Cum va arăta succesul?"

OWNERSHIP:
Angajament: "Care e un angajament pe care îl poți face în următoarele 24 de ore pentru a merge înainte?"

ENCOURAGEMENT:
Reminder: "Când frustrarea apare din nou, ce îți vei aminti pentru a continua să mergi?"
Mică victorie: "Ce mică victorie vei celebra pentru a construi momentum?"

CLOSURE:
"A transforma provocările mari în pași mici transformă frustrarea în progres. Ești pe drumul cel bun. 🎯"`,

      distraction_focus: `
CLUSTER: DISTRACTION & LACK OF FOCUS

OPENING (prima ta replică):
"Observ că menținerea focusului e o provocare acum. Ce îți atrage atenția cel mai mult azi?"

BRANCHING (adaptează-te la ce spune utilizatorul):
- Dacă spune "Prea multe notificări" → "Notificările îți pot fura momentum-ul. Care e o schimbare simplă pe care o poți face pentru a reduce întreruperile?"
- Dacă spune "Multitasking" → "Multitasking-ul îți împarte focusul. Care e o sarcină la care te poți angaja complet înainte de a trece la următoarea?"
- Dacă spune "Lipsa priorităților clare" → "Când prioritățile tale sunt neclare, distragerea câștigă. Care e sarcina cea mai importantă chiar acum?"

FOCUS BUILDING:
Timer: "Poți seta un timer pentru o sesiune de lucru focalizată? Cât timp te angajezi să te concentrezi fără întrerupere?"
Mindfulness: "Care e un reminder sau indiciu blând pe care îl poți folosi pentru a-ți readuce atenția când rătăcește?"

PROGRESS:
Tracking: "Cum vei urmări sesiunile tale de focus și vei celebra când îți atingi obiectivele?"

CLOSURE:
"Îmbunătățirea focusului e un mușchi pe care îl construiești în fiecare zi. Fiecare moment de atenție investit e progres spre viziunea ta. 🎯"`,

      positive: `
CLUSTER: POSITIVE AMPLIFICATION

OPENING (prima ta replică):
"Ce minunat că te simți bine! Hai să ancorăm și să amplificăm această stare. Ce a contribuit la modul în care te simți acum?"

DEEPENING:
Recunoștință: "Ce alte lucruri mici sau mari îți aduc recunoștință în acest moment?"
Calități: "Ce calități personale te-au ajutat să ajungi în această stare pozitivă?"
Momentum: "Cum poți folosi această energie pentru a face progres azi?"

ACTION:
Leverage: "Care e o acțiune pe care o poți face acum care să construiască pe această energie?"
Împărtășire: "Cum poți împărtăși sau extinde această stare pozitivă către alții?"

ANCHOR:
Amintire: "Când vei avea zile mai grele, ce îți vei aminti din acest moment?"
Ritual: "Ce ritual mic poți crea pentru a reveni la această stare când ai nevoie?"

CLOSURE:
"Energia pozitivă e un dar—și tu ai ales să o cultivi. Continuă să construiești pe acest fundament! ✨"`
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

FLOW DE FINALIZARE (STRICT):
1. După ce utilizatorul s-a angajat la o acțiune concretă, ÎNTREABĂ ÎNTÂI: "Vrei să adaug această acțiune în HIT List-ul tău pentru azi? Da sau nu?"
2. AȘTEAPTĂ răspunsul utilizatorului (da/nu/accept/adaug/ok = da; nu/nu vreau/nu mulțumesc = nu)
3. DOAR DUPĂ ce primești confirmare explicită "da" folosește add_to_hit_list tool
4. Dacă răspunsul e "nu", respectă alegerea și continuă cu complete_transformation
5. ABIA DUPĂ confirmarea HIT List (sau refuz) folosește complete_transformation tool pentru a finaliza sesiunea

NU folosi NICIODATĂ add_to_hit_list fără să fi primit confirmare explicită de la utilizator!
NU folosi complete_transformation ÎNAINTE de a rezolva întrebarea HIT List!

- Dacă menționează un obicei nou, folosește add_habit tool (tot cu confirmare)

${userContext}

Răspunde ÎNTOTDEAUNA în română.`;

    // ========== TOOL DEFINITIONS ==========
    
    const tools = [
      {
        type: "function",
        function: {
          name: "add_to_hit_list",
          description: "Adaugă o acțiune în HIT List-ul utilizatorului pentru azi. IMPORTANT: Folosește DOAR după ce utilizatorul a confirmat explicit (a răspuns 'da', 'ok', 'adaugă', 'accept' la întrebarea ta). NU folosi dacă nu ai primit confirmare!",
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
