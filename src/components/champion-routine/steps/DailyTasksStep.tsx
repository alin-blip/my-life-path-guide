import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Target, Plus, ArrowRight, Trash2, Star } from 'lucide-react';

interface Todo {
  id: string;
  text: string;
  completed: boolean;
}

interface DailyTasksStepProps {
  bigOneToday: string;
  todos: Todo[];
  onBigOneChange: (text: string) => void;
  onTodosChange: (todos: Todo[]) => void;
  onNext: () => void;
}

export function DailyTasksStep({
  bigOneToday,
  todos: initialTodos,
  onBigOneChange,
  onTodosChange,
  onNext,
}: DailyTasksStepProps) {
  const [localBigOne, setLocalBigOne] = useState(bigOneToday || '');
  const [todos, setTodos] = useState<Todo[]>(
    initialTodos?.length > 0 
      ? initialTodos 
      : [
          { id: '1', text: '', completed: false },
          { id: '2', text: '', completed: false },
          { id: '3', text: '', completed: false },
        ]
  );
  const [newTodo, setNewTodo] = useState('');

  const handleBigOneChange = (value: string) => {
    setLocalBigOne(value);
    onBigOneChange(value);
  };

  const handleTodoChange = (id: string, text: string) => {
    const updated = todos.map(t => t.id === id ? { ...t, text } : t);
    setTodos(updated);
    onTodosChange(updated);
  };

  const handleTodoToggle = (id: string) => {
    const updated = todos.map(t => t.id === id ? { ...t, completed: !t.completed } : t);
    setTodos(updated);
    onTodosChange(updated);
  };

  const handleAddTodo = () => {
    if (!newTodo.trim()) return;
    const updated = [...todos, { id: Date.now().toString(), text: newTodo.trim(), completed: false }];
    setTodos(updated);
    onTodosChange(updated);
    setNewTodo('');
  };

  const handleRemoveTodo = (id: string) => {
    if (todos.length <= 3) return; // Keep at least 3
    const updated = todos.filter(t => t.id !== id);
    setTodos(updated);
    onTodosChange(updated);
  };

  const completedCount = todos.filter(t => t.completed && t.text.trim()).length;
  const totalCount = todos.filter(t => t.text.trim()).length;

  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center px-4">
      <Card className="w-full max-w-2xl p-8 space-y-6 bg-gradient-to-br from-yellow-500/10 via-amber-500/5 to-transparent border-yellow-500/20">
        {/* Header */}
        <div className="text-center space-y-4">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-yellow-500/20 mb-4">
            <Target className="h-10 w-10 text-yellow-500" />
          </div>
          <h1 className="text-3xl font-bold">Daily Tasks</h1>
          <p className="text-muted-foreground text-lg">
            Care este cel mai important lucru pe care vrei să-l realizezi astăzi?
          </p>
        </div>

        {/* Big One Today */}
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <Star className="h-5 w-5 text-yellow-500" />
            <label className="font-semibold">1 Big One Today</label>
          </div>
          <Input
            placeholder="Ex: Finalizez landing page-ul pentru proiect..."
            value={localBigOne}
            onChange={(e) => handleBigOneChange(e.target.value)}
            className="text-lg py-6 border-yellow-500/30 focus:border-yellow-500"
          />
        </div>

        {/* Top 3 Todos */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <label className="font-semibold">Top To-Dos pentru acest obiectiv</label>
            <span className="text-sm text-muted-foreground">
              {completedCount}/{totalCount} complete
            </span>
          </div>

          <div className="space-y-3">
            {todos.map((todo, index) => (
              <div key={todo.id} className="flex items-center gap-3">
                <Checkbox
                  checked={todo.completed}
                  onCheckedChange={() => handleTodoToggle(todo.id)}
                  disabled={!todo.text.trim()}
                />
                <div className="flex-1 relative">
                  {index < 3 && (
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm font-bold text-muted-foreground">
                      {index + 1}.
                    </span>
                  )}
                  <Input
                    placeholder={`Task ${index + 1}...`}
                    value={todo.text}
                    onChange={(e) => handleTodoChange(todo.id, e.target.value)}
                    className={`${index < 3 ? 'pl-8' : ''} ${todo.completed ? 'line-through text-muted-foreground' : ''}`}
                  />
                </div>
                {index >= 3 && (
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleRemoveTodo(todo.id)}
                  >
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                )}
              </div>
            ))}
          </div>

          {/* Add more */}
          <div className="flex gap-2">
            <Input
              placeholder="Adaugă un task suplimentar..."
              value={newTodo}
              onChange={(e) => setNewTodo(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleAddTodo()}
            />
            <Button 
              variant="outline" 
              onClick={handleAddTodo}
              disabled={!newTodo.trim()}
            >
              <Plus className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Progress */}
        {totalCount > 0 && (
          <div className="space-y-2">
            <div className="h-2 bg-muted/30 rounded-full overflow-hidden">
              <div 
                className="h-full bg-green-500 transition-all"
                style={{ width: `${(completedCount / totalCount) * 100}%` }}
              />
            </div>
            <p className="text-center text-sm text-muted-foreground">
              {completedCount === totalCount && totalCount > 0 
                ? '🎉 Toate task-urile completate!' 
                : `${completedCount} din ${totalCount} completate`
              }
            </p>
          </div>
        )}

        <Button 
          onClick={onNext}
          size="lg"
          className="w-full gap-2"
        >
          Continuă
          <ArrowRight className="h-5 w-5" />
        </Button>
      </Card>
    </div>
  );
}
