import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';
import { useLanguage } from '@/context/LanguageContext';
import { useChallengeProgress } from '@/hooks/useChallengeProgress';
import { 
  Flame, Dumbbell, Target, Sparkles, Brain, Trophy,
  CheckCircle2, Lock, Play 
} from 'lucide-react';

interface ChallengeSidebarProps {
  currentDay?: number;
}

const challengeDaysMeta = [
  { day: 1, titleEn: 'Vision + Declaration', titleRo: 'Viziune + Declarație', icon: Flame, color: 'from-purple-500 to-indigo-500' },
  { day: 2, titleEn: 'Body + Spirit + Relationships', titleRo: 'Corp + Spirit + Relații', icon: Dumbbell, color: 'from-green-500 to-purple-500' },
  { day: 3, titleEn: 'Business + Domino Door', titleRo: 'Business + Domino Door', icon: Target, color: 'from-blue-500 to-amber-500' },
  { day: 4, titleEn: 'Warrior Routine + Vision AI', titleRo: 'Warrior Routine + Vision AI', icon: Sparkles, color: 'from-cyan-500 to-purple-500' },
  { day: 5, titleEn: 'Accountability + Mind Coach', titleRo: 'Accountability + Mind Coach', icon: Brain, color: 'from-red-500 to-pink-500' },
  { day: 6, titleEn: 'Idea List (Strategic Filter)', titleRo: 'Idea List (Filtru Strategic)', icon: Target, color: 'from-amber-500 to-yellow-500' },
  { day: 7, titleEn: 'Membership + Continuity', titleRo: 'Membership + Continuitate', icon: Trophy, color: 'from-amber-500 to-yellow-600' },
];

export const ChallengeSidebar: React.FC<ChallengeSidebarProps> = ({ currentDay }) => {
  const navigate = useNavigate();
  const { language } = useLanguage();
  const isRo = language === 'ro';
  const { 
    completedDaysCount, 
    isDayUnlocked, 
    isDayCompleted,
    loading 
  } = useChallengeProgress();

  const progressPercentage = (completedDaysCount / 7) * 100;

  const handleDayClick = (day: number) => {
    if (isDayUnlocked(day)) {
      navigate(`/challenge/${day}`);
    }
  };

  return (
    <div className="flex flex-col h-full">
      {/* Header with progress */}
      <div className="p-4 border-b border-border/60">
        <div className="flex items-center gap-3 mb-3">
          <div className="p-2 rounded-lg bg-gradient-to-br from-amber-500 to-orange-600">
            <Flame className="h-5 w-5 text-white" />
          </div>
          <div className="flex-1 min-w-0">
            <h2 className="font-bold text-sm truncate">
              Have It All Challenge
            </h2>
            <p className="text-xs text-muted-foreground">
              {completedDaysCount}/7 {isRo ? 'zile' : 'days'}
            </p>
          </div>
        </div>
        <Progress value={progressPercentage} className="h-2" />
        <p className="text-xs text-muted-foreground mt-1 text-right">
          {Math.round(progressPercentage)}%
        </p>
      </div>

      {/* Days list */}
      <div className="flex-1 overflow-y-auto">
        {/* Overview link */}
        <button
          onClick={() => navigate('/challenge')}
          className={cn(
            'w-full flex items-center gap-3 px-4 py-3 text-left transition-all text-sm border-b border-border/30',
            !currentDay
              ? 'bg-primary/10 border-l-2 border-l-primary'
              : 'hover:bg-muted/50 border-l-2 border-l-transparent'
          )}
        >
          <div className={cn(
            'flex items-center justify-center w-7 h-7 rounded-full text-xs',
            !currentDay ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'
          )}>
            📋
          </div>
          <span className={cn(
            'font-medium',
            !currentDay ? 'text-primary' : 'text-muted-foreground'
          )}>
            {isRo ? 'Prezentare Generală' : 'Overview'}
          </span>
        </button>

        {/* Individual days */}
        {challengeDaysMeta.map((dayMeta) => {
          const Icon = dayMeta.icon;
          const unlocked = isDayUnlocked(dayMeta.day);
          const completed = isDayCompleted(dayMeta.day);
          const isActive = currentDay === dayMeta.day;

          return (
            <button
              key={dayMeta.day}
              onClick={() => handleDayClick(dayMeta.day)}
              disabled={!unlocked}
              className={cn(
                'w-full flex items-center gap-3 px-4 py-3 text-left transition-all text-sm',
                isActive
                  ? 'bg-primary/10 border-l-2 border-l-primary'
                  : 'hover:bg-muted/50 border-l-2 border-l-transparent',
                !unlocked && 'opacity-50 cursor-not-allowed'
              )}
            >
              {/* Status icon */}
              <div className={cn(
                'flex items-center justify-center w-7 h-7 rounded-full text-xs shrink-0',
                completed
                  ? 'bg-emerald-500 text-white'
                  : !unlocked
                    ? 'bg-muted-foreground/20 text-muted-foreground'
                    : isActive
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-muted text-muted-foreground'
              )}>
                {completed ? (
                  <CheckCircle2 className="h-4 w-4" />
                ) : !unlocked ? (
                  <Lock className="h-3 w-3" />
                ) : (
                  <Play className="h-3 w-3" />
                )}
              </div>

              {/* Day info */}
              <div className="flex-1 min-w-0">
                <p className={cn(
                  'text-xs font-medium truncate',
                  completed && 'text-emerald-500',
                  isActive && !completed && 'text-primary',
                  !unlocked && 'text-muted-foreground'
                )}>
                  {isRo ? `Ziua ${dayMeta.day}` : `Day ${dayMeta.day}`}
                </p>
                <p className="text-[11px] text-muted-foreground truncate">
                  {isRo ? dayMeta.titleRo : dayMeta.titleEn}
                </p>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};
