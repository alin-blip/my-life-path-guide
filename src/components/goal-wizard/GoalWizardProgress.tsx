import React from 'react';
import { Check } from 'lucide-react';
import { cn } from '@/lib/utils';
import { GoalWizardStep, WIZARD_STEPS } from '@/types/goalWizard';
import { useLanguage } from '@/context/LanguageContext';

interface GoalWizardProgressProps {
  currentStep: GoalWizardStep;
  completedSteps: GoalWizardStep[];
}

export const GoalWizardProgress: React.FC<GoalWizardProgressProps> = ({
  currentStep,
  completedSteps
}) => {
  const { language } = useLanguage();
  
  const currentIndex = WIZARD_STEPS.findIndex(s => s.id === currentStep);

  return (
    <div className="w-full px-4 py-3 bg-muted/50 border-b border-border">
      <div className="flex items-center justify-between max-w-3xl mx-auto">
        {WIZARD_STEPS.map((step, index) => {
          const isCompleted = completedSteps.includes(step.id);
          const isCurrent = step.id === currentStep;
          const isPast = index < currentIndex;
          
          return (
            <React.Fragment key={step.id}>
              <div className="flex flex-col items-center">
                <div
                  className={cn(
                    "w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-all",
                    isCompleted && "bg-primary text-primary-foreground",
                    isCurrent && !isCompleted && "bg-primary/20 text-primary ring-2 ring-primary ring-offset-2 ring-offset-background",
                    !isCurrent && !isCompleted && "bg-muted text-muted-foreground"
                  )}
                >
                  {isCompleted ? (
                    <Check className="w-4 h-4" />
                  ) : (
                    index + 1
                  )}
                </div>
                <span 
                  className={cn(
                    "text-xs mt-1.5 font-medium hidden sm:block",
                    isCurrent ? "text-primary" : "text-muted-foreground"
                  )}
                >
                  {step.label[language === 'en' ? 'en' : 'ro']}
                </span>
              </div>
              
              {index < WIZARD_STEPS.length - 1 && (
                <div 
                  className={cn(
                    "flex-1 h-0.5 mx-2",
                    isPast || isCompleted ? "bg-primary" : "bg-muted"
                  )}
                />
              )}
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
};
