import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { CheckCircle2, Plus, ListTodo, Star, Trash2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { format, startOfWeek, getWeek } from 'date-fns';
import { ro } from 'date-fns/locale';
import { useTranslation } from 'react-i18next';

interface Task {
  id: string;
  title: string;
  completed: boolean;
  day_of_week: string | null;
  list_type: string;
}

// Get week key for a date (Monday-based) - consistent with DOOR format
const getWeekKey = (date: Date): string => {
  const weekNum = getWeek(date, { weekStartsOn: 1 });
  const year = date.getFullYear();
  return `door-week-${year}-${String(weekNum).padStart(2, '0')}`;
};

// Get day abbreviation from date
const getDayAbbrev = (date: Date): string => {
  const days = ['Su', 'M', 'T', 'W', 'Th', 'F', 'Sa'];
  return days[date.getDay()];
};


export const TodayTasksWidget = () => {
  const { t, i18n } = useTranslation();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [bigOne, setBigOne] = useState<string>('');
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isAddingTask, setIsAddingTask] = useState(false);

  const today = new Date();
  const dateLocale = i18n.language === 'ro' ? ro : undefined;
  const weekKey = getWeekKey(today);
  const todayAbbrev = getDayAbbrev(today);

  const loadTodayData = useCallback(async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const todayStr = format(today, 'yyyy-MM-dd');

      // Load Big One from champion_routine_logs
      const { data: routineLog } = await supabase
        .from('champion_routine_logs')
        .select('big_one_today')
        .eq('user_id', user.id)
        .eq('date', todayStr)
        .maybeSingle();

      if (routineLog) {
        setBigOne(routineLog.big_one_today || '');
      }

      // Load tasks from hot_list_items for today (hit and do lists with today's day)
      const { data: tasksData } = await supabase
        .from('hot_list_items')
        .select('id, title, completed, day_of_week, list_type')
        .eq('user_id', user.id)
        .eq('week_key', weekKey)
        .in('list_type', ['hit', 'do'])
        .or(`day_of_week.eq.${todayAbbrev},day_of_week.is.null`);

      if (tasksData) {
        setTasks(tasksData.map(t => ({
          id: t.id,
          title: t.title,
          completed: t.completed || false,
          day_of_week: t.day_of_week,
          list_type: t.list_type
        })));
      }
    } catch (error) {
      console.error('Error loading today data:', error);
    } finally {
      setIsLoading(false);
    }
  }, [weekKey, todayAbbrev]);

  // Initial load + real-time subscription
  useEffect(() => {
    loadTodayData();

    // Set up real-time subscription for hot_list_items changes
    const channel = supabase
      .channel('today-tasks-realtime')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'hot_list_items'
        },
        (payload) => {
          console.log('Real-time update in TodayTasksWidget:', payload);
          // Reload data when any change happens
          loadTodayData();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [loadTodayData]);


  const handleAddTask = async () => {
    if (!newTaskTitle.trim()) return;

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('hot_list_items')
        .insert({
          user_id: user.id,
          week_key: weekKey,
          list_type: 'do',
          title: newTaskTitle.trim(),
          day_of_week: todayAbbrev,
          completed: false,
          item_id: crypto.randomUUID()
        })
        .select()
        .single();

      if (error) throw error;

      if (data) {
        setTasks([...tasks, {
          id: data.id,
          title: data.title,
          completed: false,
          day_of_week: data.day_of_week,
          list_type: data.list_type
        }]);
      }
      setNewTaskTitle('');
      setIsAddingTask(false);
    } catch (error) {
      console.error('Error adding task:', error);
    }
  };

  const handleToggleTask = async (taskId: string) => {
    const task = tasks.find(t => t.id === taskId);
    if (!task) return;

    try {
      const { error } = await supabase
        .from('hot_list_items')
        .update({ completed: !task.completed })
        .eq('id', taskId);

      if (error) throw error;

      setTasks(tasks.map(t =>
        t.id === taskId ? { ...t, completed: !t.completed } : t
      ));
    } catch (error) {
      console.error('Error toggling task:', error);
    }
  };

  const handleDeleteTask = async (taskId: string) => {
    try {
      const { error } = await supabase
        .from('hot_list_items')
        .delete()
        .eq('id', taskId);

      if (error) throw error;

      setTasks(tasks.filter(t => t.id !== taskId));
    } catch (error) {
      console.error('Error deleting task:', error);
    }
  };

  const handleSetBigOne = async (taskId: string) => {
    const task = tasks.find(t => t.id === taskId);
    if (!task) return;

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const todayStr = format(today, 'yyyy-MM-dd');

      // Check if record exists
      const { data: existing } = await supabase
        .from('champion_routine_logs')
        .select('id')
        .eq('user_id', user.id)
        .eq('date', todayStr)
        .maybeSingle();

      if (existing) {
        await supabase
          .from('champion_routine_logs')
          .update({ big_one_today: task.title })
          .eq('user_id', user.id)
          .eq('date', todayStr);
      } else {
        await supabase
          .from('champion_routine_logs')
          .insert({
            user_id: user.id,
            date: todayStr,
            big_one_today: task.title
          });
      }

      setBigOne(task.title);
    } catch (error) {
      console.error('Error setting big one:', error);
    }
  };

  const completedCount = tasks.filter(t => t.completed).length;
  const progressPercent = tasks.length > 0 ? (completedCount / tasks.length) * 100 : 0;

  if (isLoading) {
    return (
      <Card className="bg-card/50 backdrop-blur-sm border-border/50">
        <CardContent className="p-6">
          <div className="animate-pulse space-y-3">
            <div className="h-4 bg-muted rounded w-1/3"></div>
            <div className="h-8 bg-muted rounded"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-card/50 backdrop-blur-sm border-border/50">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            <ListTodo className="h-5 w-5 text-primary" />
            {i18n.language === 'ro' ? 'Taskuri Azi' : 'Today\'s Tasks'}
            <span className="text-sm font-normal text-muted-foreground">
              {format(today, 'EEEE, d MMM', { locale: dateLocale })}
            </span>
          </CardTitle>
          <span className="text-sm text-muted-foreground">
            {completedCount}/{tasks.length}
          </span>
        </div>
        
        {/* Progress bar */}
        {tasks.length > 0 && (
          <div className="w-full bg-muted rounded-full h-2 mt-2">
            <div 
              className="bg-primary h-2 rounded-full transition-all duration-300"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        )}
      </CardHeader>

      <CardContent className="space-y-3">
        {/* Big One Today */}
        {bigOne && (
          <div className="p-3 rounded-lg bg-primary/10 border border-primary/20">
            <div className="flex items-center gap-2 text-sm font-medium text-primary mb-1">
              <Star className="h-4 w-4 fill-primary" />
              {i18n.language === 'ro' ? 'Cel Mai Important' : 'Big One Today'}
            </div>
            <p className="text-foreground font-medium">{bigOne}</p>
          </div>
        )}

        {/* Task List */}
        <div className="space-y-2 max-h-[200px] overflow-y-auto">
          {tasks.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-4">
              {i18n.language === 'ro' ? 'Nu ai taskuri pentru azi' : 'No tasks for today'}
            </p>
          ) : (
            tasks.map(task => (
              <div 
                key={task.id}
                className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted/50 group"
              >
                <Checkbox
                  checked={task.completed}
                  onCheckedChange={() => handleToggleTask(task.id)}
                />
                <span className={`flex-1 text-sm ${task.completed ? 'line-through text-muted-foreground' : ''}`}>
                  {task.title}
                </span>
                <div className="opacity-0 group-hover:opacity-100 flex gap-1 transition-opacity">
                  {!bigOne && (
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7"
                      onClick={() => handleSetBigOne(task.id)}
                      title={i18n.language === 'ro' ? 'Setează ca Big One' : 'Set as Big One'}
                    >
                      <Star className="h-3.5 w-3.5" />
                    </Button>
                  )}
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7 text-destructive"
                    onClick={() => handleDeleteTask(task.id)}
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Add Task */}
        {isAddingTask ? (
          <div className="flex gap-2">
            <Input
              value={newTaskTitle}
              onChange={(e) => setNewTaskTitle(e.target.value)}
              placeholder={i18n.language === 'ro' ? 'Ce ai de făcut azi?' : 'What do you need to do today?'}
              onKeyDown={(e) => e.key === 'Enter' && handleAddTask()}
              autoFocus
            />
            <Button size="sm" onClick={handleAddTask}>
              <Plus className="h-4 w-4" />
            </Button>
          </div>
        ) : (
          <Button
            variant="outline"
            size="sm"
            className="w-full"
            onClick={() => setIsAddingTask(true)}
          >
            <Plus className="h-4 w-4 mr-2" />
            {i18n.language === 'ro' ? 'Adaugă task' : 'Add task'}
          </Button>
        )}

        {/* Completion message */}
        {tasks.length > 0 && completedCount === tasks.length && (
          <div className="flex items-center justify-center gap-2 text-sm text-green-600 dark:text-green-400 py-2">
            <CheckCircle2 className="h-4 w-4" />
            {i18n.language === 'ro' ? 'Toate taskurile completate!' : 'All tasks completed!'}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
