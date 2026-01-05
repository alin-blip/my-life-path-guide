import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface WidgetConfig {
  type: 'counter' | 'tracker' | 'goal' | 'checklist' | 'notes';
  layout: 'vertical' | 'horizontal' | 'compact';
  visualization: 'number' | 'progress_bar' | 'list';
  color: 'blue' | 'green' | 'orange' | 'purple' | 'red' | 'yellow' | 'pink' | 'cyan';
  icon: string;
  fields: { name: string; type: string; label: string }[];
  goal?: number;
  unit?: string;
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY is not configured');
    }

    const { description, language = 'ro' } = await req.json();

    if (!description) {
      return new Response(
        JSON.stringify({ error: 'Description is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const systemPrompt = `You are a widget configuration generator. Based on the user's description, create a JSON configuration for a personal tracking widget.

Available widget types:
- counter: For counting things (pages read, glasses of water, etc.)
- tracker: For simple yes/no daily tracking (did exercise, took vitamins)
- goal: For progress toward a numeric goal
- checklist: For a list of items to check off
- notes: For free-form text notes

Available icons: Book, Heart, Target, Clock, Check, Star, Trophy, Flame, Dumbbell, Brain, Coffee, Sun, Moon, Droplet, Apple, Smile

Available colors: blue, green, orange, purple, red, yellow, pink, cyan

Respond ONLY with valid JSON in this exact format:
{
  "name": "Widget name in ${language === 'en' ? 'English' : 'Romanian'}",
  "description": "Short description in ${language === 'en' ? 'English' : 'Romanian'}",
  "config": {
    "type": "counter|tracker|goal|checklist|notes",
    "layout": "vertical",
    "visualization": "number|progress_bar|list",
    "color": "blue|green|orange|purple|red|yellow|pink|cyan",
    "icon": "IconName",
    "fields": [{"name": "field_name", "type": "number|boolean|text", "label": "Field Label"}],
    "goal": optional_number_or_null,
    "unit": "optional_unit_string"
  }
}`;

    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: description },
        ],
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('AI Gateway error:', response.status, errorText);
      throw new Error(`AI Gateway error: ${response.status}`);
    }

    const aiResponse = await response.json();
    const content = aiResponse.choices?.[0]?.message?.content;

    if (!content) {
      throw new Error('Empty response from AI');
    }

    // Parse JSON from response (handle markdown code blocks)
    let jsonStr = content;
    if (content.includes('```')) {
      const match = content.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
      if (match) {
        jsonStr = match[1];
      }
    }

    const parsed = JSON.parse(jsonStr.trim());

    return new Response(
      JSON.stringify({
        name: parsed.name,
        description: parsed.description,
        config: parsed.config,
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error generating widget config:', error);
    return new Response(
      JSON.stringify({ 
        error: 'Failed to generate widget configuration',
        details: error instanceof Error ? error.message : 'Unknown error'
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
