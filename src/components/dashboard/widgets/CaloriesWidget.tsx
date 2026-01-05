import React from 'react';
import { Flame } from 'lucide-react';
import { WidgetContainer } from './WidgetContainer';
import { WidgetSize } from '@/types/dashboardWidget';
import { useLanguage } from '@/context/LanguageContext';

interface CaloriesWidgetProps {
  size: WidgetSize;
  onRemove: () => void;
  onResize: (size: WidgetSize) => void;
  dragHandleProps?: any;
}

export const CaloriesWidget: React.FC<CaloriesWidgetProps> = ({
  size,
  onRemove,
  onResize,
  dragHandleProps
}) => {
  const { language } = useLanguage();

  const calories = {
    consumed: 1850,
    target: 2200,
    burned: 350
  };

  const remaining = calories.target - calories.consumed + calories.burned;
  const percentage = Math.min((calories.consumed / calories.target) * 100, 100);

  return (
    <WidgetContainer
      title={language === 'ro' ? 'Calorii' : 'Calories'}
      icon={<Flame className="h-4 w-4 text-orange-500" />}
      size={size}
      onRemove={onRemove}
      onResize={onResize}
      dragHandleProps={dragHandleProps}
    >
      <div className="flex flex-col items-center justify-center py-2">
        <div className="relative w-20 h-20">
          <svg className="w-full h-full transform -rotate-90">
            <circle
              cx="40"
              cy="40"
              r="35"
              stroke="currentColor"
              strokeWidth="6"
              fill="none"
              className="text-muted"
            />
            <circle
              cx="40"
              cy="40"
              r="35"
              stroke="currentColor"
              strokeWidth="6"
              fill="none"
              strokeDasharray={`${percentage * 2.2} 220`}
              className="text-orange-500"
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-lg font-bold">{remaining}</span>
            <span className="text-[10px] text-muted-foreground">
              {language === 'ro' ? 'rămase' : 'left'}
            </span>
          </div>
        </div>
        <div className="flex gap-4 mt-2 text-xs text-muted-foreground">
          <span>{calories.consumed} {language === 'ro' ? 'consumate' : 'eaten'}</span>
          <span>{calories.burned} {language === 'ro' ? 'arse' : 'burned'}</span>
        </div>
      </div>
    </WidgetContainer>
  );
};
