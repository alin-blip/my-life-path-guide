import React from 'react';
import { cn } from '@/lib/utils';
import { CheckCircle, Circle, Lock } from 'lucide-react';

interface PrincipleTimelineProps {
  currentPrinciple: number;
  selectedPrinciple: number;
  onPrincipleSelect: (principle: number) => void;
  completedPrinciples: number[];
  principles: string[];
}

export const PrincipleTimeline: React.FC<PrincipleTimelineProps> = ({
  currentPrinciple,
  selectedPrinciple,
  onPrincipleSelect,
  completedPrinciples,
  principles
}) => {
  return (
    <div className="relative">
      {/* Progress bar background */}
      <div className="absolute top-5 left-0 right-0 h-1 bg-muted"></div>
      
      {/* Progress bar fill */}
      <div 
        className="absolute top-5 left-0 h-1 bg-primary transition-all duration-500"
        style={{ width: `${(currentPrinciple / 14) * 100}%` }}
      ></div>

      {/* Timeline points */}
      <div className="relative flex justify-between">
        {principles.map((principle, index) => {
          const principleNum = index + 1;
          const isCompleted = completedPrinciples.includes(principleNum);
          const isCurrent = principleNum === currentPrinciple;
          const isSelected = principleNum === selectedPrinciple;
          const isLocked = principleNum > currentPrinciple;

          return (
            <button
              key={principleNum}
              onClick={() => !isLocked && onPrincipleSelect(principleNum)}
              disabled={isLocked}
              className={cn(
                "flex flex-col items-center group relative",
                isLocked ? "cursor-not-allowed opacity-50" : "cursor-pointer"
              )}
            >
              {/* Circle indicator */}
              <div className={cn(
                "w-10 h-10 rounded-full flex items-center justify-center transition-all",
                "border-2 bg-background",
                isCompleted && "border-green-500 bg-green-500",
                isCurrent && !isCompleted && "border-primary bg-primary",
                isSelected && "ring-4 ring-primary/30",
                !isCompleted && !isCurrent && !isLocked && "border-muted-foreground hover:border-primary",
                isLocked && "border-muted"
              )}>
                {isCompleted ? (
                  <CheckCircle className="w-5 h-5 text-white" />
                ) : isLocked ? (
                  <Lock className="w-5 h-5 text-muted-foreground" />
                ) : isCurrent ? (
                  <Circle className="w-5 h-5 text-white fill-current" />
                ) : (
                  <span className="text-sm font-semibold text-muted-foreground">
                    {principleNum}
                  </span>
                )}
              </div>

              {/* Principle name tooltip */}
              <div className={cn(
                "absolute top-12 w-32 text-xs text-center transition-opacity",
                "opacity-0 group-hover:opacity-100 pointer-events-none",
                "bg-popover border border-border rounded px-2 py-1 shadow-lg z-10"
              )}>
                <p className="font-semibold text-foreground">{principle}</p>
              </div>

              {/* Always visible label for selected */}
              {isSelected && (
                <div className="absolute top-12 w-32 text-xs text-center">
                  <p className="font-semibold text-primary">{principle}</p>
                </div>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
};
