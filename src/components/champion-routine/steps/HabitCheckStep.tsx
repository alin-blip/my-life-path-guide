import React, { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { useDailyHabits, HabitCategory } from '@/hooks/useDailyHabits';
import { useChampionRoutine } from '@/hooks/useChampionRoutine';
import { Check, ArrowRight, Dumbbell, Heart, Users, Briefcase, Lock } from 'lucide-react';

interface HabitCheckStepProps {
  category: HabitCategory;
  onNext: () => void;
}

const CATEGORY_CONFIG: Record<HabitCategory, { title: string; icon: React.ElementType; color: string }> = {
  body: { title: 'Corp', icon: Dumbbell, color: 'text-red-500' },
  being: { title: 'Spirit', icon: Heart, color: 'text-purple-500' },
  balance: { title: 'Relații', icon: Users, color: 'text-green-500' },
  business: { title: 'Business', icon: Briefcase, color: 'text-blue-500' }
};

export const HabitCheckStep: React.FC<HabitCheckStepProps> = ({ category, onNext }) => {
  const { habits, toggleHabit, isHabitCompleted, isLoading } = useDailyHabits();
  const { settings, todayLog, people } = useChampionRoutine();
  
  // Core 4 completed items to show as read-only checkmarks
  const core4CompletedItems = useMemo(() => {
    const items: { name: string; completed: boolean }[] = [];
    
    if (category === 'being') {
      // Meditation - check if completed in routine (5+ minutes)
      const meditationDone = (todayLog?.meditation_duration_seconds || 0) >= 300;
      if (meditationDone) {
        items.push({ name: 'Meditație (din rutină)', completed: true });
      }
      
      // Journaling - check if completed in routine  
      if (todayLog?.journaling_completed) {
        items.push({ name: 'Jurnal / Memoirs (din rutină)', completed: true });
      }
      
      // Breathing
      if (todayLog?.breathing_completed) {
        items.push({ name: 'Respirație (din rutină)', completed: true });
      }
      
      // Visualization
      if (todayLog?.visualization_completed) {
        items.push({ name: 'Vizualizare (din rutină)', completed: true });
      }
    }
    
    if (category === 'body') {
      // Exercise
      if (todayLog?.exercise_completed) {
        items.push({ name: 'Exerciții (din rutină)', completed: true });
      }
      
      // Hydration
      if (todayLog?.water_drunk) {
        items.push({ name: 'Hidratare (din rutină)', completed: true });
      }
    }
    
    if (category === 'balance') {
      // Relationship actions - show people who have completed actions
      const relationshipActions = todayLog?.relationship_actions || [];
      relationshipActions.forEach((action: any) => {
        if (action.completed && action.personName) {
          items.push({ name: `${action.personName} (din rutină)`, completed: true });
        }
      });
    }
    
    return items;
  }, [category, todayLog]);
  
  // Core habit names that are always excluded (handled by routine steps)
  const CORE_HABIT_NAMES = [
    'fitness', 'workout', 'exercise',
    'meditation', 'meditație',
    'jurnal', 'memoirs', 'journal',
    'breathing', 'respirație',
    'visualization', 'vizualizare',
    'reading', 'citit',
    'învață', 'learn', 'discover',
    'aplică', 'apply', 'declare'
  ];
  
  // Get names to exclude based on active routine steps and completions
  const excludedHabitNames = useMemo(() => {
    const excluded: string[] = [...CORE_HABIT_NAMES];
    const activeSteps = settings?.active_steps || [];
    
    // If exercise step was completed today, ensure fitness is excluded
    if (todayLog?.exercise_completed) {
      excluded.push('fitness', 'workout');
    }
    
    // If relationships step is active, exclude people names from champion_routine_people
    if (activeSteps.includes('relationships') && people.length > 0) {
      people.forEach(p => excluded.push(p.name.toLowerCase()));
    }
    
    // Also exclude Person 1, Person 2 placeholders
    excluded.push('person 1', 'person 2', 'persoana 1', 'persoana 2');
    
    return excluded;
  }, [settings?.active_steps, todayLog?.exercise_completed, people]);
  
  // Filter habits: category match, active, and NOT in excluded list
  const categoryHabits = useMemo(() => {
    return habits.filter(h => {
      if (h.category !== category || h.is_active === false) return false;
      
      const habitNameLower = h.name.toLowerCase();
      // Check if habit name matches any excluded name
      return !excludedHabitNames.some(excluded => 
        habitNameLower.includes(excluded) || excluded.includes(habitNameLower)
      );
    });
  }, [habits, category, excludedHabitNames]);
  
  const config = CATEGORY_CONFIG[category];
  const Icon = config.icon;
  
  const completedCount = categoryHabits.filter(h => isHabitCompleted(h.id)).length;
  const allCompleted = completedCount === categoryHabits.length && categoryHabits.length > 0;

  if (isLoading) {
    return (
      <Card className="bg-card border-border backdrop-blur-sm">
        <CardContent className="p-8 text-center">
          <div className="animate-spin w-8 h-8 border-2 border-primary border-t-transparent rounded-full mx-auto" />
        </CardContent>
      </Card>
    );
  }

  if (categoryHabits.length === 0) {
    return (
      <Card className="bg-card border-border backdrop-blur-sm">
        <CardHeader className="text-center">
          <div className={`mx-auto p-3 rounded-full bg-muted w-fit mb-2`}>
            <Icon className={`h-8 w-8 ${config.color}`} />
          </div>
          <CardTitle className="text-foreground text-xl">Habits: {config.title}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <p className="text-muted-foreground text-center">
            Nu ai habits configurate pentru această categorie.
          </p>
          <Button 
            onClick={onNext}
            className="w-full bg-primary hover:bg-primary/90"
          >
            Continuă
            <ArrowRight className="h-4 w-4 ml-2" />
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-card border-border backdrop-blur-sm">
      <CardHeader className="text-center">
        <div className={`mx-auto p-3 rounded-full bg-muted w-fit mb-2`}>
          <Icon className={`h-8 w-8 ${config.color}`} />
        </div>
        <CardTitle className="text-foreground text-xl">Habits: {config.title}</CardTitle>
        <p className="text-muted-foreground text-sm">
          {completedCount}/{categoryHabits.length} completate
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Core 4 items completed in routine - show as read-only */}
        {core4CompletedItems.length > 0 && (
          <div className="space-y-2 pb-3 border-b border-border">
            <p className="text-xs text-muted-foreground font-medium uppercase tracking-wide">
              Completate în rutină
            </p>
            {core4CompletedItems.map((item, idx) => (
              <div
                key={`core4-${idx}`}
                className="flex items-center gap-3 p-3 rounded-lg bg-green-500/10 border border-green-500/20"
              >
                <div className="w-5 h-5 rounded border-2 border-green-500 bg-green-500 flex items-center justify-center">
                  <Check className="h-3 w-3 text-white" />
                </div>
                <span className="flex-1 text-muted-foreground text-sm">
                  {item.name}
                </span>
                <Lock className="h-4 w-4 text-muted-foreground/50" />
              </div>
            ))}
          </div>
        )}
        
        {/* Regular habits for this category */}
        {categoryHabits.map(habit => {
          const completed = isHabitCompleted(habit.id);
          return (
            <div
              key={habit.id}
              onClick={() => toggleHabit(habit.id)}
              className={`
                flex items-center gap-3 p-4 rounded-lg cursor-pointer transition-all
                ${completed 
                  ? 'bg-green-500/20 border border-green-500/30' 
                  : 'bg-muted/50 border border-border hover:bg-muted'
                }
              `}
            >
              <Checkbox 
                checked={completed}
                className="data-[state=checked]:bg-green-500 data-[state=checked]:border-green-500"
              />
              <span className={`flex-1 ${completed ? 'text-muted-foreground line-through' : 'text-foreground'}`}>
                {habit.name}
              </span>
              {completed && <Check className="h-5 w-5 text-green-500" />}
            </div>
          );
        })}

        <Button 
          onClick={onNext}
          className={`w-full mt-6 ${allCompleted ? 'bg-green-500 hover:bg-green-600' : 'bg-primary hover:bg-primary/90'}`}
        >
          {allCompleted ? (
            <>
              <Check className="h-4 w-4 mr-2" />
              Toate completate! Continuă
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
