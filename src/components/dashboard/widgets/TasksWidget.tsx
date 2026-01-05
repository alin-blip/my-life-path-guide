import React, { useState, useEffect } from 'react';
import { CheckSquare, Plus, Circle, CheckCircle2 } from 'lucide-react';
import { WidgetContainer } from './WidgetContainer';
import { WidgetSize } from '@/types/dashboardWidget';
import { useLanguage } from '@/context/LanguageContext';
import { supabase } from '@/integrations/supabase/client';
import { format } from 'date-fns';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

interface Task {
  id: string;
  title: string;
  completed: boolean;
}

interface TasksWidgetProps {
  size: WidgetSize;
  onRemove: () => void;
  onResize: (size: WidgetSize) => void;
  dragHandleProps?: any;
}

export const TasksWidget: React.FC<TasksWidgetProps> = ({
  size,
  onRemove,
  onResize,
  dragHandleProps
}) => {
  const { language } = useLanguage();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [newTask, setNewTask] = useState('');

  const today = format(new Date(), 'yyyy-MM-dd');

  useEffect(() => {
    loadTasks();
  }, []);

  const loadTasks = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data } = await supabase
      .from('user_tasks')
      .select('id, title, completed')
      .eq('user_id', user.id)
      .eq('day', today)
      .eq('list_type', 'daily')
      .order('created_at', { ascending: true })
      .limit(5);

    if (data) {
      setTasks(data);
    }
  };

  const toggleTask = async (taskId: string, completed: boolean) => {
    await supabase
      .from('user_tasks')
      .update({ completed: !completed })
      .eq('id', taskId);

    setTasks(tasks.map(t => 
      t.id === taskId ? { ...t, completed: !completed } : t
    ));
  };

  const addTask = async () => {
    if (!newTask.trim()) return;

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data } = await supabase
      .from('user_tasks')
      .insert({
        user_id: user.id,
        title: newTask.trim(),
        day: today,
        list_type: 'daily',
        completed: false
      })
      .select()
      .single();

    if (data) {
      setTasks([...tasks, data]);
      setNewTask('');
    }
  };

  const completedCount = tasks.filter(t => t.completed).length;

  return (
    <WidgetContainer
      title={language === 'ro' ? 'Task-uri Azi' : 'Today Tasks'}
      icon={<CheckSquare className="h-4 w-4 text-blue-500" />}
      size={size}
      onRemove={onRemove}
      onResize={onResize}
      dragHandleProps={dragHandleProps}
    >
      <div className="space-y-2">
        {tasks.slice(0, 4).map((task) => (
          <div
            key={task.id}
            className="flex items-center gap-2 text-sm cursor-pointer group"
            onClick={() => toggleTask(task.id, task.completed)}
          >
            {task.completed ? (
              <CheckCircle2 className="h-4 w-4 text-green-500 flex-shrink-0" />
            ) : (
              <Circle className="h-4 w-4 text-muted-foreground group-hover:text-blue-500 flex-shrink-0" />
            )}
            <span className={task.completed ? 'line-through text-muted-foreground' : ''}>
              {task.title}
            </span>
          </div>
        ))}

        {tasks.length < 5 && (
          <div className="flex gap-2 mt-2">
            <Input
              value={newTask}
              onChange={(e) => setNewTask(e.target.value)}
              placeholder={language === 'ro' ? 'Adaugă task...' : 'Add task...'}
              className="text-sm h-8"
              onKeyPress={(e) => e.key === 'Enter' && addTask()}
            />
            <Button size="icon" variant="outline" className="h-8 w-8 flex-shrink-0" onClick={addTask}>
              <Plus className="h-3 w-3" />
            </Button>
          </div>
        )}

        <p className="text-xs text-muted-foreground text-center pt-1">
          {completedCount}/{tasks.length} {language === 'ro' ? 'completate' : 'completed'}
        </p>
      </div>
    </WidgetContainer>
  );
};
