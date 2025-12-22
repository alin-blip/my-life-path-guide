import React from 'react';
import { Flame, Trophy, Target } from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface WeeklyProgressRingProps {
  totalTasks: number;
  completedTasks: number;
  focusKeyPoints: number;
  completedKeyPoints: number;
  streak?: number;
}

export const WeeklyProgressRing: React.FC<WeeklyProgressRingProps> = ({
  totalTasks,
  completedTasks,
  focusKeyPoints,
  completedKeyPoints,
  streak = 0
}) => {
  const { language } = useLanguage();
  
  const tasksProgress = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
  const focusProgress = focusKeyPoints > 0 ? Math.round((completedKeyPoints / focusKeyPoints) * 100) : 0;
  
  // Calculate the circumference and offset for the progress ring
  const radius = 28;
  const circumference = 2 * Math.PI * radius;
  const tasksOffset = circumference - (tasksProgress / 100) * circumference;
  const focusOffset = circumference - (focusProgress / 100) * circumference;

  return (
    <TooltipProvider>
      <div className="flex items-center gap-2">
        {/* Compact Progress Ring */}
        <Tooltip>
          <TooltipTrigger asChild>
            <div className="relative w-10 h-10 cursor-pointer">
              <svg className="w-full h-full transform -rotate-90">
                <circle
                  cx="20"
                  cy="20"
                  r="16"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="3"
                  className="text-muted/30"
                />
                <circle
                  cx="20"
                  cy="20"
                  r="16"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="3"
                  strokeDasharray={100}
                  strokeDashoffset={100 - tasksProgress}
                  strokeLinecap="round"
                  className="text-primary transition-all duration-500"
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-[10px] font-bold text-foreground">{tasksProgress}%</span>
              </div>
            </div>
          </TooltipTrigger>
          <TooltipContent side="bottom" className="text-xs">
            <p>Sarcini: {completedTasks}/{totalTasks}</p>
            <p>Focus: {completedKeyPoints}/{focusKeyPoints}</p>
          </TooltipContent>
        </Tooltip>
        
        {/* Streak Badge - Compact */}
        {streak > 0 && (
          <div className="flex items-center gap-1 px-1.5 py-0.5 rounded bg-orange-500/10 text-orange-500 text-[10px] font-bold">
            <Flame className="w-3 h-3" />
            {streak}
          </div>
        )}
      </div>
    </TooltipProvider>
  );
};
