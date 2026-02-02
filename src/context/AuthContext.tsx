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
        }

        // CENTRALIZED FB PIXEL LEAD TRACKING
        // Track Lead event on SIGNED_IN (new account creation or first login)
        if (event === 'SIGNED_IN' && session?.user) {
          const leadTrackedKey = `fb_lead_tracked_${session.user.id}`;
          const alreadyTracked = localStorage.getItem(leadTrackedKey);
          if (!alreadyTracked) {
            trackLead();
            localStorage.setItem(leadTrackedKey, 'true');
            if (import.meta.env.DEV) {
              console.log('[FB Pixel] Lead event tracked for user:', session.user.id);
            }
          }
          
          // CHALLENGE OAUTH LEAD CAPTURE
          // Save lead + link CRM profile when user comes from challenge via OAuth
          const fromChallenge = window.location.pathname.includes('/challenge');
          if (fromChallenge && session.user.email) {
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

        // Defer subscription check to avoid deadlocks
        setTimeout(() => {
          if (session?.user) {
            refreshSubscription({ silent: initialAuthComplete.current });
          } else {
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
