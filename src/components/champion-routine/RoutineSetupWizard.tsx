import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { 
  Dumbbell, 
  Sparkles, 
  Heart, 
  Briefcase,
  ChevronRight,
  ChevronLeft,
  Check,
  Rocket,
  Lock,
  Droplets,
  Wind,
  Sun,
  Eye,
  PenTool,
  FileText,
  Utensils,
  Brain,
  BookOpen
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useChampionRoutine } from '@/hooks/useChampionRoutine';
import { toast } from 'sonner';

interface RoutineSetupWizardProps {
  onComplete: () => void;
  onSkip?: () => void;
}

// Core 4 - OBLIGATORII (nu pot fi eliminate) - 2 per categorie, aliniați cu Warrior Core 4
export const CORE4_STEPS = [
  'exercise',      // Body: Fitness (30 min exercițiu)
  'mealPlanning',  // Body: Fuel (alimentație)
  'meditation',    // Being: Meditation (autosugestie & credință)
  'journaling',    // Being: Jurnal (programare subconștient)
  'relationships', // Balance: Person 1 + Person 2 (Legea Servirii)
  'learn',         // Business: Discover (cunoștințe specializate)
  'apply',         // Business: Declare (planificare organizată)
] as const;

// Core 4 grouped by category for display
const CORE4_CATEGORIES = [
  {
    id: 'body',
    label: 'BODY',
    icon: Dumbbell,
    color: 'from-red-500/20 to-orange-500/20 border-red-500/50',
    iconColor: 'text-red-400',
    tasks: [
      { id: 'exercise', label: 'Fitness', description: '30 min exercițiu' },
      { id: 'mealPlanning', label: 'Fuel', description: 'Alimentație sănătoasă' }
    ]
  },
  {
    id: 'being',
    label: 'BEING',
    icon: Sparkles,
    color: 'from-purple-500/20 to-indigo-500/20 border-purple-500/50',
    iconColor: 'text-purple-400',
    tasks: [
      { id: 'meditation', label: 'Meditation', description: 'Autosugestie & Credință' },
      { id: 'journaling', label: 'Jurnal', description: 'Programare subconștient' }
    ]
  },
  {
    id: 'balance',
    label: 'BALANCE',
    icon: Heart,
    color: 'from-pink-500/20 to-rose-500/20 border-pink-500/50',
    iconColor: 'text-pink-400',
    tasks: [
      { id: 'relationships', label: 'Servire #1', description: 'Persoană importantă' },
      { id: 'relationships_2', label: 'Servire #2', description: 'A doua persoană' }
    ]
  },
  {
    id: 'business',
    label: 'BUSINESS',
    icon: Briefcase,
    color: 'from-blue-500/20 to-cyan-500/20 border-blue-500/50',
    iconColor: 'text-blue-400',
    tasks: [
      { id: 'learn', label: 'Discover', description: 'Învață 30 min' },
      { id: 'apply', label: 'Declare', description: 'Planificare organizată' }
    ]
  }
];

// Extra Steps - OPȚIONALE (utilizatorul poate adăuga)
const EXTRA_STEPS = [
  { id: 'hydration', label: 'Hidratare', icon: Droplets, category: 'being' },
  { id: 'breathing', label: 'Respirație', icon: Wind, category: 'being' },
  { id: 'gratitude', label: 'Recunoștință', icon: Heart, category: 'being' },
  { id: 'visualization', label: 'Vizualizare', icon: Eye, category: 'being' },
  { id: 'autosuggestion', label: 'Autosugestie', icon: Brain, category: 'being' },
  { id: 'visionDeclaration', label: 'Declarație Viziune', icon: PenTool, category: 'being' },
  { id: 'reading', label: 'Citit 10 pagini', icon: BookOpen, category: 'being' },
  { id: 'lightExposure', label: 'Lumină Naturală', icon: Sun, category: 'being' },
  { id: 'contentCreation', label: 'Content Creation', icon: FileText, category: 'business' },
];

