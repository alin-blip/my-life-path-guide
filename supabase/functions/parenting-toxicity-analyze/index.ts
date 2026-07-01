import { corsHeaders } from 'npm:@supabase/supabase-js@2/cors';
import { createClient } from 'npm:@supabase/supabase-js@2';

interface Body {
  scan_id: string;
  language?: 'ro' | 'en';
  child_context?: {
    name?: string;
    age?: number;
    piaget?: string;
    erikson?: string;
  };
}

const SYSTEM_RO = `Ești coach parental evidence-based, în vocea lui Alin (empatic, direct, fără BS).
Analizezi rezultatele unui scanner PSDQ (Robinson et al. 1995) + 6 tipare toxice validate (Assor & Roth 2004; Gottman 1997; Baumrind 1971; McLeod 2007).

STIL: Vorbește direct cu părintele („tu"). Fără patronizare. Fără moralizare.
STRUCTURĂ răspuns (JSON strict):
{
  "interpretation": "3-5 paragrafe, max 700 cuvinte. Începe cu ce merge bine. Apoi 1-2 tipare de reparat. Cite scurte din literatură (Baumrind, Gottman, Harvard CDev, Tronick).",
  "action_plan": [
    { "title": "…", "why": "sursa științifică", "how": "acțiune concretă săptămâna aceasta" },
    ... 3-5 items
  ]
}

REGULI ABSOLUTE:
- Nu inventezi cifre sau studii. Doar surse verificate: Piaget, Erikson, Baumrind, Maccoby & Martin, Lamborn 1991, Gottman, Harvard Center on the Developing Child, Tronick 1989, Assor/Roth/Deci, McLeod 2007.
- Nu dai sfaturi medicale, psihiatrice sau de siguranță (abuz → recomandă profesionist).
- Fără Bruce Lipton, „7Hz theta hypnosis", epigenetică lamarckiană.
- Adaptezi acțiunile la stadiul Piaget/Erikson al copilului (dacă e furnizat).`;

const SYSTEM_EN = `You are an evidence-based parenting coach, in Alin's voice (empathetic, direct, no BS).
You analyze a PSDQ scan (Robinson et al. 1995) + 6 validated toxic patterns (Assor & Roth 2004; Gottman 1997; Baumrind 1971; McLeod 2007).

STYLE: Speak directly to the parent ("you"). No patronizing. No moralizing.
RESPONSE STRUCTURE (strict JSON):
{
  "interpretation": "3-5 paragraphs, max 700 words. Start with what works. Then 1-2 patterns to repair. Short citations (Baumrind, Gottman, Harvard CDev, Tronick).",
  "action_plan": [
    { "title": "…", "why": "scientific source", "how": "concrete action for this week" },
    ... 3-5 items
  ]
}

HARD RULES:
- No made-up numbers or studies. Only verified sources: Piaget, Erikson, Baumrind, Maccoby & Martin, Lamborn 1991, Gottman, Harvard Center on the Developing Child, Tronick 1989, Assor/Roth/Deci, McLeod 2007.
- No medical/psychiatric/safety advice (abuse → refer to a professional).
- No Bruce Lipton, "7Hz theta hypnosis", Lamarckian epigenetics.
- Adapt actions to the child's Piaget/Erikson stage (if given).`;

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });

  try {
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(JSON.stringify({ error: 'Missing Authorization' }), {
        status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_ANON_KEY')!,
      { global: { headers: { Authorization: authHeader } } },
    );

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const body: Body = await req.json();
    if (!body?.scan_id) {
      return new Response(JSON.stringify({ error: 'scan_id required' }), {
        status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const { data: scan, error: scanErr } = await supabase
      .from('parenting_toxicity_scans')
      .select('*')
      .eq('id', body.scan_id)
      .eq('user_id', user.id)
      .maybeSingle();

    if (scanErr || !scan) {
      return new Response(JSON.stringify({ error: 'Scan not found' }), {
        status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const language = body.language || 'ro';
    const system = language === 'en' ? SYSTEM_EN : SYSTEM_RO;

    const userPayload = {
      scores: {
        authoritative: scan.authoritative_score,
        authoritarian: scan.authoritarian_score,
        permissive: scan.permissive_score,
        neglectful: scan.neglectful_score,
        dominant_style: scan.dominant_style,
        toxic_patterns: scan.toxic_patterns,
      },
      child: body.child_context || null,
    };

    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      return new Response(JSON.stringify({ error: 'AI unavailable' }), {
        status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const aiResp = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          { role: 'system', content: system },
          { role: 'user', content: JSON.stringify(userPayload) },
        ],
        response_format: { type: 'json_object' },
      }),
    });

    if (!aiResp.ok) {
      const t = await aiResp.text();
      return new Response(JSON.stringify({ error: 'AI error', detail: t }), {
        status: 502, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const aiJson = await aiResp.json();
    const raw = aiJson.choices?.[0]?.message?.content || '{}';
    let parsed: { interpretation?: string; action_plan?: unknown[] } = {};
    try { parsed = JSON.parse(raw); } catch { parsed = { interpretation: raw, action_plan: [] }; }

    const { error: updErr } = await supabase
      .from('parenting_toxicity_scans')
      .update({
        ai_interpretation: parsed.interpretation || '',
        action_plan: parsed.action_plan || [],
        completed: true,
      })
      .eq('id', body.scan_id)
      .eq('user_id', user.id);

    if (updErr) {
      return new Response(JSON.stringify({ error: 'Save failed', detail: updErr.message }), {
        status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    return new Response(JSON.stringify({
      interpretation: parsed.interpretation,
      action_plan: parsed.action_plan,
    }), {
      status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (e) {
    return new Response(JSON.stringify({ error: (e as Error).message }), {
      status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
