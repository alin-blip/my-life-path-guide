import React from 'react';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';
import { Check, SkipForward, Heart, Brain, Dumbbell, Briefcase, Users, Trophy } from 'lucide-react';
import { RoutineStepId } from './ChampionRoutineFlow';
import { ChampionLog } from '@/hooks/useChampionRoutine';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

interface EnhancedProgressBarProps {
  steps: RoutineStepId[];
  currentStepIndex: number;
  todayLog: ChampionLog | null;
  skippedSteps: RoutineStepId[];
  stepLabels: Record<RoutineStepId, string>;
  stepCategories: Record<RoutineStepId, string>;
  isStepCompleted: (stepId: RoutineStepId, log: ChampionLog | null) => boolean;
  onStepClick: (index: number) => void;
}

const CATEGORY_CONFIG = {
  emotional: { icon: Heart, color: 'from-amber-500 to-orange-500', bg: 'bg-amber-500/10', border: 'border-amber-500/30', label: 'Emoții' },
  being: { icon: Brain, color: 'from-purple-500 to-indigo-500', bg: 'bg-purple-500/10', border: 'border-purple-500/30', label: 'Being' },
  body: { icon: Dumbbell, color: 'from-red-500 to-pink-500', bg: 'bg-red-500/10', border: 'border-red-500/30', label: 'Body' },
  business: { icon: Briefcase, color: 'from-blue-500 to-cyan-500', bg: 'bg-blue-500/10', border: 'border-blue-500/30', label: 'Business' },
  balance: { icon: Users, color: 'from-pink-500 to-rose-500', bg: 'bg-pink-500/10', border: 'border-pink-500/30', label: 'Balance' },
  habits: { icon: Check, color: 'from-green-500 to-emerald-500', bg: 'bg-green-500/10', border: 'border-green-500/30', label: 'Habits' },
  tasks: { icon: Check, color: 'from-teal-500 to-cyan-500', bg: 'bg-teal-500/10', border: 'border-teal-500/30', label: 'Tasks' },
  complete: { icon: Trophy, color: 'from-yellow-500 to-amber-500', bg: 'bg-yellow-500/10', border: 'border-yellow-500/30', label: 'Final' },
};

