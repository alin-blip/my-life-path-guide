import { useCallback } from 'react';
import { IdeaBankItem, ideasBankService } from '@/services/ideasBankService';
import { doorUserTasksService } from '@/services/doorUserTasksService';
import { TaskPriority, DayOfWeek } from '@/types/door';
import { useToast } from '@/hooks/use-toast';

/**
 * Bridge hook that enables moving ideas from ideas_bank to user_tasks
 * This resolves the architectural gap between HotList (ideas_bank) and TaskList (user_tasks)
 */
export function useIdeaToTaskBridge(
  currentWeekKey: string,
  activeDay: DayOfWeek,
  onRefresh?: () => void
) {
  const { toast } = useToast();

  /**
   * Convert ideas_bank priority (0-4) to TaskPriority
   */
  const mapPriority = useCallback((ideaPriority: number): TaskPriority => {
    switch (ideaPriority) {
      case 4: return 'urgent-important'; // Q1: Reactor
      case 3: return 'important';         // Q2: Creator
      case 2: return 'urgent';            // Q3: Delegator
      default: return 'none';             // Q4 or unclassified
    }
  }, []);

  /**
   * Move an idea to HIT list (priority tasks)
   */
  const handleMoveIdeaToHit = useCallback(async (idea: IdeaBankItem) => {
    try {
      console.log('🔄 Moving idea to HIT:', { idea, weekKey: currentWeekKey, day: activeDay });

      // 1. Add to user_tasks as HIT
      await doorUserTasksService.addIdeaToWeek(currentWeekKey, {
        id: idea.id,
        text: idea.text,
        category: 'hit',
        priority: mapPriority(idea.priority),
        day: activeDay
      });

      // 2. Archive the idea (removes from ideas list)
      await ideasBankService.archiveIdea(idea.id);

      // 3. Refresh UI
      onRefresh?.();

      toast({
        title: '✅ Idee mutată în Sarcini',
        description: `"${idea.text.substring(0, 30)}..." adăugată pentru ${activeDay}`,
      });

      console.log('✅ Idea moved to HIT successfully');
    } catch (error) {
      console.error('❌ Error moving idea to HIT:', error);
      toast({
        title: '⚠️ Eroare',
        description: 'Nu s-a putut muta ideea în sarcini',
        variant: 'destructive',
      });
    }
  }, [currentWeekKey, activeDay, mapPriority, onRefresh, toast]);

  /**
   * Move an idea to DO list (secondary tasks)
   */
  const handleMoveIdeaToDo = useCallback(async (idea: IdeaBankItem) => {
    try {
      console.log('🔄 Moving idea to DO:', { idea, weekKey: currentWeekKey, day: activeDay });

      // 1. Add to user_tasks as DO
      await doorUserTasksService.addIdeaToWeek(currentWeekKey, {
        id: idea.id,
        text: idea.text,
        category: 'do',
        priority: mapPriority(idea.priority),
        day: activeDay
      });

      // 2. Archive the idea
      await ideasBankService.archiveIdea(idea.id);

      // 3. Refresh UI
      onRefresh?.();

      toast({
        title: '✅ Idee mutată în To Do',
        description: `"${idea.text.substring(0, 30)}..." adăugată pentru ${activeDay}`,
      });

      console.log('✅ Idea moved to DO successfully');
    } catch (error) {
      console.error('❌ Error moving idea to DO:', error);
      toast({
        title: '⚠️ Eroare',
        description: 'Nu s-a putut muta ideea în to do',
        variant: 'destructive',
      });
    }
  }, [currentWeekKey, activeDay, mapPriority, onRefresh, toast]);

  /**
   * Handle drop from idea-bank-item (native drag from HotList)
   */
  const handleIdeaDrop = useCallback(async (
    e: React.DragEvent,
    targetList: 'hit' | 'do'
  ): Promise<boolean> => {
    const jsonData = e.dataTransfer.getData('application/json');
    if (!jsonData) return false;

    try {
      const data = JSON.parse(jsonData);
      if (data.type !== 'idea-bank-item') return false;

      console.log('🎯 Idea dropped on TaskList:', { data, targetList });

      // Create IdeaBankItem-like object from drag data
      const idea: IdeaBankItem = {
        id: data.id,
        text: data.text,
        priority: data.priority || 0,
        category: data.category || 'work',
        status: 'new',
        analysis_result: null,
        linked_objective_id: null,
        analyzed_at: null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      if (targetList === 'hit') {
        await handleMoveIdeaToHit(idea);
      } else {
        await handleMoveIdeaToDo(idea);
      }

      return true;
    } catch (error) {
      console.error('Error parsing idea drop data:', error);
      return false;
    }
  }, [handleMoveIdeaToHit, handleMoveIdeaToDo]);

  return {
    handleMoveIdeaToHit,
    handleMoveIdeaToDo,
    handleIdeaDrop,
    mapPriority
  };
}
