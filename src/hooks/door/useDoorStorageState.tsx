
import { useEffect, useRef } from 'react';
import { HotListItem, HitListItem, DoListItem, DominoKeyPoint, DayOfWeek } from '@/types/door';

interface DoorStorageState {
  currentWeekKey: string;
  hotList: HotListItem[];
  hitList: HitListItem[];
  doList: DoListItem[];
  selectedDomino: HotListItem | null;
  dominoKeyPoints: DominoKeyPoint[];
  isDominoCompleted: boolean;
  activeDay: DayOfWeek;
  activeList: 'hit' | 'do';
}

interface DoorStorageStateSetters {
  setHotList: React.Dispatch<React.SetStateAction<HotListItem[]>>;
  setHitList: React.Dispatch<React.SetStateAction<HitListItem[]>>;
  setDoList: React.Dispatch<React.SetStateAction<DoListItem[]>>;
  setSelectedDomino: React.Dispatch<React.SetStateAction<HotListItem | null>>;
  setDominoKeyPoints: React.Dispatch<React.SetStateAction<DominoKeyPoint[]>>;
  setIsDominoCompleted: React.Dispatch<React.SetStateAction<boolean>>;
  selectDayOfWeek: (day: DayOfWeek) => void;
  setActiveList: React.Dispatch<React.SetStateAction<'hit' | 'do'>>;
}

export interface UseDoorStorageStateProps extends DoorStorageState, DoorStorageStateSetters {
  checkDominoCompletion: (keyPoints: DominoKeyPoint[]) => boolean;
}

export function useDoorStorageState(props: UseDoorStorageStateProps) {
  const initialLoadRef = useRef(true);
  const saveTimeoutRef = useRef<number | null>(null);
  const lastSaveTimeRef = useRef<number>(0);

  // Track state changes for auto-save
  useEffect(() => {
    // Prevent saving during initial load
    if (initialLoadRef.current) {
      return;
    }
    
    // Clear previous timeout to prevent multiple saves
    if (saveTimeoutRef.current) {
      window.clearTimeout(saveTimeoutRef.current);
    }
    
    // Set a new timeout to save state after 500ms of inactivity
    saveTimeoutRef.current = window.setTimeout(() => {
      if (props.currentWeekKey) {
        const now = Date.now();
        if (now - lastSaveTimeRef.current > 1000) { // Prevent too frequent saves
          lastSaveTimeRef.current = now;
          return true; // Signal that save should occur
        }
      }
      return false;
    }, 500);
    
    // Cleanup timeout on unmount or when dependencies change
    return () => {
      if (saveTimeoutRef.current) {
        window.clearTimeout(saveTimeoutRef.current);
      }
    };
  }, [
    props.hotList, 
    props.hitList, 
    props.doList, 
    props.selectedDomino, 
    props.dominoKeyPoints,
    props.isDominoCompleted,
    props.activeDay,
    props.activeList,
    props.currentWeekKey
  ]);

  return {
    initialLoadRef,
    saveTimeoutRef,
    lastSaveTimeRef
  };
}
