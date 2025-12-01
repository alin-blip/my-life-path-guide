import { useState, useCallback, useRef, useEffect } from 'react';
import { HotListItem, DominoKeyPoint } from '@/types/door';

interface DoorState {
  selectedDomino: HotListItem | null;
  dominoKeyPoints: DominoKeyPoint[];
}

interface UseDoorUndoProps {
  selectedDomino: HotListItem | null;
  dominoKeyPoints: DominoKeyPoint[];
  setSelectedDomino: (domino: HotListItem | null) => void;
  setDominoKeyPoints: (keyPoints: DominoKeyPoint[]) => void;
}

export const useDoorUndo = ({
  selectedDomino,
  dominoKeyPoints,
  setSelectedDomino,
  setDominoKeyPoints,
}: UseDoorUndoProps) => {
  const [history, setHistory] = useState<DoorState[]>([]);
  const [currentIndex, setCurrentIndex] = useState(-1);
  const isUndoingRef = useRef(false);

  // Save current state to history when domino or key points change
  useEffect(() => {
    if (isUndoingRef.current) {
      isUndoingRef.current = false;
      return;
    }

    const newState: DoorState = {
      selectedDomino: selectedDomino ? { ...selectedDomino } : null,
      dominoKeyPoints: dominoKeyPoints.map(kp => ({ ...kp, metadata: kp.metadata ? { ...kp.metadata } : undefined })),
    };

    // Only save if state actually changed
    const lastState = history[currentIndex];
    if (
      lastState &&
      JSON.stringify(lastState.selectedDomino) === JSON.stringify(newState.selectedDomino) &&
      JSON.stringify(lastState.dominoKeyPoints) === JSON.stringify(newState.dominoKeyPoints)
    ) {
      return;
    }

    // Remove any states after current index (redo history)
    const newHistory = history.slice(0, currentIndex + 1);
    newHistory.push(newState);
    
    // Keep only last 20 states to avoid memory issues
    if (newHistory.length > 20) {
      newHistory.shift();
      setHistory(newHistory);
      setCurrentIndex(newHistory.length - 1);
    } else {
      setHistory(newHistory);
      setCurrentIndex(newHistory.length - 1);
    }
  }, [selectedDomino, dominoKeyPoints]);

  const undo = useCallback(() => {
    if (currentIndex > 0) {
      isUndoingRef.current = true;
      const previousState = history[currentIndex - 1];
      setSelectedDomino(previousState.selectedDomino);
      setDominoKeyPoints(previousState.dominoKeyPoints);
      setCurrentIndex(currentIndex - 1);
      return true;
    }
    return false;
  }, [currentIndex, history, setSelectedDomino, setDominoKeyPoints]);

  const redo = useCallback(() => {
    if (currentIndex < history.length - 1) {
      isUndoingRef.current = true;
      const nextState = history[currentIndex + 1];
      setSelectedDomino(nextState.selectedDomino);
      setDominoKeyPoints(nextState.dominoKeyPoints);
      setCurrentIndex(currentIndex + 1);
      return true;
    }
    return false;
  }, [currentIndex, history, setSelectedDomino, setDominoKeyPoints]);

  const canUndo = currentIndex > 0;
  const canRedo = currentIndex < history.length - 1;

  return {
    undo,
    redo,
    canUndo,
    canRedo,
  };
};

