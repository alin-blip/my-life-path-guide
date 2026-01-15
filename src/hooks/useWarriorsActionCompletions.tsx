import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/context/AuthContext';

export const useWarriorsActionCompletions = (moduleId: string) => {
  const { user } = useAuth();
  const [completedActions, setCompletedActions] = useState<Set<number>>(new Set());
  const [isLoading, setIsLoading] = useState(true);

  // Fetch completed actions for this module
  const fetchCompletions = useCallback(async () => {
    if (!user || !moduleId) {
      setIsLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('warriors_action_completions')
        .select('action_index')
        .eq('user_id', user.id)
        .eq('module_id', moduleId);

      if (error) throw error;

      const indices = new Set(data?.map(d => d.action_index) || []);
      setCompletedActions(indices);
    } catch (error) {
      console.error('Error fetching action completions:', error);
    } finally {
      setIsLoading(false);
    }
  }, [user, moduleId]);

  useEffect(() => {
    fetchCompletions();
  }, [fetchCompletions]);

  // Mark an action as completed
  const markActionCompleted = useCallback(async (actionIndex: number) => {
    if (!user) return false;

    // Optimistic update
    setCompletedActions(prev => new Set(prev).add(actionIndex));

    try {
      const { error } = await supabase
        .from('warriors_action_completions')
        .upsert({
          user_id: user.id,
          module_id: moduleId,
          action_index: actionIndex
        }, {
          onConflict: 'user_id,module_id,action_index'
        });

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error marking action completed:', error);
      // Revert optimistic update
      setCompletedActions(prev => {
        const newSet = new Set(prev);
        newSet.delete(actionIndex);
        return newSet;
      });
      return false;
    }
  }, [user, moduleId]);

  // Unmark an action (optional, for toggling)
  const unmarkAction = useCallback(async (actionIndex: number) => {
    if (!user) return false;

    // Optimistic update
    setCompletedActions(prev => {
      const newSet = new Set(prev);
      newSet.delete(actionIndex);
      return newSet;
    });

    try {
      const { error } = await supabase
        .from('warriors_action_completions')
        .delete()
        .eq('user_id', user.id)
        .eq('module_id', moduleId)
        .eq('action_index', actionIndex);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error unmarking action:', error);
      // Revert
      setCompletedActions(prev => new Set(prev).add(actionIndex));
      return false;
    }
  }, [user, moduleId]);

  return {
    completedActions,
    isLoading,
    markActionCompleted,
    unmarkAction,
    isCompleted: (index: number) => completedActions.has(index)
  };
};
