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
    <div className="w-full space-y-3 animate-fade-in">
      <div className="flex justify-between items-center text-sm">
        <span className="text-muted-foreground font-medium transition-all duration-300">
          {language === 'en' ? 'Question' : 'Întrebarea'} {currentQuestion + 1}/{totalQuestions}
        </span>
        <span className={cn(
          "px-3 py-1 rounded-full text-white text-xs font-medium transition-all duration-500",
          categoryColors[currentCategory]
        )}>
          {language === 'en' ? categoryLabel.en : categoryLabel.ro}
        </span>
      </div>
      <div className="w-full h-2.5 bg-muted rounded-full overflow-hidden shadow-inner">
        <div
          className={cn("h-full transition-all duration-700 ease-out rounded-full", categoryColors[currentCategory])}
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  );
};
