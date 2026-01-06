import React from 'react';
import { Zap, Star, Crown } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { useXPSystem, getLevelTitle, getLevelTitleColor, LEVEL_TITLES } from '@/hooks/useXPSystem';
import { useLanguage } from '@/context/LanguageContext';
import { cn } from '@/lib/utils';

interface XPProgressBarProps {
  compact?: boolean;
  showDetails?: boolean;
  className?: string;
}

export const XPProgressBar: React.FC<XPProgressBarProps> = ({
  compact = false,
  showDetails = true,
  className,
}) => {
  const { xpData, isLoading } = useXPSystem();
  const { language } = useLanguage();

  if (isLoading) {
    return (
      <div className={cn("animate-pulse bg-muted rounded-lg h-12", className)} />
    );
  }

  const levelTitle = getLevelTitle(xpData.currentLevel, language as 'en' | 'ro');
  const titleColor = getLevelTitleColor(xpData.currentLevel);
  const currentTier = LEVEL_TITLES.find(
    t => xpData.currentLevel >= t.minLevel && xpData.currentLevel <= t.maxLevel
  );
  const nextTier = LEVEL_TITLES.find(
    t => t.minLevel > xpData.currentLevel
  );

  if (compact) {
    return (
      <div className={cn("flex items-center gap-2", className)}>
        <div className="flex items-center gap-1 bg-gradient-to-r from-yellow-500/20 to-amber-500/20 px-2 py-1 rounded-full border border-yellow-500/30">
          <Star className="w-3 h-3 text-yellow-500 fill-yellow-500" />
          <span className="text-xs font-bold text-yellow-500">
            {xpData.currentLevel}
          </span>
        </div>
        <div className="flex-1 max-w-[100px]">
          <Progress 
            value={xpData.progressPercent} 
            className="h-2 bg-muted"
          />
        </div>
        <div className="flex items-center gap-0.5 text-xs text-muted-foreground">
          <Zap className="w-3 h-3 text-yellow-500" />
          <span>{xpData.totalXP.toLocaleString()}</span>
        </div>
      </div>
    );
  }

  return (
    <div className={cn(
      "bg-gradient-to-br from-yellow-500/10 via-amber-500/5 to-orange-500/10",
      "border border-yellow-500/20 rounded-xl p-4",
      className
    )}>
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-3">
          {/* Level Badge - Enhanced */}
          <div className="relative">
            <div className={cn(
              "w-14 h-14 rounded-full flex items-center justify-center shadow-lg",
              xpData.currentLevel >= 91 
                ? "bg-gradient-to-br from-yellow-400 via-pink-500 to-purple-600 shadow-purple-500/40"
                : xpData.currentLevel >= 71
                ? "bg-gradient-to-br from-cyan-400 to-blue-600 shadow-cyan-500/40"
                : xpData.currentLevel >= 51
                ? "bg-gradient-to-br from-red-400 to-orange-600 shadow-orange-500/40"
                : "bg-gradient-to-br from-yellow-400 to-amber-600 shadow-yellow-500/30"
            )}>
              <span className="text-xl font-black text-white">
                {xpData.currentLevel}
              </span>
            </div>
            <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-background border-2 border-yellow-500 flex items-center justify-center">
              {xpData.currentLevel >= 61 ? (
                <Crown className="w-3 h-3 text-yellow-500 fill-yellow-500" />
              ) : (
                <Star className="w-3 h-3 text-yellow-500 fill-yellow-500" />
              )}
            </div>
          </div>

          {/* Level Info */}
          <div>
            <h3 className="font-bold text-foreground flex items-center gap-2">
              {language === 'ro' ? 'Nivel' : 'Level'} {xpData.currentLevel}
              <span className="text-xs text-muted-foreground">/ 100</span>
            </h3>
            <p className={cn("text-sm font-semibold", titleColor)}>
              {levelTitle}
            </p>
            {nextTier && xpData.currentLevel < 100 && (
              <p className="text-[10px] text-muted-foreground">
                {language === 'ro' ? 'Urmează:' : 'Next:'} {nextTier.title[language as 'en' | 'ro']} (Lv.{nextTier.minLevel})
              </p>
            )}
          </div>
        </div>

        {/* Total XP */}
        <div className="text-right">
          <div className="flex items-center gap-1 justify-end">
            <Zap className="w-4 h-4 text-yellow-500" />
            <span className="font-bold text-foreground">{xpData.totalXP.toLocaleString()}</span>
          </div>
          <p className="text-xs text-muted-foreground">
            {language === 'ro' ? 'XP Total' : 'Total XP'}
          </p>
        </div>
      </div>

      {/* Progress Bar - Enhanced */}
      <div className="space-y-2">
        <div className="relative h-4 bg-muted rounded-full overflow-hidden">
          <div 
            className={cn(
              "absolute inset-y-0 left-0 rounded-full transition-all duration-500",
              xpData.currentLevel >= 91 
                ? "bg-gradient-to-r from-yellow-400 via-pink-500 to-purple-500"
                : xpData.currentLevel >= 71
                ? "bg-gradient-to-r from-cyan-400 to-blue-500"
                : xpData.currentLevel >= 51
                ? "bg-gradient-to-r from-red-400 to-orange-500"
                : "bg-gradient-to-r from-yellow-400 via-amber-500 to-orange-500"
            )}
            style={{ width: `${xpData.progressPercent}%` }}
          />
          {/* Glow effect */}
          <div 
            className="absolute inset-y-0 left-0 rounded-full blur-sm opacity-50"
            style={{ 
              width: `${xpData.progressPercent}%`,
              background: 'linear-gradient(90deg, transparent, white, transparent)'
            }}
          />
        </div>

        {showDetails && (
          <div className="flex justify-between text-xs text-muted-foreground">
            <span className="font-medium">
              {xpData.xpInCurrentLevel.toLocaleString()} / {xpData.xpToNextLevel.toLocaleString()} XP
            </span>
            {xpData.currentLevel < 100 && (
              <span>
                {language === 'ro' ? 'Până la nivelul' : 'To level'} {xpData.currentLevel + 1}
              </span>
            )}
            {xpData.currentLevel >= 100 && (
              <span className="text-yellow-500 font-bold">
                {language === 'ro' ? '🎉 NIVEL MAXIM!' : '🎉 MAX LEVEL!'}
              </span>
            )}
          </div>
        )}
      </div>

      {/* Tier Progress */}
      {currentTier && showDetails && (
        <div className="mt-3 pt-3 border-t border-border/30">
          <div className="flex items-center justify-between text-xs">
            <span className="text-muted-foreground">
              {language === 'ro' ? 'Rang' : 'Rank'}: <span className={cn("font-semibold", titleColor)}>{levelTitle}</span>
            </span>
            <span className="text-muted-foreground">
              Lv.{currentTier.minLevel} - Lv.{currentTier.maxLevel}
            </span>
          </div>
        </div>
      )}
    </div>
  );
};
