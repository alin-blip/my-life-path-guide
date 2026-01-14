import React from 'react';
import { QuizQuestion as QuizQuestionType } from './quizData';
import { cn } from '@/lib/utils';
import { CheckCircle2 } from 'lucide-react';

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
  const categoryStyles: Record<string, { gradient: string; glow: string; border: string }> = {
    body: { 
      gradient: 'from-green-500 to-emerald-400', 
      glow: 'shadow-green-500/30',
      border: 'border-green-500/50'
    },
    being: { 
      gradient: 'from-purple-500 to-violet-400', 
      glow: 'shadow-purple-500/30',
      border: 'border-purple-500/50'
    },
    balance: { 
      gradient: 'from-pink-500 to-rose-400', 
      glow: 'shadow-pink-500/30',
      border: 'border-pink-500/50'
    },
    business: { 
      gradient: 'from-blue-500 to-cyan-400', 
      glow: 'shadow-blue-500/30',
      border: 'border-blue-500/50'
    },
  };

  const styles = categoryStyles[question.category];

  return (
    <div className="space-y-6" key={question.id}>
      <h2 className="text-xl md:text-2xl font-semibold text-white text-center leading-relaxed animate-fade-in" style={{ animationDelay: '0.1s' }}>
        {language === 'en' ? question.question : question.questionRo}
      </h2>

      <div className="space-y-3">
        {question.options.map((option, index) => {
          const isSelected = selectedAnswer === option.points;
          return (
            <button
              key={index}
              onClick={() => onSelect(option.points)}
              className={cn(
                "w-full p-4 rounded-xl border-2 transition-all duration-300 ease-out text-left group",
                "hover:scale-[1.02] animate-fade-in backdrop-blur-sm",
                isSelected
                  ? cn(
                      "bg-gradient-to-r border-transparent shadow-xl",
                      styles.gradient,
                      styles.glow
                    )
                  : "bg-white/5 border-white/20 hover:bg-white/10 hover:border-white/30"
              )}
              style={{ animationDelay: `${0.15 + index * 0.08}s` }}
            >
              <div className="flex items-center justify-between gap-3">
                <span className={cn(
                  "font-medium transition-colors duration-200",
                  isSelected ? "text-white" : "text-white/80 group-hover:text-white"
                )}>
                  {language === 'en' ? option.label : option.labelRo}
                </span>
                <div className={cn(
                  "w-6 h-6 rounded-full border-2 transition-all duration-300 flex items-center justify-center shrink-0",
                  isSelected 
                    ? "border-white bg-white/20" 
                    : "border-white/30 group-hover:border-white/50"
                )}>
                  {isSelected && (
                    <CheckCircle2 className="w-5 h-5 text-white animate-scale-in" />
                  )}
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};
