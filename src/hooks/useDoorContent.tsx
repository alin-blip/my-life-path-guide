
import { useState, useEffect } from 'react';
import { HotListItem, HitListItem, DoListItem, DayOfWeek, TaskPriority } from '@/types/door';
import { useDoorDate } from './useDoorDate';
import { useDoorLists } from './useDoorLists';
import { useDoorDomino } from './useDoorDomino';
import { useDoorDrag } from './useDoorDrag';
import { useDoorStorage } from './useDoorStorage';

export function useDoorContent() {
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
    toggleHotListItemSelection,
    updateHotListItemText,
    updateHotListItemPriority,
    deleteHotListItem,
    toggleHitListItemCompletion,
    toggleDoListItemCompletion,
    moveTaskBackToHotList
  } = useDoorLists({ currentWeekKey, onDataChange: () => {} });

  const {
    selectedDomino,
    setSelectedDomino,
    dominoKeyPoints,
    setDominoKeyPoints,
    isDominoCompleted,
    setIsDominoCompleted, // This was missing
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

  // Set up storage
  useDoorStorage({
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
    setIsDominoCompleted, // This was the missing variable
    selectDayOfWeek, // Changed from setActiveDay to selectDayOfWeek which is the function we have
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

  // Return all necessary values and functions
  return {
    currentDate,
    currentDateRange,
    hotList,
    hitList: filteredHitList,
    doList: filteredDoList,
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
    setSearchTerm,
    setActiveList,
    setHotList,
    setHitList,
    handlePreviousWeek,
    handleNextWeek,
    toggleHotListItemSelection,
    addNewTarget,
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
    navigateToDate
  };
}
