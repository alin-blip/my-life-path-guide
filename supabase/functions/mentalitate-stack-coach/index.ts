// Mentalitate Stack Coach — Reconstrucția Mentală (Blueprint Mental în 5 Faze, 14 întrebări)
// Phase 1 Conștientizare (Q1-3) · Phase 2 Expunere (Q4-5) · Phase 3 Dialog Socratic (Q6-10)
// Phase 4 Scala Asumării (Q11-12) · Phase 5 Reîncadrare & Acțiune (Q13-14)
import { corsHeaders } from 'npm:@supabase/supabase-js@2/cors';
import { createClient } from 'npm:@supabase/supabase-js@2';
import { loadMinteContext } from '../_shared/mind-context.ts';

const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');

const extraHeaders = {
  ...corsHeaders,
  'Access-Control-Allow-Headers':
    'authorization, x-client-info, apikey, content-type, x-supabase-client-platform',
};

type Mode = 'daily' | 'deep_dive';

interface ReqBody {
  step: 'reflect' | 'finalize' | 'suggest_distortions' | 'suggest_answers';
  mode: Mode;
  deep_dive_axis?: string;
  phase_answers: Record<string, string>;
  current_question_index?: number;
  target_question_index?: number;
}

const DISTORTION_OPTIONS = [
  'Catastrofizare',
  'Gândire alb-negru',
  'Generalizare excesivă',
  'Citirea minții',
  'Personalizare',
  'Etichetare',
  'Filtrare mentală',
  'Raționament emoțional',
  '„Ar trebui"',
  'Minimalizarea pozitivului',
];

const AXIS_LABEL: Record<string, string> = {
  cognitiva: 'Cognitivă (Centrul de Comandă)',
  emotionala: 'Emoțională (Sistemul de Reacție)',
  afectiva: 'Afectivă (Siguranța Relațională)',
  volitiva: 'Volitivă (Motorul)',
  comportamentala: 'Comportamentală (Punctul de Descărcare)',
  profesionala: 'Profesională (Rezultatul)',
};

const QUESTIONS: { idx: number; phase: number; text: string; purpose: string }[] = [
  { idx: 1, phase: 1, text: 'Care sunt faptele verificabile, fără interpretare?', purpose: 'Separă realitatea obiectivă de povestea minții.' },
  { idx: 2, phase: 1, text: 'Ce e nou aici și ce reactivează ceva din trecut?', purpose: 'Identifică partea de proiecție din trecut.' },
  { idx: 3, phase: 1, text: 'Ce emoție îți distorsionează acum percepția?', purpose: 'Numește emoția dominantă pentru a o regla.' },
  { idx: 4, phase: 2, text: 'Care este gândul automat care a apărut imediat?', purpose: 'Expune gândul rapid, nefiltrat.' },
  { idx: 5, phase: 2, text: 'Ce tip de distorsiune cognitivă pare să fie? (catastrofizare, gândire alb-negru, generalizare, citirea minții, personalizare, etichetare etc.)', purpose: 'Etichetează distorsiunea pentru a o slăbi.' },
  { idx: 6, phase: 3, text: 'Care sunt dovezile reale CARE SUSȚIN gândul?', purpose: 'Forțează rigoare — date concrete pro.' },
  { idx: 7, phase: 3, text: 'Care sunt dovezile reale CARE CONTRAZIC gândul?', purpose: 'Adu echilibrul cu date concrete contra.' },
  { idx: 8, phase: 3, text: 'Ce altă interpretare, la fel de plauzibilă, există?', purpose: 'Spargem rigiditatea — alternative.' },
  { idx: 9, phase: 3, text: 'Este o greșeală izolată sau ține de identitatea ta? De ce?', purpose: 'Separă comportamentul de identitate.' },
  { idx: 10, phase: 3, text: 'Care e verdictul proporțional cu faptele (nu cu emoția)?', purpose: 'Sinteză rațională.' },
  { idx: 11, phase: 4, text: 'Pe o scală de la 0 la 10, cât din situație îți aparține TIE? (doar numărul)', purpose: 'Scala asumării — partea ta.' },
  { idx: 12, phase: 4, text: 'Ce ai controlat efectiv și ce a ținut de alții/context?', purpose: 'Granițe sănătoase între control propriu și extern.' },
  { idx: 13, phase: 5, text: 'Care e gândul alternativ, realist, ancorat în fapte și echilibrat?', purpose: 'Reîncadrare — nu motivațional fals, ci real.' },
  { idx: 14, phase: 5, text: 'Care este planul concret de acțiune pentru partea TA de responsabilitate?', purpose: 'Acțiune imediată → Domino Door.' },
];

