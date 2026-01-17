import { useCallback, useRef, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

// Enable debug logging - set to false in production
const DEBUG = true;

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
  const isInitializedRef = useRef(false);

  const getDeviceType = (): string => {
    const width = window.innerWidth;
    if (width < 768) return 'mobile';
    if (width < 1024) return 'tablet';
    return 'desktop';
  };

  // Async tracking (normal use)
  const trackEvent = useCallback(async ({ eventType, eventData = {} }: TrackEventParams) => {
    // Check if session is initialized
    if (!sessionIdRef.current) {
      console.error(`❌ [${leadMagnet}] Cannot track ${eventType}: Session ID not initialized yet`);
      return;
    }

    const timeSpent = Math.floor((Date.now() - startTimeRef.current) / 1000);
    
    const payload = {
      email: emailRef.current,
      session_id: sessionIdRef.current,
      lead_magnet: leadMagnet,
      event_type: eventType,
      event_data: { ...eventData, time_on_page_seconds: timeSpent },
      page_path: window.location.pathname,
      referrer: document.referrer || null,
      device_type: getDeviceType()
    };

    if (DEBUG) {
      console.log(`📤 [${leadMagnet}] Sending ${eventType}:`, {
        session_id: payload.session_id,
        event_type: payload.event_type,
        device_type: payload.device_type,
        referrer: payload.referrer,
        event_data: payload.event_data
      });
    }

    try {
      const { data, error } = await supabase
        .from('lead_magnet_events')
        .insert(payload)
        .select();

      if (error) {
        console.error(`❌ [${leadMagnet}] Failed to track ${eventType}:`, {
          message: error.message,
          details: error.details,
          hint: error.hint,
          code: error.code
        });
      } else {
        if (DEBUG) {
          console.log(`✅ [${leadMagnet}] Tracked ${eventType} successfully`, {
            id: data?.[0]?.id,
            created_at: data?.[0]?.created_at
          });
        }
      }

      // Mark significant interaction
      if (['cta_click', 'quiz_start', 'lead_capture', 'quiz_complete'].includes(eventType)) {
        hasTrackedBounceRef.current = true;
        if (DEBUG) console.log(`🎯 [${leadMagnet}] Marked significant interaction: ${eventType}`);
      }
    } catch (error) {
      console.error(`❌ [${leadMagnet}] Exception tracking ${eventType}:`, error);
    }
  }, [leadMagnet]);

  // Sync tracking for beforeunload (uses fetch with keepalive)
  const trackEventSync = useCallback(({ eventType, eventData = {} }: TrackEventParams) => {
    if (!sessionIdRef.current) {
      console.error(`❌ [${leadMagnet}] Cannot sync track ${eventType}: Session ID not initialized`);
      return;
    }

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

    if (DEBUG) {
      console.log(`📡 [${leadMagnet}] Sync tracking ${eventType}:`, payload);
    }

    try {
      // Use fetch with keepalive instead of sendBeacon for proper authentication
      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
      const supabaseKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;

      if (!supabaseUrl || !supabaseKey) {
        console.error(`❌ [${leadMagnet}] Missing Supabase environment variables for sync tracking`);
        return;
      }

      fetch(`${supabaseUrl}/rest/v1/lead_magnet_events`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'apikey': supabaseKey,
          'Authorization': `Bearer ${supabaseKey}`,
          'Prefer': 'return=minimal'
        },
        body: JSON.stringify(payload),
        keepalive: true // Critical for beforeunload
      }).then(response => {
        if (DEBUG) {
          if (response.ok) {
            console.log(`✅ [${leadMagnet}] Sync tracked ${eventType} successfully`);
          } else {
            console.error(`❌ [${leadMagnet}] Sync tracking failed with status:`, response.status);
          }
        }
      }).catch(err => {
        console.error(`❌ [${leadMagnet}] Sync tracking fetch error:`, err);
      });
    } catch (error) {
      console.error(`❌ [${leadMagnet}] Sync tracking exception:`, error);
    }
  }, [leadMagnet]);

  // Initialize session
  useEffect(() => {
    if (isInitializedRef.current) {
      if (DEBUG) console.log(`⚠️ [${leadMagnet}] Already initialized, skipping`);
      return;
    }

    const initSession = () => {
      let sessionId = sessionStorage.getItem(`lm_session_${leadMagnet}`);
      
      if (!sessionId) {
        sessionId = `${leadMagnet}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        sessionStorage.setItem(`lm_session_${leadMagnet}`, sessionId);
        if (DEBUG) console.log(`🆕 [${leadMagnet}] New session created:`, sessionId);
      } else {
        if (DEBUG) console.log(`♻️ [${leadMagnet}] Existing session restored:`, sessionId);
      }
      
      return sessionId;
    };

    // Initialize session ID FIRST
    sessionIdRef.current = initSession();
    startTimeRef.current = Date.now();
    isInitializedRef.current = true;

    if (DEBUG) {
      console.log(`🚀 [${leadMagnet}] Tracker initialized:`, {
        sessionId: sessionIdRef.current,
        startTime: new Date(startTimeRef.current).toISOString(),
        pathname: window.location.pathname,
        referrer: document.referrer || 'direct',
        deviceType: getDeviceType()
      });
    }

    // Track initial page view AFTER session is set
    trackEvent({ eventType: 'page_view' });

    // Track bounce on page unload (if no significant interaction)
    const handleBeforeUnload = () => {
      if (!hasTrackedBounceRef.current) {
        const timeSpent = Math.floor((Date.now() - startTimeRef.current) / 1000);
        // Consider it a bounce if less than 30 seconds and no email captured
        if (timeSpent < 30 && !emailRef.current) {
          if (DEBUG) console.log(`🔙 [${leadMagnet}] Tracking bounce (${timeSpent}s spent)`);
          trackEventSync({ 
            eventType: 'bounce', 
            eventData: { time_spent_seconds: timeSpent } 
          });
        }
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [leadMagnet, trackEvent, trackEventSync]);

  // Set email when captured
  const setEmail = useCallback((email: string) => {
    emailRef.current = email;
    hasTrackedBounceRef.current = true;
    if (DEBUG) console.log(`📧 [${leadMagnet}] Email set:`, email);
  }, [leadMagnet]);

  // Track CTA click
  const trackCTAClick = useCallback((ctaName: string) => {
    if (DEBUG) console.log(`👆 [${leadMagnet}] CTA clicked:`, ctaName);
    trackEvent({ eventType: 'cta_click', eventData: { cta_name: ctaName } });
  }, [leadMagnet, trackEvent]);

  // Track quiz start
  const trackQuizStart = useCallback(() => {
    if (DEBUG) console.log(`🎮 [${leadMagnet}] Quiz started`);
    trackEvent({ eventType: 'quiz_start' });
  }, [leadMagnet, trackEvent]);

  // Track step completion
  const trackStepComplete = useCallback((stepNumber: number, stepName?: string) => {
    if (DEBUG) console.log(`📍 [${leadMagnet}] Step ${stepNumber} complete:`, stepName);
    trackEvent({ 
      eventType: 'step_complete', 
      eventData: { step_number: stepNumber, step_name: stepName } 
    });
  }, [leadMagnet, trackEvent]);

  // Track lead capture
  const trackLeadCapture = useCallback((email: string, name?: string) => {
    if (DEBUG) console.log(`🎣 [${leadMagnet}] Lead captured:`, { email, name });
    setEmail(email);
    trackEvent({ 
      eventType: 'lead_capture', 
      eventData: { email, name } 
    });
  }, [leadMagnet, trackEvent, setEmail]);

  // Track quiz completion with scores
  const trackQuizComplete = useCallback((scores: Record<string, number>) => {
    const totalTime = Math.floor((Date.now() - startTimeRef.current) / 1000);
    if (DEBUG) console.log(`🏆 [${leadMagnet}] Quiz completed:`, { scores, totalTime });
    trackEvent({ 
      eventType: 'quiz_complete', 
      eventData: { scores, total_time_seconds: totalTime } 
    });
  }, [leadMagnet, trackEvent]);

  // Track results view
  const trackResultsView = useCallback(() => {
    if (DEBUG) console.log(`📊 [${leadMagnet}] Results viewed`);
    trackEvent({ eventType: 'results_view' });
  }, [leadMagnet, trackEvent]);

  // Track scroll depth
  const trackScrollDepth = useCallback((depth: number) => {
    if (DEBUG) console.log(`📜 [${leadMagnet}] Scroll depth:`, depth);
    trackEvent({ eventType: 'scroll_depth', eventData: { depth_percent: depth } });
  }, [leadMagnet, trackEvent]);

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
