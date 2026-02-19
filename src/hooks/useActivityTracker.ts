import { useEffect, useCallback, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/context/AuthContext';

interface ActivityData {
  activity_type: string;
  activity_title?: string;
  activity_data?: Record<string, unknown>;
  page_path?: string;
}

export const useActivityTracker = () => {
  const { user } = useAuth();
  const location = useLocation();
  const lastPageRef = useRef<string>('');
  const sessionIdRef = useRef<string>('');

  // Generate or get session ID
  useEffect(() => {
    let sessionId = sessionStorage.getItem('crm_session_id');
    if (!sessionId) {
      sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      sessionStorage.setItem('crm_session_id', sessionId);
    }
    sessionIdRef.current = sessionId;
  }, []);

  // Get device type
  const getDeviceType = useCallback((): string => {
    const width = window.innerWidth;
    if (width < 768) return 'mobile';
    if (width < 1024) return 'tablet';
    return 'desktop';
  }, []);

  // Track activity - simplified: insert directly with user_id, skip contact lookup
  const trackActivity = useCallback(async (data: ActivityData) => {
    if (!user?.id) return;

    try {
      const { error } = await supabase
        .from('crm_activity_timeline')
        .insert([{
          user_id: user.id,
          activity_type: data.activity_type,
          activity_title: data.activity_title,
          activity_data: data.activity_data ? JSON.parse(JSON.stringify(data.activity_data)) : null,
          page_path: data.page_path || location.pathname,
          session_id: sessionIdRef.current,
          device_type: getDeviceType()
        }]);

      if (error) {
        console.warn('Activity tracking failed:', error.message);
      }
    } catch (error) {
      // Silent fail - tracking should never break the app
    }
  }, [user, location.pathname, getDeviceType]);

  // Track page views
  useEffect(() => {
    if (!user?.id) return;
    if (location.pathname === lastPageRef.current) return;
    
    lastPageRef.current = location.pathname;

    // Don't track admin pages
    if (location.pathname.startsWith('/admin')) return;

    trackActivity({
      activity_type: 'page_view',
      activity_title: getPageTitle(location.pathname),
      page_path: location.pathname
    });
  }, [location.pathname, user?.id, trackActivity]);

  // Track specific events
  const trackEvent = useCallback((
    eventType: string, 
    title?: string, 
    data?: Record<string, unknown>
  ) => {
    trackActivity({
      activity_type: eventType,
      activity_title: title,
      activity_data: data
    });
  }, [trackActivity]);

  return { trackEvent };
};

// Helper to get page title from path
function getPageTitle(path: string): string {
  const titles: Record<string, string> = {
    '/': 'Dashboard',
    '/door': 'Door - Daily Tasks',
    '/stack': 'Stack Sessions',
    '/challenge': 'Challenge',
    '/warrior-power': 'Warrior Power Quiz',
    '/vision-2026': 'Vision 2026',
    '/life-score': 'Life Score',
    '/courses': 'Courses',
    '/journal': 'Journal',
    '/game-maps': 'Game Maps',
    '/impossible-game': 'Impossible Game',
    '/fact-maps': 'Fact Maps',
    '/lifebook': 'Lifebook',
    '/profile': 'Profile',
    '/settings': 'Settings'
  };
  
  if (titles[path]) return titles[path];
  
  for (const [key, value] of Object.entries(titles)) {
    if (path.startsWith(key) && key !== '/') return value;
  }
  
  return path;
}

// Export tracking helper functions
export const trackStackSession = (trackEvent: ReturnType<typeof useActivityTracker>['trackEvent']) => 
  (coachType: string, duration: number) => {
    trackEvent('stack_session', `Stack: ${coachType}`, { coachType, duration });
  };

export const trackChallengeDay = (trackEvent: ReturnType<typeof useActivityTracker>['trackEvent']) => 
  (dayNumber: number) => {
    trackEvent('challenge_day_complete', `Challenge Day ${dayNumber}`, { dayNumber });
  };

export const trackDoorTask = (trackEvent: ReturnType<typeof useActivityTracker>['trackEvent']) => 
  (taskType: string, taskTitle: string) => {
    trackEvent('door_task_complete', taskTitle, { taskType });
  };

export const trackPurchase = (trackEvent: ReturnType<typeof useActivityTracker>['trackEvent']) => 
  (productId: string, amount: number) => {
    trackEvent('purchase', `Purchase: ${productId}`, { productId, amount });
  };

export const trackLogin = (trackEvent: ReturnType<typeof useActivityTracker>['trackEvent']) => 
  () => {
    trackEvent('login', 'User Login', {});
  };
