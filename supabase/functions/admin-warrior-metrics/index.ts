import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response(null, { headers: corsHeaders });

  try {
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(JSON.stringify({ error: 'unauthorized' }), { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    const userClient = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_ANON_KEY')!,
      { global: { headers: { Authorization: authHeader } } },
    );
    const { data: userData } = await userClient.auth.getUser();
    const user = userData?.user;
    if (!user) return new Response(JSON.stringify({ error: 'unauthorized' }), { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });

    const { data: isAdmin } = await userClient.rpc('has_role', { _user_id: user.id, _role: 'admin' });
    if (!isAdmin) return new Response(JSON.stringify({ error: 'forbidden' }), { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });

    const admin = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!);

    const since30 = new Date(Date.now() - 30 * 24 * 3600 * 1000).toISOString();
    const since7 = new Date(Date.now() - 7 * 24 * 3600 * 1000).toISOString();

    const [quizAll, quizActivated, flowAll, flowCompleted, features, achievements, stats] = await Promise.all([
      admin.from('quiz_routine_results').select('warrior_type, activated_at, created_at'),
      admin.from('quiz_routine_results').select('id').not('activated_at', 'is', null),
      admin.from('daily_flow_sessions').select('id, user_id, completed_at, created_at').gte('created_at', since30),
      admin.from('daily_flow_sessions').select('id').gte('created_at', since30).not('completed_at', 'is', null),
      admin.from('feature_usage_log').select('feature_key, tier, used_at').gte('used_at', since30),
      admin.from('achievement_unlocks').select('achievement_key, unlocked_at'),
      admin.from('user_statistics').select('user_id, current_streak, longest_streak'),
    ]);

    // Quiz distribution
    const quizDist: Record<string, number> = {};
    let quizTotal = 0;
    for (const q of quizAll.data ?? []) {
      quizDist[q.warrior_type] = (quizDist[q.warrior_type] ?? 0) + 1;
      quizTotal++;
    }
    const activatedCount = quizActivated.data?.length ?? 0;
    const activationRate = quizTotal > 0 ? Math.round((activatedCount / quizTotal) * 1000) / 10 : 0;

    // Daily flow (30d)
    const flowTotal = flowAll.data?.length ?? 0;
    const flowCompletedCount = flowCompleted.data?.length ?? 0;
    const uniqueActiveUsers = new Set((flowAll.data ?? []).map(r => r.user_id)).size;
    const activeLast7 = new Set((flowAll.data ?? []).filter(r => r.created_at >= since7).map(r => r.user_id)).size;

    // Feature usage 30d
    const featureUsage: Record<string, { total: number; free: number; paid: number }> = {};
    for (const f of features.data ?? []) {
      const key = f.feature_key ?? 'unknown';
      featureUsage[key] = featureUsage[key] ?? { total: 0, free: 0, paid: 0 };
      featureUsage[key].total++;
      if (f.tier === 'free' || !f.tier) featureUsage[key].free++;
      else featureUsage[key].paid++;
    }

    // Achievement funnel
    const achieveDist: Record<string, number> = {};
    for (const a of achievements.data ?? []) {
      achieveDist[a.achievement_key] = (achieveDist[a.achievement_key] ?? 0) + 1;
    }

    // Streak buckets
    const buckets = { '0': 0, '1-2': 0, '3-6': 0, '7-13': 0, '14-29': 0, '30+': 0 };
    let longestOverall = 0;
    for (const s of stats.data ?? []) {
      const cs = s.current_streak ?? 0;
      if (cs === 0) buckets['0']++;
      else if (cs < 3) buckets['1-2']++;
      else if (cs < 7) buckets['3-6']++;
      else if (cs < 14) buckets['7-13']++;
      else if (cs < 30) buckets['14-29']++;
      else buckets['30+']++;
      if ((s.longest_streak ?? 0) > longestOverall) longestOverall = s.longest_streak ?? 0;
    }

    return new Response(JSON.stringify({
      ok: true,
      generated_at: new Date().toISOString(),
      quiz: {
        total: quizTotal,
        activated: activatedCount,
        activation_rate_pct: activationRate,
        distribution: quizDist,
      },
      routine: {
        sessions_30d: flowTotal,
        completed_30d: flowCompletedCount,
        completion_rate_pct: flowTotal > 0 ? Math.round((flowCompletedCount / flowTotal) * 1000) / 10 : 0,
        unique_users_30d: uniqueActiveUsers,
        unique_users_7d: activeLast7,
      },
      streaks: {
        buckets,
        longest_overall: longestOverall,
        total_users_tracked: stats.data?.length ?? 0,
      },
      features: featureUsage,
      achievements: achieveDist,
    }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
  } catch (e) {
    console.error('admin-warrior-metrics error', e);
    return new Response(JSON.stringify({ error: String(e) }), { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
  }
});
