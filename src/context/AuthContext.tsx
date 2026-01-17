
import React, { createContext, useContext, useEffect, useRef, useState } from 'react';
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
  refreshSubscription: (opts?: { silent?: boolean }) => Promise<void>;
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
  
  // Track if initial auth is complete to avoid re-triggering loading state
  const initialAuthComplete = useRef(false);

  useEffect(() => {
    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        // Only update if something actually changed, and don't re-trigger loading
        // after initial auth is complete (prevents flicker on tab switch)
        if (initialAuthComplete.current) {
          // After initial load, only update user/session silently
          setSession(session);
          setUser(session?.user ?? null);
          // Don't set loading to false again, it's already false
        } else {
          setSession(session);
          setUser(session?.user ?? null);
          setLoading(false);
          initialAuthComplete.current = true;
          
          // Mark as new user first session for onboarding flow
          if (event === 'SIGNED_IN' && session?.user?.created_at) {
            const createdAt = new Date(session.user.created_at);
            const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
            if (createdAt > fiveMinutesAgo) {
              localStorage.setItem('new-user-first-session', Date.now().toString());
              // Clear any stale onboarding flags for new users
              localStorage.removeItem('onboarding-wizard-completed');
              localStorage.removeItem('onboarding-wizard-skipped');
            }
          }
        }

        // Defer subscription check to avoid deadlocks
        setTimeout(() => {
          if (session?.user) {
            refreshSubscription({ silent: initialAuthComplete.current });
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

    // Initial session check
    const initAuth = async () => {
      try {
        const { data } = await supabase.auth.getSession();
        const session = data.session;
        setSession(session);
        setUser(session?.user ?? null);
        setLoading(false);
        initialAuthComplete.current = true;

        if (session?.user) {
          refreshSubscription();
        } else {
          setSubscriptionLoading(false);
        }
      } catch (error) {
        console.error('[auth] init error:', error);
        setLoading(false);
        setSubscriptionLoading(false);
        initialAuthComplete.current = true;
      }
    };

    initAuth();

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const refreshSubscription = async (opts?: { silent?: boolean }) => {
    const silent = Boolean(opts?.silent);

    try {
      if (!silent) setSubscriptionLoading(true);

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
      if (!silent) setSubscriptionLoading(false);
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
