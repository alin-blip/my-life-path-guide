import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { category, visions, strategies, purposes, missionType, language } = await req.json();

    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY is not configured');
    }

    const categoryNames: Record<string, { en: string; ro: string }> = {
      body: { en: 'Body/Health', ro: 'Corp/Sănătate' },
      being: { en: 'Spirit/Being', ro: 'Spirit/Ființă' },
      balance: { en: 'Relationships/Balance', ro: 'Relații/Echilibru' },
      business: { en: 'Business/Career', ro: 'Business/Carieră' }
    };

    const categoryLabel = language === 'ro' 
      ? categoryNames[category]?.ro || category 
      : categoryNames[category]?.en || category;

    const contentSummary = `
VISIONS:
${visions?.length > 0 ? visions.join('\n') : 'No visions defined yet.'}

PURPOSES:
${purposes?.length > 0 ? purposes.join('\n') : 'No purposes defined yet.'}

STRATEGIES:
${strategies?.length > 0 ? strategies.join('\n') : 'No strategies defined yet.'}
`;

    const isAnnual = missionType === 'annual';
    const timeframe = isAnnual 
      ? (language === 'ro' ? 'un an' : 'one year')
      : (language === 'ro' ? 'o lună' : 'one month');

    const systemPrompt = language === 'ro'
      ? `Ești un coach de viață expert care ajută oamenii să-și definească obiective clare și măsurabile.
Analizezi conținutul Life Book-ului utilizatorului și sugerezi obiective ${isAnnual ? 'anuale' : 'lunare'} concrete.
Obiectivele trebuie să fie:
- Specifice și măsurabile
- Realizabile în ${timeframe}
- Aliniate cu viziunile și strategiile utilizatorului
- Formulate la persoana întâi ("Voi...", "Vreau să...")
- Concise dar complete (2-3 propoziții maxim)

Returnează DOAR obiectivul sugerat, fără explicații sau introduceri.`
      : `You are an expert life coach helping people define clear, measurable objectives.
You analyze the user's Life Book content and suggest concrete ${isAnnual ? 'annual' : 'monthly'} objectives.
Objectives must be:
- Specific and measurable
- Achievable within ${timeframe}
- Aligned with the user's visions and strategies
- Written in first person ("I will...", "I want to...")
- Concise but complete (2-3 sentences max)

Return ONLY the suggested objective, without explanations or introductions.`;

    const userPrompt = language === 'ro'
      ? `Pe baza următorului conținut din Life Book pentru categoria "${categoryLabel}", sugerează un obiectiv ${isAnnual ? 'anual' : 'lunar'} concret și motivant:

${contentSummary}

Generează un singur obiectiv ${isAnnual ? 'anual' : 'lunar'} clar și acționabil.`
      : `Based on the following Life Book content for the "${categoryLabel}" category, suggest a concrete and motivating ${isAnnual ? 'annual' : 'monthly'} objective:

${contentSummary}

Generate a single clear and actionable ${isAnnual ? 'annual' : 'monthly'} objective.`;

    console.log('Generating mission suggestion for:', { category, missionType, language });

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
          { role: 'user', content: userPrompt }
        ],
        max_tokens: 500,
        temperature: 0.7
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('AI gateway error:', response.status, errorText);
      
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: 'Rate limit exceeded, please try again later.' }), {
          status: 429,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: 'Payment required, please add credits.' }), {
          status: 402,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      
      throw new Error(`AI gateway error: ${response.status}`);
    }

    const data = await response.json();
    const suggestion = data.choices?.[0]?.message?.content?.trim() || '';

    console.log('Generated suggestion:', suggestion.substring(0, 100) + '...');

    return new Response(JSON.stringify({ suggestion }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error in lifebook-mission-suggest:', error);
    return new Response(JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
