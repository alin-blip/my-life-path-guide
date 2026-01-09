import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Sparkles, Loader2 } from 'lucide-react';
import { useDailyHabits } from '@/hooks/useDailyHabits';
import { cn } from '@/lib/utils';

interface HabitsData {
  habit_steps: string[];
}

interface HabitsStepProps {
  data: HabitsData;
  onChange: (data: Partial<HabitsData>) => void;
}

const CATEGORY_COLORS: Record<string, string> = {
  health: 'border-l-green-500',
  productivity: 'border-l-blue-500',
  mindfulness: 'border-l-purple-500',
  relationships: 'border-l-pink-500',
  learning: 'border-l-amber-500',
  fitness: 'border-l-red-500',
  default: 'border-l-muted-foreground',
};

export function HabitsStep({ data, onChange }: HabitsStepProps) {
  const { habits, isLoading } = useDailyHabits();
  const [localData, setLocalData] = useState<HabitsData>(data);

  useEffect(() => {
    setLocalData(data);
  }, [data]);

  const activeHabits = habits.filter(h => h.is_active);

  // Group habits by category
  const groupedHabits = activeHabits.reduce((acc, habit) => {
    const category = habit.category || 'default';
    if (!acc[category]) acc[category] = [];
    acc[category].push(habit);
    return acc;
  }, {} as Record<string, typeof activeHabits>);

  const toggleHabit = (habitId: string) => {
    const current = localData.habit_steps || [];
    const updated = current.includes(habitId)
      ? current.filter(h => h !== habitId)
      : [...current, habitId];
    
    const newData = { habit_steps: updated };
    setLocalData(newData);
    onChange(newData);
  };

  const selectAll = () => {
    const allIds = activeHabits.map(h => h.id);
    setLocalData({ habit_steps: allIds });
    onChange({ habit_steps: allIds });
  };

  const deselectAll = () => {
    setLocalData({ habit_steps: [] });
    onChange({ habit_steps: [] });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-12 h-12 rounded-full bg-purple-500/10 flex items-center justify-center">
          <Sparkles className="w-6 h-6 text-purple-500" />
        </div>
        <div>
          <h2 className="text-xl font-semibold">Habits Zilnice</h2>
          <p className="text-muted-foreground text-sm">Selectează habits-urile pe care vrei să le urmărești</p>
        </div>
      </div>

      <div className="flex gap-2 mb-4">
        <button
          onClick={selectAll}
          className="text-sm text-primary hover:underline"
        >
          Selectează tot
        </button>
        <span className="text-muted-foreground">|</span>
        <button
          onClick={deselectAll}
          className="text-sm text-primary hover:underline"
        >
          Deselectează tot
        </button>
        <span className="text-muted-foreground ml-auto">
          {(localData.habit_steps || []).length} / {activeHabits.length} selectate
        </span>
      </div>

      {Object.entries(groupedHabits).length === 0 ? (
        <Card>
          <CardContent className="py-8 text-center">
            <p className="text-muted-foreground">
              Nu ai habits active. Adaugă habits din Dashboard pentru a le configura aici.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {Object.entries(groupedHabits).map(([category, categoryHabits]) => (
            <Card key={category} className={cn("border-l-4", CATEGORY_COLORS[category] || CATEGORY_COLORS.default)}>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm capitalize">{category}</CardTitle>
                <CardDescription className="text-xs">
                  {categoryHabits.length} habits
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-2">
                {categoryHabits.map((habit) => {
                  const isSelected = (localData.habit_steps || []).includes(habit.id);
                  return (
                    <Label
                      key={habit.id}
                      className={cn(
                        "flex items-center gap-3 p-2 rounded-lg cursor-pointer transition-all",
                        isSelected 
                          ? "bg-primary/5" 
                          : "hover:bg-muted/50"
                      )}
                    >
                      <Checkbox
                        checked={isSelected}
                        onCheckedChange={() => toggleHabit(habit.id)}
                      />
                      <span className="text-sm">{habit.icon}</span>
                      <span className={cn(
                        "text-sm",
                        isSelected ? "font-medium" : "text-muted-foreground"
                      )}>
                        {habit.name}
                      </span>
                    </Label>
                  );
                })}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
