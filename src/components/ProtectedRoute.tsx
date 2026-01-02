
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

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { user, loading, subscribed, subscriptionLoading } = useAuth();
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

  if (!subscribed && !isAdmin) {
    return <Navigate to="/pricing" state={{ from: location, reason: 'membership_required' }} replace />;
  }

  return <>{children}</>;
};
