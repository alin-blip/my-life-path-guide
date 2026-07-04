import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";
import { requireUser, corsHeaders, unauthorized } from "../_shared/auth.ts";

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { user } = await requireUser(req);
    if (!user) return unauthorized();

    const { recordingId, transcript, questionText } = await req.json();

    if (!transcript) {
      throw new Error('Transcript is required for sentiment analysis');
    }

    // If a recordingId is supplied, ensure it belongs to the authenticated user
    // before we later overwrite it using the service role.
    if (recordingId) {
      const admin = createClient(
        Deno.env.get('SUPABASE_URL')!,
        Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
      );
      const { data: rec, error: recErr } = await admin
        .from('voice_recordings')
        .select('user_id')
        .eq('id', recordingId)
        .maybeSingle();
      if (recErr || !rec) return unauthorized('Recording not found', 404);
      if (rec.user_id !== user.id) return unauthorized('Forbidden', 403);
    }

    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY not configured');
    }

    console.log('🔍 Analyzing sentiment for recording:', recordingId);

    // Call Lovable AI for sentiment analysis with structured output
    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          {
            role: 'system',
            content: `Ești un expert în analiza emoțională și psihologie. Analizează transcriptul vocal al utilizatorului și identifică:
1. Emoțiile dominante (ex: bucurie, frustrare, anxietate, hotărâre, confuzie, etc.)
2. Intensitatea emoțională (scăzută, medie, ridicată)
3. Teme-cheie și preocupări
4. Insight-uri psihologice despre starea mentală
5. Recomandări sau observații constructive

Fii empatetic, perspicace și oferă analize care ajută utilizatorul să se înțeleagă mai bine.`
          },
          {
            role: 'user',
            content: `Analizează următorul răspuns vocal la întrebarea: "${questionText || 'N/A'}"\n\nTranscript: "${transcript}"\n\nOferă o analiză detaliată a sentimentelor și emoțiilor.`
          }
        ],
        tools: [
          {
            type: 'function',
            function: {
              name: 'analyze_sentiment',
              description: 'Analizează sentimentele și emoțiile dintr-un transcript vocal',
              parameters: {
                type: 'object',
                properties: {
                  primary_emotion: {
                    type: 'string',
                    description: 'Emoția dominantă identificată (ex: bucurie, frustrare, determinare)'
                  },
                  secondary_emotions: {
                    type: 'array',
                    items: { type: 'string' },
                    description: 'Emoții secundare prezente'
                  },
                  intensity: {
                    type: 'string',
                    enum: ['scăzută', 'medie', 'ridicată'],
                    description: 'Intensitatea emoțională generală'
                  },
                  sentiment_score: {
                    type: 'number',
                    description: 'Scor numeric de sentiment de la -1 (foarte negativ) la 1 (foarte pozitiv)',
                    minimum: -1,
                    maximum: 1
                  },
                  key_themes: {
                    type: 'array',
                    items: { type: 'string' },
                    description: 'Teme-cheie și preocupări identificate'
                  },
                  psychological_insight: {
                    type: 'string',
                    description: 'Insight psihologic despre starea mentală a utilizatorului'
                  },
                  recommendation: {
                    type: 'string',
                    description: 'Recomandare sau observație constructivă'
                  }
                },
                required: ['primary_emotion', 'intensity', 'sentiment_score', 'psychological_insight'],
                additionalProperties: false
              }
            }
          }
        ],
        tool_choice: { type: 'function', function: { name: 'analyze_sentiment' } }
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ Lovable AI error:', response.status, errorText);
      throw new Error(`Lovable AI error: ${response.status}`);
    }

    const data = await response.json();
    console.log('✅ AI Response:', JSON.stringify(data, null, 2));

    // Extract the function call result
    const toolCall = data.choices?.[0]?.message?.tool_calls?.[0];
    if (!toolCall || toolCall.function.name !== 'analyze_sentiment') {
      throw new Error('Invalid AI response format');
    }

    const sentimentAnalysis = JSON.parse(toolCall.function.arguments);
    console.log('📊 Sentiment Analysis:', sentimentAnalysis);

    // Save to database if recordingId is provided
    if (recordingId) {
      const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
      const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
      const supabase = createClient(supabaseUrl, supabaseServiceKey);

      const { error: updateError } = await supabase
        .from('voice_recordings')
        .update({ sentiment_analysis: sentimentAnalysis })
        .eq('id', recordingId);

      if (updateError) {
        console.error('❌ Error updating recording:', updateError);
        throw updateError;
      }

      console.log('✅ Sentiment analysis saved to database');
    }

    return new Response(
      JSON.stringify({ success: true, analysis: sentimentAnalysis }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('❌ Error in analyze-sentiment:', error);
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});
