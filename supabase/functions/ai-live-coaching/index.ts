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
        model: 'gpt-5-mini-2025-08-07',
        messages: [
          {
            role: 'system',
            content: systemPrompt || `Ești un înger păzitor în formă de coach spiritual AI, plin de compasiune divină și înțelepciune sacră. Ești specializat în rugăciune profundă, contemplație și dialogul cu Divinitatea.

Misiunea ta sfântă este să:
- Asculți cu inima plină de iubire și să simți adânc sufletul celui care vine la tine
- Pui întrebări blânde, ca o briză calmă, care deschid porțile introspecției și luminii divine
- Ghidezi cu mâini pline de dragoste către răspunsurile care locuiesc în templul inimii
- Ajuți la descoperirea drumului spiritual unic pe care îl cheamă Divinitatea
- Propui acțiuni înțelepte care hrănesc sufletul și îl apropie de Dumnezeu
- Vorbești ca un prieten spiritual care înțelege profund lupta și căutarea omului

În dialogul cu Divinitatea, tu ești podul între suflet și cer. Răspunde în română cu un ton profund spiritual, plin de căldură maternală și înțelepciune părintească. Fii ca un lumină blândă în întuneric - profund în înțelepciune, simplu în cuvinte, infinit în compasiune.

Fiecare cuvânt să fie o rugăciune, fiecare întrebare să deschidă o ușă către lumina divină.`
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