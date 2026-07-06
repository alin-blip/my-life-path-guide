// Task Coach Wizard: reframe mental + breakdown task în micro-acțiuni
import { corsHeaders } from 'npm:@supabase/supabase-js@2/cors';
import { requireUser, unauthorized } from '../_shared/auth.ts';

const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');

const extraHeaders = {
  ...corsHeaders,
  'Access-Control-Allow-Headers':
    'authorization, x-client-info, apikey, content-type, x-supabase-client-platform',
};

interface ReqBody {
  taskTitle?: string;
  blocker?: string;
  language?: 'ro' | 'en';
}

async function callAI(messages: any[], schema: any) {
  const tools = [{
    type: 'function',
    function: {
      name: 'return_task_breakdown',
      description: 'Return reframe + micro-tasks for a stuck task',
      parameters: schema,
    },
  }];

  let lastErr: any;
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
          tool_choice: { type: 'function', function: { name: 'return_task_breakdown' } },
        }),
      });

      if (res.status === 429 || res.status === 402) {
        return { __error: res.status, message: res.status === 429 ? 'Rate limit — încearcă din nou în câteva secunde.' : 'Credite epuizate. Adaugă credite din Settings.' };
      }
      if (!res.ok) throw new Error(`AI ${res.status}`);
      const data = await res.json();
      const call = data.choices?.[0]?.message?.tool_calls?.[0];
      if (!call) throw new Error('no tool call');
      return JSON.parse(call.function.arguments);
    } catch (err) {
      lastErr = err;
      if (attempt === 2) throw err;
      await new Promise((r) => setTimeout(r, 500 * Math.pow(2, attempt)));
    }
  }
  throw lastErr;
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: extraHeaders });

  try {
    const { user } = await requireUser(req);
    if (!user) return unauthorized();

    if (!LOVABLE_API_KEY) throw new Error('LOVABLE_API_KEY missing');
    const body: ReqBody = await req.json();
    const lang = body.language === 'en' ? 'en' : 'ro';

    const system = lang === 'ro'
      ? `Ești coach-ul Alin F. Radu din CEO Mind OS. Vorbești direct, empatic, fără teorii.
Misiunea ta: ajuți antreprenorul să deblocheze UN task pe care îl evită sau i se pare prea mare.

REGULI:
- Limba: română. Vorbire la persoana a 2-a ("tu poți", "uite cum facem").
- Validează emoția FĂRĂ să o amplifici, apoi reframe scurt (1-2 propoziții).
- Reframe-ul transformă "trebuie / e greu / nu pot" în "aleg / e simplu dacă / următorul pas e".
- Breakdown: 3-5 micro-acțiuni concrete, fiecare maxim 15 minute, în ordine logică.
- Primul pas trebuie să fie sub 2 minute — atât de mic încât userul NU poate refuza.
- Fără jargon. Fără bullet points în text. Direct, ca un prieten care te scoate din blocaj.`
      : `You are coach Alin F. Radu from CEO Mind OS. Direct, empathetic, no theory.
Mission: help the entrepreneur unblock ONE task they're avoiding or that feels too big.

RULES:
- English. Second person ("you can", "here's how").
- Validate the emotion WITHOUT amplifying, then reframe in 1-2 sentences.
- Reframe turns "must / hard / can't" into "I choose / easy if / next step is".
- Breakdown: 3-5 concrete micro-actions, each max 15 minutes, logical order.
- First step must be under 2 minutes — so small it can't be refused.
- No jargon, no bullets in prose. Direct, like a friend pulling you out of a rut.`;

    const userMsg = lang === 'ro'
      ? `Task blocat: "${body.taskTitle ?? '(neprecizat)'}"
Ce mă oprește: ${body.blocker?.trim() || '(userul nu a spus — deduce din titlu)'}

Generează:
1. validation — 1 propoziție care recunoaște ce simte (fără a-l plânge)
2. reframe — 1-2 propoziții care schimbă perspectiva
3. micro_tasks — 3-5 micro-acțiuni concrete (fiecare propoziție scurtă, verb la imperativ, max 15 min)
4. first_step — UN singur pas sub 2 minute pe care îl poate face ACUM
5. encouragement — 1 propoziție scurtă de impuls final`
      : `Stuck task: "${body.taskTitle ?? '(unspecified)'}"
What stops me: ${body.blocker?.trim() || '(user did not say — infer from title)'}

Generate:
1. validation — 1 sentence acknowledging the feeling (no pity)
2. reframe — 1-2 sentences that shift perspective
3. micro_tasks — 3-5 concrete micro-actions (short imperative sentences, max 15 min each)
4. first_step — ONE step under 2 minutes they can do NOW
5. encouragement — 1 short closing push`;

    const schema = {
      type: 'object',
      properties: {
        validation: { type: 'string' },
        reframe: { type: 'string' },
        micro_tasks: { type: 'array', items: { type: 'string' }, minItems: 3, maxItems: 5 },
        first_step: { type: 'string' },
        encouragement: { type: 'string' },
      },
      required: ['validation', 'reframe', 'micro_tasks', 'first_step', 'encouragement'],
      additionalProperties: false,
    };

    const result = await callAI(
      [{ role: 'system', content: system }, { role: 'user', content: userMsg }],
      schema
    );

    if ((result as any).__error) {
      return new Response(JSON.stringify({ error: (result as any).message }), {
        status: (result as any).__error,
        headers: { ...extraHeaders, 'Content-Type': 'application/json' },
      });
    }

    return new Response(JSON.stringify(result), {
      headers: { ...extraHeaders, 'Content-Type': 'application/json' },
    });
  } catch (err: any) {
    console.error('task-coach-breakdown error', err);
    return new Response(JSON.stringify({ error: err.message ?? 'unknown' }), {
      status: 500,
      headers: { ...extraHeaders, 'Content-Type': 'application/json' },
    });
  }
});
