import { useDailyHabits } from '@/hooks/useDailyHabits';
import { useLanguage } from '@/context/LanguageContext';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Skeleton } from '@/components/ui/skeleton';

interface HabitSettingsPanelProps {
  habitSteps: string[];
  onHabitStepsChange: (steps: string[]) => void;
}

const CATEGORY_COLORS: Record<string, string> = {
  body: 'border-l-orange-500',
  being: 'border-l-purple-500',
  business: 'border-l-blue-500',
  balance: 'border-l-pink-500',
};

export function HabitSettingsPanel({ 
  habitSteps, 
  onHabitStepsChange 
}: HabitSettingsPanelProps) {
  const { language } = useLanguage();
  const { habits, isLoading } = useDailyHabits();

  const toggleHabit = (habitId: string) => {
    if (habitSteps.includes(habitId)) {
      onHabitStepsChange(habitSteps.filter(id => id !== habitId));
    } else {
      onHabitStepsChange([...habitSteps, habitId]);
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-2">
        {[1, 2, 3, 4].map(i => (
          <Skeleton key={i} className="h-12 w-full" />
        ))}
      </div>
    );
  }

  const activeHabits = habits.filter(h => h.is_active);
  
  // Group habits by category
  const groupedHabits = activeHabits.reduce((acc, habit) => {
    if (!acc[habit.category]) {
      acc[habit.category] = [];
    }
    acc[habit.category].push(habit);
    return acc;
  }, {} as Record<string, typeof habits>);

  const categoryLabels: Record<string, { ro: string; en: string }> = {
    body: { ro: 'Body', en: 'Body' },
    being: { ro: 'Being', en: 'Being' },
    balance: { ro: 'Balance', en: 'Balance' },
    business: { ro: 'Business', en: 'Business' },
  };

  return (
    <div className="space-y-4">
      {Object.entries(groupedHabits).map(([category, categoryHabits]) => (
        <div key={category} className="space-y-2">
          <h4 className="text-sm font-medium text-muted-foreground">
            {language === 'ro' 
              ? categoryLabels[category]?.ro 
              : categoryLabels[category]?.en}
          </h4>
          <div className="space-y-1">
            {categoryHabits.map(habit => (
              <div
                key={habit.id}
                className={`flex items-center gap-3 p-3 rounded-lg border-l-4 bg-muted/30 ${CATEGORY_COLORS[habit.category]}`}
              >
                <Checkbox
                  id={`habit-${habit.id}`}
                  checked={habitSteps.includes(habit.id)}
                  onCheckedChange={() => toggleHabit(habit.id)}
                />
                <Label 
                  htmlFor={`habit-${habit.id}`}
                  className="flex-1 cursor-pointer"
                >
                  {habit.name}
                </Label>
              </div>
            ))}
          </div>
        </div>
      ))}
      
      {activeHabits.length === 0 && (
        <p className="text-sm text-muted-foreground text-center py-4">
          {language === 'ro' 
            ? 'Nu ai habits active. Adaugă-le din Dashboard.'
            : 'No active habits. Add them from Dashboard.'}
        </p>
      )}
    </div>
  );
}
