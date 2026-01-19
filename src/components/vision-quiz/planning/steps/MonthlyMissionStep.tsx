import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Calendar, ArrowLeft, Check, Sparkles } from 'lucide-react';
import { monthlyMissionQuestions, getQuestionLabel, getQuestionPlaceholder } from '../visionPlanningQuestions';

interface MonthlyMissionStepProps {
  language: 'en' | 'ro';
  quarterlyGoal?: string;
  onComplete: (answers: Record<string, string>) => void;
  onBack: () => void;
}

export const MonthlyMissionStep: React.FC<MonthlyMissionStepProps> = ({
  language,
  quarterlyGoal,
  onComplete,
  onBack,
}) => {
  const [answers, setAnswers] = useState<Record<string, string>>({});
  
  const handleChange = (key: string, value: string) => {
    setAnswers(prev => ({ ...prev, [key]: value }));
  };
  
  const isValid = monthlyMissionQuestions.every(q => answers[q.key]?.trim().length > 5);

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="text-center space-y-3">
        <div className="inline-flex items-center gap-2 px-4 py-2 bg-green-500/20 rounded-full border border-green-500/30">
          <Calendar className="w-4 h-4 text-green-400" />
          <span className="text-green-400 text-sm font-medium uppercase tracking-wider">
            {language === 'en' ? 'Step 3 of 3' : 'Pasul 3 din 3'}
          </span>
        </div>
        
        <h2 className="text-2xl md:text-3xl font-bold text-white">
          {language === 'en' 
            ? '30-Day Action Plan' 
            : 'Planul de Acțiune pe 30 Zile'}
        </h2>
        
        <p className="text-white/60 max-w-md mx-auto">
          {language === 'en'
            ? "The first month is crucial. Let's define your immediate action steps."
            : 'Prima lună este crucială. Să definim pașii imediați de acțiune.'}
        </p>
      </div>

      {/* Quarterly Goal Reference */}
      {quarterlyGoal && (
        <div className="bg-blue-500/10 border border-blue-500/30 rounded-xl p-4">
          <p className="text-xs text-blue-400 uppercase tracking-wider mb-1">
            {language === 'en' ? 'Your 90-Day Goal' : 'Obiectivul de 90 Zile'}
          </p>
          <p className="text-white font-medium text-sm">{quarterlyGoal}</p>
        </div>
      )}

      {/* Questions */}
      <div className="space-y-5 bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6">
        {monthlyMissionQuestions.map((question, idx) => (
          <div key={question.key} className="space-y-2">
            <label className="block text-white font-medium text-sm">
              <span className="text-green-400 mr-2">{idx + 1}.</span>
              {getQuestionLabel(question, language)}
            </label>
            <Textarea
              value={answers[question.key] || ''}
              onChange={(e) => handleChange(question.key, e.target.value)}
              placeholder={getQuestionPlaceholder(question, language)}
              className="min-h-[80px] bg-white/5 border-white/20 text-white placeholder:text-white/30 focus:border-green-500/50"
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
          className="flex-[2] bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white font-bold py-6 rounded-xl gap-2 disabled:opacity-50"
        >
          <Sparkles className="w-5 h-5" />
          {language === 'en' ? 'Create My Roadmap' : 'Creează Harta Mea'}
          <Check className="w-5 h-5" />
        </Button>
      </div>
    </div>
  );
};
