import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { supabase } from '@/integrations/supabase/client';
import { CheckSquare, Check, AlertCircle } from 'lucide-react';
import { format } from 'date-fns';

interface Task {
  id: string;
  title: string;
  completed: boolean;
  priority?: number;
}

interface TodoStepProps {
  onComplete: () => void;
}

export const TodoStep = ({ onComplete }: TodoStepProps) => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const today = format(new Date(), 'yyyy-MM-dd');
  const dayOfWeek = format(new Date(), 'EEEE').slice(0, 2) as string;

  // Map day abbreviations
  const getDayAbbrev = () => {
    const dayMap: Record<string, string> = {
      'Mo': 'M', 'Tu': 'T', 'We': 'W', 'Th': 'Th', 'Fr': 'F', 'Sa': 'Sa', 'Su': 'Su'
    };
    return dayMap[dayOfWeek] || 'M';
  };

  useEffect(() => {
    loadTasks();
  }, []);

  const loadTasks = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setIsLoading(false);
        return;
      }

      // Get current week key
      const weekStart = new Date();
      weekStart.setDate(weekStart.getDate() - weekStart.getDay() + 1);
      const weekKey = `door-week-${format(weekStart, 'yyyy-MM-dd')}`;

      // Fetch hit list tasks for today
      const { data, error } = await supabase
        .from('user_tasks')
        .select('*')
        .eq('user_id', user.id)
        .in('list_type', ['hit', 'do'])
        .or(`day_of_week.eq.${getDayAbbrev()},day_of_week.is.null`);

      if (error) throw error;

      const formattedTasks: Task[] = (data || []).map(task => ({
        id: task.id,
        title: task.title,
        completed: task.completed || false,
        priority: task.priority || 0
      }));

      // Sort by priority (higher first) then by completion status
      formattedTasks.sort((a, b) => {
        if (a.completed !== b.completed) return a.completed ? 1 : -1;
        return (b.priority || 0) - (a.priority || 0);
      });

      setTasks(formattedTasks);
    } catch (error) {
      console.error('Error loading tasks:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const toggleTask = async (taskId: string) => {
    const task = tasks.find(t => t.id === taskId);
    if (!task) return;

    try {
      const { error } = await supabase
        .from('user_tasks')
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

  const completedCount = tasks.filter(t => t.completed).length;
  const progress = tasks.length > 0 ? (completedCount / tasks.length) * 100 : 0;

  if (isLoading) {
    return (
      <Card>
        <CardContent className="py-8 text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-purple-500">
          <CheckSquare className="h-5 w-5" />
          To Do - Task-uri pentru Azi
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Progress */}
        <div className="p-4 rounded-lg bg-muted/50">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium">Progres</span>
            <span className="text-sm text-muted-foreground">{completedCount}/{tasks.length}</span>
          </div>
          <div className="h-2 bg-muted rounded-full overflow-hidden">
            <div 
              className="h-full bg-primary transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {/* Tasks List */}
        {tasks.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <AlertCircle className="h-8 w-8 mx-auto mb-2 opacity-50" />
            <p>Nu ai task-uri pentru azi.</p>
            <p className="text-sm">Adaugă task-uri din secțiunea DOOR.</p>
          </div>
        ) : (
          <div className="space-y-2 max-h-[400px] overflow-y-auto">
            {tasks.map((task) => (
              <div
                key={task.id}
                className={`flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-colors ${
                  task.completed 
                    ? 'bg-muted/30 text-muted-foreground' 
                    : 'bg-muted/50 hover:bg-muted'
                }`}
                onClick={() => toggleTask(task.id)}
              >
                <Checkbox checked={task.completed} />
                <span className={task.completed ? 'line-through' : ''}>
                  {task.title}
                </span>
                {task.priority && task.priority > 0 && (
                  <span className="ml-auto text-xs px-2 py-0.5 rounded bg-red-500/20 text-red-500">
                    Prioritar
                  </span>
                )}
              </div>
            ))}
          </div>
        )}

        <Button 
          className="w-full gap-2" 
          onClick={onComplete}
        >
          <Check className="h-4 w-4" />
          Completează Pasul
        </Button>
      </CardContent>
    </Card>
  );
};
