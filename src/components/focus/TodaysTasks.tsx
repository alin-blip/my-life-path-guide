import React, { useEffect, useState } from 'react';
import { useLanguage } from '@/context/LanguageContext';
import { CheckCircle2, Circle, Clock, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { supabase } from '@/integrations/supabase/client';
import { format, getWeek, getYear, startOfWeek } from 'date-fns';

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

const DAY_MAP: Record<number, string> = {
  1: 'M',
  2: 'T', 
  3: 'W',
  4: 'Th',
  5: 'F',
  6: 'Sa',
  0: 'Su',
};

export const TodaysTasks: React.FC<TodaysTasksProps> = ({
  activeTaskId,
  onSelectTask,
}) => {
  const { language } = useLanguage();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);

  const getCurrentWeekKey = () => {
    const now = new Date();
    const weekStart = startOfWeek(now, { weekStartsOn: 1 });
    const weekNum = getWeek(weekStart, { weekStartsOn: 1 });
    const year = getYear(weekStart);
    return `door-week-${year}-${String(weekNum).padStart(2, '0')}`;
  };

  const getTodayAbbrev = () => {
    const dayOfWeek = new Date().getDay();
    return DAY_MAP[dayOfWeek];
  };

  useEffect(() => {
    const fetchTodaysTasks = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          setLoading(false);
          return;
        }

        const weekKey = getCurrentWeekKey();
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
