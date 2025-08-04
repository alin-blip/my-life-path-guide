
import React from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Send } from "lucide-react";
import { useLanguage } from '@/context/LanguageContext';
import { DomainSelection } from './DomainSelection';
import { YesNoSelection } from './YesNoSelection';

interface AngerStackQuestionProps {
  step: number;
  totalSteps: number;
  question: string;
  isYesNoQuestion: boolean;
  domain: string;
  currentAnswer: string;
  isSubmitting: boolean;
  onDomainChange: (domain: string) => void;
  onTextChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  onYesClick: () => void;
  onNoClick: () => void;
  onNext: () => void;
  onBack: () => void;
}

export const AngerStackQuestion: React.FC<AngerStackQuestionProps> = ({
  step,
  totalSteps,
  question,
  isYesNoQuestion,
  domain,
  currentAnswer,
  isSubmitting,
  onDomainChange,
  onTextChange,
  onYesClick,
  onNoClick,
  onNext,
  onBack
}) => {
  const { language } = useLanguage();
  
  const handleSpecialStep = () => {
    if (step === 1) {
      return <DomainSelection domain={domain} onDomainChange={onDomainChange} />;
    }

    // Always force text input for steps 31 and 41
    if (step === 31 || step === 41) {
      return (
        <Textarea 
          placeholder={language === 'en' ? "Write your answer here..." : "Scrie răspunsul tău aici..."}
          className="min-h-[100px] sm:min-h-[120px] w-full text-sm"
          value={currentAnswer}
          onChange={onTextChange}
          onEnterSubmit={onNext}
        />
      );
    }

    if (isYesNoQuestion) {
      return (
        <YesNoSelection 
          step={step} 
          answers={{}} 
          onYesClick={onYesClick} 
          onNoClick={onNoClick} 
        />
      );
    }

    return (
      <Textarea 
        placeholder={language === 'en' ? "Write your answer here..." : "Scrie răspunsul tău aici..."}
        className="min-h-[100px] sm:min-h-[120px] w-full text-sm"
        value={currentAnswer}
        onChange={onTextChange}
        onEnterSubmit={onNext}
      />
    );
  };

  return (
    <div className="w-full p-1 sm:p-2 flex flex-col justify-end h-full">
      {/* Compact header */}
      <div className="mb-4">
        <h1 className="text-lg sm:text-xl font-semibold text-red-400 mb-1">
          {language === 'en' ? 'Stack de Furie' : 'Stack de Furie'}
        </h1>
        <p className="text-xs sm:text-sm text-muted-foreground">
          {language === 'en' ? 
            `Step ${step + 1} of ${totalSteps}` : 
            `Pasul ${step + 1} din ${totalSteps}`}
        </p>
      </div>

      {/* Direct question */}
      <div className="mb-4 p-3 bg-background/50 rounded border-l-4 border-red-500">
        <p className="text-sm sm:text-base text-foreground">{question}</p>
      </div>
      
      {/* Input area */}
      <div className="mb-4">
        {handleSpecialStep()}
      </div>

      {/* Compact navigation */}
      <div className="flex gap-2 justify-between">
        <Button 
          variant="outline" 
          onClick={onBack}
          disabled={step === 0}
          size="sm"
          className="text-xs sm:text-sm"
        >
          {language === 'en' ? "Back" : "Înapoi"}
        </Button>
        {(!isYesNoQuestion || step === 31 || step === 41) && (
          <Button 
            onClick={onNext}
            disabled={isSubmitting}
            size="sm"
            className="text-xs sm:text-sm"
          >
            {step < totalSteps - 1 ? (language === 'en' ? 'Continue' : 'Continuă') : (language === 'en' ? 'Finish' : 'Finalizează')}
          </Button>
        )}
      </div>
    </div>
  );
};
