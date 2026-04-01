import { useCallback, useRef, useState } from 'react';
import { HotListItem, DominoKeyPoint } from '@/types/door';
import { weeklyPlanningService } from '@/services/weeklyPlanningService';
import { useDoorStorageLogger } from './useDoorStorageLogger';
import { useWeeklyPlanDraft } from './useWeeklyPlanDraft';
import { DomainCategory } from '@/components/door/DomainSelector';

interface WeeklyPlanData {
  currentWeekKey: string;
  selectedDomino: HotListItem | null;
  dominoKeyPoints: DominoKeyPoint[];
  category?: DomainCategory;
}

type SaveStatus = 'idle' | 'saving' | 'saved' | 'error' | 'offline';

export function useWeeklyPlanSave() {
  const { logStorageAction } = useDoorStorageLogger();
  const { saveDraft, clearDraft } = useWeeklyPlanDraft();
  
  const [saveStatus, setSaveStatus] = useState<SaveStatus>('idle');
  const [lastCloudSaveTime, setLastCloudSaveTime] = useState<Date | null>(null);
  const saveTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isSavingRef = useRef(false);

  // Debounced save to cloud (only weekly plan, NOT lists)
  const saveWeeklyPlanOnly = useCallback(async (data: WeeklyPlanData): Promise<boolean> => {
    const { currentWeekKey, selectedDomino, dominoKeyPoints } = data;
    
    if (!currentWeekKey) return false;
    
    // Always save to local draft first (instant, synchronous)
    saveDraft(currentWeekKey, selectedDomino, dominoKeyPoints);

    // CRITICAL: Skip if no domino title - prevents creating empty/corrupted plans
    if (!selectedDomino?.text?.trim()) {
      console.log('⚠️ Skipping cloud save - no domino title set');
      return true; // Return early WITHOUT saving - protects existing cloud data
    }

    // ADDITIONAL GUARD: Skip if no meaningful key points AND no domino
    const hasValidKeyPoints = dominoKeyPoints.some(kp => kp.text?.trim() || kp.metadata?.objective);
    if (!hasValidKeyPoints && !selectedDomino?.text?.trim()) {
      console.log('⚠️ Blocking cloud save - no valid data to save, protecting existing data');
      return true;
    }

    // Skip if no meaningful key points data (but domino exists - allow save)
    if (!dominoKeyPoints.some(kp => kp.text || kp.metadata)) {
      console.log('⚠️ Skipping cloud save - no key points data yet');
      return true;
    }

    // Prevent concurrent saves
    if (isSavingRef.current) {
      console.log('⏳ Save already in progress, skipping...');
      return false;
    }

    isSavingRef.current = true;
    setSaveStatus('saving');

    try {
      // Load existing plans and find the most recently updated one (same logic as load)
      const plans = await weeklyPlanningService.getPlansForWeek(currentWeekKey);
      const existingPlan = plans.length > 0
        ? plans.sort((a, b) => new Date(b.updatedAt || b.createdAt || 0).getTime() - new Date(a.updatedAt || a.createdAt || 0).getTime())[0]
        : null;
      
      // Use the explicitly passed category, or fall back to the existing plan's category
      const categoryToUse = data.category || existingPlan?.category || 'business';
      
      const planPayload = {
        weekKey: currentWeekKey,
        dominoTitle: selectedDomino?.text || existingPlan?.dominoTitle || '',
        weekGoal: existingPlan?.weekGoal || '',
        category: categoryToUse,
        keyPoints: dominoKeyPoints.map((kp, index) => ({
          id: index + 1,
          title: kp.text || '',
          objective: kp.metadata?.objective || '',
          why: kp.metadata?.why || '',
          positiveImpact: kp.metadata?.positiveImpact || '',
          negativeImpact: kp.metadata?.negativeImpact || '',
          steps: kp.metadata?.steps || [],
          responsible: kp.metadata?.responsible || 'Eu',
          deadline: kp.metadata?.deadline || '',
        })),
      };

      const saved = await weeklyPlanningService.savePlan(planPayload);
      
      if (saved) {
        logStorageAction('✅ Weekly plan saved to cloud', {
          weekKey: currentWeekKey,
          dominoTitle: planPayload.dominoTitle,
          keyPointsCount: planPayload.keyPoints.filter(kp => kp.title).length,
        });
        
        // Clear local draft after successful cloud save
        clearDraft(currentWeekKey);
        
        setSaveStatus('saved');
        setLastCloudSaveTime(new Date());
        
        // Reset to idle after 3 seconds
        if (saveTimeoutRef.current) {
          clearTimeout(saveTimeoutRef.current);
        }
        saveTimeoutRef.current = setTimeout(() => {
          setSaveStatus('idle');
        }, 3000);
        
        return true;
      } else {
        setSaveStatus('error');
        logStorageAction('⚠️ Failed to save weekly plan', { weekKey: currentWeekKey });
        return false;
      }
    } catch (error: any) {
      console.error('Error saving weekly plan:', error);
      logStorageAction('❌ Error saving weekly plan', { error: error.message });
      setSaveStatus('offline');
      // Data is still in localStorage draft, so not lost
      return false;
    } finally {
      isSavingRef.current = false;
    }
  }, [saveDraft, clearDraft, logStorageAction]);

  // Force immediate save (for emergency/visibility change)
  const forceSaveWeeklyPlan = useCallback(async (data: WeeklyPlanData): Promise<boolean> => {
    // Cancel any pending debounced save
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }
    
    // Save immediately
    return saveWeeklyPlanOnly(data);
  }, [saveWeeklyPlanOnly]);

  return {
    saveWeeklyPlanOnly,
    forceSaveWeeklyPlan,
    saveStatus,
    lastCloudSaveTime
  };
}
