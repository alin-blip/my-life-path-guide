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
    <div className="space-y-6 animate-fade-in" key={question.id}>
      <h2 className="text-xl md:text-2xl font-semibold text-foreground text-center leading-relaxed animate-fade-in" style={{ animationDelay: '0.1s' }}>
        {language === 'en' ? question.question : question.questionRo}
      </h2>

      <div className="space-y-3">
        {question.options.map((option, index) => (
          <button
            key={index}
            onClick={() => onSelect(option.points)}
            className={cn(
              "w-full p-4 rounded-xl border-2 transition-all duration-300 ease-out text-left",
              "hover:scale-[1.02] hover:shadow-lg animate-fade-in",
              selectedAnswer === option.points
                ? cn(colors.bg, colors.border, "shadow-lg scale-[1.02]")
                : "border-border hover:border-muted-foreground/30 bg-card hover:bg-muted/30"
            )}
            style={{ animationDelay: `${0.15 + index * 0.08}s` }}
          >
            <div className="flex items-center justify-between">
              <span className={cn(
                "font-medium transition-colors duration-200",
                selectedAnswer === option.points ? colors.text : "text-foreground"
              )}>
                {language === 'en' ? option.label : option.labelRo}
              </span>
              <div className={cn(
                "w-5 h-5 rounded-full border-2 transition-all duration-300 flex items-center justify-center",
                selectedAnswer === option.points 
                  ? cn(colors.border, colors.bg, "scale-110") 
                  : "border-muted-foreground/30"
              )}>
                {selectedAnswer === option.points && (
                  <div className={cn("w-2.5 h-2.5 rounded-full animate-scale-in", 
                    question.category === 'body' ? 'bg-green-500' :
                    question.category === 'being' ? 'bg-purple-500' :
                    question.category === 'balance' ? 'bg-pink-500' : 'bg-blue-500'
                  )} />
                )}
              </div>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
};
