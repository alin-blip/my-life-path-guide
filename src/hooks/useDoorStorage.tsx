import { useEffect, useRef, useCallback } from 'react';
import { HotListItem, HitListItem, DoListItem, DominoKeyPoint, DayOfWeek } from '@/types/door';
import { useDoorStorageState, UseDoorStorageStateProps } from './door/useDoorStorageState';
import { useDoorStorageSave } from './door/useDoorStorageSave';
import { useDoorStorageLoad } from './door/useDoorStorageLoad';
import { useDoorStorageStats } from './door/useDoorStorageStats';
import { useDoorDataIntegrity } from './door/useDoorDataIntegrity';
import { useWeeklyPlanSave } from './door/useWeeklyPlanSave';
import { useWeeklyPlanDraft } from './door/useWeeklyPlanDraft';

interface UseDoorStorageProps {
  currentWeekKey: string;
  hotList: HotListItem[];
  hitList: HitListItem[];
  doList: DoListItem[];
  selectedDomino: HotListItem | null;
  dominoKeyPoints: DominoKeyPoint[];
  isDominoCompleted: boolean;
  activeDay: DayOfWeek;
  activeList: 'hit' | 'do';
  setHotList: React.Dispatch<React.SetStateAction<HotListItem[]>>;
  setHitList: React.Dispatch<React.SetStateAction<HitListItem[]>>;
  setDoList: React.Dispatch<React.SetStateAction<DoListItem[]>>;
  setSelectedDomino: React.Dispatch<React.SetStateAction<HotListItem | null>>;
  setDominoKeyPoints: React.Dispatch<React.SetStateAction<DominoKeyPoint[]>>;
  setIsDominoCompleted: React.Dispatch<React.SetStateAction<boolean>>;
  selectDayOfWeek: (day: DayOfWeek) => void;
  setActiveList: React.Dispatch<React.SetStateAction<'hit' | 'do'>>;
  checkDominoCompletion: (keyPoints: DominoKeyPoint[]) => boolean;
}

