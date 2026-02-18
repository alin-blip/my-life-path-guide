import React, { useEffect, useState } from 'react';
import { Navigate, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { useAdminAuth } from '@/hooks/useAdminAuth';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { RefreshCw, LogIn } from 'lucide-react';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

const LOADING_TIMEOUT_MS = 10000; // 10 seconds

// Routes available for FREE tier (habit tracking + challenges + Reality Map + Annual Goals for lead magnet)
const FREE_TIER_ROUTES = [
  '/dashboard',
  '/habits',
  '/challenge',
  '/challenge-7-zile',
  '/settings',
  '/profile',
  '/fact-maps', // Reality Map - accessible for lead magnet users
  '/game-objectives', // Annual Goals - accessible for lead magnet users (Life Score, Business 2026)
  '/game', // Redirect route to game-objectives
  '/vibe-canvas', // Creative canvas - accessible for all users
  '/warriors-way', // Warrior Accelerator - viewable by all, but content locked (only first video free)
];

// Routes available for BASIC tier (full platform without LIVE coaching)
const BASIC_ROUTES = [
  ...FREE_TIER_ROUTES,
  '/door',
  '/champion-routine',
  '/stacks',
  '/fact-maps',
  '/journal',
  '/insights',
  '/focus',
  '/clarity',
  '/anger',
  '/daily-flow',
  '/nutrition',
  '/activity',
  '/workouts',
  '/meditation',
  '/breathing',
  '/visualization',
  '/autosuggestion',
  '/gratitude',
  '/learn',
  '/apply',
  '/reading',
  '/evening',
  '/ai-coaching',
  '/vibe-canvas',
  '/lifebook',
  '/tools',
  '/stack',
  '/stack-library',
  '/master-plan',
  '/core',
  '/daily-four',
  '/library',
  '/notes',
  '/business',
  '/voice-analysis',
  '/daily-timeline',
  '/empowerment-meditation',
  '/biz4-report',
  '/champion-routine-history',
  '/workout',
  '/workout-history',
  '/relationships',
  '/widget-dashboard',
  '/leaderboard',
  '/achievements',
  '/emotional-tracker',
  '/time-tracker',
  '/accountability-coach',
  '/quick-quiz',
  '/coach',
  '/programs',
  '/personal-power',
  '/ultimate-you',
  '/groups',
  '/messages',
  '/mind-coach',
  '/support',
  '/dashboard/settings',
  '/warrior-accelerator-thank-you',
  '/vision-2026',
];

// Routes blocked for BASIC (require PRO or higher)
const PRO_REQUIRED_ROUTES = [
  '/brotherhood', // VIP Community
  '/live-coaching', // LIVE coaching sessions
];

// Routes that require ELITE tier
const ELITE_ONLY_ROUTES = [
  '/warrior-launch-accelerator', // Sales/checkout page - Elite only
];

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { user, loading, subscribed, subscriptionLoading, subscriptionTier } = useAuth();
  const { isAdmin, loading: adminLoading } = useAdminAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [showRecovery, setShowRecovery] = useState(false);

  const isLoading = loading || subscriptionLoading || adminLoading;

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

  // Determine user tier from subscriptionTier string
  const getUserTier = (): 'free' | 'basic' | 'pro' | 'elite' | null => {
    if (!subscriptionTier) return null;
    const t = subscriptionTier.toLowerCase();
    
    // Elite tier - has access to everything including Warrior Accelerator
    if (t.includes('elite')) return 'elite';
    
    // Pro tier - has access to LIVE coaching and VIP community
    if (t.includes('pro')) return 'pro';
    
    // Basic tier - full platform without LIVE coaching
    if (t.includes('basic')) return 'basic';
    
    // Trial users get basic access
    if (t.includes('trial')) return 'basic';
    
    // Free tier - only habits and challenges
    if (t.includes('free')) return 'free';
    
    // Default to basic for any active subscription
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
    
    // Free tier - only habits and challenges
    if (userTier === 'free' || !subscribed) {
      return FREE_TIER_ROUTES.some(route => path.startsWith(route));
    }
    
    return true;
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
