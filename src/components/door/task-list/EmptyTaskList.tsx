import React, { useState } from 'react';
import { useLanguage } from '@/context/LanguageContext';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Plus, Loader2, Target } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { v4 as uuidv4 } from 'uuid';
import { toast } from '@/hooks/use-toast';
import { DayOfWeek } from '@/types/door';

interface EmptyTaskListProps {
  activeList: 'hit' | 'do';
  isMobile?: boolean;
  onTasksAdded?: () => void;
  weekKey: string;
  activeDay: DayOfWeek;
}

export const EmptyTaskList: React.FC<EmptyTaskListProps> = ({
  activeList,
  isMobile = false,
  onTasksAdded,
  weekKey,
  activeDay
}) => {
  const { t, language } = useLanguage();
  const [priorities, setPriorities] = useState<string[]>(['', '', '', '']);
  const [isAdding, setIsAdding] = useState(false);
  const [showInputs, setShowInputs] = useState(false);

  const handlePriorityChange = (index: number, value: string) => {
    const newPriorities = [...priorities];
    newPriorities[index] = value;
    setPriorities(newPriorities);
  };

  const handleAddPriorities = async () => {
    const validPriorities = priorities.filter(p => p.trim());
    if (validPriorities.length === 0) return;

    // Validare week key înainte de insert
    if (!weekKey || weekKey.trim() === '') {
      console.error('❌ Cannot add tasks: weekKey is empty!', { weekKey, activeDay });
      toast({
        title: language === 'en' ? 'Loading...' : 'Se încarcă...',
        description: language === 'en' 
          ? 'Week data is loading. Please wait a moment and try again.' 
          : 'Datele săptămânii se încarcă. Te rog așteaptă un moment.',
        variant: 'destructive'
      });
      return;
    }

    console.log('✅ Adding priorities to:', { weekKey, activeDay });
    setIsAdding(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast({
          title: language === 'en' ? 'Please log in' : 'Te rog să te autentifici',
          variant: 'destructive'
        });
        return;
      }

      // Priority levels: 3 = urgent-important, 2 = important, 1 = urgent, 0 = none
      const tasksToInsert = validPriorities.map((title, index) => ({
        id: uuidv4(),
        user_id: user.id,
        title: title.trim(),
        task_type: activeList,
        list_type: activeList,
        week_key: weekKey,
        day_of_week: activeDay,
        completed: false,
        position: index,
        priority: index === 0 ? 3 : index === 1 ? 2 : index === 2 ? 1 : 0
      }));

      const { error } = await supabase
        .from('user_tasks')
        .insert(tasksToInsert);

      if (error) throw error;

      toast({
        title: language === 'en' ? 'Priorities added!' : 'Priorități adăugate!',
        description: language === 'en' 
          ? `${validPriorities.length} tasks added for today` 
          : `${validPriorities.length} sarcini adăugate pentru azi`
      });

      setPriorities(['', '', '', '']);
      setShowInputs(false);
      await onTasksAdded?.();
    } catch (error: any) {
      console.error('Error adding priorities:', error);
      toast({
        title: language === 'en' ? 'Error' : 'Eroare',
        description: language === 'en' ? 'Could not add tasks' : 'Nu s-au putut adăuga sarcinile',
        variant: 'destructive'
      });
    } finally {
      setIsAdding(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent, index: number) => {
    if (e.key === 'Enter') {
      if (index < 3) {
        // Focus next input
        const nextInput = document.getElementById(`priority-input-${index + 1}`);
        nextInput?.focus();
      } else {
        // Submit on last input
        handleAddPriorities();
      }
    }
  };

  const hasAnyPriority = priorities.some(p => p.trim());

  if (!showInputs) {
    return (
      <div className={`text-center ${isMobile ? 'py-6' : 'py-4'}`}>
        <div className="flex flex-col items-center gap-3">
          <Target className="h-8 w-8 text-muted-foreground/50" />
          <p className={`text-muted-foreground ${isMobile ? 'text-sm' : ''}`}>
            {activeList === 'hit' 
              ? t('noTasksForDay')
              : t('noDoItemsForDay')
            }
          </p>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowInputs(true)}
            className="gap-2"
          >
            <Plus className="h-4 w-4" />
            {language === 'en' ? 'Add Top 4 Priorities' : 'Adaugă Top 4 Priorități'}
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className={`${isMobile ? 'py-4' : 'py-3'}`}>
      <div className="flex items-center gap-2 mb-3">
        <Target className="h-5 w-5 text-amber-500" />
        <h4 className="font-medium text-sm">
          {language === 'en' ? 'Top 4 Priorities for Today' : 'Top 4 Priorități pentru Azi'}
        </h4>
      </div>

      <div className="space-y-2">
        {priorities.map((priority, index) => (
          <div key={index} className="flex items-center gap-2">
            <span className={`
              w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold
              ${index === 0 ? 'bg-red-500/20 text-red-400' : 
                index === 1 ? 'bg-orange-500/20 text-orange-400' : 
                index === 2 ? 'bg-yellow-500/20 text-yellow-400' : 
                'bg-muted text-muted-foreground'}
            `}>
              {index + 1}
            </span>
            <Input
              id={`priority-input-${index}`}
              value={priority}
              onChange={(e) => handlePriorityChange(index, e.target.value)}
              onKeyDown={(e) => handleKeyDown(e, index)}
              placeholder={language === 'en' 
                ? `Priority ${index + 1}...` 
                : `Prioritatea ${index + 1}...`}
              className="flex-1 h-9 text-sm"
              disabled={isAdding}
            />
          </div>
        ))}
      </div>

      <div className="flex gap-2 mt-3">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => {
            setShowInputs(false);
            setPriorities(['', '', '', '']);
          }}
          disabled={isAdding}
        >
          {language === 'en' ? 'Cancel' : 'Anulează'}
        </Button>
        <Button
          size="sm"
          onClick={handleAddPriorities}
          disabled={!hasAnyPriority || isAdding || !weekKey}
          className="gap-2"
        >
          {isAdding ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Plus className="h-4 w-4" />
          )}
          {language === 'en' ? 'Add' : 'Adaugă'}
        </Button>
      </div>
    </div>
  );
};
