import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { 
  X, 
  ChevronRight, 
  ChevronLeft, 
  LayoutDashboard, 
  Target, 
  Image, 
  Brain, 
  Dumbbell, 
  Calendar,
  Sparkles,
  Trophy,
  CheckCircle2
} from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';
import { useNavigate } from 'react-router-dom';

export interface TourStep {
  id: string;
  targetSelector?: string; // CSS selector for element to highlight
  title: { en: string; ro: string };
  description: { en: string; ro: string };
  icon: React.ReactNode;
  position?: 'top' | 'bottom' | 'left' | 'right' | 'center';
  route?: string; // Navigate to this route before showing step
  action?: () => void; // Custom action when step is shown
}

interface SpotlightTourProps {
  steps: TourStep[];
  isOpen: boolean;
  onComplete: () => void;
  onSkip: () => void;
}

export function SpotlightTour({ steps, isOpen, onComplete, onSkip }: SpotlightTourProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [targetRect, setTargetRect] = useState<DOMRect | null>(null);
  const { language } = useLanguage();
  const navigate = useNavigate();

  const currentStepData = steps[currentStep];
  const isLastStep = currentStep === steps.length - 1;
  const isFirstStep = currentStep === 0;

  // Find and highlight target element
  const updateTargetRect = useCallback(() => {
    if (currentStepData?.targetSelector) {
      const element = document.querySelector(currentStepData.targetSelector);
      if (element) {
        const rect = element.getBoundingClientRect();
        setTargetRect(rect);
        // Scroll element into view
        element.scrollIntoView({ behavior: 'smooth', block: 'center' });
      } else {
        setTargetRect(null);
      }
    } else {
      setTargetRect(null);
    }
  }, [currentStepData?.targetSelector]);

  useEffect(() => {
    if (!isOpen) return;
    
    // Navigate if step requires it
    if (currentStepData?.route) {
      navigate(currentStepData.route);
      // Wait for navigation to complete
      setTimeout(updateTargetRect, 300);
    } else {
      updateTargetRect();
    }

    // Run custom action if defined
    if (currentStepData?.action) {
      currentStepData.action();
    }
  }, [currentStep, isOpen, currentStepData, navigate, updateTargetRect]);

  // Update target rect on resize
  useEffect(() => {
    if (!isOpen) return;
    
    const handleResize = () => updateTargetRect();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [isOpen, updateTargetRect]);

  const handleNext = () => {
    if (isLastStep) {
      onComplete();
    } else {
      setCurrentStep(prev => prev + 1);
    }
  };

  const handlePrev = () => {
    if (!isFirstStep) {
      setCurrentStep(prev => prev - 1);
    }
  };

  const handleSkip = () => {
    onSkip();
  };

  if (!isOpen) return null;

  // Calculate tooltip position - always center for simplicity and reliability
  const getTooltipPosition = (): React.CSSProperties => {
    // For center position or when no target, use flexbox centering (handled by parent)
    if (!targetRect || currentStepData?.position === 'center') {
      return {};
    }

    const padding = 20;
    const viewportHeight = window.innerHeight;
    const viewportWidth = window.innerWidth;
    
    // Calculate position relative to viewport
    let top = targetRect.bottom + padding;
    let left = Math.max(20, Math.min(targetRect.left + targetRect.width / 2, viewportWidth - 220));
    
    // If tooltip would go below viewport, show above target
    if (top + 300 > viewportHeight) {
      top = Math.max(20, targetRect.top - padding - 300);
    }
    
    return {
      position: 'fixed' as const,
      top: `${top}px`,
      left: `${left}px`,
      transform: 'translateX(-50%)'
    };
  };

  const tooltipStyle = getTooltipPosition();
  const isCentered = !targetRect || currentStepData?.position === 'center';

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100]">
          {/* Overlay with spotlight cutout */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/80 z-[101]"
            onClick={handleSkip}
          >
            {/* Spotlight highlight effect */}
            {targetRect && (
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                className="absolute rounded-lg ring-4 ring-primary ring-offset-4 ring-offset-transparent"
                style={{
                  top: targetRect.top - 8,
                  left: targetRect.left - 8,
                  width: targetRect.width + 16,
                  height: targetRect.height + 16,
                  boxShadow: '0 0 0 9999px rgba(0,0,0,0.75)',
                  backgroundColor: 'transparent',
                  pointerEvents: 'none'
                }}
              />
            )}
          </motion.div>

          {/* Tooltip - centered or positioned */}
          <motion.div
            key={currentStep}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            className={`w-[90vw] max-w-md bg-card border border-border rounded-xl shadow-2xl p-6 z-[102] ${
              isCentered 
                ? 'fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2' 
                : ''
            }`}
            style={isCentered ? {} : tooltipStyle}
            onClick={(e) => e.stopPropagation()}
        >
          {/* Skip button */}
          <Button
            variant="ghost"
            size="icon"
            onClick={handleSkip}
            className="absolute top-2 right-2 h-8 w-8 rounded-full"
          >
            <X className="h-4 w-4" />
          </Button>

          {/* Progress dots */}
          <div className="flex justify-center gap-1.5 mb-4">
            {steps.map((_, index) => (
              <div
                key={index}
                className={`h-2 w-2 rounded-full transition-all duration-300 ${
                  index === currentStep 
                    ? 'bg-primary w-6' 
                    : index < currentStep 
                      ? 'bg-primary/60' 
                      : 'bg-muted'
                }`}
              />
            ))}
          </div>

          {/* Icon */}
          <div className="flex justify-center mb-4">
            <div className="p-4 rounded-2xl bg-gradient-to-br from-primary/20 to-accent/20 border border-primary/20">
              {currentStepData?.icon}
            </div>
          </div>

          {/* Content */}
          <div className="text-center mb-6">
            <h3 className="text-xl font-bold text-foreground mb-2">
              {currentStepData?.title[language as 'en' | 'ro'] || currentStepData?.title.en}
            </h3>
            <p className="text-muted-foreground text-sm leading-relaxed">
              {currentStepData?.description[language as 'en' | 'ro'] || currentStepData?.description.en}
            </p>
          </div>

          {/* Navigation */}
          <div className="flex items-center justify-between gap-3">
            <Button
              variant="ghost"
              onClick={handlePrev}
              disabled={isFirstStep}
              className="flex items-center gap-1"
            >
              <ChevronLeft className="h-4 w-4" />
              {language === 'ro' ? 'Înapoi' : 'Back'}
            </Button>

            <span className="text-sm text-muted-foreground">
              {currentStep + 1} / {steps.length}
            </span>

            <Button
              onClick={handleNext}
              className="flex items-center gap-1 bg-gradient-to-r from-primary to-accent hover:opacity-90"
            >
              {isLastStep ? (
                <>
                  <CheckCircle2 className="h-4 w-4" />
                  {language === 'ro' ? 'Finalizează' : 'Finish'}
                </>
              ) : (
                <>
                  {language === 'ro' ? 'Continuă' : 'Next'}
                  <ChevronRight className="h-4 w-4" />
                </>
              )}
            </Button>
          </div>
        </motion.div>
      </div>
      )}
    </AnimatePresence>
  );
}

