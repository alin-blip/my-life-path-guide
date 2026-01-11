import React from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  Check, 
  X, 
  SkipForward, 
  Sun, 
  Droplets, 
  Wind, 
  Brain, 
  Heart, 
  Eye, 
  MessageSquare, 
  BookOpen, 
  PenLine, 
  Dumbbell, 
  Utensils, 
  Video, 
  ListTodo, 
  Users,
  Sparkles,
  Trophy
} from 'lucide-react';
import { RoutineStepId } from './ChampionRoutineFlow';
import { ChampionLog } from '@/hooks/useChampionRoutine';
import { cn } from '@/lib/utils';

interface RoutineBreakdownProps {
  routineSteps: RoutineStepId[];
  todayLog: ChampionLog | null;
  skippedSteps: RoutineStepId[];
  onGoToStep: (stepId: RoutineStepId) => void;
}

const STEP_ICONS: Record<RoutineStepId, React.ComponentType<{ className?: string }>> = {
  lightExposure: Sun,
  hydration: Droplets,
  breathing: Wind,
  meditation: Brain,
  gratitude: Heart,
  visualization: Eye,
  autosuggestion: MessageSquare,
  visionDeclaration: BookOpen,
  journaling: PenLine,
  reading: BookOpen,
  exercise: Dumbbell,
  mealPlanning: Utensils,
  learn: BookOpen,
  apply: Sparkles,
  contentCreation: Video,
  dailyTasks: ListTodo,
  relationships: Users,
  habit_body: Dumbbell,
  habit_being: Sparkles,
  habit_balance: Heart,
  habit_business: ListTodo,
  todaysTasks: ListTodo,
  completion: Trophy,
};

const STEP_LABELS: Record<RoutineStepId, string> = {
  gratitude: 'Recunoștință',
  hydration: 'Hidratare',
  meditation: 'Meditație',
  autosuggestion: 'Autosugestie',
  visionDeclaration: 'Declarație Viziune',
  exercise: 'Exerciții',
  mealPlanning: 'Meal Planning',
  learn: 'Învață',
  apply: 'Aplică/Predă',
  contentCreation: 'Content Creation',
  dailyTasks: 'Daily Tasks',
  relationships: 'Relații',
  breathing: 'Respirație',
  visualization: 'Vizualizare',
  reading: 'Citit',
  journaling: 'Journaling',
  lightExposure: 'Lumină Naturală',
  habit_body: 'Habits: Corp',
  habit_being: 'Habits: Spirit',
  habit_balance: 'Habits: Relații',
  habit_business: 'Habits: Business',
  todaysTasks: 'Sarcinile de Azi',
  completion: 'Finalizare',
};

const STEP_CATEGORIES: Record<RoutineStepId, 'being' | 'body' | 'business' | 'balance' | 'complete' | 'habits' | 'tasks'> = {
  gratitude: 'being',
  hydration: 'being',
  meditation: 'being',
  autosuggestion: 'being',
  visionDeclaration: 'being',
  breathing: 'being',
  visualization: 'being',
  reading: 'being',
  journaling: 'being',
  lightExposure: 'being',
  exercise: 'body',
  mealPlanning: 'body',
  learn: 'business',
  apply: 'business',
  contentCreation: 'business',
  dailyTasks: 'business',
  relationships: 'balance',
  habit_body: 'habits',
  habit_being: 'habits',
  habit_balance: 'habits',
  habit_business: 'habits',
  todaysTasks: 'tasks',
  completion: 'complete',
};

const CATEGORY_CONFIG = {
  being: { label: 'Mindset', color: 'text-purple-500', bgColor: 'bg-purple-500/10', borderColor: 'border-purple-500/30' },
  body: { label: 'Corp', color: 'text-red-500', bgColor: 'bg-red-500/10', borderColor: 'border-red-500/30' },
  business: { label: 'Business', color: 'text-blue-500', bgColor: 'bg-blue-500/10', borderColor: 'border-blue-500/30' },
  balance: { label: 'Relații', color: 'text-pink-500', bgColor: 'bg-pink-500/10', borderColor: 'border-pink-500/30' },
  habits: { label: 'Habits', color: 'text-amber-500', bgColor: 'bg-amber-500/10', borderColor: 'border-amber-500/30' },
  tasks: { label: 'Tasks', color: 'text-emerald-500', bgColor: 'bg-emerald-500/10', borderColor: 'border-emerald-500/30' },
  complete: { label: 'Complete', color: 'text-green-500', bgColor: 'bg-green-500/10', borderColor: 'border-green-500/30' },
};

