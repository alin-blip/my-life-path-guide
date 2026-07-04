import React, { createContext, useContext, useEffect, useRef, useState } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { trackLead } from '@/lib/facebook-pixel';
import { migrateLocalJournalEntries } from '@/services/journalMigrationService';


interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean; // auth loading
  subscriptionLoading: boolean;
  subscriptionInitialized: boolean;
  subscribed: boolean;
  subscriptionTier: string | null;
  subscriptionEnd: string | null;
  trialExpired: boolean;

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
  const [subscriptionInitialized, setSubscriptionInitialized] = useState(false);

  const [subscribed, setSubscribed] = useState(false);
  const [subscriptionTier, setSubscriptionTier] = useState<string | null>(null);
  const [subscriptionEnd, setSubscriptionEnd] = useState<string | null>(null);
  const [trialExpired, setTrialExpired] = useState(false);

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
    // Set up auth state listener FIRST so INITIAL_SESSION drives startup.
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        // IGNORE token refresh events entirely — they fire on tab focus and
        // would otherwise cause re-renders + redirects in ProtectedRoute.
        if (event === 'TOKEN_REFRESHED' || event === 'USER_UPDATED') {
          if (import.meta.env.DEV) {
            console.log('[auth] ignoring', event, '(tab focus / silent refresh)');
          }
          return;
        }

        // PASSWORD_RECOVERY: user clicked the reset email link. Route to the
        // reset form no matter which page it opened on, so we never auto-log
        // them in without setting a new password.
        if (event === 'PASSWORD_RECOVERY') {
          setSession(session);
          setUser(session?.user ?? null);
          currentUserIdRef.current = session?.user?.id ?? null;
          setLoading(false);
          initialAuthComplete.current = true;
          if (!window.location.pathname.startsWith('/auth')) {
            window.location.replace('/auth?type=recovery');
          }
          return;
        }

        // After initial auth, only act on real transitions (sign in / sign out).
        // SIGNED_IN can fire on tab focus too — skip side-effects if user id is unchanged.
        const previousUserId = currentUserIdRef.current;
        const nextUserId = session?.user?.id ?? null;
        const isSameUser = initialAuthComplete.current && previousUserId === nextUserId;
        currentUserIdRef.current = nextUserId;

        setSession(session);
        setUser(session?.user ?? null);
        if (!initialAuthComplete.current) {
          setLoading(false);
          initialAuthComplete.current = true;
        }


        // CHALLENGE OAUTH LEAD CAPTURE — only on real new sign-ins, not tab focus re-fires
        if (event === 'SIGNED_IN' && session?.user && !isSameUser) {
          // One-shot migration of pre-auth localStorage journal entries
          migrateLocalJournalEntries(session.user.id).catch(err =>
            console.error('[AuthContext] journal migration failed:', err)
          );


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
        // INITIAL_SESSION also lands here on mount, so no separate initAuth is needed.
        setTimeout(() => {
          if (session?.user && !isSameUser) {
            refreshSubscription({ silent: initialAuthComplete.current && event !== 'INITIAL_SESSION' });
          } else if (!session?.user) {
            // Reset subscription state when logged out / no session
            setSubscribed(false);
            setSubscriptionTier(null);
            setSubscriptionEnd(null);
            setEarlyBirdExpiresAt(null);
            setSubscriptionLoading(false);
            setSubscriptionInitialized(true);

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

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  // Periodic silent re-check every 5 minutes so lapsed/canceled subscriptions
  // reflect on the client without requiring a full page reload.
  useEffect(() => {
    if (!user) return;
    const interval = setInterval(() => {
      refreshSubscription({ silent: true });
    }, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, [user]);


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
      setSubscriptionInitialized(true);
      return;
    }


    // Hard safety timeout: never leave subscriptionLoading true if the edge
    // function hangs. After 8s we release the loading flag and keep the last
    // known subscription state (do NOT reset to free — that would boot paid
    // users to /pricing).
    const releaseLoadingTimer = setTimeout(() => {
      if (!silent) setSubscriptionLoading(false);
      setSubscriptionInitialized(true);
    }, 8000);


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
        console.warn('[auth] subscription check failed (keeping last known state):', error);
        // Do NOT clear subscription state on transient errors — would cause
        // ProtectedRoute to redirect paid users to /pricing on tab focus.
        return;
      }

      const d = data as any;
      const endIso: string | null = d?.subscription_end ?? null;
      const endValid = endIso ? new Date(endIso).getTime() > Date.now() : true;
      // Client-side enforcement: if Stripe end date has passed but the webhook
      // hasn't downgraded yet, treat as unsubscribed. Prevents lapsed users
      // from keeping access after subscription_end.
      const subscribed = Boolean(d?.subscribed) && endValid;
      // Response uses `tier` (not `subscription_tier`) — earlier bug left tier=null for paid users.
      const tier = d?.tier ?? d?.subscription_tier ?? null;
      setSubscribed(subscribed);
      setSubscriptionTier(subscribed ? tier : null);
      setSubscriptionEnd(endIso);
      setTrialExpired(Boolean(d?.trial_expired) && !subscribed);
      setEarlyBirdExpiresAt((d?.early_bird_expires_at ?? null));

    } catch (e) {
      console.error('Error checking subscription (keeping last known state)', e);
      // Same as above — preserve last known subscription state on network errors.

    } finally {
      clearTimeout(releaseLoadingTimer);
      if (!silent) setSubscriptionLoading(false);
      setSubscriptionInitialized(true);
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
    subscriptionInitialized,

    subscribed,
    subscriptionTier,
    subscriptionEnd,
    trialExpired,

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
