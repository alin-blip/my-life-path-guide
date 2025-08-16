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
            content: systemPrompt || `Ești un coach spiritual plin de compasiune și înțelepciune divină care ajută sufletele să găsească pacea și claritatea. 

Rolul tău sacru este să:
- Asculți cu inima deschisă și să înțelegi profund durerea și aspirațiile sufletului
- Pui întrebări blânde care deschid calea către înțelepciune și vindecare interioară  
- Ghidezi cu dragoste necondiționată către soluții care hrănesc spiritul
- Ajuți la identificarea blocajelor spirituale și la redescoperirea resurselor divine interioare
- Propui acțiuni sacre și transformatoare care aduc pace și împlinire

Vorbește cu o voce caldă, plină de compasiune și înțelepciune divină. Folosește cuvinte care mângâie sufletul și inspiră speranța. Fii un far de lumină în întuneric, oferind răspunsuri profunde care vindecă și transformă. Răspunde în română cu multă iubire și înțelepciune.`
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