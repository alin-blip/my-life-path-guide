import React, { createContext, useContext, ReactNode, useState } from 'react';
import { HotListItem, HitListItem, DoListItem, DayOfWeek, TaskPriority, DominoKeyPoint } from '@/types/door';
import { useDoorDate } from '@/hooks/useDoorDate';
import { useDoorLists } from '@/hooks/useDoorLists';
import { useDoorDomino } from '@/hooks/useDoorDomino';
import { useDoorDrag } from '@/hooks/useDoorDrag';
import { useDoorStorage } from '@/hooks/useDoorStorage';

// SaveStatus type matches useWeeklyPlanSave
export type SaveStatus = 'idle' | 'saving' | 'saved' | 'error' | 'offline';

// Define the shape of the context value
interface DoorContextValue {
  currentDate: Date;
  currentDateRange: string;
  currentWeekKey: string;
  hotList: HotListItem[];
  hitList: HitListItem[];  // Full unfiltered list
  doList: DoListItem[];    // Full unfiltered list
  filteredHitList: HitListItem[];  // Filtered by activeDay
  filteredDoList: DoListItem[];    // Filtered by activeDay
  searchTerm: string;
  activeDay: DayOfWeek;
  draggedItem: HotListItem | null;
  activeList: 'hit' | 'do';
  selectedDomino: HotListItem | null;
  dominoKeyPoints: DominoKeyPoint[];
  filteredHotList: HotListItem[];
  hitAchievedCount: number;
  hitDoneCount: number;
  doAchievedCount: number;
  doDoneCount: number;
  isDominoCompleted: boolean;
  editingNewItem: boolean;
  saveStatus: SaveStatus;
  lastCloudSaveTime: Date | null;
  setSearchTerm: (term: string) => void;
  setActiveList: (list: 'hit' | 'do') => void;
  setHotList: React.Dispatch<React.SetStateAction<HotListItem[]>>;
  setHitList: React.Dispatch<React.SetStateAction<HitListItem[]>>;
  setSelectedDomino: React.Dispatch<React.SetStateAction<HotListItem | null>>;
  setDominoKeyPoints: React.Dispatch<React.SetStateAction<DominoKeyPoint[]>>;
  handlePreviousWeek: () => void;
  handleNextWeek: () => void;
  toggleHotListItemSelection: (id: string) => void;
  addNewTarget: () => void;
  addNewTargetWithText: (text: string) => Promise<void>;
  deleteHotListItem: (id: string) => void;
  updateHotListItemText: (id: string, text: string) => void;
  updateHotListItemPriority: (id: string, priority: TaskPriority) => void;
  selectDayOfWeek: (day: DayOfWeek) => void;
  handleDominoSelection: (item: HotListItem) => void;
  updateKeyPointText: (id: string, text: string) => void;
  handleDragStartToDomino: (e: React.DragEvent, item: HotListItem) => void;
  handleDragOverDomino: (e: React.DragEvent) => void;
  handleDropOnDomino: (e: React.DragEvent) => void;
  handleKeyPointDragStart: (e: React.DragEvent, keyPoint: DominoKeyPoint) => void;
  handleDragStart: (e: React.DragEvent, item: HotListItem) => void;
  handleDragOver: (e: React.DragEvent) => void;
  handleDrop: (e: React.DragEvent) => void;
  handleDropOnKeyPoint: (keyPointId: string) => void;
  handleDragEnd: () => void;
  toggleHitListItemCompletion: (id: string) => void;
  toggleDoListItemCompletion: (id: string) => void;
  moveKeyPointToHotList: (keyPoint: DominoKeyPoint) => HotListItem | undefined;
  moveTaskBackToHotList: (taskId: string, listType: 'hit' | 'do') => Promise<void>;
  addNewKeyPoint: () => void;
  navigateToDate: (date: Date) => void;
  refreshLists: () => void;
}

const DoorContext = createContext<DoorContextValue | null>(null);

interface DoorProviderProps {
  children: ReactNode;
}

