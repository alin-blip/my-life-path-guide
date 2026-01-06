import React, { useState } from 'react';
import { Flame, Droplets, PieChart, Plus, Minus } from 'lucide-react';
import { WidgetContainer } from './WidgetContainer';
import { WidgetSize } from '@/types/dashboardWidget';
import { useLanguage } from '@/context/LanguageContext';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { useNutritionSettings } from '@/hooks/useNutritionSettings';

interface NutritionHubWidgetProps {
  size: WidgetSize;
  onRemove: () => void;
  onResize: (size: WidgetSize) => void;
  dragHandleProps?: any;
}

export const NutritionHubWidget: React.FC<NutritionHubWidgetProps> = ({
  size,
  onRemove,
  onResize,
  dragHandleProps
}) => {
  const { language } = useLanguage();
  const { settings } = useNutritionSettings();
  const [glasses, setGlasses] = useState(4);
  const waterTarget = 8;

  // Mock data - în producție ar veni din champion_routine_logs
  const consumed = 1850;
  const burned = 350;
  const caloriesTarget = settings.calorie_target || 2200;
  const remaining = caloriesTarget - consumed + burned;
  const caloriePercentage = Math.min((consumed / caloriesTarget) * 100, 100);

  const macros = {
    protein: { current: 95, target: settings.protein_target || 150 },
    carbs: { current: 180, target: settings.carbs_target || 250 },
    fats: { current: 45, target: settings.fats_target || 70 }
  };

  const labels = {
    protein: { en: 'Protein', ro: 'Proteine' },
    carbs: { en: 'Carbs', ro: 'Carbo' },
    fats: { en: 'Fats', ro: 'Grăsimi' }
  };

  const macroColors = {
    protein: 'bg-blue-500',
    carbs: 'bg-amber-500',
    fats: 'bg-rose-500'
  };

  const waterPercentage = Math.min((glasses / waterTarget) * 100, 100);

  return (
    <WidgetContainer
      title={language === 'ro' ? 'Nutriție' : 'Nutrition Hub'}
      icon={<Flame className="h-4 w-4 text-orange-500" />}
      size={size}
      onRemove={onRemove}
      onResize={onResize}
      dragHandleProps={dragHandleProps}
    >
      <div className="space-y-4">
        {/* Calories Section */}
        <div className="flex items-center gap-4">
          <div className="relative w-16 h-16 flex-shrink-0">
            <svg className="w-full h-full transform -rotate-90">
              <circle
                cx="32"
                cy="32"
                r="28"
                stroke="currentColor"
                strokeWidth="5"
                fill="none"
                className="text-muted"
              />
              <circle
                cx="32"
                cy="32"
                r="28"
                stroke="currentColor"
                strokeWidth="5"
                fill="none"
                strokeDasharray={`${caloriePercentage * 1.76} 176`}
                className="text-orange-500"
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-sm font-bold">{remaining}</span>
              <span className="text-[8px] text-muted-foreground">
                {language === 'ro' ? 'kcal' : 'kcal'}
              </span>
            </div>
          </div>
          
          <div className="flex-1 min-w-0">
            <div className="flex justify-between text-xs mb-1">
              <span className="text-muted-foreground">
                {language === 'ro' ? 'Calorii' : 'Calories'}
              </span>
              <span className="font-medium">{consumed} / {caloriesTarget}</span>
            </div>
            <Progress value={caloriePercentage} className="h-2" />
            <div className="flex gap-3 mt-1 text-[10px] text-muted-foreground">
              <span className="flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-green-500" />
                {consumed} {language === 'ro' ? 'consumate' : 'eaten'}
              </span>
              <span className="flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-red-500" />
                {burned} {language === 'ro' ? 'arse' : 'burned'}
              </span>
            </div>
          </div>
        </div>

        {/* Macros Section */}
        <div className="grid grid-cols-3 gap-2">
          {Object.entries(macros).map(([key, value]) => {
            const percentage = Math.min((value.current / value.target) * 100, 100);
            return (
              <div key={key} className="text-center">
                <div className="relative w-10 h-10 mx-auto mb-1">
                  <svg className="w-full h-full transform -rotate-90">
                    <circle
                      cx="20"
                      cy="20"
                      r="16"
                      stroke="currentColor"
                      strokeWidth="3"
                      fill="none"
                      className="text-muted"
                    />
                    <circle
                      cx="20"
                      cy="20"
                      r="16"
                      stroke="currentColor"
                      strokeWidth="3"
                      fill="none"
                      strokeDasharray={`${percentage * 1.005} 100.5`}
                      className={key === 'protein' ? 'text-blue-500' : key === 'carbs' ? 'text-amber-500' : 'text-rose-500'}
                    />
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-[10px] font-semibold">{value.current}</span>
                  </div>
                </div>
                <p className="text-[10px] font-medium">
                  {labels[key as keyof typeof labels][language]}
                </p>
                <p className="text-[9px] text-muted-foreground">
                  /{value.target}g
                </p>
              </div>
            );
          })}
        </div>

        {/* Water Section */}
        <div className="flex items-center justify-between pt-2 border-t border-border/50">
          <div className="flex items-center gap-2">
            <Droplets className="h-4 w-4 text-cyan-500" />
            <span className="text-xs font-medium">
              {language === 'ro' ? 'Apă' : 'Water'}
            </span>
          </div>
          
          <div className="flex items-center gap-2">
            <Button 
              size="icon" 
              variant="ghost" 
              className="h-6 w-6"
              onClick={() => setGlasses(prev => Math.max(prev - 1, 0))}
            >
              <Minus className="h-3 w-3" />
            </Button>
            
            <div className="flex items-center gap-1">
              {Array.from({ length: waterTarget }).map((_, i) => (
                <div
                  key={i}
                  className={`w-2 h-4 rounded-sm transition-colors ${
                    i < glasses ? 'bg-cyan-500' : 'bg-muted'
                  }`}
                />
              ))}
            </div>
            
            <Button 
              size="icon" 
              variant="ghost" 
              className="h-6 w-6"
              onClick={() => setGlasses(prev => Math.min(prev + 1, 12))}
            >
              <Plus className="h-3 w-3" />
            </Button>
            
            <span className="text-xs font-medium ml-1">
              {glasses}/{waterTarget}
            </span>
          </div>
        </div>
      </div>
    </WidgetContainer>
  );
};
