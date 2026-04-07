
import { useRef } from 'react';
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
  const saveTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastSaveTimeRef = useRef<number>(0);

  return {
    initialLoadRef,
    saveTimeoutRef,
    lastSaveTimeRef
  };
}
