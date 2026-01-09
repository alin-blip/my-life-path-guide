import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { SetupProgress } from '@/components/setup/SetupProgress';
import { ProfileStep } from '@/components/setup/steps/ProfileStep';
import { NutritionStep } from '@/components/setup/steps/NutritionStep';
import { WorkoutStep } from '@/components/setup/steps/WorkoutStep';
import { RoutineStep } from '@/components/setup/steps/RoutineStep';
import { HabitsStep } from '@/components/setup/steps/HabitsStep';
import { PeopleStep } from '@/components/setup/steps/PeopleStep';
import { AutosuggestionStep } from '@/components/setup/steps/AutosuggestionStep';
import { useChampionRoutine } from '@/hooks/useChampionRoutine';
import { useSetupStatus } from '@/hooks/useSetupStatus';
import { toast } from 'sonner';
import { 
  User, Apple, Dumbbell, Sunrise, Sparkles, Users, Brain,
  ChevronLeft, ChevronRight, Check, Loader2, Rocket
} from 'lucide-react';
import { cn } from '@/lib/utils';

const STEPS = [
  { id: 'profile', label: 'Profil', icon: User },
  { id: 'nutrition', label: 'Nutriție', icon: Apple },
  { id: 'workout', label: 'Antrenament', icon: Dumbbell },
  { id: 'routine', label: 'Rutină', icon: Sunrise },
  { id: 'habits', label: 'Habits', icon: Sparkles },
  { id: 'people', label: 'Persoane', icon: Users },
  { id: 'mindset', label: 'Mindset', icon: Brain },
];

