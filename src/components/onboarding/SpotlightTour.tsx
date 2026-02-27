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
  Loader2,
  BookOpen,
  MessageCircle,
  ListTodo
} from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';
import { useNavigate } from 'react-router-dom';
import { useIsMobile } from '@/hooks/use-mobile';
import { useTourContext } from '@/context/TourContext';

export interface TourStep {
  id: string;
  targetSelector?: string; // CSS selector for element to highlight
  title: { en: string; ro: string };
  description: { en: string; ro: string };
  icon: React.ReactNode;
  position?: 'top' | 'bottom' | 'left' | 'right' | 'center';
  route?: string; // Navigate to this route before showing step
  action?: () => void; // Custom action when step is shown
  requiresSidebar?: boolean; // Open mobile sidebar before highlighting
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
  const { openMobileMenu, closeMobileMenu } = useTourContext();

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

    // On mobile, open sidebar if step requires it or targets a sidebar link
    const needsSidebar = currentStepData.requiresSidebar || 
      (isMobile && currentStepData.targetSelector?.includes('a[href='));
    
    if (needsSidebar && isMobile) {
      openMobileMenu();
      // Wait for sidebar animation to complete
      await new Promise(resolve => setTimeout(resolve, 400));
    }

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
  }, [currentStepData?.targetSelector, currentStepData?.requiresSidebar, isMobile, openMobileMenu]);

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
      // Close mobile menu when tour completes
      if (isMobile) closeMobileMenu();
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
    // Close mobile menu when tour is skipped
    if (isMobile) closeMobileMenu();
    onSkip();
  };

  if (!isOpen) return null;

  // Spotlight padding around target
  const spotlightPadding = 16;
  const mobilePadding = 10; // Smaller padding for mobile screens

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
    
    // Always center tooltip horizontally for consistency
    // Unless target is very far right, then shift left
    let left = viewportWidth / 2;
    
    // If target is on the right third of screen, shift tooltip more to center-left
    if (targetRect!.left > viewportWidth * 0.6) {
      left = viewportWidth / 2 - 50; // Shift slightly left of center
    }
    
    // Ensure tooltip stays within viewport bounds
    left = Math.max(tooltipWidth / 2 + 20, Math.min(left, viewportWidth - tooltipWidth / 2 - 20));
    
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

          {/* Mobile: SVG Overlay with real cutout for spotlight effect */}
          {!isTransitioning && isMobile && (
            <motion.svg
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 w-full h-full z-[101] pointer-events-none"
              style={{ width: '100vw', height: '100vh' }}
            >
              <defs>
                <mask id="spotlight-mask-mobile">
                  {/* White = visible overlay, Black = transparent cutout */}
                  <rect x="0" y="0" width="100%" height="100%" fill="white" />
                  {targetRect && (
                    <motion.rect
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      x={targetRect.left - mobilePadding}
                      y={targetRect.top - mobilePadding}
                      width={targetRect.width + mobilePadding * 2}
                      height={targetRect.height + mobilePadding * 2}
                      rx="12"
                      ry="12"
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
                mask="url(#spotlight-mask-mobile)"
              />
            </motion.svg>
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

          {/* Mobile: Animated glow border around target */}
          {!isTransitioning && targetRect && isMobile && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ type: 'spring', stiffness: 300, damping: 25 }}
              className="absolute rounded-xl pointer-events-none z-[102]"
              style={{
                top: targetRect.top - mobilePadding,
                left: targetRect.left - mobilePadding,
                width: targetRect.width + mobilePadding * 2,
                height: targetRect.height + mobilePadding * 2,
                border: '2px solid hsl(var(--primary))',
                boxShadow: `
                  0 0 15px hsl(var(--primary) / 0.6),
                  0 0 30px hsl(var(--primary) / 0.4),
                  0 0 45px hsl(var(--primary) / 0.2)
                `,
                animation: 'spotlight-pulse 2s ease-in-out infinite'
              }}
            />
          )}

          {/* Tooltip */}
          {!isTransitioning && (
            <motion.div
              key={currentStep}
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              transition={{ type: 'spring', stiffness: 300, damping: 30, delay: 0.1 }}
              className={`bg-card border border-border rounded-xl shadow-2xl z-[103] pointer-events-auto ${
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
      en: 'Welcome to CEO Mind OS! 🎉', 
      ro: 'Bun venit în CEO Mind OS! 🎉' 
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
    id: 'programs-info',
    targetSelector: 'a[href="/programs"]',
    route: '/dashboard',
    requiresSidebar: true,
    title: { 
      en: '📚 Programs - Courses & Challenges', 
      ro: '📚 Programe - Cursuri & Challenge-uri' 
    },
    description: { 
      en: 'Access all programs: 7-Day Challenge (free) and Warrior Launch Accelerator (premium). Each program guides you step by step towards transformation.',
      ro: 'Accesează toate programele: Challenge-ul de 7 zile (gratuit) și Warrior Launch Accelerator (premium). Fiecare program te ghidează pas cu pas către transformare.'
    },
    icon: <BookOpen className="h-8 w-8 text-orange-500" />,
    position: 'right'
  },
  {
    id: 'door-info',
    targetSelector: 'a[href="/door"]',
    route: '/dashboard',
    requiresSidebar: true,
    title: { 
      en: '📋 The Door - Command Center', 
      ro: '📋 The Door - Centrul de Comandă' 
    },
    description: { 
      en: 'Plan your week with Weekly Goals (high-impact) and Today\'s Focus (daily actions). The Domino effect starts here!',
      ro: 'Planifică-ți săptămâna cu Obiective Săptămânale (impact mare) și Focusul de Azi (acțiuni zilnice). Efectul Domino începe aici!'
    },
    icon: <Calendar className="h-8 w-8 text-blue-500" />,
    position: 'right'
  },
  // champion-info step removed - consolidated into AccountabilityCoachWidget
  {
    id: 'accountability-plan',
    targetSelector: '[data-tour="accountability-plan-tab"]',
    route: '/dashboard',
    title: { 
      en: '📋 Plan - Your Tasks', 
      ro: '📋 Plan - Task-urile Tale' 
    },
    description: { 
      en: 'All your pending tasks and reminders are here! Complete your foundation steps to unlock your full potential.',
      ro: 'Toate task-urile și reminder-urile tale sunt aici! Completează pașii de fundație pentru a-ți debloca potențialul maxim.'
    },
    icon: <ListTodo className="h-8 w-8 text-amber-500" />,
    position: 'right',
    action: () => {
      // Open the Accountability Coach widget and show Plan tab
      window.dispatchEvent(new CustomEvent('open-accountability-coach', { detail: { tab: 'plan' } }));
    }
  },
  {
    id: 'accountability-coach',
    targetSelector: '[data-tour="accountability-coach-tab"]',
    route: '/dashboard',
    title: { 
      en: '🤖 AI Coach - Ask Anything', 
      ro: '🤖 AI Coach - Întreabă Orice' 
    },
    description: { 
      en: 'Your personal AI assistant! Ask about your goals, get motivation, plan your day, or just chat. I know your objectives and I\'m here to help!',
      ro: 'Asistentul tău personal AI! Întreabă despre obiectivele tale, primește motivație, planifică-ți ziua sau doar discută. Îți cunosc obiectivele și sunt aici să te ajut!'
    },
    icon: <MessageCircle className="h-8 w-8 text-primary" />,
    position: 'right',
    action: () => {
      // Switch to AI Coach tab
      window.dispatchEvent(new CustomEvent('open-accountability-coach', { detail: { tab: 'coach' } }));
    }
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
    position: 'center',
    action: () => {
      // Close the Accountability Coach when tour ends
      // Widget will close automatically since we're moving to a step without target
    }
  }
];
