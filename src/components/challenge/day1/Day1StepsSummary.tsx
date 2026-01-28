import React from 'react';
import { Card } from '@/components/ui/card';
import { useLanguage } from '@/context/LanguageContext';
import { Flame, ScrollText, Share2, Check } from 'lucide-react';

interface Day1StepsSummaryProps {
  currentStep: number; // 0, 1, 2 or 3 (completed)
}

const STEPS = [
  {
    id: 1,
    titleRo: 'Descoperă-ți MARELE DE CE',
    titleEn: 'Discover Your BIG WHY',
    descriptionRo: 'Răspunde la 5 întrebări pentru a-ți găsi motivația profundă de transformare.',
    descriptionEn: 'Answer 5 questions to find your deep motivation for transformation.',
    icon: Flame,
    color: 'text-orange-500',
    bgColor: 'bg-orange-500/10 border-orange-500/20',
    activeGradient: 'from-orange-500 to-amber-500'
  },
  {
    id: 2,
    titleRo: 'Creează DECLARAȚIA VIZIUNII',
    titleEn: 'Create Your VISION DECLARATION',
    descriptionRo: 'În stilul Napoleon Hill, scrie viziunea ta pentru Corp, Spirit, Relații și Business.',
    descriptionEn: 'In Napoleon Hill style, write your vision for Body, Being, Relationships & Business.',
    icon: ScrollText,
    color: 'text-purple-500',
    bgColor: 'bg-purple-500/10 border-purple-500/20',
    activeGradient: 'from-purple-500 to-indigo-500'
  },
  {
    id: 3,
    titleRo: 'DISTRIBUIE și ANGAJEAZĂ-TE',
    titleEn: 'SHARE and COMMIT',
    descriptionRo: 'Postează declarația în comunitate pentru a-ți întări angajamentul și a inspira ceilalți războinici!',
    descriptionEn: 'Post your declaration to the community to strengthen your commitment and inspire fellow warriors!',
    icon: Share2,
    color: 'text-emerald-500',
    bgColor: 'bg-emerald-500/10 border-emerald-500/20',
    activeGradient: 'from-emerald-500 to-green-500'
  }
];

export const Day1StepsSummary: React.FC<Day1StepsSummaryProps> = ({ currentStep }) => {
  const { language } = useLanguage();
  const isRo = language === 'ro';

  return (
    <Card className="p-6 mb-6 bg-card border-primary/20">
      <h2 className="text-lg font-bold text-foreground mb-4 flex items-center gap-2">
        📋 {isRo ? 'PROGRAMUL ZILEI 1' : 'DAY 1 PROGRAM'}
      </h2>

      <div className="space-y-4">
        {STEPS.map((step, index) => {
          const Icon = step.icon;
          const stepNumber = index; // 0, 1, 2
          const isCompleted = currentStep > stepNumber;
          const isActive = currentStep === stepNumber;
          const isPending = currentStep < stepNumber;

          return (
            <div
              key={step.id}
              className={`flex items-start gap-4 p-4 rounded-xl border transition-all ${
                isCompleted
                  ? 'bg-green-500/10 border-green-500/30'
                  : isActive
                  ? `${step.bgColor} border-2`
                  : 'bg-muted/30 border-border opacity-60'
              }`}
            >
              {/* Step indicator */}
              <div
                className={`flex-shrink-0 flex items-center justify-center w-12 h-12 rounded-xl ${
                  isCompleted
                    ? 'bg-green-500'
                    : isActive
                    ? `bg-gradient-to-br ${step.activeGradient}`
                    : 'bg-muted'
                }`}
              >
                {isCompleted ? (
                  <Check className="h-6 w-6 text-white" />
                ) : (
                  <Icon className={`h-6 w-6 ${isActive ? 'text-white' : 'text-muted-foreground'}`} />
                )}
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className={`text-xs font-medium ${isCompleted ? 'text-green-500' : step.color}`}>
                    {isRo ? 'PASUL' : 'STEP'} {step.id}
                  </span>
                  {isCompleted && (
                    <span className="text-xs text-green-500">
                      ✓ {isRo ? 'Completat' : 'Completed'}
                    </span>
                  )}
                  {isActive && (
                    <span className="text-xs text-primary animate-pulse">
                      ● {isRo ? 'În desfășurare' : 'In Progress'}
                    </span>
                  )}
                </div>
                <h3 className={`font-semibold ${isCompleted ? 'text-green-600' : 'text-foreground'}`}>
                  {isRo ? step.titleRo : step.titleEn}
                </h3>
                <p className="text-sm text-muted-foreground mt-1">
                  {isRo ? step.descriptionRo : step.descriptionEn}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </Card>
  );
};
