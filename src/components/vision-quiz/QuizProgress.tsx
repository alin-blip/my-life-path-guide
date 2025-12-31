import React from 'react';
import { cn } from '@/lib/utils';
import { categoryLabels, QuizCategory } from './quizData';

interface QuizProgressProps {
  currentQuestion: number;
  totalQuestions: number;
  currentCategory: QuizCategory;
  language: 'en' | 'ro';
}

export const QuizProgress: React.FC<QuizProgressProps> = ({
  currentQuestion,
  totalQuestions,
  currentCategory,
  language,
}) => {
  const progress = ((currentQuestion + 1) / totalQuestions) * 100;
  const categoryLabel = categoryLabels[currentCategory];

  const categoryColors: Record<QuizCategory, string> = {
    body: 'bg-green-500',
    being: 'bg-purple-500',
    balance: 'bg-pink-500',
    business: 'bg-blue-500',
  };

  return (
    <div className="w-full space-y-3">
      <div className="flex justify-between items-center text-sm">
        <span className="text-muted-foreground">
          {language === 'en' ? 'Question' : 'Întrebarea'} {currentQuestion + 1}/{totalQuestions}
        </span>
        <span className={cn(
          "px-3 py-1 rounded-full text-white text-xs font-medium",
          categoryColors[currentCategory]
        )}>
          {language === 'en' ? categoryLabel.en : categoryLabel.ro}
        </span>
      </div>
      <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
        <div
          className={cn("h-full transition-all duration-500 ease-out", categoryColors[currentCategory])}
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  );
};
