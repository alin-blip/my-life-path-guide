import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

interface EvalResult {
  key: string;
  metadata?: Record<string, unknown>;
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });

  try {
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(JSON.stringify({ error: 'unauthorized' }), { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
    );

    const userSupabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_ANON_KEY')!,
      { global: { headers: { Authorization: authHeader } } },
    );

    const { data: userData } = await userSupabase.auth.getUser();
    const user = userData?.user;
    if (!user) {
      return new Response(JSON.stringify({ error: 'unauthorized' }), { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    // Fetch signals
    const [statsRes, quizRes, planRes, wallRes, tasksRes, existingRes] = await Promise.all([
      supabase.from('user_statistics').select('current_streak, longest_streak').eq('user_id', user.id).maybeSingle(),
      supabase.from('quiz_routine_results').select('id, warrior_type').eq('user_id', user.id).limit(1).maybeSingle(),
      supabase.from('napoleon_hill_projects').select('id').eq('user_id', user.id).limit(1).maybeSingle(),
      supabase.from('wall_posts').select('id').eq('user_id', user.id).limit(1).maybeSingle(),
      supabase.from('user_tasks').select('id').eq('user_id', user.id).eq('completed', true).limit(1).maybeSingle(),
      supabase.from('achievement_unlocks').select('achievement_key').eq('user_id', user.id),
    ]);

    const streak = statsRes.data?.current_streak ?? 0;
    const already = new Set((existingRes.data ?? []).map((r) => r.achievement_key));

    const candidates: EvalResult[] = [];
    if (tasksRes.data) candidates.push({ key: 'first_step' });
    if (quizRes.data) candidates.push({ key: 'quiz_completed', metadata: { warrior_type: quizRes.data.warrior_type } });
    if (planRes.data) candidates.push({ key: 'first_master_plan' });
    if (wallRes.data) candidates.push({ key: 'first_brotherhood_post' });
    if (streak >= 3) candidates.push({ key: 'streak_3', metadata: { streak } });
    if (streak >= 7) candidates.push({ key: 'streak_7', metadata: { streak } });
    if (streak >= 14) candidates.push({ key: 'streak_14', metadata: { streak } });
    if (streak >= 30) candidates.push({ key: 'streak_30', metadata: { streak } });

    const toInsert = candidates.filter((c) => !already.has(c.key));
    const newlyUnlocked: EvalResult[] = [];

    if (toInsert.length > 0) {
      const rows = toInsert.map((c) => ({ user_id: user.id, achievement_key: c.key, metadata: c.metadata ?? {} }));
      const { data: inserted, error: insertErr } = await supabase
        .from('achievement_unlocks')
        .insert(rows)
        .select('achievement_key, metadata');
      if (insertErr) console.error('insert error', insertErr);
      else newlyUnlocked.push(...(inserted ?? []).map((r) => ({ key: r.achievement_key, metadata: r.metadata as Record<string, unknown> })));

      // Fire contextual emails for meaningful unlocks (fire-and-forget)
      if (newlyUnlocked.length > 0 && user.email) {
        const email = user.email;
        const displayName = (user.user_metadata?.display_name as string) || (user.user_metadata?.full_name as string) || email.split('@')[0];
        let language: 'ro' | 'en' = 'ro';
        try {
          const { data: prefs } = await supabase.from('user_preferences').select('language').eq('user_id', user.id).maybeSingle();
          if (prefs?.language === 'en' || prefs?.language === 'ro') language = prefs.language;
        } catch {}

        const STREAK_META: Record<string, { icon: string; title: string; reward?: string; days: number }> = {
          streak_3: { icon: '🔥', title: '3 zile consecutive', days: 3 },
          streak_7: { icon: '⚡', title: 'O săptămână de disciplină', days: 7, reward: '+2 sesiuni Mind Coach / lună' },
          streak_14: { icon: '💎', title: 'Două săptămâni fără compromis', days: 14, reward: 'Postări nelimitate în Brotherhood' },
          streak_30: { icon: '👑', title: 'Războinic consacrat', days: 30, reward: 'Badge Elite + Master Plan bonus' },
        };
        const ACTION_META: Record<string, { icon: string; title: string; description: string; reward?: string }> = {
          quiz_completed: { icon: '🧭', title: 'Războinicul Descoperit', description: 'Ți-ai aflat tipul de războinic.', reward: 'Badge Warrior Type' },
          first_master_plan: { icon: '🗺️', title: 'Primul Plan Strategic', description: 'Ai creat primul tău Master Plan.' },
          first_brotherhood_post: { icon: '🗣️', title: 'Voce în Trib', description: 'Prima postare în Brotherhood.' },
        };

        for (const nu of newlyUnlocked) {
          const streak = STREAK_META[nu.key];
          const action = ACTION_META[nu.key];
          try {
            if (streak) {
              await supabase.functions.invoke('send-transactional-email', {
                body: {
                  templateName: 'streak-milestone',
                  recipientEmail: email,
                  idempotencyKey: `streak-${nu.key}-${user.id}`,
                  templateData: { name: displayName, language, streakDays: streak.days, achievementTitle: streak.title, achievementIcon: streak.icon, reward: streak.reward },
                },
              });
            } else if (action) {
              await supabase.functions.invoke('send-transactional-email', {
                body: {
                  templateName: 'achievement-unlocked',
                  recipientEmail: email,
                  idempotencyKey: `ach-${nu.key}-${user.id}`,
                  templateData: { name: displayName, language, achievementTitle: action.title, achievementDescription: action.description, achievementIcon: action.icon, reward: action.reward },
                },
              });
            }
          } catch (mailErr) {
            console.warn('contextual email invoke failed', nu.key, mailErr);
          }
        }
      }
    }

    return new Response(
      JSON.stringify({ ok: true, streak, newly_unlocked: newlyUnlocked, total_unlocked: already.size + newlyUnlocked.length }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
    );
  } catch (e) {
    console.error('check-achievements error', e);
    return new Response(JSON.stringify({ error: String(e) }), { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
  }
});
