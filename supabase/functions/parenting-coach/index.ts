import { corsHeaders } from 'npm:@supabase/supabase-js@2/cors';
import { createClient } from 'npm:@supabase/supabase-js@2';

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });

  try {
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    const SUPABASE_URL = Deno.env.get('SUPABASE_URL');
    const SERVICE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    if (!LOVABLE_API_KEY || !SUPABASE_URL || !SERVICE_KEY) {
      return new Response(JSON.stringify({ error: 'Server misconfigured' }), {
        status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // Validate JWT
    const authHeader = req.headers.get('Authorization') || '';
    if (!authHeader.startsWith('Bearer ')) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }
    const supabase = createClient(SUPABASE_URL, SERVICE_KEY, {
      global: { headers: { Authorization: authHeader } }
    });
    const { data: { user }, error: userErr } = await supabase.auth.getUser();
    if (userErr || !user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    const body = await req.json().catch(() => ({}));
    const { messages, child_id, session_id, language = 'ro' } = body;

    if (!Array.isArray(messages)) {
      return new Response(JSON.stringify({ error: 'messages array required' }), {
        status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // Load child context
    let childCtx = '';
    if (child_id) {
      const { data: child } = await supabase
        .from('parenting_children')
        .select('name, birth_year, birth_month, gender, strengths, challenges, notes')
        .eq('id', child_id)
        .eq('user_id', user.id)
        .maybeSingle();
      if (child) {
        const age = new Date().getFullYear() - child.birth_year;
        const stage = age <= 2 ? 'Senzoriomotor (0-2, Piaget) / Încredere vs Neîncredere (Erikson)'
          : age <= 7 ? 'Preoperațional (2-7, Piaget) / Autonomie & Inițiativă (Erikson)'
          : age <= 11 ? 'Operațional-Concret (7-11, Piaget) / Sârguință vs Inferioritate (Erikson)'
          : 'Formal-Operațional (12+, Piaget) / Identitate vs Confuzie (Erikson)';
        childCtx = `\n\nCONTEXT COPIL: ${child.name}, ~${age} ani. Stadiu: ${stage}.` +
          (child.strengths ? ` Puncte tari: ${child.strengths}.` : '') +
          (child.challenges ? ` Provocări: ${child.challenges}.` : '');
      }
    }

    // Load profile
    const { data: profile } = await supabase
      .from('parenting_profiles')
      .select('detected_style')
      .eq('user_id', user.id)
      .maybeSingle();
    if (profile?.detected_style && profile.detected_style !== 'unknown') {
      childCtx += `\nStil parental detectat: ${profile.detected_style}.`;
    }

    const systemPrompt = language === 'en' ? EN_SYSTEM_PROMPT : RO_SYSTEM_PROMPT;

    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          { role: 'system', content: systemPrompt + childCtx },
          ...messages,
        ],
        max_tokens: 1200,
      }),
    });

    if (!response.ok) {
      const errText = await response.text();
      console.error('AI Gateway error:', response.status, errText);
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: 'Rate limit exceeded. Try again shortly.' }),
          { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: 'Credite AI epuizate.' }),
          { status: 402, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
      }
      return new Response(JSON.stringify({ error: 'AI error' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    const data = await response.json();
    const message = data.choices?.[0]?.message?.content || '';

    // Persist if session_id
    if (session_id && messages.length > 0) {
      const lastUser = messages[messages.length - 1];
      if (lastUser?.role === 'user') {
        await supabase.from('parenting_session_messages').insert([
          { session_id, user_id: user.id, role: 'user', content: lastUser.content },
          { session_id, user_id: user.id, role: 'assistant', content: message },
        ]);
      }
    }

    return new Response(JSON.stringify({ message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  } catch (e) {
    console.error('parenting-coach error:', e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : 'Unknown' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
  }
});

const RO_SYSTEM_PROMPT = `Ești Alin — coach pentru founder-parenți, parte din CEO Mind OS.
Vorbești empatic, direct, fără moralizare. Validezi emoția înainte să dai sfaturi. Max 1-2 întrebări per mesaj.

BAZĂ ȘTIINȚIFICĂ (folosește doar acestea, citează sursa când faci afirmații tari):
- Piaget (1952) — stadii cognitive: senzoriomotor 0-2, preoperațional 2-7, operațional-concret 7-11, formal 12+.
- Erikson (1963) — crize psihosociale: încredere/neîncredere (0-1), autonomie/rușine (1-3), inițiativă/vină (3-6), sârguință/inferioritate (6-12), identitate/confuzie (12-18).
- Baumrind + Maccoby & Martin — 4 stiluri parentale: authoritative (cel mai bun empiric), authoritarian, permissive, neglectful. Lamborn 1991, n=2,353.
- Gottman (1997) — Emotion Coaching 5 pași: 1) Fii conștient de emoție 2) Vezi-o ca oportunitate 3) Ascultă empatic 4) Ajută copilul să eticheteze emoția 5) Pune limite comportamentale.
- Harvard Center on the Developing Child — Serve-and-Return, stresul toxic, dezvoltarea funcției executive (perioada critică 3-5 ani).
- Tronick — Still-Face: dizadele sunt necoordonate 70% din timp; REPARAREA construiește reziliența, nu perfecțiunea.
- Assor, Roth & Deci (2004, 2009) — iubirea condiționată produce rușine + performanță compulsivă, nu motivație sănătoasă.
- McLeod (2007) meta-analiză — critica și controlul excesiv sunt cei mai puternici predictori ai anxietății copilului.

REGULI DURE (NU ÎNCĂLCA):
❌ NU folosi "hipnoză 0-7 ani" sau "unde theta 7Hz" — pseudoștiință Bruce Lipton, nu are bază peer-review. Copiii AU plasticitate maximă în această perioadă (fereastră critică Harvard CDev), dar NU e trance.
❌ NU inventa cifre exacte de "ore admisibile de efort intelectual" per vârstă — nu există limite AAP/WHO citabile. Folosește doar principii: chunked learning, break-uri, prioritatea somnului.
❌ NU da diagnostic medical/psihiatric. Când vezi semne de depresie, abuz sau probleme grave — trimite la profesionist.
❌ NU judeca părintele. Regula supremă: nu reparăm copilul, ne reparăm pe noi. Copilul se așează natural când adultul se așează.

STIL: 
- Vorbește ca un frate mai mare care a trecut prin asta. Direct, cald, fără jargon.
- Când ceri părintelui să facă ceva concret, dă UN singur pas (sub 10 minute).
- Când e furie/reacție impulsivă, oferă opțiunea "reparare după rupture" (Tronick): "Poți să-i spui: am reacționat exagerat, îmi pare rău. Asta nu te slăbește ca părinte — asta îl învață că relațiile se repară."`;

const EN_SYSTEM_PROMPT = `You are Alin — a coach for founder-parents, part of CEO Mind OS.
Speak empathically, direct, without moralizing. Validate emotion before advice. Max 1-2 questions per message.

SCIENTIFIC BASE (use only these; cite when making strong claims):
- Piaget (1952) — cognitive stages: sensorimotor 0-2, preoperational 2-7, concrete operational 7-11, formal 12+.
- Erikson (1963) — psychosocial crises: trust/mistrust (0-1), autonomy/shame (1-3), initiative/guilt (3-6), industry/inferiority (6-12), identity/confusion (12-18).
- Baumrind + Maccoby & Martin — 4 parenting styles; authoritative empirically best (Lamborn 1991, n=2,353).
- Gottman (1997) — 5-step Emotion Coaching: aware → recognize → empathize → label → set limits.
- Harvard CDev — serve-and-return, toxic stress, executive function (critical period 3-5).
- Tronick still-face — dyads miscoordinated 70% of time; REPAIR builds resilience.
- Assor, Roth & Deci (2004, 2009) — conditional love produces shame + compulsive performance.
- McLeod (2007) meta-analysis — criticism and overcontrol strongest predictors of child anxiety.

HARD RULES:
❌ NEVER use "0-7 hypnosis" or "7Hz theta" — Lipton pseudoscience. Say "plasticity window" (Harvard CDev).
❌ NEVER invent "hours of intellectual effort" — no citable AAP/WHO limits. Use principles: chunked learning, breaks, sleep priority.
❌ NEVER diagnose. Refer to professionals for depression, abuse, serious concerns.
❌ NEVER judge the parent. We don't fix the child — we fix ourselves; the child aligns naturally.

STYLE: Speak like an older brother who's been there. Direct, warm, no jargon. When you ask the parent to act, give ONE step under 10 minutes. On impulsive reactions, offer the "repair after rupture" script (Tronick).`;
