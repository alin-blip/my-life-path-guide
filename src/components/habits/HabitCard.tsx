import React from 'react';
import { Check } from 'lucide-react';
import { cn } from '@/lib/utils';
import { DailyHabit, HabitCategory } from '@/hooks/useDailyHabits';
import * as Icons from 'lucide-react';

interface HabitCardProps {
  habit: DailyHabit;
  isCompleted: boolean;
  onToggle: () => void;
}

const categoryColors: Record<HabitCategory, { bg: string; border: string; text: string }> = {
  body: { bg: 'bg-red-500/20', border: 'border-red-500/50', text: 'text-red-400' },
  being: { bg: 'bg-purple-500/20', border: 'border-purple-500/50', text: 'text-purple-400' },
  balance: { bg: 'bg-blue-500/20', border: 'border-blue-500/50', text: 'text-blue-400' },
  business: { bg: 'bg-green-500/20', border: 'border-green-500/50', text: 'text-green-400' },
};

const getIconComponent = (iconName: string): React.ComponentType<{ className?: string }> => {
  const pascalCase = iconName
    .split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join('');
  
  const iconMap = Icons as unknown as Record<string, React.ComponentType<{ className?: string }>>;
  return iconMap[pascalCase] || Icons.Check;
};

export const HabitCard: React.FC<HabitCardProps> = ({ habit, isCompleted, onToggle }) => {
  const colors = categoryColors[habit.category];
  const IconComponent = getIconComponent(habit.icon);

  return (
    <button
      onClick={onToggle}
      className={cn(
        'relative flex flex-col items-center justify-center p-3 rounded-xl border-2 transition-all duration-200',
        'hover:scale-105 active:scale-95',
        isCompleted
          ? 'bg-primary/20 border-primary shadow-lg shadow-primary/20'
          : `${colors.bg} ${colors.border} hover:border-primary/50`
      )}
    >
      {isCompleted && (
        <div className="absolute -top-1.5 -right-1.5 bg-primary rounded-full p-0.5">
          <Check className="h-3 w-3 text-primary-foreground" />
        </div>
      )}
      
      <div className={cn(
        'h-8 w-8 rounded-lg flex items-center justify-center mb-1',
        isCompleted ? 'bg-primary/30' : colors.bg
      )}>
        <IconComponent className={cn(
          'h-4 w-4',
          isCompleted ? 'text-primary' : colors.text
        )} />
      </div>
      
      <span className={cn(
        'text-xs font-medium text-center line-clamp-1',
        isCompleted ? 'text-primary' : 'text-foreground/80'
      )}>
        {habit.name}
      </span>
    </button>
  );
};
