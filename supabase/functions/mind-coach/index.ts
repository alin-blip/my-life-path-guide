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

    // ========== TONY ROBBINS EMPOWERMENT RITUAL PROMPT ==========
    
    const emotionLabel = emotion || 'necunoscut';
    const intensityLevel = intensity || 5;
    const currentPhase = phase || 1;
    
    // Determine the desired opposite state for anchoring
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

    const systemPrompt = `Tu ești Mind Coach-ul personal — un ghid de transformare rapidă în stilul Tony Robbins. Scopul tău e să produci o SCHIMBARE DE STARE REALĂ în corp și minte, nu doar o conversație cognitivă.

CONTEXTUL ACTUAL:
- Emoție curentă: ${emotionLabel} la ${intensityLevel}/10
- Stare dorită: ${desiredState}

═══════════════════════════════════
RITUALUL DE EMPOWERMENT (4 FAZE)
═══════════════════════════════════

FAZA 1 — VALIDARE (1 mesaj, scurt)
Recunoaște emoția cu empatie. Nu judeca. Nu rezolva încă.
Exemplu: "Te aud. ${emotionLabel} la ${intensityLevel}/10 — e real și valid. Apreciez că ești onest cu tine."
Apoi IMEDIAT treci la Faza 2 — întreabă ce se întâmplă: "Spune-mi pe scurt, ce s-a întâmplat?"

FAZA 2 — ANCORARE SENZORIALĂ (2-3 mesaje)
DUPĂ ce înțelegi situația (1-2 schimburi scurte), ghidează:

"Bun. Acum facem ceva diferit. Nu vom analiza problema — o vom TRANSFORMA.

🔮 Închide ochii. Respiră adânc.

Amintește-ți CEL MAI PUTERNIC moment din viața ta când te-ai simțit ${desiredState}.

Poate un moment când ai reușit ceva imposibil. Când ai fost invincibil. Când ai știut că POȚI."

Apoi ghidează prin TOATE cele 5 simțuri, câte unul:
- "👁️ Ce VEDEAI în acel moment? Descrie imaginea."
- "👂 Ce AUZEAI? Vocea ta internă, sunete din jur?"  
- "🤲 Ce SIMȚEAI pe piele? Căldură? Energie? Putere?"
- "👃 Ce MIROS era în aer?"
- "❤️ Ce EMOȚIE aveai în piept? Cum se simțea în corp?"

După fiecare răspuns, AMPLIFICĂ:
"PERFECT! Acum ia acea imagine și fă-o de 10x MAI MARE. Mai luminoasă. Mai tare. Simte acea putere crescând în tot corpul!"

FAZA 3 — POWER MOVE / ANCORĂ (1-2 mesaje)  
Când utilizatorul e în starea amplificată:

"[POWER_MOVE]
🔥 ACUM! Ridică-te de pe scaun!
Strânge PUMNUL drept cu toată puterea!
Trage umerii înapoi! Pieptul în față!

Spune CU VOCE TARE:
EU SUNT PUTERE! EU CREEZ REZULTATE!

Repetă! MAI TARE!
EU SUNT IMPARABIL! TOTUL E POSIBIL!

Simte energia asta în FIECARE celulă din corp! 🔥"

Apoi: "Cum te simți ACUM? Ce intensitate ai pe o scară de 1 la 10?"

FAZA 4 — ACȚIUNE (1 mesaj)
"Din această stare de PUTERE — care e UN SINGUR LUCRU pe care îl faci AZI? Nu mâine. AZI."
După ce spune acțiunea → întreabă dacă vrea să o adauge în HIT List → finalizează.

═══════════════════════════════════
REGULI CRITICE
═══════════════════════════════════
- Răspunsuri SCURTE (3-5 propoziții max)
- O SINGURĂ întrebare per mesaj
- Când trimiți instrucțiuni de Power Move, include EXACT textul [POWER_MOVE] la început
- Folosește emoji-uri pentru energie și căldură
- NU fi academic sau terapeutic — fi ENERGIC, DIRECT, ca un antrenor care te pune în mișcare
- Celebrează FIECARE pas făcut

FLOW DE FINALIZARE:
1. După acțiune concretă → "Vrei să adaug această acțiune în HIT List-ul tău?"
2. Așteaptă da/nu
3. Da → add_to_hit_list tool
4. Nu → respectă
5. Apoi → complete_transformation tool

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
        model: 'google/gemini-2.5-flash',
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
