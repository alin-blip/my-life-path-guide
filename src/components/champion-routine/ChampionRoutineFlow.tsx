import React, { useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { ChevronLeft, Settings } from 'lucide-react';
import { useChampionRoutine } from '@/hooks/useChampionRoutine';
import { ChampionRoutineSettings } from './ChampionRoutineSettings';
import { debounce } from '@/lib/utils';

// Step components
import { GratitudeStep } from './steps/GratitudeStep';
import { HydrationStep } from './steps/HydrationStep';
import { LightExposureStep } from './steps/LightExposureStep';
import { BreathingStep } from './steps/BreathingStep';
import { MeditationStep } from './steps/MeditationStep';
import { AutosuggestionStep } from './steps/AutosuggestionStep';
import { VisualizationStep } from './steps/VisualizationStep';
import { ReadingStep } from './steps/ReadingStep';
import { JournalingStep } from './steps/JournalingStep';
import { PrioritiesStep } from './steps/PrioritiesStep';
import { ExerciseStep } from './steps/ExerciseStep';
import { RelationshipStep } from './steps/RelationshipStep';
import { CompletionStep } from './steps/CompletionStep';

// Setup UI components
import { Card } from '@/components/ui/card';
import { Dumbbell, Sparkles, Heart, Target } from 'lucide-react';

interface ChampionRoutineFlowProps {
  onComplete?: () => void;
}

type RoutineStepId = 
  | 'gratitude' 
  | 'hydration' 
  | 'light' 
  | 'breathing' 
  | 'meditation' 
  | 'autosuggestion' 
  | 'visualization' 
  | 'reading' 
  | 'journaling'
  | 'priorities'
  | 'exercise' 
  | 'relationships'
  | 'completion';

const ROUTINE_STEPS: RoutineStepId[] = [
  'gratitude',
  'hydration',
  'light',
  'breathing',
  'meditation',
  'autosuggestion',
  'visualization',
  'reading',
  'journaling',
  'priorities',
  'exercise',
  'relationships',
  'completion',
];

const STEP_LABELS: Record<RoutineStepId, string> = {
  gratitude: 'Recunoștință',
  hydration: 'Hidratare',
  light: 'Lumină',
  breathing: 'Respirație',
  meditation: 'Meditație',
  autosuggestion: 'Autosugestie',
  visualization: 'Vizualizare',
  reading: 'Citit',
  journaling: 'Journaling',
  priorities: 'Priorități',
  exercise: 'Exerciții',
  relationships: 'Relații',
  completion: 'Finalizare',
};

export function ChampionRoutineFlow({ onComplete }: ChampionRoutineFlowProps) {
  const {
    people,
    todayLog,
    isLoading,
    isConfigured,
    autosuggestion,
    updateLog,
    updateAutosuggestion,
    saveSettings,
  } = useChampionRoutine();

  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [settingsOpen, setSettingsOpen] = useState(false);

  // Debounced update for text inputs
  const debouncedUpdateLog = useCallback(
    debounce((field: string, value: any) => updateLog(field as any, value), 500),
    [updateLog]
  );

  const currentStepId = ROUTINE_STEPS[currentStepIndex];
  const progress = ((currentStepIndex + 1) / ROUTINE_STEPS.length) * 100;

  const goToNextStep = () => {
    // Skip relationships step if no people configured
    if (currentStepId === 'exercise' && people.length === 0) {
      setCurrentStepIndex(ROUTINE_STEPS.indexOf('completion'));
    } else if (currentStepIndex < ROUTINE_STEPS.length - 1) {
      setCurrentStepIndex(currentStepIndex + 1);
    }
  };

  const goToPreviousStep = () => {
    if (currentStepIndex > 0) {
      // Skip relationships step if no people configured when going back
      if (currentStepId === 'completion' && people.length === 0) {
        setCurrentStepIndex(ROUTINE_STEPS.indexOf('exercise'));
      } else {
        setCurrentStepIndex(currentStepIndex - 1);
      }
    }
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
                Configurează-ți rutina personalizată pentru cele 4 arii ale vieții
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              {[
                { icon: Dumbbell, label: 'Body', color: 'from-orange-500/20 to-red-500/20 border-orange-500/30' },
                { icon: Sparkles, label: 'Being', color: 'from-purple-500/20 to-indigo-500/20 border-purple-500/30' },
                { icon: Heart, label: 'Balance', color: 'from-pink-500/20 to-rose-500/20 border-pink-500/30' },
                { icon: Target, label: 'Business', color: 'from-blue-500/20 to-cyan-500/20 border-blue-500/30' },
              ].map(({ icon: Icon, label, color }) => (
                <Card
                  key={label}
                  className={`p-6 bg-gradient-to-br ${color} cursor-pointer hover:scale-105 transition-transform`}
                  onClick={() => setSettingsOpen(true)}
                >
                  <div className="flex flex-col items-center gap-2">
                    <Icon className="h-10 w-10" />
                    <span className="font-medium">{label}</span>
                  </div>
                </Card>
              ))}
            </div>

            <Button onClick={() => setSettingsOpen(true)} size="lg" className="w-full">
              <Settings className="h-4 w-4 mr-2" />
              Personalizează Rutina de Campion
            </Button>
          </Card>
        </div>
        <ChampionRoutineSettings open={settingsOpen} onOpenChange={setSettingsOpen} />
      </>
    );
  }

  // Calculate completed steps for final screen
  const completedStepsCount = [
    (todayLog?.gratitude_items || []).some(i => i?.trim()),
    todayLog?.water_drunk,
    todayLog?.light_exposure,
    todayLog?.breathing_completed,
    (todayLog?.meditation_duration_seconds || 0) > 0,
    todayLog?.autosuggestion_completed,
    todayLog?.visualization_completed,
    todayLog?.reading_completed,
    todayLog?.journaling_completed,
    (todayLog?.priorities || []).some(i => i?.trim()),
    todayLog?.exercise_completed,
    (todayLog?.relationship_actions || []).some(a => a.completed),
  ].filter(Boolean).length;

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
      case 'light':
        return (
          <LightExposureStep
            completed={todayLog?.light_exposure || false}
            onComplete={(value) => updateLog('light_exposure', value)}
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
      case 'meditation':
        return (
          <MeditationStep
            initialDuration={todayLog?.meditation_duration_seconds || 0}
            onComplete={(seconds) => updateLog('meditation_duration_seconds', seconds)}
            onNext={goToNextStep}
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
      case 'priorities':
        return (
          <PrioritiesStep
            items={todayLog?.priorities || []}
            onChange={(items) => debouncedUpdateLog('priorities', items)}
            onNext={goToNextStep}
          />
        );
      case 'exercise':
        return (
          <ExerciseStep
            completed={todayLog?.exercise_completed || false}
            onComplete={(value) => updateLog('exercise_completed', value)}
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
            totalSteps={12}
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
                <span className="text-sm font-medium">
                  {STEP_LABELS[currentStepId]}
                </span>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-sm text-muted-foreground">
                  {currentStepIndex + 1}/{ROUTINE_STEPS.length}
                </span>
                <Button variant="ghost" size="sm" onClick={() => setSettingsOpen(true)}>
                  <Settings className="h-4 w-4" />
                </Button>
              </div>
            </div>
            <Progress value={progress} className="h-1" />
          </div>
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
