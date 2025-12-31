import React from 'react';
import { QuizQuestion as QuizQuestionType, QuizOption } from './quizData';
import { cn } from '@/lib/utils';

interface QuizQuestionProps {
  question: QuizQuestionType;
  selectedAnswer: number | null;
  onSelect: (points: number) => void;
  language: 'en' | 'ro';
}

export const QuizQuestion: React.FC<QuizQuestionProps> = ({
  question,
  selectedAnswer,
  onSelect,
  language,
}) => {
  const categoryColors: Record<string, { bg: string; border: string; text: string }> = {
    body: { bg: 'bg-green-500/10', border: 'border-green-500', text: 'text-green-600' },
    being: { bg: 'bg-purple-500/10', border: 'border-purple-500', text: 'text-purple-600' },
    balance: { bg: 'bg-pink-500/10', border: 'border-pink-500', text: 'text-pink-600' },
    business: { bg: 'bg-blue-500/10', border: 'border-blue-500', text: 'text-blue-600' },
  };

  const colors = categoryColors[question.category];

  return (
    <div className="space-y-6 animate-fade-in">
      <h2 className="text-xl md:text-2xl font-semibold text-foreground text-center">
        {language === 'en' ? question.question : question.questionRo}
      </h2>

      <div className="space-y-3">
        {question.options.map((option, index) => (
          <button
            key={index}
            onClick={() => onSelect(option.points)}
            className={cn(
              "w-full p-4 rounded-xl border-2 transition-all duration-200 text-left",
              "hover:scale-[1.02] hover:shadow-md",
              selectedAnswer === option.points
                ? cn(colors.bg, colors.border, "shadow-md")
                : "border-border hover:border-muted-foreground/30 bg-card"
            )}
          >
            <span className={cn(
              "font-medium",
              selectedAnswer === option.points ? colors.text : "text-foreground"
            )}>
              {language === 'en' ? option.label : option.labelRo}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
};
