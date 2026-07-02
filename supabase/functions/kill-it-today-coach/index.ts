import { corsHeaders } from 'npm:@supabase/supabase-js@2/cors';
import { createClient } from 'npm:@supabase/supabase-js@2';

const RO_SYSTEM_PROMPT = `Ești Alin — coach în CEO Mind OS. Modul: "KILL IT TODAY" — user-ul vrea să domine ziua asta, să aibă rezultate, să nu piardă timp.

VOCE: Frate mai mare direct, cald, cu autoritate. Fără moralizare, fără fluff. Validezi rapid, apoi împingi la acțiune. Max 1-2 întrebări per mesaj. Vorbești scurt, dens, concret.

FLOW ÎN 5 FAZE (mergi secvențial, dar natural — nu recita nume de faze):
1. MENTALITATE & STARE — check starea, "de ce vrei azi să domini?", instalează frame-ul de putere.
2. WIN & SARCINI (Business/Productivitate) — "ce înseamnă un WIN concret azi?" Apoi analizează sarcinile existente (îți vin în context), verifică dacă sunt aliniate cu win-ul. Rescrie/prioritizează, sau construiește pas cu pas dacă lipsesc. Ținta: max 3 sarcini clare pentru azi.
3. ANCORĂ — "care e ancora care te trage azi să faci asta?" (viziune, oameni, sens, frica de regret). Cristalizează o frază-ancoră scurtă.
4. SPIRITUAL / FAMILIE — "pentru cine faci asta azi?" Scurt ritual de conectare (o gândire, o rugăciune, o imagine).
5. CORP / SPORT — "ce mișcare faci în următoarea oră ca să pui corpul în stare de putere?" Propune concret 5-15 min în funcție de energie.

REGULI DE STAT (FOARTE IMPORTANT):
La FINALUL fiecărui mesaj al tău, adaugă un bloc JSON într-un fenced code block cu tag "state" — DOAR câmpurile pe care le-ai clarificat/decis în mesajul acesta. Nu include câmpuri goale.

Format exact:
\`\`\`state
{"phase":"mentalitate|business|ancora|spiritual|corp|complete","state_before":"...","win_of_day":"...","anchor_phrase":"...","tasks":["...","..."],"spiritual_anchor":"...","workout_plan":"...","power_phrase":"..."}
\`\`\`

Regulile blocului:
- Trece "phase" la faza următoare DOAR când ai încheiat cea curentă (user a răspuns clar).
- "tasks" = array cu max 3 sarcini concrete, formulate imperativ, cu verb + rezultat măsurabil. Include doar când user a agreat lista.
- Când toate cele 5 faze sunt gata, setează phase="complete" și emite "power_phrase" — o frază scurtă de putere (max 12 cuvinte) care rezumă KILL IT-ul de azi.

CE NU FACI:
❌ Nu inventa sarcini fără să întrebi user-ul.
❌ Nu sări peste faze — dar nu recita "acum suntem la faza 2".
❌ Nu da răspunsuri lungi de peste 6 rânduri. Dens, direct.
❌ Nu diagnostica emoții cu jargon terapeutic. Vorbește uman.`;

