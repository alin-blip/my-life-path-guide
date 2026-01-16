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

  // Track activity
  const trackActivity = useCallback(async (data: ActivityData) => {
    if (!user?.id) return;

    try {
      // First, find or create the contact profile
      const { data: contact, error: contactError } = await supabase
        .from('crm_contact_profiles')
        .select('id')
        .eq('user_id', user.id)
        .single();

      if (contactError && contactError.code !== 'PGRST116') {
        console.error('Error finding contact:', contactError);
        return;
      }

      let contactId = contact?.id;

      // If no contact exists, create one
      if (!contactId && user.email) {
        const { data: newContact, error: createError } = await supabase
          .from('crm_contact_profiles')
          .insert({
            email: user.email,
            user_id: user.id,
            funnel_stage: 'engaged',
            lead_source: 'app_usage',
            lead_score: 25,
            account_created_at: new Date().toISOString()
          })
          .select('id')
          .single();

        if (createError) {
          console.error('Error creating contact:', createError);
          return;
        }
        contactId = newContact?.id;
      }

      if (!contactId) return;

      // Track the activity
      const { error: trackError } = await supabase
        .from('crm_activity_timeline')
        .insert([{
          contact_id: contactId,
          user_id: user.id,
          activity_type: data.activity_type,
          activity_title: data.activity_title,
          activity_data: data.activity_data ? JSON.parse(JSON.stringify(data.activity_data)) : null,
          page_path: data.page_path || location.pathname,
          session_id: sessionIdRef.current,
          device_type: getDeviceType()
        }]);

      if (trackError) {
        console.error('Error tracking activity:', trackError);
      }

      // Update last activity on contact profile
      await supabase
        .from('crm_contact_profiles')
        .update({ 
          last_activity_at: new Date().toISOString()
        })
        .eq('id', contactId);

    } catch (error) {
      console.error('Activity tracking error:', error);
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
  
  // Check for exact match
  if (titles[path]) return titles[path];
  
  // Check for partial matches
  for (const [key, value] of Object.entries(titles)) {
    if (path.startsWith(key) && key !== '/') return value;
  }
  
  return path;
}

// Export individual tracking functions for specific use cases
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
