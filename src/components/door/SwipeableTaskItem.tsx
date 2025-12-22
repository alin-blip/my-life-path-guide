import React, { useState, useRef } from 'react';
import { Check, Trash2, ArrowLeft, Star, Flag, AlertCircle, KeyRound } from 'lucide-react';
import { TaskPriority } from '@/types/door';
import { useLanguage } from '@/context/LanguageContext';
import { haptic } from '@/utils/hapticFeedback';

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
  const { t } = useLanguage();
  const [translateX, setTranslateX] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const startXRef = useRef(0);
  const containerRef = useRef<HTMLDivElement>(null);

  const SWIPE_THRESHOLD = 80;
  const MAX_SWIPE = 100;

  const handleTouchStart = (e: React.TouchEvent) => {
    if (!isMobile) return;
    startXRef.current = e.touches[0].clientX;
    setIsDragging(true);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging || !isMobile) return;
    const currentX = e.touches[0].clientX;
    const diff = currentX - startXRef.current;
    
    // Clamp the value
    const clampedDiff = Math.max(-MAX_SWIPE, Math.min(MAX_SWIPE, diff));
    setTranslateX(clampedDiff);
  };

  const handleTouchEnd = () => {
    if (!isMobile) return;
    setIsDragging(false);

    if (translateX > SWIPE_THRESHOLD) {
      // Swipe right - complete
      haptic.success();
      onToggleCompletion(id);
    } else if (translateX < -SWIPE_THRESHOLD && onDelete) {
      // Swipe left - delete
      haptic.warning();
      onDelete(id);
    }

    // Reset position
    setTranslateX(0);
  };

  const getPriorityClasses = (priority?: TaskPriority, completed: boolean = false) => {
    if (completed) return 'bg-green-500/10';

    switch (priority) {
      case 'important':
        return 'bg-green-500/10';
      case 'urgent':
        return 'bg-orange-500/10';
      case 'urgent-important':
        return 'bg-red-500/10';
      default:
        return 'bg-muted';
    }
  };

  const getPriorityIcon = (priority?: TaskPriority) => {
    const iconSize = isMobile ? 'w-3 h-3' : 'w-4 h-4';
    switch (priority) {
      case 'important':
        return <Star className={`${iconSize} text-green-500 mr-2`} />;
      case 'urgent':
        return <Flag className={`${iconSize} text-orange-500 mr-2`} />;
      case 'urgent-important':
        return <AlertCircle className={`${iconSize} text-red-500 mr-2`} />;
      default:
        return null;
    }
  };

  // Calculate background opacity based on swipe distance
  const rightSwipeOpacity = Math.min(1, Math.max(0, translateX / SWIPE_THRESHOLD));
  const leftSwipeOpacity = Math.min(1, Math.max(0, -translateX / SWIPE_THRESHOLD));

  return (
    <div 
      ref={containerRef}
      className="relative overflow-hidden rounded-md"
    >
      {/* Background actions */}
      {isMobile && (
        <>
          {/* Complete action (right swipe) */}
          <div 
            className="absolute inset-y-0 left-0 w-24 flex items-center justify-center bg-green-500 transition-opacity"
            style={{ opacity: rightSwipeOpacity }}
          >
            <Check className="w-6 h-6 text-white" />
          </div>
          
          {/* Delete action (left swipe) */}
          <div 
            className="absolute inset-y-0 right-0 w-24 flex items-center justify-center bg-red-500 transition-opacity"
            style={{ opacity: leftSwipeOpacity }}
          >
            <Trash2 className="w-6 h-6 text-white" />
          </div>
        </>
      )}

      {/* Task content */}
      <div 
        className={`flex items-center rounded-md ${getPriorityClasses(priority, completed)} ${
          isMobile ? 'p-3' : 'p-2'
        } transition-transform duration-150 ease-out relative z-10 bg-card`}
        style={{ 
          transform: isMobile ? `translateX(${translateX}px)` : undefined,
          transition: isDragging ? 'none' : 'transform 0.2s ease-out'
        }}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        <button
          className={`${isMobile ? 'w-6 h-6' : 'w-6 h-6'} p-0 rounded-full mr-3 flex items-center justify-center ${
            completed ? 'bg-green-500 text-white' : 'bg-transparent border border-border text-muted-foreground'
          } transition-all duration-200`}
          onClick={() => {
            haptic.light();
            onToggleCompletion(id);
          }}
        >
          {completed && <Check className={`${isMobile ? 'w-3 h-3' : 'w-3 h-3'}`} />}
        </button>
        
        <span className={`flex-grow ${completed ? 'text-muted-foreground line-through' : 'text-foreground'} ${
          isMobile ? 'text-sm' : ''
        } flex items-center`}>
          {!completed && getPriorityIcon(priority)}
          {text}
        </span>
        
        {isKeyPoint && (
          <span className={`bg-primary/20 text-primary px-2 py-0.5 rounded mr-2 flex items-center ${
            isMobile ? 'text-xs px-1.5 py-0.5' : 'text-xs'
          }`}>
            <KeyRound className={`${isMobile ? 'w-2 h-2' : 'w-3 h-3'} mr-1`} />
            {t('keyPointLabel')}
          </span>
        )}
        
        {onMoveBack && !isMobile && (
          <button
            className="text-muted-foreground hover:text-primary transition-colors p-1"
            onClick={() => onMoveBack(id)}
            title={t('moveBackToIdeaList')}
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Swipe hints for mobile */}
      {isMobile && translateX === 0 && (
        <div className="absolute inset-0 pointer-events-none flex items-center justify-between px-2 opacity-0 group-hover:opacity-100">
          <div className="text-xs text-green-500">← Complete</div>
          <div className="text-xs text-red-500">Delete →</div>
        </div>
      )}
    </div>
  );
};
