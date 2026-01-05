import React from 'react';
import { PieChart } from 'lucide-react';
import { WidgetContainer } from './WidgetContainer';
import { WidgetSize } from '@/types/dashboardWidget';
import { useLanguage } from '@/context/LanguageContext';
import { Progress } from '@/components/ui/progress';

interface MacroWidgetProps {
  size: WidgetSize;
  onRemove: () => void;
  onResize: (size: WidgetSize) => void;
  dragHandleProps?: any;
}

export const MacroWidget: React.FC<MacroWidgetProps> = ({
  size,
  onRemove,
  onResize,
  dragHandleProps
}) => {
  const { language } = useLanguage();

  // Default values - in a real app, these would come from user settings/tracking
  const macros = {
    protein: { current: 120, target: 150, color: 'bg-blue-500' },
    carbs: { current: 180, target: 250, color: 'bg-yellow-500' },
    fats: { current: 55, target: 70, color: 'bg-red-500' }
  };

  const labels = {
    protein: { en: 'Protein', ro: 'Proteine' },
    carbs: { en: 'Carbs', ro: 'Carbohidrați' },
    fats: { en: 'Fats', ro: 'Grăsimi' }
  };

  return (
    <WidgetContainer
      title={language === 'ro' ? 'Macronutrienți' : 'Macronutrients'}
      icon={<PieChart className="h-4 w-4 text-green-500" />}
      size={size}
      onRemove={onRemove}
      onResize={onResize}
      dragHandleProps={dragHandleProps}
    >
      <div className="space-y-3">
        {Object.entries(macros).map(([key, value]) => (
          <div key={key} className="space-y-1">
            <div className="flex justify-between text-xs">
              <span className="text-muted-foreground">
                {labels[key as keyof typeof labels][language]}
              </span>
              <span className="font-medium">
                {value.current}g / {value.target}g
              </span>
            </div>
            <Progress 
              value={(value.current / value.target) * 100} 
              className="h-2"
            />
          </div>
        ))}
      </div>
    </WidgetContainer>
  );
};
