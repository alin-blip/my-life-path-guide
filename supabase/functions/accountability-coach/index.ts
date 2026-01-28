import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

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
      .select('title, completed, priority, is_key_point')
      .eq('user_id', user.id)
      .eq('day_of_week', todayAbbrev)
      .eq('completed', false)
      .order('priority', { ascending: true })
      .limit(10);

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
      userContext += '\n\n📋 TASK-URI PENTRU AZI (necompletate):\n';
      todayTasks.forEach((t: any) => {
        const icon = t.is_key_point ? '🔑' : '•';
        userContext += `${icon} ${t.title}\n`;
      });
    }

    // ========== BUILD SYSTEM PROMPT WITH CONTEXT ==========
    
    const defaultSystemPrompt = language === 'ro' 
      ? `Tu ești Accountability Coach-ul personal al utilizatorului în platforma LifeOS.

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
${userContext}`
      : `You are the user's personal Accountability Coach in the LifeOS platform.

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
${userContext}`;

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
