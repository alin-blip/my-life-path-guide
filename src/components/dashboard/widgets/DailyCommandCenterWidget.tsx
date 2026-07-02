import React, { useState, useMemo } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { useDailyScore } from '@/hooks/useDailyScore';
import { useDailyHabits, DailyHabit } from '@/hooks/useDailyHabits';
import { useTodaysTasks } from '@/hooks/useTodaysTasks';
import { DragDropContext, Droppable, Draggable, DropResult } from '@hello-pangea/dnd';

import { useNavigate } from 'react-router-dom';
import { 
  Target, 
  ArrowRight, 
  Flame, 
  Star,
  CheckCircle2,
  Circle,
  Zap,
  Trophy,
  Settings,
  Dumbbell,
  Brain,
  Users,
  Briefcase,
  Plus,
  Sparkles,
  ListTodo,
  Trash2,
  GripVertical
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { ChampionRoutineSettings } from '@/components/champion-routine/ChampionRoutineSettings';
import { AddHabitDialog } from '@/components/habits/AddHabitDialog';
import { HabitSettingsModal } from '@/components/habits/HabitSettingsModal';
import { Dialog, DialogContent } from '@/components/ui/dialog';

// Map habit names to routine steps
const HABIT_TO_STEP_MAP: Record<string, string> = {
  'meditation': 'meditation',
  'Meditation': 'meditation',
  'meditatie': 'meditation',
  'Meditatie': 'meditation',
  'workout': 'exercise',
  'Workout': 'exercise',
  'exercise': 'exercise',
  'Exercise': 'exercise',
  'fitness': 'exercise',
  'Fitness': 'exercise',
  'tracking workout': 'exercise',
  'fuel': 'mealPlanning',
  'Fuel': 'mealPlanning',
  'nutriție': 'mealPlanning',
  'Nutriție': 'mealPlanning',
  'nutrition': 'mealPlanning',
  'content': 'contentCreation',
  'Content': 'contentCreation',
  'creaza continut': 'contentCreation',
  'memoirs': 'dailyTasks',
  'Memoirs': 'dailyTasks',
  'citire': 'dailyTasks',
  'citeste': 'dailyTasks',
};

// Default category config
const DEFAULT_CATEGORY_CONFIG: Record<string, { icon: React.ElementType; color: string; bgColor: string; label: string }> = {
  body: { icon: Dumbbell, color: 'text-red-500', bgColor: 'bg-red-500/10', label: 'Corp' },
  being: { icon: Brain, color: 'text-purple-500', bgColor: 'bg-purple-500/10', label: 'Spiritualitate' },
  balance: { icon: Users, color: 'text-pink-500', bgColor: 'bg-pink-500/10', label: 'Relații' },
  business: { icon: Briefcase, color: 'text-blue-500', bgColor: 'bg-blue-500/10', label: 'Business' },
};

// Colors for custom categories
const CUSTOM_CATEGORY_COLORS = [
  { color: 'text-emerald-500', bgColor: 'bg-emerald-500/10' },
  { color: 'text-amber-500', bgColor: 'bg-amber-500/10' },
  { color: 'text-cyan-500', bgColor: 'bg-cyan-500/10' },
  { color: 'text-violet-500', bgColor: 'bg-violet-500/10' },
  { color: 'text-rose-500', bgColor: 'bg-rose-500/10' },
  { color: 'text-teal-500', bgColor: 'bg-teal-500/10' },
];

export const DailyCommandCenterWidget: React.FC = () => {
  const { data, loading } = useDailyScore();
  const { habits, isHabitCompleted, toggleHabit, addHabit, updateHabit, deleteHabit, refetch, getHabitStreak, reorderHabits } = useDailyHabits();
  const { tasks, bigOne: tasksBigOne, toggleTask, addTask, deleteTask, completedCount: tasksCompleted, totalCount: tasksTotal, isLoading: tasksLoading } = useTodaysTasks();
  const navigate = useNavigate();
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [habitSettingsOpen, setHabitSettingsOpen] = useState(false);
  const [addHabitOpen, setAddHabitOpen] = useState(false);
  const [addHabitCategory, setAddHabitCategory] = useState<string>('body');
  const [customCategories, setCustomCategories] = useState<string[]>([]);
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [isAddingTask, setIsAddingTask] = useState(false);

  // Get all unique categories from habits (including custom ones)
  const allCategories = useMemo(() => {
    const categoriesFromHabits = [...new Set(habits.map(h => h.category))];
    const defaultCats = ['body', 'being', 'balance', 'business', 'minte'];
    const allCats = [...new Set([...defaultCats, ...categoriesFromHabits, ...customCategories])];
    return allCats;
  }, [habits, customCategories]);

  // Build category config dynamically
  const categoryConfig = useMemo(() => {
    const config: Record<string, { icon: React.ElementType; color: string; bgColor: string; label: string }> = { ...DEFAULT_CATEGORY_CONFIG };
    
    let customIndex = 0;
    allCategories.forEach(cat => {
      if (!config[cat]) {
        const colorSet = CUSTOM_CATEGORY_COLORS[customIndex % CUSTOM_CATEGORY_COLORS.length];
        config[cat] = {
          icon: Sparkles,
          ...colorSet,
          label: cat.charAt(0).toUpperCase() + cat.slice(1).replace(/_/g, ' '),
        };
        customIndex++;
      }
    });
    
    return config;
  }, [allCategories]);

  // Organize habits by category
  const habitsByCategory = useMemo(() => {
    const allActiveHabits = habits.filter(h => h.is_active);
    const byCategory: Record<string, typeof habits> = {};
    
    allCategories.forEach(cat => {
      byCategory[cat] = allActiveHabits.filter(h => h.category === cat);
    });
    
    return byCategory;
  }, [habits, allCategories]);

  if (loading) {
    return (
      <Card className="bg-gradient-to-br from-primary/10 via-background to-secondary/10 border-primary/20">
        <CardContent className="p-6 space-y-6">
          {/* Greeting + score */}
          <div className="flex items-center justify-between">
            <div className="space-y-2">
              <div className="h-6 w-48 bg-muted rounded animate-pulse" />
              <div className="h-4 w-32 bg-muted/70 rounded animate-pulse" />
            </div>
            <div className="h-16 w-16 rounded-full bg-muted animate-pulse" />
          </div>
          {/* Progress bar */}
          <div className="h-3 w-full bg-muted rounded-full animate-pulse" />
          {/* Category tiles */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {[0, 1, 2, 3].map((i) => (
              <div key={i} className="h-24 bg-muted/70 rounded-lg animate-pulse" />
            ))}
          </div>
          {/* Task list */}
          <div className="space-y-2">
            <div className="h-10 bg-muted/60 rounded-lg animate-pulse" />
            <div className="h-10 bg-muted/60 rounded-lg animate-pulse" />
            <div className="h-10 bg-muted/60 rounded-lg animate-pulse" />
          </div>
        </CardContent>
      </Card>
    );
  }

  const { totalScore, bigOne, nextAction, progress, streak, xpLevel, greeting } = data;

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-500';
    if (score >= 60) return 'text-yellow-500';
    if (score >= 40) return 'text-orange-500';
    return 'text-red-500';
  };

  const getScoreGradient = (score: number) => {
    if (score >= 80) return 'from-green-500/20 to-emerald-500/10';
    if (score >= 60) return 'from-yellow-500/20 to-amber-500/10';
    if (score >= 40) return 'from-orange-500/20 to-amber-500/10';
    return 'from-red-500/20 to-orange-500/10';
  };

  const handleActionClick = () => {
    if (nextAction.route) {
      navigate(nextAction.route);
    }
  };

  const handleHabitClick = async (habit: any) => {
    await toggleHabit(habit.id);
  };

  const handleAddHabitClick = (category: string) => {
    setAddHabitCategory(category);
    setAddHabitOpen(true);
  };

  const handleAddHabit = async (habitData: any) => {
    await addHabit(habitData);
    await refetch();
  };

  const handleAddCategory = (category: string) => {
    if (!customCategories.includes(category)) {
      setCustomCategories(prev => [...prev, category]);
    }
  };

  // Handle drag end for habit reordering
  const handleDragEnd = async (result: DropResult) => {
    if (!result.destination) return;
    
    const category = result.source.droppableId;
    const categoryHabits = [...(habitsByCategory[category] || [])];
    
    const [reorderedItem] = categoryHabits.splice(result.source.index, 1);
    categoryHabits.splice(result.destination.index, 0, reorderedItem);
    
    // Update positions
    const updatedHabits = categoryHabits.map((habit, index) => ({
      ...habit,
      position: index,
    }));
    
    await reorderHabits(updatedHabits);
  };

  // Filter categories to show (only those with habits or that have been added)
  const categoriesToShow = allCategories.filter(cat => 
    habitsByCategory[cat]?.length > 0 || customCategories.includes(cat)
  );

  return (
    <>
      <Card className={cn(
        "relative overflow-hidden border-primary/30",
        "bg-gradient-to-br",
        getScoreGradient(totalScore)
      )}>
        <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-24 h-24 bg-secondary/5 rounded-full blur-2xl" />
        
        <CardContent className="relative p-4 md:p-6">
          {/* Header Row */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-full bg-primary/10">
                <Target className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h2 className="text-lg font-semibold">{greeting}, Campion!</h2>
                <p className="text-sm text-muted-foreground">
                  Nivel {xpLevel} • 
                  {streak > 0 && (
                    <span className="inline-flex items-center ml-1">
                      <Flame className="h-3 w-3 text-orange-500 mr-0.5" />
                      {streak} zile
                    </span>
                  )}
                </p>
              </div>
            </div>
            
            {/* Score Circle */}
            <div className="relative">
              <div className={cn(
                "flex flex-col items-center justify-center w-16 h-16 rounded-full",
                "bg-background/80 backdrop-blur border-2",
                totalScore >= 80 ? "border-green-500" : 
                totalScore >= 60 ? "border-yellow-500" : 
                totalScore >= 40 ? "border-orange-500" : "border-red-500"
              )}>
                <span className={cn("text-2xl font-bold", getScoreColor(totalScore))}>
                  {totalScore}
                </span>
                <span className="text-[10px] text-muted-foreground">/ 100</span>
              </div>
              {totalScore === 100 && (
                <Trophy className="absolute -top-1 -right-1 h-5 w-5 text-yellow-500" />
              )}
            </div>
          </div>

          {/* Progress Bar */}
          <div className="mb-4">
            <Progress value={totalScore} className="h-2" />
          </div>

          {/* Big One Section - Clickable to Focus Room */}
          {bigOne.text && (
            <div 
              className="mb-4 p-3 rounded-lg bg-background/50 border border-border/50 cursor-pointer hover:border-primary/50 hover:bg-primary/5 transition-all group"
              onClick={() => navigate('/focus')}
            >
              <div className="flex items-start gap-2">
                <Star className="h-4 w-4 text-yellow-500 mt-0.5 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">
                    Big One de Azi
                  </p>
                  <p className={cn(
                    "text-sm font-medium truncate",
                    bigOne.completed && "line-through text-muted-foreground"
                  )}>
                    {bigOne.text}
                  </p>
                </div>
                {bigOne.completed ? (
                  <CheckCircle2 className="h-5 w-5 text-green-500 flex-shrink-0" />
                ) : (
                  <ArrowRight className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors flex-shrink-0" />
                )}
              </div>
            </div>
          )}

          {/* Quick Stats Row */}
          <div className="grid grid-cols-3 gap-2 mb-4">
            <div className="flex flex-col items-center p-2 rounded-lg bg-background/30">
              <span className="text-xs text-muted-foreground">Rutină Campion</span>
              <span className={cn("text-sm font-semibold", progress.routine.done ? "text-green-500" : "text-muted-foreground")}>
                {progress.routine.done ? '✓' : '−'}
              </span>
            </div>
            <button
              type="button"
              onClick={() => navigate('/champion-routine')}
              className="flex flex-col items-center p-2 rounded-lg bg-background/30 hover:bg-background/60 transition-colors cursor-pointer"
              aria-label="Deschide Rutina Campion (Core 4)"
            >
              <span className="text-xs text-muted-foreground">Core 4</span>
              <span className="text-sm font-semibold">
                {progress.core.completed}/{progress.core.total}
              </span>
            </button>
            <button
              type="button"
              onClick={() => navigate('/biz4-report')}
              className="flex flex-col items-center p-2 rounded-lg bg-background/30 hover:bg-background/60 transition-colors cursor-pointer"
              aria-label="Deschide Raport Biz 4"
            >
              <span className="text-xs text-muted-foreground">Biz 4</span>
              <span className="text-sm font-semibold">
                {progress.biz.completed}/{progress.biz.total}
              </span>
            </button>
          </div>

          {/* Main Action Button - Start Routine */}
          <Button 
            onClick={handleActionClick}
            className="w-full mb-4 group"
            variant={nextAction.type === 'complete' ? 'secondary' : 'default'}
          >
            <Zap className="h-4 w-4 mr-2" />
            <span className="truncate">{nextAction.title}</span>
            {nextAction.route && (
              <ArrowRight className="h-4 w-4 ml-2 group-hover:translate-x-1 transition-transform" />
            )}
          </Button>

          {/* Habits Grid - Dynamic Categories */}
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-lg font-bold text-foreground">Habit Tracker</h3>
              <p className="text-xs text-muted-foreground">Track your daily habits</p>
            </div>
          </div>
          <DragDropContext onDragEnd={handleDragEnd}>
            <div className="grid grid-cols-2 gap-3 mb-4">
              {categoriesToShow.map((category) => {
                const config = categoryConfig[category];
                const categoryHabits = habitsByCategory[category] || [];
                const Icon = config?.icon || Sparkles;
                const completedCount = categoryHabits.filter(h => isHabitCompleted(h.id)).length;
                
                return (
                  <Droppable key={category} droppableId={category}>
                    {(provided, snapshot) => (
                      <div 
                        ref={provided.innerRef}
                        {...provided.droppableProps}
                        className={cn(
                          "p-3 rounded-lg border border-border/50",
                          config?.bgColor || 'bg-muted/10',
                          snapshot.isDraggingOver && 'ring-2 ring-primary/50'
                        )}
                      >
                        <div className="flex items-center gap-2 mb-2">
                          <Icon className={cn("h-4 w-4", config?.color || 'text-muted-foreground')} />
                          <span className="text-xs font-medium">
                            {config?.label || category}
                          </span>
                          <span className="text-xs text-muted-foreground ml-auto">
                            {completedCount}/{categoryHabits.length}
                          </span>
                        </div>
                        <div className="space-y-1">
                          {categoryHabits.map((habit, index) => {
                            const completed = isHabitCompleted(habit.id);
                            const streak = getHabitStreak(habit.id);
                            return (
                              <Draggable key={habit.id} draggableId={habit.id} index={index}>
                                {(provided, snapshot) => (
                                  <div
                                    ref={provided.innerRef}
                                    {...provided.draggableProps}
                                    className={cn(
                                      "flex items-center gap-1 text-xs py-1 px-1 rounded transition-colors",
                                      "hover:bg-background/50",
                                      snapshot.isDragging && "shadow-lg bg-background",
                                      completed && "text-muted-foreground"
                                    )}
                                  >
                                    {/* Drag handle */}
                                    <div {...provided.dragHandleProps} className="cursor-grab active:cursor-grabbing">
                                      <GripVertical className="h-3 w-3 text-muted-foreground/50" />
                                    </div>
                                    
                                    {/* Toggle button */}
                                    <button 
                                      onClick={() => handleHabitClick(habit)}
                                      className="flex items-center gap-1.5 flex-1 min-w-0"
                                    >
                                      {completed ? (
                                        <CheckCircle2 className="h-3 w-3 text-green-500 flex-shrink-0" />
                                      ) : (
                                        <Circle className="h-3 w-3 text-muted-foreground flex-shrink-0" />
                                      )}
                                      <span className={cn("truncate", completed && "line-through")}>
                                        {habit.name}
                                      </span>
                                    </button>
                                    
                                    {/* Streak indicator */}
                                    {streak > 1 && (
                                      <span className="flex items-center text-orange-500 text-[10px] flex-shrink-0">
                                        <Flame className="h-2.5 w-2.5" />
                                        {streak}
                                      </span>
                                    )}
                                  </div>
                                )}
                              </Draggable>
                            );
                          })}
                          {provided.placeholder}
                          {/* Add habit button */}
                          <button
                            onClick={() => handleAddHabitClick(category)}
                            className="flex items-center gap-2 w-full text-left text-xs py-1 px-1 rounded hover:bg-background/50 transition-colors text-muted-foreground hover:text-foreground"
                          >
                            <Plus className="h-3 w-3 flex-shrink-0 ml-4" />
                            <span>Adaugă habit</span>
                          </button>
                        </div>
                      </div>
                    )}
                  </Droppable>
                );
              })}

              {/* Add new category card */}
              <button
                onClick={() => {
                  setAddHabitCategory('');
                  setAddHabitOpen(true);
                }}
                className="p-3 rounded-lg border border-dashed border-border/50 hover:border-primary/50 hover:bg-primary/5 transition-colors flex flex-col items-center justify-center gap-2 min-h-[100px]"
              >
                <Plus className="h-5 w-5 text-muted-foreground" />
                <span className="text-xs text-muted-foreground">Adaugă categorie</span>
              </button>
            </div>
          </DragDropContext>

          {/* Sarcini Section - Synchronized with /door */}
          <div className="mt-4 pt-4 border-t border-border/30">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <ListTodo className="h-5 w-5 text-primary" />
                <span className="text-lg font-semibold">Sarcini</span>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="h-6 px-2 text-xs text-muted-foreground hover:text-primary"
                  onClick={() => navigate('/door?tab=sarcini')}
                >
                  <ArrowRight className="h-3 w-3 mr-1" />
                  Deschide
                </Button>
              </div>
              <span className="text-sm text-muted-foreground">
                {tasksCompleted}/{tasksTotal}
              </span>
            </div>
            
            {/* Progress bar */}
            {tasksTotal > 0 && (
              <div className="w-full bg-muted rounded-full h-2 mb-3">
                <div 
                  className="bg-primary h-2 rounded-full transition-all duration-300"
                  style={{ width: `${tasksTotal > 0 ? (tasksCompleted / tasksTotal) * 100 : 0}%` }}
                />
              </div>
            )}

            {/* Big One Today */}
            {tasksBigOne && (
              <div className="p-3 rounded-lg bg-primary/10 border border-primary/20 mb-3">
                <div className="flex items-center gap-2 text-sm font-medium text-primary mb-1">
                  <Star className="h-4 w-4 fill-primary" />
                  Prioritatea Zilei
                </div>
                <p className="text-foreground font-medium">{tasksBigOne}</p>
              </div>
            )}

            {/* Task List */}
            <div className="space-y-2 max-h-[200px] overflow-y-auto">
              {tasksLoading ? (
                <div className="animate-pulse space-y-2">
                  <div className="h-8 bg-muted rounded"></div>
                  <div className="h-8 bg-muted rounded"></div>
                </div>
              ) : tasks.length === 0 ? (
                <div className="text-center py-4">
                  <p className="text-sm text-muted-foreground mb-2">
                    Nu ai sarcini pentru azi
                  </p>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => navigate('/door?tab=sarcini')}
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Planifică în Door
                  </Button>
                </div>
              ) : (
                tasks.map(task => (
                  <div 
                    key={task.id}
                    className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted/50 group"
                  >
                    <Checkbox
                      checked={task.completed}
                      onCheckedChange={() => toggleTask(task.id)}
                    />
                    <span className={cn(
                      "flex-1 text-sm",
                      task.completed ? "line-through text-muted-foreground" : ""
                    )}>
                      {task.title}
                    </span>
                    <div className="opacity-0 group-hover:opacity-100 flex gap-1 transition-opacity">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 text-destructive"
                        onClick={() => deleteTask(task.id)}
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Quick Add + Door Link */}
            {tasks.length > 0 && (
              <div className="flex gap-2 mt-3">
                {isAddingTask ? (
                  <>
                    <Input
                      value={newTaskTitle}
                      onChange={(e) => setNewTaskTitle(e.target.value)}
                      placeholder="Sarcină rapidă..."
                      className="flex-1"
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && newTaskTitle.trim()) {
                          addTask(newTaskTitle);
                          setNewTaskTitle('');
                          setIsAddingTask(false);
                        }
                        if (e.key === 'Escape') {
                          setIsAddingTask(false);
                          setNewTaskTitle('');
                        }
                      }}
                      autoFocus
                    />
                    <Button size="sm" onClick={() => {
                      if (newTaskTitle.trim()) {
                        addTask(newTaskTitle);
                        setNewTaskTitle('');
                        setIsAddingTask(false);
                      }
                    }}>
                      <Plus className="h-4 w-4" />
                    </Button>
                  </>
                ) : (
                  <>
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1"
                      onClick={() => setIsAddingTask(true)}
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Adaugă rapid
                    </Button>
                  </>
                )}
              </div>
            )}

            {/* Completion message */}
            {tasksTotal > 0 && tasksCompleted === tasksTotal && (
              <div className="flex items-center justify-center gap-2 text-sm text-green-600 dark:text-green-400 py-2">
                <CheckCircle2 className="h-4 w-4" />
                Toate sarcinile completate!
              </div>
            )}
          </div>

          {/* Settings Button */}
          <div className="flex justify-center mt-4">
            <Button 
              variant="outline"
              size="sm"
              onClick={() => setSettingsOpen(true)}
              className="flex-shrink-0"
            >
              <Settings className="h-4 w-4 mr-2" />
              <span className="text-xs">Setări</span>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Settings Dialog - ChampionRoutineSettings has its own Dialog */}
      <ChampionRoutineSettings open={settingsOpen} onOpenChange={setSettingsOpen} />

      {/* Add Habit Dialog */}
      <AddHabitDialog
        open={addHabitOpen}
        onOpenChange={setAddHabitOpen}
        onAdd={handleAddHabit}
        defaultCategory={addHabitCategory}
        availableCategories={allCategories}
        onAddCategory={handleAddCategory}
      />

      {/* Habit Settings Modal */}
      <HabitSettingsModal
        open={habitSettingsOpen}
        onOpenChange={setHabitSettingsOpen}
        habits={habits as DailyHabit[]}
        onAdd={async (habit) => {
          const result = await addHabit(habit);
          return result;
        }}
        onUpdate={updateHabit}
        onDelete={deleteHabit}
        onRefetch={refetch}
      />
    </>
  );
};
