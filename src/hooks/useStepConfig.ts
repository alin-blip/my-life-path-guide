import { useChampionRoutine } from './useChampionRoutine';

export type RoutineStepId = 
  | 'exercise' 
  | 'meditation' 
  | 'reading' 
  | 'lightExposure' 
  | 'hydration' 
  | 'breathing' 
  | 'gratitude' 
  | 'visualization' 
  | 'autosuggestion' 
  | 'journaling' 
  | 'mealPlanning' 
  | 'contentCreation' 
  | 'dailyTasks' 
  | 'relationships';

export interface ExerciseStepConfig {
  defaultActivity?: 'workout' | 'running' | 'cycling' | 'walking' | 'manual';
  skipActivitySelector?: boolean;
  autoStartTimer?: boolean;
}

export interface MeditationStepConfig {
  defaultMode?: 'timer' | 'guided';
  defaultDurationMinutes?: number;
  binauralEnabled?: boolean;
  binauralType?: 'alpha' | 'theta' | 'delta' | 'beta' | 'gamma';
}

export interface ReadingStepConfig {
  currentBook?: string;
  pagesPerDay?: number;
  showRecommendations?: boolean;
}

export interface LightExposureStepConfig {
  durationMinutes?: number;
  showTimer?: boolean;
  reminderType?: 'none' | 'notification' | 'sound';
}

export interface BreathingStepConfig {
  technique?: 'box' | '478' | 'wim_hof' | 'custom';
  cycles?: number;
  phaseDuration?: number;
  inhaleDuration?: number;
  holdDuration?: number;
  exhaleDuration?: number;
  holdAfterExhale?: number;
  durationMode?: 'cycles' | 'music';
  selectedMusicId?: string;
  showGuide?: boolean;
}

export interface GratitudeStepConfig {
  itemCount?: number;
  showExamples?: boolean;
  dailyPrompt?: boolean;
}

export interface VisualizationStepConfig {
  durationMinutes?: number;
  ambientMusic?: boolean;
  guidedMode?: boolean;
  focusArea?: 'day' | 'goals' | 'success' | 'health';
}

export interface JournalingStepConfig {
  promptType?: 'morning' | 'reflection' | 'goals' | 'gratitude' | 'custom';
  customPrompts?: string[];
  wordCountGoal?: number;
  showTemplates?: boolean;
}

export type StepConfig = 
  | ExerciseStepConfig 
  | MeditationStepConfig 
  | ReadingStepConfig 
  | LightExposureStepConfig
  | BreathingStepConfig
  | GratitudeStepConfig
  | VisualizationStepConfig
  | JournalingStepConfig
  | Record<string, any>;

export function useStepConfig<T extends StepConfig = StepConfig>(stepId: RoutineStepId) {
  const { settings, saveSettings } = useChampionRoutine();

  const stepConfigs = (settings?.step_configs || {}) as Record<string, StepConfig>;
  const config = (stepConfigs[stepId] || {}) as T;

  const updateConfig = async (newConfig: Partial<T>) => {
    const updatedConfigs = {
      ...stepConfigs,
      [stepId]: {
        ...config,
        ...newConfig
      }
    };
    
    await saveSettings({ step_configs: updatedConfigs });
  };

  const resetConfig = async () => {
    const updatedConfigs = { ...stepConfigs };
    delete updatedConfigs[stepId];
    await saveSettings({ step_configs: updatedConfigs });
  };

  return {
    config,
    updateConfig,
    resetConfig,
    isConfigured: Object.keys(config).length > 0
  };
}
