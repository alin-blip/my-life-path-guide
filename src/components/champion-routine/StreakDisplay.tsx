import React from 'react';
import { Flame, Trophy, TrendingUp } from 'lucide-react';
import { cn } from '@/lib/utils';

interface StreakDisplayProps {
  currentStreak: number;
  bestStreak: number;
  className?: string;
  compact?: boolean;
}

export function StreakDisplay({ currentStreak, bestStreak, className, compact = false }: StreakDisplayProps) {
  const isOnFire = currentStreak >= 7;
  const isLegendary = currentStreak >= 30;

  if (compact) {
    return (
      <div className={cn("flex items-center gap-1.5", className)}>
        <Flame 
          className={cn(
            "h-5 w-5 transition-all",
            currentStreak === 0 && "text-muted-foreground",
            currentStreak > 0 && currentStreak < 7 && "text-orange-400",
            isOnFire && !isLegendary && "text-orange-500 animate-pulse",
            isLegendary && "text-amber-400 animate-pulse drop-shadow-[0_0_10px_rgba(251,191,36,0.5)]"
          )} 
        />
        <span className={cn(
          "font-bold tabular-nums",
          currentStreak === 0 && "text-muted-foreground",
          currentStreak > 0 && "text-orange-400",
          isLegendary && "text-amber-400"
        )}>
          {currentStreak}
        </span>
      </div>
    );
  }

  return (
    <div className={cn("flex items-center gap-4", className)}>
      {/* Current Streak */}
      <div className="flex items-center gap-2">
        <div className={cn(
          "relative p-2 rounded-full transition-all",
          currentStreak === 0 && "bg-muted",
          currentStreak > 0 && "bg-orange-500/20",
          isLegendary && "bg-amber-400/20"
        )}>
          <Flame 
            className={cn(
              "h-6 w-6 transition-all",
              currentStreak === 0 && "text-muted-foreground",
              currentStreak > 0 && currentStreak < 7 && "text-orange-400",
              isOnFire && !isLegendary && "text-orange-500 animate-pulse",
              isLegendary && "text-amber-400 animate-pulse"
            )} 
          />
          {isOnFire && (
            <span className="absolute -top-1 -right-1 flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-orange-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-orange-500"></span>
            </span>
          )}
        </div>
        <div className="flex flex-col">
          <span className="text-xs text-muted-foreground">Streak</span>
          <span className={cn(
            "text-lg font-bold tabular-nums",
            currentStreak === 0 && "text-muted-foreground",
            currentStreak > 0 && "text-orange-400",
            isLegendary && "text-amber-400"
          )}>
            {currentStreak} {currentStreak === 1 ? 'zi' : 'zile'}
          </span>
        </div>
      </div>

      {/* Best Streak */}
      <div className="flex items-center gap-2">
        <div className="p-2 rounded-full bg-amber-500/20">
          <Trophy className="h-5 w-5 text-amber-400" />
        </div>
        <div className="flex flex-col">
          <span className="text-xs text-muted-foreground">Record</span>
          <span className="text-sm font-medium text-amber-400 tabular-nums">
            {bestStreak} zile
          </span>
        </div>
      </div>

      {/* Streak Multiplier */}
      {currentStreak > 0 && (
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-full bg-green-500/20">
            <TrendingUp className="h-5 w-5 text-green-400" />
          </div>
          <div className="flex flex-col">
            <span className="text-xs text-muted-foreground">Bonus XP</span>
            <span className="text-sm font-medium text-green-400">
              +{Math.min(currentStreak * 10, 100)}%
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
