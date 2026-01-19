import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Target, ArrowRight, Sparkles } from 'lucide-react';
import { annualVisionQuestions, getQuestionLabel, getQuestionPlaceholder } from '../visionPlanningQuestions';
import { QuizCategory, categoryLabels } from '../../quizData';

interface AnnualVisionStepProps {
  language: 'en' | 'ro';
  lowestCategory: QuizCategory;
  onComplete: (answers: Record<string, string>) => void;
}

export const AnnualVisionStep: React.FC<AnnualVisionStepProps> = ({
  language,
  lowestCategory,
  onComplete,
}) => {
  const [answers, setAnswers] = useState<Record<string, string>>({});
  
  const handleChange = (key: string, value: string) => {
    setAnswers(prev => ({ ...prev, [key]: value }));
  };
  
  const isValid = annualVisionQuestions.every(q => answers[q.key]?.trim().length > 10);
  
  const categoryLabel = language === 'en' 
    ? categoryLabels[lowestCategory].en 
    : categoryLabels[lowestCategory].ro;

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="text-center space-y-3">
        <div className="inline-flex items-center gap-2 px-4 py-2 bg-amber-500/20 rounded-full border border-amber-500/30">
          <Target className="w-4 h-4 text-amber-400" />
          <span className="text-amber-400 text-sm font-medium uppercase tracking-wider">
            {language === 'en' ? 'Step 1 of 3' : 'Pasul 1 din 3'}
          </span>
        </div>
        
        <h2 className="text-2xl md:text-3xl font-bold text-white">
          {language === 'en' 
            ? 'Define Your 2026 Vision' 
            : 'Definește Viziunea Ta pentru 2026'}
        </h2>
        
        <p className="text-white/60 max-w-md mx-auto">
          {language === 'en'
            ? `Based on your score, let's focus on improving your ${categoryLabel} this year.`
            : `Bazat pe scorul tău, să ne concentrăm pe îmbunătățirea categoriei ${categoryLabel} anul acesta.`}
        </p>
      </div>

      {/* Questions */}
      <div className="space-y-5 bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6">
        {annualVisionQuestions.map((question, idx) => (
          <div key={question.key} className="space-y-2">
            <label className="block text-white font-medium text-sm">
              <span className="text-amber-400 mr-2">{idx + 1}.</span>
              {getQuestionLabel(question, language)}
            </label>
            <Textarea
              value={answers[question.key] || ''}
              onChange={(e) => handleChange(question.key, e.target.value)}
              placeholder={getQuestionPlaceholder(question, language)}
              className="min-h-[80px] bg-white/5 border-white/20 text-white placeholder:text-white/30 focus:border-amber-500/50"
            />
          </div>
        ))}
      </div>

      {/* CTA */}
      <Button
        onClick={() => onComplete(answers)}
        disabled={!isValid}
        className="w-full bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-bold py-6 rounded-xl gap-2 disabled:opacity-50"
      >
        <Sparkles className="w-5 h-5" />
        {language === 'en' ? 'Continue to 90-Day Sprint' : 'Continuă la Sprint-ul de 90 Zile'}
        <ArrowRight className="w-5 h-5" />
      </Button>

      <p className="text-center text-white/40 text-xs">
        {language === 'en' 
          ? 'Your answers are saved automatically to your account'
          : 'Răspunsurile tale sunt salvate automat în cont'}
      </p>
    </div>
  );
};
