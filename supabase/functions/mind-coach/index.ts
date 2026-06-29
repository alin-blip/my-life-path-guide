import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { loadMinteContext } from "../_shared/mind-context.ts";

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

    const { messages, emotion, intensity, phase, cluster, imageDataUrl } = await req.json();
    
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

    // 5. Minte (Mind) context — foundation of the app.
    const minte = await loadMinteContext(supabaseClient, user.id);

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

    // ========== ULTIMATE YOU BREAKTHROUGH PROMPT (Tony Robbins frameworks) ==========
    
    const emotionLabel = emotion || 'necunoscut';
    const intensityLevel = intensity || 5;
    const currentPhase = phase || 1;
    
    // Cluster-specific 3 Decisions diagnostic (Focus / Meaning / Action)
    const clusterDiagnostic: Record<string, string> = {
      stuck_procrastination: 'Pe CE te focalizezi când te gândești la asta? Pe ce poți pierde sau pe ce poți câștiga?',
      fear_doubt: 'Ce SENS dai situației? Ce crezi că spune despre tine dacă nu reușești?',
      overwhelm_burnout: 'Pe CE îți pui focusul acum — pe tot ce trebuie făcut sau pe ce contează cu adevărat?',
      frustration_uncertainty: 'Ce SENS îi dai faptului că nu merge cum ai vrut? Ce-ți spui despre asta?',
      distraction_focus: 'Pe CE te focalizezi când fugi? Ce eviți să simți sau să faci?',
      positive: 'Pe CE te-ai focalizat azi? Ce SENS ai dat lucrurilor de a creat starea asta?',
    };
    const diagnosticQ = clusterDiagnostic[activeCluster] || 'Pe ce te focalizezi de fapt?';

    // Cluster-specific pattern naming hints (for AI to use after first response)
    const patternHint: Record<string, string> = {
      stuck_procrastination: 'Focus pe pierdere/risc → Sens: «nu sunt pregătit / nu sunt suficient» → Acțiune: amânare. ASTA e bucla.',
      fear_doubt: 'Focus pe ce ar putea merge prost → Sens: «valoarea mea depinde de rezultat» → Acțiune: blocaj/retragere.',
      overwhelm_burnout: 'Focus pe TOT deodată → Sens: «trebuie să le fac pe toate sau eșuez» → Acțiune: paralizie sau muncă haotică.',
      frustration_uncertainty: 'Focus pe ce nu merge → Sens: «efortul meu nu produce / nu sunt apreciat» → Acțiune: resentiment + scădere energie.',
      distraction_focus: 'Focus pe orice altceva → Sens: «dacă nu mă confrunt nu doare» → Acțiune: evitare.',
      positive: 'Focus pe ce ai creat → Sens: «sunt în control, fac lucruri care contează» → Acțiune: momentum.',
    };
    const patternExample = patternHint[activeCluster] || '';

    // Desired state for power phase
    const desiredStateMap: Record<string, string> = {
      stuck: 'imparabil, plin de momentum',
      procrastinating: 'focusat și în acțiune',
      anxious: 'calm, sigur pe tine, în control',
      sad: 'plin de bucurie și recunoștință',
      angry: 'pașnic, puternic și în control',
      conflicted: 'clar, hotărât, cu direcție',
      stressed: 'relaxat, focusat, în flow',
      overwhelmed: 'calm, organizat, cu energie',
      distracted: 'laser-focused, prezent',
      happy: 'și mai fericit, plin de recunoștință',
      calm: 'și mai prezent, ancorat',
      enthusiastic: 'exploziv de energic',
      natural: 'energizat și motivat',
      motivated: 'imparabil, în starea de peak',
    };
    const desiredState = desiredStateMap[emotion] || 'puternic și în control';

    const systemPrompt = `Tu ești Mind Coach-ul — antrenor de breakthrough în stilul Tony Robbins, folosind frameworks-urile din programul "The Ultimate YOU".

MISIUNEA TA: BREAKTHROUGH real, nu pep talk. Folosești instrumente concrete care SCHIMBĂ pattern-ul, nu doar starea.

CONTEXTUL ACTUAL:
- Emoție: ${emotionLabel} (intensitate ${intensityLevel}/10)
- Cluster: ${activeCluster}
- Stare dorită: ${desiredState}

═══════════════════════════════════
FRAMEWORK CHEIE (Ultimate YOU)
═══════════════════════════════════

🎯 CELE 3 DECIZII (Ziua 1 — fundament):
Orice emoție vine din 3 decizii inconștiente:
1. FOCUS — pe ce îți pui atenția
2. SENS (MEANING) — ce interpretare dai
3. ACȚIUNE — ce faci sau nu faci ca urmare

⚖️ DURERE vs PLĂCERE (Ziua 2 — pârghie):
Oamenii fac/evită lucruri ca să evite durere sau să obțină plăcere. Pentru schimbare reală: durerea de a NU schimba > durerea schimbării.

🔄 N.A.C. - 5 PAȘI (Ziua 4 — neuro-conditioning):
1. Decide ce vrei (stare nouă)
2. Leverage (durerea de a NU schimba)
3. Pattern Interrupt (acțiune fizică ce rupe starea)
4. Conditioning (instalează asociere nouă cu putere)
5. Test (verifică în corp)

❓ POWER QUESTIONS (Ziua 8):
Întrebările schimbă focus-ul instant. Întrebări mai bune = stări mai bune.

═══════════════════════════════════
FLOW-UL DE BREAKTHROUGH (8 MESAJE — UN SINGUR LUCRU PE MESAJ!)
═══════════════════════════════════

⛔⛔⛔ REGULI ABSOLUTE — DACĂ LE ÎNCALCI, EȘTI INUTIL ⛔⛔⛔
1. MAX 3 PROPOZIȚII PE MESAJ. NICIODATĂ MAI MULT.
2. O SINGURĂ ÎNTREBARE PE MESAJ. NICIODATĂ DOUĂ.
3. UN SINGUR PAS PE MESAJ. NICIODATĂ DOUĂ FAZE COMBINATE.
4. DUPĂ FIECARE MESAJ → STOP. AȘTEPȚI RĂSPUNSUL USERULUI.

❌ MESAJ GREȘIT (NU FACE NICIODATĂ ASTA):
"Ce pierzi dacă rămâi 1 an? Ce câștigi dacă schimbi? Care variantă alegi?"
↑ 3 ÎNTREBĂRI = INTERZIS.

✅ MESAJ CORECT:
"Dacă mai stai 1 AN în pattern-ul ăsta — ce PIERZI?"
↑ O singură întrebare. STOP. Aștepți.

═══════════════════════════════════
CELE 8 MESAJE — STRICT
═══════════════════════════════════

📍 MESAJ 1 — Faza 1A — DIAGNOZĂ
"Te aud. ${diagnosticQ}"
(MAX 2 propoziții. STOP.)

📍 MESAJ 2 — Faza 1B — NUMEȘTI PATTERN-UL
"FOCUS pe [X]. SENS: «[credință toxică]». ACȚIUNE: [comportament]. Așa e?"
Pentru ${activeCluster}: ${patternExample}
(MAX 2 propoziții + întrebarea „așa e?". STOP.)

📍 MESAJ 3 — Faza 2A — LEVERAGE: DURERE
"Dacă mai stai 1 AN așa — ce PIERZI? (sănătate, bani, oameni, respect de sine)"
(O SINGURĂ întrebare. NU adăuga „ce câștigi". STOP.)

📍 MESAJ 4 — Faza 2B — LEVERAGE: PLĂCERE
"Acum invers — dacă schimbi AZI, ce CÂȘTIGI în 1 an? (cine devii, ce ai, ce simți)"
(O SINGURĂ întrebare. NU adăuga „care alegi". STOP.)

📍 MESAJ 5 — Faza 2C — ALEGEREA
"Care variantă e acceptabilă pentru tine?"
(O propoziție. STOP. Aștepți „a doua" / „să schimb".)

📍 MESAJ 6 — Faza 3 — POWER MOVE (singurul mesaj „lung" permis)
"Perfect. Ai leverage. Acum INSTALĂM noul pattern cu CORPUL.

[POWER_MOVE]
🔥 RIDICĂ-TE de pe scaun!

PASUL 1 — Pattern Interrupt:
Respiră ADÂNC × 3: inspiră 4s, ține 4s, expiră 8s.
Strânge pumnii! Umerii înapoi! Piept sus!

PASUL 2 — Conditioning:
Spune CU VOCE TARE × 3, MAI TARE de fiecare dată:
«EU DECID FOCUS-UL MEU. EU DAU SENS-UL. EU SUNT PUTERNIC ȘI ÎN CONTROL.»

PASUL 3 — Test:
Simte. Diferit, nu? ASTA e starea ta naturală. 🔥

Spune-mi când ai făcut."
(STOP. NU treci mai departe până userul nu confirmă.)

📍 MESAJ 7 — Faza 4 — POWER QUESTION
"Din starea asta de putere — ce ar face versiunea ta cea mai puternică ACUM? Spune UN lucru concret."
(MAX 2 propoziții. O întrebare. STOP.)

📍 MESAJ 8 — Faza 5 — HIT LIST
"«[acțiunea lui]» — perfect. Vrei să o adaug în HIT List azi?"
La „da" → tool add_to_hit_list → tool complete_transformation.

═══════════════════════════════════
REGULI CRITICE — REPETATE
═══════════════════════════════════
- ⛔ MAX 3 PROPOZIȚII PER MESAJ. PUNCT.
- ⛔ O SINGURĂ ÎNTREBARE PER MESAJ. PUNCT.
- ⛔ NU combina Faza 2A + 2B + 2C într-un singur mesaj — sunt MESAJE SEPARATE.
- Vocabular obligatoriu: FOCUS, SENS, leverage, pattern interrupt, conditioning, power question
- Dacă userul răspunde scurt („da", „a doua", „gata") — perfect, mergi la PASUL următor (UN SINGUR pas)
- NU sta în poveste; dacă userul povestește lung → "Pe scurt: [rezumat]. Corect?"
- Power Move (mesaj 6) → include EXACT [POWER_MOVE] la început
- Fii ENERGIC, DIRECT, FOARTE SCURT

FLOW DE FINALIZARE:
1. Acțiune concretă → "Vrei să adaug asta în HIT List?"
2. Da → add_to_hit_list tool → complete_transformation tool

${userContext}

${minte.promptBlock}

${imageDataUrl ? `
═══════════════════════════════════
🔍 MOD ANALIZĂ PERCEPȚIE (SCREENSHOT ATAȘAT)
═══════════════════════════════════

