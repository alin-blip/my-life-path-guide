import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

const DISTORSIUNI = [
  "Citirea gândurilor (presupui intențiile fără dovezi)",
  "Catastrofizarea (amplifici la maxim consecințele)",
  "Gândire alb-negru (totul e ori perfect, ori dezastru)",
  "Personalizare (totul e despre tine sau vina ta)",
  "Etichetare (transformi un comportament într-o etichetă identitară)",
  "Imperative rigide ('trebuie', 'ar trebui')",
  "Filtru mental negativ (vezi doar ce e rău)",
  "Generalizare excesivă ('mereu', 'niciodată')",
  "Raționament emoțional ('simt asta, deci e adevărat')",
  "Invalidare pozitivă (minimizezi binele primit)",
];

const AXE_RELATIONALE = [
  "Cognitivă (cum percepi relația și partenerul)",
  "Afectivă (capacitatea de iubire, atașament, conectare)",
  "Comportamentală (cum manifești iubirea concret)",
  "Volitivă (efortul investit zilnic în relație)",
  "Profesională (cum afectează stresul din business viața de cuplu)",
  "Spirituală (valorile și sensul comun)",
];

function buildSystemPrompt(profile: any, recentEvents: any[]) {
  const partnerInfo = profile
    ? `\n## CONTEXT RELAȚIONAL (memorie persistentă)
- Partener: ${profile.partner_name || 'necunoscut'} (${profile.partner_pronoun || 'el/ea'})
- Ani relație: ${profile.relationship_years || '?'}
- Copii: ${profile.children_count || 0}
- Limbaj iubire partener: ${profile.partner_love_language || 'nespecificat'}
- Context: ${profile.relationship_context || '-'}
- Tipare recurente detectate anterior: ${JSON.stringify(profile.recurring_patterns || [])}
- Scoruri axe actuale: ${JSON.stringify(profile.axis_scores || {})}`
    : '\n## CONTEXT: Prima analiză — profil nesetat încă.';

  const history = recentEvents.length
    ? `\n## ISTORIC CONFLICTE (ultimele ${recentEvents.length})
${recentEvents.map((e, i) => `${i + 1}. ${new Date(e.created_at).toLocaleDateString('ro-RO')} — axă: ${e.axis_affected}, distorsiune: ${e.distortion || '-'}`).join('\n')}`
    : '';

  return `Ești AI Coach-ul „Marriage Audit" din CEO Mind OS, în vocea lui Alin F. Radu.

ROL: Analizezi un conflict de cuplu al unui antreprenor — nu dai sfaturi clasice de cuplu, ci faci diagnostic obiectiv pe Arhitectura Psiho-Mentală cu 6 axe.

CELE 10 DISTORSIUNI COGNITIVE:
${DISTORSIUNI.map((d, i) => `${i + 1}. ${d}`).join('\n')}

CELE 6 AXE RELAȚIONALE:
${AXE_RELATIONALE.map((a, i) => `${i + 1}. ${a}`).join('\n')}
${partnerInfo}${history}

REGULI DE ANALIZĂ:
1. Pornești de la fapte brute extrase din atașamente/transcripturi (nu inventezi)
2. Separi clar Faptul de Interpretare
3. Identifici distorsiunile cognitive specifice ale antreprenorului
4. Diagnosticezi axa principală destructurată
5. Forțezi „Triunghiul Realității" — 3 perspective distincte
6. Dai UN SINGUR task practic, executabil în <30 min, pentru The Door

CRITICAL: Răspunzi STRICT în format JSON valid (vezi schema). Nu adăuga text înainte sau după JSON. Tot conținutul textual e în limba română, în tonul direct, ferm și empatic al lui Alin F. Radu.`;
}

