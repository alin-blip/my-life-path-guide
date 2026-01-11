import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { useLanguage } from '@/context/LanguageContext';
import { Flame, ArrowRight, Sparkles, Quote } from 'lucide-react';

interface Day1WhyQuestionsProps {
  responses: {
    question_1?: string;
    question_2?: string;
    question_3?: string;
    question_4?: string;
    question_5?: string;
  };
  onResponsesChange: (responses: {
    question_1?: string;
    question_2?: string;
    question_3?: string;
    question_4?: string;
    question_5?: string;
  }) => void;
  onComplete: () => void;
}

const QUESTIONS = [
  {
    key: 'question_1',
    questionRo: 'De ce vrei să ai TOTUL în viață?',
    questionEn: 'Why do you want to HAVE IT ALL in life?',
    hintRo: 'Ce te motivează să fii mai bun în toate ariile: Corp, Spirit, Relații, Business?',
    hintEn: 'What motivates you to be better in all areas: Body, Spirit, Relationships, Business?'
  },
  {
    key: 'question_2',
    questionRo: 'Ce te-a adus aici, în acest moment?',
    questionEn: 'What brought you here, to this moment?',
    hintRo: 'Ce situație sau realizare te-a făcut să cauți o schimbare profundă?',
    hintEn: 'What situation or realization made you seek a profound change?'
  },
  {
    key: 'question_3',
    questionRo: 'Cum arată viața ta IDEALĂ peste 1 an?',
    questionEn: 'What does your IDEAL life look like in 1 year?',
    hintRo: 'Descrie o zi perfectă din viața ta viitoare - dimineața până seara.',
    hintEn: 'Describe a perfect day in your future life - from morning to evening.'
  },
  {
    key: 'question_4',
    questionRo: 'Ce sacrificii ești dispus să faci pentru a ajunge acolo?',
    questionEn: 'What sacrifices are you willing to make to get there?',
    hintRo: 'Timp, energie, confort, obiceiuri vechi - ce vei investi și la ce vei renunța?',
    hintEn: 'Time, energy, comfort, old habits - what will you invest and give up?'
  },
  {
    key: 'question_5',
    questionRo: 'Ce te-ar putea opri și cum vei depăși acele obstacole?',
    questionEn: 'What could stop you and how will you overcome those obstacles?',
    hintRo: 'Anticipează blocajele interne și externe, și pregătește-te mental pentru ele.',
    hintEn: 'Anticipate internal and external blocks, and mentally prepare for them.'
  }
];

const NAPOLEON_HILL_QUOTE = {
  en: "\"Whatever the mind can conceive and believe, it can achieve.\"",
  ro: "\"Orice poate concepe și crede mintea, poate fi realizat.\""
};

export const Day1WhyQuestions: React.FC<Day1WhyQuestionsProps> = ({
  responses,
  onResponsesChange,
  onComplete
}) => {
  const { language } = useLanguage();
  const [currentQuestion, setCurrentQuestion] = useState(0);
  
  const isRo = language === 'ro';
  
  const handleResponseChange = (key: string, value: string) => {
    onResponsesChange({ ...responses, [key]: value });
  };
  
  const currentQ = QUESTIONS[currentQuestion];
  const currentValue = responses[currentQ.key as keyof typeof responses] || '';
  const allAnswered = QUESTIONS.every(q => (responses[q.key as keyof typeof responses] || '').trim().length >= 10);
  
  const handleNext = () => {
    if (currentQuestion < QUESTIONS.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    }
  };
  
  const handlePrev = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1);
    }
  };
  
  return (
    <Card className="p-6 bg-card border-primary/20">
      {/* Header */}
      <div className="text-center mb-6">
        <div className="flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-amber-500 to-orange-500 mx-auto mb-4">
          <Flame className="h-8 w-8 text-white" />
        </div>
        <h2 className="text-2xl font-bold text-foreground mb-2">
          {isRo ? 'PASUL 1: MARELE DE CE' : 'STEP 1: THE BIG WHY'}
        </h2>
        <p className="text-muted-foreground">
          {isRo 
            ? 'Răspunde la aceste 5 întrebări pentru a-ți descoperi motivația profundă' 
            : 'Answer these 5 questions to discover your deep motivation'}
        </p>
      </div>
      
      {/* Napoleon Hill Quote */}
      <div className="bg-gradient-to-r from-amber-500/10 to-orange-500/10 p-4 rounded-lg mb-6 border border-amber-500/20">
        <div className="flex items-start gap-3">
          <Quote className="h-5 w-5 text-amber-500 flex-shrink-0 mt-1" />
          <div>
            <p className="text-foreground italic font-medium">
              {isRo ? NAPOLEON_HILL_QUOTE.ro : NAPOLEON_HILL_QUOTE.en}
            </p>
            <p className="text-sm text-muted-foreground mt-1">— Napoleon Hill</p>
          </div>
        </div>
      </div>
      
      {/* Progress */}
      <div className="flex items-center gap-2 mb-6">
        {QUESTIONS.map((_, idx) => (
          <div
            key={idx}
            className={`h-2 flex-1 rounded-full transition-colors ${
              idx < currentQuestion
                ? 'bg-green-500'
                : idx === currentQuestion
                  ? 'bg-amber-500'
                  : 'bg-muted'
            }`}
          />
        ))}
      </div>
      
      {/* Current Question */}
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-3">
          <span className="flex items-center justify-center w-8 h-8 rounded-full bg-amber-500 text-white text-sm font-bold">
            {currentQuestion + 1}
          </span>
          <Label className="text-lg font-semibold text-foreground">
            {isRo ? currentQ.questionRo : currentQ.questionEn}
          </Label>
        </div>
        <p className="text-sm text-muted-foreground mb-4 ml-10">
          {isRo ? currentQ.hintRo : currentQ.hintEn}
        </p>
        <Textarea
          value={currentValue}
          onChange={(e) => handleResponseChange(currentQ.key, e.target.value)}
          placeholder={isRo ? 'Scrie răspunsul tău aici...' : 'Write your answer here...'}
          className="min-h-[120px] resize-none"
        />
        <p className="text-xs text-muted-foreground mt-1">
          {currentValue.length} {isRo ? 'caractere' : 'characters'} 
          {currentValue.trim().length < 10 && (
            <span className="text-amber-500"> ({isRo ? 'minim 10' : 'min 10'})</span>
          )}
        </p>
      </div>
      
      {/* Navigation */}
      <div className="flex items-center justify-between gap-3">
        <Button
          variant="outline"
          onClick={handlePrev}
          disabled={currentQuestion === 0}
        >
          {isRo ? '← Înapoi' : '← Back'}
        </Button>
        
        <div className="text-sm text-muted-foreground">
          {currentQuestion + 1} / {QUESTIONS.length}
        </div>
        
        {currentQuestion < QUESTIONS.length - 1 ? (
          <Button
            onClick={handleNext}
            disabled={currentValue.trim().length < 10}
            className="bg-gradient-to-r from-amber-500 to-orange-500"
          >
            {isRo ? 'Următoarea →' : 'Next →'}
          </Button>
        ) : (
          <Button
            onClick={onComplete}
            disabled={!allAnswered}
            className="bg-gradient-to-r from-green-500 to-emerald-500"
          >
            <Sparkles className="h-4 w-4 mr-2" />
            {isRo ? 'Continuă' : 'Continue'}
          </Button>
        )}
      </div>
    </Card>
  );
};