export function RoutineSetupWizard({ onComplete, onSkip }: RoutineSetupWizardProps) {
  const { saveSettings } = useChampionRoutine();
  const [currentStep, setCurrentStep] = useState(0);
  const [selectedExtras, setSelectedExtras] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const toggleExtra = (id: string) => {
    setSelectedExtras(prev => 
      prev.includes(id) 
        ? prev.filter(e => e !== id)
        : [...prev, id]
    );
  };

  const handleComplete = async () => {
    setIsSubmitting(true);
    
    try {
      // Core 4 este ÎNTOTDEAUNA inclus
      const activeSteps = [
        'mindShifting',      // Întotdeauna primul (Core 4)
        ...CORE4_STEPS,
        ...selectedExtras,
        'completion'
      ];

      const { error } = await saveSettings({
        is_configured: true,
        active_steps: activeSteps,
        routine_steps_order: activeSteps,
        include_daily_tasks: true
      });

      if (error) {
        toast.error('Eroare la salvare. Încearcă din nou.');
        return;
      }

      toast.success('Rutina Core 4 configurată! 🎉');
      onComplete();
    } catch (err) {
      toast.error('Eroare la configurare');
    } finally {
      setIsSubmitting(false);
    }
  };

  const steps = [
    // Step 1: Core 4 (Informativ, Locked)
    <motion.div
      key="core4"
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="space-y-6"
    >
      <div className="text-center space-y-2">
        <div className="flex items-center justify-center gap-2">
          <Lock className="h-5 w-5 text-primary" />
          <h2 className="text-2xl font-bold text-white">CORE 4 - Fundația Ta</h2>
        </div>
        <p className="text-white/60">
          Acestea sunt cele 8 activități obligatorii - fundația rutinei Warrior
        </p>
      </div>

      <div className="grid grid-cols-2 gap-3">
        {CORE4_CATEGORIES.map((category) => {
          const Icon = category.icon;
          return (
            <Card
              key={category.id}
              className={cn(
                "p-4 border-2 bg-gradient-to-br backdrop-blur-sm",
                category.color
              )}
            >
              <div className="flex items-center gap-2 mb-3">
                <Icon className={cn("h-5 w-5", category.iconColor)} />
                <span className="font-bold text-white text-sm">{category.label}</span>
                <Lock className="h-3 w-3 text-white/40 ml-auto" />
              </div>
              <div className="space-y-2">
                {category.tasks.map((task) => (
                  <div key={task.id} className="flex items-start gap-2">
                    <Check className="h-4 w-4 text-green-400 mt-0.5 shrink-0" />
                    <div>
                      <p className="text-white text-sm font-medium">{task.label}</p>
                      <p className="text-white/50 text-xs">{task.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          );
        })}
      </div>

      <div className="bg-primary/10 border border-primary/30 rounded-lg p-3 text-center">
        <p className="text-primary text-sm">
          ✨ Core 4 = 8 activități zilnice pentru Body, Being, Balance & Business
        </p>
      </div>
    </motion.div>,

    // Step 2: Extra Activities (Opțional)
    <motion.div
      key="extras"
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="space-y-6"
    >
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-bold text-white">✨ Extras - Îmbunătățește Rutina</h2>
        <p className="text-white/60">
          Selectează activități adiționale (opțional)
        </p>
      </div>

      <div className="grid grid-cols-2 gap-2">
        {EXTRA_STEPS.map((extra) => {
          const Icon = extra.icon;
          const isSelected = selectedExtras.includes(extra.id);
          
          return (
            <Card
              key={extra.id}
              onClick={() => toggleExtra(extra.id)}
              className={cn(
                "p-3 cursor-pointer transition-all duration-300 border",
                "bg-white/5 hover:bg-white/10 backdrop-blur-sm",
                isSelected
                  ? "border-primary/50 bg-primary/10"
                  : "border-white/10"
              )}
            >
              <div className="flex items-center gap-2">
                <Icon className={cn(
                  "h-4 w-4",
                  isSelected ? "text-primary" : "text-white/60"
                )} />
                <span className={cn(
                  "text-sm font-medium",
                  isSelected ? "text-white" : "text-white/70"
                )}>
                  {extra.label}
                </span>
                {isSelected && (
                  <Check className="h-4 w-4 text-primary ml-auto" />
                )}
              </div>
            </Card>
          );
        })}
      </div>

      <p className="text-center text-white/40 text-sm">
        Poți sări acest pas - Core 4 e deja configurat
      </p>
    </motion.div>
  ];

  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center p-4">
      <Card className="w-full max-w-lg bg-white/5 backdrop-blur-xl border-white/10 p-6 space-y-6">
        {/* Progress dots */}
        <div className="flex justify-center gap-2">
          {[0, 1].map((step) => (
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

          {currentStep < 1 ? (
            <Button
              onClick={() => setCurrentStep(currentStep + 1)}
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
