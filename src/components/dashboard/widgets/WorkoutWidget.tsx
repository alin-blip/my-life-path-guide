import React from 'react';
import { Dumbbell, Play } from 'lucide-react';
import { WidgetContainer } from './WidgetContainer';
import { WidgetSize } from '@/types/dashboardWidget';
import { useLanguage } from '@/context/LanguageContext';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';

interface WorkoutWidgetProps {
  size: WidgetSize;
  onRemove: () => void;
  onResize: (size: WidgetSize) => void;
  dragHandleProps?: any;
}

export const WorkoutWidget: React.FC<WorkoutWidgetProps> = ({
  size,
  onRemove,
  onResize,
  dragHandleProps
}) => {
  const { language } = useLanguage();
  const navigate = useNavigate();

  const todayWorkout = {
    name: language === 'ro' ? 'Piept & Triceps' : 'Chest & Triceps',
    exercises: 6,
    duration: '45 min',
    completed: 2
  };

  return (
    <WidgetContainer
      title={language === 'ro' ? 'Antrenament' : 'Workout'}
      icon={<Dumbbell className="h-4 w-4 text-orange-500" />}
      size={size}
      onRemove={onRemove}
      onResize={onResize}
      dragHandleProps={dragHandleProps}
    >
      <div className="space-y-3">
        <div className="p-3 rounded-lg bg-orange-500/10 border border-orange-500/20">
          <p className="font-medium text-sm">{todayWorkout.name}</p>
          <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
            <span>{todayWorkout.exercises} {language === 'ro' ? 'exerciții' : 'exercises'}</span>
            <span>•</span>
            <span>{todayWorkout.duration}</span>
          </div>
        </div>
        
        <div className="flex items-center justify-between">
          <div className="text-xs text-muted-foreground">
            {todayWorkout.completed}/{todayWorkout.exercises} {language === 'ro' ? 'completate' : 'completed'}
          </div>
          <Button 
            size="sm" 
            variant="outline" 
            className="gap-1"
            onClick={() => navigate('/fitness')}
          >
            <Play className="h-3 w-3" />
            {language === 'ro' ? 'Începe' : 'Start'}
          </Button>
        </div>
      </div>
    </WidgetContainer>
  );
};
