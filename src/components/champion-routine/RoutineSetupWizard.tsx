import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { 
  Clock, 
  Zap, 
  Trophy, 
  Dumbbell, 
  Sparkles, 
  Heart, 
  Briefcase,
  ChevronRight,
  ChevronLeft,
  Check,
  Rocket
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useChampionRoutine } from '@/hooks/useChampionRoutine';
import { toast } from 'sonner';

interface RoutineSetupWizardProps {
  onComplete: () => void;
  onSkip?: () => void;
}

interface TimeOption {
  id: string;
  label: string;
  description: string;
  icon: React.ReactNode;
  steps: string[];
}

interface PriorityOption {
  id: string;
  label: string;
  icon: React.ReactNode;
  color: string;
}

const TIME_OPTIONS: TimeOption[] = [
  {
    id: 'rapid',
    label: '5 minute',
    description: 'Esențialul pentru o zi bună',
    icon: <Zap className="h-8 w-8" />,
    steps: ['hydration', 'gratitude', 'breathing']
  },
  {
    id: 'balanced',
    label: '15 minute',
    description: 'Echilibru între corp și minte',
    icon: <Clock className="h-8 w-8" />,
    steps: ['hydration', 'breathing', 'meditation', 'gratitude', 'visualization', 'exercise', 'reading']
  },
  {
    id: 'champion',
    label: '30+ minute',
    description: 'Rutina completă de campion',
    icon: <Trophy className="h-8 w-8" />,
    steps: [
      'emotionalCheck', 'emotionalTransform', 'lightExposure', 'hydration', 'breathing',
      'meditation', 'gratitude', 'visualization', 'autosuggestion', 'visionDeclaration',
      'journaling', 'reading', 'exercise', 'mealPlanning', 'learn', 'apply',
      'contentCreation', 'relationships'
    ]
  }
];

const PRIORITY_OPTIONS: PriorityOption[] = [
  {
    id: 'being',
    label: 'Mindset',
    icon: <Sparkles className="h-6 w-6" />,
    color: 'from-purple-500/20 to-indigo-500/20 border-purple-500/50 text-purple-400'
  },
  {
    id: 'body',
    label: 'Corp',
    icon: <Dumbbell className="h-6 w-6" />,
    color: 'from-red-500/20 to-orange-500/20 border-red-500/50 text-red-400'
  },
  {
    id: 'business',
    label: 'Business',
    icon: <Briefcase className="h-6 w-6" />,
    color: 'from-blue-500/20 to-cyan-500/20 border-blue-500/50 text-blue-400'
  },
  {
    id: 'balance',
    label: 'Relații',
    icon: <Heart className="h-6 w-6" />,
    color: 'from-pink-500/20 to-rose-500/20 border-pink-500/50 text-pink-400'
  }
];

const HABIT_OPTIONS = [
  { id: 'habit_body', label: 'Corp', icon: <Dumbbell className="h-5 w-5" />, color: 'text-red-400' },
  { id: 'habit_being', label: 'Spirit', icon: <Sparkles className="h-5 w-5" />, color: 'text-purple-400' },
  { id: 'habit_balance', label: 'Relații', icon: <Heart className="h-5 w-5" />, color: 'text-pink-400' },
  { id: 'habit_business', label: 'Business', icon: <Briefcase className="h-5 w-5" />, color: 'text-blue-400' }
];

