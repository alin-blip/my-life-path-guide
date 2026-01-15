import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const DEFAULT_SYSTEM_PROMPT = `Ești un Personal Performance Coach de elită, specializat în optimizarea performanței fizice și mentale. 

Expertiza ta include:
- Antrenament și fitness (forță, cardio, flexibilitate, recuperare)
- Nutriție pentru performanță (macronutrienți, timing, suplimente)
- Somn și recuperare (calitate, durată, rutine)
- Energie și vitalitate (biohacking, obiceiuri zilnice)
- Mindset pentru performanță (focus, motivație, reziliență)
- Prevenirea epuizării și burnout-ului

Stilul tău de coaching:
- Direct și orientat spre acțiune
- Bazat pe știință și dovezi
- Motivant dar realist
- Personalizat pentru nevoile utilizatorului
- Oferă planuri concrete și măsurabile

La fiecare interacțiune:
1. Identifică provocarea specifică
2. Oferă soluții practice imediate
3. Sugerează un plan de acțiune pe termen scurt
4. Încurajează și motivează

Răspunde în română, concis și la obiect. Folosește emoji-uri când e potrivit pentru a face comunicarea mai dinamică.`;

serve(async (req) => {
  // Handle CORS preflight requests
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

    const lovableApiKey = Deno.env.get('LOVABLE_API_KEY');
    
    if (!lovableApiKey) {
      throw new Error('LOVABLE_API_KEY is not configured');
    }

    const { messages, systemPrompt, context } = await req.json();

    // Input validation
    if (!Array.isArray(messages) || messages.length === 0) {
      return new Response(JSON.stringify({ error: 'Invalid messages array' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    console.log('Performance Coach request:', { 
      messagesCount: messages.length,
      hasContext: !!context
    });

    // Build context-aware system prompt
    let enhancedSystemPrompt = systemPrompt || DEFAULT_SYSTEM_PROMPT;
    
    if (context) {
      enhancedSystemPrompt += `\n\nContext utilizator:
- Nivel energie: ${context.energyLevel || 'necunoscut'}
- Ore somn: ${context.sleepHours || 'necunoscut'}
- Antrenamente săptămâna asta: ${context.workoutsThisWeek || 0}
- Obiectiv principal: ${context.mainGoal || 'performanță generală'}`;
    }

    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${lovableApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          {
            role: 'system',
            content: enhancedSystemPrompt
          },
          ...messages
        ],
        max_tokens: 1000,
      }),
    });

    if (!response.ok) {
      const errorData = await response.text();
      console.error('Lovable AI API error:', errorData);
      
      if (response.status === 429) {
        return new Response(JSON.stringify({ 
          error: 'Rate limit depășit. Te rog încearcă din nou în câteva secunde.' 
        }), {
          status: 429,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      
      if (response.status === 402) {
        return new Response(JSON.stringify({ 
          error: 'Credite insuficiente pentru AI. Contactează administratorul.' 
        }), {
          status: 402,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      
      throw new Error(`AI API error: ${response.status}`);
    }

    const data = await response.json();
    const aiResponse = data.choices[0].message.content;

    console.log('Performance Coach response generated successfully');

    return new Response(JSON.stringify({ 
      response: aiResponse,
      message: aiResponse 
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in performance-coach function:', error);
    
    return new Response(JSON.stringify({ 
      error: error instanceof Error ? error.message : 'Eroare necunoscută' 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
