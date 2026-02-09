import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '@/context/LanguageContext';
import { personalPowerDays, totalDays, implementedDays } from '@/data/personalPowerContent';
import { cn } from '@/lib/utils';
import { Check, Lock, ChevronLeft } from 'lucide-react';

interface PersonalPowerSidebarProps {
  currentDay: number;
  completedDays: number[];
}

export const PersonalPowerSidebar: React.FC<PersonalPowerSidebarProps> = ({
  currentDay,
  completedDays,
}) => {
  const navigate = useNavigate();
  const { language } = useLanguage();

  return (
    <div className="w-64 shrink-0 hidden lg:block">
      <div className="sticky top-4 space-y-3">
        <button
          onClick={() => navigate('/personal-power')}
          className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mb-3"
        >
          <ChevronLeft className="h-4 w-4" />
          {language === 'ro' ? 'Înapoi la curs' : 'Back to course'}
        </button>

        <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider px-2">
          {language === 'ro' ? 'Zile' : 'Days'}
        </h3>

        <div className="space-y-1 max-h-[70vh] overflow-y-auto pr-1">
          {Array.from({ length: totalDays }, (_, i) => {
            const dayNum = i + 1;
            const dayData = personalPowerDays.find(d => d.day === dayNum);
            const isImplemented = dayNum <= implementedDays;
            const isCompleted = completedDays.includes(dayNum);
            const isCurrent = dayNum === currentDay;

            return (
              <button
                key={dayNum}
                onClick={() => isImplemented && navigate(`/personal-power/${dayNum}`)}
                disabled={!isImplemented}
                className={cn(
                  'w-full flex items-center gap-2 px-3 py-2 rounded-lg text-left text-sm transition-colors',
                  isCurrent && 'bg-primary text-primary-foreground font-semibold',
                  !isCurrent && isImplemented && 'hover:bg-muted text-foreground',
                  !isImplemented && 'text-muted-foreground/50 cursor-not-allowed',
                  isCompleted && !isCurrent && 'text-green-600 dark:text-green-400'
                )}
              >
                {isCompleted ? (
                  <Check className="h-4 w-4 shrink-0" />
                ) : !isImplemented ? (
                  <Lock className="h-3.5 w-3.5 shrink-0" />
                ) : (
                  <span className="w-4 text-center shrink-0 text-xs font-medium">{dayNum}</span>
                )}
                <span className="truncate">
                  {dayData
                    ? (language === 'ro' ? dayData.title : dayData.titleEn)
                    : `${language === 'ro' ? 'Ziua' : 'Day'} ${dayNum}`}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
