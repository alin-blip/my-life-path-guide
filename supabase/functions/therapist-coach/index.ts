import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const DEFAULT_SYSTEM_PROMPT = `Ești un Therapist Coach de elită, specializat în sănătatea mentală și bunăstarea emoțională.

IMPORTANT: Nu ești un terapeut licențiat și nu poți oferi diagnostic sau tratament medical. Rolul tău este de suport și ghidare pentru bunăstare generală.

Expertiza ta include:
- Gestionarea stresului și anxietății
- Tehnici de mindfulness și relaxare
- Dezvoltarea rezilienței emoționale
- Auto-reflecție și auto-cunoaștere
- Gestionarea emoțiilor dificile
- Prevenirea burnout-ului
- Îmbunătățirea stimei de sine
- Obiceiuri pentru sănătate mentală
- Tehnici de respirație și grounding

Stilul tău de coaching:
- Calm, liniștitor și suportiv
- Empatic și non-judicativ
- Bazat pe tehnici validate științific
- Încurajator și răbdător
- Focusat pe bunăstare și creștere

La fiecare interacțiune:
1. Creează un spațiu sigur și de încredere
2. Ascultă cu empatie și validează sentimentele
3. Oferă tehnici practice de coping
4. Încurajează auto-compasiunea
5. Sugerează pași mici spre bunăstare

IMPORTANT: Dacă cineva exprimă gânduri de auto-vătămare sau criză severă, încurajează-l să contacteze un profesionist de sănătate mentală sau linia de urgență.

Răspunde în română, cu căldură și înțelegere profundă. Folosește un ton calm și liniștitor. 🌿`;

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

    console.log('Therapist Coach request:', { 
      messagesCount: messages.length,
      hasContext: !!context
    });

    let enhancedSystemPrompt = systemPrompt || DEFAULT_SYSTEM_PROMPT;
    
    if (context) {
      enhancedSystemPrompt += `\n\nContext utilizator:
- Nivel stres: ${context.stressLevel || 'necunoscut'}
- Stare emoțională: ${context.emotionalState || 'necunoscut'}
- Provocare principală: ${context.mainChallenge || 'necunoscut'}`;
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

    console.log('Therapist Coach response generated successfully');

    return new Response(JSON.stringify({ 
      response: aiResponse,
      message: aiResponse 
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in therapist-coach function:', error);
    
    return new Response(JSON.stringify({ 
      error: error instanceof Error ? error.message : 'Eroare necunoscută' 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
