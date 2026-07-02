import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { loadMinteContext } from "../_shared/mind-context.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Authentication check
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: authHeader } } }
    );
    const { data: { user }, error: authError } = await supabaseClient.auth.getUser();

    if (authError || !user) {
      return new Response(JSON.stringify({ error: 'Invalid token' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const { messages, systemPrompt, language } = await req.json();
    
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY is not configured');
    }

    // ========== FETCH USER CONTEXT FROM DATABASE ==========
    
    // 1. Fetch user's missions (annual, quarterly, monthly objectives)
    const { data: missions } = await supabaseClient
      .from('missions')
      .select('mission_type, category, title, period, project_name, measurable_result')
      .eq('user_id', user.id)
      .order('mission_type', { ascending: true });

    // 2. Fetch current weekly plan (Domino Door)
    const { data: weeklyPlan } = await supabaseClient
      .from('weekly_planning')
      .select('domino_title, key_points, week_key, category')
      .eq('user_id', user.id)
      .order('updated_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    // 3. Fetch today's pending tasks
    const today = new Date();
    const days = ['Su', 'M', 'T', 'W', 'Th', 'F', 'Sa'];
    const todayAbbrev = days[today.getDay()];
    
    const { data: todayTasks } = await supabaseClient
      .from('user_tasks')
      .select('title, completed, priority, is_key_point, scheduled_time, duration_minutes')
      .eq('user_id', user.id)
      .eq('day_of_week', todayAbbrev)
      .eq('completed', false)
      .order('scheduled_time', { ascending: true, nullsFirst: false })
      .limit(20);

    // Minte (Mind) context — foundation of the app.
    const minte = await loadMinteContext(supabaseClient, user.id);

    // Build user context string
    let userContext = '';
    
    if (missions && missions.length > 0) {
      userContext += '\n\n📌 OBIECTIVELE UTILIZATORULUI:\n';
      
      // Group by mission type
      const annual = missions.filter(m => m.mission_type === 'annual');
      const quarterly = missions.filter(m => m.mission_type === 'quarterly');
      const monthly = missions.filter(m => m.mission_type === 'monthly');
      
      if (annual.length > 0) {
        userContext += '\n🎯 ANUALE:\n';
        annual.forEach(m => {
          userContext += `- ${m.category?.toUpperCase()}: ${m.title}${m.project_name ? ` (${m.project_name})` : ''}\n`;
        });
      }
      
      if (quarterly.length > 0) {
        userContext += '\n📊 90 ZILE:\n';
        quarterly.forEach(m => {
          userContext += `- ${m.category?.toUpperCase()}: ${m.title}\n`;
        });
      }
      
      if (monthly.length > 0) {
        userContext += '\n📅 LUNA ACEASTA:\n';
        monthly.forEach(m => {
          userContext += `- ${m.category?.toUpperCase()}: ${m.title}\n`;
        });
      }
    }

    if (weeklyPlan && weeklyPlan.domino_title) {
      userContext += '\n\n🎲 FOCUS SĂPTĂMÂNAL (DOMINO DOOR):\n';
      userContext += `Obiectiv principal: ${weeklyPlan.domino_title}\n`;
      
      if (weeklyPlan.key_points && Array.isArray(weeklyPlan.key_points)) {
        userContext += 'Puncte cheie:\n';
        (weeklyPlan.key_points as any[]).slice(0, 4).forEach((kp: any, i: number) => {
          if (kp.title) {
            userContext += `  ${i + 1}. ${kp.title}${kp.deadline ? ` (deadline: ${kp.deadline})` : ''}\n`;
          }
        });
      }
    }

    if (todayTasks && todayTasks.length > 0) {
      const nowMin = today.getHours() * 60 + today.getMinutes();
      const currentTimeStr = `${String(today.getHours()).padStart(2, '0')}:${String(today.getMinutes()).padStart(2, '0')}`;
      userContext += `\n\n📋 TASK-URI PENTRU AZI (necompletate) — ora curentă: ${currentTimeStr}\n`;
      todayTasks.forEach((t: any) => {
        const icon = t.is_key_point ? '🔑' : '•';
        const time = t.scheduled_time ? t.scheduled_time.slice(0, 5) : '—';
        const dur = t.duration_minutes ? `${t.duration_minutes}m` : '';
        let marker = '';
        if (t.scheduled_time) {
          const [h, m] = t.scheduled_time.split(':').map(Number);
          const taskMin = h * 60 + m;
          const diff = taskMin - nowMin;
          if (diff >= -15 && diff <= 15) marker = ' ⏰ ACUM';
          else if (diff > 15 && diff <= 60) marker = ' ⏳ în curând';
          else if (diff < -15) marker = ' ⚠️ depășit';
        }
        userContext += `${icon} [${time} ${dur}] ${t.title}${marker}\n`;
      });
      userContext += '\nREGULĂ: Dacă există un task marcat "ACUM", menționează-l proactiv în răspuns.\n';
    }

    // ========== SHADOW COACH: TODAY'S ACTIVITY ACROSS ECOSYSTEM ==========
    try {
      const startOfDay = new Date();
      startOfDay.setHours(0, 0, 0, 0);
      const sinceIso = startOfDay.toISOString();
      const todayStr = startOfDay.toISOString().split('T')[0];

      const [routineRes, doneTasksRes, hotRes, stacksRes, mentalitateRes, quizzesRes, beliefsRes, coursesRes, axesRes] = await Promise.all([
        supabaseClient.from('champion_routine_logs').select('*').eq('user_id', user.id).eq('date', todayStr).maybeSingle(),
        supabaseClient.from('user_tasks').select('title,task_type,updated_at').eq('user_id', user.id).eq('completed', true).gte('updated_at', sinceIso).limit(30),
        supabaseClient.from('hot_list_items').select('text,list_type,updated_at').eq('user_id', user.id).eq('completed', true).gte('updated_at', sinceIso).limit(30),
        supabaseClient.from('stack_sessions').select('stack_type,updated_at,completed').eq('user_id', user.id).gte('created_at', sinceIso).limit(20),
        supabaseClient.from('mentalitate_stack_sessions').select('completed,updated_at').eq('user_id', user.id).gte('created_at', sinceIso).limit(20),
        supabaseClient.from('mind_quiz_responses').select('completed_at').eq('user_id', user.id).gte('completed_at', sinceIso).limit(20),
        supabaseClient.from('belief_chapter_progress').select('completed_at,updated_at').eq('user_id', user.id).gte('updated_at', sinceIso).limit(20),
        supabaseClient.from('user_course_progress').select('completed,updated_at').eq('user_id', user.id).gte('updated_at', sinceIso).limit(20),
        supabaseClient.from('mind_axis_scores').select('axis,score_healthy,updated_at').eq('user_id', user.id),
      ]);

      const counts = { body: 0, being: 0, balance: 0, business: 0, mind: 0 };
      const bullets: string[] = [];
      const log: any = routineRes.data;
      if (log) {
        const inc = (a: keyof typeof counts, label: string) => { counts[a] += 1; bullets.push(`• [${a}] ${label}`); };
        if (log.water_drunk) inc('body', 'Hidratare');
        if (log.light_exposure) inc('body', 'Lumină de dimineață');
        if (log.exercise_completed) inc('body', 'Exerciții');
        if ((log.meals_logged?.length ?? 0) > 0) inc('body', `Mese logate (${log.meals_logged.length})`);
        if (log.meditation_duration_seconds > 0) inc('being', `Meditație ${Math.round(log.meditation_duration_seconds/60)} min`);
        if (log.autosuggestion_completed) inc('being', 'Autosugestie');
        if (log.vision_declaration_read) inc('being', 'Declarație viziune');
        if (log.visualization_completed) inc('being', 'Vizualizare');
        if (log.breathing_completed) inc('being', 'Respirație');
        if ((log.gratitude_items?.length ?? 0) > 0) inc('being', `Recunoștință (${log.gratitude_items.length})`);
        if (log.journaling_completed) inc('being', 'Jurnaling');
        if (log.reading_completed) inc('being', 'Citit');
        if (log.learn_completed) inc('business', 'Învățare');
        if (log.apply_completed) inc('business', 'Aplicare');
        if (log.content_topic) inc('business', 'Creare conținut');
        if ((log.relationship_actions?.length ?? 0) > 0) inc('balance', `Relații (${log.relationship_actions.length})`);
        if (log.emotional_transform_completed) inc('mind', 'Mind Shifting');
        if (log.stack_selection_completed) inc('mind', 'Stack ales');
      }
      (doneTasksRes.data ?? []).forEach((t: any) => { counts.business++; bullets.push(`• [business] Task: ${t.title}`); });
      (hotRes.data ?? []).forEach((t: any) => { counts.business++; bullets.push(`• [business] Hot list: ${t.text}`); });
      (stacksRes.data ?? []).forEach((s: any) => { if (s.completed) { counts.mind++; bullets.push(`• [mind] Stack ${s.stack_type||''} finalizat`); } });
      (mentalitateRes.data ?? []).forEach((s: any) => { if (s.completed) { counts.mind++; bullets.push('• [mind] Mentalitate Stack finalizat'); } });
      (quizzesRes.data ?? []).forEach(() => { counts.mind++; bullets.push('• [mind] Test Minte'); });
      (beliefsRes.data ?? []).forEach((b: any) => { counts.being++; bullets.push(b.completed_at ? '• [being] Capitol credințe finalizat' : '• [being] Progres pe credințe'); });
      (coursesRes.data ?? []).forEach((c: any) => { counts.business++; bullets.push(c.completed ? '• [business] Modul curs finalizat' : '• [business] Progres pe curs'); });

      const total = counts.body + counts.being + counts.balance + counts.business + counts.mind;
      userContext += `\n\n🕶️ SHADOW COACH — CE A FĂCUT UTILIZATORUL AZI (total ${total} acțiuni):\n`;
      userContext += `Distribuție pe axe: body:${counts.body} · being:${counts.being} · balance:${counts.balance} · business:${counts.business} · mind:${counts.mind}\n`;
      if (bullets.length) userContext += bullets.slice(0, 20).join('\n') + '\n';

      if (axesRes.data && axesRes.data.length) {
        userContext += '\n📊 SCORURI AXE (0-100):\n';
        (axesRes.data as any[]).forEach(a => {
          userContext += `- ${a.axis}: ${Math.round(Number(a.score_healthy ?? 0))}\n`;
        });
      }
      userContext += '\nREGULĂ SHADOW COACH: Când răspunzi, fă referire la ce a făcut deja azi (celebrează), la axa cea mai neglijată azi (împinge blând) și la scorul pe axe (unde e putere / unde e creștere). Nu inventa acțiuni. Dacă nu găsești date, spune că observi liniște și întreabă ce a făcut.\n';
    } catch (e) {
      console.error('Shadow coach snapshot failed:', e);
    }

    // ========== BUILD SYSTEM PROMPT WITH CONTEXT ==========
    
    const defaultSystemPrompt = language === 'ro' 
      ? `Tu ești Accountability Coach-ul personal al utilizatorului în platforma CEO Mind OS.

ROLUL TĂU:
1. Reamintești ce are de făcut - obiective, task-uri, rutina
2. Celebrezi victoriile - task-uri completate, streak-uri, progres
3. Ghidezi spre următorul pas concret
4. Detectezi când are nevoie de suport sau motivație
5. Previi burnout-ul prin observarea pattern-urilor

STILUL TĂU:
- Direct și practic - nu te pierde în detalii
- Empatic dar responsabil - înțelegi, dar împingi înainte
- Orientat spre acțiune - fiecare răspuns să aibă un next step clar
- Celebrezi progresul mic - fiecare pas contează
- Vorbești la persoana a doua singular (tu)

REGULI:
- Răspunsuri scurte și la obiect (max 3-4 propoziții)
- Folosește emoji-uri moderat pentru a face conversația prietenoasă
- Când nu știi ceva, întreabă
- FOLOSEȘTE CONTEXTUL de mai jos pentru a da sfaturi personalizate
${userContext}
${minte.promptBlock}`
      : `You are the user's personal Accountability Coach in the CEO Mind OS platform.

YOUR ROLE:
1. Remind what needs to be done - objectives, tasks, routine
2. Celebrate wins - completed tasks, streaks, progress
3. Guide toward the next concrete step
4. Detect when they need support or motivation
5. Prevent burnout by observing patterns

YOUR STYLE:
- Direct and practical - don't get lost in details
- Empathetic but accountable - understand, but push forward
- Action-oriented - every response should have a clear next step
- Celebrate small progress - every step counts

RULES:
- Short and to-the-point responses (max 3-4 sentences)
- Use emojis moderately to make conversation friendly
- When you don't know something, ask
- USE THE CONTEXT below to give personalized advice
${userContext}
${minte.promptBlock}`;

    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          { role: 'system', content: systemPrompt || defaultSystemPrompt },
          ...messages,
        ],
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: 'Rate limit exceeded. Please try again later.' }), {
          status: 429,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: 'Payment required. Please add credits.' }), {
          status: 402,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      const errorText = await response.text();
      console.error('AI gateway error:', response.status, errorText);
      throw new Error(`AI gateway error: ${response.status}`);
    }

    const data = await response.json();
    const aiResponse = data.choices?.[0]?.message?.content || 'Could not generate response.';

    return new Response(JSON.stringify({ response: aiResponse }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Accountability Coach error:', error);
    return new Response(JSON.stringify({ 
      error: error instanceof Error ? error.message : 'Unknown error' 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
