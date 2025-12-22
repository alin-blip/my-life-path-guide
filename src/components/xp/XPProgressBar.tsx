import React from 'react';
import { Zap, Star } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { useXPSystem, getLevelTitle } from '@/hooks/useXPSystem';
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

  const levelTitle = getLevelTitle(xpData.currentLevel);

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
          <span>{xpData.totalXP}</span>
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
          {/* Level Badge */}
          <div className="relative">
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-yellow-400 to-amber-600 flex items-center justify-center shadow-lg shadow-yellow-500/30">
              <span className="text-lg font-black text-white">
                {xpData.currentLevel}
              </span>
            </div>
            <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-background border-2 border-yellow-500 flex items-center justify-center">
              <Star className="w-3 h-3 text-yellow-500 fill-yellow-500" />
            </div>
          </div>

          {/* Level Info */}
          <div>
            <h3 className="font-bold text-foreground">
              {language === 'ro' ? 'Nivel' : 'Level'} {xpData.currentLevel}
            </h3>
            <p className="text-sm text-muted-foreground">{levelTitle}</p>
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

      {/* Progress Bar */}
      <div className="space-y-2">
        <div className="relative">
          <Progress 
            value={xpData.progressPercent} 
            className="h-3 bg-muted"
          />
          <div 
            className="absolute inset-0 bg-gradient-to-r from-yellow-400 via-amber-500 to-orange-500 rounded-full transition-all duration-500"
            style={{ 
              width: `${xpData.progressPercent}%`,
              opacity: 0.9,
            }}
          />
        </div>

        {showDetails && (
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>
              {xpData.xpInCurrentLevel} / {xpData.xpToNextLevel} XP
            </span>
            <span>
              {language === 'ro' ? 'Până la nivelul' : 'To level'} {xpData.currentLevel + 1}
            </span>
          </div>
        )}
      </div>
    </div>
  );
};
