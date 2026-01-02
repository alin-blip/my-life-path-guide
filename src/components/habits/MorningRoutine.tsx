import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Checkbox } from '@/components/ui/checkbox';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Sun, Plus, Settings, Play, Check, ChevronRight, Dumbbell, Heart, Brain, Briefcase, X } from 'lucide-react';
import { useDailyHabits, HabitCategory } from '@/hooks/useDailyHabits';
import { useDailyFlow } from '@/hooks/useDailyFlow';
import { cn } from '@/lib/utils';

const CATEGORY_CONFIG: Record<HabitCategory, { 
  title: string; 
  icon: React.ReactNode; 
  gradient: string;
  color: string;
}> = {
  body: { 
    title: 'Body', 
    icon: <Dumbbell className="h-4 w-4" />, 
    gradient: 'from-blue-500/20 to-cyan-500/20',
    color: 'text-blue-400'
  },
  being: { 
    title: 'Being', 
    icon: <Brain className="h-4 w-4" />, 
    gradient: 'from-purple-500/20 to-pink-500/20',
    color: 'text-purple-400'
  },
  balance: { 
    title: 'Balance', 
    icon: <Heart className="h-4 w-4" />, 
    gradient: 'from-rose-500/20 to-orange-500/20',
    color: 'text-rose-400'
  },
  business: { 
    title: 'Business', 
    icon: <Briefcase className="h-4 w-4" />, 
    gradient: 'from-emerald-500/20 to-teal-500/20',
    color: 'text-emerald-400'
  },
};