export function useDoorStorage(props: UseDoorStorageProps) {
  const { initialLoadRef } = useDoorStorageState(props as UseDoorStorageStateProps);
  const { saveState, forceSave } = useDoorStorageSave();
  const { loadSavedState } = useDoorStorageLoad();
  const { getStorageStats } = useDoorStorageStats();
  const { checkDataIntegrity, createBackup, restoreFromBackup, exportData } = useDoorDataIntegrity();
  
  // NEW: Separate weekly plan save (doesn't touch HOT/HIT/DO lists)
  const { saveWeeklyPlanOnly, forceSaveWeeklyPlan, saveStatus, lastCloudSaveTime } = useWeeklyPlanSave();
  const { saveDraft, loadDraft, isDraftMoreComplete } = useWeeklyPlanDraft();
  
  // Track if we're currently reloading to prevent save during reload
  const isReloadingRef = useRef(false);
  const weeklyPlanSaveTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Helper to reload data
  const reloadData = useCallback(() => {
    if (props.currentWeekKey) {
      console.log('🔄 Reloading Door data...');
      isReloadingRef.current = true;
      loadSavedState(props.currentWeekKey, {
        setHotList: props.setHotList,
        setHitList: props.setHitList,
        setDoList: props.setDoList,
        setSelectedDomino: props.setSelectedDomino,
        setDominoKeyPoints: props.setDominoKeyPoints,
        setIsDominoCompleted: props.setIsDominoCompleted,
        selectDayOfWeek: props.selectDayOfWeek,
        setActiveList: props.setActiveList,
        checkDominoCompletion: props.checkDominoCompletion
      }).finally(() => {
        setTimeout(() => {
          isReloadingRef.current = false;
          console.log('✅ Door data reload complete');
        }, 1000);
      });
    }
  }, [props.currentWeekKey, loadSavedState]);

  // Load state when component mounts or week changes
  useEffect(() => {
    if (props.currentWeekKey) {
      isReloadingRef.current = true;
      
      // First, check if there's a local draft
      const draft = loadDraft(props.currentWeekKey);
      
      loadSavedState(props.currentWeekKey, {
        setHotList: props.setHotList,
        setHitList: props.setHitList,
        setDoList: props.setDoList,
        setSelectedDomino: props.setSelectedDomino,
        setDominoKeyPoints: props.setDominoKeyPoints,
        setIsDominoCompleted: props.setIsDominoCompleted,
        selectDayOfWeek: props.selectDayOfWeek,
        setActiveList: props.setActiveList,
        checkDominoCompletion: props.checkDominoCompletion
      }).then(() => {
        // After cloud load, check if draft has more complete data
        if (draft && isDraftMoreComplete(draft, props.selectedDomino?.text || '', props.dominoKeyPoints)) {
          console.log('📋 Restoring from local draft (more complete than cloud)');
          
          if (draft.dominoTitle) {
            props.setSelectedDomino({
              id: draft.dominoId || `domino-restored-${Date.now()}`,
              text: draft.dominoTitle,
              priority: 'none',
              selected: true
            });
          }
          
          if (draft.keyPoints.length > 0) {
            props.setDominoKeyPoints(draft.keyPoints.map((kp, idx) => ({
              id: kp.id || `key${idx + 1}`,
              text: kp.text || '',
              completed: kp.completed || false,
              metadata: kp.metadata
            })));
          }
        }
      }).finally(() => {
        initialLoadRef.current = false;
        setTimeout(() => {
          isReloadingRef.current = false;
        }, 1000);
      });
    }
  }, [props.currentWeekKey]);

  // Listen for doorDataUpdated events (from Stack adding ideas)
  useEffect(() => {
    const handleDoorDataUpdated = (event: CustomEvent) => {
      console.log('📬 doorDataUpdated event received:', event.detail);
      setTimeout(() => {
        reloadData();
      }, 300);
    };

    window.addEventListener('doorDataUpdated', handleDoorDataUpdated as EventListener);
    return () => {
      window.removeEventListener('doorDataUpdated', handleDoorDataUpdated as EventListener);
    };
  }, [reloadData]);

  // SEPARATE EFFECT: Auto-save Weekly Plan only (domino + key points)
  // This does NOT trigger saveGlobalHotList or saveWeekLists
  useEffect(() => {
    if (initialLoadRef.current || isReloadingRef.current) {
      return;
    }

    // Clear previous timeout
    if (weeklyPlanSaveTimeoutRef.current) {
      clearTimeout(weeklyPlanSaveTimeoutRef.current);
    }

    // Debounced save - 1 second delay for weekly plan
    weeklyPlanSaveTimeoutRef.current = setTimeout(() => {
      if (props.currentWeekKey) {
        // Save draft immediately (sync)
        saveDraft(props.currentWeekKey, props.selectedDomino, props.dominoKeyPoints);
        
        // Then save to cloud (async)
        saveWeeklyPlanOnly({
          currentWeekKey: props.currentWeekKey,
          selectedDomino: props.selectedDomino,
          dominoKeyPoints: props.dominoKeyPoints
        });
      }
    }, 1000);

    return () => {
      if (weeklyPlanSaveTimeoutRef.current) {
        clearTimeout(weeklyPlanSaveTimeoutRef.current);
      }
    };
  }, [props.selectedDomino, props.dominoKeyPoints, props.currentWeekKey, saveDraft, saveWeeklyPlanOnly]);

  // Emergency save on visibility change and beforeunload
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'hidden' && props.currentWeekKey) {
        console.log('👁️ Tab hidden - emergency save');
        // Sync save to localStorage
        saveDraft(props.currentWeekKey, props.selectedDomino, props.dominoKeyPoints);
        // Attempt async cloud save (best effort)
        forceSaveWeeklyPlan({
          currentWeekKey: props.currentWeekKey,
          selectedDomino: props.selectedDomino,
          dominoKeyPoints: props.dominoKeyPoints
        });
      }
    };

    const handleBeforeUnload = () => {
      if (props.currentWeekKey) {
        console.log('🚪 Before unload - emergency save');
        // Sync save to localStorage only (no time for async)
        saveDraft(props.currentWeekKey, props.selectedDomino, props.dominoKeyPoints);
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [props.currentWeekKey, props.selectedDomino, props.dominoKeyPoints, saveDraft, forceSaveWeeklyPlan]);

  // Force save function that can be called from outside
  const handleForceSave = useCallback(() => {
    // Save weekly plan
    forceSaveWeeklyPlan({
      currentWeekKey: props.currentWeekKey,
      selectedDomino: props.selectedDomino,
      dominoKeyPoints: props.dominoKeyPoints
    });
    
    // Also save lists (legacy behavior for force save button)
    forceSave({
      currentWeekKey: props.currentWeekKey,
      hotList: props.hotList,
      hitList: props.hitList,
      doList: props.doList,
      selectedDomino: props.selectedDomino,
      dominoKeyPoints: props.dominoKeyPoints,
      activeDay: props.activeDay,
      activeList: props.activeList
    });
  }, [props, forceSave, forceSaveWeeklyPlan]);

  return {
    saveState: () => saveState({
      currentWeekKey: props.currentWeekKey,
      hotList: props.hotList,
      hitList: props.hitList,
      doList: props.doList,
      selectedDomino: props.selectedDomino,
      dominoKeyPoints: props.dominoKeyPoints,
      activeDay: props.activeDay,
      activeList: props.activeList
    }),
    loadSavedState: () => loadSavedState(props.currentWeekKey, {
      setHotList: props.setHotList,
      setHitList: props.setHitList,
      setDoList: props.setDoList,
      setSelectedDomino: props.setSelectedDomino,
      setDominoKeyPoints: props.setDominoKeyPoints,
      setIsDominoCompleted: props.setIsDominoCompleted,
      selectDayOfWeek: props.selectDayOfWeek,
      setActiveList: props.setActiveList,
      checkDominoCompletion: props.checkDominoCompletion
    }),
    forceSave: handleForceSave,
    getStorageStats,
    createBackup: () => createBackup({
      currentWeekKey: props.currentWeekKey,
      hotList: props.hotList,
      hitList: props.hitList,
      doList: props.doList,
      dominoKeyPoints: props.dominoKeyPoints
    }),
    restoreFromBackup,
    exportData: () => exportData({
      currentWeekKey: props.currentWeekKey,
      hotList: props.hotList,
      hitList: props.hitList,
      doList: props.doList,
      dominoKeyPoints: props.dominoKeyPoints
    }),
    // NEW: Expose save status for UI indicator
    saveStatus,
    lastCloudSaveTime
  };
}
