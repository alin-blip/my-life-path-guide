import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { requireUser, corsHeaders, unauthorized } from "../_shared/auth.ts";

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  const { user } = await requireUser(req);
  if (!user) return unauthorized();

  try {
    const OPENAI_API_KEY = Deno.env.get('OPENAI_API_KEY');
    if (!OPENAI_API_KEY) {
      console.error('❌ OPENAI_API_KEY is not set');
      throw new Error('OPENAI_API_KEY is not configured');
    }

    console.log('📡 Requesting ephemeral token from OpenAI with input_audio_transcription enabled...');

    // Request an ephemeral token from OpenAI WITH transcription enabled
    const response = await fetch("https://api.openai.com/v1/realtime/sessions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${OPENAI_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "gpt-4o-realtime-preview-2024-12-17",
        voice: "alloy",
        instructions: "You are a helpful AI assistant for weekly planning and task management. Be concise and actionable.",
        // CRITICAL: Enable input audio transcription
        input_audio_transcription: {
          model: "whisper-1"
        },
        // Enable better turn detection
        turn_detection: {
          type: "server_vad",
          threshold: 0.5,
          prefix_padding_ms: 300,
          silence_duration_ms: 800
        },
        temperature: 0.8
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ OpenAI error:', response.status, errorText);
      throw new Error(`OpenAI API error: ${response.status} ${errorText}`);
    }

    const data = await response.json();
    console.log('✅ Ephemeral session created successfully with transcription enabled');
    console.log('📋 Session config:', {
      model: data.model,
      voice: data.voice,
      hasTranscription: !!data.input_audio_transcription
    });

    return new Response(JSON.stringify(data), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error("❌ Error:", error);
    return new Response(JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
