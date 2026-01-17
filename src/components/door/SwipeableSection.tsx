import React, { useState, useRef } from 'react';

interface SwipeableSectionProps {
  children: React.ReactNode;
  onSwipeLeft?: () => void;
  onSwipeRight?: () => void;
  className?: string;
}

export const SwipeableSection: React.FC<SwipeableSectionProps> = ({
  children,
  onSwipeLeft,
  onSwipeRight,
  className = '',
}) => {
  const [touchStart, setTouchStart] = useState<{ x: number; y: number } | null>(null);
  const [touchEnd, setTouchEnd] = useState<{ x: number; y: number } | null>(null);
  const [isHorizontalSwipe, setIsHorizontalSwipe] = useState(false);
  const [swipeOffset, setSwipeOffset] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);

  // Minimum swipe distance (in px) to trigger a swipe action
  const minSwipeDistance = 50;
  // Threshold to determine if it's a horizontal or vertical swipe
  const directionThreshold = 10;

  const onTouchStart = (e: React.TouchEvent) => {
    setTouchEnd(null);
    setTouchStart({
      x: e.targetTouches[0].clientX,
      y: e.targetTouches[0].clientY
    });
    setIsHorizontalSwipe(false);
  };

  const onTouchMove = (e: React.TouchEvent) => {
    if (!touchStart) return;
    
    const currentX = e.targetTouches[0].clientX;
    const currentY = e.targetTouches[0].clientY;
    
    const deltaX = Math.abs(currentX - touchStart.x);
    const deltaY = Math.abs(currentY - touchStart.y);
    
    // Only determine direction once when movement exceeds threshold
    if (!isHorizontalSwipe && (deltaX > directionThreshold || deltaY > directionThreshold)) {
      // If horizontal movement is greater, it's a horizontal swipe
      if (deltaX > deltaY) {
        setIsHorizontalSwipe(true);
      } else {
        // Vertical scroll - don't interfere
        return;
      }
    }
    
    // Only apply horizontal swipe effects if it's a horizontal swipe
    if (isHorizontalSwipe) {
      setTouchEnd({ x: currentX, y: currentY });
      const offset = currentX - touchStart.x;
      const limitedOffset = Math.max(-100, Math.min(100, offset));
      setSwipeOffset(limitedOffset);
    }
  };

  const onTouchEnd = () => {
    if (!touchStart || !touchEnd || !isHorizontalSwipe) {
      setIsHorizontalSwipe(false);
      setSwipeOffset(0);
      setTouchStart(null);
      setTouchEnd(null);
      return;
    }

    const distance = touchStart.x - touchEnd.x;
    const isLeftSwipe = distance > minSwipeDistance;
    const isRightSwipe = distance < -minSwipeDistance;

    if (isLeftSwipe && onSwipeLeft) {
      onSwipeLeft();
    }
    if (isRightSwipe && onSwipeRight) {
      onSwipeRight();
    }

    // Reset state
    setIsHorizontalSwipe(false);
    setSwipeOffset(0);
    setTouchStart(null);
    setTouchEnd(null);
  };

  return (
    <div
      ref={containerRef}
      onTouchStart={onTouchStart}
      onTouchMove={onTouchMove}
      onTouchEnd={onTouchEnd}
      className={`${className} transition-transform duration-200 w-full max-w-full overflow-hidden box-border`}
      style={{
        transform: isHorizontalSwipe && swipeOffset !== 0 ? `translateX(${swipeOffset}px)` : 'translateX(0)',
      }}
    >
      {children}
    </div>
  );
};
