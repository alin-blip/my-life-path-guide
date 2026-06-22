import React, { useState, useCallback, useMemo, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { ChevronLeft, Settings, History, Bell, Sliders } from 'lucide-react';
import { useChampionRoutine, ChampionLog } from '@/hooks/useChampionRoutine';
import { ChampionRoutineSettings } from './ChampionRoutineSettings';
import { NotificationSettings } from './NotificationSettings';
import { debounce, cn } from '@/lib/utils';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { useTheme } from '@/context/ThemeContext';
import { useLanguage } from '@/context/LanguageContext';
import { HabitCategory } from '@/hooks/useDailyHabits';
import { MindCoachEmotion } from '@/components/mind-coach/ExtendedEmotionPicker';

// Step components
import { GratitudeStep } from './steps/GratitudeStep';
import { BodyActivationStep } from './steps/BodyActivationStep';
import { MeditationStep } from './steps/MeditationStep';
import { PowerDeclarationStep } from './steps/PowerDeclarationStep';
import { ExerciseStep } from './steps/ExerciseStep';
import { MealPlanningStep } from './steps/MealPlanningStep';
import { ContentCreationStep } from './steps/ContentCreationStep';
import { RelationshipStep } from './steps/RelationshipStep';
import { CompletionStep } from './steps/CompletionStep';
import { HabitCheckStep } from './steps/HabitCheckStep';
import { TodaysTasksStep } from './steps/TodaysTasksStep';
import { BreathingStep } from './steps/BreathingStep';
import { VisualizationStep } from './steps/VisualizationStep';
import { ReadingStep } from './steps/ReadingStep';
import { JournalingStep } from './steps/JournalingStep';
import { HydrationStep } from './steps/HydrationStep';
import { LightExposureStep } from './steps/LightExposureStep';
import { LearnStep } from './steps/LearnStep';
import { VisionDeclarationStep } from './steps/VisionDeclarationStep';
import { AutosuggestionStep } from './steps/AutosuggestionStep';
import { ApplyStep } from './steps/ApplyStep';
import { MindShiftingStep } from './steps/MindShiftingStep';
import { MindTestStep } from './steps/MindTestStep';
import { useRoutineXP, ROUTINE_XP_REWARDS } from '@/hooks/useRoutineXP';
import { StreakDisplay } from './StreakDisplay';
import { XPDisplay, XPGainAnimation, LevelUpModal } from './XPDisplay';

// New UX components
import { EnhancedProgressBar } from './EnhancedProgressBar';
import { LiveXPDisplay } from './LiveXPDisplay';
import { SkipConfirmDialog } from './SkipConfirmDialog';
import { StepCompletionAnimation } from './StepCompletionAnimation';
import { RoutineSetupWizard } from './RoutineSetupWizard';
import { QuickSettingsPanel } from './QuickSettingsPanel';

// Setup UI components
import { Card } from '@/components/ui/card';
import { Dumbbell, Sparkles, Heart, Target } from 'lucide-react';

interface ChampionRoutineFlowProps {
  onComplete?: () => void;
  initialStep?: RoutineStepId;
}

export type RoutineStepId = 
  | 'mindShifting'
  | 'mindTest'
  | 'bodyActivation'
  | 'gratitude' 
  | 'hydration' 
  | 'meditation' 
  | 'autosuggestion' 
  | 'visionDeclaration'
  | 'powerDeclaration'
  | 'exercise' 
  | 'mealPlanning'
  | 'contentCreation'
  | 'dailyTasks'
  | 'relationships'
  | 'breathing'
  | 'visualization'
  | 'reading'
  | 'journaling'
  | 'lightExposure'
  | 'learn'
  | 'apply'
  | 'habit_body'
  | 'habit_being'
  | 'habit_balance'
  | 'habit_business'
  | 'todaysTasks'
  | 'completion';

// Core 4 - OBLIGATORII (nu pot fi eliminate) - aliniate cu Warrior Core 4
export const CORE4_REQUIRED_STEPS: RoutineStepId[] = [
  'mindShifting',
  'exercise',
  'mealPlanning',
  'meditation',
  'journaling',
  'relationships',
  'learn',
  'apply',
];

// Default order — simplified Tony Robbins flow
const DEFAULT_ROUTINE_STEPS: RoutineStepId[] = [
  'mindShifting',         // 1. Mind Shifting (Observe → Name → Reframe → Activate → Commit)
  'mindTest',             // 1b. Minte — Test zilnic (foundation pillar)
  'bodyActivation',       // 2. Apă + Lumină + Postură (30 sec)
  'meditation',           // 3. Meditație (cu breathing intro opțional)
  'powerDeclaration',     // 4. Viziune + Autosugestie + Vizualizare
  'gratitude',            // 5. Recunoștință (cu prompts rotative)
  'journaling',           // 6. Jurnaling (cu prompt zilnic)
  'exercise',             // 7. Exerciții
  'mealPlanning',         // 8. Alimentație
  'learn',                // 9. Învață
  'apply',                // 10. Aplică
  'contentCreation',      // 11. Content
  'relationships',        // 12. Relații
  'completion',           // 13. Finalizare
];

// Translation keys for step labels - now using useLanguage t() function
const STEP_LABEL_KEYS: Record<RoutineStepId, string> = {
  mindShifting: 'stepMindShifting',
  mindTest: 'stepMindTest',
  bodyActivation: 'stepBodyActivation',
  gratitude: 'stepGratitude',
  hydration: 'stepHydration',
  meditation: 'stepMeditation',
  autosuggestion: 'stepAutosuggestion',
  visionDeclaration: 'stepVisionDeclaration',
  powerDeclaration: 'stepPowerDeclaration',
  exercise: 'stepExercise',
  mealPlanning: 'stepMealPlanning',
  contentCreation: 'stepContentCreation',
  dailyTasks: 'stepDailyTasks',
  relationships: 'stepRelationships',
  breathing: 'stepBreathing',
  visualization: 'stepVisualization',
  reading: 'stepReading',
  journaling: 'stepJournaling',
  lightExposure: 'stepLightExposure',
  learn: 'stepLearn',
  apply: 'stepApply',
  habit_body: 'stepHabitBody',
  habit_being: 'stepHabitBeing',
  habit_balance: 'stepHabitBalance',
  habit_business: 'stepHabitBusiness',
  todaysTasks: 'stepTodaysTasks',
  completion: 'stepCompletion',
};

const STEP_CATEGORIES: Record<RoutineStepId, 'being' | 'body' | 'business' | 'balance' | 'complete' | 'habits' | 'tasks' | 'emotional'> = {
  mindShifting: 'emotional',
  mindTest: 'emotional',
  bodyActivation: 'body',
  gratitude: 'being',
  hydration: 'being',
  meditation: 'being',
  autosuggestion: 'being',
  visionDeclaration: 'being',
  powerDeclaration: 'being',
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

const CATEGORY_COLORS = {
  emotional: 'text-amber-500',
  being: 'text-purple-500',
  body: 'text-red-500',
  business: 'text-blue-500',
  balance: 'text-pink-500',
  habits: 'text-amber-500',
  tasks: 'text-emerald-500',
  complete: 'text-green-500',
};

// Check if a step is completed based on log data
const isStepCompleted = (stepId: RoutineStepId, log: ChampionLog | null): boolean => {
  if (!log) return false;
  
  switch (stepId) {
    case 'mindShifting':
      return !!(log as any).mind_shift_summary;
    case 'mindTest': {
      try {
        const today = new Date().toISOString().split('T')[0];
        return localStorage.getItem(`mind_test_done_${today}`) === '1'
          || localStorage.getItem(`mind_test_skip_${today}`) === '1';
      } catch {
        return false;
      }
    }
    case 'bodyActivation':
      return log.water_drunk === true && log.light_exposure === true;
    case 'gratitude':
      return (log.gratitude_items || []).some(i => i?.trim());
    case 'hydration':
      return log.water_drunk === true;
    case 'meditation':
      return (log.meditation_duration_seconds || 0) >= 300;
    case 'autosuggestion':
      return log.autosuggestion_completed === true;
    case 'visionDeclaration':
      return log.vision_declaration_read === true;
    case 'powerDeclaration':
      return log.autosuggestion_completed === true && log.vision_declaration_read === true && log.visualization_completed === true;
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
    case 'completion':
      return false;
    default:
      return false;
  }
};

export function ChampionRoutineFlow({ onComplete, initialStep }: ChampionRoutineFlowProps) {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { t } = useLanguage();
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

  // Generate translated step labels
  const STEP_LABELS = useMemo(() => {
    const labels: Record<RoutineStepId, string> = {} as Record<RoutineStepId, string>;
    (Object.keys(STEP_LABEL_KEYS) as RoutineStepId[]).forEach(key => {
      labels[key] = t(STEP_LABEL_KEYS[key]);
    });
    return labels;
  }, [t]);

  // Get active and ordered steps based on settings
  const routineSteps = useMemo((): RoutineStepId[] => {
    let activeSteps = settings?.active_steps || [];
    let stepsOrder = settings?.routine_steps_order || [];
    const habitSteps = (settings?.habit_steps as string[]) || [];
    const includeDailyTasks = settings?.include_daily_tasks !== false;

    // ENFORCE CORE 4 - Always include required steps
    CORE4_REQUIRED_STEPS.forEach(stepId => {
      if (!activeSteps.includes(stepId)) {
        activeSteps = [...activeSteps, stepId];
      }
      if (!stepsOrder.includes(stepId)) {
        stepsOrder = [...stepsOrder, stepId];
      }
    });

    // Auto-include new steps for existing users
    const requiredNewSteps = ['mindShifting', 'mindTest', 'bodyActivation', 'powerDeclaration'];
    requiredNewSteps.forEach(stepId => {
      if (activeSteps.length > 0 && !activeSteps.includes(stepId)) {
        activeSteps = [...activeSteps];
        if (stepId === 'mindShifting') {
          // Replace legacy emotionalCheck if present
          const legacyIdx = activeSteps.indexOf('emotionalCheck' as any);
          if (legacyIdx !== -1) activeSteps.splice(legacyIdx, 1);
          activeSteps.unshift(stepId);
        } else if (stepId === 'bodyActivation') {
          const checkIndex = activeSteps.indexOf('mindShifting');
          activeSteps.splice(checkIndex !== -1 ? checkIndex + 1 : 0, 0, stepId);
        } else if (stepId === 'mindTest') {
          const mIdx = activeSteps.indexOf('mindShifting');
          activeSteps.splice(mIdx !== -1 ? mIdx + 1 : 0, 0, stepId);
        } else {
          // powerDeclaration — insert after meditation
          const medIndex = activeSteps.indexOf('meditation');
          activeSteps.splice(medIndex !== -1 ? medIndex + 1 : activeSteps.length, 0, stepId);
        }
      }
      if (stepsOrder.length > 0 && !stepsOrder.includes(stepId)) {
        stepsOrder = [...stepsOrder];
        if (stepId === 'mindShifting') {
          const legacyIdx = stepsOrder.indexOf('emotionalCheck' as any);
          if (legacyIdx !== -1) stepsOrder.splice(legacyIdx, 1);
          stepsOrder.unshift(stepId);
        } else if (stepId === 'bodyActivation') {
          const checkIndex = stepsOrder.indexOf('mindShifting');
          stepsOrder.splice(checkIndex !== -1 ? checkIndex + 1 : 0, 0, stepId);
        } else if (stepId === 'mindTest') {
          const mIdx = stepsOrder.indexOf('mindShifting');
          stepsOrder.splice(mIdx !== -1 ? mIdx + 1 : 0, 0, stepId);
        } else {
          const medIndex = stepsOrder.indexOf('meditation');
          stepsOrder.splice(medIndex !== -1 ? medIndex + 1 : stepsOrder.length, 0, stepId);
        }
      }
    });

    // Strip any lingering legacy emotionalCheck IDs
    activeSteps = activeSteps.filter(id => id !== 'emotionalCheck');
    stepsOrder = stepsOrder.filter(id => id !== 'emotionalCheck');

    // If no custom order, use default
    let steps: RoutineStepId[];
    if (stepsOrder.length === 0) {
      steps = [...DEFAULT_ROUTINE_STEPS];
    } else {
      // Filter by active steps (if activeSteps is empty, all are active)
      steps = stepsOrder.filter(id => 
        DEFAULT_ROUTINE_STEPS.includes(id as RoutineStepId)
      ) as RoutineStepId[];

      // Filter out inactive steps BUT keep Core 4 always
      if (activeSteps.length > 0) {
        steps = steps.filter(id => 
          activeSteps.includes(id) || 
          id === 'completion' ||
          CORE4_REQUIRED_STEPS.includes(id) // Always keep Core 4
        );
      }
    }

    // Skip relationships if no people configured
    if (people.length === 0) {
      steps = steps.filter(id => id !== 'relationships');
    }

    // Remove completion temporarily to add habit/task steps before it
    steps = steps.filter(id => id !== 'completion');

    // Add habit steps if configured
    if (habitSteps.length > 0) {
      habitSteps.forEach(habitStep => {
        if (['habit_body', 'habit_being', 'habit_balance', 'habit_business'].includes(habitStep)) {
          steps.push(habitStep as RoutineStepId);
        }
      });
    }

    // Add today's tasks step if enabled
    if (includeDailyTasks) {
      steps.push('todaysTasks');
    }

    // Always ensure completion is at the end
    steps.push('completion');

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

  const [settingsOpen, setSettingsOpen] = useState(false);
  const [quickSettingsOpen, setQuickSettingsOpen] = useState(false);
  const [showNotificationSettings, setShowNotificationSettings] = useState(false);
  const [hasUserNavigated, setHasUserNavigated] = useState(false);
  const [showSkipDialog, setShowSkipDialog] = useState(false);
  const [showStepCompletion, setShowStepCompletion] = useState(false);
  const [showWizard, setShowWizard] = useState(false);
  
  // Emotional check state
  const [selectedEmotion, setSelectedEmotion] = useState<MindCoachEmotion | null>(
    todayLog?.morning_emotion as MindCoachEmotion || null
  );
  const [emotionIntensity, setEmotionIntensity] = useState<number>(
    todayLog?.morning_emotion_intensity || 5
  );
  const [needsEmotionalTransform, setNeedsEmotionalTransform] = useState(false);
  
  // Stack selection state
  const [selectedStack, setSelectedStack] = useState<string | null>(null);
  const [showStackInline, setShowStackInline] = useState(false);
  
  // Track skipped steps in localStorage
  const today = new Date().toISOString().split('T')[0];
  const skippedStepsKey = `champion_skipped_steps_${today}`;
  const routineProgressKey = `champion_routine_progress_${today}`;
  
  // Get saved progress from localStorage
  const getSavedProgress = useCallback((): { stepIndex: number; lastUpdate: number } | null => {
    try {
      const saved = localStorage.getItem(routineProgressKey);
      if (saved) {
        const parsed = JSON.parse(saved);
        // Only restore if less than 4 hours old
        if (Date.now() - parsed.lastUpdate < 14400000) {
          return parsed;
        }
      }
    } catch {
      // Ignore errors
    }
    return null;
  }, [routineProgressKey]);
  
  // Initialize currentStepIndex from localStorage
  const [currentStepIndex, setCurrentStepIndex] = useState(() => {
    const saved = getSavedProgress();
    return saved ? saved.stepIndex : 0;
  });
  
  // Save progress to localStorage whenever step changes
  const saveProgress = useCallback((stepIndex: number) => {
    try {
      localStorage.setItem(routineProgressKey, JSON.stringify({
        stepIndex,
        lastUpdate: Date.now()
      }));
    } catch {
      // Ignore storage errors
    }
  }, [routineProgressKey]);
  
  // Auto-save on step change
  useEffect(() => {
    saveProgress(currentStepIndex);
  }, [currentStepIndex, saveProgress]);
  
  // Save on visibility change and before unload
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden) {
        saveProgress(currentStepIndex);
      }
    };
    
    const handleBeforeUnload = () => {
      saveProgress(currentStepIndex);
    };
    
    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('beforeunload', handleBeforeUnload);
    
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [currentStepIndex, saveProgress]);
  
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

  // Start from initialStep if provided, or restore from localStorage
  useEffect(() => {
    if (!isLoading && isConfigured && !hasUserNavigated) {
      if (initialStep) {
        // Find the index of the initial step
        const stepIndex = routineSteps.indexOf(initialStep);
        if (stepIndex !== -1) {
          setCurrentStepIndex(stepIndex);
          setHasUserNavigated(true);
        } else {
          setCurrentStepIndex(0);
        }
      } else {
        // Check if we have saved progress
        const savedProgress = getSavedProgress();
        if (savedProgress && savedProgress.stepIndex < routineSteps.length) {
          setCurrentStepIndex(savedProgress.stepIndex);
        }
        // Otherwise stay at current step (already initialized from localStorage or 0)
      }
    }
  }, [isLoading, isConfigured, hasUserNavigated, initialStep, routineSteps, getSavedProgress]);

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
  
  const handleSkipRequest = () => {
    setShowSkipDialog(true);
  };
  
  const confirmSkip = () => {
    addSkippedStep(currentStepId);
    setShowSkipDialog(false);
    goToNextStep();
  };

  // Show wizard for new users
  useEffect(() => {
    if (!isLoading && !isConfigured) {
      setShowWizard(true);
    }
  }, [isLoading, isConfigured]);

  // Show loading only during initial load
  if (isLoading) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  // Show setup wizard for new users
  if (showWizard || !isConfigured) {
    return (
      <RoutineSetupWizard
        onComplete={() => setShowWizard(false)}
        onSkip={() => {
          saveSettings({ is_configured: true });
          setShowWizard(false);
        }}
      />
    );
  }

  // Calculate completed steps for final screen
  const completedStepsCount = routineSteps.filter(
    stepId => stepId !== 'completion' && isStepCompleted(stepId, todayLog)
  ).length;

  const renderStep = () => {
    switch (currentStepId) {
      case 'mindShifting':
        return (
          <MindShiftingStep
            onComplete={(session) => {
              if (session.emotion) updateLog('morning_emotion', session.emotion as any);
              if (typeof session.intensity === 'number') updateLog('morning_emotion_intensity', session.intensity);
              goToNextStep();
            }}
            onSkip={() => goToNextStep()}
            source="routine"
          />
        );
      case 'mindTest':
        return (
          <MindTestStep
            onNext={goToNextStep}
            onSkip={() => goToNextStep()}
          />
        );
      case 'bodyActivation':
        return (
          <BodyActivationStep
            waterCompleted={todayLog?.water_drunk || false}
            lightCompleted={todayLog?.light_exposure || false}
            onWaterComplete={(value) => updateLog('water_drunk', value)}
            onLightComplete={(value) => updateLog('light_exposure', value)}
            onNext={goToNextStep}
          />
        );
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
            onSkip={handleSkipRequest}
          />
        );
      case 'powerDeclaration':
        return (
          <PowerDeclarationStep
            autosuggestionText={autosuggestion}
            autosuggestionCompleted={todayLog?.autosuggestion_completed || false}
            visionDeclarationRead={todayLog?.vision_declaration_read || false}
            visualizationCompleted={todayLog?.visualization_completed || false}
            onAutosuggestionTextChange={updateAutosuggestion}
            onAutosuggestionComplete={(value) => updateLog('autosuggestion_completed', value)}
            onVisionComplete={(value) => updateLog('vision_declaration_read', value)}
            onVisualizationComplete={(value) => updateLog('visualization_completed', value)}
            onNext={goToNextStep}
            onSkip={handleSkipRequest}
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
      case 'visionDeclaration':
        return (
          <VisionDeclarationStep
            completed={todayLog?.vision_declaration_read || false}
            onComplete={(value) => updateLog('vision_declaration_read', value)}
            onNext={goToNextStep}
            onSkip={handleSkipRequest}
          />
        );
      case 'exercise':
        return (
          <ExerciseStep
            completed={todayLog?.exercise_completed || false}
            onComplete={(value) => updateLog('exercise_completed', value)}
            onNext={goToNextStep}
            onSkip={handleSkipRequest}
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
      case 'learn':
        return (
          <LearnStep
            completed={todayLog?.learn_completed || false}
            notes={todayLog?.learn_notes || null}
            onComplete={(value) => updateLog('learn_completed', value)}
            onNotesChange={(notes) => updateLog('learn_notes', notes)}
            onNext={goToNextStep}
          />
        );
      case 'apply':
        return (
          <ApplyStep
            completed={todayLog?.apply_completed || false}
            notes={todayLog?.apply_notes || null}
            onComplete={(value) => updateLog('apply_completed', value)}
            onNotesChange={(notes) => updateLog('apply_notes', notes)}
            onNext={goToNextStep}
          />
        );
      // dailyTasks case removed - using todaysTasks only
      case 'relationships':
        return (
          <RelationshipStep
            people={people}
            actions={todayLog?.relationship_actions || []}
            onActionsChange={(actions) => updateLog('relationship_actions', actions)}
            onNext={goToNextStep}
          />
        );
      case 'breathing':
        return (
          <BreathingStep
            completed={todayLog?.breathing_completed || false}
            onComplete={(value) => updateLog('breathing_completed', value)}
            onNext={goToNextStep}
          />
        );
      case 'visualization':
        return (
          <VisualizationStep
            completed={todayLog?.visualization_completed || false}
            onComplete={(value) => updateLog('visualization_completed', value)}
            onNext={goToNextStep}
          />
        );
      case 'reading':
        return (
          <ReadingStep
            completed={todayLog?.reading_completed || false}
            onComplete={(value) => updateLog('reading_completed', value)}
            onNext={goToNextStep}
          />
        );
      case 'journaling':
        return (
          <JournalingStep
            completed={todayLog?.journaling_completed || false}
            onComplete={(value) => updateLog('journaling_completed', value)}
            onNext={goToNextStep}
          />
        );
      case 'lightExposure':
        return (
          <LightExposureStep
            completed={todayLog?.light_exposure || false}
            onComplete={(value) => updateLog('light_exposure', value)}
            onNext={goToNextStep}
          />
        );
      case 'habit_body':
        return <HabitCheckStep category="body" onNext={goToNextStep} />;
      case 'habit_being':
        return <HabitCheckStep category="being" onNext={goToNextStep} />;
      case 'habit_balance':
        return <HabitCheckStep category="balance" onNext={goToNextStep} />;
      case 'habit_business':
        return <HabitCheckStep category="business" onNext={goToNextStep} />;
      case 'todaysTasks':
        return <TodaysTasksStep onNext={goToNextStep} />;
      case 'completion':
        return (
          <CompletionStep
            completedSteps={completedStepsCount}
            totalSteps={routineSteps.length - 1}
            meditationDuration={todayLog?.meditation_duration_seconds || 0}
            routineSteps={routineSteps}
            todayLog={todayLog}
            skippedSteps={getSkippedSteps()}
            onGoToStep={(stepId) => {
              const index = routineSteps.indexOf(stepId);
              if (index !== -1) {
                setCurrentStepIndex(index);
              }
            }}
          />
        );
      default:
        return null;
    }
  };

  const { theme } = useTheme();
  const isDark = theme === 'dark';

  return (
    <div className="relative min-h-screen">
      {/* Header with Timeline and XP - Theme aware styling */}
      {currentStepId !== 'completion' && (
        <div className={cn(
          "sticky top-0 z-10 backdrop-blur-xl border-b",
          isDark 
            ? "bg-background/40 border-border/30" 
            : "bg-background/70 border-border/50"
        )}>
          <div className="max-w-2xl mx-auto px-4 py-3">
            {/* Top row: Navigation & Actions */}
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                {currentStepIndex > 0 && (
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={goToPreviousStep} 
                    className="text-muted-foreground hover:text-foreground hover:bg-muted"
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                )}
                <div className="flex flex-col">
                  <span className={`text-xs uppercase font-medium ${CATEGORY_COLORS[currentCategory]}`}>
                    {currentCategory}
                  </span>
                  <span className="text-sm font-medium text-foreground">
                    {STEP_LABELS[currentStepId]}
                  </span>
                </div>
              </div>
              
              {/* XP & Actions */}
              <div className="flex items-center gap-2">
                <LiveXPDisplay compact />
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => navigate('/champion-routine-history')} 
                  title="Istoric" 
                  className="text-muted-foreground hover:text-foreground hover:bg-muted"
                >
                  <History className="h-4 w-4" />
                </Button>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => setQuickSettingsOpen(true)} 
                  title="Setări Rapide" 
                  className="text-muted-foreground hover:text-foreground hover:bg-muted"
                >
                  <Sliders className="h-4 w-4" />
                </Button>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => setSettingsOpen(true)} 
                  title="Setări Avansate" 
                  className="text-muted-foreground hover:text-foreground hover:bg-muted"
                >
                  <Settings className="h-4 w-4" />
                </Button>
              </div>
            </div>
            
            {/* Interactive Timeline */}
            <EnhancedProgressBar
              steps={routineSteps}
              currentStepIndex={currentStepIndex}
              todayLog={todayLog}
              skippedSteps={getSkippedSteps()}
              stepLabels={STEP_LABELS}
              stepCategories={STEP_CATEGORIES}
              isStepCompleted={isStepCompleted}
              onStepClick={(index) => {
                setCurrentStepIndex(index);
                setHasUserNavigated(true);
              }}
            />
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

      {/* Settings Modals */}
      <ChampionRoutineSettings open={settingsOpen} onOpenChange={setSettingsOpen} />
      <QuickSettingsPanel open={quickSettingsOpen} onOpenChange={setQuickSettingsOpen} />
      
      {/* Skip Confirmation Dialog */}
      <SkipConfirmDialog
        open={showSkipDialog}
        onOpenChange={setShowSkipDialog}
        stepName={STEP_LABELS[currentStepId]}
        onConfirmSkip={confirmSkip}
      />
      
      {/* Step Completion Animation */}
      <StepCompletionAnimation
        show={showStepCompletion}
        onComplete={() => setShowStepCompletion(false)}
      />
    </div>
  );
}
