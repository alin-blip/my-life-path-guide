import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { useDailyHabits, HabitCategory } from '@/hooks/useDailyHabits';
import { Check, ArrowRight, Dumbbell, Heart, Users, Briefcase } from 'lucide-react';

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
  
  const categoryHabits = habits.filter(h => h.category === category && h.is_active !== false);
  const config = CATEGORY_CONFIG[category];
  const Icon = config.icon;
  
  const completedCount = categoryHabits.filter(h => isHabitCompleted(h.id)).length;
  const allCompleted = completedCount === categoryHabits.length && categoryHabits.length > 0;

  if (isLoading) {
    return (
      <Card className="bg-white/5 border-white/10 backdrop-blur-sm">
        <CardContent className="p-8 text-center">
          <div className="animate-spin w-8 h-8 border-2 border-primary border-t-transparent rounded-full mx-auto" />
        </CardContent>
      </Card>
    );
  }

  if (categoryHabits.length === 0) {
    return (
      <Card className="bg-white/5 border-white/10 backdrop-blur-sm">
        <CardHeader className="text-center">
          <div className={`mx-auto p-3 rounded-full bg-white/10 w-fit mb-2`}>
            <Icon className={`h-8 w-8 ${config.color}`} />
          </div>
          <CardTitle className="text-white text-xl">Habits: {config.title}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <p className="text-white/60 text-center">
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
    <Card className="bg-white/5 border-white/10 backdrop-blur-sm">
      <CardHeader className="text-center">
        <div className={`mx-auto p-3 rounded-full bg-white/10 w-fit mb-2`}>
          <Icon className={`h-8 w-8 ${config.color}`} />
        </div>
        <CardTitle className="text-white text-xl">Habits: {config.title}</CardTitle>
        <p className="text-white/60 text-sm">
          {completedCount}/{categoryHabits.length} completate
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
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
                  : 'bg-white/5 border border-white/10 hover:bg-white/10'
                }
              `}
            >
              <Checkbox 
                checked={completed}
                className="data-[state=checked]:bg-green-500 data-[state=checked]:border-green-500"
              />
              <span className={`flex-1 ${completed ? 'text-white/60 line-through' : 'text-white'}`}>
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
