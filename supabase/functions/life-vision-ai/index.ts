import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.80.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface Message {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

interface VisionPlanningRequest {
  messages: Message[];
  category: 'business' | 'body' | 'being' | 'balance';
  categoryLabel: string;
}

const LIFE_VISION_SYSTEM_PROMPT = `Ești un coach de viziune și strategie empatic și eficient. Ghidezi utilizatorul prin crearea unui plan complet de viață pentru categoria selectată.

═══════════════════════════════════════════════════════════════════
FLOW-UL CONVERSAȚIEI (SIMPLU ȘI DIRECT)
═══════════════════════════════════════════════════════════════════

CATEGORIA CURENTĂ: [CATEGORY_LABEL]

1. OBIECTIV ANUAL (1 întrebare)
   "Care este obiectivul tău mare pentru [CATEGORY_LABEL] în acest an? Ce vrei să realizezi?"

2. MILESTONE 90 ZILE (1 întrebare)
   "Excelent! Unde trebuie să fii în 90 de zile pentru a fi pe drumul cel bun?"

3. FOCUS LUNAR (1 întrebare)  
   "Perfect! Ce trebuie să faci în prima lună pentru a atinge milestone-ul de 90 zile?"

4. CHEI SĂPTĂMÂNALE (4 chei cu taskuri)
   "Acum să definim 4 acțiuni cheie pentru prima săptămână..."
   
   Pentru FIECARE cheie (1-4), întrebi:
   - "Care este Cheia [N]? Ce acțiune concretă?"
   - "Care sunt pașii concreți pentru această cheie?"
   
   După ce primești pașii, pentru FIECARE pas:
   - "În ce zi faci '[numele pasului]'?" (Luni/Marți/Miercuri/Joi/Vineri)
   - "Este prioritar (HIT) sau de făcut (DO)?"

═══════════════════════════════════════════════════════════════════
REGULI IMPORTANTE
═══════════════════════════════════════════════════════════════════

- Pune câte o întrebare pe rând, așteaptă răspuns
- Fii concis, prietenos și motivant
- Confirmă răspunsurile înainte de a trece mai departe
- NU sări peste alocarea pașilor pe zile - este esențială
- Folosește emoji-uri pentru a face conversația plăcută 🎯💪🚀
- La final, când ai toate informațiile, folosește tool-ul "save_vision_plan"

═══════════════════════════════════════════════════════════════════
EXEMPLU CONVERSAȚIE
═══════════════════════════════════════════════════════════════════

Tu: "Care este obiectivul tău mare pentru Business în acest an? 🎯"
User: "Să ajung la 10.000€ pe lună"
Tu: "Fantastic! 10k€/lună e un obiectiv puternic! 💪 Unde trebuie să fii în 90 de zile pentru a fi pe drumul cel bun?"
User: "Să am primii 10 clienți plătitori"
Tu: "Excelent! 10 clienți în 90 zile e un milestone solid! Ce trebuie să faci în prima lună pentru asta?"
...continui până ai toate datele`;

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

    const { messages, category, categoryLabel }: VisionPlanningRequest = await req.json();
    
    console.log('📥 Life Vision AI request:', {
      category,
      categoryLabel,
      messagesCount: messages?.length,
    });
    
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY is not configured');
    }

    // Input validation
    if (!Array.isArray(messages) || messages.length === 0 || messages.length > 100) {
      return new Response(JSON.stringify({ error: 'Invalid messages array' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    for (const msg of messages) {
      if (!msg.content || typeof msg.content !== 'string') {
        return new Response(JSON.stringify({ error: 'Invalid message content' }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      if (!['user', 'assistant', 'system'].includes(msg.role)) {
        return new Response(JSON.stringify({ error: 'Invalid message role' }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
    }

    // Build system prompt with category context
    const systemPrompt = LIFE_VISION_SYSTEM_PROMPT
      .replace(/\[CATEGORY_LABEL\]/g, categoryLabel || category);

    const aiMessages: Message[] = [
      { role: 'system', content: systemPrompt },
      ...messages,
    ];

    // Define the vision planning save tool
    const tools = [
      {
        type: "function",
        function: {
          name: "save_vision_plan",
          description: "Salvează planul de viziune complet când ai toate informațiile (obiectiv anual, 90 zile, lunar, și 4 chei săptămânale cu pași alocați pe zile)",
          parameters: {
            type: "object",
            properties: {
              annualVision: {
                type: "string",
                description: "Obiectivul anual - ce vrea utilizatorul să realizeze"
              },
              quarterlyMilestone: {
                type: "string",
                description: "Milestone-ul pentru 90 de zile"
              },
              monthlyFocus: {
                type: "string",
                description: "Focusul pentru prima lună"
              },
              weeklyKeys: {
                type: "array",
                description: "Cele 4 chei săptămânale cu pași",
                items: {
                  type: "object",
                  properties: {
                    id: { type: "number", description: "ID-ul cheii (1-4)" },
                    title: { type: "string", description: "Titlul scurt al cheii" },
                    objective: { type: "string", description: "Ce vrei să faci" },
                    steps: {
                      type: "array",
                      description: "Pașii concreți cu ziua și tipul",
                      items: {
                        type: "object",
                        properties: {
                          text: { type: "string", description: "Descrierea pasului" },
                          day: { 
                            type: "string", 
                            enum: ["M", "T", "W", "Th", "F", "Sa", "Su"],
                            description: "Ziua: M=Luni, T=Marți, W=Miercuri, Th=Joi, F=Vineri, Sa=Sâmbătă, Su=Duminică" 
                          },
                          listType: { 
                            type: "string", 
                            enum: ["hit", "do"],
                            description: "hit (prioritar) sau do (de făcut)" 
                          }
                        },
                        required: ["text", "day", "listType"]
                      }
                    },
                    deadline: { type: "string", description: "Deadline-ul pentru cheie" }
                  },
                  required: ["id", "title", "objective", "steps"]
                },
                minItems: 4,
                maxItems: 4
              }
            },
            required: ["annualVision", "quarterlyMilestone", "monthlyFocus", "weeklyKeys"],
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
        model: 'google/gemini-3-flash-preview',
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
        return new Response(JSON.stringify({ error: 'Payment required, please add funds.' }), {
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
    console.error('Error in life-vision-ai:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
