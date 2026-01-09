import { useMemo } from 'react';
import { useChampionRoutine } from './useChampionRoutine';

export interface SetupStatus {
  isProfileComplete: boolean;
  isNutritionComplete: boolean;
  isWorkoutComplete: boolean;
  isRoutineComplete: boolean;
  isHabitsComplete: boolean;
  isPeopleComplete: boolean;
  isAutosuggestionComplete: boolean;
  overallProgress: number;
  firstIncompleteStep: number;
  isFullyComplete: boolean;
}

export function useSetupStatus(): SetupStatus & { isLoading: boolean } {
  const { settings, people, isLoading } = useChampionRoutine();

  const status = useMemo(() => {
    const isProfileComplete = !!(settings?.weight_kg && settings?.height_cm && settings?.age);
    const isNutritionComplete = !!settings?.nutrition_configured;
    const isWorkoutComplete = !!(settings?.workout_goal && settings?.workout_level);
    const isRoutineComplete = !!(settings?.active_steps && Array.isArray(settings.active_steps) && settings.active_steps.length > 0);
    const isHabitsComplete = !!(settings?.habit_steps && Array.isArray(settings.habit_steps) && settings.habit_steps.length > 0);
    const isPeopleComplete = people.length > 0;
    const isAutosuggestionComplete = !!settings?.default_autosuggestion;

    const completedSteps = [
      isProfileComplete,
      isNutritionComplete,
      isWorkoutComplete,
      isRoutineComplete,
      isHabitsComplete,
      isPeopleComplete,
      isAutosuggestionComplete,
    ].filter(Boolean).length;

    const totalSteps = 7;
    const overallProgress = Math.round((completedSteps / totalSteps) * 100);

    const steps = [
      isProfileComplete,
      isNutritionComplete,
      isWorkoutComplete,
      isRoutineComplete,
      isHabitsComplete,
      isPeopleComplete,
      isAutosuggestionComplete,
    ];
    const firstIncompleteStep = steps.findIndex(s => !s);

    return {
      isProfileComplete,
      isNutritionComplete,
      isWorkoutComplete,
      isRoutineComplete,
      isHabitsComplete,
      isPeopleComplete,
      isAutosuggestionComplete,
      overallProgress,
      firstIncompleteStep: firstIncompleteStep === -1 ? 0 : firstIncompleteStep,
      isFullyComplete: completedSteps === totalSteps,
    };
  }, [settings, people]);

  return { ...status, isLoading };
}
