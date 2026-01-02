
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
    const AUTH_TIMEOUT_MS = 8000; // 8 seconds max for auth init
    let timeoutId: NodeJS.Timeout | null = null;
    let didResolve = false;

    const resetLocalSession = async () => {
      try {
        await supabase.auth.signOut({ scope: 'local' });
      } catch {
        // ignore
      }
      setSession(null);
      setUser(null);
      setLoading(false);
      setSubscribed(false);
      setSubscriptionTier(null);
      setSubscriptionEnd(null);
      setSubscriptionLoading(false);
    };

    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        didResolve = true;
        if (timeoutId) clearTimeout(timeoutId);
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
      }
    );

    // Check for existing session with timeout protection
    const initAuth = async () => {
      try {
        const sessionPromise = supabase.auth.getSession();
        const timeoutPromise = new Promise<null>((_, reject) => {
          timeoutId = setTimeout(() => {
            if (!didResolve) {
              reject(new Error('Auth timeout'));
            }
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
        // If timeout or network error, reset local session
        if (msg.includes('Auth timeout') || msg.includes('Failed to fetch')) {
          console.warn('Auth init failed/timed out, resetting local session');
          await resetLocalSession();
        } else {
          // Other errors: still stop loading
          setLoading(false);
          setSubscriptionLoading(false);
        }
      }
    };

    initAuth();

    return () => {
      subscription.unsubscribe();
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, []);

  const refreshSubscription = async () => {
    try {
      setSubscriptionLoading(true);
      const { data, error } = await supabase.functions.invoke('check-subscription');
      
      // Handle session expired error - sign out and reset state
      if (error || (data as any)?.error === 'session_expired') {
        console.warn('Session expired or subscription check failed, signing out');
        setSubscribed(false);
        setSubscriptionTier(null);
        setSubscriptionEnd(null);
        // If session is expired, sign out to clear stale tokens
        if ((data as any)?.error === 'session_expired') {
          await supabase.auth.signOut();
        }
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
