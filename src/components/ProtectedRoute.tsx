import React, { useEffect, useState } from 'react';
import { Navigate, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { useAdminAuth } from '@/hooks/useAdminAuth';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { RefreshCw, LogIn } from 'lucide-react';
import {
  FREE_TIER_ROUTES,
  BASIC_ROUTES,
  PRO_REQUIRED_ROUTES,
  ELITE_ONLY_ROUTES,
} from '@/config/routeTiers';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

const LOADING_TIMEOUT_MS = 10000; // 10 seconds

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { user, loading, subscribed, subscriptionLoading, subscriptionTier, subscriptionEnd, trialExpired } = useAuth();
  const { isAdmin, loading: adminLoading } = useAdminAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [showRecovery, setShowRecovery] = useState(false);

  // Block on auth AND subscription so paid users aren't briefly treated as free tier
  // and bounced to /pricing during the check-subscription round-trip.
  const isLoading = loading || subscriptionLoading;

  useEffect(() => {
    if (!isLoading) {
      setShowRecovery(false);
      return;
    }

    const timer = setTimeout(() => {
      if (isLoading) {
        setShowRecovery(true);
      }
    }, LOADING_TIMEOUT_MS);

    return () => clearTimeout(timer);
  }, [isLoading]);

  const handleResetSession = async () => {
    try {
      await supabase.auth.signOut({ scope: 'local' });
    } catch {
      // ignore
    }
    window.location.href = '/auth';
  };

  const handleGoToAuth = () => {
    navigate('/auth');
  };

  // Determine user tier — ONLY if the subscription is actually active.
  // A lapsed subscription (subscribed=false or subscription_end in the past)
  // must resolve to 'free', regardless of what tier string is stored.
  const getUserTier = (): 'free' | 'basic' | 'pro' | 'elite' => {
    // Enforce end date on the client too — protects against webhook lag.
    if (subscriptionEnd && new Date(subscriptionEnd).getTime() < Date.now()) {
      return 'free';
    }
    if (!subscribed) return 'free';
    if (!subscriptionTier) return 'free';

    const t = subscriptionTier.toLowerCase();
    if (t.includes('elite')) return 'elite';
    if (t.includes('pro')) return 'pro';
    if (t.includes('basic')) return 'basic';
    if (t.includes('trial')) return 'basic';
    if (t.includes('accelerator')) return 'elite';
    if (t.includes('free')) return 'free';
    // Unknown but subscribed → assume basic (safer than elite)
    return 'basic';
  };

  const userTier = getUserTier();

  // Check if current route is allowed for user's tier
  const isRouteAllowed = (): boolean => {
    // Admins have access to everything
    if (isAdmin) return true;
    
    const path = location.pathname;
    
    // Elite has access to everything
    if (userTier === 'elite') return true;
    
    // Pro has access to everything except Elite-only routes
    if (userTier === 'pro') {
      if (ELITE_ONLY_ROUTES.some(route => path.startsWith(route))) {
        return false;
      }
      return true;
    }
    
    // Basic tier - full platform except Pro and Elite features
    if (userTier === 'basic') {
      // Block Pro-required routes
      if (PRO_REQUIRED_ROUTES.some(route => path.startsWith(route))) {
        return false;
      }
      // Block Elite-only routes
      if (ELITE_ONLY_ROUTES.some(route => path.startsWith(route))) {
        return false;
      }
      // Allow all basic routes
      return BASIC_ROUTES.some(route => path.startsWith(route));
    }
    
    // Free tier - only habits and challenges (default fallback for any lapsed/unknown case)
    return FREE_TIER_ROUTES.some(route => path.startsWith(route));
  };

  if (isLoading) {
    if (showRecovery) {
      return (
        <div className="min-h-screen bg-gradient-to-b from-[#0c1023] to-[#1a2242] flex items-center justify-center p-4">
          <div className="text-center space-y-6 max-w-md">
            <div className="text-white text-lg font-medium">
              Conexiunea la autentificare pare blocată.
            </div>
            <p className="text-white/70 text-sm">
              Dacă ai un adblock sau VPN activ, încearcă să-l dezactivezi. Altfel, resetează sesiunea.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Button onClick={handleGoToAuth} variant="outline" className="gap-2">
                <LogIn className="h-4 w-4" />
                Mergi la autentificare
              </Button>
              <Button onClick={handleResetSession} variant="default" className="gap-2">
                <RefreshCw className="h-4 w-4" />
                Resetează sesiunea
              </Button>
            </div>
          </div>
        </div>
      );
    }

    return (
      <div className="min-h-screen bg-gradient-to-b from-[#0c1023] to-[#1a2242] flex items-center justify-center">
        <div className="text-white">Loading...</div>
      </div>
    );
  }

  if (!user) {
    // Save the attempted URL for redirect after login
    return <Navigate to="/auth" state={{ from: location }} replace />;
  }

  // Check tier-based access
  if (!isRouteAllowed()) {
    const path = location.pathname;
    
    // Free users trying to access any paid features
    if (userTier === 'free' || !subscribed) {
      return <Navigate to="/pricing" state={{ from: location, reason: 'membership_required' }} replace />;
    }
    
    // Basic users trying to access Pro features (LIVE coaching, VIP community)
    if (userTier === 'basic' && PRO_REQUIRED_ROUTES.some(route => path.startsWith(route))) {
      return <Navigate to="/pricing" state={{ from: location, reason: 'pro_required' }} replace />;
    }
    
    // Basic/Pro users trying to access Elite features (Warrior Accelerator)
    if ((userTier === 'basic' || userTier === 'pro') && ELITE_ONLY_ROUTES.some(route => path.startsWith(route))) {
      return <Navigate to="/pricing" state={{ from: location, reason: 'elite_required' }} replace />;
    }
  }

  return <>{children}</>;
};
