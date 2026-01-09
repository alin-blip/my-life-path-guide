import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/context/AuthContext';

interface RoutineStats {
  total_xp: number;
  current_level: number;
  current_streak: number;
  best_streak: number;
  last_routine_date: string | null;
  total_routines_completed: number;
  total_meditation_seconds: number;
}

interface XPGain {
  amount: number;
  reason: string;
}

// XP rewards for different actions
export const ROUTINE_XP_REWARDS = {
  step_completed: 10,
  routine_complete_bonus: 50,
  perfect_routine: 100,
  meditation_bonus_per_5min: 5,
  first_of_week_bonus: 25,
  streak_multiplier_per_day: 0.1, // max 1.0 = 2x
};

// Calculate level from total XP
export function getLevelFromXP(totalXP: number): number {
  // Exponential leveling: each level needs more XP
  // Level 1: 0, Level 2: 100, Level 3: 300, Level 4: 600, etc.
  let level = 1;
  let xpNeeded = 0;
  while (xpNeeded <= totalXP) {
    level++;
    xpNeeded += level * 100;
  }
  return level - 1;
}

// Get XP needed for next level
export function getXPForNextLevel(currentLevel: number): number {
  let xpNeeded = 0;
  for (let i = 1; i <= currentLevel; i++) {
    xpNeeded += i * 100;
  }
  return (currentLevel + 1) * 100;
}

// Get total XP at start of current level
export function getXPAtLevelStart(level: number): number {
  let xp = 0;
  for (let i = 1; i < level; i++) {
    xp += i * 100;
  }
  return xp;
}

// Get level title
export function getLevelTitle(level: number): string {
  if (level >= 100) return 'Legendă';
  if (level >= 51) return 'Maestru';
  if (level >= 26) return 'Campion';
  if (level >= 11) return 'Practicant';
  return 'Începător';
}

// Get level color
export function getLevelColor(level: number): string {
  if (level >= 100) return 'text-amber-400';
  if (level >= 51) return 'text-purple-400';
  if (level >= 26) return 'text-blue-400';
  if (level >= 11) return 'text-green-400';
  return 'text-gray-400';
}

export function useRoutineXP() {
  const { user } = useAuth();
  const [stats, setStats] = useState<RoutineStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [recentXPGain, setRecentXPGain] = useState<XPGain | null>(null);
  const [showLevelUp, setShowLevelUp] = useState(false);
  const [newLevel, setNewLevel] = useState(0);

  // Fetch stats from database
  const fetchStats = useCallback(async () => {
    if (!user) {
      setStats(null);
      setIsLoading(false);
      return;
    }

    const { data, error } = await supabase
      .from('routine_user_stats')
      .select('*')
      .eq('user_id', user.id)
      .maybeSingle();

    if (error) {
      console.error('Error fetching routine stats:', error);
      setIsLoading(false);
      return;
    }

    if (data) {
      setStats(data as RoutineStats);
    } else {
      // Create initial stats
      const { data: newStats, error: insertError } = await supabase
        .from('routine_user_stats')
        .insert({ user_id: user.id })
        .select()
        .single();

      if (!insertError && newStats) {
        setStats(newStats as RoutineStats);
      }
    }

    setIsLoading(false);
  }, [user]);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  // Add XP and update stats
  const addXP = useCallback(async (amount: number, reason: string) => {
    if (!user || !stats) return false;

    const oldLevel = stats.current_level;
    const newTotalXP = stats.total_xp + amount;
    const calculatedLevel = getLevelFromXP(newTotalXP);

    const { error } = await supabase
      .from('routine_user_stats')
      .update({
        total_xp: newTotalXP,
        current_level: calculatedLevel,
        updated_at: new Date().toISOString(),
      })
      .eq('user_id', user.id);

    if (error) {
      console.error('Error adding XP:', error);
      return false;
    }

    // Update local state
    setStats(prev => prev ? {
      ...prev,
      total_xp: newTotalXP,
      current_level: calculatedLevel,
    } : null);

    // Show XP gain animation
    setRecentXPGain({ amount, reason });
    setTimeout(() => setRecentXPGain(null), 3000);

    // Check for level up
    if (calculatedLevel > oldLevel) {
      setNewLevel(calculatedLevel);
      setShowLevelUp(true);
    }

    return true;
  }, [user, stats]);

  // Update streak
  const updateStreak = useCallback(async (completed: boolean) => {
    if (!user || !stats) return;

    const today = new Date().toISOString().split('T')[0];
    const lastDate = stats.last_routine_date;
    
    let newStreak = stats.current_streak;
    let newBestStreak = stats.best_streak;
    let newTotalCompleted = stats.total_routines_completed;

    if (completed) {
      // Check if this is consecutive
      if (lastDate) {
        const lastDateObj = new Date(lastDate);
        const todayObj = new Date(today);
        const diffDays = Math.floor((todayObj.getTime() - lastDateObj.getTime()) / (1000 * 60 * 60 * 24));
        
        if (diffDays === 1) {
          newStreak += 1;
        } else if (diffDays > 1) {
          newStreak = 1; // Reset streak
        }
        // If same day, don't change streak
      } else {
        newStreak = 1;
      }

      newBestStreak = Math.max(newBestStreak, newStreak);
      newTotalCompleted += 1;

      const { error } = await supabase
        .from('routine_user_stats')
        .update({
          current_streak: newStreak,
          best_streak: newBestStreak,
          last_routine_date: today,
          total_routines_completed: newTotalCompleted,
          updated_at: new Date().toISOString(),
        })
        .eq('user_id', user.id);

      if (!error) {
        setStats(prev => prev ? {
          ...prev,
          current_streak: newStreak,
          best_streak: newBestStreak,
          last_routine_date: today,
          total_routines_completed: newTotalCompleted,
        } : null);
      }
    }

    return newStreak;
  }, [user, stats]);

  // Add meditation time
  const addMeditationTime = useCallback(async (seconds: number) => {
    if (!user || !stats) return;

    const newTotal = stats.total_meditation_seconds + seconds;
    
    await supabase
      .from('routine_user_stats')
      .update({
        total_meditation_seconds: newTotal,
        updated_at: new Date().toISOString(),
      })
      .eq('user_id', user.id);

    setStats(prev => prev ? {
      ...prev,
      total_meditation_seconds: newTotal,
    } : null);
  }, [user, stats]);

  // Calculate streak multiplier
  const getStreakMultiplier = useCallback(() => {
    if (!stats) return 1;
    const bonus = Math.min(stats.current_streak * ROUTINE_XP_REWARDS.streak_multiplier_per_day, 1);
    return 1 + bonus;
  }, [stats]);

  // Dismiss level up notification
  const dismissLevelUp = useCallback(() => {
    setShowLevelUp(false);
  }, []);

  return {
    stats,
    isLoading,
    recentXPGain,
    showLevelUp,
    newLevel,
    addXP,
    updateStreak,
    addMeditationTime,
    getStreakMultiplier,
    dismissLevelUp,
    refetch: fetchStats,
  };
}
