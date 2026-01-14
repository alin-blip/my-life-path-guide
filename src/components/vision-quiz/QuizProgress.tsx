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

  const categoryGradients: Record<QuizCategory, string> = {
    body: 'from-green-500 to-emerald-400',
    being: 'from-purple-500 to-violet-400',
    balance: 'from-pink-500 to-rose-400',
    business: 'from-blue-500 to-cyan-400',
  };

  return (
    <div className="w-full space-y-3 animate-fade-in">
      <div className="flex justify-between items-center">
        <span className="text-white/70 font-medium text-sm">
          {language === 'en' ? 'Question' : 'Întrebarea'} {currentQuestion + 1}/{totalQuestions}
        </span>
        <span className={cn(
          "px-4 py-1.5 rounded-full text-white text-xs font-semibold bg-gradient-to-r shadow-lg",
          categoryGradients[currentCategory]
        )}>
          {language === 'en' ? categoryLabel.en : categoryLabel.ro}
        </span>
      </div>
      <div className="w-full h-3 bg-white/10 rounded-full overflow-hidden backdrop-blur-sm">
        <div
          className={cn(
            "h-full transition-all duration-700 ease-out rounded-full bg-gradient-to-r shadow-lg relative",
            categoryGradients[currentCategory]
          )}
          style={{ width: `${progress}%` }}
        >
          {/* Glow effect */}
          <div className="absolute inset-0 bg-white/30 blur-sm" />
        </div>
      </div>
    </div>
  );
};
