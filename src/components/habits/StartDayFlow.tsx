import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { ChevronDown, ChevronUp, Play, Check, Sun } from 'lucide-react';
import { useDailyFlow } from '@/hooks/useDailyFlow';
import { cn } from '@/lib/utils';

const FLOW_STEPS = [
  { id: 'morning', name: 'Morning Routine', icon: '🌅' },
  { id: 'fitness', name: 'Fitness', icon: '💪' },
  { id: 'relationships', name: 'Relationships', icon: '❤️' },
  { id: 'business', name: 'Business', icon: '💼' },
  { id: 'todo', name: 'To Do', icon: '📝' },
  { id: 'focus', name: 'Focus', icon: '🎯' },
];

export const StartDayFlow: React.FC = () => {
  const [isExpanded, setIsExpanded] = useState(false);
  const { session, isLoading, startDay, completeStep, isStepCompleted, completedCount } = useDailyFlow();

  const totalSteps = FLOW_STEPS.length;
  const progress = session ? (completedCount / totalSteps) * 100 : 0;
  const isCompleted = session?.completed_at !== null;
  const hasStarted = session !== null;

  const handleStartDay = async () => {
    await startDay();
    setIsExpanded(true);
  };

  const handleStepClick = async (stepId: string) => {
    if (!isStepCompleted(stepId)) {
      await completeStep(stepId);
    }
  };

  if (isLoading) {
    return (
      <Card className="bg-gradient-to-br from-amber-500/10 to-orange-500/10 border-amber-500/30">
        <CardContent className="p-4">
          <div className="h-16 animate-pulse bg-muted/50 rounded-lg" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={cn(
      "border transition-all duration-300",
      isCompleted
        ? "bg-gradient-to-br from-green-500/10 to-emerald-500/10 border-green-500/30"
        : "bg-gradient-to-br from-amber-500/10 to-orange-500/10 border-amber-500/30"
    )}>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sun className={cn(
              "h-5 w-5",
              isCompleted ? "text-green-400" : "text-amber-400"
            )} />
            <CardTitle className="text-base">
              {isCompleted ? 'Ziua Completată! 🎉' : 'Start Your Day'}
            </CardTitle>
            {hasStarted && !isCompleted && (
              <span className="text-xs text-muted-foreground">
                {completedCount}/{totalSteps}
              </span>
            )}
          </div>
          
          {hasStarted && (
            <Button
              variant="ghost"
              size="sm"
              className="h-8 w-8 p-0"
              onClick={() => setIsExpanded(!isExpanded)}
            >
              {isExpanded ? (
                <ChevronUp className="h-4 w-4" />
              ) : (
                <ChevronDown className="h-4 w-4" />
              )}
            </Button>
          )}
        </div>
        
        {hasStarted && (
          <Progress 
            value={progress} 
            className={cn(
              "h-2 mt-2",
              isCompleted ? "[&>div]:bg-green-500" : "[&>div]:bg-amber-500"
            )}
          />
        )}
      </CardHeader>

      <CardContent className="pt-0">
        {!hasStarted ? (
          <Button
            onClick={handleStartDay}
            className="w-full bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600"
          >
            <Play className="h-4 w-4 mr-2" />
            Începe Ziua
          </Button>
        ) : isExpanded ? (
          <div className="grid grid-cols-3 gap-2 mt-2">
            {FLOW_STEPS.map((step) => {
              const completed = isStepCompleted(step.id);
              return (
                <button
                  key={step.id}
                  onClick={() => handleStepClick(step.id)}
                  className={cn(
                    "relative flex flex-col items-center justify-center p-3 rounded-lg transition-all",
                    "border-2",
                    completed
                      ? "bg-green-500/20 border-green-500/50"
                      : "bg-muted/50 border-transparent hover:border-amber-500/50"
                  )}
                >
                  {completed && (
                    <div className="absolute -top-1 -right-1 bg-green-500 rounded-full p-0.5">
                      <Check className="h-3 w-3 text-white" />
                    </div>
                  )}
                  <span className="text-xl mb-1">{step.icon}</span>
                  <span className="text-xs text-center line-clamp-1">{step.name}</span>
                </button>
              );
            })}
          </div>
        ) : (
          <div className="flex gap-1 mt-2">
            {FLOW_STEPS.map((step) => (
              <div
                key={step.id}
                className={cn(
                  "h-2 flex-1 rounded-full",
                  isStepCompleted(step.id)
                    ? "bg-green-500"
                    : "bg-muted"
                )}
              />
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
