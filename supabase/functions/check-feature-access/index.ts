import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

type Period = 'month' | 'week' | 'day';

interface FeatureLimit {
  key: string;
  limit: number;
  period: Period;
  label: string;
}

// Limits for FREE tier. Paid tiers get unlimited.
// NOTE: mind_coach kept for analytics-only (no longer enforced as paywall);
// gating strategy moved to feature-based locks (Vision Board, Belief Reprogrammer, Domino horizons)
// combined with usage caps on stack_session + mind_shifting_session.
const FEATURE_LIMITS: Record<string, FeatureLimit> = {
  mind_coach: { key: 'mind_coach', limit: 999, period: 'month', label: 'Mind Coach sessions' },
  brotherhood_post: { key: 'brotherhood_post', limit: 1, period: 'week', label: 'Brotherhood posts' },
  master_plan: { key: 'master_plan', limit: 1, period: 'month', label: 'Master Plans' },
  stack_session: { key: 'stack_session', limit: 3, period: 'month', label: 'Stack sessions' },
  mind_shifting_session: { key: 'mind_shifting_session', limit: 3, period: 'month', label: 'Mind Shifting sessions' },
};

function periodKeyFor(period: Period, now = new Date()): string {
  const year = now.getUTCFullYear();
  if (period === 'day') {
    const m = String(now.getUTCMonth() + 1).padStart(2, '0');
    const d = String(now.getUTCDate()).padStart(2, '0');
    return `${year}-${m}-${d}`;
  }
  if (period === 'month') {
    const m = String(now.getUTCMonth() + 1).padStart(2, '0');
    return `${year}-${m}`;
  }
  // ISO week
  const d = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
  const dayNum = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  const week = Math.ceil((((d.getTime() - yearStart.getTime()) / 86400000) + 1) / 7);
  return `${d.getUTCFullYear()}-W${String(week).padStart(2, '0')}`;
}

function nextResetFor(period: Period, now = new Date()): string {
  const d = new Date(now);
  if (period === 'day') { d.setUTCDate(d.getUTCDate() + 1); d.setUTCHours(0, 0, 0, 0); }
  else if (period === 'month') { d.setUTCMonth(d.getUTCMonth() + 1, 1); d.setUTCHours(0, 0, 0, 0); }
  else {
    // next Monday
    const day = d.getUTCDay() || 7;
    d.setUTCDate(d.getUTCDate() + (8 - day));
    d.setUTCHours(0, 0, 0, 0);
  }
  return d.toISOString();
}

serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });

  try {
    const authHeader = req.headers.get('Authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return new Response(JSON.stringify({ error: 'Authentication required' }), {
        status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }
    const token = authHeader.slice(7);

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );

    const { data: userData, error: userErr } = await supabase.auth.getUser(token);
    if (userErr || !userData?.user) {
      return new Response(JSON.stringify({ error: 'Invalid token' }), {
        status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }
    const userId = userData.user.id;

    const body = await req.json().catch(() => ({}));
    const { feature_key, action = 'check' } = body as { feature_key?: string; action?: 'check' | 'consume' };

    if (!feature_key || !FEATURE_LIMITS[feature_key]) {
      return new Response(JSON.stringify({ error: 'Unknown feature_key' }), {
        status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const feature = FEATURE_LIMITS[feature_key];

    // Determine tier (any active subscription = paid = unlimited)
    const { data: sub } = await supabase
      .from('subscribers')
      .select('subscribed, subscription_tier, subscription_end')
      .eq('user_id', userId)
      .maybeSingle();

    const isPaid = !!(sub?.subscribed && sub.subscription_tier);
    const tier = isPaid ? (sub!.subscription_tier as string) : 'free';

    if (isPaid) {
      // Unlimited — still log if consuming, for analytics
      if (action === 'consume') {
        await supabase.from('feature_usage_log').insert({
          user_id: userId,
          feature_key,
          period_key: periodKeyFor(feature.period),
          metadata: { tier },
        });
      }
      return new Response(JSON.stringify({
        allowed: true,
        unlimited: true,
        tier,
        used: 0,
        limit: null,
        reset_at: null,
        feature_key,
      }), { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    // Free tier — count usage in current period
    const periodKey = periodKeyFor(feature.period);
    const { count, error: countErr } = await supabase
      .from('feature_usage_log')
      .select('id', { count: 'exact', head: true })
      .eq('user_id', userId)
      .eq('feature_key', feature_key)
      .eq('period_key', periodKey);

    if (countErr) {
      console.error('[check-feature-access] count error', countErr);
      return new Response(JSON.stringify({ error: countErr.message }), {
        status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const used = count || 0;
    const resetAt = nextResetFor(feature.period);

    if (action === 'consume') {
      if (used >= feature.limit) {
        return new Response(JSON.stringify({
          allowed: false,
          unlimited: false,
          tier,
          used,
          limit: feature.limit,
          reset_at: resetAt,
          feature_key,
          reason: 'limit_reached',
        }), { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
      }
      const { error: insErr } = await supabase.from('feature_usage_log').insert({
        user_id: userId,
        feature_key,
        period_key: periodKey,
        metadata: { tier },
      });
      if (insErr) {
        console.error('[check-feature-access] insert error', insErr);
        return new Response(JSON.stringify({ error: insErr.message }), {
          status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      return new Response(JSON.stringify({
        allowed: true,
        unlimited: false,
        tier,
        used: used + 1,
        limit: feature.limit,
        reset_at: resetAt,
        feature_key,
      }), { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    // action === 'check'
    return new Response(JSON.stringify({
      allowed: used < feature.limit,
      unlimited: false,
      tier,
      used,
      limit: feature.limit,
      reset_at: resetAt,
      feature_key,
    }), { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
  } catch (e) {
    console.error('[check-feature-access] error', e);
    return new Response(JSON.stringify({ error: (e as Error).message }), {
      status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
