import React from 'react';
import { Star, Zap, ChevronUp } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';
import { getLevelTitle, getLevelColor, getXPAtLevelStart, getXPForNextLevel } from '@/hooks/useRoutineXP';

interface XPDisplayProps {
  totalXP: number;
  currentLevel: number;
  className?: string;
  compact?: boolean;
}

export function XPDisplay({ totalXP, currentLevel, className, compact = false }: XPDisplayProps) {
  const xpAtLevelStart = getXPAtLevelStart(currentLevel);
  const xpForNextLevel = getXPForNextLevel(currentLevel);
  const xpInCurrentLevel = totalXP - xpAtLevelStart;
  const progress = (xpInCurrentLevel / xpForNextLevel) * 100;
  const levelTitle = getLevelTitle(currentLevel);
  const levelColor = getLevelColor(currentLevel);

  if (compact) {
    return (
      <div className={cn("flex items-center gap-2", className)}>
        <div className="flex items-center gap-1">
          <Star className={cn("h-4 w-4", levelColor)} />
          <span className={cn("text-sm font-bold", levelColor)}>Lvl {currentLevel}</span>
        </div>
        <div className="flex-1 max-w-[80px]">
          <Progress value={progress} className="h-1.5" />
        </div>
      </div>
    );
  }

  return (
    <div className={cn("space-y-2", className)}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className={cn("p-1.5 rounded-full", 
            currentLevel >= 100 ? "bg-amber-400/20" :
            currentLevel >= 51 ? "bg-purple-400/20" :
            currentLevel >= 26 ? "bg-blue-400/20" :
            currentLevel >= 11 ? "bg-green-400/20" : "bg-gray-400/20"
          )}>
            <Star className={cn("h-5 w-5", levelColor)} />
          </div>
          <div className="flex flex-col">
            <span className={cn("text-lg font-bold", levelColor)}>
              Level {currentLevel}
            </span>
            <span className="text-xs text-muted-foreground">{levelTitle}</span>
          </div>
        </div>
        <div className="text-right">
          <div className="flex items-center gap-1 text-amber-400">
            <Zap className="h-4 w-4" />
            <span className="font-bold tabular-nums">{totalXP.toLocaleString()}</span>
          </div>
          <span className="text-xs text-muted-foreground">XP Total</span>
        </div>
      </div>

      <div className="space-y-1">
        <Progress value={progress} className="h-2" />
        <div className="flex justify-between text-xs text-muted-foreground">
          <span>{xpInCurrentLevel} / {xpForNextLevel} XP</span>
          <span className="flex items-center gap-0.5">
            <ChevronUp className="h-3 w-3" />
            Level {currentLevel + 1}
          </span>
        </div>
      </div>
    </div>
  );
}

// XP Gain Animation Component
interface XPGainAnimationProps {
  amount: number;
  reason: string;
}

export function XPGainAnimation({ amount, reason }: XPGainAnimationProps) {
  return (
    <div className="fixed top-20 left-1/2 -translate-x-1/2 z-50 animate-in slide-in-from-bottom-4 fade-in duration-300">
      <div className="bg-amber-500/90 text-black px-4 py-2 rounded-full shadow-lg flex items-center gap-2">
        <Zap className="h-5 w-5" />
        <span className="font-bold">+{amount} XP</span>
        <span className="text-sm opacity-80">{reason}</span>
      </div>
    </div>
  );
}

// Level Up Modal Component
interface LevelUpModalProps {
  level: number;
  onDismiss: () => void;
}

export function LevelUpModal({ level, onDismiss }: LevelUpModalProps) {
  const levelTitle = getLevelTitle(level);
  const levelColor = getLevelColor(level);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm animate-in fade-in duration-300">
      <div className="bg-card border rounded-2xl p-8 max-w-sm mx-4 text-center animate-in zoom-in-95 duration-300">
        <div className="mb-4">
          <Star className={cn("h-16 w-16 mx-auto animate-bounce", levelColor)} />
        </div>
        <h2 className="text-2xl font-bold mb-2">Level Up! 🎉</h2>
        <p className="text-4xl font-bold mb-2" style={{ color: `var(--${levelColor.replace('text-', '')})` }}>
          Level {level}
        </p>
        <p className="text-muted-foreground mb-6">{levelTitle}</p>
        <button
          onClick={onDismiss}
          className="w-full py-3 rounded-lg bg-primary text-primary-foreground font-medium hover:bg-primary/90 transition-colors"
        >
          Continuă
        </button>
      </div>
    </div>
  );
}
