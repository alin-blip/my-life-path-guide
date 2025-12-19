import React from 'react';
import { Badge as BadgeType, TIER_BG, TIER_COLORS } from './badgeDefinitions';
import { Progress } from '@/components/ui/progress';
import { useLanguage } from '@/context/LanguageContext';
import { cn } from '@/lib/utils';
import { 
  BookOpen, Flame, Trophy, Star, Award, Target, Zap, Crown, 
  Medal, Sparkles, Heart, Rocket, Shield, Brain, Eye, Lock 
} from 'lucide-react';

const IconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  BookOpen, Flame, Trophy, Star, Award, Target, Zap, Crown,
  Medal, Sparkles, Heart, Rocket, Shield, Brain, Eye
};

interface BadgeCardProps {
  badge: BadgeType;
  isEarned: boolean;
  progress: { current: number; target: number };
}

export const BadgeCard: React.FC<BadgeCardProps> = ({ badge, isEarned, progress }) => {
  const { language } = useLanguage();
  const Icon = IconMap[badge.icon] || Star;
  const percentage = Math.round((progress.current / progress.target) * 100);
  
  return (
    <div
      className={cn(
        "relative p-4 rounded-xl border transition-all duration-300",
        isEarned 
          ? `${TIER_BG[badge.tier]} border-primary/30 shadow-lg` 
          : "bg-muted/30 border-border/50 opacity-70"
      )}
    >
      {/* Tier Badge */}
      <div className={cn(
        "absolute -top-2 -right-2 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wide text-white",
        `bg-gradient-to-r ${TIER_COLORS[badge.tier]}`
      )}>
        {badge.tier}
      </div>
      
      {/* Icon */}
      <div className="flex items-center gap-3 mb-3">
        <div className={cn(
          "w-12 h-12 rounded-full flex items-center justify-center",
          isEarned 
            ? `bg-gradient-to-br ${TIER_COLORS[badge.tier]}` 
            : "bg-muted"
        )}>
          {isEarned ? (
            <Icon className="h-6 w-6 text-white" />
          ) : (
            <Lock className="h-5 w-5 text-muted-foreground" />
          )}
        </div>
        <div className="flex-1 min-w-0">
          <h4 className={cn(
            "font-semibold text-sm truncate",
            isEarned ? "text-foreground" : "text-muted-foreground"
          )}>
            {badge.name[language]}
          </h4>
          <p className="text-xs text-muted-foreground line-clamp-1">
            {badge.description[language]}
          </p>
        </div>
      </div>
      
      {/* Progress */}
      <div className="space-y-1">
        <div className="flex justify-between text-xs">
          <span className="text-muted-foreground">
            {progress.current}/{progress.target}
          </span>
          <span className={cn(
            "font-medium",
            isEarned ? "text-primary" : "text-muted-foreground"
          )}>
            {percentage}%
          </span>
        </div>
        <Progress 
          value={percentage} 
          className={cn("h-1.5", isEarned && "bg-primary/20")} 
        />
      </div>
      
      {/* Earned Indicator */}
      {isEarned && (
        <div className="absolute -bottom-1 left-1/2 -translate-x-1/2">
          <Trophy className="h-4 w-4 text-amber-500 drop-shadow-lg" />
        </div>
      )}
    </div>
  );
};

export default BadgeCard;
