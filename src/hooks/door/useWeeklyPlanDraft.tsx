import { useCallback, useRef, useEffect } from 'react';
import { HotListItem, DominoKeyPoint } from '@/types/door';
import { DomainCategory } from '@/components/door/DomainSelector';

interface WeeklyPlanDraft {
  timestamp: number;
  weekKey: string;
  dominoTitle: string;
  dominoId?: string;
  category?: DomainCategory;
  keyPoints: Array<{
    id: string;
    text: string;
    completed?: boolean;
    metadata?: DominoKeyPoint['metadata'];
  }>;
}

const DRAFT_KEY_PREFIX = 'weekly-plan-draft:';
const DRAFT_MAX_AGE_MS = 24 * 60 * 60 * 1000; // 24 hours

export function useWeeklyPlanDraft() {
  const lastSaveTimeRef = useRef<number>(0);

  // Save draft to localStorage (synchronous, instant)
  const saveDraft = useCallback((
    weekKey: string,
    selectedDomino: HotListItem | null,
    dominoKeyPoints: DominoKeyPoint[],
    category?: DomainCategory
  ) => {
    if (!weekKey) return;

    try {
      const draft: WeeklyPlanDraft = {
        timestamp: Date.now(),
        weekKey,
        dominoTitle: selectedDomino?.text || '',
        dominoId: selectedDomino?.id,
        category,
        keyPoints: dominoKeyPoints.map(kp => ({
          id: kp.id,
          text: kp.text || '',
          completed: kp.completed,
          metadata: kp.metadata
        }))
      };

      localStorage.setItem(`${DRAFT_KEY_PREFIX}${weekKey}`, JSON.stringify(draft));
      lastSaveTimeRef.current = Date.now();
      
      console.log('📝 Weekly plan draft saved locally:', {
        weekKey,
        category: draft.category,
        dominoTitle: draft.dominoTitle,
        keyPointsCount: draft.keyPoints.filter(kp => kp.text).length
      });
    } catch (error) {
      console.error('Failed to save weekly plan draft:', error);
    }
  }, []);

  // Load draft from localStorage
  const loadDraft = useCallback((weekKey: string): WeeklyPlanDraft | null => {
    if (!weekKey) return null;

    try {
      const stored = localStorage.getItem(`${DRAFT_KEY_PREFIX}${weekKey}`);
      if (!stored) return null;

      const draft: WeeklyPlanDraft = JSON.parse(stored);
      
      // Check if draft is too old
      if (Date.now() - draft.timestamp > DRAFT_MAX_AGE_MS) {
        console.log('🗑️ Draft too old, removing:', weekKey);
        localStorage.removeItem(`${DRAFT_KEY_PREFIX}${weekKey}`);
        return null;
      }

      return draft;
    } catch (error) {
      console.error('Failed to load weekly plan draft:', error);
      return null;
    }
  }, []);

  // Clear draft after successful cloud save
  const clearDraft = useCallback((weekKey: string) => {
    if (!weekKey) return;
    try {
      localStorage.removeItem(`${DRAFT_KEY_PREFIX}${weekKey}`);
      console.log('🗑️ Draft cleared after cloud save:', weekKey);
    } catch (error) {
      console.error('Failed to clear draft:', error);
    }
  }, []);

  // Check if draft has more complete data than cloud
  const isDraftMoreComplete = useCallback((
    draft: WeeklyPlanDraft | null,
    cloudDominoTitle: string,
    cloudKeyPoints: DominoKeyPoint[]
  ): boolean => {
    if (!draft) return false;

    const draftFilledKeys = draft.keyPoints.filter(kp => kp.text?.trim()).length;
    const cloudFilledKeys = cloudKeyPoints.filter(kp => kp.text?.trim()).length;

    // Draft is more complete if it has more filled key points
    // or if it has a domino title when cloud doesn't
    if (draftFilledKeys > cloudFilledKeys) return true;
    if (draft.dominoTitle && !cloudDominoTitle) return true;

    return false;
  }, []);

  // Get last save time for status indicator
  const getLastSaveTime = useCallback(() => {
    return lastSaveTimeRef.current;
  }, []);

  return {
    saveDraft,
    loadDraft,
    clearDraft,
    isDraftMoreComplete,
    getLastSaveTime
  };
}
