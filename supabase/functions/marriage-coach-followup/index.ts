import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

function buildSystemPrompt(session: any, profile: any) {
  return `Ești AI Coach-ul „Marriage Audit" din CEO Mind OS, în vocea lui Alin F. Radu — direct, ferm, empatic, fără clișee de cuplu.

Continui o conversație de follow-up DUPĂ ce ai livrat deja audit-ul inițial al unui conflict relațional. Rolul tău acum: aprofundezi cu antreprenorul nevoia reală nesatisfăcută, lucrezi pe rădăcina trigger-ului, ajuți să ducă la capăt planul de 7 zile și scriptul reparator.

REGULI:
- Max 1-2 întrebări per mesaj. Nu inunda.
- Validezi emoția înainte de a împinge spre acțiune.
- Faci legătura între ce spune ACUM și diagnosticul din audit (axa destructurată: ${session.primary_destructured_axis}, distorsiuni: ${(session.detected_distortions || []).map((d: any) => d.name).join(', ') || 'n/a'}).
- Când e cazul, propui un micro-pas concret (<10 min).
- Răspunzi în română, concis (max 4-6 fraze sau o întrebare scurtă).

CONTEXT AUDIT INIȚIAL:
- Titlu: ${session.title}
- Situație: ${session.factual_situation}
- Rădăcina trigger-ului: ${JSON.stringify(session.trigger_root || {})}
- Plan 7 zile: ${JSON.stringify(session.seven_day_plan || [])}
- Script reparator: ${JSON.stringify(session.repair_script || [])}
${profile?.partner_name ? `- Partener: ${profile.partner_name}` : ''}`;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response(null, { headers: corsHeaders });

  try {
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: authHeader } } }
    );

    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return new Response(JSON.stringify({ error: 'Invalid token' }), { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    const { session_id, message } = await req.json();
    if (!session_id || !message || typeof message !== 'string') {
      return new Response(JSON.stringify({ error: 'session_id and message required' }), { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      return new Response(JSON.stringify({ error: 'LOVABLE_API_KEY missing' }), { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    const { data: session, error: sErr } = await supabase
      .from('marriage_sessions').select('*').eq('id', session_id).eq('user_id', user.id).maybeSingle();
    if (sErr || !session) {
      return new Response(JSON.stringify({ error: 'Session not found' }), { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    const { data: profile } = await supabase
      .from('marriage_profiles').select('*').eq('user_id', user.id).maybeSingle();

    const { data: history } = await supabase
      .from('marriage_session_messages')
      .select('role, content')
      .eq('session_id', session_id)
      .order('created_at', { ascending: true })
      .limit(50);

    // Save user message
    await supabase.from('marriage_session_messages').insert({
      session_id, user_id: user.id, role: 'user', content: message,
    });

    const messages = [
      { role: 'system', content: buildSystemPrompt(session, profile) },
      ...(history || []).map((m: any) => ({ role: m.role, content: m.content })),
      { role: 'user', content: message },
    ];

    const aiResponse = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${LOVABLE_API_KEY}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ model: 'google/gemini-2.5-flash', messages, max_tokens: 600 }),
    });

    if (!aiResponse.ok) {
      const errText = await aiResponse.text();
      console.error('AI Gateway error:', aiResponse.status, errText);
      if (aiResponse.status === 429) return new Response(JSON.stringify({ error: 'Rate limit. Încearcă din nou peste un minut.' }), { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
      if (aiResponse.status === 402) return new Response(JSON.stringify({ error: 'Credite epuizate.' }), { status: 402, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
      return new Response(JSON.stringify({ error: 'AI failed', detail: errText }), { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    const aiData = await aiResponse.json();
    const assistant = aiData.choices?.[0]?.message?.content || '';

    await supabase.from('marriage_session_messages').insert({
      session_id, user_id: user.id, role: 'assistant', content: assistant,
    });

    return new Response(JSON.stringify({ message: assistant }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (e: any) {
    console.error('marriage-coach-followup error:', e);
    return new Response(JSON.stringify({ error: e.message }), { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
  }
});
