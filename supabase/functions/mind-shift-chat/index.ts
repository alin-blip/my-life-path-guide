// Conversational Mind Shift coach — per-step responses in Alin's voice
import { corsHeaders } from 'npm:@supabase/supabase-js@2/cors';
import { createClient } from 'npm:@supabase/supabase-js@2';

const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');

const extraHeaders = {
  ...corsHeaders,
  'Access-Control-Allow-Headers':
    'authorization, x-client-info, apikey, content-type, x-supabase-client-platform',
};

type StepKey =
  | 'thought' | 'category' | 'recurrence' | 'situation'
  | 'distortion' | 'reframe' | 'activate' | 'commit';

interface ReqBody {
  sessionId?: string;
  stepKey: StepKey;
  userMessage?: string;
  sessionContext?: Record<string, any>;
}

async function callAI(messages: any[], schema: any, toolName = 'return_step'): Promise<any> {
  const tools = [{
    type: 'function',
    function: {
      name: toolName,
      description: 'Return coach response for this Mind Shift step',
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
          tool_choice: { type: 'function', function: { name: toolName } },
        }),
      });
      if (res.status === 429) return { error: 'rate_limit', message: 'Prea multe cereri. Reia într-un minut.' };
      if (res.status === 402) return { error: 'credits', message: 'Credite AI epuizate.' };
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

