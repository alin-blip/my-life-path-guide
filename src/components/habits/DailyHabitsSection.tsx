import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Settings, Plus, Heart, Brain, Scale, Briefcase, Check, Sparkles } from 'lucide-react';
import { useDailyHabits, HabitCategory } from '@/hooks/useDailyHabits';
import { HabitSettingsModal } from './HabitSettingsModal';
import { cn } from '@/lib/utils';
import { Skeleton } from '@/components/ui/skeleton';
import { ROUTINE_STEP_TO_HABIT } from '@/services/habitAutoComplete';

// Names auto-completed by the Warrior Routine (case-insensitive)
const AUTO_NAMES = new Set(
  Object.values(ROUTINE_STEP_TO_HABIT).flat().map(n => n.toLowerCase())
);
const isAutoHabit = (name: string) =>
  Array.from(AUTO_NAMES).some(n => name.toLowerCase() === n || name.toLowerCase().includes(n));

const CATEGORY_CONFIG: Record<HabitCategory, { titleEn: string; titleRo: string; icon: React.ReactNode; bgColor: string; borderColor: string }> = {
  body: { 
    titleEn: 'Body', 
    titleRo: 'Corp',
    icon: <Heart className="h-4 w-4" />, 
    bgColor: 'bg-red-500/10',
    borderColor: 'border-red-500/30'
  },
  being: { 
    titleEn: 'Spirituality', 
    titleRo: 'Spiritualitate',
    icon: <Brain className="h-4 w-4" />, 
    bgColor: 'bg-purple-500/10',
    borderColor: 'border-purple-500/30'
  },
  balance: { 
    titleEn: 'Relationships', 
    titleRo: 'Relații',
    icon: <Scale className="h-4 w-4" />, 
    bgColor: 'bg-blue-500/10',
    borderColor: 'border-blue-500/30'
  },
  business: { 
    titleEn: 'Business', 
    titleRo: 'Business',
    icon: <Briefcase className="h-4 w-4" />, 
    bgColor: 'bg-green-500/10',
    borderColor: 'border-green-500/30'
  },
};

interface DailyHabitsSectionProps {
  date?: Date;
}

export const DailyHabitsSection: React.FC<DailyHabitsSectionProps> = ({ date = new Date() }) => {
  const [showSettings, setShowSettings] = useState(false);
  const {
    habits,
    isLoading,
    toggleHabit,
    isHabitCompleted,
    addHabit,
    updateHabit,
    deleteHabit,
    refetch,
  } = useDailyHabits(date);

  const getHabitsByCategory = (category: HabitCategory) => 
    habits.filter(h => h.category === category && h.is_active);

  const totalCompleted = habits.filter(h => h.is_active && isHabitCompleted(h.id)).length;
  const totalHabits = habits.filter(h => h.is_active).length;
  const totalPercentage = totalHabits > 0 ? (totalCompleted / totalHabits) * 100 : 0;

  if (isLoading) {
    return (
      <Card className="bg-card/50 backdrop-blur-sm border-border/50">
        <CardHeader className="pb-2">
          <Skeleton className="h-6 w-32" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-32 w-full" />
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card className="bg-card/50 backdrop-blur-sm border-border/50">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <CardTitle className="text-lg">Daily Habits</CardTitle>
              <span className={cn(
                "text-xs px-2 py-0.5 rounded-full font-medium",
                totalPercentage === 100 
                  ? "bg-green-500/20 text-green-400" 
                  : "bg-muted text-muted-foreground"
              )}>
                {totalCompleted}/{totalHabits}
              </span>
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={() => setShowSettings(true)}
            >
              <Settings className="h-4 w-4" />
            </Button>
          </div>
          <Progress value={totalPercentage} className="h-1.5 mt-2" />
        </CardHeader>
        <CardContent className="space-y-3">
          {(['body', 'being', 'balance', 'business'] as HabitCategory[]).map(category => {
            const categoryHabits = getHabitsByCategory(category);
            const config = CATEGORY_CONFIG[category];
            const completedCount = categoryHabits.filter(h => isHabitCompleted(h.id)).length;
            
            return (
              <div 
                key={category} 
                className={cn(
                  "rounded-lg border p-3",
                  config.bgColor,
                  config.borderColor
                )}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    {config.icon}
                    <span className="font-medium text-sm">{config.titleRo}</span>
                  </div>
                  <span className="text-xs text-muted-foreground">
                    {completedCount}/{categoryHabits.length}
                  </span>
                </div>
                
                {categoryHabits.length > 0 ? (
                  <div className="space-y-1.5">
                    {categoryHabits.map(habit => {
                      const completed = isHabitCompleted(habit.id);
                      return (
                        <button
                          key={habit.id}
                          onClick={() => toggleHabit(habit.id)}
                          className={cn(
                            "w-full flex items-center gap-2 p-2 rounded-md transition-all text-left",
                            completed 
                              ? "bg-green-500/20 text-green-400" 
                              : "bg-background/50 hover:bg-background/80"
                          )}
                        >
                          <div className={cn(
                            "h-5 w-5 rounded border flex items-center justify-center shrink-0",
                            completed 
                              ? "bg-green-500 border-green-500" 
                              : "border-muted-foreground/50"
                          )}>
                            {completed && <Check className="h-3 w-3 text-white" />}
                          </div>
                          <span className={cn(
                            "text-sm flex-1",
                            completed && "line-through opacity-70"
                          )}>
                            {habit.name}
                          </span>
                          {isAutoHabit(habit.name) && (
                            <span
                              className="text-[10px] px-1.5 py-0.5 rounded-full bg-amber-500/20 text-amber-500 flex items-center gap-0.5 shrink-0"
                              title="Se bifează automat din Rutina Campion"
                            >
                              <Sparkles className="h-2.5 w-2.5" />
                              Auto
                            </span>
                          )}
                        </button>
                      );
                    })}
                  </div>
                ) : (
                  <p className="text-xs text-muted-foreground italic">No habits yet</p>
                )}
              </div>
            );
          })}
          
          <Button 
            variant="outline" 
            className="w-full mt-2" 
            onClick={() => setShowSettings(true)}
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Habit
          </Button>
        </CardContent>
      </Card>

      <HabitSettingsModal
        open={showSettings}
        onOpenChange={setShowSettings}
        habits={habits}
        onAdd={addHabit}
        onUpdate={updateHabit}
        onDelete={deleteHabit}
        onRefetch={refetch}
      />
    </>
  );
};
