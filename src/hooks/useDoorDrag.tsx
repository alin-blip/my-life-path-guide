
import { useState } from 'react';
import { HotListItem, HitListItem, DoListItem, DominoKeyPoint, DayOfWeek } from '@/types/door';

interface UseDoorDragProps {
  activeDay: DayOfWeek;  // Changed from string to DayOfWeek
  activeList: 'hit' | 'do';
  setHotList: React.Dispatch<React.SetStateAction<HotListItem[]>>;
  setHitList: React.Dispatch<React.SetStateAction<HitListItem[]>>;
  setDoList: React.Dispatch<React.SetStateAction<DoListItem[]>>;
  hotList: HotListItem[];
  hitList: HitListItem[];
  doList: DoListItem[];
  handleDominoSelection: (item: HotListItem) => void;
  setDominoKeyPoints: React.Dispatch<React.SetStateAction<DominoKeyPoint[]>>;
  dominoKeyPoints: DominoKeyPoint[];
  checkDominoCompletion: (keyPoints: DominoKeyPoint[]) => boolean;
}

export function useDoorDrag({
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
}: UseDoorDragProps) {
  const [draggedItem, setDraggedItem] = useState<HotListItem | null>(null);
  const [draggedKeyPoint, setDraggedKeyPoint] = useState<DominoKeyPoint | null>(null);

  const handleDragStartToDomino = (e: React.DragEvent, item: HotListItem) => {
    setDraggedItem(item);
    console.debug('[DnD] Drag start to Domino', { id: item.id, text: item.text });
    e.dataTransfer.setData('text/plain', item.id);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOverDomino = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDropOnDomino = (e: React.DragEvent) => {
    e.preventDefault();
    console.debug('[DnD] Drop on Domino', { hasDraggedItem: !!draggedItem });
    
    if (draggedItem) {
      handleDominoSelection(draggedItem);
      
      // Remove the item from the hot list
      setHotList(prevList => prevList.filter(item => item.id !== draggedItem.id));
      
      console.debug('[DnD] Selected as Domino and removed from HotList', { id: draggedItem.id });
      setDraggedItem(null);
    }
  };

  const handleKeyPointDragStart = (e: React.DragEvent, keyPoint: DominoKeyPoint) => {
    setDraggedKeyPoint(keyPoint);
    e.dataTransfer.setData('text/plain', keyPoint.id);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragStart = (e: React.DragEvent, item: HotListItem) => {
    setDraggedItem(item);
    e.dataTransfer.setData('text/plain', item.id);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    
    if (draggedItem) {
      // Remove from hot list
      setHotList(prevList => prevList.filter(item => item.id !== draggedItem.id));
      
      // Add to hit list or do list based on active list
      if (activeList === 'hit') {
        const newHitItem: HitListItem = {
          id: `hot-to-hit-${Date.now()}`,
          text: draggedItem.text,
          day: activeDay, // Now correctly typed as DayOfWeek
          completed: false,
          priority: draggedItem.priority,
          isKeyPoint: draggedItem.isKeyPoint || false // Preserve isKeyPoint property
        };
        
        setHitList(prevList => [...prevList, newHitItem]);
      } else {
        const newDoItem: DoListItem = {
          id: `hot-to-do-${Date.now()}`,
          text: draggedItem.text,
          day: activeDay, // Now correctly typed as DayOfWeek
          completed: false,
          priority: draggedItem.priority
        };
        
        setDoList(prevList => [...prevList, newDoItem]);
      }
      
      setDraggedItem(null);
    } else if (draggedKeyPoint) {
      // Handle dropping a key point
      if (activeList === 'hit') {
        const newHitItem: HitListItem = {
          id: `kp-to-hit-${Date.now()}`,
          text: draggedKeyPoint.text,
          day: activeDay, // Now correctly typed as DayOfWeek
          completed: false,
          isKeyPoint: true, // Mark as a key point
          keyPointId: draggedKeyPoint.id // Keep reference to original key point
        };
        
        setHitList(prevList => [...prevList, newHitItem]);
        
        // Update the key point
        const updatedKeyPoints = dominoKeyPoints.map(point => 
          point.id === draggedKeyPoint.id ? { ...point, completed: true } : point
        );
        
        setDominoKeyPoints(updatedKeyPoints);
        checkDominoCompletion(updatedKeyPoints);
      } else {
        const newDoItem: DoListItem = {
          id: `kp-to-do-${Date.now()}`,
          text: draggedKeyPoint.text,
          day: activeDay, // Now correctly typed as DayOfWeek
          completed: false
        };
        
        setDoList(prevList => [...prevList, newDoItem]);
        
        // Update the key point
        const updatedKeyPoints = dominoKeyPoints.map(point => 
          point.id === draggedKeyPoint.id ? { ...point, completed: true } : point
        );
        
        setDominoKeyPoints(updatedKeyPoints);
        checkDominoCompletion(updatedKeyPoints);
      }
      
      setDraggedKeyPoint(null);
    }
  };

  // Drop a HotList item directly into a specific key point slot
  const handleDropOnKeyPoint = (targetKeyPointId: string) => {
    if (!draggedItem) return;
    console.debug('[DnD] Drop on KeyPoint', { targetKeyPointId, draggedItem: draggedItem.id });

    // Set text on the target key point and clear completion
    const updatedKeyPoints = dominoKeyPoints.map(point =>
      point.id === targetKeyPointId
        ? { ...point, text: draggedItem.text, completed: false }
        : point
    );

    setDominoKeyPoints(updatedKeyPoints);
    checkDominoCompletion(updatedKeyPoints);

    // Remove from hot list
    setHotList(prevList => prevList.filter(item => item.id !== draggedItem.id));

    setDraggedItem(null);
  };

  const handleDragEnd = () => {
    setDraggedItem(null);
    setDraggedKeyPoint(null);
  };

  return {
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
  };
}
