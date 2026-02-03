import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

interface Message {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

interface PlanningRequest {
  mode: 'review' | 'new' | 'wizard';
  previousWeekData?: {
    dominoTitle: string;
    keyPoints: Array<{
      title: string;
      objective?: string;
      positiveImpact?: string;
      negativeImpact?: string;
      steps?: string;
      responsible?: string;
      deadline?: string;
    }>;
  };
  messages: Message[];
  wizardContext?: {
    dominoTitle: string;
    weekGoal: string;
    category: string;
  };
}

const REVIEW_SYSTEM_PROMPT = `Ești un coach de planificare săptămânală empatic și eficient. Vei ghida utilizatorul prin 3 faze clare:

═══════════════════════════════════════════════════════════════════
FAZA 1: REVIEW COMPLET AL TUTUROR CELOR 4 CHEI (FĂRĂ ÎNTRERUPERI)
═══════════════════════════════════════════════════════════════════

REGULĂ CRITICĂ: În această fază, NU întreba NICIODATĂ "Vrei să continui cu această cheie?" sau variante. 
Doar colectezi informații despre fiecare cheie și treci la următoarea.

1. Începi cu: "Bună! Hai să revedem săptămâna trecută. Domino Door-ul tău era: [TITLE]. Ai avut 4 chei. Să le luăm pe rând."

2. Pentru FIECARE cheie (1, 2, 3, 4) - în ordine, fără a sări:
   a) "Cheia [N]: [TITLE]. Ai reușit să atingi obiectivul? (Da/Nu)"
   b) Dacă DA: "Excelent! Ce a funcționat bine?" → apoi confirmi și treci la cheia următoare
   c) Dacă NU: 
      - "Ce te-a împiedicat?"
      - "Ce ai învățat din asta?"
      - Notezi INTERN că această cheie nu a fost realizată
      - Apoi treci IMEDIAT la cheia următoare: "Ok, am notat. Să trecem la Cheia [N+1]."

3. IMPORTANT: Nu întreba despre continuare în această fază! Doar colectezi informații.

═══════════════════════════════════════════════════════════════════
FAZA 2: REZUMAT ȘI DECIZII PENTRU CHEILE NETERMINATE
═══════════════════════════════════════════════════════════════════

După ce ai trecut prin TOATE cele 4 chei:

1. Fă un rezumat: "Perfect! Să rezumăm: ai realizat [X] din 4 chei."

2. Dacă există chei nerealizate, pentru FIECARE pe rând:
   "Cheia [N] ([TITLE]) nu a fost finalizată. Vrei să o continui săptămâna aceasta? (Da/Nu)"
   
3. Notează intern care chei vor fi transferate la săptămâna nouă.

4. După ce ai întreba despre toate cheile nerealizate:
   "Am notat. Acum să planificăm săptămâna nouă!"

═══════════════════════════════════════════════════════════════════
FAZA 3: PLANIFICARE SĂPTĂMÂNĂ NOUĂ
═══════════════════════════════════════════════════════════════════

1. Dacă utilizatorul a ales să continue cu anumite chei:
   "Vei continua cu: [lista cheilor transferate]. Acestea vor fi primele chei ale săptămânii."
   
2. Calculează câte chei noi trebuie (4 - numărul de chei transferate).

3. Pentru cheile NOI (cele care lipsesc până la 4):
   - "Care este obiectivul mare al săptămânii?"
   - "Cum numim acest Domino Door?"
   - Pentru fiecare cheie nouă, întreabă:
     * "Ce vrei să faci pentru Cheia [N]?"
     * "De ce vrei să faci asta?"
     * "Care este rezultatul pozitiv dacă realizezi? Ce impact va avea în business?"
     * "Care este rezultatul negativ dacă NU faci asta?"
     * "Care sunt pașii concreți?"
     * "Cine este responsabil?"
     * "Când este deadline-ul?"

4. La final, când ai Domino title + 4 chei complete (transferate + noi), folosește tool-ul "save_planning".

═══════════════════════════════════════════════════════════════════
REGULI GENERALE
═══════════════════════════════════════════════════════════════════

- Pune câte o întrebare pe rând, așteaptă răspuns
- Fii concis și prietenos
- Nu sări peste nicio cheie în review
- Confirmă răspunsurile înainte de a trece mai departe
- Cheile transferate păstrează detaliile originale (nu cere din nou informații pentru ele)`;

const NEW_WEEK_SYSTEM_PROMPT = `Ești un coach de planificare săptămânală. Ghidezi utilizatorul prin 4 CHEI, una câte una.

🚨 REGULĂ ABSOLUTĂ: PUNE O SINGURĂ ÎNTREBARE PER MESAJ. NICIODATĂ DOUĂ.

📋 FLOW PENTRU FIECARE CHEIE (1→4):

Q1: "Ce vrei să faci pentru Cheia [N]?" → așteaptă → confirmă scurt
Q2: "De ce vrei să faci asta?" → așteaptă → confirmă
Q3: "Ce rezultat pozitiv ai dacă reușești?" → așteaptă → confirmă  
Q4: "Ce rezultat negativ ai dacă NU faci?" → așteaptă → confirmă
Q5: "Care sunt pașii concreți? (listă)" → așteaptă → confirmă
Q6: Pentru FIECARE pas: "Pasul X - în ce zi? (L/M/Mi/J/V)" → apoi "HIT sau DO?" → confirmă
Q7: "Cine e responsabil?" → așteaptă → confirmă
Q8: "Care e deadline-ul?" → așteaptă → "✅ Cheia [N] completă! Trecem la Cheia [N+1]."

REGULI STRICTE:
- O întrebare = un mesaj. "De ce? Și care e impactul?" = INTERZIS (2 întrebări)
- Confirmă scurt după fiecare răspuns: "Am notat." sau "Perfect."
- Dacă răspunsul e vag ("da", "ok"), cere clarificări: "Poți detalia puțin?"
- După 4 chei complete, folosește tool-ul "save_planning"
- Fii empatic dar concis. Fără explicații lungi.`;

const WIZARD_SYSTEM_PROMPT = `Ești un coach de planificare săptămânală. Utilizatorul a venit din Goal Wizard cu un obiectiv masiv deja definit.

CONTEXT PRE-SETAT:
- Domino Door Title: [DOMINO_TITLE]
- Obiectivul săptămânii: [WEEK_GOAL]
- Categoria: [CATEGORY]

🎯 MISIUNEA TA: Ghidează utilizatorul să definească 4 CHEI pentru acest obiectiv.

📋 INTRO (primul mesaj):
"Excelent! Ai setat obiectivul masiv: **[DOMINO_TITLE]** pentru categoria [CATEGORY]. 
Acum hai să definim cele 4 chei care te vor duce acolo! 

**Cheia 1: Ce acțiune concretă vrei să faci pentru a te apropia de acest obiectiv?**"

📋 FLOW PENTRU FIECARE CHEIE (1→4):

Q1: "Ce vrei să faci pentru Cheia [N]?" → așteaptă → confirmă scurt
Q2: "De ce e important acest lucru?" → așteaptă → confirmă
Q3: "Ce rezultat pozitiv ai dacă reușești?" → așteaptă → confirmă  
Q4: "Ce risc există dacă nu faci?" → așteaptă → confirmă
Q5: "Care sunt 2-3 pași concreți?" → așteaptă → confirmă
Q6: Pentru FIECARE pas: "În ce zi? (L/M/Mi/J/V)" → apoi "HIT sau DO?" → confirmă
Q7: "Cine e responsabil?" → așteaptă → confirmă
Q8: "Care e deadline-ul?" → așteaptă → "✅ Cheia [N] completă!"

DUPĂ FIECARE CHEIE:
- Rezumă scurt: "Cheia [N]: [TITLE] - [X pași programați]"
- Treci la următoarea: "Cheia [N+1]: Ce vrei să faci?"

REGULI STRICTE:
- O întrebare = un mesaj
- După 4 chei complete, folosește tool-ul "save_planning"
- Fii concis și empatic
- Păstrează contextul obiectivului masiv în fiecare răspuns`;

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.80.0';

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Validate user authentication
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(JSON.stringify({ error: 'Missing authorization header' }), {
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
      return new Response(JSON.stringify({ error: 'Invalid or expired token' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    console.log('Authenticated user:', user.id);

    const { mode, previousWeekData, messages, wizardContext }: PlanningRequest = await req.json();
    
    console.log('📥 Received request:', {
      mode,
      hasPreviousWeekData: !!previousWeekData,
      messagesCount: messages?.length,
      messagesType: typeof messages,
      isArray: Array.isArray(messages)
    });
    
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY is not configured');
    }

    // Input validation
    if (!mode || !['review', 'new', 'wizard'].includes(mode)) {
      console.error('❌ Invalid mode:', mode);
      return new Response(JSON.stringify({ error: 'Invalid mode: must be "review", "new", or "wizard"' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    if (!Array.isArray(messages) || messages.length === 0 || messages.length > 100) {
      console.error('❌ Invalid messages array:', {
        isArray: Array.isArray(messages),
        length: messages?.length,
        messages: JSON.stringify(messages)
      });
      return new Response(JSON.stringify({ error: 'Invalid messages array: must contain 1-100 messages' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    for (const msg of messages) {
      if (!msg.content || typeof msg.content !== 'string') {
        return new Response(JSON.stringify({ error: 'Invalid message: content must be a non-empty string' }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      if (msg.content.length > 5000) {
        return new Response(JSON.stringify({ error: 'Message too long: maximum 5000 characters per message' }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      if (!['user', 'assistant', 'system'].includes(msg.role)) {
        return new Response(JSON.stringify({ error: 'Invalid message role: must be user, assistant, or system' }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
    }

    if (previousWeekData) {
      if (typeof previousWeekData !== 'object') {
        return new Response(JSON.stringify({ error: 'Invalid previousWeekData: must be an object' }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      if (previousWeekData.dominoTitle && typeof previousWeekData.dominoTitle !== 'string') {
        return new Response(JSON.stringify({ error: 'Invalid dominoTitle: must be a string' }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      if (previousWeekData.keyPoints && !Array.isArray(previousWeekData.keyPoints)) {
        return new Response(JSON.stringify({ error: 'Invalid keyPoints: must be an array' }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
    }

    // Determine system prompt based on mode
    let systemPrompt: string;
    
    if (mode === 'wizard' && wizardContext) {
      // Wizard mode - coming from Goal Wizard with pre-defined context
      systemPrompt = WIZARD_SYSTEM_PROMPT
        .replace(/\[DOMINO_TITLE\]/g, wizardContext.dominoTitle)
        .replace(/\[WEEK_GOAL\]/g, wizardContext.weekGoal)
        .replace(/\[CATEGORY\]/g, wizardContext.category);
      console.log('📋 Using WIZARD mode with context:', wizardContext);
    } else if (mode === 'review' && previousWeekData) {
      systemPrompt = REVIEW_SYSTEM_PROMPT;
    } else {
      systemPrompt = NEW_WEEK_SYSTEM_PROMPT;
    }

    // Build messages array
    const aiMessages: Message[] = [
      { role: 'system', content: systemPrompt },
    ];

    // If review mode, add context about previous week
    if (mode === 'review' && previousWeekData) {
      const reviewContext = `
Context săptămâna precedentă:
Domino Door: "${previousWeekData.dominoTitle}"

Cele 4 chei:
${previousWeekData.keyPoints.map((kp, idx) => `${idx + 1}. ${kp.title}`).join('\n')}

Începe review-ul acum.
`;
      aiMessages.push({ role: 'system', content: reviewContext });
    }

    // Add conversation history
    aiMessages.push(...messages);

    // Define the planning save tool
    const tools = [
      {
        type: "function",
        function: {
          name: "save_planning",
          description: "Salvează planificarea săptămânală completă când ai toate informațiile necesare (Domino title + 4 chei cu toate detaliile)",
          parameters: {
            type: "object",
            properties: {
              dominoTitle: {
                type: "string",
                description: "Titlul Domino Door-ului pentru săptămâna aceasta"
              },
              weekGoal: {
                type: "string",
                description: "Obiectivul general al săptămânii"
              },
              keyPoints: {
                type: "array",
                description: "Cele 4 chei măsurabile",
                items: {
                  type: "object",
                  properties: {
                    id: { type: "number", description: "ID-ul cheii (1-4)" },
                    title: { type: "string", description: "Titlul scurt al cheii" },
                    objective: { type: "string", description: "Ce vrei să faci" },
                    why: { type: "string", description: "De ce vrei să faci asta" },
                    positiveImpact: { type: "string", description: "Rezultatul pozitiv și impact în business" },
                    negativeImpact: { type: "string", description: "Rezultatul negativ dacă nu se face" },
                    steps: {
                      type: "array",
                      description: "Pașii concreți cu ziua și tipul de sarcină",
                      items: {
                        type: "object",
                        properties: {
                          text: { type: "string", description: "Descrierea pasului" },
                          day: { 
                            type: "string", 
                            enum: ["M", "T", "W", "Th", "F", "Sa", "Su"],
                            description: "Ziua în care se execută: M=Luni, T=Marți, W=Miercuri, Th=Joi, F=Vineri, Sa=Sâmbătă, Su=Duminică" 
                          },
                          listType: { 
                            type: "string", 
                            enum: ["hit", "do"],
                            description: "Tipul listei - hit (prioritar) sau do (de făcut)" 
                          }
                        },
                        required: ["text", "day", "listType"]
                      }
                    },
                    responsible: { type: "string", description: "Cine este responsabil" },
                    deadline: { type: "string", description: "Când este deadline-ul" }
                  },
                  required: ["id", "title", "objective", "why", "positiveImpact", "negativeImpact", "steps", "responsible", "deadline"]
                },
                minItems: 4,
                maxItems: 4
              }
            },
            required: ["dominoTitle", "weekGoal", "keyPoints"],
            additionalProperties: false
          }
        }
      }
    ];

    console.log('Sending request to Lovable AI...');
    
    // Retry logic for transient failures
    let response: Response | null = null;
    let lastError: string = '';
    
    for (let attempt = 1; attempt <= 3; attempt++) {
      try {
        console.log(`Attempt ${attempt}/3...`);
        response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${LOVABLE_API_KEY}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            model: 'google/gemini-2.5-pro',
            messages: aiMessages,
            tools: tools,
            tool_choice: 'auto',
            stream: true,
          }),
        });
        
        if (response.ok) {
          break;
        }
        
        if (response.status === 429) {
          return new Response(JSON.stringify({ error: 'Rate limits exceeded, please try again later.' }), {
            status: 429,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          });
        }
        if (response.status === 402) {
          return new Response(JSON.stringify({ error: 'Payment required, please add funds to your Lovable AI workspace.' }), {
            status: 402,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          });
        }
        
        lastError = await response.text();
        console.error(`Attempt ${attempt} failed:`, response.status, lastError);
        
        // Wait before retry (exponential backoff)
        if (attempt < 3) {
          await new Promise(resolve => setTimeout(resolve, 1000 * attempt));
        }
      } catch (fetchError) {
        console.error(`Attempt ${attempt} network error:`, fetchError);
        lastError = fetchError instanceof Error ? fetchError.message : 'Network error';
        if (attempt < 3) {
          await new Promise(resolve => setTimeout(resolve, 1000 * attempt));
        }
      }
    }
    
    if (!response || !response.ok) {
      console.error('All retry attempts failed:', lastError);
      return new Response(JSON.stringify({ error: 'AI gateway error', details: lastError }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Stream response back
    return new Response(response.body, {
      headers: { 
        ...corsHeaders, 
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive'
      },
    });

  } catch (error) {
    console.error('Error in door-ai-planning:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
