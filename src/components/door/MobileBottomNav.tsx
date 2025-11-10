import React from 'react';
import { ListTodo, Target, CheckSquare } from 'lucide-react';
import { cn } from '@/lib/utils';

interface MobileBottomNavProps {
  activeSection: 'todo' | 'focus' | 'tasks';
  onSectionChange: (section: 'todo' | 'focus' | 'tasks') => void;
  stats: {
    ideas: number;
    focus: number;
    tasks: number;
  };
}

export const MobileBottomNav: React.FC<MobileBottomNavProps> = ({
  activeSection,
  onSectionChange,
  stats,
}) => {
  const navItems = [
    {
      id: 'todo' as const,
      icon: ListTodo,
      label: 'To Do',
      count: stats.ideas,
      gradient: 'from-blue-500 to-cyan-500',
    },
    {
      id: 'focus' as const,
      icon: Target,
      label: 'Focus',
      count: stats.focus,
      gradient: 'from-purple-500 to-pink-500',
    },
    {
      id: 'tasks' as const,
      icon: CheckSquare,
      label: 'Tasks',
      count: stats.tasks,
      gradient: 'from-green-500 to-emerald-500',
    },
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-card/95 backdrop-blur-lg border-t border-border shadow-2xl z-50 pb-safe animate-slide-in-right">
      <div className="flex items-center justify-around px-2 py-3">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeSection === item.id;
          
          return (
            <button
              key={item.id}
              onClick={() => onSectionChange(item.id)}
              className={cn(
                'flex flex-col items-center gap-1 px-4 py-2 rounded-xl transition-all duration-300 relative min-w-[80px]',
                isActive
                  ? 'bg-gradient-to-br ' + item.gradient + ' text-white shadow-lg scale-110'
                  : 'text-muted-foreground hover:text-foreground hover:bg-accent/50'
              )}
            >
              <Icon className={cn(
                'w-6 h-6 transition-transform duration-300',
                isActive && 'scale-110'
              )} />
              <span className={cn(
                'text-xs font-semibold transition-all duration-300',
                isActive && 'text-white'
              )}>
                {item.label}
              </span>
              {item.count > 0 && (
                <span className={cn(
                  'absolute -top-1 -right-1 w-5 h-5 rounded-full text-[10px] font-bold flex items-center justify-center shadow-md transition-all duration-300',
                  isActive
                    ? 'bg-white text-primary'
                    : 'bg-primary text-primary-foreground'
                )}>
                  {item.count}
                </span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
};
