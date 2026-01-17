import { useCallback, useEffect, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';

type CheckoutEventType = 
  | 'upsell_view' 
  | 'plan_click' 
  | 'checkout_start' 
  | 'checkout_redirect' 
  | 'checkout_error' 
  | 'auth_redirect'
  | 'continue_free';

interface TrackCheckoutEventParams {
  eventType: CheckoutEventType;
  planId?: string;
  errorMessage?: string;
  metadata?: Record<string, any>;
}

export function useCheckoutTracking(source: 'warrior_power' | 'vision_2026' | 'pricing_page') {
  const sessionIdRef = useRef<string>('');
  const viewTrackedRef = useRef(false);

  // Initialize session ID
  useEffect(() => {
    const existingSessionId = sessionStorage.getItem(`checkout_session_${source}`);
    if (existingSessionId) {
      sessionIdRef.current = existingSessionId;
    } else {
      sessionIdRef.current = `${source}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      sessionStorage.setItem(`checkout_session_${source}`, sessionIdRef.current);
    }
  }, [source]);

  const trackEvent = useCallback(async ({ eventType, planId, errorMessage, metadata = {} }: TrackCheckoutEventParams) => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      const payload = {
        user_id: session?.user?.id || null,
        session_id: sessionIdRef.current,
        event_type: eventType,
        plan_id: planId || null,
        source,
        error_message: errorMessage || null,
        metadata: {
          ...metadata,
          user_agent: navigator.userAgent,
          screen_width: window.innerWidth,
          referrer: document.referrer || null,
          url: window.location.href,
        },
      };

      console.log(`📊 [Checkout Tracking] ${eventType}:`, { source, planId, errorMessage });

      const { error } = await supabase.from('checkout_events').insert(payload);
      
      if (error) {
        console.error('❌ [Checkout Tracking] Failed to track:', error.message);
      } else {
        console.log(`✅ [Checkout Tracking] ${eventType} tracked successfully`);
      }
    } catch (err) {
      console.error('❌ [Checkout Tracking] Error:', err);
    }
  }, [source]);

  // Track upsell view on mount (only once)
  const trackUpsellView = useCallback((metadata?: Record<string, any>) => {
    if (viewTrackedRef.current) return;
    viewTrackedRef.current = true;
    trackEvent({ eventType: 'upsell_view', metadata });
  }, [trackEvent]);

  const trackPlanClick = useCallback((planId: string) => {
    trackEvent({ eventType: 'plan_click', planId });
  }, [trackEvent]);

  const trackCheckoutStart = useCallback((planId: string) => {
    trackEvent({ eventType: 'checkout_start', planId });
  }, [trackEvent]);

  const trackCheckoutRedirect = useCallback((planId: string, checkoutUrl: string) => {
    trackEvent({ eventType: 'checkout_redirect', planId, metadata: { checkout_url: checkoutUrl } });
  }, [trackEvent]);

  const trackCheckoutError = useCallback((planId: string, errorMessage: string) => {
    trackEvent({ eventType: 'checkout_error', planId, errorMessage });
  }, [trackEvent]);

  const trackAuthRedirect = useCallback((planId: string) => {
    trackEvent({ eventType: 'auth_redirect', planId });
  }, [trackEvent]);

  const trackContinueFree = useCallback(() => {
    trackEvent({ eventType: 'continue_free' });
  }, [trackEvent]);

  return {
    trackUpsellView,
    trackPlanClick,
    trackCheckoutStart,
    trackCheckoutRedirect,
    trackCheckoutError,
    trackAuthRedirect,
    trackContinueFree,
  };
}
