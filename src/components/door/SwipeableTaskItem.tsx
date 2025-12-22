import React, { useState, useRef } from 'react';
import { Check, Trash2, Star, Flag, AlertCircle, KeyRound, ChevronRight, ChevronLeft } from 'lucide-react';
import { TaskPriority } from '@/types/door';
import { haptic } from '@/utils/hapticFeedback';
import { cn } from '@/lib/utils';

interface SwipeableTaskItemProps {
  id: string;
  text: string;
  completed: boolean;
  priority?: TaskPriority;
  isKeyPoint?: boolean;
  onToggleCompletion: (id: string) => void;
  onDelete?: (id: string) => void;
  onMoveBack?: (id: string) => void;
  isMobile?: boolean;
}

export const SwipeableTaskItem: React.FC<SwipeableTaskItemProps> = ({
  id,
  text,
  completed,
  priority,
  isKeyPoint,
  onToggleCompletion,
  onDelete,
  onMoveBack,
  isMobile = false
}) => {
  const [translateX, setTranslateX] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [showHint, setShowHint] = useState(true);
  const startXRef = useRef(0);
  const startTimeRef = useRef(0);

  const SWIPE_THRESHOLD = 60;
  const MAX_SWIPE = 100;

  const handleTouchStart = (e: React.TouchEvent) => {
    if (!isMobile) return;
    startXRef.current = e.touches[0].clientX;
    startTimeRef.current = Date.now();
    setIsDragging(true);
    setShowHint(false);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging || !isMobile) return;
    const currentX = e.touches[0].clientX;
    const diff = currentX - startXRef.current;
    
    // Add resistance at edges
    const resistance = 0.5;
    let clampedDiff = diff;
    if (Math.abs(diff) > SWIPE_THRESHOLD) {
      const excess = Math.abs(diff) - SWIPE_THRESHOLD;
      clampedDiff = Math.sign(diff) * (SWIPE_THRESHOLD + excess * resistance);
    }
    clampedDiff = Math.max(-MAX_SWIPE, Math.min(MAX_SWIPE, clampedDiff));
    setTranslateX(clampedDiff);
    
    // Haptic at threshold
    if (Math.abs(clampedDiff) >= SWIPE_THRESHOLD && Math.abs(diff - clampedDiff) < 5) {
      haptic.light();
    }
  };

  const handleTouchEnd = () => {
    if (!isMobile) return;
    setIsDragging(false);

    const duration = Date.now() - startTimeRef.current;
    const velocity = Math.abs(translateX) / duration;
    const isQuickSwipe = velocity > 0.5 && Math.abs(translateX) > 30;

    if (translateX > SWIPE_THRESHOLD || (isQuickSwipe && translateX > 0)) {
      haptic.success();
      onToggleCompletion(id);
    } else if ((translateX < -SWIPE_THRESHOLD || (isQuickSwipe && translateX < 0)) && onDelete) {
      haptic.warning();
      onDelete(id);
    }

    setTranslateX(0);
  };

  const getPriorityStyles = (priority?: TaskPriority, isCompleted: boolean = false) => {
    if (isCompleted) return 'border-l-4 border-l-green-500 bg-green-500/5';
    switch (priority) {
      case 'important':
        return 'border-l-4 border-l-green-500';
      case 'urgent':
        return 'border-l-4 border-l-orange-500';
      case 'urgent-important':
        return 'border-l-4 border-l-red-500';
      default:
        return 'border-l-4 border-l-transparent';
    }
  };

  const getPriorityIcon = (priority?: TaskPriority) => {
    switch (priority) {
      case 'important':
        return <Star className="w-3 h-3 text-green-500" />;
      case 'urgent':
        return <Flag className="w-3 h-3 text-orange-500" />;
      case 'urgent-important':
        return <AlertCircle className="w-3 h-3 text-red-500" />;
      default:
        return null;
    }
  };

  const rightProgress = Math.min(1, Math.max(0, translateX / SWIPE_THRESHOLD));
  const leftProgress = Math.min(1, Math.max(0, -translateX / SWIPE_THRESHOLD));

  return (
    <div className="relative overflow-hidden rounded-lg mb-2">
      {/* Swipe backgrounds */}
      {isMobile && (
        <>
          {/* Complete action (right swipe) */}
          <div 
            className={cn(
              "absolute inset-y-0 left-0 flex items-center pl-4 transition-all duration-150",
              rightProgress >= 1 ? 'bg-green-500' : 'bg-green-500/80'
            )}
            style={{ 
              width: `${Math.max(translateX, 0)}px`,
              opacity: rightProgress 
            }}
          >
            <Check className={cn(
              "w-5 h-5 text-white transition-transform",
              rightProgress >= 1 && "scale-125"
            )} />
          </div>
          
          {/* Delete action (left swipe) */}
          <div 
            className={cn(
              "absolute inset-y-0 right-0 flex items-center justify-end pr-4 transition-all duration-150",
              leftProgress >= 1 ? 'bg-red-500' : 'bg-red-500/80'
            )}
            style={{ 
              width: `${Math.max(-translateX, 0)}px`,
              opacity: leftProgress 
            }}
          >
            <Trash2 className={cn(
              "w-5 h-5 text-white transition-transform",
              leftProgress >= 1 && "scale-125"
            )} />
          </div>
        </>
      )}

      {/* Task content */}
      <div 
        className={cn(
          "flex items-center gap-3 p-3 bg-card rounded-lg relative z-10 touch-pan-y",
          getPriorityStyles(priority, completed),
          isDragging ? '' : 'transition-transform duration-200 ease-out'
        )}
        style={{ transform: isMobile ? `translateX(${translateX}px)` : undefined }}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        {/* Checkbox */}
        <button
          className={cn(
            "w-6 h-6 rounded-full flex items-center justify-center shrink-0 transition-all duration-200",
            completed 
              ? 'bg-green-500 text-white' 
              : 'border-2 border-border'
          )}
          onClick={() => {
            haptic.light();
            onToggleCompletion(id);
          }}
        >
          {completed && <Check className="w-3.5 h-3.5" />}
        </button>
        
        {/* Text and badges */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            {!completed && getPriorityIcon(priority)}
            <span className={cn(
              "text-sm leading-tight",
              completed && 'text-muted-foreground line-through'
            )}>
              {text}
            </span>
          </div>
        </div>
        
        {/* Key point badge */}
        {isKeyPoint && (
          <span className="shrink-0 bg-primary/15 text-primary px-1.5 py-0.5 rounded text-[10px] font-medium flex items-center gap-0.5">
            <KeyRound className="w-2.5 h-2.5" />
          </span>
        )}

        {/* Swipe hint arrows */}
        {isMobile && showHint && !completed && (
          <div className="flex items-center gap-1 text-muted-foreground/40">
            <ChevronLeft className="w-3 h-3" />
            <ChevronRight className="w-3 h-3" />
          </div>
        )}
      </div>
    </div>
  );
};
