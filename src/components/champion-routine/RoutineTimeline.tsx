import React from 'react';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';
import { Check, SkipForward, Lock } from 'lucide-react';
import { RoutineStepId } from './ChampionRoutineFlow';
import { ChampionLog } from '@/hooks/useChampionRoutine';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

interface RoutineTimelineProps {
  steps: RoutineStepId[];
  currentStepIndex: number;
  todayLog: ChampionLog | null;
  skippedSteps: RoutineStepId[];
  stepLabels: Record<RoutineStepId, string>;
  categoryColors: Record<string, string>;
  stepCategories: Record<RoutineStepId, string>;
  isStepCompleted: (stepId: RoutineStepId, log: ChampionLog | null) => boolean;
  onStepClick: (index: number) => void;
}

export function RoutineTimeline({
  steps,
  currentStepIndex,
  todayLog,
  skippedSteps,
  stepLabels,
  categoryColors,
  stepCategories,
  isStepCompleted,
  onStepClick,
}: RoutineTimelineProps) {
  const getStepStatus = (stepId: RoutineStepId, index: number): 'completed' | 'current' | 'skipped' | 'locked' => {
    if (skippedSteps.includes(stepId)) return 'skipped';
    if (isStepCompleted(stepId, todayLog)) return 'completed';
    if (index === currentStepIndex) return 'current';
    return 'locked';
  };

  const getStatusColor = (status: 'completed' | 'current' | 'skipped' | 'locked') => {
    switch (status) {
      case 'completed': return 'bg-green-500 border-green-400';
      case 'current': return 'bg-primary border-primary animate-pulse';
      case 'skipped': return 'bg-red-500/60 border-red-400';
      case 'locked': return 'bg-muted border-muted-foreground/30';
    }
  };

  const getLineColor = (index: number) => {
    const stepId = steps[index];
    const status = getStepStatus(stepId, index);
    if (status === 'completed') return 'bg-green-500';
    if (status === 'skipped') return 'bg-red-500/60';
    return 'bg-muted-foreground/30';
  };

  return (
    <TooltipProvider>
      <div className="flex items-center justify-center w-full px-2 py-1">
        <div className="flex items-center gap-0.5 overflow-x-auto scrollbar-hide max-w-full">
          {steps.map((stepId, index) => {
            const status = getStepStatus(stepId, index);
            const category = stepCategories[stepId];
            const categoryColor = categoryColors[category];
            const isClickable = status !== 'locked' || index <= currentStepIndex + 1;

            return (
              <React.Fragment key={stepId}>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <motion.button
                      className={cn(
                        "relative w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all",
                        getStatusColor(status),
                        isClickable && "cursor-pointer hover:scale-110",
                        !isClickable && "cursor-not-allowed opacity-50"
                      )}
                      onClick={() => isClickable && onStepClick(index)}
                      whileHover={isClickable ? { scale: 1.15 } : {}}
                      whileTap={isClickable ? { scale: 0.95 } : {}}
                      initial={{ scale: 0.8, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={{ delay: index * 0.02 }}
                    >
                      {status === 'completed' && (
                        <Check className="w-3 h-3 text-white" />
                      )}
                      {status === 'skipped' && (
                        <SkipForward className="w-3 h-3 text-white" />
                      )}
                      {status === 'locked' && (
                        <Lock className="w-2 h-2 text-white/50" />
                      )}
                      {status === 'current' && (
                        <motion.div
                          className="w-2 h-2 bg-white rounded-full"
                          animate={{ scale: [1, 1.2, 1] }}
                          transition={{ repeat: Infinity, duration: 1.5 }}
                        />
                      )}
                    </motion.button>
                  </TooltipTrigger>
                  <TooltipContent side="bottom" className="text-xs">
                    <span className={cn("font-medium", categoryColor)}>
                      {stepLabels[stepId]}
                    </span>
                    {status === 'completed' && <span className="text-green-400 ml-1">✓</span>}
                    {status === 'skipped' && <span className="text-red-400 ml-1">sărit</span>}
                  </TooltipContent>
                </Tooltip>

                {/* Connecting line */}
                {index < steps.length - 1 && (
                  <div 
                    className={cn(
                      "h-0.5 w-2 flex-shrink-0",
                      getLineColor(index)
                    )}
                  />
                )}
              </React.Fragment>
            );
          })}
        </div>
      </div>
    </TooltipProvider>
  );
}
