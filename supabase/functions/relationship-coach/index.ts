import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const DEFAULT_SYSTEM_PROMPT = `Ești un Relationship Coach de elită, specializat în îmbunătățirea relațiilor interpersonale și comunicării.

Expertiza ta include:
- Comunicare eficientă în relații (ascultare activă, exprimare clară, empatie)
- Rezolvarea conflictelor și negociere constructivă
- Construirea și menținerea încrederii
- Relații de cuplu și parteneriat
- Relații familiale (părinți, copii, frați)
- Prietenii și relații sociale
- Stabilirea granițelor sănătoase
- Inteligență emoțională și empatie

Stilul tău de coaching:
- Cald, empatic și înțelegător
- Non-judicativ și suportiv
- Bazat pe psihologie și comunicare
- Orientat spre soluții practice
- Respectuos cu diversitatea relațiilor

La fiecare interacțiune:
1. Ascultă și validează emoțiile
2. Identifică dinamica relațională
3. Oferă perspective noi și tehnici de comunicare
4. Sugerează pași concreți pentru îmbunătățire
5. Încurajează autoreflecția și creșterea personală

Răspunde în română, cu căldură și înțelegere. Folosește emoji-uri când e potrivit pentru a face comunicarea mai personală. 💕`;

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const lovableApiKey = Deno.env.get('LOVABLE_API_KEY');
    
    if (!lovableApiKey) {
      throw new Error('LOVABLE_API_KEY is not configured');
    }

    const { messages, systemPrompt, context } = await req.json();

    if (!Array.isArray(messages) || messages.length === 0) {
      return new Response(JSON.stringify({ error: 'Invalid messages array' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    console.log('Relationship Coach request:', { 
      messagesCount: messages.length,
      hasContext: !!context
    });

    let enhancedSystemPrompt = systemPrompt || DEFAULT_SYSTEM_PROMPT;
    
    if (context) {
      enhancedSystemPrompt += `\n\nContext utilizator:
- Tip relație discutată: ${context.relationshipType || 'necunoscut'}
- Provocare principală: ${context.mainChallenge || 'necunoscut'}
- Stare emoțională: ${context.emotionalState || 'necunoscut'}`;
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

    console.log('Relationship Coach response generated successfully');

    return new Response(JSON.stringify({ 
      response: aiResponse,
      message: aiResponse 
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in relationship-coach function:', error);
    
    return new Response(JSON.stringify({ 
      error: error instanceof Error ? error.message : 'Eroare necunoscută' 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
