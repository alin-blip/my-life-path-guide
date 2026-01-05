import React, { useState, useCallback, useMemo, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { ChevronLeft, Settings, History, Bell } from 'lucide-react';
import { useChampionRoutine, ChampionLog } from '@/hooks/useChampionRoutine';
import { ChampionRoutineSettings } from './ChampionRoutineSettings';
import { NotificationSettings } from './NotificationSettings';
import { debounce } from '@/lib/utils';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';

// Step components
import { GratitudeStep } from './steps/GratitudeStep';
import { HydrationStep } from './steps/HydrationStep';
import { MeditationStep } from './steps/MeditationStep';
import { AutosuggestionStep } from './steps/AutosuggestionStep';
import { ExerciseStep } from './steps/ExerciseStep';
import { MealPlanningStep } from './steps/MealPlanningStep';
import { ContentCreationStep } from './steps/ContentCreationStep';
import { DailyTasksStep } from './steps/DailyTasksStep';
import { RelationshipStep } from './steps/RelationshipStep';
import { CompletionStep } from './steps/CompletionStep';

// Setup UI components
import { Card } from '@/components/ui/card';
import { Dumbbell, Sparkles, Heart, Target } from 'lucide-react';

interface ChampionRoutineFlowProps {
  onComplete?: () => void;
}

export type RoutineStepId = 
  | 'gratitude' 
  | 'hydration' 
  | 'meditation' 
  | 'autosuggestion' 
  | 'exercise' 
  | 'mealPlanning'
  | 'contentCreation'
  | 'dailyTasks'
  | 'relationships'
  | 'completion';

// Default order for Execution Room
const DEFAULT_ROUTINE_STEPS: RoutineStepId[] = [
  'gratitude',        // 1. Being - Recunoștință
  'hydration',        // 2. Being - Hidratare
  'meditation',       // 3. Being - Meditație (min 10 min)
  'autosuggestion',   // 4. Being - Autosugestie
  'exercise',         // 5. Body - Exerciții cu timer
  'mealPlanning',     // 6. Body - Meal Planning
  'contentCreation',  // 7. Business - Content + AI Script + Pomodoro
  'dailyTasks',       // 8. Business - Tasks / Big One
  'relationships',    // 9. Balance - Relații
  'completion',       // 10. Finalizare
];

const STEP_LABELS: Record<RoutineStepId, string> = {
  gratitude: 'Recunoștință',
  hydration: 'Hidratare',
  meditation: 'Meditație',
  autosuggestion: 'Autosugestie',
  exercise: 'Exerciții',
  mealPlanning: 'Meal Planning',
  contentCreation: 'Content Creation',
  dailyTasks: 'Daily Tasks',
  relationships: 'Relații',
  completion: 'Finalizare',
};

const STEP_CATEGORIES: Record<RoutineStepId, 'being' | 'body' | 'business' | 'balance' | 'complete'> = {
  gratitude: 'being',
  hydration: 'being',
  meditation: 'being',
  autosuggestion: 'being',
  exercise: 'body',
  mealPlanning: 'body',
  contentCreation: 'business',
  dailyTasks: 'business',
  relationships: 'balance',
  completion: 'complete',
};

const CATEGORY_COLORS = {
  being: 'text-purple-500',
  body: 'text-red-500',
  business: 'text-blue-500',
  balance: 'text-pink-500',
  complete: 'text-green-500',
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
      return (log.meditation_duration_seconds || 0) >= 600; // 10 minutes
    case 'autosuggestion':
      return log.autosuggestion_completed === true;
    case 'exercise':
      return log.exercise_completed === true;
    case 'mealPlanning':
      return (log.meals_logged || []).length > 0;
    case 'contentCreation':
      return !!log.content_script || (log.pomodoro_sessions || 0) > 0;
    case 'dailyTasks':
      return !!log.big_one_today || (log.daily_todos || []).some(t => t.completed);
    case 'relationships':
      return (log.relationship_actions || []).some(a => a.completed);
    case 'completion':
      return false; // Completion is never "completed" - it's the end screen
    default:
      return false;
  }
};