async function callAI(messages: any[], opts?: { tool?: any }) {
  const body: any = {
    model: 'google/gemini-2.5-flash',
    messages,
  };
  if (opts?.tool) {
    body.tools = [opts.tool];
    body.tool_choice = { type: 'function', function: { name: opts.tool.function.name } };
  }
  for (let attempt = 0; attempt < 3; attempt++) {
    try {
      const res = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${LOVABLE_API_KEY}`,
        },
        body: JSON.stringify(body),
      });
      if (res.status === 429 || res.status === 402) {
        throw new Error(res.status === 429 ? 'rate_limit' : 'credits_exhausted');
      }
      if (!res.ok) throw new Error(`AI ${res.status}`);
      return await res.json();
    } catch (err) {
      if (attempt === 2) throw err;
      await new Promise((r) => setTimeout(r, 500 * Math.pow(2, attempt)));
    }
  }
}

function buildSystem(mode: Mode, deepDiveAxis: string | undefined, minteBlock: string): string {
  const focus = mode === 'deep_dive' && deepDiveAxis
    ? `Acest sesion e un DEEP-DIVE pe axa ${AXIS_LABEL[deepDiveAxis] ?? deepDiveAxis}. Concentrează validările și reflecțiile pe această axă.`
    : 'Acest sesion este unul ZILNIC complet — Blueprint Mental în 5 faze, 14 întrebări.';

  return `Ești Alin F. Radu — coach transformațional din CEO Mind OS. Vorbești direct, empatic, fără jargon clinic. NU folosești termenii «PRP» sau «cognitive-behavioral therapy».

${focus}

CADRUL pe care îl ghidezi (5 faze, 14 întrebări):
- Faza 1 Conștientizare (Q1-3): oprește gândirea impulsivă, ancorează în prezent
- Faza 2 Expunere (Q4-5): identifică gândul automat + distorsiunea
- Faza 3 Dialog Socratic (Q6-10): provoacă convingerile rigide cu dovezi
- Faza 4 Scala Asumării (Q11-12): echilibrează vina și controlul
- Faza 5 Reîncadrare & Acțiune (Q13-14): gând nou realist + acțiune concretă

REGULI DE RĂSPUNS:
- Limba: română.
- Tonul: cald, direct, fără să validezi pasiv.
- Maxim 2 propoziții de validare + 1 propoziție de orientare către următoarea întrebare.
- NU repeta întrebarea formală — o livrează deja UI-ul.
- Reframe-ul final (Q13) trebuie să fie REALIST, nu «motivațional fals pozitiv».
${minteBlock}`;
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

    const { data: userData } = await supabase.auth.getUser();
    const userId = userData?.user?.id;
    if (!userId) {
      return new Response(JSON.stringify({ error: 'unauthorized' }), {
        status: 401,
        headers: { ...extraHeaders, 'Content-Type': 'application/json' },
      });
    }

    const minte = await loadMinteContext(supabase, userId).catch(() => ({ promptBlock: '' }));
    const system = buildSystem(body.mode, body.deep_dive_axis, minte.promptBlock ?? '');

    const situation = (body.phase_answers as any)?.situation
      ?? (body.phase_answers as any)?.q0
      ?? '';
    const situationBlock = situation
      ? `CONTEXTUL situației descris de user la început:\n«${situation}»\n\n`
      : '';

    const answersBlock = QUESTIONS
      .filter((q) => body.phase_answers[`q${q.idx}`])
      .map((q) => `Q${q.idx} (${q.purpose}) — ${body.phase_answers[`q${q.idx}`]}`)
      .join('\n');

    // ---- STEP: reflect (between questions) ----
    if (body.step === 'reflect') {
      const idx = body.current_question_index ?? 1;
      const next = QUESTIONS.find((q) => q.idx === idx + 1);
      const userMsg = `${situationBlock}Răspunsurile userului până acum:
${answersBlock || '(nimic încă)'}

A răspuns la Q${idx}. Următoarea întrebare este Q${idx + 1}: «${next?.text ?? 'finalizare'}».

Răspunde cu maxim 2 propoziții de validare empatică pe ce a spus la Q${idx}, ancorate în contextul situației lui. Nu repeta întrebarea următoare.`;

      const data = await callAI([
        { role: 'system', content: system },
        { role: 'user', content: userMsg },
      ]);
      const reflection = data?.choices?.[0]?.message?.content?.trim() ?? '';
      return new Response(JSON.stringify({ reflection }), {
        headers: { ...extraHeaders, 'Content-Type': 'application/json' },
      });
    }

    // ---- STEP: suggest_distortions (before Q5) ----
    if (body.step === 'suggest_distortions') {
      const suggestTool = {
        type: 'function',
        function: {
          name: 'return_distortion_suggestions',
          description: 'Returnează 2-3 distorsiuni cognitive cele mai probabile pe baza răspunsurilor.',
          parameters: {
            type: 'object',
            properties: {
              suggestions: {
                type: 'array',
                minItems: 2,
                maxItems: 3,
                items: {
                  type: 'object',
                  properties: {
                    label: { type: 'string', enum: DISTORTION_OPTIONS, description: 'Numele distorsiunii.' },
                    why: { type: 'string', description: 'Motiv scurt (max 12 cuvinte), de ce pare a fi asta.' },
                  },
                  required: ['label', 'why'],
                  additionalProperties: false,
                },
              },
            },
            required: ['suggestions'],
            additionalProperties: false,
          },
        },
      };

      const sUserMsg = `Răspunsurile userului până acum (Q1-Q4):
${answersBlock || '(nimic)'}

Pe baza acestor răspunsuri (în special gândul automat de la Q4 + emoția de la Q3 + faptele de la Q1), alege 2-3 distorsiuni cognitive cele mai probabile din lista: ${DISTORTION_OPTIONS.join(', ')}.
Returnează ordonat de la cea mai probabilă. Pentru fiecare, scrie un motiv scurt și concret (NU generic), legat de ce a spus userul.`;

      const data = await callAI(
        [{ role: 'system', content: system }, { role: 'user', content: sUserMsg }],
        { tool: suggestTool }
      );
      const call = data?.choices?.[0]?.message?.tool_calls?.[0];
      if (!call) throw new Error('no tool call in suggest_distortions');
      const result = JSON.parse(call.function.arguments);
      return new Response(JSON.stringify(result), {
        headers: { ...extraHeaders, 'Content-Type': 'application/json' },
      });
    }

    // ---- STEP: suggest_answers (quick-button suggestions for any question) ----
    if (body.step === 'suggest_answers') {
      const targetIdx = body.target_question_index ?? 1;
      const target = QUESTIONS.find((q) => q.idx === targetIdx);
      if (!target) throw new Error('invalid target_question_index');

      const isNumber = targetIdx === 11;
      const suggestAnswersTool = {
        type: 'function',
        function: {
          name: 'return_answer_suggestions',
          description: 'Returnează 3 sugestii scurte de răspuns posibil pentru întrebarea curentă, personalizate pe contextul userului.',
          parameters: {
            type: 'object',
            properties: {
              suggestions: {
                type: 'array',
                minItems: 2,
                maxItems: 3,
                items: {
                  type: 'object',
                  properties: {
                    label: { type: 'string', description: isNumber ? 'Un număr de la 0 la 10 ca string (ex: "4").' : 'Sugestie scurtă de răspuns (max 16 cuvinte), formulată la persoana I, ancorată în context.' },
                    hint: { type: 'string', description: 'Sub-text scurt (max 10 cuvinte) care explică unghiul sugestiei.' },
                  },
                  required: ['label', 'hint'],
                  additionalProperties: false,
                },
              },
            },
            required: ['suggestions'],
            additionalProperties: false,
          },
        },
      };

      const aUserMsg = `Răspunsurile userului până acum:
${answersBlock || '(încă nu a răspuns nimic — fă sugestii generice pe baza tipului de întrebare)'}

Întrebarea curentă (Q${targetIdx}, ${target.purpose}): «${target.text}»

Generează 3 sugestii ${isNumber ? 'numerice (0-10) plauzibile pe baza contextului' : 'scurte (max 16 cuvinte), formulate la persoana I'}, DIFERITE între ele ca unghi/perspectivă, ancorate în CE A SPUS userul până acum (nu generice). Folosește vocabularul lui.
NU pune ghilimele în jurul sugestiilor. Fără preamble. Fiecare sugestie trebuie să fie copy-paste-abilă direct în răspuns.`;

      const data = await callAI(
        [{ role: 'system', content: system }, { role: 'user', content: aUserMsg }],
        { tool: suggestAnswersTool }
      );
      const call = data?.choices?.[0]?.message?.tool_calls?.[0];
      if (!call) throw new Error('no tool call in suggest_answers');
      const result = JSON.parse(call.function.arguments);
      return new Response(JSON.stringify(result), {
        headers: { ...extraHeaders, 'Content-Type': 'application/json' },
      });
    }

    // ---- STEP: finalize (after Q14) ----
    // Simplified schema (no enums on axes, no integer bounds) to avoid Gemini
    // constrained-decoding refusals. We validate/clamp on the server below.
    const finalizeTool = {
      type: 'function',
      function: {
        name: 'return_blueprint_synthesis',
        description: 'Sinteza finală a reconstrucției mentale',
        parameters: {
          type: 'object',
          properties: {
            reframe: { type: 'string', description: 'Gândul nou realist, ancorat în fapte (max 2 propoziții).' },
            action: { type: 'string', description: 'Acțiune concretă, executabilă azi sau mâine, max 1 propoziție.' },
            distortion_detected: { type: 'string', description: 'Tipul principal de distorsiune cognitivă observat.' },
            axes_impacted: {
              type: 'array',
              items: { type: 'string', description: 'Una din: cognitiva, emotionala, afectiva, volitiva, comportamentala, profesionala.' },
              description: 'Axele afectate (1-3 valori).',
            },
            vina_score: { type: 'number', description: '0-10' },
            control_score: { type: 'number', description: '0-10' },
            pattern_summary: { type: 'string', description: 'Pattern-ul recurent observat (1-2 propoziții).' },
          },
          required: ['reframe', 'action', 'distortion_detected', 'axes_impacted', 'pattern_summary'],
        },
      },
    };

    const userMsg = `${situationBlock}Sesiune completă. Răspunsurile userului:
${answersBlock}

Generează sinteza finală conform schemei.
- reframe: gând alternativ realist, NU motivațional fals (ex: «Am făcut o greșeală, e provocator, dar am experiență și pot corecta»).
- action: o singură acțiune concretă care va intra ca task (azi sau mâine).
- vina_score și control_score: extrage din Q11 (0-10) și estimează control din Q12.
- axes_impacted: alege 1-3 axe din lista exactă: cognitiva, emotionala, afectiva, volitiva, comportamentala, profesionala.`;

    const ALLOWED_AXES = ['cognitiva', 'emotionala', 'afectiva', 'volitiva', 'comportamentala', 'profesionala'];

    const tryFinalize = async (extra?: string) => {
      const messages: any[] = [
        { role: 'system', content: system },
        { role: 'user', content: userMsg + (extra ?? '') },
      ];
      const data = await callAI(messages, { tool: finalizeTool });
      const call = data?.choices?.[0]?.message?.tool_calls?.[0];
      if (!call) {
        console.error('finalize: no tool_call', JSON.stringify(data?.choices?.[0]?.message ?? {}).slice(0, 500));
        return null;
      }
      try {
        return JSON.parse(call.function.arguments);
      } catch (e) {
        console.error('finalize: bad JSON', call.function.arguments?.slice(0, 500));
        return null;
      }
    };

    let result = await tryFinalize();
    if (!result) {
      console.warn('finalize: retrying with stricter prompt');
      result = await tryFinalize('\n\nIMPORTANT: răspunde DOAR prin tool call cu toate câmpurile required completate.');
    }

    if (!result) {
      // Last-resort fallback so the client can still close the session.
      const reframe = body.phase_answers['q13'] || 'Reframe nu a putut fi generat — revino la el manual.';
      const action = body.phase_answers['q14'] || 'Definește o singură acțiune concretă pentru următoarele 24h.';
      const distortion = body.phase_answers['q5'] || 'Nedetectată';
      const vina = Number(body.phase_answers['q11']);
      result = {
        reframe,
        action,
        distortion_detected: distortion,
        axes_impacted: ['cognitiva'],
        vina_score: Number.isFinite(vina) ? Math.max(0, Math.min(10, vina)) : null,
        control_score: null,
        pattern_summary: 'Sinteză generată local — AI-ul nu a putut finaliza. Apasă „Reîncearcă AI".',
        ai_failed: true,
      };
    }

    // Clamp/sanitize
    if (Array.isArray(result.axes_impacted)) {
      result.axes_impacted = result.axes_impacted
        .map((a: any) => String(a).toLowerCase().trim())
        .filter((a: string) => ALLOWED_AXES.includes(a))
        .slice(0, 3);
      if (result.axes_impacted.length === 0) result.axes_impacted = ['cognitiva'];
    } else {
      result.axes_impacted = ['cognitiva'];
    }
    if (result.vina_score != null) result.vina_score = Math.max(0, Math.min(10, Number(result.vina_score) || 0));
    if (result.control_score != null) result.control_score = Math.max(0, Math.min(10, Number(result.control_score) || 0));

    return new Response(JSON.stringify(result), {
      headers: { ...extraHeaders, 'Content-Type': 'application/json' },
    });
  } catch (err: any) {
    console.error('mentalitate-stack-coach error', err);
    const msg = err?.message ?? 'unknown';
    const status = msg === 'rate_limit' ? 429 : msg === 'credits_exhausted' ? 402 : 500;
    return new Response(JSON.stringify({ error: msg }), {
      status,
      headers: { ...extraHeaders, 'Content-Type': 'application/json' },
    });
  }
});