// Default tour steps for Dashboard
export const DASHBOARD_TOUR_STEPS: TourStep[] = [
  {
    id: 'welcome',
    title: { 
      en: 'Welcome to WarriorOS! 🎉', 
      ro: 'Bun venit în WarriorOS! 🎉' 
    },
    description: { 
      en: 'This quick tour will show you the most important features to transform your life in all 4 dimensions: Body, Being, Balance & Business.',
      ro: 'Acest tur rapid îți va arăta cele mai importante funcții pentru a-ți transforma viața în toate cele 4 dimensiuni: Corp, Spirit, Relații & Business.'
    },
    icon: <Sparkles className="h-8 w-8 text-primary" />,
    position: 'center'
  },
  {
    id: 'dashboard',
    targetSelector: '[data-tour="dashboard-header"]',
    title: { 
      en: 'Your Mission Objectives', 
      ro: 'Obiectivele Tale' 
    },
    description: { 
      en: 'Track your monthly, quarterly, and annual goals. Each category represents a life pillar: Body, Being, Balance & Business.',
      ro: 'Urmărește-ți obiectivele lunare, trimestriale și anuale. Fiecare categorie reprezintă un pilon al vieții: Corp, Spirit, Relații & Business.'
    },
    icon: <Target className="h-8 w-8 text-blue-500" />,
    position: 'bottom'
  },
  {
    id: 'core-activities',
    targetSelector: '[data-tour="core-activities"]',
    title: { 
      en: 'Daily Command Center', 
      ro: 'Centrul de Comandă Zilnic' 
    },
    description: { 
      en: 'Your daily non-negotiables: habits, tasks, and progress tracking. Complete these every day for maximum transformation.',
      ro: 'Activitățile tale zilnice non-negociabile: obiceiuri, task-uri și urmărirea progresului. Completează-le zilnic pentru transformare maximă.'
    },
    icon: <Dumbbell className="h-8 w-8 text-green-500" />,
    position: 'bottom'
  },
  {
    id: 'vision-board',
    targetSelector: '[data-tour="vision-board"]',
    title: { 
      en: 'Vision Declaration', 
      ro: 'Declarația Viziunii' 
    },
    description: { 
      en: 'Read your personal declaration daily to program your subconscious. Go to Vision Board to generate AI images for your goals.',
      ro: 'Citește-ți declarația personală zilnic pentru a-ți programa subconștientul. Mergi la Vision Board pentru a genera imagini AI pentru obiective.'
    },
    icon: <Image className="h-8 w-8 text-pink-500" />,
    position: 'bottom'
  },
  {
    id: 'stacks',
    targetSelector: '[data-tour="stacks"]',
    title: { 
      en: 'AI Empowerment Tools', 
      ro: 'Instrumente AI de Empowerment' 
    },
    description: { 
      en: 'AI-powered meditations personalized from YOUR goals. Also explore Stacks for anger management, clarity, and emotional reset.',
      ro: 'Meditații AI personalizate din obiectivele TALE. Explorează și Stacks pentru gestionare furie, claritate și reset emoțional.'
    },
    icon: <Brain className="h-8 w-8 text-violet-500" />,
    position: 'bottom'
  },
  {
    id: 'door-info',
    title: { 
      en: '📋 Door - Weekly Planning', 
      ro: '📋 Door - Planificare Săptămânală' 
    },
    description: { 
      en: 'Access Door from the sidebar to set your weekly HIT list (high-impact tasks) and DO list (daily actions). The Domino effect starts here!',
      ro: 'Accesează Door din meniul lateral pentru a-ți seta lista HIT (task-uri cu impact mare) și lista DO (acțiuni zilnice). Efectul Domino începe aici!'
    },
    icon: <Calendar className="h-8 w-8 text-blue-500" />,
    position: 'center'
  },
  {
    id: 'champion-info',
    title: { 
      en: '🏆 Champion Morning Routine', 
      ro: '🏆 Rutina Matinală a Campionului' 
    },
    description: { 
      en: 'Start each day with meditation, breathing, visualization, and gratitude. Access from the sidebar under "Rutină".',
      ro: 'Începe fiecare zi cu meditație, respirație, vizualizare și gratitudine. Accesează din meniul lateral la "Rutină".'
    },
    icon: <Trophy className="h-8 w-8 text-amber-500" />,
    position: 'center'
  },
  {
    id: 'complete',
    title: { 
      en: 'You\'re Ready! 🚀', 
      ro: 'Ești Pregătit! 🚀' 
    },
    description: { 
      en: 'Start your transformation journey now. Remember: Small daily actions compound into extraordinary results!',
      ro: 'Începe-ți călătoria de transformare acum. Ține minte: Acțiunile mici zilnice se compun în rezultate extraordinare!'
    },
    icon: <CheckCircle2 className="h-8 w-8 text-green-500" />,
    position: 'center'
  }
];
