import { cn } from '@/lib/utils';
import { Check } from 'lucide-react';

interface SetupStep {
  id: string;
  label: string;
  icon: React.ReactNode;
  isComplete: boolean;
}

interface SetupProgressProps {
  steps: SetupStep[];
  currentStep: number;
  onStepClick: (stepIndex: number) => void;
}

export function SetupProgress({ steps, currentStep, onStepClick }: SetupProgressProps) {
  return (
    <div className="flex flex-col gap-1">
      {steps.map((step, index) => {
        const isActive = index === currentStep;
        const isComplete = step.isComplete;
        const isPast = index < currentStep;

        return (
          <button
            key={step.id}
            onClick={() => onStepClick(index)}
            className={cn(
              "flex items-center gap-3 px-3 py-2.5 rounded-lg text-left transition-all",
              "hover:bg-accent/50",
              isActive && "bg-primary/10 border border-primary/20",
              !isActive && "border border-transparent"
            )}
          >
            <div
              className={cn(
                "w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-all",
                isComplete && "bg-green-500 text-white",
                isActive && !isComplete && "bg-primary text-primary-foreground",
                !isActive && !isComplete && "bg-muted text-muted-foreground"
              )}
            >
              {isComplete ? <Check className="w-4 h-4" /> : index + 1}
            </div>
            <div className="flex-1 min-w-0">
              <p
                className={cn(
                  "text-sm font-medium truncate",
                  isActive && "text-primary",
                  !isActive && "text-muted-foreground"
                )}
              >
                {step.label}
              </p>
            </div>
            {step.icon}
          </button>
        );
      })}
    </div>
  );
}
