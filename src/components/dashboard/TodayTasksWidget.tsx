import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { CheckCircle2, Plus, ListTodo, Star, Trash2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { format } from 'date-fns';
import { ro } from 'date-fns/locale';
import { useTranslation } from 'react-i18next';

interface Task {
  id: string;
  title: string;
  completed: boolean;
  isBigOne?: boolean;
}

export const TodayTasksWidget = () => {
  const { t, i18n } = useTranslation();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [bigOne, setBigOne] = useState<string>('');
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isAddingTask, setIsAddingTask] = useState(false);

  const today = new Date();
  const dateLocale = i18n.language === 'ro' ? ro : undefined;

  useEffect(() => {
    loadTodayData();
  }, []);

  const loadTodayData = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const todayStr = format(today, 'yyyy-MM-dd');

      // Load from champion_routine_logs
      const { data: routineLog } = await supabase
        .from('champion_routine_logs')
        .select('big_one_today, daily_todos')
        .eq('user_id', user.id)
        .eq('date', todayStr)
        .maybeSingle();

      if (routineLog) {
        setBigOne(routineLog.big_one_today || '');
        const todos = (routineLog.daily_todos as unknown as Task[]) || [];
        setTasks(Array.isArray(todos) ? todos : []);
      }
    } catch (error) {
      console.error('Error loading today data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const saveTasks = async (updatedTasks: Task[], updatedBigOne?: string) => {
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

      const tasksJson = JSON.parse(JSON.stringify(updatedTasks));

      if (existing) {
        await supabase
          .from('champion_routine_logs')
          .update({
            daily_todos: tasksJson,
            big_one_today: updatedBigOne !== undefined ? updatedBigOne : bigOne,
          })
          .eq('user_id', user.id)
          .eq('date', todayStr);
      } else {
        await supabase
          .from('champion_routine_logs')
          .insert({
            user_id: user.id,
            date: todayStr,
            daily_todos: tasksJson,
            big_one_today: updatedBigOne !== undefined ? updatedBigOne : bigOne,
          });
      }
    } catch (error) {
      console.error('Error saving tasks:', error);
    }
  };

  const handleAddTask = async () => {
    if (!newTaskTitle.trim()) return;

    const newTask: Task = {
      id: crypto.randomUUID(),
      title: newTaskTitle.trim(),
      completed: false,
    };

    const updatedTasks = [...tasks, newTask];
    setTasks(updatedTasks);
    setNewTaskTitle('');
    setIsAddingTask(false);
    await saveTasks(updatedTasks);
  };

  const handleToggleTask = async (taskId: string) => {
    const updatedTasks = tasks.map(task =>
      task.id === taskId ? { ...task, completed: !task.completed } : task
    );
    setTasks(updatedTasks);
    await saveTasks(updatedTasks);
  };

  const handleDeleteTask = async (taskId: string) => {
    const updatedTasks = tasks.filter(task => task.id !== taskId);
    setTasks(updatedTasks);
    await saveTasks(updatedTasks);
  };

  const handleSetBigOne = async (taskId: string) => {
    const task = tasks.find(t => t.id === taskId);
    if (task) {
      setBigOne(task.title);
      await saveTasks(tasks, task.title);
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
          {tasks.map(task => (
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
          ))}
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
