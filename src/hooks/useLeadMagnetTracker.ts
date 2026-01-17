import { useCallback, useRef, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

type LeadMagnet = 'warrior_power' | 'vision_2026';
type EventType = 
  | 'page_view' 
  | 'cta_click' 
  | 'quiz_start' 
  | 'step_complete' 
  | 'lead_capture' 
  | 'quiz_complete' 
  | 'results_view' 
  | 'bounce'
  | 'scroll_depth';

interface TrackEventParams {
  eventType: EventType;
  eventData?: Record<string, unknown>;
}

export const useLeadMagnetTracker = (leadMagnet: LeadMagnet) => {
  const sessionIdRef = useRef<string>('');
  const emailRef = useRef<string | null>(null);
  const startTimeRef = useRef<number>(Date.now());
  const hasTrackedBounceRef = useRef(false);

  // Initialize session
  useEffect(() => {
    let sessionId = sessionStorage.getItem(`lm_session_${leadMagnet}`);
    if (!sessionId) {
      sessionId = `${leadMagnet}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      sessionStorage.setItem(`lm_session_${leadMagnet}`, sessionId);
    }
    sessionIdRef.current = sessionId;
    startTimeRef.current = Date.now();

    // Track initial page view
    trackEvent({ eventType: 'page_view' });

    // Track bounce on page unload (if no significant interaction)
    const handleBeforeUnload = () => {
      if (!hasTrackedBounceRef.current) {
        const timeSpent = Math.floor((Date.now() - startTimeRef.current) / 1000);
        // Consider it a bounce if less than 30 seconds and no email captured
        if (timeSpent < 30 && !emailRef.current) {
          trackEventSync({ 
            eventType: 'bounce', 
            eventData: { time_spent_seconds: timeSpent } 
          });
        }
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [leadMagnet]);

  const getDeviceType = (): string => {
    const width = window.innerWidth;
    if (width < 768) return 'mobile';
    if (width < 1024) return 'tablet';
    return 'desktop';
  };

  // Async tracking (normal use)
  const trackEvent = useCallback(async ({ eventType, eventData = {} }: TrackEventParams) => {
    try {
      const timeSpent = Math.floor((Date.now() - startTimeRef.current) / 1000);
      
      await supabase.from('lead_magnet_events').insert({
        email: emailRef.current,
        session_id: sessionIdRef.current,
        lead_magnet: leadMagnet,
        event_type: eventType,
        event_data: { ...eventData, time_on_page_seconds: timeSpent },
        page_path: window.location.pathname,
        referrer: document.referrer || null,
        device_type: getDeviceType()
      });

      // Mark significant interaction
      if (['cta_click', 'quiz_start', 'lead_capture', 'quiz_complete'].includes(eventType)) {
        hasTrackedBounceRef.current = true;
      }

      console.log(`📊 [${leadMagnet}] ${eventType}`, eventData);
    } catch (error) {
      console.error('Tracking error:', error);
    }
  }, [leadMagnet]);

  // Sync tracking for beforeunload (uses sendBeacon)
  const trackEventSync = useCallback(({ eventType, eventData = {} }: TrackEventParams) => {
    try {
      const payload = {
        email: emailRef.current,
        session_id: sessionIdRef.current,
        lead_magnet: leadMagnet,
        event_type: eventType,
        event_data: eventData,
        page_path: window.location.pathname,
        referrer: document.referrer || null,
        device_type: getDeviceType()
      };

      // Use sendBeacon for reliable tracking on page unload
      const blob = new Blob([JSON.stringify(payload)], { type: 'application/json' });
      navigator.sendBeacon(
        `${import.meta.env.VITE_SUPABASE_URL}/rest/v1/lead_magnet_events`,
        blob
      );
    } catch (error) {
      console.error('Sync tracking error:', error);
    }
  }, [leadMagnet]);

  // Set email when captured
  const setEmail = useCallback((email: string) => {
    emailRef.current = email;
    hasTrackedBounceRef.current = true; // Don't track as bounce after email capture
  }, []);

  // Track CTA click
  const trackCTAClick = useCallback((ctaName: string) => {
    trackEvent({ eventType: 'cta_click', eventData: { cta_name: ctaName } });
  }, [trackEvent]);

  // Track quiz start
  const trackQuizStart = useCallback(() => {
    trackEvent({ eventType: 'quiz_start' });
  }, [trackEvent]);

  // Track step completion
  const trackStepComplete = useCallback((stepNumber: number, stepName?: string) => {
    trackEvent({ 
      eventType: 'step_complete', 
      eventData: { step_number: stepNumber, step_name: stepName } 
    });
  }, [trackEvent]);

  // Track lead capture
  const trackLeadCapture = useCallback((email: string, name?: string) => {
    setEmail(email);
    trackEvent({ 
      eventType: 'lead_capture', 
      eventData: { email, name } 
    });
  }, [trackEvent, setEmail]);

  // Track quiz completion with scores
  const trackQuizComplete = useCallback((scores: Record<string, number>) => {
    trackEvent({ 
      eventType: 'quiz_complete', 
      eventData: { scores, total_time_seconds: Math.floor((Date.now() - startTimeRef.current) / 1000) } 
    });
  }, [trackEvent]);

  // Track results view
  const trackResultsView = useCallback(() => {
    trackEvent({ eventType: 'results_view' });
  }, [trackEvent]);

  // Track scroll depth
  const trackScrollDepth = useCallback((depth: number) => {
    trackEvent({ eventType: 'scroll_depth', eventData: { depth_percent: depth } });
  }, [trackEvent]);

  return {
    trackEvent,
    trackCTAClick,
    trackQuizStart,
    trackStepComplete,
    trackLeadCapture,
    trackQuizComplete,
    trackResultsView,
    trackScrollDepth,
    setEmail
  };
};
