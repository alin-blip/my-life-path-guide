
import { useState } from 'react';
import { HotListItem, HitListItem, DoListItem, DominoKeyPoint, DayOfWeek, TaskPriority } from '@/types/door';

/**
 * Map ideas_bank priority (0-4) to TaskPriority
 */
function mapIdeaPriorityToTaskPriority(priority: number): TaskPriority {
  switch (priority) {
    case 4: return 'urgent-important';
    case 3: return 'important';
    case 2: return 'urgent';
    default: return 'none';
  }
}

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
  onIdeaDropped?: (ideaId: string, targetList: 'hit' | 'do') => Promise<void>;
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
    // Match dropEffect with effectAllowed for cross-compatibility
    const allowed = e.dataTransfer.effectAllowed;
    if (allowed === 'copy' || allowed === 'copyMove' || allowed === 'copyLink') {
      e.dataTransfer.dropEffect = 'copy';
    } else {
      e.dataTransfer.dropEffect = 'move';
    }
  };

  const handleDropOnDomino = (e: React.DragEvent) => {
    e.preventDefault();
    
    // Check if it's a monthly mission being dropped
    const jsonData = e.dataTransfer.getData('application/json');
    if (jsonData) {
      try {
        const data = JSON.parse(jsonData);
        if (data.type === 'monthly-mission') {
          // Set monthly mission as domino
          const dominoItem = {
            id: `monthly-${data.id}`,
            text: data.text,
            selected: true as const,
            priority: 'urgent-important' as const
          };
          handleDominoSelection(dominoItem);
          
          // Auto-populate key points from keyActions
          if (data.keyActions && data.keyActions.length > 0) {
            const newKeyPoints = data.keyActions.slice(0, 4).map((action: string, idx: number) => ({
              id: `key${idx + 1}`,
              text: action,
              completed: false
            }));
            setDominoKeyPoints(newKeyPoints);
          }
          
          console.debug('[DnD] Monthly mission set as Domino', { id: data.id, title: data.text });
          return;
        }
      } catch (parseError) {
        // Not JSON, continue with normal HotListItem flow
        console.debug('[DnD] Drop data is not JSON, continuing with HotListItem flow');
      }
    }
    
    // Existing logic for HotListItem
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
    
    // FIRST: Check if it's an idea-bank-item being dropped (from HotList)
    const jsonData = e.dataTransfer.getData('application/json');
    if (jsonData) {
      try {
        const data = JSON.parse(jsonData);
        if (data.type === 'idea-bank-item') {
          console.log('📥 [DnD] Idea dropped on TaskList:', { data, activeList, activeDay });
          
          // Create a task directly in the local state
          // The actual DB persistence happens via useIdeaToTaskBridge in parent
          const priority = mapIdeaPriorityToTaskPriority(data.priority || 0);
          
          if (activeList === 'hit') {
            const newHitItem: HitListItem = {
              id: `idea-to-hit-${Date.now()}`,
              text: data.text,
              day: activeDay,
              completed: false,
              priority: priority,
              isKeyPoint: false
            };
            setHitList(prevList => [...prevList, newHitItem]);
          } else {
            const newDoItem: DoListItem = {
              id: `idea-to-do-${Date.now()}`,
              text: data.text,
              day: activeDay,
              completed: false,
              priority: priority
            };
            setDoList(prevList => [...prevList, newDoItem]);
          }
          
          console.log('✅ [DnD] Idea added to', activeList, 'list');
          
          // Persist: add task to DB and archive idea
          try {
            const { doorUserTasksService } = await import('@/services/doorUserTasksService');
            const { ideasBankService } = await import('@/services/ideasBankService');
            
            // Get current week key from the URL or generate it
            const now = new Date();
            const { getISOWeek, getYear, startOfWeek: sow } = await import('date-fns');
            const weekStart = sow(now, { weekStartsOn: 1 });
            const weekNum = getISOWeek(weekStart);
            const year = getYear(weekStart);
            const weekKey = `door-week-${year}-${String(weekNum).padStart(2, '0')}`;
            
            await doorUserTasksService.addIdeaToWeek(weekKey, {
              id: `idea-to-${activeList}-${Date.now()}`,
              text: data.text,
              category: activeList,
              priority: priority,
              day: activeDay
            });
            
            await ideasBankService.updateIdea(data.id, { status: 'archived' });
            console.log('✅ [DnD] Idea persisted to DB and archived');
          } catch (err) {
            console.error('⚠️ [DnD] Error persisting idea drop:', err);
          }
          
          return; // Exit early - idea handled
        }
      } catch (parseError) {
        // Not valid JSON or not idea-bank-item, continue with normal flow
        console.debug('[DnD] Drop data is not idea-bank-item, continuing with normal flow');
      }
    }
    
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
