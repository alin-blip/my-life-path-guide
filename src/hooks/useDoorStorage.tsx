
import { useEffect } from 'react';
import { HotListItem, HitListItem, DoListItem, DominoKeyPoint, DayOfWeek } from '@/types/door';
import { useDoorStorageState, UseDoorStorageStateProps } from './door/useDoorStorageState';
import { useDoorStorageSave } from './door/useDoorStorageSave';
import { useDoorStorageLoad } from './door/useDoorStorageLoad';
import { useDoorStorageStats } from './door/useDoorStorageStats';
import { useDoorDataIntegrity } from './door/useDoorDataIntegrity';

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
  
  // Load state when component mounts or week changes
  useEffect(() => {
    if (props.currentWeekKey) {
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
      });
      initialLoadRef.current = false;
    }
  }, [props.currentWeekKey]);

  // Save state whenever relevant data changes with debouncing
  useEffect(() => {
    // Prevent saving during initial load
    if (initialLoadRef.current) {
      return;
    }
    
    // Debounced save with timeout
    const timeoutId = setTimeout(() => {
      if (props.currentWeekKey) {
        // Check data integrity before saving
        const integrityResult = checkDataIntegrity({
          currentWeekKey: props.currentWeekKey,
          hotList: props.hotList,
          hitList: props.hitList,
          doList: props.doList,
          dominoKeyPoints: props.dominoKeyPoints
        });
        
        if (!integrityResult.isValid) {
          console.warn('Data integrity issues detected:', integrityResult.issues);
          // Still save but create a backup first
          createBackup({
            currentWeekKey: props.currentWeekKey,
            hotList: props.hotList,
            hitList: props.hitList,
            doList: props.doList,
            dominoKeyPoints: props.dominoKeyPoints
          });
        }
        
        saveState({
          currentWeekKey: props.currentWeekKey,
          hotList: props.hotList,
          hitList: props.hitList,
          doList: props.doList,
          selectedDomino: props.selectedDomino,
          dominoKeyPoints: props.dominoKeyPoints,
          activeDay: props.activeDay,
          activeList: props.activeList
        });
      }
    }, 500);
    
    return () => clearTimeout(timeoutId);
  }, [
    props.hotList, 
    props.hitList, 
    props.doList, 
    props.selectedDomino, 
    props.dominoKeyPoints,
    props.isDominoCompleted,
    props.activeDay,
    props.activeList,
    props.currentWeekKey,
    checkDataIntegrity,
    createBackup,
    saveState
  ]);

  // Force save function that can be called from outside
  const handleForceSave = () => {
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
  };

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
    })
  };
}
