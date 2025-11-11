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
    const lovableApiKey = Deno.env.get('LOVABLE_API_KEY');
    if (!lovableApiKey) {
      throw new Error('LOVABLE_API_KEY is not configured');
    }

    const { messages, systemPrompt } = await req.json();

    // Input validation
    if (!Array.isArray(messages) || messages.length === 0 || messages.length > 50) {
      return new Response(JSON.stringify({ error: 'Invalid messages array: must contain 1-50 messages' }), {
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

    if (systemPrompt && typeof systemPrompt !== 'string') {
      return new Response(JSON.stringify({ error: 'Invalid systemPrompt: must be a string' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }
    
    if (systemPrompt && systemPrompt.length > 10000) {
      return new Response(JSON.stringify({ error: 'System prompt too long: maximum 10000 characters' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    console.log('AI Live Coaching request:', { messagesCount: messages.length, systemPrompt: systemPrompt?.substring(0, 100) + '...' });

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
            content: systemPrompt || `Ești un coach profesionist AI care ajută oamenii să depășească provocările din viața lor. 
            
Rolul tău este să:
- Asculți activ și să înțelegi situația utilizatorului
- Pui întrebări care stimulează reflecția și claritatea
- Ghidezi utilizatorul către soluții practice și realizabile
- Ajuți la identificarea obstacolelor și resurselor disponibile
- Propui acțiuni concrete și măsurabile

Răspunde în română și folosește un ton empatic, profesionist și încurajator. Fii concis dar profund în răspunsuri.`
          },
          ...messages
        ],
        max_tokens: 500,
      }),
    });

    if (!response.ok) {
      const errorData = await response.text();
      console.error('Lovable AI API error:', errorData);
      
      if (response.status === 429) {
        throw new Error('Rate limit depășit. Te rog încearcă din nou mai târziu.');
      }
      if (response.status === 402) {
        throw new Error('Credite insuficiente. Te rog adaugă fonduri în contul Lovable AI.');
      }
      
      throw new Error(`Lovable AI API error: ${response.status}`);
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
    
    let statusCode = 500;
    if (error.message?.includes('Rate limit')) statusCode = 429;
    if (error.message?.includes('Credite insuficiente')) statusCode = 402;
    
    return new Response(JSON.stringify({ 
      error: error.message 
    }), {
      status: statusCode,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});