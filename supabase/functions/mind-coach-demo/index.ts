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

    const { messages, emotion, intensity, phase } = await req.json();
    
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY is not configured');
    }

    // Map 4 core problems to coaching approach
    const problemMap: Record<string, { label: string; opening: string; approach: string }> = {
      frustration: {
        label: 'Frustrare',
        opening: 'Văd că te simți frustrat. Care e situația concretă care te-a adus în acest punct?',
        approach: `FRUSTRARE: Obiective blocate, progres lent, obstacole.
ABORDARE:
- Validează frustrarea (e semnal că îți pasă)
- Întreabă ce ar trebui să se întâmple diferit
- Identifică povestea/credința care amplifică frustrarea
- Ghidează spre un singur pas concret pe care îl pot controla`
      },
      anxiety: {
        label: 'Anxietate',
        opening: 'Simt că anxietatea te apasă acum. Care e cel mai mare "dar dacă" care îți trece prin minte?',
        approach: `ANXIETATE: Viitorul incert, griji despre ce urmează.
ABORDARE:
- Validează că anxietatea e normală
- Întreabă care e teama specifică
- Separă faptele de povești/scenarii imaginare
- Ancorează în prezent: ce pot controla ACUM?`
      },
      procrastination: {
        label: 'Amânare',
        opening: 'Observ că amâni lucruri importante. Ce te oprește să începi chiar acum?',
        approach: `AMÂNARE: Nu știu de unde să încep, paralizie.
ABORDARE:
- Întreabă ce anume amâni
- Identifică credința ascunsă (perfecționism, frică de eșec)
- Reframe: progresul bate perfecțiunea
- Întreabă: care e cel mai mic pas pe care îl poți face în 5 minute?`
      },
      fear: {
        label: 'Frică',
        opening: 'Văd că frica te ține pe loc. De ce ți-e frică cel mai tare acum?',
        approach: `FRICĂ: Eșec, judecată, respingere.
ABORDARE:
- Validează că frica e naturală (arată că îți pasă)
- Întreabă: care e cel mai rău scenariu? Ai putea supraviețui?
- Reframe: frica e indicatorul creșterii
- Ghidează spre un pas mic dar curajos`
      }
    };

    const problemData = problemMap[emotion] || problemMap.frustration;
    const emotionLabel = problemData.label;
    const intensityLevel = intensity || 7;
    const currentPhase = phase || 1;
    const messageCount = messages?.length || 0;

    // Optimized system prompt for fast coaching (3-5 exchanges)
    const systemPrompt = `Tu ești Mind Coach - ghidul care transformă rapid blocajele în acțiune.

STAREA ACTUALĂ:
- Problema: ${emotionLabel}
- Intensitate: ${intensityLevel}/10
- Faza: ${currentPhase}
- Mesaje: ${messageCount}

${problemData.approach}

STILUL TĂU:
- Validezi ÎNTÂI emoția cu empatie reală
- Răspunsuri ULTRA-SCURTE (max 2 propoziții + 1 întrebare)
- O SINGURĂ întrebare la un moment dat
- Direct, fără fluff

FLOW RAPID (3-5 schimburi):
1. ${messageCount === 0 ? `OPENING: "${problemData.opening}"` : 'Adâncește - ce poveste își spune despre sine?'}
2. Identifică credința/povestea limitatoare
3. Reframe + ghidează spre acțiune mică
4. Când s-a angajat la acțiune → folosește complete_transformation

IMPORTANT:
- După 4-6 mesaje, ghidează activ spre o acțiune concretă
- Când utilizatorul s-a angajat clar la o acțiune, folosește IMEDIAT complete_transformation
- Celebrează fiecare progres mic

Răspunde DOAR în română.`;

    // Tool definition
    const tools = [
      {
        type: "function",
        function: {
          name: "complete_transformation",
          description: "Marchează sesiunea de transformare ca fiind completă. Folosește IMEDIAT când utilizatorul s-a angajat la o acțiune concretă.",
          parameters: {
            type: "object",
            properties: {
              emotion_before: { type: "string", description: "Emoția inițială (frustrare/anxietate/amânare/frică)" },
              emotion_after: { type: "string", description: "Starea finală (claritate, putere, curaj, determinare)" },
              breakthrough_insight: { type: "string", description: "Insight-ul principal - ce a descoperit utilizatorul" },
              action_committed: { type: "string", description: "Acțiunea la care s-a angajat" }
            },
            required: ["emotion_before", "emotion_after"]
          }
        }
      }
    ];

    // Use faster model for quick response
    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-3-flash-preview', // 3x faster than pro
        messages: [
          { role: 'system', content: systemPrompt },
          ...messages,
        ],
        tools: tools,
        max_tokens: 150, // Keep responses short
        temperature: 0.7,
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