export const MorningRoutine: React.FC = () => {
  const { habits, completions, isLoading, toggleHabit, addHabit, deleteHabit, isHabitCompleted } = useDailyHabits();
  const { session, startDay, completeStep, isStepCompleted, completedCount: flowCompletedCount } = useDailyFlow();
  
  const [isFlowActive, setIsFlowActive] = useState(false);
  const [currentFlowIndex, setCurrentFlowIndex] = useState(0);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [addHabitOpen, setAddHabitOpen] = useState(false);
  const [newHabitName, setNewHabitName] = useState('');
  const [newHabitCategory, setNewHabitCategory] = useState<HabitCategory>('body');
  const [newHabitIcon, setNewHabitIcon] = useState('✨');

  const activeHabits = habits.filter(h => h.is_active);
  const completedHabits = activeHabits.filter(h => isHabitCompleted(h.id));
  const totalProgress = activeHabits.length > 0 
    ? Math.round((completedHabits.length / activeHabits.length) * 100) 
    : 0;

  const hasStartedToday = session !== null;
  const isDayCompleted = session?.completed_at !== null;

  // Group habits by category for the flow
  const habitsByCategory = activeHabits.reduce((acc, habit) => {
    if (!acc[habit.category]) acc[habit.category] = [];
    acc[habit.category].push(habit);
    return acc;
  }, {} as Record<HabitCategory, typeof activeHabits>);

  const handleStartDay = async () => {
    if (!hasStartedToday) {
      await startDay();
    }
    setIsFlowActive(true);
    setCurrentFlowIndex(0);
  };

  const handleAddHabit = async () => {
    if (!newHabitName.trim()) return;
    
    await addHabit({
      name: newHabitName,
      category: newHabitCategory,
      habit_group: 'custom',
      icon: newHabitIcon,
      is_active: true,
      position: habits.length,
    });
    
    setNewHabitName('');
    setNewHabitIcon('✨');
    setAddHabitOpen(false);
  };

  const handleFlowNext = () => {
    if (currentFlowIndex < activeHabits.length - 1) {
      setCurrentFlowIndex(currentFlowIndex + 1);
    } else {
      setIsFlowActive(false);
    }
  };

  const handleFlowComplete = async (habitId: string) => {
    if (!isHabitCompleted(habitId)) {
      await toggleHabit(habitId);
    }
    handleFlowNext();
  };

  if (isLoading) {
    return (
      <Card className="bg-gradient-to-br from-amber-500/10 to-orange-500/10 border-amber-500/30">
        <CardContent className="p-6">
          <div className="h-32 animate-pulse bg-muted/50 rounded-lg" />
        </CardContent>
      </Card>
    );
  }

  // Flow Mode View
  if (isFlowActive && activeHabits.length > 0) {
    const currentHabit = activeHabits[currentFlowIndex];
    const categoryConfig = CATEGORY_CONFIG[currentHabit.category];
    const isCurrentCompleted = isHabitCompleted(currentHabit.id);

    return (
      <Card className={cn(
        "border-2 transition-all duration-500",
        `bg-gradient-to-br ${categoryConfig.gradient}`,
        "border-primary/30"
      )}>
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sun className="h-5 w-5 text-amber-400" />
              <CardTitle className="text-lg">Morning Routine</CardTitle>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsFlowActive(false)}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
          <Progress 
            value={((currentFlowIndex + (isCurrentCompleted ? 1 : 0)) / activeHabits.length) * 100} 
            className="h-2 mt-2 [&>div]:bg-amber-500"
          />
          <p className="text-xs text-muted-foreground mt-1">
            {currentFlowIndex + 1} / {activeHabits.length}
          </p>
        </CardHeader>

        <CardContent className="pt-4">
          <div className={cn(
            "rounded-xl p-6 text-center",
            `bg-gradient-to-br ${categoryConfig.gradient}`
          )}>
            <div className={cn("inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs mb-4", categoryConfig.color, "bg-background/50")}>
              {categoryConfig.icon}
              {categoryConfig.title}
            </div>
            
            <div className="text-4xl mb-3">{currentHabit.icon || '✨'}</div>
            <h3 className="text-xl font-semibold mb-6">{currentHabit.name}</h3>
            
            <div className="flex gap-3 justify-center">
              {isCurrentCompleted ? (
                <Button 
                  onClick={handleFlowNext}
                  className="bg-green-600 hover:bg-green-700"
                >
                  <Check className="h-4 w-4 mr-2" />
                  Completat
                  <ChevronRight className="h-4 w-4 ml-2" />
                </Button>
              ) : (
                <>
                  <Button
                    variant="outline"
                    onClick={handleFlowNext}
                  >
                    Sari
                  </Button>
                  <Button 
                    onClick={() => handleFlowComplete(currentHabit.id)}
                    className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600"
                  >
                    <Check className="h-4 w-4 mr-2" />
                    Am făcut!
                  </Button>
                </>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Default View
  return (
    <Card className={cn(
      "border transition-all duration-300",
      isDayCompleted
        ? "bg-gradient-to-br from-green-500/10 to-emerald-500/10 border-green-500/30"
        : "bg-gradient-to-br from-amber-500/10 to-orange-500/10 border-amber-500/30"
    )}>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sun className={cn(
              "h-5 w-5",
              isDayCompleted ? "text-green-400" : "text-amber-400"
            )} />
            <CardTitle className="text-lg">
              {isDayCompleted ? 'Ziua Completată! 🎉' : 'Morning Routine'}
            </CardTitle>
          </div>
          
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setSettingsOpen(true)}
          >
            <Settings className="h-4 w-4" />
          </Button>
        </div>
        
        {activeHabits.length > 0 && (
          <>
            <Progress 
              value={totalProgress} 
              className={cn(
                "h-2 mt-2",
                isDayCompleted ? "[&>div]:bg-green-500" : "[&>div]:bg-amber-500"
              )}
            />
            <p className="text-xs text-muted-foreground mt-1">
              {completedHabits.length}/{activeHabits.length} completate
            </p>
          </>
        )}
      </CardHeader>

      <CardContent className="pt-2 space-y-4">
        {/* Start Day Button */}
        <Button
          onClick={handleStartDay}
          disabled={activeHabits.length === 0}
          className={cn(
            "w-full",
            isDayCompleted 
              ? "bg-green-600 hover:bg-green-700"
              : "bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600"
          )}
        >
          <Play className="h-4 w-4 mr-2" />
          {isDayCompleted ? 'Revezi Rutina' : hasStartedToday ? 'Continuă Rutina' : 'Începe Ziua'}
        </Button>

        {/* Habits by Category */}
        <div className="space-y-3">
          {(Object.keys(CATEGORY_CONFIG) as HabitCategory[]).map(category => {
            const categoryHabits = habitsByCategory[category] || [];
            if (categoryHabits.length === 0) return null;
            
            const config = CATEGORY_CONFIG[category];
            const categoryCompleted = categoryHabits.filter(h => isHabitCompleted(h.id)).length;
            
            return (
              <div key={category} className={cn("rounded-lg p-3", `bg-gradient-to-r ${config.gradient}`)}>
                <div className="flex items-center gap-2 mb-2">
                  <span className={config.color}>{config.icon}</span>
                  <span className="text-sm font-medium">{config.title}</span>
                  <span className="text-xs text-muted-foreground ml-auto">
                    {categoryCompleted}/{categoryHabits.length}
                  </span>
                </div>
                
                <div className="space-y-1">
                  {categoryHabits.map(habit => (
                    <div 
                      key={habit.id}
                      className="flex items-center gap-2 p-1.5 rounded hover:bg-background/30 transition-colors cursor-pointer"
                      onClick={() => toggleHabit(habit.id)}
                    >
                      <Checkbox 
                        checked={isHabitCompleted(habit.id)}
                        onCheckedChange={() => toggleHabit(habit.id)}
                        className="data-[state=checked]:bg-green-500 data-[state=checked]:border-green-500"
                      />
                      <span className="text-sm">{habit.icon}</span>
                      <span className={cn(
                        "text-sm flex-1",
                        isHabitCompleted(habit.id) && "line-through text-muted-foreground"
                      )}>
                        {habit.name}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>

        {activeHabits.length === 0 && (
          <p className="text-sm text-muted-foreground text-center py-4">
            Adaugă habits pentru rutina ta de dimineață
          </p>
        )}
      </CardContent>

      {/* Settings Dialog */}
      <Dialog open={settingsOpen} onOpenChange={setSettingsOpen}>
        <DialogContent className="max-w-md max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Configurează Morning Routine</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            {(Object.keys(CATEGORY_CONFIG) as HabitCategory[]).map(category => {
              const categoryHabits = habits.filter(h => h.category === category);
              const config = CATEGORY_CONFIG[category];
              
              return (
                <div key={category}>
                  <div className="flex items-center gap-2 mb-2">
                    <span className={config.color}>{config.icon}</span>
                    <span className="font-medium">{config.title}</span>
                  </div>
                  
                  {categoryHabits.length > 0 ? (
                    <div className="space-y-1 ml-6">
                      {categoryHabits.map(habit => (
                        <div key={habit.id} className="flex items-center justify-between py-1">
                          <div className="flex items-center gap-2">
                            <span>{habit.icon}</span>
                            <span className="text-sm">{habit.name}</span>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-6 w-6 p-0 text-destructive hover:text-destructive"
                            onClick={() => deleteHabit(habit.id)}
                          >
                            <X className="h-3 w-3" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-xs text-muted-foreground ml-6">Niciun habit</p>
                  )}
                </div>
              );
            })}

            <Button 
              onClick={() => {
                setSettingsOpen(false);
                setAddHabitOpen(true);
              }}
              className="w-full"
              variant="outline"
            >
              <Plus className="h-4 w-4 mr-2" />
              Adaugă Habit
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Add Habit Dialog */}
      <Dialog open={addHabitOpen} onOpenChange={setAddHabitOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Adaugă Habit Nou</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium mb-1 block">Nume</label>
              <Input
                value={newHabitName}
                onChange={(e) => setNewHabitName(e.target.value)}
                placeholder="Ex: 10 minute meditație"
              />
            </div>
            
            <div>
              <label className="text-sm font-medium mb-1 block">Categorie</label>
              <Select value={newHabitCategory} onValueChange={(v) => setNewHabitCategory(v as HabitCategory)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {(Object.keys(CATEGORY_CONFIG) as HabitCategory[]).map(cat => (
                    <SelectItem key={cat} value={cat}>
                      <div className="flex items-center gap-2">
                        {CATEGORY_CONFIG[cat].icon}
                        {CATEGORY_CONFIG[cat].title}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <label className="text-sm font-medium mb-1 block">Icon</label>
              <Select value={newHabitIcon} onValueChange={setNewHabitIcon}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {['💪', '🏃', '🧘', '📖', '💧', '🥗', '😴', '☀️', '🙏', '💼', '📝', '🎯', '❤️', '🧠', '✨'].map(icon => (
                    <SelectItem key={icon} value={icon}>{icon}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <Button onClick={handleAddHabit} className="w-full">
              Adaugă
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </Card>
  );
};