const ALIN_SYSTEM = `Ești coach-ul Alin F. Radu din CEO Mind OS. Vorbești direct, cald, fără jargon clinic.
- Limba: română.
- Validezi mereu emoția înainte de soluție.
- MAX 1-2 propoziții per mesaj — ești în chat, nu predici.
- Nu spui "PRP", nu citezi cărți. Vorbești ca un mentor care a trecut prin foc.
- Provoci blând userul să acționeze, nu îl lași în confort.`;

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

    const ctx = body.sessionContext ?? {};
    const stepKey = body.stepKey;

    // Load reference libraries when needed
    let beliefsList = '';
    let distortionsList = '';
    let categoriesList = '';
    if (stepKey === 'distortion' || stepKey === 'reframe' || stepKey === 'activate') {
      const [{ data: beliefs }, { data: distortions }] = await Promise.all([
        supabase.from('mind_shift_beliefs').select('slug,name,short_description,incantation').eq('active', true),
        supabase.from('mind_shift_distortions').select('slug,name,short_description').eq('active', true),
      ]);
      beliefsList = (beliefs ?? []).map((b: any) => `- ${b.slug}: ${b.name} — ${b.short_description}`).join('\n');
      distortionsList = (distortions ?? []).map((d: any) => `- ${d.slug}: ${d.name} — ${d.short_description}`).join('\n');
    }
    if (stepKey === 'category') {
      const { data: cats } = await supabase.from('mind_shift_categories').select('slug,name').eq('active', true);
      categoriesList = (cats ?? []).map((c: any) => `- ${c.slug}: ${c.name}`).join('\n');
    }

    const contextBlock = `CONTEXT SESIUNE:
- Gând: ${ctx.automatic_thought ?? '(necunoscut)'}
- Categorie: ${ctx.category ?? '(neales)'}
- Recurență: ${ctx.recurrence ?? '(necunoscut)'}
- Emoție: ${ctx.emotion ?? '(necunoscut)'} (intensitate ${ctx.intensity_before ?? ctx.intensity ?? '?'})
- Situație: ${ctx.situation ?? '(neprecizat)'}
- Distorsiune: ${ctx.distortion_slug ?? '(neales)'}`;

    let userPrompt = '';
    let schema: any = { type: 'object', properties: { message: { type: 'string' } }, required: ['message'], additionalProperties: false };

    switch (stepKey) {
      case 'thought':
        userPrompt = `Userul a scris gândul: "${body.userMessage ?? ctx.automatic_thought ?? ''}".
Răspunde: validează ce a scris (1 propoziție) + cere-i să aleagă o CATEGORIE din lista de mai jos.
Categorii disponibile (vor apărea ca butoane în UI — nu le enumera complet):
${categoriesList || 'bani, sanatate, relatii, cariera, sine, misiune, timp, spirit'}`;
        break;

      case 'category':
        userPrompt = `${contextBlock}
Userul a ales categoria: ${body.userMessage}.
Răspunde scurt: confirmă categoria + întreabă cât de des îi vine acest gând (zilnic=Z, săptămânal=S, lunar=L).`;
        break;

      case 'recurrence': {
        const recurrence = (body.userMessage ?? '').toUpperCase();
        const warning = recurrence === 'Z' ? '\n⚠️ ATENȚIE: User raportează că gândul vine ZILNIC. Marchează acest pattern ca probabilă credință limitativă centrală. Fii direct: "Asta nu mai e un gând întâmplător, e un sistem. Hai să-l demontăm."' : '';
        userPrompt = `${contextBlock}
Userul a marcat recurența: ${recurrence}.${warning}
Răspunde scurt + cere-i să descrie SITUAȚIA în care apare gândul și EMOȚIA dominantă (frică, furie, tristețe, rușine, etc.) cu intensitate 0-100.`;
        break;
      }

      case 'situation':
        userPrompt = `${contextBlock}
Userul a descris situația/emoția: "${body.userMessage}".
Răspunde: validează emoția (1 propoziție specifică) + introdu pasul următor — identificarea DISTORSIUNII cognitive.
Sugerează 1-2 distorsiuni probabile din lista (poți menționa slug-ul). Lista:
${distortionsList}`;
        schema = {
          type: 'object',
          properties: {
            message: { type: 'string' },
            suggested_distortion_slugs: { type: 'array', items: { type: 'string' } },
          },
          required: ['message'],
          additionalProperties: false,
        };
        break;

      case 'distortion':
        userPrompt = `${contextBlock}
Userul a ales distorsiunea: ${body.userMessage}.
Generează acum REFRAME-ul triplu pentru gândul "${ctx.automatic_thought}":
1. cognitive_reframe — răspuns rațional, scurt
2. positive_reframe — perspectivă constructivă (începe cu "Și totuși...")
3. act_value — valoarea după care să acționeze (1-3 cuvinte: curaj, integritate, etc.)
Plus un mesaj scurt de tranziție (1-2 propoziții).`;
        schema = {
          type: 'object',
          properties: {
            message: { type: 'string' },
            cognitive_reframe: { type: 'string' },
            positive_reframe: { type: 'string' },
            act_value: { type: 'string' },
          },
          required: ['message', 'cognitive_reframe', 'positive_reframe', 'act_value'],
          additionalProperties: false,
        };
        break;

      case 'reframe':
        userPrompt = `${contextBlock}
Userul a confirmat reframe-ul. Acum recomandă CREDINȚA potrivită din lista (alege UNA, returnează slug-ul) + scrie o INCANTAȚIE personalizată (MAJUSCULE, max 2 rânduri).
Lista credințe:
${beliefsList}
Plus un mesaj scurt (1-2 propoziții) de tranziție către "Activate".`;
        schema = {
          type: 'object',
          properties: {
            message: { type: 'string' },
            belief_slug: { type: 'string' },
            incantation: { type: 'string' },
          },
          required: ['message', 'belief_slug', 'incantation'],
          additionalProperties: false,
        };
        break;

      case 'activate':
        userPrompt = `${contextBlock}
Credința aleasă: ${ctx.belief_slug}.
Mesaj scurt + cere-i să-și ia un ANGAJAMENT — o singură acțiune concretă, în următoarele 24h, care întruchipează credința/valoarea aleasă. Provoacă-l să fie specific (nu "voi fi mai bun", ci "sun X la 10:00").`;
        break;

      case 'commit':
        userPrompt = `${contextBlock}
Userul s-a angajat la: "${body.userMessage}".
Răspunde: confirmă angajamentul + cere-i să re-evalueze INTENSITATEA emoției (0-100) acum, după proces. Spune-i că acțiunea va apărea în Door pentru azi.`;
        break;

      default:
        userPrompt = `Continuă conversația. ${contextBlock}\nUserul a spus: "${body.userMessage}".`;
    }

    const result = await callAI(
      [{ role: 'system', content: ALIN_SYSTEM }, { role: 'user', content: userPrompt }],
      schema
    );

    return new Response(JSON.stringify(result), {
      headers: { ...extraHeaders, 'Content-Type': 'application/json' },
    });
  } catch (err: any) {
    console.error('mind-shift-chat error', err);
    return new Response(JSON.stringify({ error: err.message ?? 'unknown' }), {
      status: 500,
      headers: { ...extraHeaders, 'Content-Type': 'application/json' },
    });
  }
});
