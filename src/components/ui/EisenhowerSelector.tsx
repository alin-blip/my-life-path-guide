import React from 'react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import { 
  EisenhowerQuadrant, 
  EISENHOWER_QUADRANTS, 
  priorityToQuadrant,
  quadrantToPriority,
  QuadrantConfig 
} from '@/types/eisenhower';

interface EisenhowerSelectorProps {
  priority: number;
  onSelect: (priority: number) => void;
  trigger?: React.ReactNode;
  disabled?: boolean;
}

const QuadrantCell: React.FC<{
  config: QuadrantConfig;
  isSelected: boolean;
  onClick: () => void;
  position: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';
}> = ({ config, isSelected, onClick, position }) => {
  const roundedClass = {
    'top-left': 'rounded-tl-lg',
    'top-right': 'rounded-tr-lg',
    'bottom-left': 'rounded-bl-lg',
    'bottom-right': 'rounded-br-lg'
  }[position];

  return (
    <button
      onClick={onClick}
      className={cn(
        'flex flex-col items-center justify-center p-3 transition-all cursor-pointer border',
        config.bgColor,
        config.borderColor,
        config.hoverBgColor,
        roundedClass,
        isSelected && 'ring-2 ring-primary ring-offset-1 ring-offset-background'
      )}
    >
      <span className="text-xl mb-1">{config.icon}</span>
      <span className={cn('text-xs font-medium', config.color)}>
        {config.labelRo}
      </span>
      <span className="text-[10px] text-muted-foreground mt-0.5">
        {config.actionRo}
      </span>
    </button>
  );
};

export const EisenhowerSelector: React.FC<EisenhowerSelectorProps> = ({
  priority,
  onSelect,
  trigger,
  disabled = false
}) => {
  const [open, setOpen] = React.useState(false);
  const currentQuadrant = priorityToQuadrant(priority);

  const handleSelect = (quadrant: EisenhowerQuadrant) => {
    onSelect(quadrantToPriority(quadrant));
    setOpen(false);
  };

  const defaultTrigger = (
    <button
      disabled={disabled}
      className={cn(
        'inline-flex items-center gap-1 px-2 py-1 rounded-md border text-xs font-medium transition-all',
        EISENHOWER_QUADRANTS[currentQuadrant].bgColor,
        EISENHOWER_QUADRANTS[currentQuadrant].borderColor,
        EISENHOWER_QUADRANTS[currentQuadrant].color,
        'hover:opacity-80',
        disabled && 'opacity-50 cursor-not-allowed'
      )}
    >
      <span>{EISENHOWER_QUADRANTS[currentQuadrant].icon}</span>
      <span className="hidden sm:inline">{EISENHOWER_QUADRANTS[currentQuadrant].labelRo}</span>
    </button>
  );

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        {trigger || defaultTrigger}
      </PopoverTrigger>
      <PopoverContent 
        className="w-64 p-2 bg-popover border-border" 
        align="start"
        sideOffset={4}
      >
        {/* Header */}
        <div className="text-center mb-2">
          <p className="text-xs font-medium text-muted-foreground">Matricea Eisenhower</p>
        </div>

        {/* Axis Labels */}
        <div className="flex items-center justify-center gap-1 mb-1">
          <span className="text-[10px] text-red-400 font-medium">URGENT</span>
          <span className="text-[10px] text-muted-foreground mx-2">←→</span>
          <span className="text-[10px] text-green-400 font-medium">NU URGENT</span>
        </div>

        {/* 2x2 Grid */}
        <div className="grid grid-cols-2 gap-0.5">
          {/* Top Row - Important */}
          <QuadrantCell
            config={EISENHOWER_QUADRANTS.q1_reactor}
            isSelected={currentQuadrant === 'q1_reactor'}
            onClick={() => handleSelect('q1_reactor')}
            position="top-left"
          />
          <QuadrantCell
            config={EISENHOWER_QUADRANTS.q2_creator}
            isSelected={currentQuadrant === 'q2_creator'}
            onClick={() => handleSelect('q2_creator')}
            position="top-right"
          />
          
          {/* Bottom Row - Not Important */}
          <QuadrantCell
            config={EISENHOWER_QUADRANTS.q3_delegator}
            isSelected={currentQuadrant === 'q3_delegator'}
            onClick={() => handleSelect('q3_delegator')}
            position="bottom-left"
          />
          <QuadrantCell
            config={EISENHOWER_QUADRANTS.q4_eliminator}
            isSelected={currentQuadrant === 'q4_eliminator'}
            onClick={() => handleSelect('q4_eliminator')}
            position="bottom-right"
          />
        </div>

        {/* Side Labels */}
        <div className="flex items-center justify-center gap-1 mt-2">
          <span className="text-[10px] text-blue-400 font-medium">IMPORTANT ↑</span>
          <span className="text-[10px] text-muted-foreground mx-2">|</span>
          <span className="text-[10px] text-gray-400 font-medium">↓ NEIMPORTANT</span>
        </div>

        {/* Best Choice Indicator */}
        <div className="mt-2 pt-2 border-t border-border">
          <p className="text-[10px] text-center text-muted-foreground">
            <span className="text-green-400">✨ Creator</span> = cel mai bun cadran (planifici, nu reacționezi)
          </p>
        </div>
      </PopoverContent>
    </Popover>
  );
};
