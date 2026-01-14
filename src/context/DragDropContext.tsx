import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';

type DragSource = 'lunar' | 'ideas' | 'keypoint' | null;
type DropTarget = 'focus' | 'tasks' | 'keypoint' | null;

interface DragDropState {
  isDragging: boolean;
  dragSource: DragSource;
  dragItemId: string | null;
  dropTarget: DropTarget;
  isProcessing: boolean;
  processingTarget: DropTarget;
  showSuccess: DropTarget;
}

interface DragDropContextValue extends DragDropState {
  startDrag: (source: DragSource, itemId: string) => void;
  endDrag: () => void;
  setDropTarget: (target: DropTarget) => void;
  startProcessing: (target: DropTarget) => void;
  endProcessing: (showSuccess?: boolean) => void;
}

const DragDropContext = createContext<DragDropContextValue | null>(null);

export const useDragDropContext = () => {
  const context = useContext(DragDropContext);
  if (!context) {
    // Return a mock context when outside provider
    return {
      isDragging: false,
      dragSource: null,
      dragItemId: null,
      dropTarget: null,
      isProcessing: false,
      processingTarget: null,
      showSuccess: null,
      startDrag: () => {},
      endDrag: () => {},
      setDropTarget: () => {},
      startProcessing: () => {},
      endProcessing: () => {},
    } as DragDropContextValue;
  }
  return context;
};

export const DragDropProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [state, setState] = useState<DragDropState>({
    isDragging: false,
    dragSource: null,
    dragItemId: null,
    dropTarget: null,
    isProcessing: false,
    processingTarget: null,
    showSuccess: null,
  });

  const startDrag = useCallback((source: DragSource, itemId: string) => {
    setState(prev => ({
      ...prev,
      isDragging: true,
      dragSource: source,
      dragItemId: itemId,
    }));
  }, []);

  const endDrag = useCallback(() => {
    setState(prev => ({
      ...prev,
      isDragging: false,
      dragSource: null,
      dragItemId: null,
      dropTarget: null,
    }));
  }, []);

  const setDropTarget = useCallback((target: DropTarget) => {
    setState(prev => ({
      ...prev,
      dropTarget: target,
    }));
  }, []);

  const startProcessing = useCallback((target: DropTarget) => {
    setState(prev => ({
      ...prev,
      isProcessing: true,
      processingTarget: target,
    }));
  }, []);

  const endProcessing = useCallback((showSuccess = true) => {
    const successTarget = state.processingTarget;
    
    setState(prev => ({
      ...prev,
      isProcessing: false,
      processingTarget: null,
      showSuccess: showSuccess ? successTarget : null,
    }));

    // Auto-hide success after 1s
    if (showSuccess && successTarget) {
      setTimeout(() => {
        setState(prev => ({
          ...prev,
          showSuccess: null,
        }));
      }, 1000);
    }
  }, [state.processingTarget]);

  const value: DragDropContextValue = {
    ...state,
    startDrag,
    endDrag,
    setDropTarget,
    startProcessing,
    endProcessing,
  };

  return (
    <DragDropContext.Provider value={value}>
      {children}
    </DragDropContext.Provider>
  );
};
