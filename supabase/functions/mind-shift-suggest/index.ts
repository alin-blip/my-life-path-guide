// Mind Shift AI suggestions: cognitive/positive/ACT reframes + belief recommendation
import { corsHeaders } from 'npm:@supabase/supabase-js@2/cors';
import { createClient } from 'npm:@supabase/supabase-js@2';

const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');

const extraHeaders = {
  ...corsHeaders,
  'Access-Control-Allow-Headers':
    'authorization, x-client-info, apikey, content-type, x-supabase-client-platform',
};

interface ReqBody {
  emotion?: string;
  intensity?: number;
  situation?: string;
  automatic_thought?: string;
  distortion_slug?: string;
}

async function callAI(messages: any[], schema: any) {
  const tools = [{
    type: 'function',
    function: {
      name: 'return_mind_shift',
      description: 'Return Mind Shift suggestions',
      parameters: schema,
    },
  }];

  for (let attempt = 0; attempt < 3; attempt++) {
    try {
      const res = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${LOVABLE_API_KEY}`,
        },
        body: JSON.stringify({
          model: 'google/gemini-2.5-flash',
          messages,
          tools,
          tool_choice: { type: 'function', function: { name: 'return_mind_shift' } },
        }),
      });

      if (res.status === 429 || res.status === 402) {
        return { error: res.status, message: res.status === 429 ? 'Rate limit' : 'Credite epuizate' };
      }
      if (!res.ok) throw new Error(`AI ${res.status}`);
      const data = await res.json();
      const call = data.choices?.[0]?.message?.tool_calls?.[0];
      if (!call) throw new Error('no tool call');
      return JSON.parse(call.function.arguments);
    } catch (err) {
      if (attempt === 2) throw err;
      await new Promise((r) => setTimeout(r, 500 * Math.pow(2, attempt)));
    }
  }
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: extraHeaders });

  try {
    if (!LOVABLE_API_KEY) throw new Error('LOVABLE_API_KEY missing');

    const body: ReqBody = await req.json();
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_ANON_KEY')!,
      { global: { headers: { Authorization: req.headers.get('Authorization') ?? '' } } }
    );

    const [{ data: beliefs }, { data: distortions }] = await Promise.all([
      supabase.from('mind_shift_beliefs').select('slug, name, short_description, activation_prompt, incantation, emotion_tags').eq('active', true),
      supabase.from('mind_shift_distortions').select('slug, name, short_description').eq('active', true),
    ]);

    const beliefsList = (beliefs ?? []).map((b: any) =>
      `- ${b.slug}: ${b.name} — ${b.short_description}`
    ).join('\n');

    const distortionsList = (distortions ?? []).map((d: any) =>
      `- ${d.slug}: ${d.name}`
    ).join('\n');

    const system = `Ești coach-ul Alin F. Radu din CEO Mind OS. Vorbești direct, empatic, fără teorii. Ajuți antreprenorul să-și transforme un gând distructiv în acțiune.

Ai la dispoziție 10 CREDINȚE FUNDAMENTALE (alege UNA potrivită pentru context):
${beliefsList}

Ai la dispoziție 10 DISTORSIUNI (poți sugera una dacă userul nu a ales):
${distortionsList}

REGULI:
- Limba: română.
- Fără jargon clinic, fără "PRP". Vorbești ca un mentor.
- Reframe-urile sunt scurte (1–2 propoziții), specifice contextului userului.
- Ai grijă să nu validezi pasiv: provoacă blând userul să acționeze.`;

    const userMsg = `Context user:
- Emoție: ${body.emotion ?? 'necunoscut'} (intensitate: ${body.intensity ?? '?'}%)
- Situație: ${body.situation ?? '(neprecizat)'}
- Gând automat: ${body.automatic_thought ?? '(neprecizat)'}
- Distorsiune aleasă: ${body.distortion_slug ?? '(neales — sugerează una)'}

Generează:
1. cognitive_reframe — răspuns rațional la gândul automat
2. positive_reframe — perspectivă constructivă (1 propoziție care începe cu "Și totuși...")
3. act_value — valoarea după care userul ar trebui să acționeze (1–3 cuvinte)
4. suggested_distortion_slug — dacă userul nu a ales, alege cea mai probabilă
5. recommended_belief_slug — credința potrivită pentru azi (din lista de mai sus)
6. personalized_incantation — incantație scurtă, MAJUSCULE, max 2 rânduri, personalizată pe contextul lui`;

    const schema = {
      type: 'object',
      properties: {
        cognitive_reframe: { type: 'string' },
        positive_reframe: { type: 'string' },
        act_value: { type: 'string' },
        suggested_distortion_slug: { type: 'string' },
        recommended_belief_slug: { type: 'string' },
        personalized_incantation: { type: 'string' },
      },
      required: ['cognitive_reframe', 'positive_reframe', 'act_value', 'recommended_belief_slug', 'personalized_incantation'],
      additionalProperties: false,
    };

    const result = await callAI(
      [{ role: 'system', content: system }, { role: 'user', content: userMsg }],
      schema
    );

    return new Response(JSON.stringify(result), {
      headers: { ...extraHeaders, 'Content-Type': 'application/json' },
    });
  } catch (err: any) {
    console.error('mind-shift-suggest error', err);
    return new Response(JSON.stringify({ error: err.message ?? 'unknown' }), {
      status: 500,
      headers: { ...extraHeaders, 'Content-Type': 'application/json' },
    });
  }
});
