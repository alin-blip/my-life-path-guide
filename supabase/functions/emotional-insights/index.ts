import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

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

    const { userId, action } = await req.json();
    
    // Ensure userId matches authenticated user
    if (userId !== user.id) {
      return new Response(JSON.stringify({ error: 'Forbidden: userId mismatch' }), {
        status: 403,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    console.log(`Processing ${action} for user ${userId}`);

    if (action === 'analyze_patterns') {
      // Fetch recent checkins
      const { data: checkins, error: checkinsError } = await supabaseClient
        .from('emotional_checkins')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(50);

      if (checkinsError) throw checkinsError;

      if (!checkins || checkins.length < 5) {
        return new Response(
          JSON.stringify({ message: 'Not enough data for pattern analysis', patterns: [] }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      // Analyze patterns locally first
      const patterns = analyzeLocalPatterns(checkins);
      
      // Use Lovable AI for deeper insights
      const aiInsights = await generateAIInsights(checkins, patterns);

      // Save detected patterns
      for (const pattern of patterns) {
        const { data: existing } = await supabaseClient
          .from('emotional_patterns')
          .select('id, frequency')
          .eq('user_id', userId)
          .eq('pattern_type', pattern.type)
          .eq('description', pattern.description)
          .single();

        if (existing) {
          await supabaseClient
            .from('emotional_patterns')
            .update({
              frequency: existing.frequency + 1,
              last_detected: new Date().toISOString(),
              ai_insight: pattern.insight || aiInsights,
            })
            .eq('id', existing.id);
        } else {
          await supabaseClient
            .from('emotional_patterns')
            .insert({
              user_id: userId,
              pattern_type: pattern.type,
              description: pattern.description,
              ai_insight: pattern.insight || aiInsights,
              frequency: 1,
            });
        }
      }

      console.log(`Found ${patterns.length} patterns`);
      return new Response(
        JSON.stringify({ patterns, insights: aiInsights }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (action === 'weekly_report') {
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);

      const { data: checkins, error } = await supabaseClient
        .from('emotional_checkins')
        .select('*')
        .eq('user_id', userId)
        .gte('created_at', weekAgo.toISOString())
        .order('created_at', { ascending: true });

      if (error) throw error;

      if (!checkins || checkins.length === 0) {
        return new Response(
          JSON.stringify({ insights: 'Nu există suficiente date pentru a genera un raport.' }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      const insights = await generateWeeklyReport(checkins);

      return new Response(
        JSON.stringify({ insights }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    return new Response(
      JSON.stringify({ error: 'Unknown action' }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error: unknown) {
    console.error('Error:', error);
    const message = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({ error: message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

interface Checkin {
  emotion: string;
  intensity: number;
  energy_level: number;
  trigger: string | null;
  reaction: string | null;
  result: string | null;
  created_at: string;
}

interface Pattern {
  type: string;
  description: string;
  insight?: string;
}

function analyzeLocalPatterns(checkins: Checkin[]): Pattern[] {
  const patterns: Pattern[] = [];

  // Analyze emotion frequency
  const emotionCounts: Record<string, number> = {};
  checkins.forEach(c => {
    emotionCounts[c.emotion] = (emotionCounts[c.emotion] || 0) + 1;
  });

  const dominantEmotion = Object.entries(emotionCounts)
    .sort((a, b) => b[1] - a[1])[0];

  if (dominantEmotion && dominantEmotion[1] / checkins.length > 0.4) {
    patterns.push({
      type: 'emotional_cycle',
      description: `Emoția dominantă: ${getEmotionLabel(dominantEmotion[0])} (${Math.round(dominantEmotion[1] / checkins.length * 100)}% din timp)`,
    });
  }

  // Analyze triggers
  const triggerCounts: Record<string, number> = {};
  checkins.forEach(c => {
    if (c.trigger) {
      const normalizedTrigger = c.trigger.toLowerCase().trim();
      triggerCounts[normalizedTrigger] = (triggerCounts[normalizedTrigger] || 0) + 1;
    }
  });

  const recurringTriggers = Object.entries(triggerCounts)
    .filter(([_, count]) => count >= 3)
    .sort((a, b) => b[1] - a[1]);

  recurringTriggers.forEach(([trigger, count]) => {
    patterns.push({
      type: 'recurring_trigger',
      description: `Trigger recurent: "${trigger}" (de ${count} ori)`,
    });
  });

  // Analyze energy patterns by day of week
  const energyByDay: Record<number, number[]> = {};
  checkins.forEach(c => {
    const day = new Date(c.created_at).getDay();
    if (!energyByDay[day]) energyByDay[day] = [];
    energyByDay[day].push(c.energy_level);
  });

  const avgEnergyByDay = Object.entries(energyByDay).map(([day, energies]) => ({
    day: parseInt(day),
    avg: energies.reduce((a, b) => a + b, 0) / energies.length,
  }));

  const lowestEnergyDay = avgEnergyByDay.sort((a, b) => a.avg - b.avg)[0];
  if (lowestEnergyDay && lowestEnergyDay.avg < 4) {
    patterns.push({
      type: 'energy_pattern',
      description: `Energie scăzută în zilele de ${getDayName(lowestEnergyDay.day)} (medie: ${lowestEnergyDay.avg.toFixed(1)}/10)`,
    });
  }

  return patterns;
}

function getEmotionLabel(emotion: string): string {
  const labels: Record<string, string> = {
    happy: 'Fericit',
    sad: 'Trist',
    anxious: 'Anxios',
    angry: 'Supărat',
    calm: 'Calm',
    stressed: 'Stresat',
    excited: 'Entuziasmat',
    neutral: 'Neutru',
  };
  return labels[emotion] || emotion;
}

function getDayName(day: number): string {
  const days = ['Duminică', 'Luni', 'Marți', 'Miercuri', 'Joi', 'Vineri', 'Sâmbătă'];
  return days[day];
}

async function generateAIInsights(checkins: Checkin[], patterns: Pattern[]): Promise<string> {
  // Create a summary for AI analysis
  const emotionSummary = checkins.reduce((acc, c) => {
    acc[c.emotion] = (acc[c.emotion] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const avgIntensity = checkins.reduce((sum, c) => sum + c.intensity, 0) / checkins.length;
  const avgEnergy = checkins.reduce((sum, c) => sum + c.energy_level, 0) / checkins.length;

  const triggers = checkins
    .filter(c => c.trigger)
    .map(c => c.trigger)
    .slice(0, 10);

  const prompt = `Analizează aceste date emoționale și oferă 2-3 insight-uri practice:

Emoții înregistrate: ${JSON.stringify(emotionSummary)}
Intensitate medie: ${avgIntensity.toFixed(1)}/10
Energie medie: ${avgEnergy.toFixed(1)}/10
Trigger-uri frecvente: ${triggers.join(', ') || 'nespecificate'}
Pattern-uri detectate: ${patterns.map(p => p.description).join('; ') || 'niciun pattern major'}

Oferă insight-uri scurte, practice și acționabile în română.`;

  try {
    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${Deno.env.get('LOVABLE_API_KEY')}`,
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          {
            role: 'system',
            content: 'Ești un psiholog specializat în inteligență emoțională. Oferă insight-uri practice și empatice bazate pe datele emoționale. Răspunde în română, concis (max 200 cuvinte).',
          },
          { role: 'user', content: prompt },
        ],
        max_tokens: 500,
      }),
    });

    if (!response.ok) {
      console.error('AI API error:', await response.text());
      return 'Continuă să îți urmărești emoțiile pentru insight-uri mai detaliate.';
    }

    const data = await response.json();
    return data.choices?.[0]?.message?.content || 'Continuă să îți urmărești emoțiile pentru insight-uri mai detaliate.';
  } catch (error) {
    console.error('Error calling AI:', error);
    return 'Continuă să îți urmărești emoțiile pentru insight-uri mai detaliate.';
  }
}

async function generateWeeklyReport(checkins: Checkin[]): Promise<string> {
  const emotionSummary = checkins.reduce((acc, c) => {
    acc[c.emotion] = (acc[c.emotion] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const avgIntensity = checkins.reduce((sum, c) => sum + c.intensity, 0) / checkins.length;
  const avgEnergy = checkins.reduce((sum, c) => sum + c.energy_level, 0) / checkins.length;

  const triggers = checkins.filter(c => c.trigger).map(c => c.trigger);
  const reactions = checkins.filter(c => c.reaction).map(c => c.reaction);

  const prompt = `Generează un raport săptămânal empatic bazat pe aceste date:

Check-in-uri totale: ${checkins.length}
Emoții: ${Object.entries(emotionSummary).map(([e, c]) => `${getEmotionLabel(e)}: ${c}`).join(', ')}
Intensitate medie: ${avgIntensity.toFixed(1)}/10
Energie medie: ${avgEnergy.toFixed(1)}/10
Trigger-uri menționate: ${triggers.slice(0, 5).join(', ') || 'niciuna'}
Reacții: ${reactions.slice(0, 5).join(', ') || 'niciuna'}

Oferă:
1. O observație despre starea emoțională generală
2. Ce a mers bine
3. Un aspect de îmbunătățit
4. O recomandare practică pentru săptămâna viitoare

Răspunde în română, empatic și încurajator.`;

  try {
    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${Deno.env.get('LOVABLE_API_KEY')}`,
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          {
            role: 'system',
            content: 'Ești un coach de inteligență emoțională empatic și suportiv. Oferi rapoarte săptămânale care celebrează progresul și oferă direcție clară. Răspunde în română.',
          },
          { role: 'user', content: prompt },
        ],
        max_tokens: 600,
      }),
    });

    if (!response.ok) {
      console.error('AI API error:', await response.text());
      return 'Săptămâna aceasta ai făcut progrese în conștientizarea emoțiilor tale. Continuă să îți urmărești stările pentru insight-uri mai detaliate!';
    }

    const data = await response.json();
    return data.choices?.[0]?.message?.content || 'Săptămâna aceasta ai făcut progrese în conștientizarea emoțiilor tale. Continuă să îți urmărești stările pentru insight-uri mai detaliate!';
  } catch (error) {
    console.error('Error calling AI:', error);
    return 'Săptămâna aceasta ai făcut progrese în conștientizarea emoțiilor tale. Continuă să îți urmărești stările pentru insight-uri mai detaliate!';
  }
}
