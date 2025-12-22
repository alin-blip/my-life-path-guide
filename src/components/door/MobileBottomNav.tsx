import React from 'react';
import { ListTodo, Target, CheckSquare, Flame } from 'lucide-react';
import { cn } from '@/lib/utils';
import { haptic } from '@/utils/hapticFeedback';

interface MobileBottomNavProps {
  activeSection: 'todo' | 'focus' | 'tasks';
  onSectionChange: (section: 'todo' | 'focus' | 'tasks') => void;
  stats: {
    ideas: number;
    focus: number;
    tasks: number;
  };
  streak?: number;
}

export const MobileBottomNav: React.FC<MobileBottomNavProps> = ({
  activeSection,
  onSectionChange,
  stats,
  streak = 0,
}) => {
  const navItems = [
    {
      id: 'todo' as const,
      icon: ListTodo,
      label: 'Idei',
      count: stats.ideas,
      activeColor: 'bg-blue-600',
    },
    {
      id: 'focus' as const,
      icon: Target,
      label: 'Focus',
      count: stats.focus,
      activeColor: 'bg-purple-600',
    },
    {
      id: 'tasks' as const,
      icon: CheckSquare,
      label: 'Sarcini',
      count: stats.tasks,
      activeColor: 'bg-green-600',
    },
  ];

  const handleSectionChange = (section: 'todo' | 'focus' | 'tasks') => {
    haptic.light();
    onSectionChange(section);
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-card border-t border-border z-50 safe-area-bottom">
      <div className="flex items-stretch justify-around h-16">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeSection === item.id;
          
          return (
            <button
              key={item.id}
              onClick={() => handleSectionChange(item.id)}
              className={cn(
                'flex-1 flex flex-col items-center justify-center gap-0.5 relative transition-all duration-200',
                isActive
                  ? 'text-primary'
                  : 'text-muted-foreground active:bg-accent/50'
              )}
            >
              {/* Active indicator bar */}
              {isActive && (
                <div className="absolute top-0 left-1/4 right-1/4 h-0.5 bg-primary rounded-b-full" />
              )}
              
              <div className="relative">
                <Icon className={cn(
                  'w-5 h-5 transition-transform duration-200',
                  isActive && 'scale-110'
                )} />
                
                {/* Count badge */}
                {item.count > 0 && (
                  <span className={cn(
                    'absolute -top-1.5 -right-2.5 min-w-[16px] h-4 px-1 rounded-full text-[10px] font-bold flex items-center justify-center',
                    isActive
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-muted-foreground/20 text-muted-foreground'
                  )}>
                    {item.count > 99 ? '99+' : item.count}
                  </span>
                )}
              </div>
              
              <span className={cn(
                'text-[10px] font-medium',
                isActive && 'font-semibold'
              )}>
                {item.label}
              </span>
            </button>
          );
        })}
        
        {/* Streak indicator */}
        {streak > 0 && (
          <div className="absolute right-2 -top-8 flex items-center gap-1 bg-orange-500/20 text-orange-500 px-2 py-1 rounded-full text-xs font-bold">
            <Flame className="w-3 h-3" />
            {streak}
          </div>
        )}
      </div>
    </div>
  );
};
