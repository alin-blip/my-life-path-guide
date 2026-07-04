import { useMemo } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useAdminAuth } from '@/hooks/useAdminAuth';
import { TIER_LEVEL, type Tier, getRequiredTier } from '@/config/routeTiers';

/**
 * Central tier-access hook. Mirrors the logic in ProtectedRoute.getUserTier
 * so the sidebar, feature cards and the router agree on who can access what.
 * Admins always resolve to `elite` and bypass all gating.
 */
export function useTierAccess() {
  const { subscribed, subscriptionTier, subscriptionEnd, subscriptionLoading, loading } = useAuth();
  const { isAdmin, loading: adminLoading } = useAdminAuth();

  const tier: Tier = useMemo(() => {
    if (isAdmin) return 'elite';
    if (subscriptionEnd && new Date(subscriptionEnd).getTime() < Date.now()) return 'free';
    if (!subscribed) return 'free';
    if (!subscriptionTier) return 'free';
    const t = subscriptionTier.toLowerCase();
    if (t.includes('elite')) return 'elite';
    if (t.includes('accelerator')) return 'elite';
    if (t.includes('pro')) return 'pro';
    if (t.includes('basic')) return 'basic';
    if (t.includes('trial')) return 'basic';
    if (t.includes('free')) return 'free';
    return 'basic';
  }, [isAdmin, subscribed, subscriptionTier, subscriptionEnd]);

  const level = TIER_LEVEL[tier];

  const canAccess = (required: Tier | null | undefined): boolean => {
    if (isAdmin) return true;
    if (!required || required === 'free') return true;
    return level >= TIER_LEVEL[required];
  };

  const canAccessPath = (pathname: string): boolean => canAccess(getRequiredTier(pathname));

  return {
    tier,
    level,
    isAdmin,
    canAccess,
    canAccessPath,
    isLoading: loading || subscriptionLoading || adminLoading,
  };
}

