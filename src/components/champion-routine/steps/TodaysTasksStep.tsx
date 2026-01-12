import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { useTodaysTasks } from '@/hooks/useTodaysTasks';
import { useBigOne } from '@/hooks/useBigOne';
import { Check, ArrowRight, ListTodo, Plus, Trash2, Target } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { useTheme } from '@/context/ThemeContext';
import { cn } from '@/lib/utils';

interface TodaysTasksStepProps {
  onNext: () => void;
}

export const TodaysTasksStep: React.FC<TodaysTasksStepProps> = ({ onNext }) => {
  const { tasks, isLoading: tasksLoading, toggleTask, addTask, deleteTask, progress } = useTodaysTasks();
  const { bigOne, setBigOne, isLoading: bigOneLoading, isSaving } = useBigOne();
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [bigOneInput, setBigOneInput] = useState('');

  // Sync bigOneInput with fetched bigOne
  useEffect(() => {
    if (bigOne && !bigOneInput) {
      setBigOneInput(bigOne);
    }
  }, [bigOne]);

  const handleBigOneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setBigOneInput(e.target.value);
  };

  const handleBigOneBlur = () => {
    if (bigOneInput.trim() && bigOneInput !== bigOne) {
      setBigOne(bigOneInput);
    }
  };

  const handleAddTask = async () => {
    if (newTaskTitle.trim()) {
      await addTask(newTaskTitle);
      setNewTaskTitle('');
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleAddTask();
    }
  };

  const isLoading = tasksLoading || bigOneLoading;

  if (isLoading) {
    return (
      <Card className={cn(
        "backdrop-blur-sm",
        isDark ? "bg-card/50 border-border/50" : "bg-card/80 border-border"
      )}>
        <CardContent className="p-8 text-center">
          <div className="animate-spin w-8 h-8 border-2 border-primary border-t-transparent rounded-full mx-auto" />
        </CardContent>
      </Card>
    );
  }

  const completedCount = tasks.filter(t => t.completed).length;
  const allCompleted = completedCount === tasks.length && tasks.length > 0;

  return (
    <Card className={cn(
      "backdrop-blur-sm transition-colors",
      isDark ? "bg-card/50 border-border/50" : "bg-card/80 border-border"
    )}>
      <CardHeader className="text-center">
        <div className={cn(
          "mx-auto p-3 rounded-full w-fit mb-2",
          isDark ? "bg-amber-500/20" : "bg-amber-100"
        )}>
          <ListTodo className="h-8 w-8 text-amber-500" />
        </div>
        <CardTitle className="text-foreground text-xl">Sarcinile de Azi</CardTitle>
        <p className="text-muted-foreground text-sm">
          Setează prioritatea principală și verifică sarcinile
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Big One - Editable */}
        <div className={cn(
          "p-4 rounded-lg border",
          isDark 
            ? "bg-amber-500/10 border-amber-500/30" 
            : "bg-amber-50 border-amber-200"
        )}>
          <div className="flex items-center gap-2 mb-2">
            <Target className="h-4 w-4 text-amber-500" />
            <span className="text-xs font-medium text-amber-600 dark:text-amber-500">BIG ONE TODAY</span>
            {isSaving && (
              <span className="text-xs text-amber-500/60 ml-auto">Se salvează...</span>
            )}
          </div>
          <Input
            value={bigOneInput}
            onChange={handleBigOneChange}
            onBlur={handleBigOneBlur}
            placeholder="Care este prioritatea ta nr. 1 pentru azi?"
            className={cn(
              "font-medium border",
              isDark 
                ? "bg-amber-500/5 border-amber-500/20 text-foreground placeholder:text-amber-300/40" 
                : "bg-white border-amber-200 text-foreground placeholder:text-amber-400/60"
            )}
          />
        </div>

        {/* Progress */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Progres</span>
            <span className="text-foreground">{completedCount}/{tasks.length}</span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>

        {/* Tasks List */}
        <div className="space-y-2 max-h-64 overflow-y-auto">
          {tasks.length === 0 ? (
            <p className="text-muted-foreground text-center py-4">
              Nu ai sarcini pentru azi. Adaugă una mai jos!
            </p>
          ) : (
            tasks.map(task => (
              <div
                key={task.id}
                className={cn(
                  "flex items-center gap-3 p-3 rounded-lg transition-all group border",
                  task.completed 
                    ? isDark 
                      ? "bg-green-500/10 border-green-500/20" 
                      : "bg-green-50 border-green-200"
                    : isDark 
                      ? "bg-card/50 border-border/50 hover:bg-card/80" 
                      : "bg-card border-border hover:bg-muted/50"
                )}
              >
                <Checkbox 
                  checked={task.completed}
                  onCheckedChange={() => toggleTask(task.id)}
                  className="data-[state=checked]:bg-green-500 data-[state=checked]:border-green-500"
                />
                <span className={cn(
                  "flex-1 text-sm",
                  task.completed 
                    ? "text-muted-foreground line-through" 
                    : "text-foreground"
                )}>
                  {task.title}
                </span>
                <button
                  onClick={() => deleteTask(task.id)}
                  className="opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:bg-destructive/20 rounded"
                >
                  <Trash2 className="h-4 w-4 text-destructive" />
                </button>
              </div>
            ))
          )}
        </div>

        {/* Add Task */}
        <div className="flex gap-2">
          <Input
            value={newTaskTitle}
            onChange={(e) => setNewTaskTitle(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Adaugă un task nou..."
            className={cn(
              isDark 
                ? "bg-card/50 border-border text-foreground placeholder:text-muted-foreground" 
                : "bg-card border-border text-foreground placeholder:text-muted-foreground"
            )}
          />
          <Button 
            onClick={handleAddTask}
            size="icon"
            variant="outline"
            className="border-border hover:bg-muted"
          >
            <Plus className="h-4 w-4" />
          </Button>
        </div>

        <Button 
          onClick={onNext}
          className={cn(
            "w-full mt-4",
            allCompleted 
              ? "bg-green-500 hover:bg-green-600" 
              : "bg-primary hover:bg-primary/90"
          )}
        >
          {allCompleted ? (
            <>
              <Check className="h-4 w-4 mr-2" />
              Excelent! Finalizează
            </>
          ) : (
            <>
              Continuă
              <ArrowRight className="h-4 w-4 ml-2" />
            </>
          )}
        </Button>
      </CardContent>
    </Card>
  );
};
