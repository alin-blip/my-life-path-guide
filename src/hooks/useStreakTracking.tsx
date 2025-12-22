import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/context/AuthContext';

export interface StreakData {
  currentStreak: number;
  longestStreak: number;
  lastActivityDate: string | null;
  todayCompleted: boolean;
}

export const useStreakTracking = () => {
  const { user } = useAuth();
  const [streakData, setStreakData] = useState<StreakData>({
    currentStreak: 0,
    longestStreak: 0,
    lastActivityDate: null,
    todayCompleted: false
  });
  const [loading, setLoading] = useState(true);

  const getToday = () => new Date().toISOString().split('T')[0];

  const fetchStreakData = useCallback(async () => {
    if (!user) {
      setLoading(false);
      return;
    }

    try {
      const today = getToday();
      
      // Fetch today's progress
      const { data: todayStats } = await supabase
        .from('daily_progress_stats')
        .select('*')
        .eq('date', today)
        .single();

      // Fetch user statistics for longest streak
      const { data: userStats } = await supabase
        .from('user_statistics')
        .select('current_streak, longest_streak, last_activity_date')
        .eq('user_id', user.id)
        .single();

      if (userStats) {
        setStreakData({
          currentStreak: userStats.current_streak || 0,
          longestStreak: userStats.longest_streak || 0,
          lastActivityDate: userStats.last_activity_date,
          todayCompleted: !!todayStats && (todayStats.completed_tasks || 0) > 0
        });
      }
    } catch (error) {
      console.error('Error fetching streak data:', error);
    } finally {
      setLoading(false);
    }
  }, [user]);

  const updateDailyProgress = useCallback(async (
    totalTasks: number,
    completedTasks: number,
    hotListItems: number,
    hitListItems: number,
    doListItems: number
  ) => {
    if (!user) return;

    try {
      const today = getToday();
      const completionRate = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;

      // Get yesterday's date
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      const yesterdayStr = yesterday.toISOString().split('T')[0];

      // Check if there was activity yesterday
      const { data: yesterdayStats } = await supabase
        .from('daily_progress_stats')
        .select('completed_tasks, streak_days')
        .eq('date', yesterdayStr)
        .single();

      // Calculate new streak
      let newStreak = 1;
      if (yesterdayStats && (yesterdayStats.completed_tasks || 0) > 0) {
        newStreak = (yesterdayStats.streak_days || 0) + 1;
      } else {
        // Check if today already has a streak
        const { data: todayStats } = await supabase
          .from('daily_progress_stats')
          .select('streak_days')
          .eq('date', today)
          .single();
        
        if (todayStats) {
          newStreak = todayStats.streak_days || 1;
        }
      }

      // Upsert daily progress stats
      const { error: statsError } = await supabase
        .from('daily_progress_stats')
        .upsert({
          user_id: user.id,
          date: today,
          total_tasks: totalTasks,
          completed_tasks: completedTasks,
          hot_list_items: hotListItems,
          hit_list_items: hitListItems,
          do_list_items: doListItems,
          completion_rate: completionRate,
          streak_days: newStreak,
          updated_at: new Date().toISOString()
        }, {
          onConflict: 'user_id,date'
        });

      if (statsError) {
        console.error('Error updating daily progress:', statsError);
        return;
      }

      // Update user statistics
      const { data: currentUserStats } = await supabase
        .from('user_statistics')
        .select('longest_streak')
        .eq('user_id', user.id)
        .single();

      const longestStreak = Math.max(
        currentUserStats?.longest_streak || 0,
        newStreak
      );

      const { error: userStatsError } = await supabase
        .from('user_statistics')
        .upsert({
          user_id: user.id,
          current_streak: newStreak,
          longest_streak: longestStreak,
          last_activity_date: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }, {
          onConflict: 'user_id'
        });

      if (userStatsError) {
        console.error('Error updating user statistics:', userStatsError);
      }

      // Update local state
      setStreakData(prev => ({
        ...prev,
        currentStreak: newStreak,
        longestStreak,
        lastActivityDate: new Date().toISOString(),
        todayCompleted: completedTasks > 0
      }));

      return newStreak;
    } catch (error) {
      console.error('Error updating daily progress:', error);
    }
  }, [user]);

  useEffect(() => {
    fetchStreakData();
  }, [fetchStreakData]);

  return {
    streakData,
    loading,
    updateDailyProgress,
    refreshStreak: fetchStreakData
  };
};
