import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Settings, ChevronDown, ChevronUp, Zap, Briefcase, Sparkles } from 'lucide-react';
import { useDailyHabits, HabitGroup } from '@/hooks/useDailyHabits';
import { HabitCard } from './HabitCard';
import { HabitSettingsModal } from './HabitSettingsModal';
import { cn } from '@/lib/utils';
import { Skeleton } from '@/components/ui/skeleton';

interface HabitGroupSectionProps {
  title: string;
  icon: React.ReactNode;
  group: HabitGroup;
  habits: ReturnType<typeof useDailyHabits>['habits'];
  isHabitCompleted: (id: string) => boolean;
  onToggle: (id: string) => void;
  progress: { total: number; completed: number; percentage: number };
}

const HabitGroupSection: React.FC<HabitGroupSectionProps> = ({
  title,
  icon,
  group,
  habits,
  isHabitCompleted,
  onToggle,
  progress,
}) => {
  const [isExpanded, setIsExpanded] = useState(true);

  if (habits.length === 0) return null;

  return (
    <div className="space-y-3">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="flex items-center justify-between w-full text-left"
      >
        <div className="flex items-center gap-2">
          {icon}
          <span className="font-semibold text-sm">{title}</span>
          <span className="text-xs text-muted-foreground">
            {progress.completed}/{progress.total}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <Progress value={progress.percentage} className="w-16 h-2" />
          {isExpanded ? (
            <ChevronUp className="h-4 w-4 text-muted-foreground" />
          ) : (
            <ChevronDown className="h-4 w-4 text-muted-foreground" />
          )}
        </div>
      </button>

      {isExpanded && (
        <div className="grid grid-cols-4 gap-2">
          {habits.map(habit => (
            <HabitCard
              key={habit.id}
              habit={habit}
              isCompleted={isHabitCompleted(habit.id)}
              onToggle={() => onToggle(habit.id)}
            />
          ))}
        </div>
      )}
    </div>
  );
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
    getGroupProgress,
    getHabitsByGroup,
    addHabit,
    updateHabit,
    deleteHabit,
    refetch,
  } = useDailyHabits(date);

  const core4Habits = getHabitsByGroup('core4');
  const biz4Habits = getHabitsByGroup('biz4');
  const customHabits = getHabitsByGroup('custom');

  const core4Progress = getGroupProgress('core4');
  const biz4Progress = getGroupProgress('biz4');
  const customProgress = getGroupProgress('custom');

  const totalCompleted = core4Progress.completed + biz4Progress.completed + customProgress.completed;
  const totalHabits = core4Progress.total + biz4Progress.total + customProgress.total;
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
          <HabitGroupSection
            title="Core 4"
            icon={<Zap className="h-4 w-4 text-yellow-400" />}
            group="core4"
            habits={core4Habits}
            isHabitCompleted={isHabitCompleted}
            onToggle={toggleHabit}
            progress={core4Progress}
          />

          <HabitGroupSection
            title="Biz 4"
            icon={<Briefcase className="h-4 w-4 text-green-400" />}
            group="biz4"
            habits={biz4Habits}
            isHabitCompleted={isHabitCompleted}
            onToggle={toggleHabit}
            progress={biz4Progress}
          />

          {customHabits.length > 0 && (
            <HabitGroupSection
              title="Custom"
              icon={<Sparkles className="h-4 w-4 text-purple-400" />}
              group="custom"
              habits={customHabits}
              isHabitCompleted={isHabitCompleted}
              onToggle={toggleHabit}
              progress={customProgress}
            />
          )}
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