export function DoorProvider({ children }: DoorProviderProps) {
  // Use the smaller, focused hooks
  const {
    currentDate,
    currentDateRange,
    currentWeekKey,
    activeDay,
    handlePreviousWeek,
    handleNextWeek,
    selectDayOfWeek,
    getCurrentDayOfWeek,
    navigateToDate,
  } = useDoorDate();

  const [dataChangeCallback, setDataChangeCallback] = useState(() => () => {});

  const {
    hotList,
    setHotList,
    hitList,
    setHitList,
    doList,
    setDoList,
    searchTerm,
    setSearchTerm,
    activeList,
    setActiveList,
    editingNewItem,
    addNewTarget,
    addNewTargetWithText,
    toggleHotListItemSelection,
    updateHotListItemText,
    updateHotListItemPriority,
    deleteHotListItem,
    toggleHitListItemCompletion,
    toggleDoListItemCompletion,
    moveTaskBackToHotList,
    refreshLists
  } = useDoorLists({ 
    currentWeekKey, 
    onDataChange: dataChangeCallback 
  });

  const {
    selectedDomino,
    setSelectedDomino,
    dominoKeyPoints,
    setDominoKeyPoints,
    isDominoCompleted,
    setIsDominoCompleted,
    handleDominoSelection,
    updateKeyPointText,
    checkDominoCompletion,
    moveKeyPointToHotList,
    addNewKeyPoint
  } = useDoorDomino();

  const {
    draggedItem,
    draggedKeyPoint,
    handleDragStartToDomino,
    handleDragOverDomino,
    handleDropOnDomino,
    handleKeyPointDragStart,
    handleDragStart,
    handleDragOver,
    handleDrop,
    handleDropOnKeyPoint,
    handleDragEnd
  } = useDoorDrag({
    activeDay,
    activeList,
    setHotList,
    setHitList,
    setDoList,
    hotList,
    hitList,
    doList,
    handleDominoSelection,
    setDominoKeyPoints, 
    dominoKeyPoints,
    checkDominoCompletion
  });

  // Set up storage - now also returns saveStatus and lastCloudSaveTime
  const { saveStatus, lastCloudSaveTime } = useDoorStorage({
    currentWeekKey,
    hotList,
    hitList,
    doList,
    selectedDomino,
    dominoKeyPoints,
    isDominoCompleted,
    activeDay,
    activeList,
    setHotList,
    setHitList,
    setDoList,
    setSelectedDomino,
    setDominoKeyPoints,
    setIsDominoCompleted,
    selectDayOfWeek,
    setActiveList,
    checkDominoCompletion
  });

  // Filter the lists based on active day (normalize for legacy values)
  const normalizeDay = (d: any): DayOfWeek => {
    if (typeof d !== 'string') return (d as DayOfWeek) || 'M';
    const map: Record<string, DayOfWeek> = {
      monday: 'M', tuesday: 'T', wednesday: 'W', thursday: 'Th', friday: 'F', saturday: 'Sa', sunday: 'Su',
      m: 'M', t: 'T', w: 'W', th: 'Th', f: 'F', sa: 'Sa', su: 'Su',
    };
    const key = d.toLowerCase();
    return map[key] || (d as DayOfWeek) || 'M';
  };

  const filteredHitList = hitList.filter(item => normalizeDay(item.day) === normalizeDay(activeDay));
  const filteredDoList = doList.filter(item => normalizeDay(item.day) === normalizeDay(activeDay));
  const filteredHotList = searchTerm 
    ? hotList.filter(item => item.text.toLowerCase().includes(searchTerm.toLowerCase()))
    : hotList;

  // Calculate stats
  const hitAchievedCount = hitList.length;
  const hitDoneCount = hitList.filter(item => item.completed).length;
  const doAchievedCount = doList.length;
  const doDoneCount = doList.filter(item => item.completed).length;

  const value: DoorContextValue = {
    currentDate,
    currentDateRange,
    currentWeekKey,
    hotList,
    hitList,      // Full list - TaskList will filter
    doList,       // Full list - TaskList will filter
    filteredHitList,
    filteredDoList,
    searchTerm,
    activeDay,
    draggedItem,
    activeList,
    selectedDomino,
    dominoKeyPoints,
    filteredHotList,
    hitAchievedCount,
    hitDoneCount,
    doAchievedCount,
    doDoneCount,
    isDominoCompleted,
    editingNewItem,
    saveStatus,
    lastCloudSaveTime,
    setSearchTerm,
    setActiveList,
    setHotList,
    setHitList,
    setSelectedDomino,
    setDominoKeyPoints,
    handlePreviousWeek,
    handleNextWeek,
    toggleHotListItemSelection,
    addNewTarget,
    addNewTargetWithText,
    deleteHotListItem,
    updateHotListItemText,
    updateHotListItemPriority,
    selectDayOfWeek,
    handleDominoSelection,
    updateKeyPointText,
    handleDragStartToDomino,
    handleDragOverDomino,
    handleDropOnDomino,
    handleKeyPointDragStart,
    handleDragStart,
    handleDragOver,
    handleDrop,
    handleDropOnKeyPoint,
    handleDragEnd,
    toggleHitListItemCompletion,
    toggleDoListItemCompletion,
    moveKeyPointToHotList,
    moveTaskBackToHotList,
    addNewKeyPoint,
    navigateToDate,
    refreshLists
  };

  return (
    <DoorContext.Provider value={value}>
      {children}
    </DoorContext.Provider>
  );
}

// Hook to consume the context
export function useDoor() {
  const context = useContext(DoorContext);
  if (!context) {
    throw new Error('useDoor must be used within a DoorProvider');
  }
  return context;
}

// Export the context for advanced use cases
export { DoorContext };
