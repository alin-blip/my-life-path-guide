import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { 
  X, 
  ChevronRight, 
  ChevronLeft, 
  Target, 
  Image, 
  Brain, 
  Dumbbell, 
  Calendar,
  Sparkles,
  Trophy,
  CheckCircle2,
  Loader2
} from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';
import { useNavigate } from 'react-router-dom';
import { useIsMobile } from '@/hooks/use-mobile';

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
  const [isTransitioning, setIsTransitioning] = useState(false);
  const { language } = useLanguage();
  const navigate = useNavigate();
  const isMobile = useIsMobile();

  const currentStepData = steps[currentStep];
  const isLastStep = currentStep === steps.length - 1;
  const isFirstStep = currentStep === 0;

  // Scroll to element and update target rect with proper timing
  const scrollAndHighlight = useCallback(async () => {
    if (!currentStepData?.targetSelector) {
      setTargetRect(null);
      setIsTransitioning(false);
      return;
    }

    setIsTransitioning(true);

    // Wait a bit for any route navigation to complete
    await new Promise(resolve => setTimeout(resolve, 100));

    const element = document.querySelector(currentStepData.targetSelector);
    
    if (!element) {
      console.warn(`Tour target not found: ${currentStepData.targetSelector}`);
      setTargetRect(null);
      setIsTransitioning(false);
      return;
    }

    // Scroll element into view first
    element.scrollIntoView({ behavior: 'smooth', block: 'center' });

    // Wait for scroll animation to complete
    await new Promise(resolve => setTimeout(resolve, 600));

    // Now calculate the rect after scrolling is complete
    const rect = element.getBoundingClientRect();
    setTargetRect(rect);
    setIsTransitioning(false);
  }, [currentStepData?.targetSelector]);

  // Handle step changes
  useEffect(() => {
    if (!isOpen) return;
    
    // Navigate if step requires it
    if (currentStepData?.route) {
      navigate(currentStepData.route);
      // Wait for navigation, then scroll and highlight
      setTimeout(scrollAndHighlight, 400);
    } else {
      scrollAndHighlight();
    }

    // Run custom action if defined
    if (currentStepData?.action) {
      currentStepData.action();
    }
  }, [currentStep, isOpen, currentStepData, navigate, scrollAndHighlight]);

  // Update target rect on resize
  useEffect(() => {
    if (!isOpen || isTransitioning) return;
    
    const handleResize = () => {
      if (currentStepData?.targetSelector) {
        const element = document.querySelector(currentStepData.targetSelector);
        if (element) {
          const rect = element.getBoundingClientRect();
          setTargetRect(rect);
        }
      }
    };
    
    window.addEventListener('resize', handleResize);
    window.addEventListener('scroll', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('scroll', handleResize);
    };
  }, [isOpen, isTransitioning, currentStepData?.targetSelector]);

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

  // Spotlight padding around target
  const spotlightPadding = 16;

  // Check if this is a centered step (no target or position is center)
  const isCentered = !targetRect || currentStepData?.position === 'center';

  // Calculate tooltip position for desktop
  const getTooltipPosition = (): React.CSSProperties => {
    if (isCentered || isMobile) {
      return {};
    }

    const padding = 20;
    const viewportHeight = window.innerHeight;
    const viewportWidth = window.innerWidth;
    const tooltipHeight = 320;
    const tooltipWidth = 400;
    
    let top = targetRect!.bottom + padding + spotlightPadding;
    let left = Math.max(20, Math.min(targetRect!.left + targetRect!.width / 2, viewportWidth - tooltipWidth / 2));
    
    // If tooltip would go below viewport, show above target
    if (top + tooltipHeight > viewportHeight) {
      top = Math.max(20, targetRect!.top - padding - tooltipHeight - spotlightPadding);
    }
    
    return {
      position: 'fixed' as const,
      top: `${top}px`,
      left: `${left}px`,
      transform: 'translateX(-50%)'
    };
  };

  // Mobile tooltip - compact floating tooltip near target
  const getMobileTooltipPosition = (): React.CSSProperties => {
    if (!targetRect) {
      return {
        position: 'fixed' as const,
        bottom: '20px',
        left: '10px',
        right: '10px'
      };
    }

    const viewportHeight = window.innerHeight;
    const tooltipHeight = 280;
    const padding = 12;

    // If target is in top half, show tooltip below
    if (targetRect.top < viewportHeight / 2) {
      return {
        position: 'fixed' as const,
        top: `${Math.min(targetRect.bottom + padding + spotlightPadding, viewportHeight - tooltipHeight - 20)}px`,
        left: '10px',
        right: '10px'
      };
    } else {
      // Target is in bottom half, show tooltip above
      return {
        position: 'fixed' as const,
        top: `${Math.max(20, targetRect.top - tooltipHeight - padding - spotlightPadding)}px`,
        left: '10px',
        right: '10px'
      };
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100]" onClick={handleSkip}>
          {/* Loading state during transitions */}
          {isTransitioning && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 z-[101] bg-black/60 flex items-center justify-center"
            >
              <div className="flex flex-col items-center gap-3">
                <Loader2 className="h-8 w-8 text-primary animate-spin" />
                <span className="text-white/80 text-sm">
                  {language === 'ro' ? 'Navigare...' : 'Loading...'}
                </span>
              </div>
            </motion.div>
          )}

          {/* SVG Overlay with real cutout for spotlight effect - Desktop */}
          {!isTransitioning && !isMobile && (
            <motion.svg
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 w-full h-full z-[101] pointer-events-none"
              style={{ width: '100vw', height: '100vh' }}
            >
              <defs>
                <mask id="spotlight-mask">
                  {/* White = visible overlay, Black = transparent cutout */}
                  <rect x="0" y="0" width="100%" height="100%" fill="white" />
                  {targetRect && (
                    <motion.rect
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      x={targetRect.left - spotlightPadding}
                      y={targetRect.top - spotlightPadding}
                      width={targetRect.width + spotlightPadding * 2}
                      height={targetRect.height + spotlightPadding * 2}
                      rx="16"
                      ry="16"
                      fill="black"
                    />
                  )}
                </mask>
              </defs>
              {/* Dark overlay with cutout */}
              <rect
                x="0"
                y="0"
                width="100%"
                height="100%"
                fill="rgba(0,0,0,0.75)"
                mask="url(#spotlight-mask)"
              />
            </motion.svg>
          )}

          {/* Mobile: Simple dark overlay */}
          {!isTransitioning && isMobile && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 z-[101] bg-black/70 pointer-events-none"
            />
          )}

          {/* Animated glow border around target - Desktop only */}
          {!isTransitioning && targetRect && !isMobile && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ type: 'spring', stiffness: 300, damping: 25 }}
              className="absolute rounded-2xl pointer-events-none z-[102]"
              style={{
                top: targetRect.top - spotlightPadding,
                left: targetRect.left - spotlightPadding,
                width: targetRect.width + spotlightPadding * 2,
                height: targetRect.height + spotlightPadding * 2,
                border: '3px solid hsl(var(--primary))',
                boxShadow: `
                  0 0 20px hsl(var(--primary) / 0.6),
                  0 0 40px hsl(var(--primary) / 0.4),
                  0 0 60px hsl(var(--primary) / 0.2),
                  inset 0 0 20px hsl(var(--primary) / 0.1)
                `,
                animation: 'spotlight-pulse 2s ease-in-out infinite'
              }}
            />
          )}

          {/* Mobile: Small indicator arrow pointing to target */}
          {!isTransitioning && targetRect && isMobile && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              className="absolute z-[103] pointer-events-none"
              style={{
                top: targetRect.top - 40,
                left: targetRect.left + targetRect.width / 2 - 20,
              }}
            >
              <div className="w-10 h-10 flex items-center justify-center">
                <div className="w-0 h-0 border-l-[12px] border-l-transparent border-r-[12px] border-r-transparent border-t-[16px] border-t-primary animate-bounce" />
              </div>
            </motion.div>
          )}

          {/* Tooltip */}
          {!isTransitioning && (
            <motion.div
              key={currentStep}
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              transition={{ type: 'spring', stiffness: 300, damping: 30, delay: 0.1 }}
              className={`bg-card border border-border rounded-xl shadow-2xl z-[103] ${
                isMobile 
                  ? 'p-4' 
                  : isCentered 
                    ? 'fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[90vw] max-w-md p-6' 
                    : 'w-[90vw] max-w-md p-6'
              }`}
              style={isMobile ? getMobileTooltipPosition() : (isCentered ? {} : getTooltipPosition())}
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
              <div className="flex justify-center gap-1.5 mb-3">
                {steps.map((_, index) => (
                  <div
                    key={index}
                    className={`h-1.5 rounded-full transition-all duration-300 ${
                      index === currentStep 
                        ? 'bg-primary w-5' 
                        : index < currentStep 
                          ? 'bg-primary/60 w-1.5' 
                          : 'bg-muted w-1.5'
                    }`}
                  />
                ))}
              </div>

              {/* Icon - smaller on mobile */}
              <div className={`flex justify-center ${isMobile ? 'mb-2' : 'mb-4'}`}>
                <div className={`rounded-xl bg-gradient-to-br from-primary/20 to-accent/20 border border-primary/20 ${
                  isMobile ? 'p-2' : 'p-4'
                }`}>
                  {React.cloneElement(currentStepData?.icon as React.ReactElement, {
                    className: isMobile ? 'h-5 w-5' : 'h-8 w-8'
                  })}
                </div>
              </div>

              {/* Content */}
              <div className={`text-center ${isMobile ? 'mb-3' : 'mb-6'}`}>
                <h3 className={`font-bold text-foreground ${isMobile ? 'text-base mb-1' : 'text-xl mb-2'}`}>
                  {currentStepData?.title[language as 'en' | 'ro'] || currentStepData?.title.en}
                </h3>
                <p className={`text-muted-foreground leading-relaxed ${isMobile ? 'text-xs' : 'text-sm'}`}>
                  {currentStepData?.description[language as 'en' | 'ro'] || currentStepData?.description.en}
                </p>
              </div>

              {/* Navigation */}
              <div className="flex items-center justify-between gap-2">
                <Button
                  variant="ghost"
                  size={isMobile ? 'sm' : 'default'}
                  onClick={handlePrev}
                  disabled={isFirstStep}
                  className="flex items-center gap-1"
                >
                  <ChevronLeft className="h-4 w-4" />
                  {!isMobile && (language === 'ro' ? 'Înapoi' : 'Back')}
                </Button>

                <span className="text-xs text-muted-foreground">
                  {currentStep + 1}/{steps.length}
                </span>

                <Button
                  size={isMobile ? 'sm' : 'default'}
                  onClick={handleNext}
                  className="flex items-center gap-1 bg-gradient-to-r from-primary to-accent hover:opacity-90"
                >
                  {isLastStep ? (
                    <>
                      <CheckCircle2 className="h-4 w-4" />
                      {language === 'ro' ? 'Gata' : 'Done'}
                    </>
                  ) : (
                    <>
                      {!isMobile && (language === 'ro' ? 'Continuă' : 'Next')}
                      <ChevronRight className="h-4 w-4" />
                    </>
                  )}
                </Button>
              </div>
            </motion.div>
          )}
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
