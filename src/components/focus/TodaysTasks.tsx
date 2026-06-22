import React, { useState } from 'react';
import { useLanguage } from '@/context/LanguageContext';
import { CheckCircle2, Circle, Clock, Loader2, Plus } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useTodaysTasks } from '@/hooks/useTodaysTasks';
import { TaskHelpButton } from '@/components/coach/TaskHelpButton';

interface TodaysTasksProps {
  activeTaskId: string | null;
  onSelectTask: (taskId: string) => void;
}

export const TodaysTasks: React.FC<TodaysTasksProps> = ({
  activeTaskId,
  onSelectTask,
}) => {
  const { language } = useLanguage();
  const { tasks, isLoading, toggleTask, addTask } = useTodaysTasks();
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [isAdding, setIsAdding] = useState(false);

  const handleAddTask = async () => {
    if (!newTaskTitle.trim()) return;
    
    setIsAdding(true);
    await addTask(newTaskTitle);
    setNewTaskTitle('');
    setIsAdding(false);
  };

  if (isLoading) {
    return (
      <div className="bg-card border border-border rounded-xl p-6 flex items-center justify-center">
        <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

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
          <div
            key={task.id}
            className={cn(
              "w-full flex items-center gap-3 p-3 rounded-lg transition-all",
              task.completed 
                ? "bg-muted/50 opacity-60" 
                : activeTaskId === task.id
                ? "bg-primary/10 border border-primary/30"
                : "hover:bg-muted/50"
            )}
          >
            <button
              onClick={() => toggleTask(task.id)}
              className="flex-shrink-0"
            >
              {task.completed ? (
                <CheckCircle2 className="w-5 h-5 text-green-500" />
              ) : (
                <Circle className={cn(
                  "w-5 h-5",
                  activeTaskId === task.id ? "text-primary" : "text-muted-foreground"
                )} />
              )}
            </button>
            
            <button
              onClick={() => !task.completed && onSelectTask(task.id)}
              className={cn(
                "flex-1 text-left text-sm",
                task.completed && "line-through text-muted-foreground"
              )}
            >
              {task.title}
            </button>

            {activeTaskId === task.id && !task.completed && (
              <div className="flex items-center gap-1 text-xs text-primary font-medium">
                <Clock className="w-3 h-3" />
                <span>{language === 'en' ? 'Active' : 'Activ'}</span>
              </div>
            )}
          </div>
        ))}
      </div>

      {tasks.length === 0 && !newTaskTitle && (
        <p className="text-center text-muted-foreground text-sm py-4">
          {language === 'en' 
            ? 'No tasks for today. Add one below!' 
            : 'Nicio sarcină pentru azi. Adaugă una mai jos!'}
        </p>
      )}

      <div className="flex gap-2 mt-4 pt-4 border-t border-border">
        <Input
          value={newTaskTitle}
          onChange={(e) => setNewTaskTitle(e.target.value)}
          placeholder={language === 'en' ? 'Add a new task...' : 'Adaugă o sarcină nouă...'}
          className="flex-1"
          onKeyDown={(e) => e.key === 'Enter' && handleAddTask()}
          disabled={isAdding}
        />
        <Button 
          size="icon" 
          onClick={handleAddTask} 
          disabled={!newTaskTitle.trim() || isAdding}
        >
          {isAdding ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Plus className="w-4 h-4" />
          )}
        </Button>
      </div>
    </div>
  );
};
