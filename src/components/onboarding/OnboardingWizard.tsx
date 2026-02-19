import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import {

  ChevronLeft,
  ChevronRight,
  Check,
  Target,
  Calendar,
  Image,
  ListTodo,
  Sunrise,
  Trophy,
  Sparkles,
  Rocket } from
'lucide-react';
import { useLanguage } from '@/context/LanguageContext';
import { useFoundationStatus } from '@/hooks/useFoundationStatus';
import { cn } from '@/lib/utils';

interface OnboardingWizardProps {
  isOpen: boolean;
  onClose: () => void;
}

interface WizardStep {
  id: string;
  title: {en: string;ro: string;};
  description: {en: string;ro: string;};
  icon: React.ReactNode;
  route?: string;
  checkComplete: () => boolean;
}

export const OnboardingWizard: React.FC<OnboardingWizardProps> = ({ isOpen, onClose }) => {
  const { language } = useLanguage();
  const navigate = useNavigate();
  const foundationStatus = useFoundationStatus();
  const [currentStep, setCurrentStep] = useState(0);

  const steps: WizardStep[] = [
  {
    id: 'welcome',
    title: { en: 'Welcome!', ro: 'Bun venit!' },
    description: {
      en: 'Let\'s set up your foundation for success. This wizard will guide you through the essential steps to get the most out of your journey.',
      ro: 'Hai să îți setăm fundația pentru succes. Acest wizard te va ghida prin pașii esențiali pentru a profita la maxim de călătoria ta.'
    },
    icon: <Rocket className="w-8 h-8" />,
    checkComplete: () => true
  },
  {
    id: 'annual',
    title: { en: 'Annual Objectives', ro: 'Obiective Anuale' },
    description: {
      en: 'Define your big goals for all 4 life categories: Body, Spirituality, Relationships, and Business.',
      ro: 'Definește obiectivele mari pentru toate cele 4 categorii: Corp, Spiritualitate, Relații și Business.'
    },
    icon: <Target className="w-8 h-8" />,
    route: '/door?tab=annual&startWizard=true',
    checkComplete: () => foundationStatus.hasAllAnnualCategories
  },
  {
    id: 'quarterly',
    title: { en: '90-Day Objectives', ro: 'Obiective 90 Zile' },
    description: {
      en: 'Break down your annual goals into 90-day sprints. Focus on what you can achieve in the next quarter.',
      ro: 'Împarte obiectivele anuale în sprinturi de 90 de zile. Concentrează-te pe ce poți realiza în următorul trimestru.'
    },
    icon: <Calendar className="w-8 h-8" />,
    route: '/door?tab=quarterly',
    checkComplete: () => foundationStatus.hasQuarterly
  },
  {
    id: 'monthly',
    title: { en: 'Monthly Focus', ro: 'Focus Lunar' },
    description: {
      en: 'Define your focus for this month. What are the key milestones you want to hit?',
      ro: 'Definește focusul pentru luna aceasta. Care sunt etapele cheie pe care vrei să le atingi?'
    },
    icon: <Calendar className="w-8 h-8" />,
    route: '/door?tab=monthly',
    checkComplete: () => foundationStatus.hasMonthly
  },
  {
    id: 'vision',
    title: { en: 'Vision Board', ro: 'Vision Board' },
    description: {
      en: 'Generate AI images that represent your goals. Visualize your future self every day.',
      ro: 'Generează imagini AI care reprezintă obiectivele tale. Vizualizează-te în fiecare zi.'
    },
    icon: <Image className="w-8 h-8" />,
    route: '/dashboard',
    checkComplete: () => foundationStatus.hasVisionBoard
  },
  {
    id: 'tasks',
    title: { en: 'Domino Door', ro: 'Domino Door' },
    description: {
      en: 'Set up your weekly and daily tasks. The Domino Door helps you knock down one task at a time.',
      ro: 'Setează task-urile săptămânale și zilnice. Domino Door te ajută să dobori câte un task pe rând.'
    },
    icon: <ListTodo className="w-8 h-8" />,
    route: '/door',
    checkComplete: () => foundationStatus.hasTodayTasks
  },
  {
    id: 'routine',
    title: { en: 'Warrior Routine', ro: 'Rutina Războinicului' },
    description: {
      en: 'Start your warrior routine to set the tone for a productive day.',
      ro: 'Începe Rutina Războinicului pentru a seta tonul unei zile productive.'
    },
    icon: <Sunrise className="w-8 h-8" />,
    route: '/daily-flow',
    checkComplete: () => foundationStatus.hasStartedRoutineToday
  },
  {
    id: 'complete',
    title: { en: 'Congratulations!', ro: 'Felicitări!' },
    description: {
      en: 'Your foundation is set! You\'re ready to start your journey towards your goals.',
      ro: 'Fundația ta este gata! Ești pregătit să începi călătoria către obiectivele tale.'
    },
    icon: <Trophy className="w-8 h-8" />,
    checkComplete: () => true
  }];


  const currentStepData = steps[currentStep];
  const progressPercentage = Math.round(currentStep / (steps.length - 1) * 100);

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      handleComplete();
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSkip = () => {
    localStorage.setItem('onboarding-wizard-skipped', 'true');
    onClose();
  };

  const handleComplete = () => {
    localStorage.setItem('onboarding-wizard-completed', 'true');
    onClose();
  };

  const handleGoToStep = (route?: string) => {
    if (route) {
      onClose();
      navigate(route);
    }
  };

  // Reset step when opened
  useEffect(() => {
    if (isOpen) {
      // Find the first incomplete step
      const firstIncomplete = steps.findIndex((step) => !step.checkComplete());
      setCurrentStep(firstIncomplete > 0 ? firstIncomplete : 0);
    }
  }, [isOpen, foundationStatus]);

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-4xl h-[600px] p-0 overflow-hidden">
        <div className="flex h-full">
          {/* Sidebar */}
          <div className="w-64 bg-muted/50 border-r border-border p-6 flex flex-col">
            <div className="flex items-center gap-2 mb-8">
              <Sparkles className="w-6 h-6 text-primary" />
              <span className="font-semibold text-lg">
                Accountability Coach
              </span>
            </div>
            
            <nav className="flex-1 space-y-1">
              {steps.map((step, index) => {
                const isComplete = step.checkComplete();
                const isCurrent = index === currentStep;
                const isPast = index < currentStep;

                return (
                  <button
                    key={step.id}
                    onClick={() => setCurrentStep(index)}
                    className={cn(
                      "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left text-sm transition-colors",
                      isCurrent && "bg-primary/10 text-primary font-medium",
                      !isCurrent && isComplete && "text-muted-foreground",
                      !isCurrent && !isComplete && "text-muted-foreground/60"
                    )}>

                    <div className={cn(
                      "w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 text-xs font-medium",
                      isCurrent && "bg-primary text-primary-foreground",
                      !isCurrent && isComplete && "bg-green-500 text-white",
                      !isCurrent && !isComplete && "bg-muted-foreground/20 text-muted-foreground"
                    )}>
                      {isComplete && index !== 0 && index !== steps.length - 1 ?
                      <Check className="w-3.5 h-3.5" /> :

                      index + 1
                      }
                    </div>
                    <span className="truncate">
                      {step.title[language as 'en' | 'ro'] || step.title.en}
                    </span>
                  </button>);

              })}
            </nav>

            {/* Progress */}
            <div className="mt-auto pt-6">
              <div className="flex items-center justify-between text-xs mb-2">
                <span className="text-muted-foreground">
                  {language === 'en' ? 'Progress' : 'Progres'}
                </span>
                <span className="font-medium">{progressPercentage}%</span>
              </div>
              <Progress value={progressPercentage} className="h-2" />
            </div>
          </div>

          {/* Main Content */}
          <div className="flex-1 flex flex-col">
            {/* Close button */}
            <div className="absolute top-4 right-4">
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                onClick={onClose}>

                
              </Button>
            </div>

            {/* Step Content */}
            <div className="flex-1 flex flex-col items-center justify-center p-12 text-center">
              <div className={cn(
                "w-20 h-20 rounded-2xl flex items-center justify-center mb-6",
                currentStep === 0 && "bg-gradient-to-br from-purple-500 to-blue-600 text-white",
                currentStep === steps.length - 1 && "bg-gradient-to-br from-amber-500 to-orange-600 text-white",
                currentStep > 0 && currentStep < steps.length - 1 && (
                currentStepData.checkComplete() ?
                "bg-green-500/20 text-green-500" :
                "bg-primary/10 text-primary")

              )}>
                {currentStepData.icon}
              </div>
              
              <h2 className="text-2xl font-bold mb-4">
                {currentStepData.title[language as 'en' | 'ro'] || currentStepData.title.en}
              </h2>
              
              <p className="text-muted-foreground max-w-md mb-8">
                {currentStepData.description[language as 'en' | 'ro'] || currentStepData.description.en}
              </p>

              {/* Action button for middle steps */}
              {currentStep > 0 && currentStep < steps.length - 1 &&
              <div className="space-y-3">
                  {currentStepData.checkComplete() ?
                <div className="flex items-center gap-2 text-green-500 mb-4">
                      <Check className="w-5 h-5" />
                      <span className="font-medium">
                        {language === 'en' ? 'Completed!' : 'Completat!'}
                      </span>
                    </div> :

                <Button
                  size="lg"
                  className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
                  onClick={() => handleGoToStep(currentStepData.route)}>

                      {currentStepData.id === 'vision' ?
                  language === 'en' ? 'Generate Vision Board' : 'Generează Vision Board' :
                  currentStepData.id === 'routine' ?
                  language === 'en' ? 'Start Routine' : 'Începe Rutina' :
                  language === 'en' ? 'Set Up Now' : 'Configurează Acum'
                  }
                    </Button>
                }
                </div>
              }
            </div>

            {/* Footer */}
            <div className="border-t border-border p-4 flex items-center justify-between">
              <Button
                variant="ghost"
                onClick={handleSkip}
                className="text-muted-foreground">

                {language === 'en' ? 'Skip for now' : 'Sari pentru moment'}
              </Button>

              <div className="flex items-center gap-2">
                {currentStep > 0 &&
                <Button
                  variant="outline"
                  onClick={handleBack}>

                    <ChevronLeft className="w-4 h-4 mr-1" />
                    {language === 'en' ? 'Back' : 'Înapoi'}
                  </Button>
                }
                
                <Button onClick={handleNext}>
                  {currentStep === steps.length - 1 ?
                  language === 'en' ? 'Finish' : 'Finalizează' :
                  language === 'en' ? 'Continue' : 'Continuă'
                  }
                  {currentStep < steps.length - 1 && <ChevronRight className="w-4 h-4 ml-1" />}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>);

};