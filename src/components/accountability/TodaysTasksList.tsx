import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Checkbox } from '@/components/ui/checkbox';
import { ScrollArea } from '@/components/ui/scroll-area';
import { ListChecks, ArrowRight, Sparkles } from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';
import { TodayTask } from '@/hooks/useTodaysTasks';
import { cn } from '@/lib/utils';

interface TodaysTasksListProps {
  tasks: TodayTask[];
  completedCount: number;
  totalCount: number;
  onToggleTask: (taskId: string) => void;
  isLoading?: boolean;
  onClose?: () => void;
}

export const TodaysTasksList: React.FC<TodaysTasksListProps> = ({
  tasks,
  completedCount,
  totalCount,
  onToggleTask,
  isLoading,
  onClose,
}) => {
  const { language } = useLanguage();
  const navigate = useNavigate();
  const progress = totalCount > 0 ? (completedCount / totalCount) * 100 : 0;
  const allCompleted = totalCount > 0 && completedCount === totalCount;

  const handleGoToDoor = () => {
    navigate('/door?tab=sarcini');
    onClose?.();
  };

  if (isLoading) {
    return (
      <div className="p-4 text-center">
        <div className="animate-spin w-5 h-5 border-2 border-primary border-t-transparent rounded-full mx-auto" />
      </div>
    );
  }

  if (tasks.length === 0) {
    return (
      <div className="p-4 text-center space-y-2">
        <p className="text-sm text-muted-foreground">
          {language === 'ro' ? 'Nu ai taskuri pentru azi.' : 'No tasks for today.'}
        </p>
        <Button variant="link" size="sm" onClick={handleGoToDoor} className="text-primary">
          {language === 'ro' ? 'Planifică în Domino Door' : 'Plan in Domino Door'}
          <ArrowRight className="w-3 h-3 ml-1" />
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {/* Header */}
      <div className="flex items-center justify-between px-3 pt-2">
        <h3 className="font-semibold text-sm flex items-center gap-2">
          <ListChecks className="w-4 h-4 text-primary" />
          {language === 'ro' ? 'Taskuri Astăzi' : "Today's Tasks"}
        </h3>
        <Badge 
          variant={allCompleted ? 'default' : 'outline'} 
          className={cn(
            "text-xs",
            allCompleted && "bg-green-500 hover:bg-green-600"
          )}
        >
          {allCompleted && <Sparkles className="w-3 h-3 mr-1" />}
          {completedCount}/{totalCount}
        </Badge>
      </div>

      {/* Progress bar */}
      <div className="px-3">
        <Progress 
          value={progress} 
          className="h-2"
          indicatorClassName={cn(
            "transition-all duration-500",
            allCompleted ? "bg-green-500" : "bg-primary"
          )}
        />
      </div>

      {/* Task list */}
      <ScrollArea className="max-h-[200px]">
        <div className="space-y-1 px-3">
          {tasks.map(task => (
            <div
              key={task.id}
              className={cn(
                "flex items-center gap-3 p-2 rounded-lg transition-colors cursor-pointer",
                "hover:bg-muted/50",
                task.completed && "opacity-60"
              )}
              onClick={() => onToggleTask(task.id)}
            >
              <Checkbox
                checked={task.completed}
                onCheckedChange={() => onToggleTask(task.id)}
                className="data-[state=checked]:bg-green-500 data-[state=checked]:border-green-500"
              />
              <span className={cn(
                "text-sm flex-1",
                task.completed && "line-through text-muted-foreground"
              )}>
                {task.title}
              </span>
            </div>
          ))}
        </div>
      </ScrollArea>

      {/* All completed celebration */}
      {allCompleted && (
        <div className="px-3 pb-2">
          <div className="p-3 rounded-lg bg-green-500/10 border border-green-500/20 text-center">
            <p className="text-sm font-medium text-green-600">
              🎉 {language === 'ro' ? 'Excelent! Toate complete!' : 'Excellent! All done!'}
            </p>
          </div>
        </div>
      )}

      {/* Link to Domino Door */}
      <div className="px-3 pb-2">
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={handleGoToDoor}
          className="w-full text-xs text-muted-foreground hover:text-primary"
        >
          {language === 'ro' ? 'Gestionează în Domino Door' : 'Manage in Domino Door'}
          <ArrowRight className="w-3 h-3 ml-1" />
        </Button>
      </div>
    </div>
  );
};
