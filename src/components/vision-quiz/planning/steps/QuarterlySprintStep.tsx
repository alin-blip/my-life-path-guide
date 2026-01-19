import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Rocket, ArrowRight, ArrowLeft } from 'lucide-react';
import { quarterlySprintQuestions, getQuestionLabel, getQuestionPlaceholder } from '../visionPlanningQuestions';

interface QuarterlySprintStepProps {
  language: 'en' | 'ro';
  annualGoal?: string;
  onComplete: (answers: Record<string, string>) => void;
  onBack: () => void;
}

export const QuarterlySprintStep: React.FC<QuarterlySprintStepProps> = ({
  language,
  annualGoal,
  onComplete,
  onBack,
}) => {
  const [answers, setAnswers] = useState<Record<string, string>>({});
  
  const handleChange = (key: string, value: string) => {
    setAnswers(prev => ({ ...prev, [key]: value }));
  };
  
  const isValid = quarterlySprintQuestions.every(q => answers[q.key]?.trim().length > 10);

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="text-center space-y-3">
        <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-500/20 rounded-full border border-blue-500/30">
          <Rocket className="w-4 h-4 text-blue-400" />
          <span className="text-blue-400 text-sm font-medium uppercase tracking-wider">
            {language === 'en' ? 'Step 2 of 3' : 'Pasul 2 din 3'}
          </span>
        </div>
        
        <h2 className="text-2xl md:text-3xl font-bold text-white">
          {language === 'en' 
            ? '90-Day Sprint Plan' 
            : 'Planul Sprint de 90 Zile'}
        </h2>
        
        <p className="text-white/60 max-w-md mx-auto">
          {language === 'en'
            ? "Let's break down your annual goal into a focused 90-day sprint."
            : 'Să împărțim obiectivul anual într-un sprint focusat de 90 de zile.'}
        </p>
      </div>

      {/* Annual Goal Reference */}
      {annualGoal && (
        <div className="bg-amber-500/10 border border-amber-500/30 rounded-xl p-4">
          <p className="text-xs text-amber-400 uppercase tracking-wider mb-1">
            {language === 'en' ? 'Your Annual Goal' : 'Obiectivul Tău Anual'}
          </p>
          <p className="text-white font-medium text-sm">{annualGoal}</p>
        </div>
      )}

      {/* Questions */}
      <div className="space-y-5 bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6">
        {quarterlySprintQuestions.map((question, idx) => (
          <div key={question.key} className="space-y-2">
            <label className="block text-white font-medium text-sm">
              <span className="text-blue-400 mr-2">{idx + 1}.</span>
              {getQuestionLabel(question, language)}
            </label>
            <Textarea
              value={answers[question.key] || ''}
              onChange={(e) => handleChange(question.key, e.target.value)}
              placeholder={getQuestionPlaceholder(question, language)}
              className="min-h-[80px] bg-white/5 border-white/20 text-white placeholder:text-white/30 focus:border-blue-500/50"
            />
          </div>
        ))}
      </div>

      {/* Navigation */}
      <div className="flex gap-3">
        <Button
          variant="outline"
          onClick={onBack}
          className="flex-1 border-white/20 text-white hover:bg-white/10 py-6"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          {language === 'en' ? 'Back' : 'Înapoi'}
        </Button>
        
        <Button
          onClick={() => onComplete(answers)}
          disabled={!isValid}
          className="flex-[2] bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white font-bold py-6 rounded-xl gap-2 disabled:opacity-50"
        >
          {language === 'en' ? 'Continue to 30-Day Mission' : 'Continuă la Misiunea de 30 Zile'}
          <ArrowRight className="w-5 h-5" />
        </Button>
      </div>
    </div>
  );
};
