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
  QUEST_DAILY: 50,
  QUEST_WEEKLY: 200,
  QUEST_MONTHLY: 500,
  QUEST_SPECIAL: 1000,
  PERFECT_DAY: 150,
  WORKOUT_COMPLETED: 75,
  NUTRITION_LOGGED: 25,
} as const;

// Level thresholds - XP required to reach each level (max 100)
const calculateXPForLevel = (level: number): number => {
  if (level <= 1) return 0;
  // Progressive formula for 100 levels
  return Math.floor(100 * level * (level - 1) / 2);
};

const getLevelFromXP = (totalXP: number): number => {
  let level = 1;
  while (level < 100 && calculateXPForLevel(level + 1) <= totalXP) {
    level++;
  }
  return level;
};

const getXPToNextLevel = (level: number): number => {
  if (level >= 100) return 0;
  return calculateXPForLevel(level + 1) - calculateXPForLevel(level);
};

// 11 TITLURI NVELURI (1-100)
export const LEVEL_TITLES = [
  { minLevel: 1, maxLevel: 5, title: { en: 'Beginner', ro: 'Începător' }, color: 'text-gray-400' },
  { minLevel: 6, maxLevel: 12, title: { en: 'Apprentice', ro: 'Ucenic' }, color: 'text-green-400' },
  { minLevel: 13, maxLevel: 20, title: { en: 'Practitioner', ro: 'Practicant' }, color: 'text-blue-400' },
  { minLevel: 21, maxLevel: 30, title: { en: 'Advanced', ro: 'Avansat' }, color: 'text-purple-400' },
  { minLevel: 31, maxLevel: 40, title: { en: 'Expert', ro: 'Expert' }, color: 'text-yellow-400' },
  { minLevel: 41, maxLevel: 50, title: { en: 'Master', ro: 'Maestru' }, color: 'text-orange-400' },
  { minLevel: 51, maxLevel: 60, title: { en: 'Veteran Elite', ro: 'Veteran Elite' }, color: 'text-red-400' },
  { minLevel: 61, maxLevel: 70, title: { en: 'Champion', ro: 'Campion' }, color: 'text-pink-400' },
  { minLevel: 71, maxLevel: 80, title: { en: 'Legend', ro: 'Legendă' }, color: 'text-cyan-400' },
  { minLevel: 81, maxLevel: 90, title: { en: 'Grandmaster', ro: 'Grandmaster' }, color: 'text-amber-400' },
  { minLevel: 91, maxLevel: 100, title: { en: 'Transcendent', ro: 'Transcendent' }, color: 'text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 via-pink-500 to-purple-500' },
];

export const getLevelTitle = (level: number, language: 'en' | 'ro' = 'en'): string => {
  const tier = LEVEL_TITLES.find(t => level >= t.minLevel && level <= t.maxLevel);
  return tier ? tier.title[language] : LEVEL_TITLES[0].title[language];
};

export const getLevelTitleColor = (level: number): string => {
  const tier = LEVEL_TITLES.find(t => level >= t.minLevel && level <= t.maxLevel);
  return tier ? tier.color : LEVEL_TITLES[0].color;
};

export const getLevelProgress = (level: number): number => {
  // Progress within current tier (0-100%)
  const tier = LEVEL_TITLES.find(t => level >= t.minLevel && level <= t.maxLevel);
  if (!tier) return 0;
  const tierRange = tier.maxLevel - tier.minLevel + 1;
  const levelInTier = level - tier.minLevel;
  return (levelInTier / tierRange) * 100;
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
    const progressPercent = xpToNextLevel > 0 ? (xpInCurrentLevel / xpToNextLevel) * 100 : 100;

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

      const { error: historyError } = await supabase
        .from('xp_history')
        .insert({
          user_id: user.id,
          xp_amount: amount,
          reason,
        });

      if (historyError) console.error('Error logging XP history:', historyError);

      setXPData(newXPData);
      setRecentXPGain({ amount, reason });

      if (newXPData.currentLevel > previousLevel) {
        setNewLevel(newXPData.currentLevel);
        setShowLevelUp(true);
      }

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
