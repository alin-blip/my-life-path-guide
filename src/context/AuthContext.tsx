
import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean; // auth loading
  subscriptionLoading: boolean;
  subscribed: boolean;
  subscriptionTier: string | null;
  subscriptionEnd: string | null;
  refreshSubscription: () => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true); // auth loading
  const [subscriptionLoading, setSubscriptionLoading] = useState(true);
  const [subscribed, setSubscribed] = useState(false);
  const [subscriptionTier, setSubscriptionTier] = useState<string | null>(null);
  const [subscriptionEnd, setSubscriptionEnd] = useState<string | null>(null);

  useEffect(() => {
    const AUTH_TIMEOUT_MS = 15000; // 15s max for auth init (avoid false sign-outs on slow tab restore)
    let timeoutId: NodeJS.Timeout | null = null;
    let retryTimerId: NodeJS.Timeout | null = null;
    let didResolve = false;

    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        didResolve = true;
        if (timeoutId) clearTimeout(timeoutId);
        if (retryTimerId) clearTimeout(retryTimerId);

        setSession(session);
        setUser(session?.user ?? null);
        setLoading(false);

        // Defer subscription check to avoid deadlocks
        setTimeout(() => {
          if (session?.user) {
            refreshSubscription();
          } else {
            // Reset subscription state when logged out
            setSubscribed(false);
            setSubscriptionTier(null);
            setSubscriptionEnd(null);
            setSubscriptionLoading(false);
          }
        }, 0);

        if (import.meta.env.DEV) {
          console.log('[auth] state change:', event, {
            hasSession: Boolean(session),
            userId: session?.user?.id,
          });
        }
      }
    );

    const initAuth = async () => {
      try {
        // keep loading true until we resolve
        setLoading(true);

        const sessionPromise = supabase.auth.getSession();
        const timeoutPromise = new Promise<never>((_, reject) => {
          timeoutId = setTimeout(() => {
            if (!didResolve) reject(new Error('Auth timeout'));
          }, AUTH_TIMEOUT_MS);
        });

        const result = await Promise.race([sessionPromise, timeoutPromise]);

        if (result && 'data' in result) {
          didResolve = true;
          if (timeoutId) clearTimeout(timeoutId);

          const session = result.data.session;
          setSession(session);
          setUser(session?.user ?? null);
          setLoading(false);

          if (session?.user) {
            refreshSubscription();
          } else {
            setSubscriptionLoading(false);
          }
        }
      } catch (error: any) {
        const msg = String(error?.message ?? '');

        // IMPORTANT: do NOT sign out / clear local tokens on timeouts.
        // On mobile/tab-restore, networking can be slow and would incorrectly log the user out.
        if (msg.includes('Auth timeout') || msg.includes('Failed to fetch')) {
          console.warn('[auth] init delayed, will retry (no sign out):', msg);

          if (retryTimerId) clearTimeout(retryTimerId);
          retryTimerId = setTimeout(() => {
            didResolve = false;
            initAuth();
          }, 1500);

          return;
        }

        // Other errors: stop loading to avoid infinite spinners
        setLoading(false);
        setSubscriptionLoading(false);
      }
    };

    const handleVisibilityChange = () => {
      // When the tab becomes visible again, re-check the session.
      // This helps after browser tab discard / throttling.
      if (!document.hidden) {
        initAuth();
      }
    };

    initAuth();
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      subscription.unsubscribe();
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      if (timeoutId) clearTimeout(timeoutId);
      if (retryTimerId) clearTimeout(retryTimerId);
    };
  }, []);

  const refreshSubscription = async () => {
    try {
      setSubscriptionLoading(true);

      const invokeCheck = () => supabase.functions.invoke('check-subscription');

      let { data, error } = await invokeCheck();

      // If token is stale/expired, try to refresh once instead of logging out.
      if ((data as any)?.error === 'session_expired') {
        console.warn('[auth] subscription check says session_expired; attempting refreshSession()');

        const { data: refreshed, error: refreshError } = await supabase.auth.refreshSession();
        if (refreshError || !refreshed.session) {
          console.warn('[auth] refreshSession failed; signing out');
          await supabase.auth.signOut();
          return;
        }

        // Retry once with the refreshed session
        ({ data, error } = await invokeCheck());
      }

      if (error) {
        console.warn('[auth] subscription check failed (no sign out):', error);
        setSubscribed(false);
        setSubscriptionTier(null);
        setSubscriptionEnd(null);
        return;
      }

      const subscribed = Boolean((data as any)?.subscribed);
      setSubscribed(subscribed);
      setSubscriptionTier(((data as any)?.subscription_tier ?? null));
      setSubscriptionEnd(((data as any)?.subscription_end ?? null));
    } catch (e) {
      console.error('Error checking subscription', e);
      setSubscribed(false);
      setSubscriptionTier(null);
      setSubscriptionEnd(null);
    } finally {
      setSubscriptionLoading(false);
    }
  };
  const signOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  };

  const value = {
    user,
    session,
    loading,
    subscriptionLoading,
    subscribed,
    subscriptionTier,
    subscriptionEnd,
    refreshSubscription,
    signOut
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
