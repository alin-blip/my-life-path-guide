import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Plus, ListTodo, Target } from 'lucide-react';
import { useChampionRoutine, Todo } from '@/hooks/useChampionRoutine';
import { useToast } from '@/hooks/use-toast';

interface QuickTaskActionProps {
  onUpdate?: () => void;
}

export function QuickTaskAction({ onUpdate }: QuickTaskActionProps) {
  const [open, setOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [formData, setFormData] = useState({
    bigOne: '',
    todoText: ''
  });
  const { todayLog, updateLog } = useChampionRoutine();
  const { toast } = useToast();

  const handleSaveBigOne = async () => {
    if (!formData.bigOne.trim()) {
      toast({
        title: "Eroare",
        description: "Te rog introdu Big One.",
        variant: "destructive"
      });
      return;
    }

    setIsSaving(true);
    try {
      await updateLog('big_one_today', formData.bigOne.trim());
      
      toast({
        title: "Salvat!",
        description: "Big One a fost setat."
      });

      setFormData(prev => ({ ...prev, bigOne: '' }));
      onUpdate?.();
    } catch (error) {
      console.error('Error saving big one:', error);
      toast({
        title: "Eroare",
        description: "Nu s-a putut salva.",
        variant: "destructive"
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleAddTodo = async () => {
    if (!formData.todoText.trim()) {
      toast({
        title: "Eroare",
        description: "Te rog introdu task-ul.",
        variant: "destructive"
      });
      return;
    }

    setIsSaving(true);
    try {
      const existingTodos = (todayLog?.daily_todos as Todo[]) || [];
      
      const newTodo: Todo = {
        id: Date.now().toString(),
        text: formData.todoText.trim(),
        completed: false
      };

      const updatedTodos = [...existingTodos, newTodo];
      await updateLog('daily_todos', updatedTodos);
      
      toast({
        title: "Salvat!",
        description: "Task adăugat."
      });

      setFormData(prev => ({ ...prev, todoText: '' }));
      onUpdate?.();
    } catch (error) {
      console.error('Error saving todo:', error);
      toast({
        title: "Eroare",
        description: "Nu s-a putut salva.",
        variant: "destructive"
      });
    } finally {
      setIsSaving(false);
    }
  };

  const existingTodos = (todayLog?.daily_todos as Todo[]) || [];
  const completedCount = existingTodos.filter(t => t.completed).length;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="gap-1.5 h-8 text-xs">
          <Plus className="h-3.5 w-3.5" />
          Adaugă
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <ListTodo className="h-5 w-5 text-blue-500" />
            Task-uri Rapide
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Big One Section */}
          <div className="space-y-3 p-4 rounded-lg bg-primary/5 border border-primary/20">
            <div className="flex items-center gap-2">
              <Target className="h-4 w-4 text-primary" />
              <Label className="font-semibold">Big One - Prioritatea #1</Label>
            </div>
            
            {todayLog?.big_one_today ? (
              <div className="p-3 rounded bg-muted/50 text-sm">
                <span className="font-medium">{todayLog.big_one_today}</span>
              </div>
            ) : (
              <div className="space-y-2">
                <Textarea
                  placeholder="Care este cel mai important lucru de făcut azi?"
                  value={formData.bigOne}
                  onChange={(e) => setFormData(prev => ({ ...prev, bigOne: e.target.value }))}
                  className="min-h-[60px]"
                />
                <Button
                  onClick={handleSaveBigOne}
                  disabled={isSaving}
                  size="sm"
                  className="w-full"
                >
                  Setează Big One
                </Button>
              </div>
            )}
          </div>

          {/* Daily Todos Section */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label className="font-semibold">Task-uri Zilnice</Label>
              <span className="text-xs text-muted-foreground">
                {completedCount}/{existingTodos.length} complete
              </span>
            </div>

            {/* Existing todos */}
            {existingTodos.length > 0 && (
              <div className="space-y-1 max-h-32 overflow-y-auto">
                {existingTodos.map(todo => (
                  <div 
                    key={todo.id}
                    className={`text-sm p-2 rounded flex items-center gap-2 ${
                      todo.completed 
                        ? 'bg-green-500/10 text-green-700 line-through' 
                        : 'bg-muted/50'
                    }`}
                  >
                    <span className={`w-2 h-2 rounded-full ${
                      todo.completed ? 'bg-green-500' : 'bg-muted-foreground/30'
                    }`} />
                    {todo.text}
                  </div>
                ))}
              </div>
            )}

            {/* Add new todo */}
            <div className="flex gap-2">
              <Input
                placeholder="Adaugă un task..."
                value={formData.todoText}
                onChange={(e) => setFormData(prev => ({ ...prev, todoText: e.target.value }))}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddTodo();
                  }
                }}
              />
              <Button
                onClick={handleAddTodo}
                disabled={isSaving}
                size="icon"
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