const EN_SYSTEM_PROMPT = `You are Alin — coach in CEO Mind OS. Mode: "KILL IT TODAY" — user wants to dominate today, get results, no wasted time.

VOICE: Older brother — direct, warm, with authority. No moralizing, no fluff. Validate quickly, then push to action. Max 1-2 questions per message. Short, dense, concrete.

FLOW IN 5 PHASES (sequential but natural — don't recite phase names):
1. MINDSET & STATE — check state, "why do you want to dominate today?", install power frame.
2. WIN & TASKS — "what does a WIN look like today, concretely?" Then analyze existing tasks (given in context), check alignment. Rewrite/prioritize, or build from scratch if missing. Max 3 clear tasks.
3. ANCHOR — "what pulls you today?" (vision, people, meaning, fear of regret). Crystallize into a short anchor phrase.
4. SPIRITUAL / FAMILY — "who are you doing this for?" Short connection ritual.
5. BODY / SPORT — "what movement in the next hour puts your body in power?" Suggest 5-15 min concrete.

STATE RULES (VERY IMPORTANT):
At the END of every one of your messages, append a JSON block in a fenced code block tagged "state" — only fields you decided/clarified in this message.

Exact format:
\`\`\`state
{"phase":"mentalitate|business|ancora|spiritual|corp|complete","state_before":"...","win_of_day":"...","anchor_phrase":"...","tasks":["...","..."],"spiritual_anchor":"...","workout_plan":"...","power_phrase":"..."}
\`\`\`

DON'T:
❌ Invent tasks without user confirmation.
❌ Skip phases — but don't announce them either.
❌ Answer over 6 lines. Dense, direct.`;

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });

  try {
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    const SUPABASE_URL = Deno.env.get('SUPABASE_URL');
    const SERVICE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    if (!LOVABLE_API_KEY || !SUPABASE_URL || !SERVICE_KEY) {
      return json({ error: 'Server misconfigured' }, 500);
    }

    const authHeader = req.headers.get('Authorization') || '';
    if (!authHeader.startsWith('Bearer ')) return json({ error: 'Unauthorized' }, 401);

    const supabase = createClient(SUPABASE_URL, SERVICE_KEY, {
      global: { headers: { Authorization: authHeader } },
    });
    const { data: { user }, error: userErr } = await supabase.auth.getUser();
    if (userErr || !user) return json({ error: 'Unauthorized' }, 401);

    const body = await req.json().catch(() => ({}));
    const { messages, language = 'ro', session_id } = body;
    if (!Array.isArray(messages)) return json({ error: 'messages array required' }, 400);

    // Build context: today's Hot List + this month's missions
    let contextBlock = '';
    try {
      const now = new Date();
      const { data: hot } = await supabase
        .from('hot_list_items')
        .select('title, list_type, completed, priority, day_of_week, created_at')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(30);

      const monthStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
      const { data: missions } = await supabase
        .from('missions')
        .select('title, category, mission_type, period')
        .eq('user_id', user.id)
        .ilike('period', `${monthStr}%`)
        .limit(20);

      const parts: string[] = [];
      if (hot && hot.length) {
        parts.push('SARCINI SĂPTĂMÂNA ASTA (Hot/Hit/Do List):');
        hot.forEach((h: any) => {
          parts.push(`- [${h.list_type}${h.completed ? '/DONE' : ''}] ${h.title}`);
        });
      } else {
        parts.push('SARCINI: user-ul nu are nicio sarcină în lista săptămânii. Ajută-l să construiască 1-3 sarcini pentru azi.');
      }
      if (missions && missions.length) {
        parts.push('\nMISIUNILE LUNII:');
        missions.forEach((m: any) => parts.push(`- [${m.category}] ${m.title}`));
      }
      contextBlock = '\n\n=== CONTEXT USER ===\n' + parts.join('\n');
    } catch (e) {
      console.error('context fetch failed', e);
    }

    const systemPrompt = (language === 'en' ? EN_SYSTEM_PROMPT : RO_SYSTEM_PROMPT) + contextBlock;

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
          ...messages,
        ],
        max_tokens: 1000,
      }),
    });

    if (!response.ok) {
      const errText = await response.text();
      console.error('AI Gateway error:', response.status, errText);
      if (response.status === 429) return json({ error: 'Rate limit. Reia peste puțin.' }, 429);
      if (response.status === 402) return json({ error: 'Credite AI epuizate.' }, 402);
      return json({ error: 'AI error' }, 500);
    }

    const data = await response.json();
    const raw = data.choices?.[0]?.message?.content || '';

    // Extract state block
    let stateUpdate: Record<string, any> | null = null;
    let message = raw;
    const match = raw.match(/```state\s*([\s\S]*?)```/i);
    if (match) {
      try {
        stateUpdate = JSON.parse(match[1].trim());
      } catch (e) {
        console.warn('state parse failed', e);
      }
      message = raw.replace(match[0], '').trim();
    }

    // Persist state to session if given
    if (session_id && stateUpdate) {
      const patch: Record<string, any> = { updated_at: new Date().toISOString() };
      if (stateUpdate.phase) patch.current_phase = stateUpdate.phase;
      if (stateUpdate.state_before) patch.state_before = stateUpdate.state_before;
      if (stateUpdate.win_of_day) patch.win_of_day = stateUpdate.win_of_day;
      if (stateUpdate.anchor_phrase) patch.anchor_phrase = stateUpdate.anchor_phrase;
      if (Array.isArray(stateUpdate.tasks)) patch.tasks_snapshot = stateUpdate.tasks;
      if (stateUpdate.spiritual_anchor) patch.spiritual_anchor = stateUpdate.spiritual_anchor;
      if (stateUpdate.workout_plan) patch.workout_plan = stateUpdate.workout_plan;
      if (stateUpdate.power_phrase) patch.power_phrase = stateUpdate.power_phrase;
      if (stateUpdate.phase === 'complete') patch.completed_at = new Date().toISOString();
      await supabase
        .from('kill_it_today_sessions')
        .update(patch)
        .eq('id', session_id)
        .eq('user_id', user.id);
    }

    return json({ message, state: stateUpdate });
  } catch (e) {
    console.error('kill-it-today-coach error:', e);
    return json({ error: e instanceof Error ? e.message : 'Unknown' }, 500);
  }
});

function json(payload: any, status = 200) {
  return new Response(JSON.stringify(payload), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}
