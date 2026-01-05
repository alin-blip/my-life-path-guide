import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Settings, Sparkles, Heart, Brain, Scale, Briefcase, Check, Play, ChevronDown, Dumbbell, Utensils, ListTodo, Flame, Beef } from 'lucide-react';
import { useDailyHabits, HabitCategory } from '@/hooks/useDailyHabits';
import { HabitSettingsModal } from '@/components/habits/HabitSettingsModal';
import { cn } from '@/lib/utils';
import { Skeleton } from '@/components/ui/skeleton';
import { useNavigate } from 'react-router-dom';
import { useChampionRoutine, Meal, Todo } from '@/hooks/useChampionRoutine';
import { useLanguage } from '@/context/LanguageContext';
import { supabase } from '@/integrations/supabase/client';
import { format } from 'date-fns';
import { QuickWorkoutAction, QuickMealAction, QuickTaskAction, QuickGratitudeAction } from './quick-actions';
import { useNutritionSettings } from '@/hooks/useNutritionSettings';

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

interface ChampionRoutineWidgetProps {
  date?: Date;
}

interface WorkoutSession {
  id: string;
  activity_type: string;
  duration_seconds: number | null;
}

export const ChampionRoutineWidget: React.FC<ChampionRoutineWidgetProps> = ({ date = new Date() }) => {
  const navigate = useNavigate();
  const { language } = useLanguage();
  const [showSettings, setShowSettings] = useState(false);
  const [quickActionsOpen, setQuickActionsOpen] = useState(true);
  const [workoutSessions, setWorkoutSessions] = useState<WorkoutSession[]>([]);
  const { todayLog, isLoading: routineLoading, isConfigured } = useChampionRoutine();
  const { settings: nutritionSettings } = useNutritionSettings();
  
  const {
    habits,
    isLoading: habitsLoading,
    toggleHabit,
    isHabitCompleted,
    addHabit,
    updateHabit,
    deleteHabit,
    refetch,
  } = useDailyHabits(date);

  const today = format(new Date(), 'yyyy-MM-dd');

  // Fetch workout sessions for today
  const fetchWorkoutSessions = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data } = await supabase
        .from('activity_sessions')
        .select('id, activity_type, duration_seconds')
        .eq('user_id', user.id)
        .eq('date', today);

      setWorkoutSessions(data || []);
    } catch (error) {
      console.error('Error fetching workout sessions:', error);
    }
  };

  useEffect(() => {
    fetchWorkoutSessions();
  }, [today]);

  const getHabitsByCategory = (category: HabitCategory) => 
    habits.filter(h => h.category === category && h.is_active);

  const totalCompleted = habits.filter(h => h.is_active && isHabitCompleted(h.id)).length;
  const totalHabits = habits.filter(h => h.is_active).length;
  const totalPercentage = totalHabits > 0 ? (totalCompleted / totalHabits) * 100 : 0;

  // Calculate routine progress
  const getRoutineProgress = () => {
    if (!todayLog) return 0;
    let completed = 0;
    let total = 8;
    
    if (todayLog.breathing_completed) completed++;
    if (todayLog.water_drunk) completed++;
    if (todayLog.light_exposure) completed++;
    if (todayLog.autosuggestion_completed) completed++;
    if (todayLog.visualization_completed) completed++;
    if (todayLog.exercise_completed) completed++;
    if ((todayLog.gratitude_items as any[])?.length >= 3) completed++;
    if (todayLog.reading_completed) completed++;
    
    return Math.round((completed / total) * 100);
  };

  const routineProgress = getRoutineProgress();

  // Quick action data
  const meals = (todayLog?.meals_logged as Meal[]) || [];
  const totalCalories = todayLog?.total_calories || 0;
  const totalProtein = todayLog?.total_protein || 0;
  const calorieTarget = nutritionSettings?.calorie_target || 2000;
  const proteinTarget = nutritionSettings?.protein_target || 150;
  
  const todos = (todayLog?.daily_todos as Todo[]) || [];
  const completedTodos = todos.filter(t => t.completed).length;
  
  const gratitudeItems = (todayLog?.gratitude_items as string[]) || [];
  
  const workoutMinutes = workoutSessions.reduce((acc, s) => acc + (s.duration_seconds ? Math.round(s.duration_seconds / 60) : 0), 0);

  if (habitsLoading || routineLoading) {
    return (
      <Card className="bg-card/50 backdrop-blur-sm border-border/50">
        <CardHeader className="pb-2">
          <Skeleton className="h-6 w-32" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-48 w-full" />
        </CardContent>
      </Card>
    );
  }

  const categories: HabitCategory[] = ['body', 'being', 'balance', 'business'];

  return (
    <>
      <Card className="bg-card/50 backdrop-blur-sm border-border/50">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-primary" />
              <CardTitle className="text-lg">
                {language === 'en' ? 'Champion Routine' : 'Rutina de Campion'}
              </CardTitle>
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
        </CardHeader>
        
        <CardContent className="space-y-4">
          {/* Champion Routine Section */}
          <div className="bg-gradient-to-r from-primary/10 to-primary/5 rounded-xl p-4 border border-primary/20">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium">
                  {language === 'en' ? 'Morning Routine' : 'Rutină Dimineață'}
                </span>
                <span className={cn(
                  "text-xs px-2 py-0.5 rounded-full font-medium",
                  routineProgress === 100 
                    ? "bg-green-500/20 text-green-400" 
                    : "bg-muted text-muted-foreground"
                )}>
                  {routineProgress}%
                </span>
              </div>
            </div>
            <Progress value={routineProgress} className="h-2 mb-4" />
            <Button 
              onClick={() => navigate('/daily-flow')} 
              className="w-full bg-primary hover:bg-primary/90"
              size="lg"
            >
              <Play className="h-5 w-5 mr-2" />
              {routineProgress > 0 
                ? (language === 'en' ? 'Continue Routine' : 'Continuă Rutina')
                : (language === 'en' ? 'Start Routine' : 'Începe Rutina')
              }
            </Button>
          </div>

          {/* Quick Actions - Expandable */}
          <Collapsible open={quickActionsOpen} onOpenChange={setQuickActionsOpen}>
            <CollapsibleTrigger asChild>
              <Button variant="ghost" className="w-full justify-between p-2 h-auto">
                <span className="text-sm font-medium">
                  {language === 'en' ? 'Quick Actions' : 'Acțiuni Rapide'}
                </span>
                <ChevronDown className={cn(
                  "h-4 w-4 transition-transform",
                  quickActionsOpen && "rotate-180"
                )} />
              </Button>
            </CollapsibleTrigger>
            <CollapsibleContent className="space-y-3 pt-2">
              {/* Quick Actions Grid */}
              <div className="grid grid-cols-2 gap-3">
                {/* Workout Card */}
                <div className="rounded-lg border border-red-500/30 bg-red-500/10 p-3">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <Dumbbell className="h-4 w-4 text-red-500" />
                      <span className="text-sm font-medium">Antrenament</span>
                    </div>
                  </div>
                  <div className="text-xs text-muted-foreground mb-2">
                    {workoutSessions.length > 0 ? (
                      <span className="text-green-500 font-medium">
                        {workoutSessions.length} sesiuni • {workoutMinutes} min
                      </span>
                    ) : (
                      <span>Nicio activitate azi</span>
                    )}
                  </div>
                  <QuickWorkoutAction onUpdate={fetchWorkoutSessions} />
                </div>

                {/* Nutrition Card */}
                <div className="rounded-lg border border-green-500/30 bg-green-500/10 p-3">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <Utensils className="h-4 w-4 text-green-500" />
                      <span className="text-sm font-medium">Nutriție</span>
                    </div>
                  </div>
                  <div className="text-xs space-y-1 mb-2">
                    <div className="flex items-center justify-between">
                      <span className="flex items-center gap-1">
                        <Flame className="h-3 w-3 text-orange-400" />
                        Calorii
                      </span>
                      <span className={totalCalories >= calorieTarget ? "text-green-500 font-medium" : ""}>
                        {totalCalories}/{calorieTarget}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="flex items-center gap-1">
                        <Beef className="h-3 w-3 text-red-400" />
                        Proteine
                      </span>
                      <span className={totalProtein >= proteinTarget ? "text-green-500 font-medium" : ""}>
                        {totalProtein}g/{proteinTarget}g
                      </span>
                    </div>
                  </div>
                  <QuickMealAction onUpdate={refetch} />
                </div>

                {/* Tasks Card */}
                <div className="rounded-lg border border-blue-500/30 bg-blue-500/10 p-3">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <ListTodo className="h-4 w-4 text-blue-500" />
                      <span className="text-sm font-medium">Task-uri</span>
                    </div>
                  </div>
                  <div className="text-xs text-muted-foreground mb-2">
                    {todayLog?.big_one_today ? (
                      <div className="truncate">
                        <span className="text-primary font-medium">Big One:</span> {todayLog.big_one_today}
                      </div>
                    ) : (
                      <span>Setează Big One</span>
                    )}
                    {todos.length > 0 && (
                      <div className="text-green-500 font-medium mt-0.5">
                        {completedTodos}/{todos.length} complete
                      </div>
                    )}
                  </div>
                  <QuickTaskAction onUpdate={refetch} />
                </div>

                {/* Gratitude Card */}
                <div className="rounded-lg border border-pink-500/30 bg-pink-500/10 p-3">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <Heart className="h-4 w-4 text-pink-500" />
                      <span className="text-sm font-medium">Recunoștință</span>
                    </div>
                  </div>
                  <div className="text-xs text-muted-foreground mb-2">
                    {gratitudeItems.length > 0 ? (
                      <span className={gratitudeItems.length >= 3 ? "text-green-500 font-medium" : ""}>
                        {gratitudeItems.length}/3 complete
                      </span>
                    ) : (
                      <span>Nicio recunoștință</span>
                    )}
                  </div>
                  <QuickGratitudeAction onUpdate={refetch} />
                </div>
              </div>
            </CollapsibleContent>
          </Collapsible>

          {/* Daily Habits - 4 Quadrants Grid */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-muted-foreground">
                {language === 'en' ? 'Daily Habits' : 'Obiceiuri Zilnice'}
              </span>
              <span className={cn(
                "text-xs px-2 py-0.5 rounded-full font-medium",
                totalPercentage === 100 
                  ? "bg-green-500/20 text-green-400" 
                  : "bg-muted text-muted-foreground"
              )}>
                {totalCompleted}/{totalHabits}
              </span>
            </div>
            
            {/* 2x2 Grid for Desktop */}
            <div className="hidden md:grid grid-cols-2 gap-3">
              {categories.map(category => {
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
                      <div className="space-y-1">
                        {categoryHabits.slice(0, 3).map(habit => {
                          const completed = isHabitCompleted(habit.id);
                          return (
                            <button
                              key={habit.id}
                              onClick={() => toggleHabit(habit.id)}
                              className={cn(
                                "w-full flex items-center gap-2 p-1.5 rounded-md transition-all text-left",
                                completed 
                                  ? "bg-green-500/20 text-green-400" 
                                  : "bg-background/50 hover:bg-background/80"
                              )}
                            >
                              <div className={cn(
                                "h-4 w-4 rounded border flex items-center justify-center shrink-0",
                                completed 
                                  ? "bg-green-500 border-green-500" 
                                  : "border-muted-foreground/50"
                              )}>
                                {completed && <Check className="h-2.5 w-2.5 text-white" />}
                              </div>
                              <span className={cn(
                                "text-xs truncate",
                                completed && "line-through opacity-70"
                              )}>
                                {habit.name}
                              </span>
                            </button>
                          );
                        })}
                        {categoryHabits.length > 3 && (
                          <span className="text-xs text-muted-foreground pl-6">
                            +{categoryHabits.length - 3} more
                          </span>
                        )}
                      </div>
                    ) : (
                      <p className="text-xs text-muted-foreground italic">
                        {language === 'en' ? 'No habits yet' : 'Niciun obicei'}
                      </p>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Stacked for Mobile */}
            <div className="md:hidden space-y-2">
              {categories.map(category => {
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
                      <div className="space-y-1">
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
                                "text-sm",
                                completed && "line-through opacity-70"
                              )}>
                                {habit.name}
                              </span>
                            </button>
                          );
                        })}
                      </div>
                    ) : (
                      <p className="text-xs text-muted-foreground italic">
                        {language === 'en' ? 'No habits yet' : 'Niciun obicei'}
                      </p>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
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
