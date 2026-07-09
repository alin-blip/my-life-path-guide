import React, { useState, useCallback, useMemo, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { ChevronLeft, ChevronRight, Settings, History, Bell, Sliders } from 'lucide-react';
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
import { BusinessObjectivesStep } from './steps/BusinessObjectivesStep';
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
import { MentalitateStackFlow } from '@/components/mentalitate/MentalitateStackFlow';
import { MindShiftingMethodStep } from './steps/MindShiftingMethodStep';
import { MindTestStep } from './steps/MindTestStep';
import { EveningReflectionStep } from './steps/EveningReflectionStep';
import { useRoutineXP, ROUTINE_XP_REWARDS } from '@/hooks/useRoutineXP';
import { StreakDisplay } from './StreakDisplay';
import { XPDisplay, XPGainAnimation, LevelUpModal } from './XPDisplay';

// New UX components
import { EnhancedProgressBar } from './EnhancedProgressBar';
import { PillarProgressBar, getPillarOfStep, PILLAR_STEPS } from './PillarProgressBar';
import { LiveXPDisplay } from './LiveXPDisplay';
import { SkipConfirmDialog } from './SkipConfirmDialog';
import { StepCompletionAnimation } from './StepCompletionAnimation';
import { RoutineSetupWizard } from './RoutineSetupWizard';
import { QuickSettingsPanel } from './QuickSettingsPanel';
import { autoCompleteHabitByName, ROUTINE_STEP_TO_HABIT } from '@/services/habitAutoComplete';
import { autoMarkSelfCare, ROUTINE_STEP_TO_SELF_CARE } from '@/services/selfCareAutoComplete';
import { logRoutineEvent } from '@/lib/routineTelemetry';


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
  | 'businessObjectives'
  | 'eveningReflection'
  | 'completion';

// Core 4 - OBLIGATORII (nu pot fi eliminate) - aliniate cu Warrior Core 4
// NOTE: `journaling` este OPȚIONAL (nu obligatoriu). `mindShifting` rămâne
// obligatoriu — poate fi completat prin ORICE stack (rugăciune, furie, etc.).
export const CORE4_REQUIRED_STEPS: RoutineStepId[] = [
  'mindShifting',
  'exercise',
  'mealPlanning',
  'meditation',
  'relationships',
  'learn',
  'apply',
];


// Default order — grouped by pillar, left-to-right: Mentalitate → Spiritualitate → Corp → Familie → Business
// Progresia e strict pas-cu-pas în interiorul fiecărui pilon, apoi trece la următorul.
const DEFAULT_ROUTINE_STEPS: RoutineStepId[] = [
  // 🧠 Mentalitate (1..4)
  'mindShifting',
  'mindTest',
  'journaling',
  'learn',
  // ✨ Spiritualitate (1..3)
  'meditation',
  'gratitude',
  'powerDeclaration',
  // 💪 Corp (1..3)
  'bodyActivation',
  'exercise',
  'mealPlanning',
  // ❤️ Familie
  'relationships',
  // 💼 Business (1..3)
  'apply',
  'contentCreation',
  'businessObjectives',
  // 🌙 Reflecție + Finalizare
  'eveningReflection',
  'completion',
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
  businessObjectives: 'stepBusinessObjectives',
  eveningReflection: 'stepEveningReflection',
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
  eveningReflection: 'being',
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
export const isStepCompleted = (stepId: RoutineStepId, log: ChampionLog | null): boolean => {
  if (!log) return false;
  
  switch (stepId) {
    case 'mindShifting': {
      if ((log as any).mind_shift_summary) return true;
      try {
        const today = new Date().toISOString().split('T')[0];
        if (localStorage.getItem(`kill_it_today_done_${today}`) === '1') return true;
        if (localStorage.getItem(`mind_shift_done_${today}`) === '1') return true;
        return false;
      } catch {
        return false;
      }
    }
    case 'mindTest': {
      try {
        const today = new Date().toISOString().split('T')[0];
        return localStorage.getItem(`mind_test_done_${today}`) === '1'
          || localStorage.getItem(`mind_test_skip_${today}`) === '1';
      } catch {
        return false;
      }
    }
    case 'bodyActivation': {
      if (log.water_drunk === true || log.light_exposure === true) return true;
      try {
        const today = new Date().toISOString().split('T')[0];
        return localStorage.getItem(`body_activation_done_${today}`) === '1';
      } catch {
        return false;
      }
    }
    case 'gratitude':
      return (log.gratitude_items || []).some(i => i?.trim());
    case 'hydration':
      return log.water_drunk === true;
    case 'meditation': {
      if ((log.meditation_duration_seconds || 0) >= 60) return true;
      try {
        const today = new Date().toISOString().split('T')[0];
        return localStorage.getItem(`meditation_done_${today}`) === '1';
      } catch {
        return false;
      }
    }
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
    case 'todaysTasks':
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
    case 'eveningReflection':
      return (log as any).evening_completed === true;
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
  const { theme } = useTheme();
  const isDark = theme === 'dark';
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

    // Always append evening reflection + completion at the end
    if (!steps.includes('eveningReflection')) {
      steps.push('eveningReflection');
    }
    steps.push('completion');

    // 🎯 Force pillar-grouped order (Mentalitate → Spiritualitate → Corp → Familie → Business),
    // so the flow always goes pas-cu-pas într-un pilon înainte să treacă la următorul.
    // Habits / tasks / evening / completion rămân la final în ordinea lor.
    const PILLAR_ORDER: RoutineStepId[] = [
      // Mentalitate
      'mindShifting', 'mindTest', 'journaling', 'learn',
      // Spiritualitate
      'meditation', 'gratitude', 'powerDeclaration',
      'visualization', 'autosuggestion', 'visionDeclaration', 'reading', 'breathing',
      // Corp
      'bodyActivation', 'exercise', 'mealPlanning', 'hydration', 'lightExposure',
      // Familie
      'relationships',
      // Business
      'apply', 'contentCreation', 'dailyTasks',
    ];
    const tailOrder: RoutineStepId[] = [
      'habit_body', 'habit_being', 'habit_balance', 'habit_business',
      'todaysTasks', 'eveningReflection', 'completion',
    ];
    const rank = (id: RoutineStepId) => {
      const p = PILLAR_ORDER.indexOf(id);
      if (p !== -1) return p;
      const t = tailOrder.indexOf(id);
      return t !== -1 ? PILLAR_ORDER.length + t : PILLAR_ORDER.length + tailOrder.length + 999;
    };
    steps = [...new Set(steps)].sort((a, b) => rank(a) - rank(b));

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

  // Cross-page sync: if user completed mind test / meditation elsewhere, mark routine step done
  useEffect(() => {
    if (!user) return;
    let cancelled = false;
    (async () => {
      try {
        const { supabase } = await import('@/integrations/supabase/client');
        const today = new Date().toISOString().split('T')[0];
        const startOfDay = `${today}T00:00:00.000Z`;

        const [mindTest, empMed, flow] = await Promise.all([
          supabase.from('mind_quiz_responses').select('id').eq('user_id', user.id).gte('created_at', startOfDay).limit(1),
          supabase.from('empowerment_meditations').select('id').eq('user_id', user.id).gte('created_at', startOfDay).limit(1),
          supabase.from('daily_flow_sessions').select('id').eq('user_id', user.id).gte('created_at', startOfDay).limit(1),
        ]);

        if (cancelled) return;
        if ((mindTest.data?.length || 0) > 0) {
          localStorage.setItem(`mind_test_done_${today}`, '1');
        }
        if ((empMed.data?.length || 0) > 0 || (flow.data?.length || 0) > 0) {
          localStorage.setItem(`meditation_done_${today}`, '1');
        }
      } catch (e) {
        // silent
      }
    })();
    return () => { cancelled = true; };
  }, [user]);
  
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
    // Auto-complete matching habit for the step we're leaving
    const leavingStepId = routineSteps[currentStepIndex];
    logRoutineEvent({
      step: leavingStepId,
      reason: 'next',
      meta: {
        wasCompleted: isStepCompleted(leavingStepId, todayLog),
        index: currentStepIndex,
        total: routineSteps.length,
      },
    });
    const habitNames = ROUTINE_STEP_TO_HABIT[leavingStepId as string];
    if (habitNames && habitNames.length > 0) {
      autoCompleteHabitByName(habitNames);
      logRoutineEvent({
        step: leavingStepId,
        reason: 'habit_completed',
        sub: habitNames.join(','),
      });
    }
    // Auto-mark matching Self Care indicator
    const selfCareFields = ROUTINE_STEP_TO_SELF_CARE[leavingStepId as string];
    if (selfCareFields && selfCareFields.length > 0) {
      autoMarkSelfCare(selfCareFields);
    }
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
    logRoutineEvent({
      step: currentStepId,
      reason: 'skip',
      meta: { index: currentStepIndex, total: routineSteps.length },
    });
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
          <MindShiftingMethodStep
            alreadyCompleted={isStepCompleted('mindShifting', todayLog)}
            onComplete={() => goToNextStep()}
            onSkip={() => goToNextStep()}
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
      case 'eveningReflection':
        return (
          <EveningReflectionStep
            doneWell={(todayLog as any)?.evening_reflection_done_well ?? null}
            learned={(todayLog as any)?.evening_reflection_learned ?? null}
            notDone={(todayLog as any)?.evening_reflection_not_done ?? null}
            onChange={(field, value) => updateLog(field as any, value)}
            onComplete={(value) => updateLog('evening_completed' as any, value)}
            onNext={goToNextStep}
          />
        );
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


  return (
    <div className="relative min-h-screen">
      {/* Decorative navy backdrop — radial gold at bottom + top hairline */}
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom,hsl(var(--primary)/0.10),transparent_60%)]" />
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-primary/40 to-transparent" />
        <div className="absolute inset-0 opacity-[0.04] [background-image:radial-gradient(hsl(var(--primary))_1px,transparent_1px)] [background-size:24px_24px]" />
      </div>
      {/* Header — Navy & Gold premium band */}
      {currentStepId !== 'completion' && (
        <div className="sticky top-0 z-10 border-b border-[hsl(var(--primary)/0.25)] bg-gradient-to-b from-[hsl(222_55%_7%)] via-[hsl(222_50%_9%)] to-[hsl(222_45%_11%)] backdrop-blur-xl shadow-[0_4px_24px_-12px_hsl(222_60%_4%/0.8)]">
          {/* gold hairline */}
          <div className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-[hsl(var(--primary)/0.6)] to-transparent" />
          <div className="max-w-3xl mx-auto px-4 py-3">
            {/* Top row */}
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2 min-w-0">
                {currentStepIndex > 0 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={goToPreviousStep}
                    className="text-white/70 hover:text-[hsl(var(--primary))] hover:bg-white/5"
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                )}
                <div className="flex flex-col min-w-0">
                  <span className="text-[10px] uppercase tracking-[0.18em] font-semibold text-[hsl(var(--primary))]/90">
                    {(() => {
                      const p = getPillarOfStep(currentStepId);
                      return p ? p.charAt(0).toUpperCase() + p.slice(1) : currentCategory;
                    })()}
                  </span>
                  <span className="text-sm font-semibold text-white truncate">
                    {STEP_LABELS[currentStepId]}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-1.5">
                <LiveXPDisplay compact />
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => navigate('/champion-routine-history')}
                  title="Istoric"
                  className="text-white/60 hover:text-[hsl(var(--primary))] hover:bg-white/5"
                >
                  <History className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setQuickSettingsOpen(true)}
                  title="Setări Rapide"
                  className="text-white/60 hover:text-[hsl(var(--primary))] hover:bg-white/5"
                >
                  <Sliders className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setSettingsOpen(true)}
                  title="Setări Avansate"
                  className="text-white/60 hover:text-[hsl(var(--primary))] hover:bg-white/5"
                >
                  <Settings className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* 5 Pilon Cards = progress bar */}
            <PillarProgressBar
              steps={routineSteps}
              currentStepIndex={currentStepIndex}
              todayLog={todayLog}
              isStepCompleted={isStepCompleted}
              onPillarClick={(index) => {
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
      <div className="pb-8 relative">
        {(() => {
          const pillar = getPillarOfStep(currentStepId);
          if (pillar !== 'mentalitate') return null;
          const subSteps = PILLAR_STEPS.mentalitate.filter((id) => routineSteps.includes(id));
          const posInPillar = subSteps.indexOf(currentStepId);
          if (posInPillar === -1 || subSteps.length <= 1) return null;
          const goPrev = () => {
            if (posInPillar > 0) {
              const target = subSteps[posInPillar - 1];
              const idx = routineSteps.indexOf(target);
              if (idx !== -1) {
                setCurrentStepIndex(idx);
                setHasUserNavigated(true);
              }
            }
          };
          const goNext = () => {
            if (posInPillar < subSteps.length - 1) {
              const target = subSteps[posInPillar + 1];
              const idx = routineSteps.indexOf(target);
              if (idx !== -1) {
                setCurrentStepIndex(idx);
                setHasUserNavigated(true);
              }
            }
          };
          return (
            <div className="max-w-3xl mx-auto px-4 pt-3 flex justify-center">
              <div className="inline-flex items-center gap-1 rounded-full border border-[hsl(var(--primary)/0.25)] bg-black/40 backdrop-blur-md px-1.5 py-1 shadow-[0_2px_12px_-4px_hsl(222_60%_4%/0.6)]">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={goPrev}
                  disabled={posInPillar === 0}
                  className="h-7 w-7 p-0 rounded-full text-white/70 hover:text-[hsl(var(--primary))] hover:bg-white/5 disabled:opacity-30"
                  title="Pasul anterior din Mentalitate"
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <span className="text-[10px] font-mono font-semibold tracking-widest text-[hsl(var(--primary))]/90 min-w-[32px] text-center">
                  {posInPillar + 1}/{subSteps.length}
                </span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={goNext}
                  disabled={posInPillar === subSteps.length - 1}
                  className="h-7 w-7 p-0 rounded-full text-white/70 hover:text-[hsl(var(--primary))] hover:bg-white/5 disabled:opacity-30"
                  title="Pasul următor din Mentalitate"
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          );
        })()}
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
