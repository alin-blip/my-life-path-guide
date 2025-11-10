import React, { useState, useRef, useEffect } from 'react';

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
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);
  const [isSwiping, setIsSwiping] = useState(false);
  const [swipeOffset, setSwipeOffset] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);

  // Minimum swipe distance (in px) to trigger a swipe action
  const minSwipeDistance = 50;

  const onTouchStart = (e: React.TouchEvent) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
    setIsSwiping(true);
  };

  const onTouchMove = (e: React.TouchEvent) => {
    if (touchStart === null) return;
    const currentTouch = e.targetTouches[0].clientX;
    setTouchEnd(currentTouch);
    
    // Calculate swipe offset for visual feedback
    const offset = currentTouch - touchStart;
    // Limit offset to prevent excessive swipe
    const limitedOffset = Math.max(-150, Math.min(150, offset));
    setSwipeOffset(limitedOffset);
  };

  const onTouchEnd = () => {
    if (!touchStart || !touchEnd) {
      setIsSwiping(false);
      setSwipeOffset(0);
      return;
    }

    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > minSwipeDistance;
    const isRightSwipe = distance < -minSwipeDistance;

    if (isLeftSwipe && onSwipeLeft) {
      onSwipeLeft();
    }
    if (isRightSwipe && onSwipeRight) {
      onSwipeRight();
    }

    // Reset state
    setIsSwiping(false);
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
      className={`${className} transition-transform duration-200 ${
        isSwiping ? 'touch-none' : ''
      }`}
      style={{
        transform: isSwiping ? `translateX(${swipeOffset}px)` : 'translateX(0)',
      }}
    >
      {children}
    </div>
  );
};
