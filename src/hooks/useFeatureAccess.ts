import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/context/AuthContext';

export type FeatureKey = 'mind_coach' | 'brotherhood_post' | 'master_plan';

export interface FeatureAccessStatus {
  allowed: boolean;
  unlimited: boolean;
  tier: string;
  used: number;
  limit: number | null;
  reset_at: string | null;
  feature_key: FeatureKey;
  reason?: 'limit_reached';
}

interface UseFeatureAccessResult {
  status: FeatureAccessStatus | null;
  loading: boolean;
  refresh: () => Promise<void>;
  /** Attempt to consume one unit. Returns true if allowed, false if blocked. */
  consume: () => Promise<boolean>;
}

/**
 * Check and consume rate-limited feature usage.
 * Free tier: enforces limits (Mind Coach 3/month, Brotherhood 1/week, Master Plan 1/month).
 * Paid tier: unlimited.
 */
export function useFeatureAccess(featureKey: FeatureKey): UseFeatureAccessResult {
  const { user } = useAuth();
  const [status, setStatus] = useState<FeatureAccessStatus | null>(null);
  const [loading, setLoading] = useState(true);

  const check = useCallback(async () => {
    if (!user) {
      setStatus(null);
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('check-feature-access', {
        body: { feature_key: featureKey, action: 'check' },
      });
      if (error) throw error;
      setStatus(data as FeatureAccessStatus);
    } catch (e) {
      console.error('[useFeatureAccess] check error', e);
      setStatus(null);
    } finally {
      setLoading(false);
    }
  }, [featureKey, user]);

  useEffect(() => { void check(); }, [check]);

  const consume = useCallback(async (): Promise<boolean> => {
    if (!user) return false;
    try {
      const { data, error } = await supabase.functions.invoke('check-feature-access', {
        body: { feature_key: featureKey, action: 'consume' },
      });
      if (error) throw error;
      const s = data as FeatureAccessStatus;
      setStatus(s);
      return s.allowed;
    } catch (e) {
      console.error('[useFeatureAccess] consume error', e);
      return false;
    }
  }, [featureKey, user]);

  return { status, loading, refresh: check, consume };
}
