import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/context/AuthContext';

export interface XPData {
  totalXP: number;
  currentLevel: number;
  xpToNextLevel: number;
  xpInCurrentLevel: number;
  progressPercent: number;
}

export interface XPGain {
  amount: number;
  reason: string;
}

// XP rewards for different actions
export const XP_REWARDS = {
  STACK_COMPLETED: 50,
  CORE4_COMPLETED: 100,
  BIZ4_COMPLETED: 100,
  JOURNAL_ENTRY: 30,
  PAGE_READ: 5,
  DAILY_STREAK: 20,
  ACTION_COMPLETED: 10,
  CHALLENGE_DAY_COMPLETED: 75,
  WEEKLY_PLANNING: 40,
} as const;

// Level thresholds - XP required to reach each level
const calculateXPForLevel = (level: number): number => {
  // Progressive formula: each level requires more XP
  // Level 1: 0, Level 2: 100, Level 3: 250, Level 4: 450, etc.
  if (level <= 1) return 0;
  return Math.floor(50 * level * (level - 1));
};

const getLevelFromXP = (totalXP: number): number => {
  let level = 1;
  while (calculateXPForLevel(level + 1) <= totalXP) {
    level++;
  }
  return level;
};

const getXPToNextLevel = (level: number): number => {
  return calculateXPForLevel(level + 1) - calculateXPForLevel(level);
};

export const useXPSystem = () => {
  const { user } = useAuth();
  const [xpData, setXPData] = useState<XPData>({
    totalXP: 0,
    currentLevel: 1,
    xpToNextLevel: 100,
    xpInCurrentLevel: 0,
    progressPercent: 0,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [recentXPGain, setRecentXPGain] = useState<XPGain | null>(null);
  const [showLevelUp, setShowLevelUp] = useState(false);
  const [newLevel, setNewLevel] = useState(1);

  const calculateXPData = useCallback((totalXP: number): XPData => {
    const currentLevel = getLevelFromXP(totalXP);
    const xpForCurrentLevel = calculateXPForLevel(currentLevel);
    const xpForNextLevel = calculateXPForLevel(currentLevel + 1);
    const xpToNextLevel = xpForNextLevel - xpForCurrentLevel;
    const xpInCurrentLevel = totalXP - xpForCurrentLevel;
    const progressPercent = (xpInCurrentLevel / xpToNextLevel) * 100;

    return {
      totalXP,
      currentLevel,
      xpToNextLevel,
      xpInCurrentLevel,
      progressPercent: Math.min(progressPercent, 100),
    };
  }, []);

  const fetchXPData = useCallback(async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('user_xp')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      if (error) throw error;

      if (data) {
        setXPData(calculateXPData(data.total_xp));
      } else {
        // Initialize user XP if doesn't exist
        const { error: insertError } = await supabase
          .from('user_xp')
          .insert({
            user_id: user.id,
            total_xp: 0,
            current_level: 1,
            xp_to_next_level: 100,
          });

        if (insertError) console.error('Error initializing XP:', insertError);
        setXPData(calculateXPData(0));
      }
    } catch (err) {
      console.error('Error fetching XP data:', err);
    } finally {
      setIsLoading(false);
    }
  }, [user, calculateXPData]);

  const addXP = useCallback(async (amount: number, reason: string): Promise<boolean> => {
    if (!user || amount <= 0) return false;

    try {
      const previousLevel = xpData.currentLevel;
      const newTotalXP = xpData.totalXP + amount;
      const newXPData = calculateXPData(newTotalXP);

      // Update user_xp table
      const { error: updateError } = await supabase
        .from('user_xp')
        .upsert({
          user_id: user.id,
          total_xp: newTotalXP,
          current_level: newXPData.currentLevel,
          xp_to_next_level: newXPData.xpToNextLevel,
        }, {
          onConflict: 'user_id'
        });

      if (updateError) throw updateError;

      // Log XP gain in history
      const { error: historyError } = await supabase
        .from('xp_history')
        .insert({
          user_id: user.id,
          xp_amount: amount,
          reason,
        });

      if (historyError) console.error('Error logging XP history:', historyError);

      // Update local state
      setXPData(newXPData);
      setRecentXPGain({ amount, reason });

      // Check for level up
      if (newXPData.currentLevel > previousLevel) {
        setNewLevel(newXPData.currentLevel);
        setShowLevelUp(true);
      }

      // Clear recent XP gain after animation
      setTimeout(() => setRecentXPGain(null), 2000);

      return true;
    } catch (err) {
      console.error('Error adding XP:', err);
      return false;
    }
  }, [user, xpData, calculateXPData]);

  const dismissLevelUp = useCallback(() => {
    setShowLevelUp(false);
  }, []);

  useEffect(() => {
    fetchXPData();
  }, [fetchXPData]);

  return {
    xpData,
    isLoading,
    addXP,
    recentXPGain,
    showLevelUp,
    newLevel,
    dismissLevelUp,
    refetch: fetchXPData,
  };
};

// Helper hook for getting level title
export const getLevelTitle = (level: number): string => {
  if (level >= 50) return 'Legendary Master';
  if (level >= 40) return 'Grand Champion';
  if (level >= 30) return 'Elite Warrior';
  if (level >= 25) return 'Master';
  if (level >= 20) return 'Expert';
  if (level >= 15) return 'Veteran';
  if (level >= 10) return 'Skilled';
  if (level >= 7) return 'Apprentice';
  if (level >= 5) return 'Initiate';
  if (level >= 3) return 'Novice';
  return 'Beginner';
};
