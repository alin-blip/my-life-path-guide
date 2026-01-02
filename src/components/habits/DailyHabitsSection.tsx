import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Settings, Heart, Brain, Scale, Briefcase } from 'lucide-react';
import { useDailyHabits, HabitCategory } from '@/hooks/useDailyHabits';
import { HabitCard } from './HabitCard';
import { HabitSettingsModal } from './HabitSettingsModal';
import { cn } from '@/lib/utils';
import { Skeleton } from '@/components/ui/skeleton';

interface CategorySectionProps {
  category: HabitCategory;
  title: string;
  icon: React.ReactNode;
  habits: ReturnType<typeof useDailyHabits>['habits'];
  isHabitCompleted: (id: string) => boolean;
  onToggle: (id: string) => void;
}

const CategorySection: React.FC<CategorySectionProps> = ({
  title,
  icon,
  habits,
  isHabitCompleted,
  onToggle,
}) => {
  const completedCount = habits.filter(h => isHabitCompleted(h.id)).length;
  const totalCount = habits.length;

  if (habits.length === 0) return null;

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {icon}
          <span className="font-medium text-sm">{title}</span>
        </div>
        <span className="text-xs text-muted-foreground">
          {completedCount}/{totalCount}
        </span>
      </div>
      <div className="grid grid-cols-2 gap-2">
        {habits.map(habit => (
          <HabitCard
            key={habit.id}
            habit={habit}
            isCompleted={isHabitCompleted(habit.id)}
            onToggle={() => onToggle(habit.id)}
          />
        ))}
      </div>
    </div>
  );
};

const CATEGORY_CONFIG: Record<HabitCategory, { title: string; icon: React.ReactNode; color: string }> = {
  body: { title: 'Body', icon: <Heart className="h-4 w-4 text-red-400" />, color: 'text-red-400' },
  being: { title: 'Being', icon: <Brain className="h-4 w-4 text-purple-400" />, color: 'text-purple-400' },
  balance: { title: 'Balance', icon: <Scale className="h-4 w-4 text-blue-400" />, color: 'text-blue-400' },
  business: { title: 'Business', icon: <Briefcase className="h-4 w-4 text-green-400" />, color: 'text-green-400' },
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

  // Group habits by category
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
        <CardContent className="space-y-4">
          <Skeleton className="h-20 w-full" />
          <Skeleton className="h-20 w-full" />
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card className="bg-card/50 backdrop-blur-sm border-border/50">
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CardTitle className="text-lg">Daily Habits</CardTitle>
              <span className={cn(
                "text-xs px-2 py-0.5 rounded-full",
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
          <Progress value={totalPercentage} className="h-2 mt-2" />
        </CardHeader>
        <CardContent className="space-y-4">
          {(['body', 'being', 'balance', 'business'] as HabitCategory[]).map(category => {
            const categoryHabits = getHabitsByCategory(category);
            if (categoryHabits.length === 0) return null;
            
            const config = CATEGORY_CONFIG[category];
            return (
              <CategorySection
                key={category}
                category={category}
                title={config.title}
                icon={config.icon}
                habits={categoryHabits}
                isHabitCompleted={isHabitCompleted}
                onToggle={toggleHabit}
              />
            );
          })}
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
