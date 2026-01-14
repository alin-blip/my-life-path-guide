import React from 'react';
import { cn } from '@/lib/utils';
import { Loader2, Check, ArrowDown } from 'lucide-react';

interface DragDropIndicatorProps {
  isDragOver: boolean;
  isProcessing?: boolean;
  isSuccess?: boolean;
  dropLabel?: string;
  className?: string;
}

export const DragDropIndicator: React.FC<DragDropIndicatorProps> = ({
  isDragOver,
  isProcessing = false,
  isSuccess = false,
  dropLabel = 'Drop here',
  className
}) => {
  if (!isDragOver && !isProcessing && !isSuccess) return null;

  return (
    <div
      className={cn(
        "absolute inset-0 z-50 flex items-center justify-center rounded-xl transition-all duration-200 pointer-events-none",
        isDragOver && !isProcessing && !isSuccess && "bg-primary/10 border-2 border-dashed border-primary animate-drop-zone-pulse",
        isProcessing && "bg-background/80 backdrop-blur-sm",
        isSuccess && "bg-green-500/10",
        className
      )}
    >
      {isProcessing && (
        <div className="flex items-center gap-2 text-primary animate-fade-in">
          <Loader2 className="w-5 h-5 animate-spin" />
          <span className="text-sm font-medium">Processing...</span>
        </div>
      )}
      
      {isSuccess && (
        <div className="flex items-center gap-2 text-green-600 animate-success-pop">
          <div className="w-8 h-8 rounded-full bg-green-500 flex items-center justify-center">
            <Check className="w-5 h-5 text-white" />
          </div>
        </div>
      )}
      
      {isDragOver && !isProcessing && !isSuccess && (
        <div className="flex flex-col items-center gap-2 animate-fade-in">
          <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center animate-bounce">
            <ArrowDown className="w-5 h-5 text-primary" />
          </div>
          <span className="text-sm font-medium text-primary">{dropLabel}</span>
        </div>
      )}
    </div>
  );
};

// Compact version for inline indicators
export const DragDropBadge: React.FC<{
  isDragging: boolean;
  label?: string;
}> = ({ isDragging, label = 'Dragging...' }) => {
  if (!isDragging) return null;
  
  return (
    <div className="absolute -top-2 -right-2 z-10 bg-primary text-primary-foreground text-xs px-2 py-0.5 rounded-full animate-fade-in shadow-lg">
      {label}
    </div>
  );
};

// Success overlay that auto-hides
export const DropSuccessOverlay: React.FC<{
  show: boolean;
  message?: string;
}> = ({ show, message = 'Added!' }) => {
  if (!show) return null;
  
  return (
    <div className="absolute inset-0 z-50 flex items-center justify-center bg-green-500/10 rounded-xl animate-fade-in pointer-events-none">
      <div className="flex items-center gap-2 text-green-600 animate-success-pop">
        <Check className="w-5 h-5" />
        <span className="text-sm font-medium">{message}</span>
      </div>
    </div>
  );
};
