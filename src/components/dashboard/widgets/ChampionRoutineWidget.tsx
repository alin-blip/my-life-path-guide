import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
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
import { ProgressRing } from '@/components/ui/progress-ring';
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

const CATEGORY_CONFIG: Record<HabitCategory, { titleEn: string; titleRo: string; icon: React.ReactNode; gradient: string; borderColor: string }> = {
  body: { 
    titleEn: 'Body', 
    titleRo: 'Corp',
    icon: <Heart className="h-5 w-5" />, 
    gradient: 'from-red-500/10 via-red-500/5 to-transparent',
    borderColor: 'border-red-500/20 hover:border-red-500/40'
  },
  being: { 
    titleEn: 'Spirituality', 
    titleRo: 'Spiritualitate',
    icon: <Brain className="h-5 w-5" />, 
    gradient: 'from-purple-500/10 via-purple-500/5 to-transparent',
    borderColor: 'border-purple-500/20 hover:border-purple-500/40'
  },
  balance: { 
    titleEn: 'Relationships', 
    titleRo: 'Relații',
    icon: <Scale className="h-5 w-5" />, 
    gradient: 'from-blue-500/10 via-blue-500/5 to-transparent',
    borderColor: 'border-blue-500/20 hover:border-blue-500/40'
  },
  business: { 
    titleEn: 'Business', 
    titleRo: 'Business',
    icon: <Briefcase className="h-5 w-5" />, 
    gradient: 'from-emerald-500/10 via-emerald-500/5 to-transparent',
    borderColor: 'border-emerald-500/20 hover:border-emerald-500/40'
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

  // Calculate routine progress
  const getRoutineProgress = () => {
    if (!todayLog) return 0;
    let completed = 0;
    let total = 9;
    
    if ((todayLog.gratitude_items as any[])?.some((i: any) => i?.trim?.())) completed++;
    if (todayLog.water_drunk) completed++;
    if ((todayLog.meditation_duration_seconds || 0) >= 600) completed++;
    if (todayLog.autosuggestion_completed) completed++;
    if (todayLog.exercise_completed) completed++;
    if ((todayLog.meals_logged as any[])?.length > 0) completed++;
    if (todayLog.content_script || (todayLog.pomodoro_sessions || 0) > 0) completed++;
    if (todayLog.big_one_today || (todayLog.daily_todos as any[])?.some((t: any) => t?.completed)) completed++;
    if ((todayLog.relationship_actions as any[])?.some((a: any) => a?.completed)) completed++;
    
    return Math.round((completed / total) * 100);
  };

  const routineProgress = getRoutineProgress();

  if (habitsLoading || routineLoading) {
    return (
      <Card className="bg-gradient-to-br from-card/80 to-card/60 backdrop-blur-xl border-border/50 shadow-xl">
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
      <Card className="bg-gradient-to-br from-card/90 via-card/70 to-card/50 backdrop-blur-xl border-border/50 shadow-xl overflow-hidden">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-primary/10">
                <Sparkles className="h-5 w-5 text-primary" />
              </div>
              <CardTitle className="text-lg">
                {language === 'en' ? 'Warrior Routine' : 'Rutina Războinicului'}
              </CardTitle>
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-muted-foreground hover:text-foreground"
              onClick={() => setShowSettings(true)}
            >
              <Settings className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        
        <CardContent className="space-y-4">
          {/* Morning Routine Section with Progress Ring */}
          <div className="relative p-5 rounded-xl bg-gradient-to-br from-primary/10 via-primary/5 to-transparent border border-primary/20 overflow-hidden">
            {/* Glow effect */}
            <div className="absolute inset-0 bg-primary/5 blur-xl" />
            
            <div className="relative flex items-center gap-4">
              {/* Progress Ring */}
              <ProgressRing 
                progress={routineProgress} 
                size={72} 
                strokeWidth={5}
                className="shrink-0"
              >
                <div className="flex flex-col items-center">
                  <span className={cn(
                    "text-lg font-bold",
                    routineProgress === 100 ? "text-green-500" : "text-foreground"
                  )}>
                    {routineProgress}%
                  </span>
                </div>
              </ProgressRing>
              
              <div className="flex-1 min-w-0">
                <span className="text-sm font-medium text-foreground">
                  {language === 'en' ? 'Warrior Routine' : 'Rutina Războinicului'}
                </span>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {routineProgress === 100 
                    ? (language === 'en' ? 'Completed! Great work!' : 'Completată! Excelent!')
                    : (language === 'en' ? 'Continue where you left off' : 'Continuă de unde ai rămas')
                  }
                </p>
              </div>
            </div>
            
            {/* Start/Continue Button with glow effect */}
            <Button 
              onClick={() => navigate('/daily-flow')} 
              className={cn(
                "relative w-full mt-4 font-medium transition-all duration-300",
                routineProgress === 100 
                  ? "bg-green-500 hover:bg-green-600" 
                  : "bg-primary hover:bg-primary/90 shadow-[0_0_20px_rgba(var(--primary),0.3)] hover:shadow-[0_0_30px_rgba(var(--primary),0.5)]"
              )}
              size="lg"
            >
              <Play className="h-5 w-5 mr-2" />
              {routineProgress > 0 
                ? (language === 'en' ? 'Continue Routine' : 'Continuă Rutina')
                : (language === 'en' ? 'Start Routine' : 'Începe Rutina')
              }
            </Button>
          </div>

          {/* Daily Habits - 2x2 Grid */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-muted-foreground">
                {language === 'en' ? 'Daily Habits' : 'Obiceiuri Zilnice'}
              </span>
              <div className="flex items-center gap-2">
                <span className={cn(
                  "text-xs px-2 py-0.5 rounded-full font-medium",
                  totalPercentage === 100 
                    ? "bg-green-500/20 text-green-500" 
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
            
            {/* 2x2 Grid */}
            <div className="grid grid-cols-2 gap-2">
              {categories.map(category => {
                const categoryHabits = getHabitsByCategory(category);
                const config = CATEGORY_CONFIG[category];
                const completedCount = categoryHabits.filter(h => isHabitCompleted(h.id)).length;
                const allCompleted = categoryHabits.length > 0 && completedCount === categoryHabits.length;
                
                return (
                  <div 
                    key={category} 
                    className={cn(
                      "rounded-xl border p-3 transition-all duration-200 bg-gradient-to-br",
                      config.gradient,
                      config.borderColor,
                      allCompleted && "ring-1 ring-green-500/30"
                    )}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-1.5">
                        <div className={cn(
                          "p-1 rounded-md",
                          allCompleted ? "bg-green-500/20 text-green-500" : "bg-background/50"
                        )}>
                          {config.icon}
                        </div>
                      </div>
                      <span className={cn(
                        "text-xs font-medium",
                        allCompleted ? "text-green-500" : "text-muted-foreground"
                      )}>
                        {completedCount}/{categoryHabits.length}
                      </span>
                    </div>
                    
                    {categoryHabits.length > 0 ? (
                      <div className="space-y-1 max-h-28 overflow-y-auto">
                        {categoryHabits.map(habit => {
                          const completed = isHabitCompleted(habit.id);
                          return (
                            <div
                              key={habit.id}
                              className={cn(
                                "group relative flex items-center gap-2 p-1.5 rounded-lg transition-all",
                                completed 
                                  ? "bg-green-500/10" 
                                  : "bg-background/30 hover:bg-background/50"
                              )}
                            >
                              <button
                                onClick={() => toggleHabit(habit.id)}
                                className="flex items-center gap-2 flex-1 text-left min-w-0"
                              >
                                <div className={cn(
                                  "h-4 w-4 rounded border flex items-center justify-center shrink-0 transition-colors",
                                  completed 
                                    ? "bg-green-500 border-green-500" 
                                    : "border-muted-foreground/40 hover:border-primary"
                                )}>
                                  {completed && <Check className="h-2.5 w-2.5 text-white" />}
                                </div>
                                <span className={cn(
                                  "text-xs truncate",
                                  completed ? "text-green-500 line-through opacity-80" : "text-foreground"
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
                                  <button className="p-0.5 rounded hover:bg-muted/50 text-muted-foreground hover:text-foreground">
                                    <Pencil className="h-3 w-3" />
                                  </button>
                                </HabitQuickEdit>
                                <button 
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setDeleteConfirm({ open: true, habitId: habit.id, habitName: habit.name });
                                  }}
                                  className="p-0.5 rounded hover:bg-destructive/20 text-muted-foreground hover:text-destructive"
                                >
                                  <Trash2 className="h-3 w-3" />
                                </button>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    ) : (
                      <p className="text-[10px] text-muted-foreground/70 italic">
                        {language === 'en' ? 'No habits' : 'Niciun obicei'}
                      </p>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Settings Modal */}
      <HabitSettingsModal
        open={showSettings}
        onOpenChange={setShowSettings}
        habits={habits}
        onAdd={addHabit}
        onUpdate={updateHabit}
        onDelete={deleteHabit}
        onRefetch={async () => {}}
      />

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteConfirm.open} onOpenChange={(open) => setDeleteConfirm(prev => ({ ...prev, open }))}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {language === 'en' ? 'Delete Habit' : 'Șterge Obicei'}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {language === 'en' 
                ? `Are you sure you want to delete "${deleteConfirm.habitName}"? This action cannot be undone.`
                : `Ești sigur că vrei să ștergi "${deleteConfirm.habitName}"? Această acțiune nu poate fi anulată.`
              }
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>
              {language === 'en' ? 'Cancel' : 'Anulează'}
            </AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteHabit} className="bg-destructive hover:bg-destructive/90">
              {language === 'en' ? 'Delete' : 'Șterge'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};
