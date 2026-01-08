import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { format } from 'date-fns';
import { toast } from 'sonner';

export interface TodayTask {
  id: string;
  title: string;
  completed: boolean;
  day_of_week: string;
  list_type: string;
  user_id: string;
  created_at?: string;
}

export const useTodaysTasks = () => {
  const [tasks, setTasks] = useState<TodayTask[]>([]);
  const [bigOne, setBigOne] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const today = format(new Date(), 'EEEE').toLowerCase();

  const fetchTasks = useCallback(async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setIsLoading(false);
        return;
      }

      // Fetch today's tasks
      const { data: tasksData, error: tasksError } = await supabase
        .from('user_tasks')
        .select('*')
        .eq('user_id', user.id)
        .eq('day_of_week', today)
        .eq('list_type', 'daily')
        .order('created_at', { ascending: true });

      if (tasksError) throw tasksError;

      setTasks(tasksData || []);

      // Fetch Big One from champion routine log
      const todayDate = format(new Date(), 'yyyy-MM-dd');
      const { data: logData } = await supabase
        .from('champion_routine_logs')
        .select('big_one_today')
        .eq('user_id', user.id)
        .eq('date', todayDate)
        .maybeSingle();

      if (logData?.big_one_today) {
        setBigOne(logData.big_one_today);
      }
    } catch (error) {
      console.error('Error fetching tasks:', error);
    } finally {
      setIsLoading(false);
    }
  }, [today]);

  useEffect(() => {
    fetchTasks();

    // Setup realtime subscription
    const channel = supabase
      .channel('today-tasks-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'user_tasks'
        },
        () => {
          fetchTasks();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [fetchTasks]);

  const toggleTask = async (taskId: string) => {
    const task = tasks.find(t => t.id === taskId);
    if (!task) return;

    const newCompleted = !task.completed;

    // Optimistic update
    setTasks(prev => prev.map(t => 
      t.id === taskId ? { ...t, completed: newCompleted } : t
    ));

    try {
      const { error } = await supabase
        .from('user_tasks')
        .update({ completed: newCompleted })
        .eq('id', taskId);

      if (error) throw error;
    } catch (error) {
      // Revert on error
      setTasks(prev => prev.map(t => 
        t.id === taskId ? { ...t, completed: !newCompleted } : t
      ));
      toast.error('Nu am putut actualiza task-ul');
    }
  };

  const addTask = async (title: string) => {
    if (!title.trim()) return;

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast.error('Trebuie să fii autentificat');
        return;
      }

      const { data, error } = await supabase
        .from('user_tasks')
        .insert({
          user_id: user.id,
          title: title.trim(),
          completed: false,
          day_of_week: today,
          list_type: 'daily',
          task_type: 'daily'
        })
        .select()
        .single();

      if (error) throw error;

      if (data) {
        setTasks(prev => [...prev, data]);
        toast.success('Task adăugat!');
      }
    } catch (error) {
      console.error('Error adding task:', error);
      toast.error('Nu am putut adăuga task-ul');
    }
  };

  const deleteTask = async (taskId: string) => {
    try {
      const { error } = await supabase
        .from('user_tasks')
        .delete()
        .eq('id', taskId);

      if (error) throw error;

      setTasks(prev => prev.filter(t => t.id !== taskId));
    } catch (error) {
      console.error('Error deleting task:', error);
      toast.error('Nu am putut șterge task-ul');
    }
  };

  const completedCount = tasks.filter(t => t.completed).length;
  const totalCount = tasks.length;
  const progress = totalCount > 0 ? (completedCount / totalCount) * 100 : 0;

  return {
    tasks,
    bigOne,
    isLoading,
    toggleTask,
    addTask,
    deleteTask,
    completedCount,
    totalCount,
    progress,
    refetch: fetchTasks
  };
};
