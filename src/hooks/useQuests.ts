import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/context/AuthContext';
import { useXPSystem } from './useXPSystem';
import { format, startOfDay, startOfWeek, startOfMonth } from 'date-fns';

export interface Quest {
  id: string;
  title: string;
  description: string | null;
  quest_type: string;
  xp_reward: number;
  target_value: number;
  action_type: string;
  icon: string | null;
  is_active: boolean;
}

export interface QuestProgress {
  id: string;
  quest_id: string;
  current_value: number;
  completed: boolean;
  completed_at: string | null;
  quest: Quest;
}

export const useQuests = () => {
  const { user } = useAuth();
  const { addXP } = useXPSystem();
  const [quests, setQuests] = useState<Quest[]>([]);
  const [progress, setProgress] = useState<QuestProgress[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const getResetDate = (questType: string): string => {
    const now = new Date();
    switch (questType) {
      case 'daily':
        return format(startOfDay(now), 'yyyy-MM-dd');
      case 'weekly':
        return format(startOfWeek(now, { weekStartsOn: 1 }), 'yyyy-MM-dd');
      case 'monthly':
        return format(startOfMonth(now), 'yyyy-MM');
      case 'special':
        return 'special';
      default:
        return format(startOfDay(now), 'yyyy-MM-dd');
    }
  };

  const fetchQuests = useCallback(async () => {
    if (!user) return;

    try {
      // Fetch all active quests
      const { data: questsData, error: questsError } = await supabase
        .from('quests')
        .select('*')
        .eq('is_active', true);

      if (questsError) throw questsError;
      setQuests(questsData || []);

      // Fetch user progress for each quest type with correct reset dates
      const progressPromises = (questsData || []).map(async (quest) => {
        const resetDate = getResetDate(quest.quest_type);
        
        const { data, error } = await supabase
          .from('user_quest_progress')
          .select('*')
          .eq('user_id', user.id)
          .eq('quest_id', quest.id)
          .eq('reset_at', resetDate)
          .maybeSingle();

        if (error && error.code !== 'PGRST116') {
          console.error('Error fetching quest progress:', error);
          return null;
        }

        if (data) {
          return { ...data, quest };
        }

        // Create new progress entry if doesn't exist
        const { data: newProgress, error: insertError } = await supabase
          .from('user_quest_progress')
          .insert({
            user_id: user.id,
            quest_id: quest.id,
            current_value: 0,
            completed: false,
            reset_at: resetDate,
          })
          .select()
          .single();

        if (insertError) {
          console.error('Error creating quest progress:', insertError);
          return null;
        }

        return { ...newProgress, quest };
      });

      const progressResults = await Promise.all(progressPromises);
      setProgress(progressResults.filter(Boolean) as QuestProgress[]);
    } catch (err) {
      console.error('Error fetching quests:', err);
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  const updateQuestProgress = useCallback(async (
    actionType: string, 
    incrementBy: number = 1
  ): Promise<void> => {
    if (!user) return;

    const matchingQuests = quests.filter(q => q.action_type === actionType);
    
    for (const quest of matchingQuests) {
      const questProgress = progress.find(p => p.quest_id === quest.id);
      if (!questProgress || questProgress.completed) continue;

      const newValue = Math.min(questProgress.current_value + incrementBy, quest.target_value);
      const isNowCompleted = newValue >= quest.target_value;

      const { error } = await supabase
        .from('user_quest_progress')
        .update({
          current_value: newValue,
          completed: isNowCompleted,
          completed_at: isNowCompleted ? new Date().toISOString() : null,
        })
        .eq('id', questProgress.id);

      if (error) {
        console.error('Error updating quest progress:', error);
        continue;
      }

      // Award XP if quest completed
      if (isNowCompleted) {
        await addXP(quest.xp_reward, `Quest completed: ${quest.title}`);
      }

      // Update local state
      setProgress(prev => prev.map(p => 
        p.id === questProgress.id 
          ? { ...p, current_value: newValue, completed: isNowCompleted }
          : p
      ));
    }
  }, [user, quests, progress, addXP]);

  const getQuestsByType = useCallback((type: Quest['quest_type']) => {
    return progress.filter(p => p.quest.quest_type === type);
  }, [progress]);

  const getCompletedCount = useCallback((type?: Quest['quest_type']) => {
    const filtered = type ? progress.filter(p => p.quest.quest_type === type) : progress;
    return filtered.filter(p => p.completed).length;
  }, [progress]);

  const getTotalCount = useCallback((type?: Quest['quest_type']) => {
    const filtered = type ? progress.filter(p => p.quest.quest_type === type) : progress;
    return filtered.length;
  }, [progress]);

  useEffect(() => {
    fetchQuests();
  }, [fetchQuests]);

  return {
    quests,
    progress,
    isLoading,
    updateQuestProgress,
    getQuestsByType,
    getCompletedCount,
    getTotalCount,
    refetch: fetchQuests,
  };
};