export function EnhancedProgressBar({
  steps,
  currentStepIndex,
  todayLog,
  skippedSteps,
  stepLabels,
  stepCategories,
  isStepCompleted,
  onStepClick,
}: EnhancedProgressBarProps) {
  // Group steps by category
  const groupedSteps = React.useMemo(() => {
    const groups: { category: string; steps: { id: RoutineStepId; index: number }[] }[] = [];
    let currentGroup: { category: string; steps: { id: RoutineStepId; index: number }[] } | null = null;

    steps.forEach((stepId, index) => {
      const category = stepCategories[stepId];
      if (!currentGroup || currentGroup.category !== category) {
        if (currentGroup) groups.push(currentGroup);
        currentGroup = { category, steps: [] };
      }
      currentGroup.steps.push({ id: stepId, index });
    });
    if (currentGroup) groups.push(currentGroup);

    return groups;
  }, [steps, stepCategories]);

  const getStepStatus = (stepId: RoutineStepId, index: number): 'completed' | 'current' | 'skipped' | 'locked' => {
    if (skippedSteps.includes(stepId)) return 'skipped';
    if (isStepCompleted(stepId, todayLog)) return 'completed';
    if (index === currentStepIndex) return 'current';
    return 'locked';
  };

  // Calculate total progress
  const completedCount = steps.filter((s, i) => 
    isStepCompleted(s, todayLog) || skippedSteps.includes(s)
  ).length;
  const progressPercent = Math.round((completedCount / (steps.length - 1)) * 100); // -1 for completion step

  return (
    <TooltipProvider>
      <div className="w-full space-y-3">
        {/* Main Progress Bar */}
        <div className="relative">
          <div className="h-2 bg-muted rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-gradient-to-r from-amber-500 via-purple-500 to-green-500 rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${progressPercent}%` }}
              transition={{ duration: 0.5, ease: 'easeOut' }}
            />
          </div>
          <div className="absolute -top-1 right-0 text-xs font-bold bg-gradient-to-r from-amber-500 to-green-500 bg-clip-text text-transparent">
            {progressPercent}%
          </div>
        </div>

        {/* Category Groups */}
        <div className="flex items-center gap-1 overflow-x-auto scrollbar-hide pb-1">
          {groupedSteps.map((group, groupIndex) => {
            const config = CATEGORY_CONFIG[group.category as keyof typeof CATEGORY_CONFIG] || CATEGORY_CONFIG.being;
            const Icon = config.icon;
            const groupCompleted = group.steps.every(s => 
              isStepCompleted(s.id, todayLog) || skippedSteps.includes(s.id)
            );
            const groupCurrent = group.steps.some(s => s.index === currentStepIndex);
            const groupHasSkipped = group.steps.some(s => skippedSteps.includes(s.id));

            return (
              <div key={group.category + groupIndex} className="contents">
                <Tooltip>
                  <TooltipTrigger asChild>
                    <motion.div
                      className={cn(
                        "flex items-center gap-1 px-2 py-1 rounded-lg transition-all cursor-pointer",
                        config.bg,
                        groupCurrent && `border ${config.border} shadow-sm`,
                        groupCompleted && "opacity-70"
                      )}
                      whileHover={{ scale: 1.05 }}
                      onClick={() => onStepClick(group.steps[0].index)}
                    >
                      {/* Category Icon */}
                      <div className={cn(
                        "w-5 h-5 rounded-full flex items-center justify-center",
                        `bg-gradient-to-br ${config.color}`
                      )}>
                        {groupCompleted ? (
                          <Check className="w-3 h-3 text-white" />
                        ) : groupHasSkipped ? (
                          <SkipForward className="w-3 h-3 text-white" />
                        ) : (
                          <Icon className="w-3 h-3 text-white" />
                        )}
                      </div>

                      {/* Step dots */}
                      <div className="flex gap-0.5">
                        {group.steps.map((step) => {
                          const status = getStepStatus(step.id, step.index);
                          return (
                            <motion.div
                              key={step.id}
                              className={cn(
                                "w-1.5 h-1.5 rounded-full transition-all",
                                status === 'completed' && "bg-green-500",
                                status === 'current' && `bg-gradient-to-r ${config.color} animate-pulse`,
                                status === 'skipped' && "bg-red-400",
                                status === 'locked' && "bg-muted-foreground/30"
                              )}
                              initial={{ scale: 0 }}
                              animate={{ scale: 1 }}
                              transition={{ delay: step.index * 0.02 }}
                            />
                          );
                        })}
                      </div>
                    </motion.div>
                  </TooltipTrigger>
                  <TooltipContent side="bottom" className="max-w-xs">
                    <div className="space-y-1">
                      <p className={cn("font-semibold", `text-${group.category === 'emotional' ? 'amber' : group.category === 'being' ? 'purple' : group.category === 'body' ? 'red' : group.category === 'business' ? 'blue' : 'pink'}-500`)}>
                        {config.label}
                      </p>
                      <div className="text-xs space-y-0.5">
                        {group.steps.map(step => {
                          const status = getStepStatus(step.id, step.index);
                          return (
                            <div key={step.id} className="flex items-center gap-1">
                              {status === 'completed' && <Check className="w-3 h-3 text-green-500" />}
                              {status === 'current' && <motion.div className="w-2 h-2 rounded-full bg-primary" animate={{ scale: [1, 1.2, 1] }} transition={{ repeat: Infinity, duration: 1 }} />}
                              {status === 'skipped' && <SkipForward className="w-3 h-3 text-red-400" />}
                              {status === 'locked' && <div className="w-2 h-2 rounded-full bg-muted-foreground/30" />}
                              <span className={cn(
                                status === 'completed' && "text-green-500",
                                status === 'current' && "text-primary font-medium",
                                status === 'skipped' && "text-red-400 line-through"
                              )}>
                                {stepLabels[step.id]}
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </TooltipContent>
                </Tooltip>

                {/* Connector */}
                {groupIndex < groupedSteps.length - 1 && (
                  <div className={cn(
                    "w-3 h-0.5 flex-shrink-0",
                    groupCompleted ? "bg-green-500/50" : "bg-muted-foreground/20"
                  )} />
                )}
              </div>
            );
          })}
        </div>
      </div>
    </TooltipProvider>
  );
}