// Check if a step is completed based on log data
const isStepCompleted = (stepId: RoutineStepId, log: ChampionLog | null): boolean => {
  if (!log) return false;
  
  switch (stepId) {
    case 'gratitude':
      return (log.gratitude_items || []).some(i => i?.trim());
    case 'hydration':
      return log.water_drunk === true;
    case 'meditation':
      return (log.meditation_duration_seconds || 0) >= 600;
    case 'autosuggestion':
      return log.autosuggestion_completed === true;
    case 'exercise':
      return log.exercise_completed === true;
    case 'mealPlanning':
      return (log.meals_logged || []).length > 0;
    case 'learn':
      return log.learn_completed === true;
    case 'apply':
      return log.apply_completed === true;
    case 'contentCreation':
      return !!log.content_script || (log.pomodoro_sessions || 0) > 0;
    case 'dailyTasks':
      return !!log.big_one_today || (log.daily_todos || []).some(t => t.completed);
    case 'relationships':
      return (log.relationship_actions || []).some(a => a.completed);
    case 'breathing':
      return log.breathing_completed === true;
    case 'visualization':
      return log.visualization_completed === true;
    case 'reading':
      return log.reading_completed === true;
    case 'journaling':
      return log.journaling_completed === true;
    case 'lightExposure':
      return log.light_exposure === true;
    default:
      return false;
  }
};

export function RoutineBreakdown({ routineSteps, todayLog, skippedSteps, onGoToStep }: RoutineBreakdownProps) {
  // Filter out completion step
  const stepsToShow = routineSteps.filter(s => s !== 'completion');
  
  // Group steps by category
  const groupedSteps = stepsToShow.reduce((acc, stepId) => {
    const category = STEP_CATEGORIES[stepId];
    if (!acc[category]) {
      acc[category] = [];
    }
    acc[category].push(stepId);
    return acc;
  }, {} as Record<string, RoutineStepId[]>);

  const categories = Object.keys(groupedSteps) as Array<keyof typeof CATEGORY_CONFIG>;

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-center">Breakdown Rutină</h3>
      
      <div className="space-y-3">
        {categories.map(category => {
          const config = CATEGORY_CONFIG[category];
          const steps = groupedSteps[category];
          
          return (
            <Card key={category} className={cn("p-3 border", config.borderColor, config.bgColor)}>
              <div className={cn("text-sm font-medium mb-2", config.color)}>
                {config.label}
              </div>
              
              <div className="space-y-2">
                {steps.map(stepId => {
                  const Icon = STEP_ICONS[stepId];
                  const isCompleted = isStepCompleted(stepId, todayLog);
                  const isSkipped = skippedSteps.includes(stepId);
                  
                  return (
                    <div 
                      key={stepId}
                      className="flex items-center justify-between gap-2 py-1.5 px-2 rounded-md bg-background/50"
                    >
                      <div className="flex items-center gap-2 flex-1 min-w-0">
                        <Icon className="h-4 w-4 shrink-0 text-muted-foreground" />
                        <span className="text-sm truncate">{STEP_LABELS[stepId]}</span>
                      </div>
                      
                      <div className="flex items-center gap-2 shrink-0">
                        {isCompleted ? (
                          <div className="flex items-center gap-1 text-green-500">
                            <Check className="h-4 w-4" />
                            <span className="text-xs">Done</span>
                          </div>
                        ) : isSkipped ? (
                          <div className="flex items-center gap-1 text-muted-foreground">
                            <SkipForward className="h-4 w-4" />
                            <span className="text-xs">Sărit</span>
                          </div>
                        ) : (
                          <div className="flex items-center gap-1 text-destructive">
                            <X className="h-4 w-4" />
                          </div>
                        )}
                        
                        {!isCompleted && (
                          <Button 
                            size="sm" 
                            variant="outline" 
                            className="h-7 text-xs px-2"
                            onClick={() => onGoToStep(stepId)}
                          >
                            {isSkipped ? 'Repetă' : 'Completează'}
                          </Button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
