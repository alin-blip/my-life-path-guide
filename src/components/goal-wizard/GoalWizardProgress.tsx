import React from 'react';
import { Check } from 'lucide-react';
import { cn } from '@/lib/utils';
import { GoalWizardStep, WIZARD_STEPS, GoalProject } from '@/types/goalWizard';
import { useLanguage } from '@/context/LanguageContext';

interface GoalWizardProgressProps {
  currentStep: GoalWizardStep;
  completedSteps: GoalWizardStep[];
  projects?: GoalProject[];
  currentProjectIndex?: number;
}

export const GoalWizardProgress: React.FC<GoalWizardProgressProps> = ({
  currentStep,
  completedSteps,
  projects = [],
  currentProjectIndex = 0
}) => {
  const { language } = useLanguage();
  
  const currentIndex = WIZARD_STEPS.findIndex(s => s.id === currentStep);
  const isMilestoneStep = ['milestone_3m', 'milestone_1m', 'week1_action'].includes(currentStep);
  const currentProject = projects[currentProjectIndex];
  const totalProjects = projects.length;

  return (
    <div className="w-full px-4 py-3 bg-muted/50 border-b border-border">
      {/* Project indicator for milestone steps */}
      {isMilestoneStep && totalProjects > 1 && currentProject && (
        <div className="text-center mb-2">
          <span className="text-xs font-medium px-3 py-1 rounded-full bg-primary/10 text-primary">
            {language === 'en' 
              ? `Project ${currentProjectIndex + 1}/${totalProjects}: ${currentProject.name}`
              : `Proiect ${currentProjectIndex + 1}/${totalProjects}: ${currentProject.name}`
            }
          </span>
        </div>
      )}
      
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
