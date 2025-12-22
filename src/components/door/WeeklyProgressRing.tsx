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
      <div className="flex items-center gap-4">
        {/* Main Progress Ring */}
        <Tooltip>
          <TooltipTrigger asChild>
            <div className="relative w-16 h-16 cursor-pointer group">
              <svg className="w-full h-full transform -rotate-90">
                {/* Background circle */}
                <circle
                  cx="32"
                  cy="32"
                  r={radius}
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="4"
                  className="text-muted/30"
                />
                {/* Focus progress (outer) */}
                <circle
                  cx="32"
                  cy="32"
                  r={radius}
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="4"
                  strokeDasharray={circumference}
                  strokeDashoffset={focusOffset}
                  strokeLinecap="round"
                  className="text-accent transition-all duration-700 ease-out"
                />
                {/* Tasks progress (inner) */}
                <circle
                  cx="32"
                  cy="32"
                  r={radius - 8}
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="3"
                  strokeDasharray={circumference * 0.7}
                  strokeDashoffset={(circumference * 0.7) - (tasksProgress / 100) * (circumference * 0.7)}
                  strokeLinecap="round"
                  className="text-primary transition-all duration-700 ease-out"
                />
              </svg>
              
              {/* Center Icon/Percentage */}
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-xs font-bold text-foreground group-hover:scale-110 transition-transform">
                  {Math.round((tasksProgress + focusProgress) / 2)}%
                </span>
              </div>
            </div>
          </TooltipTrigger>
          <TooltipContent side="bottom" className="bg-popover border-border">
            <div className="space-y-1 text-xs">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-accent" />
                <span>Focus: {focusProgress}% ({completedKeyPoints}/{focusKeyPoints})</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-primary" />
                <span>Sarcini: {tasksProgress}% ({completedTasks}/{totalTasks})</span>
              </div>
            </div>
          </TooltipContent>
        </Tooltip>
        
        {/* Quick Stats Badges */}
        <div className="flex flex-col gap-1">
          {/* Streak Badge */}
          {streak > 0 && (
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="flex items-center gap-1.5 px-2 py-1 rounded-full bg-orange-500/10 text-orange-500 text-xs font-medium cursor-pointer hover:bg-orange-500/20 transition-colors">
                  <Flame className="w-3 h-3" />
                  <span>{streak}</span>
                </div>
              </TooltipTrigger>
              <TooltipContent side="bottom">
                {language === 'en' ? `${streak} day streak!` : `${streak} zile consecutive!`}
              </TooltipContent>
            </Tooltip>
          )}
          
          {/* Completed Today Badge */}
          <Tooltip>
            <TooltipTrigger asChild>
              <div className="flex items-center gap-1.5 px-2 py-1 rounded-full bg-primary/10 text-primary text-xs font-medium cursor-pointer hover:bg-primary/20 transition-colors">
                <Target className="w-3 h-3" />
                <span>{completedTasks}/{totalTasks}</span>
              </div>
            </TooltipTrigger>
            <TooltipContent side="bottom">
              {language === 'en' ? 'Tasks completed this week' : 'Sarcini completate săptămâna aceasta'}
            </TooltipContent>
          </Tooltip>
        </div>
      </div>
    </TooltipProvider>
  );
};
