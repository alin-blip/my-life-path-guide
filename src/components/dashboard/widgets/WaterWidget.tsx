import React, { useState } from 'react';
import { Droplets, Plus, Minus } from 'lucide-react';
import { WidgetContainer } from './WidgetContainer';
import { WidgetSize } from '@/types/dashboardWidget';
import { useLanguage } from '@/context/LanguageContext';
import { Button } from '@/components/ui/button';

interface WaterWidgetProps {
  size: WidgetSize;
  onRemove: () => void;
  onResize: (size: WidgetSize) => void;
  dragHandleProps?: any;
}

export const WaterWidget: React.FC<WaterWidgetProps> = ({
  size,
  onRemove,
  onResize,
  dragHandleProps
}) => {
  const { language } = useLanguage();
  const [glasses, setGlasses] = useState(4);
  const target = 8;

  const percentage = Math.min((glasses / target) * 100, 100);

  const increment = () => setGlasses(prev => Math.min(prev + 1, 12));
  const decrement = () => setGlasses(prev => Math.max(prev - 1, 0));

  return (
    <WidgetContainer
      title={language === 'ro' ? 'Apă' : 'Water'}
      icon={<Droplets className="h-4 w-4 text-cyan-500" />}
      size={size}
      onRemove={onRemove}
      onResize={onResize}
      dragHandleProps={dragHandleProps}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Button 
            size="icon" 
            variant="outline" 
            className="h-7 w-7"
            onClick={decrement}
          >
            <Minus className="h-3 w-3" />
          </Button>
          
          <div className="relative w-12 h-12">
            <svg className="w-full h-full transform -rotate-90">
              <circle
                cx="24"
                cy="24"
                r="20"
                stroke="currentColor"
                strokeWidth="4"
                fill="none"
                className="text-muted"
              />
              <circle
                cx="24"
                cy="24"
                r="20"
                stroke="currentColor"
                strokeWidth="4"
                fill="none"
                strokeDasharray={`${percentage * 1.26} 126`}
                className="text-cyan-500"
              />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <Droplets className="h-4 w-4 text-cyan-500" />
            </div>
          </div>

          <Button 
            size="icon" 
            variant="outline" 
            className="h-7 w-7"
            onClick={increment}
          >
            <Plus className="h-3 w-3" />
          </Button>
        </div>

        <div className="text-right">
          <p className="text-lg font-bold">{glasses}/{target}</p>
          <p className="text-xs text-muted-foreground">
            {language === 'ro' ? 'pahare' : 'glasses'}
          </p>
        </div>
      </div>
    </WidgetContainer>
  );
};
