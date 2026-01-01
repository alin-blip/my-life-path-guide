import React, { useEffect, useState } from 'react';
import { useLanguage } from '@/context/LanguageContext';
import { CheckCircle2, Circle, Clock, Loader2, Plus } from 'lucide-react';
import { cn } from '@/lib/utils';
import { supabase } from '@/integrations/supabase/client';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { v4 as uuidv4 } from 'uuid';
import { getWeekKey, getTodayAbbrev } from '@/utils/weekUtils';

interface TodaysTasksProps {
  activeTaskId: string | null;
  onSelectTask: (taskId: string) => void;
}

interface Task {
  id: string;
  title: string;
  completed: boolean;
  day_of_week: string | null;
}

export const TodaysTasks: React.FC<TodaysTasksProps> = ({
  activeTaskId,
  onSelectTask,
}) => {
  const { language } = useLanguage();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [isAdding, setIsAdding] = useState(false);

  useEffect(() => {
    const fetchTodaysTasks = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          setLoading(false);
          return;
        }

        const weekKey = getWeekKey();
        const todayAbbrev = getTodayAbbrev();

        // Fetch Hit List tasks for today (these are the daily tasks)
        const { data, error } = await supabase
          .from('user_tasks')
          .select('id, title, completed, day_of_week')
          .eq('user_id', user.id)
          .eq('week_key', weekKey)
          .eq('task_type', 'hit')
          .order('position', { ascending: true });

        if (error) throw error;

        // Filter for today's tasks (matching day_of_week or no day assigned)
        const todaysTasks = (data || []).filter(task => {
          if (!task.day_of_week) return true; // No day = show all
          const normalizedDay = task.day_of_week.toLowerCase();
          const todayLower = todayAbbrev.toLowerCase();
          return normalizedDay === todayLower || 
                 normalizedDay === todayAbbrev;
        });

        setTasks(todaysTasks);
      } catch (error) {
        console.error('Error fetching tasks:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchTodaysTasks();

    // Subscribe to realtime updates
    const channel = supabase
      .channel('focus-tasks')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'user_tasks',
        },
        () => {
          fetchTodaysTasks();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const toggleTaskCompletion = async (taskId: string, currentCompleted: boolean) => {
    try {
      const { error } = await supabase
        .from('user_tasks')
        .update({ completed: !currentCompleted })
        .eq('id', taskId);

      if (error) throw error;

      setTasks(prev => 
        prev.map(t => t.id === taskId ? { ...t, completed: !currentCompleted } : t)
      );
    } catch (error) {
      console.error('Error updating task:', error);
    }
  };

  const handleAddTask = async () => {
    if (!newTaskTitle.trim()) return;
    
    setIsAdding(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const weekKey = getWeekKey();
      const todayAbbrev = getTodayAbbrev();
      const newTask = {
        id: uuidv4(),
        user_id: user.id,
        title: newTaskTitle.trim(),
        task_type: 'hit',
        list_type: 'hit',
        week_key: weekKey,
        day_of_week: todayAbbrev,
        completed: false,
        position: tasks.length,
      };

      const { error } = await supabase
        .from('user_tasks')
        .insert(newTask);

      if (error) throw error;

      setTasks(prev => [...prev, { 
        id: newTask.id, 
        title: newTask.title, 
        completed: false, 
        day_of_week: todayAbbrev 
      }]);
      setNewTaskTitle('');
    } catch (error) {
      console.error('Error adding task:', error);
    } finally {
      setIsAdding(false);
    }
  };

  if (loading) {
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
              onClick={() => toggleTaskCompletion(task.id, task.completed)}
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