export function RoutineSetupWizard({ onComplete, onSkip }: RoutineSetupWizardProps) {
  const { saveSettings } = useChampionRoutine();
  const [currentStep, setCurrentStep] = useState(0);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [selectedPriorities, setSelectedPriorities] = useState<string[]>([]);
  const [selectedHabits, setSelectedHabits] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const togglePriority = (id: string) => {
    setSelectedPriorities(prev => 
      prev.includes(id) 
        ? prev.filter(p => p !== id)
        : [...prev, id]
    );
  };

  const toggleHabit = (id: string) => {
    setSelectedHabits(prev => 
      prev.includes(id) 
        ? prev.filter(h => h !== id)
        : [...prev, id]
    );
  };

  const canProceed = () => {
    if (currentStep === 0) return selectedTime !== null;
    if (currentStep === 1) return selectedPriorities.length > 0;
    return true;
  };

  const handleComplete = async () => {
    setIsSubmitting(true);
    
    try {
      // Get the base steps from time selection
      const timeOption = TIME_OPTIONS.find(t => t.id === selectedTime);
      let activeSteps = timeOption?.steps || [];
      
      // Add priority-specific steps if not already included
      selectedPriorities.forEach(priority => {
        if (priority === 'being' && !activeSteps.includes('meditation')) {
          activeSteps = [...activeSteps, 'meditation', 'visualization', 'journaling'];
        }
        if (priority === 'body' && !activeSteps.includes('exercise')) {
          activeSteps = [...activeSteps, 'exercise', 'mealPlanning'];
        }
        if (priority === 'business' && !activeSteps.includes('contentCreation')) {
          activeSteps = [...activeSteps, 'learn', 'apply', 'contentCreation'];
        }
        if (priority === 'balance' && !activeSteps.includes('relationships')) {
          activeSteps = [...activeSteps, 'relationships'];
        }
      });

      // Remove duplicates
      activeSteps = [...new Set(activeSteps)];

      const { error } = await saveSettings({
        is_configured: true,
        active_steps: activeSteps,
        routine_steps_order: activeSteps,
        habit_steps: selectedHabits,
        include_daily_tasks: true
      });

      if (error) {
        toast.error('Eroare la salvare. Încearcă din nou.');
        return;
      }

      toast.success('Rutina ta a fost configurată! 🎉');
      onComplete();
    } catch (err) {
      toast.error('Eroare la configurare');
    } finally {
      setIsSubmitting(false);
    }
  };

  const steps = [
    // Step 1: Time
    <motion.div
      key="time"
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="space-y-6"
    >
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-bold text-white">Cât timp ai dimineața?</h2>
        <p className="text-white/60">Selectează timpul disponibil pentru rutina ta</p>
      </div>

      <div className="grid gap-4">
        {TIME_OPTIONS.map((option) => (
          <Card
            key={option.id}
            onClick={() => setSelectedTime(option.id)}
            className={cn(
              "p-5 cursor-pointer transition-all duration-300 border-2",
              "bg-white/5 hover:bg-white/10 backdrop-blur-sm",
              selectedTime === option.id
                ? "border-primary ring-2 ring-primary/20"
                : "border-white/10 hover:border-white/20"
            )}
          >
            <div className="flex items-center gap-4">
              <div className={cn(
                "p-3 rounded-xl",
                selectedTime === option.id
                  ? "bg-primary/20 text-primary"
                  : "bg-white/10 text-white/60"
              )}>
                {option.icon}
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-white text-lg">{option.label}</h3>
                <p className="text-white/60 text-sm">{option.description}</p>
              </div>
              {selectedTime === option.id && (
                <Check className="h-6 w-6 text-primary" />
              )}
            </div>
          </Card>
        ))}
      </div>
    </motion.div>,

    // Step 2: Priorities
    <motion.div
      key="priorities"
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="space-y-6"
    >
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-bold text-white">Ce e prioritar pentru tine?</h2>
        <p className="text-white/60">Selectează una sau mai multe arii (poți schimba oricând)</p>
      </div>

      <div className="grid grid-cols-2 gap-4">
        {PRIORITY_OPTIONS.map((option) => (
          <Card
            key={option.id}
            onClick={() => togglePriority(option.id)}
            className={cn(
              "p-5 cursor-pointer transition-all duration-300 border-2",
              "bg-gradient-to-br backdrop-blur-sm",
              option.color,
              selectedPriorities.includes(option.id)
                ? "ring-2 ring-white/30 scale-[1.02]"
                : "opacity-70 hover:opacity-100"
            )}
          >
            <div className="flex flex-col items-center gap-3 text-center">
              <div className={cn(
                "p-3 rounded-xl bg-white/10",
                selectedPriorities.includes(option.id) && "bg-white/20"
              )}>
                {option.icon}
              </div>
              <span className="font-semibold text-white">{option.label}</span>
              {selectedPriorities.includes(option.id) && (
                <Check className="h-5 w-5 text-white absolute top-2 right-2" />
              )}
            </div>
          </Card>
        ))}
      </div>
    </motion.div>,

    // Step 3: Habits
    <motion.div
      key="habits"
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="space-y-6"
    >
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-bold text-white">Vrei să urmărești habits?</h2>
        <p className="text-white/60">Adaugă tracking pentru habits-urile tale zilnice (opțional)</p>
      </div>

      <div className="grid grid-cols-2 gap-3">
        {HABIT_OPTIONS.map((option) => (
          <Card
            key={option.id}
            onClick={() => toggleHabit(option.id)}
            className={cn(
              "p-4 cursor-pointer transition-all duration-300 border",
              "bg-white/5 hover:bg-white/10 backdrop-blur-sm",
              selectedHabits.includes(option.id)
                ? "border-white/40 bg-white/10"
                : "border-white/10"
            )}
          >
            <div className="flex items-center gap-3">
              <div className={option.color}>{option.icon}</div>
              <span className="text-white font-medium">{option.label}</span>
              {selectedHabits.includes(option.id) && (
                <Check className="h-4 w-4 text-primary ml-auto" />
              )}
            </div>
          </Card>
        ))}
      </div>

      <p className="text-center text-white/40 text-sm">
        Poți sări acest pas și configura mai târziu
      </p>
    </motion.div>
  ];

  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center p-4">
      <Card className="w-full max-w-lg bg-white/5 backdrop-blur-xl border-white/10 p-6 space-y-6">
        {/* Progress dots */}
        <div className="flex justify-center gap-2">
          {[0, 1, 2].map((step) => (
            <div
              key={step}
              className={cn(
                "w-2.5 h-2.5 rounded-full transition-all duration-300",
                step === currentStep
                  ? "bg-primary w-8"
                  : step < currentStep
                    ? "bg-primary/50"
                    : "bg-white/20"
              )}
            />
          ))}
        </div>

        {/* Step content */}
        <AnimatePresence mode="wait">
          {steps[currentStep]}
        </AnimatePresence>

        {/* Navigation */}
        <div className="flex justify-between gap-4 pt-4">
          {currentStep > 0 ? (
            <Button
              variant="ghost"
              onClick={() => setCurrentStep(currentStep - 1)}
              className="text-white/60 hover:text-white"
            >
              <ChevronLeft className="h-4 w-4 mr-1" />
              Înapoi
            </Button>
          ) : (
            <Button
              variant="ghost"
              onClick={onSkip}
              className="text-white/40 hover:text-white/60"
            >
              Configurez mai târziu
            </Button>
          )}

          {currentStep < 2 ? (
            <Button
              onClick={() => setCurrentStep(currentStep + 1)}
              disabled={!canProceed()}
              className="bg-primary hover:bg-primary/90"
            >
              Continuă
              <ChevronRight className="h-4 w-4 ml-1" />
            </Button>
          ) : (
            <Button
              onClick={handleComplete}
              disabled={isSubmitting}
              className="bg-gradient-to-r from-primary to-purple-500 hover:opacity-90"
            >
              {isSubmitting ? (
                'Se salvează...'
              ) : (
                <>
                  <Rocket className="h-4 w-4 mr-2" />
                  Începe Rutina!
                </>
              )}
            </Button>
          )}
        </div>
      </Card>
    </div>
  );
}
