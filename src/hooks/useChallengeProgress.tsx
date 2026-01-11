import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/hooks/use-toast';

interface ChallengeDay {
  day_number: number;
  completed: boolean;
  completed_at: string | null;
  video_watched: boolean;
  actions_completed: string[];
}

export const useChallengeProgress = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [progress, setProgress] = useState<ChallengeDay[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentDay, setCurrentDay] = useState(1);

  // Check if user is authenticated
  const isAuthenticated = !!user?.id;

  const fetchProgress = useCallback(async () => {
    if (!user?.id) {
      setLoading(false);
      setProgress([]);
      return;
    }

    try {
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

  const markVideoWatched = async (dayNumber: number) => {
    if (!user?.id) return;

    try {
      const existingDay = progress.find(d => d.day_number === dayNumber);
      
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
    if (dayNumber === 1) return true;
    return progress.some(d => d.day_number === dayNumber - 1 && d.completed);
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
    getDayProgress,
    refetch: fetchProgress,
    isAuthenticated
  };
};
