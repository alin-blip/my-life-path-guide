import { supabase } from '@/integrations/supabase/client';

export interface RateLimitConfig {
  endpoint: string;
  maxRequests: number;
  windowMinutes: number;
}

export const RATE_LIMIT_CONFIGS: Record<string, RateLimitConfig> = {
  'ai-live-coaching': { endpoint: 'ai-live-coaching', maxRequests: 50, windowMinutes: 60 },
  'door-ai-planning': { endpoint: 'door-ai-planning', maxRequests: 20, windowMinutes: 60 },
  'hormozi-coaching': { endpoint: 'hormozi-coaching', maxRequests: 50, windowMinutes: 60 },
  'text-to-speech': { endpoint: 'text-to-speech', maxRequests: 100, windowMinutes: 60 },
  'whisper-transcribe': { endpoint: 'whisper-transcribe', maxRequests: 100, windowMinutes: 60 }
};

export async function checkRateLimit(endpoint: string): Promise<{ allowed: boolean; remaining: number }> {
  const config = RATE_LIMIT_CONFIGS[endpoint];
  if (!config) {
    return { allowed: true, remaining: 999 };
  }

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return { allowed: false, remaining: 0 };
  }

  const windowStart = new Date();
  windowStart.setMinutes(windowStart.getMinutes() - config.windowMinutes);

  // Check existing rate limit
  const { data: existing } = await supabase
    .from('rate_limits')
    .select('*')
    .eq('user_id', user.id)
    .eq('endpoint', endpoint)
    .gte('window_start', windowStart.toISOString())
    .order('window_start', { ascending: false })
    .limit(1)
    .single();

  if (existing) {
    const remaining = config.maxRequests - existing.request_count;
    if (existing.request_count >= config.maxRequests) {
      return { allowed: false, remaining: 0 };
    }

    // Increment count
    await supabase
      .from('rate_limits')
      .update({ request_count: existing.request_count + 1 })
      .eq('id', existing.id);

    return { allowed: true, remaining: remaining - 1 };
  }

  // Create new rate limit entry
  await supabase.from('rate_limits').insert({
    user_id: user.id,
    endpoint,
    request_count: 1,
    window_start: new Date().toISOString()
  });

  return { allowed: true, remaining: config.maxRequests - 1 };
}
