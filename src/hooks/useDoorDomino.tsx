
import { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { HotListItem, DominoKeyPoint } from '@/types/door';

export function useDoorDomino() {
  const [selectedDomino, setSelectedDomino] = useState<HotListItem | null>(null);
  const [dominoKeyPoints, setDominoKeyPoints] = useState<DominoKeyPoint[]>([]);
  const [isDominoCompleted, setIsDominoCompleted] = useState(false);
  const { toast } = useToast();

  // Ensure we always have 4 key points initialized
  useEffect(() => {
    // Initialize with 4 key points if none exist
    if (dominoKeyPoints.length === 0) {
      setDominoKeyPoints([
        { id: 'key1', text: '' },
        { id: 'key2', text: '' },
        { id: 'key3', text: '' },
        { id: 'key4', text: '' },
      ]);
    } 
    // Ensure we always have exactly 4 key points
    else if (dominoKeyPoints.length < 4) {
      // Add missing key points to reach 4
      const newKeyPoints = [...dominoKeyPoints];
      const missingCount = 4 - dominoKeyPoints.length;
      
      for (let i = 0; i < missingCount; i++) {
        newKeyPoints.push({
          id: `key${dominoKeyPoints.length + i + 1}`,
          text: '',
        });
      }
      
      setDominoKeyPoints(newKeyPoints);
    }
  }, [dominoKeyPoints.length]);

  const handleDominoSelection = (item: HotListItem) => {
    setSelectedDomino(item);
    
    // Always initialize exactly 4 key points when selecting a new domino
    setDominoKeyPoints([
      { id: 'key1', text: '' },
      { id: 'key2', text: '' },
      { id: 'key3', text: '' },
      { id: 'key4', text: '' },
    ]);
    
    toast({
      title: "Domino Selected",
      description: `"${item.text.substring(0, 30)}${item.text.length > 30 ? '...' : ''}" set as your Domino Door`,
    });
  };

  const updateKeyPointText = (id: string, text: string) => {
    const updatedKeyPoints = dominoKeyPoints.map(point => 
      point.id === id ? { ...point, text } : point
    );
    
    setDominoKeyPoints(updatedKeyPoints);
    checkDominoCompletion(updatedKeyPoints);
  };

  const checkDominoCompletion = (keyPoints: DominoKeyPoint[]) => {
    const allFilledAndCompleted = keyPoints.every(point => 
      point.text && 
      point.text.trim() !== '' && 
      point.completed === true
    );
    
    setIsDominoCompleted(allFilledAndCompleted);
    
    if (allFilledAndCompleted && !isDominoCompleted && selectedDomino) {
      toast({
        title: "Domino Door Completed!",
        description: "All key points have been completed. Great job!",
      });
    }
    
    return allFilledAndCompleted;
  };

  const moveKeyPointToHotList = (keyPoint: DominoKeyPoint) => {
    if (!keyPoint.text.trim()) return;
    
    const newHotItem: HotListItem = {
      id: `kp-to-hot-${Date.now()}`,
      text: keyPoint.text,
      selected: false,
      priority: 'none',
      isKeyPoint: true // Mark this item as a key point
    };
    
    // This function returns the new hot item instead of directly updating state
    // The parent hook will update the state
    
    const updatedKeyPoints = dominoKeyPoints.map(point => 
      point.id === keyPoint.id ? { ...point, text: '', completed: false } : point
    );
    
    setDominoKeyPoints(updatedKeyPoints);
    
    checkDominoCompletion(updatedKeyPoints);
    
    toast({
      title: "Key Point Moved",
      description: "Key point has been moved back to the Hot List",
    });
    
    return newHotItem;
  };

  const addNewKeyPoint = () => {
    // Only allow adding if we have fewer than 4 key points
    if (!selectedDomino || dominoKeyPoints.length >= 4) return;
    
    const newKeyPoint: DominoKeyPoint = {
      id: `key-${Date.now()}`,
      text: '',
      completed: false
    };
    
    setDominoKeyPoints([...dominoKeyPoints, newKeyPoint]);
    
    toast({
      title: "New key point added",
      description: "A new key point has been added to the Domino Door",
    });
  };

  return {
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
  };
}
