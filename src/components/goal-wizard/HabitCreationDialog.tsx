import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { 
  Dumbbell, 
  Brain, 
  Heart, 
  Plus, 
  X, 
  Sparkles,
  Loader2
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

type Category = 'body' | 'being' | 'balance';

interface HabitCreationDialogProps {
  isOpen: boolean;
  onClose: () => void;
  category: Category;
  monthlyGoal: string;
  missionId?: string;
  language: 'en' | 'ro';
  onComplete?: () => void;
}

const CATEGORY_CONFIG: Record<Category, { 
  icon: React.ElementType; 
  color: string; 
  suggestions: { en: string[]; ro: string[] } 
}> = {
  body: {
    icon: Dumbbell,
    color: 'text-emerald-500',
    suggestions: {
      en: ['30 min exercise', '10,000 steps', 'Stretching 10 min', 'Drink 2L water'],
      ro: ['30 min mișcare', '10.000 pași', 'Stretching 10 min', 'Beau 2L apă']
    }
  },
  being: {
    icon: Brain,
    color: 'text-purple-500',
    suggestions: {
      en: ['15 min meditation', 'Evening journal', 'Read 20 pages', 'Gratitude practice'],
      ro: ['15 min meditație', 'Jurnal seara', 'Citesc 20 pagini', 'Practică recunoștință']
    }
  },
  balance: {
    icon: Heart,
    color: 'text-rose-500',
    suggestions: {
      en: ['Call family member', 'Quality time with kids', 'Date night planning', 'Message a friend'],
      ro: ['Sun familia', 'Timp calitate cu copiii', 'Planific seară romantică', 'Scriu unui prieten']
    }
  }
};

const HABIT_ICONS: Record<Category, string> = {
  body: 'dumbbell',
  being: 'brain',
  balance: 'heart'
};

export const HabitCreationDialog: React.FC<HabitCreationDialogProps> = ({
  isOpen,
  onClose,
  category,
  monthlyGoal,
  missionId,
  language,
  onComplete
}) => {
  const [selectedHabits, setSelectedHabits] = useState<string[]>([]);
  const [customHabit, setCustomHabit] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  const config = CATEGORY_CONFIG[category];
  const CategoryIcon = config.icon;
  const suggestions = config.suggestions[language];

  const toggleHabit = (habit: string) => {
    setSelectedHabits(prev => 
      prev.includes(habit) 
        ? prev.filter(h => h !== habit)
        : [...prev, habit]
    );
  };

  const addCustomHabit = () => {
    if (customHabit.trim() && !selectedHabits.includes(customHabit.trim())) {
      setSelectedHabits(prev => [...prev, customHabit.trim()]);
      setCustomHabit('');
    }
  };

  const removeHabit = (habit: string) => {
    setSelectedHabits(prev => prev.filter(h => h !== habit));
  };

  const handleSave = async () => {
    if (selectedHabits.length === 0) {
      toast.error(language === 'en' ? 'Select at least one habit' : 'Selectează cel puțin un habit');
      return;
    }

    setIsSaving(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      // Get max position for this user
      const { data: existingHabits } = await supabase
        .from('daily_habits')
        .select('position')
        .eq('user_id', user.id)
        .order('position', { ascending: false })
        .limit(1);

      const startPosition = existingHabits?.[0]?.position ?? 0;

      // Insert habits
      const habitsToInsert = selectedHabits.map((name, idx) => ({
        user_id: user.id,
        name,
        category,
        habit_group: 'custom' as const,
        icon: HABIT_ICONS[category],
        is_active: true,
        position: startPosition + idx + 1,
        source_mission_id: missionId || null,
        sync_to_routine: true
      }));

      const { error } = await supabase
        .from('daily_habits')
        .insert(habitsToInsert);

      if (error) throw error;

      toast.success(
        language === 'en' 
          ? `${selectedHabits.length} habit(s) added!` 
          : `${selectedHabits.length} habit(uri) adăugate!`
      );

      setSelectedHabits([]);
      onComplete?.();
      onClose();
    } catch (error) {
      console.error('Error saving habits:', error);
      toast.error(language === 'en' ? 'Failed to save habits' : 'Nu s-au putut salva habit-urile');
    } finally {
      setIsSaving(false);
    }
  };

  const handleSkip = () => {
    onComplete?.();
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <CategoryIcon className={`h-5 w-5 ${config.color}`} />
            {language === 'en' ? 'Create Daily Habits' : 'Creează Habit-uri Zilnice'}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Context */}
          <div className="bg-muted/50 rounded-lg p-3 text-sm">
            <p className="text-muted-foreground">
              {language === 'en' 
                ? 'Transform your monthly goal into daily habits:' 
                : 'Transformă obiectivul lunar în habit-uri zilnice:'}
            </p>
            <p className="font-medium mt-1">"{monthlyGoal}"</p>
          </div>

          {/* Suggestions */}
          <div>
            <Label className="text-xs text-muted-foreground mb-2 block">
              {language === 'en' ? 'Suggested habits' : 'Habit-uri sugerate'}
            </Label>
            <div className="flex flex-wrap gap-2">
              {suggestions.map((habit) => (
                <button
                  key={habit}
                  onClick={() => toggleHabit(habit)}
                  className={`
                    px-3 py-1.5 rounded-full text-sm transition-all
                    ${selectedHabits.includes(habit)
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-muted hover:bg-muted/80 text-muted-foreground'
                    }
                  `}
                >
                  {habit}
                </button>
              ))}
            </div>
          </div>

          {/* Selected habits */}
          {selectedHabits.length > 0 && (
            <div>
              <Label className="text-xs text-muted-foreground mb-2 block">
                {language === 'en' ? 'Selected' : 'Selectate'} ({selectedHabits.length})
              </Label>
              <div className="flex flex-wrap gap-2">
                {selectedHabits.map((habit) => (
                  <span
                    key={habit}
                    className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full bg-primary/10 text-primary text-sm"
                  >
                    {habit}
                    <button onClick={() => removeHabit(habit)} className="hover:text-destructive">
                      <X className="h-3 w-3" />
                    </button>
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Custom habit input */}
          <div className="flex gap-2">
            <Input
              value={customHabit}
              onChange={(e) => setCustomHabit(e.target.value)}
              placeholder={language === 'en' ? 'Add custom habit...' : 'Adaugă habit personalizat...'}
              onKeyDown={(e) => e.key === 'Enter' && addCustomHabit()}
            />
            <Button variant="outline" size="icon" onClick={addCustomHabit}>
              <Plus className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <DialogFooter className="flex-col sm:flex-row gap-2">
          <Button variant="ghost" onClick={handleSkip}>
            {language === 'en' ? 'Skip' : 'Sari'}
          </Button>
          <Button onClick={handleSave} disabled={isSaving || selectedHabits.length === 0}>
            {isSaving ? (
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
            ) : (
              <Sparkles className="h-4 w-4 mr-2" />
            )}
            {language === 'en' 
              ? `Add ${selectedHabits.length} Habit${selectedHabits.length !== 1 ? 's' : ''}` 
              : `Adaugă ${selectedHabits.length} Habit${selectedHabits.length !== 1 ? '-uri' : ''}`}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
