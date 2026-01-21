import { useEffect, useRef, useCallback } from 'react';
import { HotListItem, HitListItem, DoListItem, DominoKeyPoint, DayOfWeek } from '@/types/door';
import { useDoorStorageState, UseDoorStorageStateProps } from './door/useDoorStorageState';
import { useDoorStorageSave } from './door/useDoorStorageSave';
import { useDoorStorageLoad } from './door/useDoorStorageLoad';
import { useDoorStorageStats } from './door/useDoorStorageStats';
import { useDoorDataIntegrity } from './door/useDoorDataIntegrity';
import { useWeeklyPlanSave } from './door/useWeeklyPlanSave';
import { useWeeklyPlanDraft } from './door/useWeeklyPlanDraft';
import { DomainCategory } from '@/components/door/DomainSelector';

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
  // Track last emergency save to prevent reload loops
  const lastEmergencySaveRef = useRef<number>(0);
  // Track the category of the currently loaded plan
  const activeCategoryRef = useRef<DomainCategory>('business');

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

  // Listen for category loaded event to track the active category
  useEffect(() => {
    const handleCategoryLoaded = (event: CustomEvent<{ category: DomainCategory }>) => {
      if (event.detail.category) {
        console.log('📂 Door category loaded:', event.detail.category);
        activeCategoryRef.current = event.detail.category;
      }
    };
    
    window.addEventListener('doorCategoryLoaded', handleCategoryLoaded as EventListener);
    return () => {
      window.removeEventListener('doorCategoryLoaded', handleCategoryLoaded as EventListener);
    };
  }, []);

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
      
      // Skip reload if this was triggered by our own emergency save (within 5 seconds)
      const timeSinceEmergencySave = Date.now() - lastEmergencySaveRef.current;
      if (timeSinceEmergencySave < 5000) {
        console.log('⏭️ Skipping reload - triggered by recent emergency save');
        return;
      }
      
      setTimeout(() => {
        reloadData();
      }, 300);
    };

    window.addEventListener('doorDataUpdated', handleDoorDataUpdated as EventListener);
    return () => {
      window.removeEventListener('doorDataUpdated', handleDoorDataUpdated as EventListener);
    };
  }, [reloadData]);

  // Stable references for weekly plan save data to avoid infinite loops
  const selectedDominoTextRef = useRef<string>('');
  const keyPointsSignatureRef = useRef<string>('');

  // Compute a signature for key points to detect real changes
  const getKeyPointsSignature = useCallback((kps: DominoKeyPoint[]) => {
    return kps.map(kp => `${kp.id}:${kp.text || ''}:${kp.completed ? '1' : '0'}`).join('|');
  }, []);

  // SEPARATE EFFECT: Auto-save Weekly Plan only (domino + key points)
  // This does NOT trigger saveGlobalHotList or saveWeekLists
  useEffect(() => {
    if (initialLoadRef.current || isReloadingRef.current) {
      return;
    }

    const newDominoText = props.selectedDomino?.text || '';
    const newKeyPointsSig = getKeyPointsSignature(props.dominoKeyPoints);

    // Skip if nothing actually changed
    if (newDominoText === selectedDominoTextRef.current && newKeyPointsSig === keyPointsSignatureRef.current) {
      return;
    }

    // Update refs
    selectedDominoTextRef.current = newDominoText;
    keyPointsSignatureRef.current = newKeyPointsSig;

    // Clear previous timeout
    if (weeklyPlanSaveTimeoutRef.current) {
      clearTimeout(weeklyPlanSaveTimeoutRef.current);
    }

    // Debounced save - 1.5 second delay for weekly plan
    weeklyPlanSaveTimeoutRef.current = setTimeout(() => {
      if (props.currentWeekKey) {
        // Save draft immediately (sync)
        saveDraft(props.currentWeekKey, props.selectedDomino, props.dominoKeyPoints);
        
        // Then save to cloud (async) - include the active category!
        saveWeeklyPlanOnly({
          currentWeekKey: props.currentWeekKey,
          selectedDomino: props.selectedDomino,
          dominoKeyPoints: props.dominoKeyPoints,
          category: activeCategoryRef.current
        });
      }
    }, 1500);

    return () => {
      if (weeklyPlanSaveTimeoutRef.current) {
        clearTimeout(weeklyPlanSaveTimeoutRef.current);
      }
    };
  }, [props.selectedDomino?.text, props.selectedDomino?.id, props.dominoKeyPoints, props.currentWeekKey, getKeyPointsSignature]);

  // Emergency save on visibility change and beforeunload
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'hidden' && props.currentWeekKey) {
        console.log('👁️ Tab hidden - local save only (no cloud to prevent reload)');
        // Mark the time of emergency save
        lastEmergencySaveRef.current = Date.now();
        // ONLY sync save to localStorage - no cloud save to prevent reload loops
        saveDraft(props.currentWeekKey, props.selectedDomino, props.dominoKeyPoints);
      } else if (document.visibilityState === 'visible' && props.currentWeekKey) {
        // Tab becomes visible again - sync draft to cloud after delay
        console.log('👁️ Tab visible - syncing draft to cloud');
        setTimeout(() => {
          forceSaveWeeklyPlan({
            currentWeekKey: props.currentWeekKey,
            selectedDomino: props.selectedDomino,
            dominoKeyPoints: props.dominoKeyPoints
          });
        }, 1500);
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
    // Save weekly plan with active category
    forceSaveWeeklyPlan({
      currentWeekKey: props.currentWeekKey,
      selectedDomino: props.selectedDomino,
      dominoKeyPoints: props.dominoKeyPoints,
      category: activeCategoryRef.current
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
