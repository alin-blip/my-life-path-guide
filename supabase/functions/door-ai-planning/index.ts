import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface Message {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

interface PlanningRequest {
  mode: 'review' | 'new';
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

const NEW_WEEK_SYSTEM_PROMPT = `Ești un coach de planificare săptămânală empatic și eficient. Ghidezi utilizatorul prin planificarea săptămânii cu întrebări clare.

FLOW-ul conversației:
1. "Ce vrei să realizezi săptămâna asta?"
2. "Care este obiectivul mare?"
3. "Cum numim acest Domino Door?"
4. "Să definim cele 4 chei măsurabile..."

Pentru FIECARE cheie (1-4), întrebi:
- "Ce vrei să faci pentru Cheia [N]?"
- "De ce vrei să faci asta?"
- "Care este rezultatul pozitiv dacă realizezi? Ce impact va avea în business?"
- "Care este rezultatul negativ dacă NU faci asta? Cum afectează business-ul și echipa?"
- "Care sunt pașii concreți pentru a realiza asta?"

═══════════════════════════════════════════════════════════════════
ALOCARE PAȘI PE ZILE (FOARTE IMPORTANT!)
═══════════════════════════════════════════════════════════════════

După ce utilizatorul îți spune pașii, pentru FIECARE pas individual întrebi:
1. "În ce zi execuți pasul '[numele pasului]'?" (Luni/Marți/Miercuri/Joi/Vineri/Sâmbătă/Duminică sau L/M/Mi/J/V/S/D)
2. "Este o sarcină prioritară (HIT) sau de făcut (DO)?"
   - HIT = sarcini critice, prioritare, care trebuie făcute neapărat
   - DO = sarcini importante dar mai flexibile

Exemplu conversație:
User: "Pașii sunt: cercetare piață, creare prezentare, întâlnire client"
Tu: "Perfect! Să alocăm fiecare pas pe zile. Pentru 'cercetare piață' - în ce zi îl execuți?"
User: "Luni"
Tu: "Este HIT (prioritar) sau DO (de făcut)?"
User: "HIT"
Tu: "Notat! Pentru 'creare prezentare' - în ce zi?"
... (continui pentru fiecare pas)

═══════════════════════════════════════════════════════════════════

După alocare continuă cu:
- "Cine este responsabil pentru această cheie?"
- "Când este deadline-ul final?"

IMPORTANT:
- Pune câte o întrebare pe rând
- Fii concis și prietenos
- NU sări peste alocarea pașilor pe zile - este esențială pentru planul complet
- Când utilizatorul răspunde, confirmă și treci la următoarea întrebare
- La final, când ai toate informațiile (Domino title + 4 chei complete cu pași alocați pe zile), folosește tool-ul "save_planning" pentru a salva planul structurat`;

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { mode, previousWeekData, messages }: PlanningRequest = await req.json();
    
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
    if (!mode || !['review', 'new'].includes(mode)) {
      console.error('❌ Invalid mode:', mode);
      return new Response(JSON.stringify({ error: 'Invalid mode: must be "review" or "new"' }), {
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
    const systemPrompt = mode === 'review' && previousWeekData 
      ? REVIEW_SYSTEM_PROMPT 
      : NEW_WEEK_SYSTEM_PROMPT;

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
    
    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: aiMessages,
        tools: tools,
        tool_choice: 'auto',
        stream: true,
      }),
    });

    if (!response.ok) {
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
      const errorText = await response.text();
      console.error('AI gateway error:', response.status, errorText);
      return new Response(JSON.stringify({ error: 'AI gateway error' }), {
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
