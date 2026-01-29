import React from 'react';
import { cn } from '@/lib/utils';
import { 
  EISENHOWER_QUADRANTS, 
  priorityToQuadrant 
} from '@/types/eisenhower';

interface QuadrantBadgeProps {
  priority: number;
  size?: 'sm' | 'md' | 'lg';
  onClick?: () => void;
  showLabel?: boolean;
  className?: string;
}

export const QuadrantBadge: React.FC<QuadrantBadgeProps> = ({
  priority,
  size = 'sm',
  onClick,
  showLabel = false,
  className
}) => {
  const quadrant = priorityToQuadrant(priority);
  const config = EISENHOWER_QUADRANTS[quadrant];

  const sizeClasses = {
    sm: 'px-1.5 py-0.5 text-[10px]',
    md: 'px-2 py-1 text-xs',
    lg: 'px-3 py-1.5 text-sm'
  };

  const iconSizes = {
    sm: 'text-xs',
    md: 'text-sm',
    lg: 'text-base'
  };

  return (
    <span
      onClick={onClick}
      className={cn(
        'inline-flex items-center gap-1 rounded-full border font-medium transition-all',
        config.bgColor,
        config.borderColor,
        config.color,
        sizeClasses[size],
        onClick && 'cursor-pointer hover:opacity-80 active:scale-95',
        className
      )}
      title={`${config.labelRo} - ${config.actionRo}`}
    >
      <span className={iconSizes[size]}>{config.icon}</span>
      {showLabel && <span>{config.labelRo}</span>}
    </span>
  );
};
