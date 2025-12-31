import React from 'react';
import { useLanguage } from '@/context/LanguageContext';
import { CheckCircle2, Circle, Clock } from 'lucide-react';
import { cn } from '@/lib/utils';

interface TodaysTasksProps {
  activeTaskId: string | null;
  onSelectTask: (taskId: string) => void;
}

export const TodaysTasks: React.FC<TodaysTasksProps> = ({
  activeTaskId,
  onSelectTask,
}) => {
  const { language } = useLanguage();

  // Mock tasks - in real implementation, these would come from Door's daily tasks
  const tasks = [
    { id: '1', title: 'Complete project proposal', completed: true, pomodoros: 2 },
    { id: '2', title: 'Review team feedback', completed: false, pomodoros: 1 },
    { id: '3', title: 'Prepare presentation slides', completed: false, pomodoros: 3 },
    { id: '4', title: 'Send client update email', completed: false, pomodoros: 1 },
  ];

  return (
    <div className="bg-card border border-border rounded-xl p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-foreground">
          {language === 'en' ? 'Today\'s Tasks' : 'Sarcinile de Azi'}
        </h3>
        <span className="text-sm text-muted-foreground">
          {tasks.filter(t => t.completed).length}/{tasks.length}
        </span>
      </div>

      <div className="space-y-2">
        {tasks.map((task) => (
          <button
            key={task.id}
            onClick={() => !task.completed && onSelectTask(task.id)}
            className={cn(
              "w-full flex items-center gap-3 p-3 rounded-lg transition-all text-left",
              task.completed 
                ? "bg-muted/50 opacity-60" 
                : activeTaskId === task.id
                ? "bg-primary/10 border border-primary/30"
                : "hover:bg-muted/50"
            )}
          >
            {task.completed ? (
              <CheckCircle2 className="w-5 h-5 text-green-500 flex-shrink-0" />
            ) : (
              <Circle className={cn(
                "w-5 h-5 flex-shrink-0",
                activeTaskId === task.id ? "text-primary" : "text-muted-foreground"
              )} />
            )}
            
            <span className={cn(
              "flex-1 text-sm",
              task.completed && "line-through text-muted-foreground"
            )}>
              {task.title}
            </span>

            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <Clock className="w-3 h-3" />
              <span>{task.pomodoros}</span>
            </div>
          </button>
        ))}
      </div>

      {tasks.length === 0 && (
        <p className="text-center text-muted-foreground text-sm py-8">
          {language === 'en' 
            ? 'No tasks for today. Add some from the Command Center!' 
            : 'Nicio sarcină pentru azi. Adaugă din Command Center!'}
        </p>
      )}
    </div>
  );
};
