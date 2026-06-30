import React, { createContext, useContext, useEffect, useRef, useState } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { trackLead } from '@/lib/facebook-pixel';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean; // auth loading
  subscriptionLoading: boolean;
  subscribed: boolean;
  subscriptionTier: string | null;
  subscriptionEnd: string | null;
  earlyBirdExpiresAt: string | null;
  isEarlyBirdActive: boolean;
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
  const [earlyBirdExpiresAt, setEarlyBirdExpiresAt] = useState<string | null>(null);
  
  // Compute isEarlyBirdActive
  const isEarlyBirdActive = earlyBirdExpiresAt 
    ? new Date(earlyBirdExpiresAt).getTime() > Date.now() 
    : false;
  
  // Track if initial auth is complete to avoid re-triggering loading state
  const initialAuthComplete = useRef(false);
  // Track current user id inside the auth listener (state closure is stale)
  const currentUserIdRef = useRef<string | null>(null);


  useEffect(() => {
    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        // IGNORE token refresh events entirely — they fire on tab focus and
        // would otherwise cause re-renders + redirects in ProtectedRoute.
        // The supabase client already keeps the session fresh internally.
        if (event === 'TOKEN_REFRESHED' || event === 'USER_UPDATED') {
          if (import.meta.env.DEV) {
            console.log('[auth] ignoring', event, '(tab focus / silent refresh)');
          }
          return;
        }

        // After initial auth, only act on real transitions (sign in / sign out / recovery).
        // SIGNED_IN can fire on tab focus too — skip side-effects if user id is unchanged.
        const previousUserId = currentUserIdRef.current;
        const nextUserId = session?.user?.id ?? null;
        const isSameUser = initialAuthComplete.current && previousUserId === nextUserId;
        currentUserIdRef.current = nextUserId;

        if (initialAuthComplete.current) {
          setSession(session);
          setUser(session?.user ?? null);
        } else {
          setSession(session);
          setUser(session?.user ?? null);
          setLoading(false);
          initialAuthComplete.current = true;
        }


        // CHALLENGE OAUTH LEAD CAPTURE — only on real new sign-ins, not tab focus re-fires
        if (event === 'SIGNED_IN' && session?.user && !isSameUser) {
          // Track login activity in CRM
          const sessionId = sessionStorage.getItem('crm_session_id') || `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
          supabase.from('crm_activity_timeline').insert([{
            user_id: session.user.id,
            activity_type: 'login',
            activity_title: 'User Login',
            page_path: window.location.pathname,
            session_id: sessionId,
            device_type: window.innerWidth < 768 ? 'mobile' : window.innerWidth < 1024 ? 'tablet' : 'desktop'
          }]).then(() => {});

          // CHALLENGE OAUTH LEAD CAPTURE
          const fromChallenge = window.location.pathname.includes('/challenge');
          if (fromChallenge && session.user.email) {
            // Track Meta Pixel Lead for challenge OAuth signups
            trackLead();
            const challengeLeadKey = `challenge_lead_saved_${session.user.id}`;
            if (!localStorage.getItem(challengeLeadKey)) {
              // Insert into email_leads
              supabase.from('email_leads').insert({
                email: session.user.email,
                lead_magnet: 'challenge_oauth',
                source: 'challenge-7-zile-oauth',
                metadata: { 
                  auth_provider: session.user.app_metadata?.provider || 'unknown',
                  signup_date: new Date().toISOString()
                }
              }).then((result) => {
                if (!result.error) {
                  localStorage.setItem(challengeLeadKey, 'true');
                }
              });
              
              // Upsert CRM contact with user_id linked
              supabase.from('crm_contact_profiles')
                .upsert({
                  email: session.user.email,
                  user_id: session.user.id,
                  funnel_stage: 'engaged',
                  lead_source: 'challenge_oauth',
                  account_created_at: new Date().toISOString()
                }, { onConflict: 'email' })
                .then(() => {});
              
              // Trimite welcome email pentru OAuth users
              supabase.functions.invoke('send-challenge-welcome', {
                body: {
                  email: session.user.email,
                  name: session.user.user_metadata?.full_name || session.user.user_metadata?.name || '',
                  userId: session.user.id,
                  language: 'ro'
                }
              }).catch(err => console.warn('[Challenge] Welcome email failed:', err));
              
              if (import.meta.env.DEV) {
                console.log('[Challenge] OAuth lead saved for:', session.user.email);
              }
            }
          }
        }

        // Defer subscription check to avoid deadlocks.
        // Skip if it's just the same user re-firing (tab focus) — we already have the data.
        setTimeout(() => {
          if (session?.user && !isSameUser) {
            refreshSubscription({ silent: initialAuthComplete.current });
          } else if (!session?.user) {
            // Reset subscription state when logged out
            setSubscribed(false);
            setSubscriptionTier(null);
            setSubscriptionEnd(null);
            setEarlyBirdExpiresAt(null);
            setSubscriptionLoading(false);
          }
        }, 0);

        if (import.meta.env.DEV) {
          console.log('[auth] state change:', event, {
            hasSession: Boolean(session),
            userId: session?.user?.id,
            isSameUser,
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

    // Don't attempt subscription check if there's no session
    const { data: sessionData } = await supabase.auth.getSession();
    if (!sessionData?.session) {
      setSubscribed(false);
      setSubscriptionTier(null);
      setSubscriptionEnd(null);
      setEarlyBirdExpiresAt(null);
      if (!silent) setSubscriptionLoading(false);
      return;
    }

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
        setEarlyBirdExpiresAt(null);
        return;
      }

      const subscribed = Boolean((data as any)?.subscribed);
      setSubscribed(subscribed);
      setSubscriptionTier(((data as any)?.subscription_tier ?? null));
      setSubscriptionEnd(((data as any)?.subscription_end ?? null));
      setEarlyBirdExpiresAt(((data as any)?.early_bird_expires_at ?? null));
    } catch (e) {
      console.error('Error checking subscription', e);
      setSubscribed(false);
      setSubscriptionTier(null);
      setSubscriptionEnd(null);
      setEarlyBirdExpiresAt(null);
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
    earlyBirdExpiresAt,
    isEarlyBirdActive,
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