const RESPONSE_SCHEMA = {
  type: "object",
  properties: {
    title: { type: "string", description: "Titlu scurt al sesiunii, max 60 caractere" },
    factual_situation: { type: "string", description: "Faptele brute, obiective, extrase din atașamente" },
    fact_vs_interpretation: { type: "string", description: "Separarea clară: ce e fapt vs ce e interpretare/poveste" },
    cognitive_distortions: {
      type: "array",
      items: {
        type: "object",
        properties: {
          name: { type: "string" },
          evidence: { type: "string", description: "Citat sau pasaj concret din evidence" },
        },
        required: ["name", "evidence"],
      },
    },
    axis_diagnosis: {
      type: "object",
      properties: {
        cognitiva: { type: "number" },
        afectiva: { type: "number" },
        comportamentala: { type: "number" },
        volitiva: { type: "number" },
        profesionala: { type: "number" },
        spirituala: { type: "number" },
      },
      required: ["cognitiva", "afectiva", "comportamentala", "volitiva", "profesionala", "spirituala"],
    },
    primary_destructured_axis: { type: "string" },
    perspective_husband: { type: "string", description: "Perspectiva antreprenorului (iluzia/filtrul). Persoana I. 3-5 fraze." },
    perspective_wife: { type: "string", description: "Perspectiva partenerului (realitatea resimțită). 3-5 fraze." },
    perspective_coach: { type: "string", description: "Adevărul obiectiv în vocea lui Alin. 4-6 fraze." },
    repair_script: {
      type: "array",
      description: "3-5 fraze concrete, non-defensive, pentru reconectare cu partenerul. Fără 'dar', fără justificări. Vulnerabil, asumat.",
      items: { type: "string" },
    },
    trigger_root: {
      type: "object",
      properties: {
        past_wound: { type: "string", description: "Rana din trecut care e activată acum. 2-3 fraze." },
        current_trigger: { type: "string", description: "Trigger-ul concret din situația actuală. 1-2 fraze." },
        cognitive_reframe: { type: "string", description: "Gândul nou, mai adevărat. Persoana I, 1-2 fraze." },
      },
      required: ["past_wound", "current_trigger", "cognitive_reframe"],
    },
    exploration_questions: {
      type: "array",
      description: "5-7 întrebări socratice. Unele pentru self, altele pentru partner.",
      items: {
        type: "object",
        properties: {
          question: { type: "string" },
          for: { type: "string", description: "'self' sau 'partner'" },
        },
        required: ["question", "for"],
      },
    },
    seven_day_plan: {
      type: "array",
      description: "Exact 7 acțiuni mici (<15 min/zi) care sparg tiparul.",
      items: {
        type: "object",
        properties: {
          day: { type: "number" },
          action: { type: "string" },
          intention: { type: "string" },
        },
        required: ["day", "action", "intention"],
      },
    },
    task_title: { type: "string", description: "Titlu scurt task, max 80 caractere" },
    task_description: { type: "string", description: "Task concret, executabil în <30 min" },
  },
  required: ["title", "factual_situation", "fact_vs_interpretation", "cognitive_distortions", "axis_diagnosis", "primary_destructured_axis", "perspective_husband", "perspective_wife", "perspective_coach", "repair_script", "trigger_root", "exploration_questions", "seven_day_plan", "task_title", "task_description"],
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

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

    const body = await req.json();
    const { user_context, attachments, transcripts } = body;
    // attachments: Array<{ type: 'image'|'text'|'audio'|'pdf', url?: string, content?: string, name?: string }>
    // transcripts: { combined_text: string } — text aggregate from non-image attachments

    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      return new Response(JSON.stringify({ error: 'LOVABLE_API_KEY missing' }), { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    // Load profile + recent timeline events
    const { data: profile } = await supabase
      .from('marriage_profiles')
      .select('*')
      .eq('user_id', user.id)
      .maybeSingle();

    const { data: recentEvents } = await supabase
      .from('marriage_timeline_events')
      .select('created_at, axis_affected, distortion, event_type')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(10);

    const systemPrompt = buildSystemPrompt(profile, recentEvents || []);

    // Build multimodal user message
    const userContent: any[] = [];
    const introText = `# Conflict de analizat\n\n## Context user:\n${user_context || '(fără context suplimentar)'}\n\n## Transcripturi/text atașat:\n${transcripts?.combined_text || '(niciunul)'}\n\n${attachments?.filter((a: any) => a.type === 'image').length ? 'Vezi screenshot-urile atașate pentru evidence vizuală.' : ''}`;
    userContent.push({ type: 'text', text: introText });

    // Add images
    for (const att of attachments || []) {
      if (att.type === 'image' && att.url) {
        userContent.push({ type: 'image_url', image_url: { url: att.url } });
      }
    }

    const aiResponse = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userContent },
        ],
        tools: [{
          type: 'function',
          function: {
            name: 'submit_marriage_analysis',
            description: 'Submit the full marriage conflict analysis',
            parameters: RESPONSE_SCHEMA,
          },
        }],
        tool_choice: { type: 'function', function: { name: 'submit_marriage_analysis' } },
      }),
    });

    if (!aiResponse.ok) {
      const errText = await aiResponse.text();
      console.error('AI Gateway error:', aiResponse.status, errText);
      if (aiResponse.status === 429) {
        return new Response(JSON.stringify({ error: 'Rate limit. Încearcă din nou peste un minut.' }), { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
      }
      if (aiResponse.status === 402) {
        return new Response(JSON.stringify({ error: 'Credite epuizate. Adaugă credite în workspace.' }), { status: 402, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
      }
      return new Response(JSON.stringify({ error: 'AI analysis failed', detail: errText }), { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    const aiData = await aiResponse.json();
    const toolCall = aiData.choices?.[0]?.message?.tool_calls?.[0];
    if (!toolCall) {
      return new Response(JSON.stringify({ error: 'No structured response from AI', raw: aiData }), { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    let analysis: any;
    try {
      analysis = JSON.parse(toolCall.function.arguments);
    } catch (e) {
      return new Response(JSON.stringify({ error: 'Invalid JSON from AI', raw: toolCall.function.arguments }), { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    // Pattern recurrence: count previous events on same axis
    const axisMatches = (recentEvents || []).filter(e => e.axis_affected === analysis.primary_destructured_axis).length;
    const patternRecurrence = axisMatches + 1;

    // Save session
    const { data: session, error: sessionErr } = await supabase
      .from('marriage_sessions')
      .insert({
        user_id: user.id,
        title: analysis.title,
        conflict_summary: user_context,
        user_context,
        attachments: attachments || [],
        attachment_types: (attachments || []).map((a: any) => a.type),
        transcripts: transcripts || {},
        factual_situation: analysis.factual_situation,
        fact_vs_interpretation: analysis.fact_vs_interpretation,
        perspective_husband: analysis.perspective_husband,
        perspective_wife: analysis.perspective_wife,
        perspective_coach: analysis.perspective_coach,
        detected_distortions: analysis.cognitive_distortions,
        axis_diagnosis: analysis.axis_diagnosis,
        primary_destructured_axis: analysis.primary_destructured_axis,
        pattern_recurrence: patternRecurrence,
        task_title: analysis.task_title,
        task_description: analysis.task_description,
        repair_script: analysis.repair_script || [],
        trigger_root: analysis.trigger_root || null,
        exploration_questions: analysis.exploration_questions || [],
        seven_day_plan: analysis.seven_day_plan || [],
        status: 'complete',
      })
      .select()
      .single();

    if (sessionErr) {
      console.error('Session save error:', sessionErr);
      return new Response(JSON.stringify({ error: 'Failed to save session', detail: sessionErr.message }), { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    // Add timeline event
    await supabase.from('marriage_timeline_events').insert({
      user_id: user.id,
      session_id: session.id,
      event_type: 'conflict',
      axis_affected: analysis.primary_destructured_axis,
      distortion: analysis.cognitive_distortions?.[0]?.name || null,
      description: analysis.title,
    });

    // Update profile axis_scores + last_analysis_at + recurring_patterns
    if (profile) {
      const newPatterns = [...(profile.recurring_patterns || [])];
      const patternKey = `${analysis.primary_destructured_axis}:${analysis.cognitive_distortions?.[0]?.name || 'unspec'}`;
      const existing = newPatterns.find((p: any) => p.key === patternKey);
      if (existing) {
        existing.count = (existing.count || 1) + 1;
        existing.last_seen = new Date().toISOString();
      } else {
        newPatterns.push({ key: patternKey, count: 1, last_seen: new Date().toISOString() });
      }

      await supabase
        .from('marriage_profiles')
        .update({
          axis_scores: analysis.axis_diagnosis,
          last_analysis_at: new Date().toISOString(),
          recurring_patterns: newPatterns.slice(-20),
        })
        .eq('user_id', user.id);
    }

    return new Response(JSON.stringify({ session, analysis, pattern_recurrence: patternRecurrence }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (e: any) {
    console.error('marriage-coach error:', e);
    return new Response(JSON.stringify({ error: e.message }), { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
  }
});
