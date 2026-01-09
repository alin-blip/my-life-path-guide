import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Settings, Sparkles, Heart, Brain, Scale, Briefcase, Check, Play, Pencil, Trash2 } from 'lucide-react';
import { useDailyHabits, HabitCategory } from '@/hooks/useDailyHabits';
import { HabitSettingsModal } from '@/components/habits/HabitSettingsModal';
import { HabitQuickEdit } from '@/components/habits/HabitQuickEdit';
import { cn } from '@/lib/utils';
import { Skeleton } from '@/components/ui/skeleton';
import { useNavigate } from 'react-router-dom';
import { useChampionRoutine } from '@/hooks/useChampionRoutine';
import { useLanguage } from '@/context/LanguageContext';
import { toast } from 'sonner';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

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

export const ChampionRoutineWidget: React.FC<ChampionRoutineWidgetProps> = ({ date = new Date() }) => {
  const navigate = useNavigate();
  const { language } = useLanguage();
  const [showSettings, setShowSettings] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<{ open: boolean; habitId: string; habitName: string }>({
    open: false,
    habitId: '',
    habitName: ''
  });
  const { todayLog, isLoading: routineLoading } = useChampionRoutine();
  
  const {
    habits,
    isLoading: habitsLoading,
    toggleHabit,
    isHabitCompleted,
    addHabit,
    updateHabit,
    deleteHabit,
  } = useDailyHabits(date);

  const handleEditHabit = async (id: string, name: string, category: HabitCategory) => {
    await updateHabit(id, { name, category });
    toast.success(language === 'ro' ? 'Habit actualizat!' : 'Habit updated!');
  };

  const handleDeleteHabit = async () => {
    if (deleteConfirm.habitId) {
      await deleteHabit(deleteConfirm.habitId);
      toast.success(language === 'ro' ? 'Habit șters!' : 'Habit deleted!');
      setDeleteConfirm({ open: false, habitId: '', habitName: '' });
    }
  };

  const getHabitsByCategory = (category: HabitCategory) => 
    habits.filter(h => h.category === category && h.is_active);

  const totalCompleted = habits.filter(h => h.is_active && isHabitCompleted(h.id)).length;
  const totalHabits = habits.filter(h => h.is_active).length;
  const totalPercentage = totalHabits > 0 ? (totalCompleted / totalHabits) * 100 : 0;

  // Calculate routine progress based on actual routine log fields
  const getRoutineProgress = () => {
    if (!todayLog) return 0;
    let completed = 0;
    let total = 9; // 9 steps in the routine (excluding completion)
    
    // Gratitude - at least one item filled
    if ((todayLog.gratitude_items as any[])?.some((i: any) => i?.trim?.())) completed++;
    // Hydration
    if (todayLog.water_drunk) completed++;
    // Meditation - at least 10 minutes
    if ((todayLog.meditation_duration_seconds || 0) >= 600) completed++;
    // Autosuggestion
    if (todayLog.autosuggestion_completed) completed++;
    // Exercise
    if (todayLog.exercise_completed) completed++;
    // Meal planning - at least one meal logged
    if ((todayLog.meals_logged as any[])?.length > 0) completed++;
    // Content creation - has script or pomodoro sessions
    if (todayLog.content_script || (todayLog.pomodoro_sessions || 0) > 0) completed++;
    // Daily tasks - has big one or completed todos
    if (todayLog.big_one_today || (todayLog.daily_todos as any[])?.some((t: any) => t?.completed)) completed++;
    // Relationships - has completed actions
    if ((todayLog.relationship_actions as any[])?.some((a: any) => a?.completed)) completed++;
    
    return Math.round((completed / total) * 100);
  };

  const routineProgress = getRoutineProgress();

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

          {/* Daily Habits - 4 Quadrants Grid */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-muted-foreground">
                {language === 'en' ? 'Daily Habits' : 'Obiceiuri Zilnice'}
              </span>
              <div className="flex items-center gap-2">
                <span className={cn(
                  "text-xs px-2 py-0.5 rounded-full font-medium",
                  totalPercentage === 100 
                    ? "bg-green-500/20 text-green-400" 
                    : "bg-muted text-muted-foreground"
                )}>
                  {totalCompleted}/{totalHabits}
                </span>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-6 w-6 p-0 text-muted-foreground hover:text-primary"
                  onClick={() => setShowSettings(true)}
                  title={language === 'en' ? 'Add habit' : 'Adaugă obicei'}
                >
                  <span className="text-lg">+</span>
                </Button>
              </div>
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
                      <div className="space-y-1 max-h-40 overflow-y-auto">
                        {categoryHabits.map(habit => {
                          const completed = isHabitCompleted(habit.id);
                          return (
                            <div
                              key={habit.id}
                              className={cn(
                                "group relative flex items-center gap-2 p-1.5 rounded-md transition-all",
                                completed 
                                  ? "bg-green-500/20 text-green-400" 
                                  : "bg-background/50 hover:bg-background/80"
                              )}
                            >
                              <button
                                onClick={() => toggleHabit(habit.id)}
                                className="flex items-center gap-2 flex-1 text-left"
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
                              
                              {/* Edit/Delete buttons - appear on hover */}
                              <div className="opacity-0 group-hover:opacity-100 flex items-center gap-0.5 transition-opacity">
                                <HabitQuickEdit
                                  habitId={habit.id}
                                  habitName={habit.name}
                                  habitCategory={habit.category}
                                  onSave={handleEditHabit}
                                >
                                  <button className="p-1 rounded hover:bg-muted/50 text-muted-foreground hover:text-foreground">
                                    <Pencil className="h-3 w-3" />
                                  </button>
                                </HabitQuickEdit>
                                <button 
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setDeleteConfirm({ open: true, habitId: habit.id, habitName: habit.name });
                                  }}
                                  className="p-1 rounded hover:bg-destructive/20 text-muted-foreground hover:text-destructive"
                                >
                                  <Trash2 className="h-3 w-3" />
                                </button>
                              </div>
                            </div>
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
                            <div
                              key={habit.id}
                              className={cn(
                                "group relative flex items-center gap-2 p-1.5 rounded-md transition-all",
                                completed 
                                  ? "bg-green-500/20 text-green-400" 
                                  : "bg-background/50 hover:bg-background/80"
                              )}
                            >
                              <button
                                onClick={() => toggleHabit(habit.id)}
                                className="flex items-center gap-2 flex-1 text-left"
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
                              
                              <div className="opacity-0 group-hover:opacity-100 flex items-center gap-0.5 transition-opacity">
                                <HabitQuickEdit
                                  habitId={habit.id}
                                  habitName={habit.name}
                                  habitCategory={habit.category}
                                  onSave={handleEditHabit}
                                >
                                  <button className="p-1 rounded hover:bg-muted/50 text-muted-foreground hover:text-foreground">
                                    <Pencil className="h-3 w-3" />
                                  </button>
                                </HabitQuickEdit>
                                <button 
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setDeleteConfirm({ open: true, habitId: habit.id, habitName: habit.name });
                                  }}
                                  className="p-1 rounded hover:bg-destructive/20 text-muted-foreground hover:text-destructive"
                                >
                                  <Trash2 className="h-3 w-3" />
                                </button>
                              </div>
                            </div>
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
        onRefetch={async () => {}}
      />

      <AlertDialog open={deleteConfirm.open} onOpenChange={(open) => setDeleteConfirm(prev => ({ ...prev, open }))}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {language === 'ro' ? 'Șterge habit' : 'Delete habit'}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {language === 'ro' 
                ? `Ești sigur că vrei să ștergi "${deleteConfirm.habitName}"?`
                : `Are you sure you want to delete "${deleteConfirm.habitName}"?`}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{language === 'ro' ? 'Anulează' : 'Cancel'}</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteHabit} className="bg-destructive hover:bg-destructive/90">
              {language === 'ro' ? 'Șterge' : 'Delete'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};