export function ChampionRoutineFlow({ onComplete }: ChampionRoutineFlowProps) {
  const navigate = useNavigate();
  const { user } = useAuth();
  const {
    people,
    settings,
    todayLog,
    isLoading,
    isConfigured,
    autosuggestion,
    updateLog,
    updateMeals,
    updateAutosuggestion,
    saveSettings,
  } = useChampionRoutine();

  // Get active and ordered steps based on settings
  const routineSteps = useMemo((): RoutineStepId[] => {
    const activeSteps = settings?.active_steps || [];
    const stepsOrder = settings?.routine_steps_order || [];

    // If no custom order, use default
    if (stepsOrder.length === 0) {
      return DEFAULT_ROUTINE_STEPS;
    }

    // Filter by active steps (if activeSteps is empty, all are active)
    let steps = stepsOrder.filter(id => 
      DEFAULT_ROUTINE_STEPS.includes(id as RoutineStepId)
    ) as RoutineStepId[];

    // Filter out inactive steps
    if (activeSteps.length > 0) {
      steps = steps.filter(id => activeSteps.includes(id) || id === 'completion');
    }

    // Always ensure completion is at the end
    if (!steps.includes('completion')) {
      steps.push('completion');
    }

    // Skip relationships if no people configured
    if (people.length === 0) {
      steps = steps.filter(id => id !== 'relationships');
    }

    return steps;
  }, [settings, people]);

  // Find first incomplete step
  const getFirstIncompleteStepIndex = useCallback((log: ChampionLog | null): number => {
    for (let i = 0; i < routineSteps.length; i++) {
      const stepId = routineSteps[i];
      if (stepId === 'completion') {
        return i; // If we reach completion, show it
      }
      if (!isStepCompleted(stepId, log)) {
        return i;
      }
    }
    return 0;
  }, [routineSteps]);

const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [showNotificationSettings, setShowNotificationSettings] = useState(false);
  
  // Track skipped steps in localStorage
  const today = new Date().toISOString().split('T')[0];
  const skippedStepsKey = `champion_skipped_steps_${today}`;
  
  const getSkippedSteps = useCallback((): RoutineStepId[] => {
    try {
      const saved = localStorage.getItem(skippedStepsKey);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  }, [skippedStepsKey]);
  
  const addSkippedStep = useCallback((stepId: RoutineStepId) => {
    const skipped = getSkippedSteps();
    if (!skipped.includes(stepId)) {
      skipped.push(stepId);
      localStorage.setItem(skippedStepsKey, JSON.stringify(skipped));
    }
  }, [getSkippedSteps, skippedStepsKey]);

  // Set initial step to first incomplete when data loads (considering skipped steps)
  useEffect(() => {
    if (!isLoading && todayLog && isConfigured) {
      const skippedSteps = getSkippedSteps();
      
      // Find first step that is neither completed nor skipped
      let firstIncomplete = 0;
      for (let i = 0; i < routineSteps.length; i++) {
        const stepId = routineSteps[i];
        if (stepId === 'completion') {
          firstIncomplete = i;
          break;
        }
        const isCompleted = isStepCompleted(stepId, todayLog);
        const isSkipped = skippedSteps.includes(stepId);
        if (!isCompleted && !isSkipped) {
          firstIncomplete = i;
          break;
        }
        // If all steps are completed or skipped, go to completion
        if (i === routineSteps.length - 2) {
          firstIncomplete = routineSteps.length - 1; // completion step
        }
      }
      setCurrentStepIndex(firstIncomplete);
    }
  }, [isLoading, todayLog, isConfigured, routineSteps, getSkippedSteps]);

  // Debounced update for text inputs
  const debouncedUpdateLog = useCallback(
    debounce((field: string, value: any) => updateLog(field as any, value), 500),
    [updateLog]
  );

  const currentStepId = routineSteps[currentStepIndex];
  const currentCategory = STEP_CATEGORIES[currentStepId];
  const progress = ((currentStepIndex + 1) / routineSteps.length) * 100;

  const goToNextStep = () => {
    if (currentStepIndex < routineSteps.length - 1) {
      setCurrentStepIndex(currentStepIndex + 1);
    }
  };

  const goToPreviousStep = () => {
    if (currentStepIndex > 0) {
      setCurrentStepIndex(currentStepIndex - 1);
    }
  };
  
  const skipCurrentStep = () => {
    addSkippedStep(currentStepId);
    goToNextStep();
  };

  if (isLoading) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  // Show setup UI for new users
  if (!isConfigured) {
    return (
      <>
        <div className="min-h-[70vh] flex flex-col items-center justify-center px-4">
          <Card className="w-full max-w-2xl p-8 space-y-8">
            <div className="text-center space-y-4">
              <h1 className="text-3xl font-bold">Rutina de Campion</h1>
              <p className="text-muted-foreground text-lg">
                Execution Room - Deep Work pentru cele 4 arii ale vieții
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              {[
                { icon: Sparkles, label: 'Spiritualitate', desc: 'Meditație, Recunoștință', color: 'from-purple-500/20 to-indigo-500/20 border-purple-500/30' },
                { icon: Dumbbell, label: 'Corp', desc: 'Exerciții, Nutriție', color: 'from-orange-500/20 to-red-500/20 border-orange-500/30' },
                { icon: Target, label: 'Business', desc: 'Content, Tasks', color: 'from-blue-500/20 to-cyan-500/20 border-blue-500/30' },
                { icon: Heart, label: 'Relații', desc: 'Relații importante', color: 'from-pink-500/20 to-rose-500/20 border-pink-500/30' },
              ].map(({ icon: Icon, label, desc, color }) => (
                <Card
                  key={label}
                  className={`p-6 bg-gradient-to-br ${color} cursor-pointer hover:scale-105 transition-transform`}
                  onClick={() => setSettingsOpen(true)}
                >
                  <div className="flex flex-col items-center gap-2">
                    <Icon className="h-10 w-10" />
                    <span className="font-medium">{label}</span>
                    <span className="text-xs text-muted-foreground">{desc}</span>
                  </div>
                </Card>
              ))}
            </div>

            <Button onClick={() => saveSettings({})} size="lg" className="w-full">
              Începe Rutina de Campion
            </Button>
          </Card>
        </div>
        <ChampionRoutineSettings open={settingsOpen} onOpenChange={setSettingsOpen} />
      </>
    );
  }

  // Calculate completed steps for final screen
  const completedStepsCount = routineSteps.filter(
    stepId => stepId !== 'completion' && isStepCompleted(stepId, todayLog)
  ).length;

  const renderStep = () => {
    switch (currentStepId) {
      case 'gratitude':
        return (
          <GratitudeStep
            items={todayLog?.gratitude_items || []}
            onChange={(items) => debouncedUpdateLog('gratitude_items', items)}
            onNext={goToNextStep}
          />
        );
      case 'hydration':
        return (
          <HydrationStep
            completed={todayLog?.water_drunk || false}
            onComplete={(value) => updateLog('water_drunk', value)}
            onNext={goToNextStep}
          />
        );
      case 'meditation':
        return (
          <MeditationStep
            initialDuration={todayLog?.meditation_duration_seconds || 0}
            onComplete={(seconds) => updateLog('meditation_duration_seconds', seconds)}
            onNext={goToNextStep}
            onSkip={skipCurrentStep}
          />
        );
      case 'autosuggestion':
        return (
          <AutosuggestionStep
            text={autosuggestion}
            completed={todayLog?.autosuggestion_completed || false}
            onTextChange={updateAutosuggestion}
            onComplete={(value) => updateLog('autosuggestion_completed', value)}
            onNext={goToNextStep}
          />
        );
      case 'exercise':
        return (
          <ExerciseStep
            completed={todayLog?.exercise_completed || false}
            onComplete={(value) => updateLog('exercise_completed', value)}
            onNext={goToNextStep}
            onSkip={skipCurrentStep}
          />
        );
      case 'mealPlanning':
        return (
          <MealPlanningStep
            meals={todayLog?.meals_logged || []}
            totalCalories={todayLog?.total_calories || 0}
            totalProtein={todayLog?.total_protein || 0}
            onChange={updateMeals}
            onNext={goToNextStep}
          />
        );
      case 'contentCreation':
        return (
          <ContentCreationStep
            topic={todayLog?.content_topic || ''}
            script={todayLog?.content_script || ''}
            pomodoroSessions={todayLog?.pomodoro_sessions || 0}
            onTopicChange={(topic) => updateLog('content_topic', topic)}
            onScriptChange={(script) => updateLog('content_script', script)}
            onPomodoroComplete={(sessions) => updateLog('pomodoro_sessions', sessions)}
            onNext={goToNextStep}
          />
        );
      case 'dailyTasks':
        return (
          <DailyTasksStep
            bigOneToday={todayLog?.big_one_today || ''}
            todos={todayLog?.daily_todos || []}
            onBigOneChange={(text) => updateLog('big_one_today', text)}
            onTodosChange={(todos) => updateLog('daily_todos', todos)}
            onNext={goToNextStep}
          />
        );
      case 'relationships':
        return (
          <RelationshipStep
            people={people}
            actions={todayLog?.relationship_actions || []}
            onActionsChange={(actions) => updateLog('relationship_actions', actions)}
            onNext={goToNextStep}
          />
        );
      case 'completion':
        return (
          <CompletionStep
            completedSteps={completedStepsCount}
            totalSteps={routineSteps.length - 1}
            meditationDuration={todayLog?.meditation_duration_seconds || 0}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="relative min-h-screen">
      {/* Header with progress */}
      {currentStepId !== 'completion' && (
        <div className="sticky top-0 z-10 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b">
          <div className="max-w-2xl mx-auto px-4 py-3">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                {currentStepIndex > 0 && (
                  <Button variant="ghost" size="sm" onClick={goToPreviousStep}>
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                )}
                <div className="flex flex-col">
                  <span className={`text-xs uppercase font-medium ${CATEGORY_COLORS[currentCategory]}`}>
                    {currentCategory}
                  </span>
                  <span className="text-sm font-medium">
                    {STEP_LABELS[currentStepId]}
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">
                  {currentStepIndex + 1}/{routineSteps.length}
                </span>
                <Button variant="ghost" size="sm" onClick={() => navigate('/champion-routine-history')} title="Istoric">
                  <History className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="sm" onClick={() => setShowNotificationSettings(!showNotificationSettings)} title="Notificări">
                  <Bell className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="sm" onClick={() => setSettingsOpen(true)} title="Setări">
                  <Settings className="h-4 w-4" />
                </Button>
              </div>
            </div>
            <Progress value={progress} className="h-1" />
          </div>
        </div>
      )}

      {/* Notification Settings Panel */}
      {showNotificationSettings && user && (
        <div className="max-w-2xl mx-auto px-4 py-2">
          <NotificationSettings userId={user.id} />
        </div>
      )}

      {/* Step content */}
      <div className="pb-8">
        {renderStep()}
      </div>

      <ChampionRoutineSettings open={settingsOpen} onOpenChange={setSettingsOpen} />
    </div>
  );
}