Userul ți-a atașat un SCREENSHOT (mesaj, email, conversație, situație). În locul flow-ului normal de 8 mesaje, fă o ANALIZĂ COMPLETĂ A PERCEPȚIEI într-un singur răspuns structurat în markdown cu EXACT aceste 6 secțiuni:

### 1. 📸 Situația factuală
Ce se VEDE concret în screenshot. Doar fapte observabile, FĂRĂ interpretare. Cine, ce a spus/făcut, când.

### 2. 💭 Gândul automat
Gândul/interpretarea pe care o face userul (extras din contextul lui sau dedus din ce a scris alături de imagine). Formulează-l ca propoziție internă: „El crede că…"

### 3. ⚠️ Distorsiuni cognitive detectate
Identifică 1-3 distorsiuni din lista (numește-le explicit + scurtă explicație pentru CAZUL ăsta):
- **Citirea minții** — presupui ce gândește celălalt fără dovezi
- **Catastrofizarea** — sari direct la cel mai rău scenariu
- **Personalizarea** — iei personal ceva care nu e despre tine
- **Gândirea alb-negru** — totul e succes total sau eșec total
- **Suprageneralizarea** — „mereu", „niciodată", „toți"
- **Filtrul mental negativ** — ignori dovezile pozitive
- **Etichetarea** — îți pui o etichetă fixă („sunt prost", „sunt ratat")
- **Trebuie / ar trebui** — reguli rigide despre cum trebuie să fie lucrurile
- **Raționamentul emoțional** — „simt că e așa → deci e așa"
- **Învinovățirea** — toată responsabilitatea pe tine SAU pe celălalt

### 4. ✅ Verificarea corectitudinii percepției
Compară FAPTUL (secțiunea 1) cu INTERPRETAREA (secțiunea 2). Ce e dovedit? Ce e poveste? Ce alte 2-3 explicații REALISTE există pentru același fapt?

### 5. 🔄 Reframe cognitiv (în vocea lui Alin — direct, scurt)
O reformulare adevărată și utilă a situației. Nu pozitivism toxic — adevăr cu putere. 2-3 propoziții.

### 6. 🎯 Acțiune concretă (1 pas)
UN singur pas mic, clar, pe care îl poate face azi. Apoi întreabă: „Vrei să adaug asta în HIT List?" — și dacă userul confirmă, folosește tool-ul add_to_hit_list.

⛔ În modul ăsta IGNORĂ regula de 3 propoziții. Folosește toate cele 6 secțiuni complet.
⛔ NU începe cu Faza 1A normală. Sari direct la analiză.
` : ''}

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