export default function SetupWizard() {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(0);
  const [isSaving, setIsSaving] = useState(false);
  
  const { 
    settings, 
    people, 
    isLoading, 
    saveSettings, 
    addPerson, 
    removePerson 
  } = useChampionRoutine();
  
  const setupStatus = useSetupStatus();

  // Local state for all settings
  const [formData, setFormData] = useState<Record<string, any>>({});

  // Initialize form data from settings
  useEffect(() => {
    if (settings) {
      setFormData({
        weight_kg: settings.weight_kg,
        height_cm: settings.height_cm,
        age: settings.age,
        activity_level: settings.activity_level,
        calorie_target: settings.calorie_target,
        protein_target: settings.protein_target,
        protein_percent: settings.protein_percent,
        carbs_target: settings.carbs_target,
        carbs_percent: settings.carbs_percent,
        fats_target: settings.fats_target,
        fats_percent: settings.fats_percent,
        workout_goal: settings.workout_goal,
        workout_level: settings.workout_level,
        workout_location: settings.workout_location,
        workout_days_per_week: settings.workout_days_per_week,
        workout_target_groups: settings.workout_target_groups || [],
        active_steps: settings.active_steps || [],
        routine_steps_order: settings.routine_steps_order || [],
        habit_steps: settings.habit_steps || [],
        default_autosuggestion: settings.default_autosuggestion,
        meditation_default_mode: settings.meditation_default_mode,
        meditation_default_duration: settings.meditation_default_duration,
        binaural_enabled: settings.binaural_enabled,
        binaural_default_type: settings.binaural_default_type,
      });
    }
  }, [settings]);

  const handleDataChange = async (updates: Record<string, any>) => {
    setFormData(prev => ({ ...prev, ...updates }));
    
    // Auto-save on change
    setIsSaving(true);
    try {
      await saveSettings(updates);
    } finally {
      setIsSaving(false);
    }
  };

  const stepsWithStatus = useMemo(() => {
    return STEPS.map((step, index) => ({
      ...step,
      icon: <step.icon className="w-4 h-4" />,
      isComplete: [
        setupStatus.isProfileComplete,
        setupStatus.isNutritionComplete,
        setupStatus.isWorkoutComplete,
        setupStatus.isRoutineComplete,
        setupStatus.isHabitsComplete,
        setupStatus.isPeopleComplete,
        setupStatus.isAutosuggestionComplete,
      ][index],
    }));
  }, [setupStatus]);

  const goToStep = (step: number) => {
    if (step >= 0 && step < STEPS.length) {
      setCurrentStep(step);
    }
  };

  const handleComplete = async () => {
    setIsSaving(true);
    try {
      await saveSettings({ 
        ...formData,
        setup_completed_at: new Date().toISOString(),
        is_configured: true,
        nutrition_configured: true,
      });
      toast.success('Setup complet! Ești gata să începi.');
      navigate('/dashboard');
    } catch (error) {
      toast.error('Eroare la salvare. Încearcă din nou.');
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  const renderStepContent = () => {
    switch (currentStep) {
      case 0:
        return (
          <ProfileStep
            data={{
              weight_kg: formData.weight_kg,
              height_cm: formData.height_cm,
              age: formData.age,
              activity_level: formData.activity_level,
            }}
            onChange={handleDataChange}
          />
        );
      case 1:
        return (
          <NutritionStep
            data={{
              calorie_target: formData.calorie_target,
              protein_target: formData.protein_target,
              protein_percent: formData.protein_percent,
              carbs_target: formData.carbs_target,
              carbs_percent: formData.carbs_percent,
              fats_target: formData.fats_target,
              fats_percent: formData.fats_percent,
              weight_kg: formData.weight_kg,
              height_cm: formData.height_cm,
              age: formData.age,
              activity_level: formData.activity_level,
            }}
            onChange={handleDataChange}
          />
        );
      case 2:
        return (
          <WorkoutStep
            data={{
              workout_goal: formData.workout_goal,
              workout_level: formData.workout_level,
              workout_location: formData.workout_location,
              workout_days_per_week: formData.workout_days_per_week,
              workout_target_groups: formData.workout_target_groups || [],
            }}
            onChange={handleDataChange}
          />
        );
      case 3:
        return (
          <RoutineStep
            data={{
              active_steps: formData.active_steps || [],
              routine_steps_order: formData.routine_steps_order || [],
            }}
            onChange={handleDataChange}
          />
        );
      case 4:
        return (
          <HabitsStep
            data={{
              habit_steps: formData.habit_steps || [],
            }}
            onChange={handleDataChange}
          />
        );
      case 5:
        return (
          <PeopleStep
            people={people}
            onAddPerson={addPerson}
            onRemovePerson={removePerson}
          />
        );
      case 6:
        return (
          <AutosuggestionStep
            data={{
              default_autosuggestion: formData.default_autosuggestion,
              meditation_default_mode: formData.meditation_default_mode,
              meditation_default_duration: formData.meditation_default_duration,
              binaural_enabled: formData.binaural_enabled,
              binaural_default_type: formData.binaural_default_type,
            }}
            onChange={handleDataChange}
          />
        );
      default:
        return null;
    }
  };

  const isLastStep = currentStep === STEPS.length - 1;

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Rocket className="w-6 h-6 text-primary" />
            <h1 className="text-xl font-bold">Setup Warrior</h1>
          </div>
          <div className="flex items-center gap-4">
            {isSaving && (
              <span className="text-sm text-muted-foreground flex items-center gap-2">
                <Loader2 className="w-3 h-3 animate-spin" />
                Salvare...
              </span>
            )}
            <div className="text-sm text-muted-foreground">
              {setupStatus.overallProgress}% complet
            </div>
            <Progress value={setupStatus.overallProgress} className="w-24 h-2" />
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-6">
        <div className="flex gap-6">
          {/* Sidebar */}
          <aside className="hidden lg:block w-64 shrink-0">
            <div className="sticky top-24">
              <SetupProgress
                steps={stepsWithStatus}
                currentStep={currentStep}
                onStepClick={goToStep}
              />
            </div>
          </aside>

          {/* Main Content */}
          <main className="flex-1 max-w-3xl">
            {/* Mobile Step Indicator */}
            <div className="lg:hidden mb-6">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium">
                  Pas {currentStep + 1} din {STEPS.length}
                </span>
                <span className="text-sm text-muted-foreground">
                  {STEPS[currentStep].label}
                </span>
              </div>
              <Progress value={((currentStep + 1) / STEPS.length) * 100} className="h-2" />
            </div>

            {/* Step Content */}
            <div className="min-h-[60vh]">
              {renderStepContent()}
            </div>

            {/* Navigation */}
            <div className="flex items-center justify-between mt-8 pt-6 border-t">
              <Button
                variant="outline"
                onClick={() => goToStep(currentStep - 1)}
                disabled={currentStep === 0}
              >
                <ChevronLeft className="w-4 h-4 mr-2" />
                Înapoi
              </Button>

              <div className="flex gap-2">
                <Button
                  variant="ghost"
                  onClick={() => navigate('/dashboard')}
                >
                  Sari peste
                </Button>
                
                {isLastStep ? (
                  <Button onClick={handleComplete} disabled={isSaving}>
                    {isSaving ? (
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    ) : (
                      <Check className="w-4 h-4 mr-2" />
                    )}
                    Finalizează
                  </Button>
                ) : (
                  <Button onClick={() => goToStep(currentStep + 1)}>
                    Continuă
                    <ChevronRight className="w-4 h-4 ml-2" />
                  </Button>
                )}
              </div>
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}
