import React from 'react';
import { Zap, TrendingUp } from 'lucide-react';
import { WidgetContainer } from './WidgetContainer';
import { WidgetSize } from '@/types/dashboardWidget';
import { useLanguage } from '@/context/LanguageContext';

interface StreakWidgetProps {
  size: WidgetSize;
  onRemove: () => void;
  onResize: (size: WidgetSize) => void;
  dragHandleProps?: any;
  currentStreak?: number;
  longestStreak?: number;
}

export const StreakWidget: React.FC<StreakWidgetProps> = ({
  size,
  onRemove,
  onResize,
  dragHandleProps,
  currentStreak = 7,
  longestStreak = 14
}) => {
  const { language } = useLanguage();

  return (
    <WidgetContainer
      title={language === 'ro' ? 'Serie' : 'Streak'}
      icon={<Zap className="h-4 w-4 text-yellow-500" />}
      size={size}
      onRemove={onRemove}
      onResize={onResize}
      dragHandleProps={dragHandleProps}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center w-12 h-12 rounded-full bg-yellow-500/20">
            <span className="text-xl font-bold text-yellow-500">{currentStreak}</span>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">
              {language === 'ro' ? 'zile consecutive' : 'day streak'}
            </p>
            <div className="flex items-center gap-1 text-xs text-muted-foreground mt-1">
              <TrendingUp className="h-3 w-3" />
              <span>{language === 'ro' ? 'Record' : 'Best'}: {longestStreak}</span>
            </div>
          </div>
        </div>
      </div>
    </WidgetContainer>
  );
};
