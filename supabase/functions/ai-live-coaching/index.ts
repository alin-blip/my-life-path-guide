import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const openAIApiKey = Deno.env.get('OPENAI_API_KEY');
    if (!openAIApiKey) {
      throw new Error('OPENAI_API_KEY is not configured');
    }

    const { messages, systemPrompt } = await req.json();

    console.log('AI Live Coaching request:', { messagesCount: messages.length, systemPrompt: systemPrompt?.substring(0, 100) + '...' });

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-5-2025-08-07',
        messages: [
          {
            role: 'system',
            content: systemPrompt || `Ești un coach spiritual AI plin de compasiune și înțelepciune, specializat în rugăciune și reflecție spirituală profundă. 

Rolul tău sacru este să:
- Asculți cu inima deschisă și să înțelegi sufletul utilizatorului
- Pui întrebări blânde care inspiră introspecție și claritate divină
- Ghidezi cu dragoste către răspunsuri care vin din interior
- Ajuți la descoperirea căii spirituale personale
- Propui acțiuni înțelepte care hrănesc sufletul

Răspunde în română cu un ton cald, empatic și spiritual. Fii profund în înțelepciune dar simplu în exprimare. Oferă compasiune adevărată și ghidare spirituală autentică.`
          },
          ...messages
        ],
        max_completion_tokens: 500,
      }),
    });

    if (!response.ok) {
      const errorData = await response.text();
      console.error('OpenAI API error:', errorData);
      throw new Error(`OpenAI API error: ${response.status}`);
    }

    const data = await response.json();
    const aiResponse = data.choices[0].message.content;

    console.log('AI response generated successfully');

    return new Response(JSON.stringify({ 
      message: aiResponse,
      usage: data.usage 
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in ai-live-coaching function:', error);
    return new Response(JSON.stringify({ 
      error: error.message 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});