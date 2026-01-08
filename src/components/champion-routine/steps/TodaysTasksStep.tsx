import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { useTodaysTasks } from '@/hooks/useTodaysTasks';
import { Check, ArrowRight, ListTodo, Plus, Trash2, Star } from 'lucide-react';
import { Progress } from '@/components/ui/progress';

interface TodaysTasksStepProps {
  onNext: () => void;
}

export const TodaysTasksStep: React.FC<TodaysTasksStepProps> = ({ onNext }) => {
  const { tasks, bigOne, isLoading, toggleTask, addTask, deleteTask, progress } = useTodaysTasks();
  const [newTaskTitle, setNewTaskTitle] = useState('');

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

  if (isLoading) {
    return (
      <Card className="bg-white/5 border-white/10 backdrop-blur-sm">
        <CardContent className="p-8 text-center">
          <div className="animate-spin w-8 h-8 border-2 border-primary border-t-transparent rounded-full mx-auto" />
        </CardContent>
      </Card>
    );
  }

  const completedCount = tasks.filter(t => t.completed).length;
  const allCompleted = completedCount === tasks.length && tasks.length > 0;

  return (
    <Card className="bg-white/5 border-white/10 backdrop-blur-sm">
      <CardHeader className="text-center">
        <div className="mx-auto p-3 rounded-full bg-white/10 w-fit mb-2">
          <ListTodo className="h-8 w-8 text-amber-500" />
        </div>
        <CardTitle className="text-white text-xl">Sarcinile de Azi</CardTitle>
        <p className="text-white/60 text-sm">
          Verifică și completează sarcinile importante
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Big One */}
        {bigOne && (
          <div className="p-4 rounded-lg bg-amber-500/10 border border-amber-500/30">
            <div className="flex items-center gap-2 mb-1">
              <Star className="h-4 w-4 text-amber-500" />
              <span className="text-xs font-medium text-amber-500">BIG ONE</span>
            </div>
            <p className="text-white font-medium">{bigOne}</p>
          </div>
        )}

        {/* Progress */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-white/60">Progres</span>
            <span className="text-white">{completedCount}/{tasks.length}</span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>

        {/* Tasks List */}
        <div className="space-y-2 max-h-64 overflow-y-auto">
          {tasks.length === 0 ? (
            <p className="text-white/40 text-center py-4">
              Nu ai sarcini pentru azi. Adaugă una mai jos!
            </p>
          ) : (
            tasks.map(task => (
              <div
                key={task.id}
                className={`
                  flex items-center gap-3 p-3 rounded-lg transition-all group
                  ${task.completed 
                    ? 'bg-green-500/10 border border-green-500/20' 
                    : 'bg-white/5 border border-white/10 hover:bg-white/10'
                  }
                `}
              >
                <Checkbox 
                  checked={task.completed}
                  onCheckedChange={() => toggleTask(task.id)}
                  className="data-[state=checked]:bg-green-500 data-[state=checked]:border-green-500"
                />
                <span className={`flex-1 text-sm ${task.completed ? 'text-white/40 line-through' : 'text-white'}`}>
                  {task.title}
                </span>
                <button
                  onClick={() => deleteTask(task.id)}
                  className="opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:bg-red-500/20 rounded"
                >
                  <Trash2 className="h-4 w-4 text-red-400" />
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
            className="bg-white/5 border-white/20 text-white placeholder:text-white/40"
          />
          <Button 
            onClick={handleAddTask}
            size="icon"
            variant="outline"
            className="border-white/20 hover:bg-white/10"
          >
            <Plus className="h-4 w-4" />
          </Button>
        </div>

        <Button 
          onClick={onNext}
          className={`w-full mt-4 ${allCompleted ? 'bg-green-500 hover:bg-green-600' : 'bg-primary hover:bg-primary/90'}`}
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
