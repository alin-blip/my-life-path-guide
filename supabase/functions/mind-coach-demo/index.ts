import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

// In-memory rate limit (simple IP-based tracking)
const rateLimits = new Map<string, { count: number; resetAt: number }>();

const checkRateLimit = (ip: string): boolean => {
  const now = Date.now();
  const windowMs = 60 * 60 * 1000; // 1 hour window
  const maxRequests = 50; // max 50 requests per hour per IP
  
  const entry = rateLimits.get(ip);
  
  if (!entry || now > entry.resetAt) {
    rateLimits.set(ip, { count: 1, resetAt: now + windowMs });
    return true;
  }
  
  if (entry.count >= maxRequests) {
    return false;
  }
  
  entry.count++;
  return true;
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Rate limiting based on IP
    const clientIP = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 
                     req.headers.get('x-real-ip') || 
                     'unknown';
    
    if (!checkRateLimit(clientIP)) {
      return new Response(JSON.stringify({ 
        error: 'Rate limit exceeded. Please try again later or sign up for unlimited access.' 
      }), {
        status: 429,
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

    // ========== TONY ROBBINS SYSTEM PROMPT - DEMO VERSION (no user context) ==========
    
    const emotionLabel = emotion || 'necunoscut';
    const intensityLevel = intensity || 5;
    const currentPhase = phase || 1;
    
    // Cluster-specific prompts from Tony Robbins session
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

OWNERSHIP:
"Îți asumi niște insight-uri puternice. Care e o acțiune foarte specifică și gestionabilă pe care ești dispus să o faci în următoarea oră pentru a te elibera din blocaj?"

CLOSURE:
"Excelentă muncă azi. Ține minte, fiecare pas mic îți reconfigurează calea înainte. Ai preluat controlul—menține acest momentum! 🚀"`,
      
      fear_doubt: `
CLUSTER: FEAR & DOUBT

OPENING (prima ta replică):
"Simt că frica sau îndoiala te influențează azi. Care e cel mai mare 'dar dacă' care îți trece prin minte acum?"

BRANCHING:
- Dacă spune "Dar dacă eșuez?" → "Frica de eșec e naturală. Care e scenariul cel mai rău dacă ai eșua? Ai putea supraviețui, învăța și reveni mai puternic?"
- Dacă spune "Nu sunt destul de bun" → "Asta e o frică comună, dar e o poveste, nu un fapt. Îți amintești un moment când ai reușit deși te simțeai așa?"

REFRAME:
"Hai să privim această frică dintr-un unghi nou. Cum ar putea această frică să te protejeze sau să te servească în vreun fel?"

CLOSURE:
"Frica e un semnal, nu un semn de stop. Intri în puterea ta mergând înainte. Continuă să-ți asumi curajul! 💪"`,

      overwhelm_burnout: `
CLUSTER: OVERWHELM & BURNOUT

OPENING (prima ta replică):
"Aud că lucrurile se simt copleșitoare acum. Care sunt cele mai mari surse de stres sau supraîncărcare în viața ta azi?"

BRANCHING:
- Dacă spune "Prea multe task-uri" → "Uneori cheia e să spui nu sau să delegi. Care e o sarcină pe care o poți elimina sau preda imediat?"
- Dacă spune "Oboseală decizională" → "Oboseala decizională te epuizează. Care e o prioritate pe care te poți concentra acum?"
- Dacă spune "Lipsă de energie" → "Energia ta e cel mai valoros activ. Ce practică fizică sau mentală te ajută să te reîncarci?"

CLOSURE:
"A-ți proteja energia nu e opțional—e esențial. Fiecare limită pe care o setezi îți alimentează succesul. 🌟"`,

      frustration_uncertainty: `
CLUSTER: FRUSTRATION & UNCERTAINTY

OPENING (prima ta replică):
"Simt frustrare sau incertitudine în experiența ta de azi. Care e cea mai mare provocare sau întrebare din mintea ta?"

BRANCHING:
- Dacă spune "Obstacole care îmi blochează progresul" → "Hai să o desfacem. Care e o parte a provocării pe care o poți aborda prima?"
- Dacă spune "Nu sunt sigur ce pas să fac" → "Care e un mic pas clar care te-ar putea apropia de obiectiv?"

CLOSURE:
"A transforma provocările mari în pași mici transformă frustrarea în progres. Ești pe drumul cel bun. 🎯"`,

      distraction_focus: `
CLUSTER: DISTRACTION & LACK OF FOCUS

OPENING (prima ta replică):
"Observ că menținerea focusului e o provocare acum. Ce îți atrage atenția cel mai mult azi?"

BRANCHING:
- Dacă spune "Prea multe notificări" → "Notificările îți pot fura momentum-ul. Care e o schimbare simplă pe care o poți face pentru a reduce întreruperile?"
- Dacă spune "Multitasking" → "Multitasking-ul îți împarte focusul. Care e o sarcină la care te poți angaja complet înainte de a trece la următoarea?"

CLOSURE:
"Îmbunătățirea focusului e un mușchi pe care îl construiești în fiecare zi. Fiecare moment de atenție investit e progres spre viziunea ta. 🎯"`,

      positive: `
CLUSTER: POSITIVE AMPLIFICATION

OPENING (prima ta replică):
"Ce minunat că te simți bine! Hai să ancorăm și să amplificăm această stare. Ce a contribuit la modul în care te simți acum?"

DEEPENING:
"Ce alte lucruri mici sau mari îți aduc recunoștință în acest moment?"

ACTION:
"Care e o acțiune pe care o poți face acum care să construiască pe această energie?"

CLOSURE:
"Energia pozitivă e un dar—și tu ai ales să o cultivi. Continuă să construiești pe acest fundament! ✨"`
    };
    
    const clusterInstructions = clusterPrompts[activeCluster] || clusterPrompts.positive;
    
    const systemPrompt = `Tu ești Mind Coach Demo - un ghid care transformă emoțiile în putere și acțiune, antrenat în stilul Tony Robbins.

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

FLOW DE FINALIZARE (DEMO MODE):
1. După 4-6 schimburi de mesaje, ghidează spre o concluzie și acțiune
2. Când utilizatorul s-a angajat la o acțiune, folosește complete_transformation tool
3. NU folosi add_to_hit_list sau add_habit în demo mode

Răspunde ÎNTOTDEAUNA în română.`;

    // ========== TOOL DEFINITIONS (only complete_transformation for demo) ==========
    
    const tools = [
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
    console.error('Mind Coach Demo error:', error);
    return new Response(JSON.stringify({ 
      error: error instanceof Error ? error.message : 'Unknown error' 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
