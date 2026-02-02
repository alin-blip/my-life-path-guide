import { useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { useActivityTracker } from './useActivityTracker';

interface ChallengeDay {
  day_number: number;
  completed: boolean;
  completed_at: string | null;
  video_watched: boolean;
  actions_completed: string[];
}

export const useChallengeProgress = () => {
  const { user, subscribed, subscriptionTier } = useAuth();
  const { toast } = useToast();
  const { trackEvent } = useActivityTracker();
  const [progress, setProgress] = useState<ChallengeDay[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentDay, setCurrentDay] = useState(1);
  const [subscriptionStatus, setSubscriptionStatus] = useState<string | null>(null);
  const challengeStartedTrackedRef = useRef(false);

  // Check if user is authenticated
  const isAuthenticated = !!user?.id;
  
  // Check if user has premium access (subscribed or trialing)
  const hasPremiumAccess = subscribed || subscriptionStatus === 'trialing';

  const fetchProgress = useCallback(async () => {
    if (!user?.id) {
      setLoading(false);
      setProgress([]);
      return;
    }

    try {
      // Also fetch subscription status for trial detection
      const { data: subData } = await supabase.functions.invoke('check-subscription');
      if (subData?.subscription_status) {
        setSubscriptionStatus(subData.subscription_status);
      }
      
      const { data, error } = await supabase
        .from('challenge_progress')
        .select('*')
        .eq('user_id', user.id)
        .order('day_number', { ascending: true });

      if (error) throw error;

      const progressData = (data || []).map(item => ({
        day_number: item.day_number,
        completed: item.completed || false,
        completed_at: item.completed_at,
        video_watched: item.video_watched || false,
        actions_completed: (item.actions_completed as string[]) || []
      }));

      setProgress(progressData);
      
      // Calculate current day (first incomplete day or last day + 1)
      const completedDays = progressData.filter(d => d.completed).length;
      setCurrentDay(Math.min(completedDays + 1, 7));
    } catch (error) {
      console.error('Error fetching challenge progress:', error);
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  useEffect(() => {
    fetchProgress();
  }, [fetchProgress]);

  // Track challenge started when user first enters and has progress
  const trackChallengeStarted = useCallback(async () => {
    if (!user?.id || challengeStartedTrackedRef.current) return;
    challengeStartedTrackedRef.current = true;
    
    trackEvent('challenge_started', 'User started 7-Day Challenge', {});
    
    // Update CRM profile
    try {
      const { data: contact } = await supabase
        .from('crm_contact_profiles')
        .select('id, challenge_started_at')
        .eq('user_id', user.id)
        .single();
      
      if (contact && !contact.challenge_started_at) {
        await supabase
          .from('crm_contact_profiles')
          .update({ 
            challenge_started_at: new Date().toISOString(),
            challenge_current_day: 1
          })
          .eq('id', contact.id);
      }
    } catch (error) {
      console.error('Error updating CRM challenge start:', error);
    }
  }, [user?.id, trackEvent]);


  const markVideoWatched = async (dayNumber: number) => {
    if (!user?.id) return;

    try {
      const existingDay = progress.find(d => d.day_number === dayNumber);
      
      // Track video watched event
      trackEvent('challenge_video_watched', `Challenge Day ${dayNumber} Video Watched`, { dayNumber });
      
      if (existingDay) {
        const { error } = await supabase
          .from('challenge_progress')
          .update({ video_watched: true, updated_at: new Date().toISOString() })
          .eq('user_id', user.id)
          .eq('day_number', dayNumber);

        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('challenge_progress')
          .insert({
            user_id: user.id,
            day_number: dayNumber,
            video_watched: true,
            completed: false,
            actions_completed: []
          });

        if (error) throw error;
      }

      await fetchProgress();
    } catch (error) {
      console.error('Error marking video watched:', error);
    }
  };

  const completeAction = async (dayNumber: number, actionId: string) => {
    if (!user?.id) return;

    try {
      const existingDay = progress.find(d => d.day_number === dayNumber);
      const currentActions = existingDay?.actions_completed || [];
      
      if (currentActions.includes(actionId)) return;
      
      const newActions = [...currentActions, actionId];

      if (existingDay) {
        const { error } = await supabase
          .from('challenge_progress')
          .update({ 
            actions_completed: newActions, 
            updated_at: new Date().toISOString() 
          })
          .eq('user_id', user.id)
          .eq('day_number', dayNumber);

        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('challenge_progress')
          .insert({
            user_id: user.id,
            day_number: dayNumber,
            video_watched: false,
            completed: false,
            actions_completed: newActions
          });

        if (error) throw error;
      }

      await fetchProgress();
    } catch (error) {
      console.error('Error completing action:', error);
    }
  };

  const completeDay = async (dayNumber: number) => {
    if (!user?.id) return;

    try {
      const existingDay = progress.find(d => d.day_number === dayNumber);
      
      // Track day completed event
      trackEvent('challenge_day_completed', `Challenge Day ${dayNumber} Completed`, { dayNumber });
      
      if (existingDay) {
        const { error } = await supabase
          .from('challenge_progress')
          .update({ 
            completed: true, 
            completed_at: new Date().toISOString(),
            updated_at: new Date().toISOString() 
          })
          .eq('user_id', user.id)
          .eq('day_number', dayNumber);

        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('challenge_progress')
          .insert({
            user_id: user.id,
            day_number: dayNumber,
            video_watched: true,
            completed: true,
            completed_at: new Date().toISOString(),
            actions_completed: []
          });

        if (error) throw error;
      }

      // Update CRM profile with challenge progress
      try {
        const { data: contact } = await supabase
          .from('crm_contact_profiles')
          .select('id')
          .eq('user_id', user.id)
          .single();
        
        if (contact) {
          const completedCount = progress.filter(d => d.completed).length + 1;
          const updateData: Record<string, unknown> = {
            challenge_current_day: Math.min(dayNumber + 1, 7),
            challenge_days_completed: completedCount
          };
          
          // If completed all 7 days, mark challenge as completed
          if (dayNumber === 7) {
            updateData.challenge_completed_at = new Date().toISOString();
            trackEvent('challenge_completed', 'User completed entire 7-Day Challenge', { totalDays: 7 });
          }
          
          await supabase
            .from('crm_contact_profiles')
            .update(updateData)
            .eq('id', contact.id);
        }
      } catch (error) {
        console.error('Error updating CRM challenge progress:', error);
      }

      toast({
        title: `🎉 Day ${dayNumber} Complete!`,
        description: dayNumber < 7 
          ? `Great work! Day ${dayNumber + 1} is now unlocked.`
          : 'Congratulations! You completed the entire challenge!',
      });

      await fetchProgress();
    } catch (error) {
      console.error('Error completing day:', error);
      toast({
        title: 'Error',
        description: 'Could not save progress. Please try again.',
        variant: 'destructive'
      });
    }
  };

  const isDayUnlocked = (dayNumber: number) => {
    // For unauthenticated users, all days are unlocked (preview mode)
    if (!isAuthenticated) return true;
    
    // Days 1-2 are FREE for all authenticated users
    if (dayNumber <= 2) {
      if (dayNumber === 1) return true;
      // Day 2 requires Day 1 to be completed
      return progress.some(d => d.day_number === 1 && d.completed);
    }
    
    // Days 3-7 require premium access (subscribed or trialing)
    if (dayNumber >= 3 && dayNumber <= 7) {
      if (!hasPremiumAccess) return false;
      // Also need to complete previous day
      return progress.some(d => d.day_number === dayNumber - 1 && d.completed);
    }
    
    // Fallback
    return progress.some(d => d.day_number === dayNumber - 1 && d.completed);
  };
  
  // Check if day requires premium (for UI badges)
  const isDayPremium = (dayNumber: number) => {
    return dayNumber >= 3 && dayNumber <= 7;
  };

  const isDayCompleted = (dayNumber: number) => {
    // For unauthenticated users, nothing is completed
    if (!isAuthenticated) return false;
    return progress.some(d => d.day_number === dayNumber && d.completed);
  };

  const getDayProgress = (dayNumber: number) => {
    return progress.find(d => d.day_number === dayNumber);
  };

  const completedDaysCount = progress.filter(d => d.completed).length;
  const progressPercentage = (completedDaysCount / 7) * 100;

  return {
    progress,
    loading,
    currentDay,
    completedDaysCount,
    progressPercentage,
    markVideoWatched,
    completeAction,
    completeDay,
    isDayUnlocked,
    isDayCompleted,
    isDayPremium,
    getDayProgress,
    refetch: fetchProgress,
    isAuthenticated,
    hasPremiumAccess,
    subscriptionStatus,
    trackChallengeStarted
  };
};
