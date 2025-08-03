
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
          className="min-h-[150px] bg-gray-800/30 border-gray-700"
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
        className="min-h-[150px] bg-gray-800/30 border-gray-700"
        value={currentAnswer}
        onChange={onTextChange}
        onEnterSubmit={onNext}
      />
    );
  };

  return (
    <Card className="border-red-500/30 bg-red-950/10">
      <CardHeader>
        <CardTitle className="text-center text-red-400">
          {language === 'en' ? 
            `Anger Stack - Step ${step + 1} of ${totalSteps}` : 
            `Stack de Furie - Pasul ${step + 1} din ${totalSteps}`}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="p-4 bg-gray-800/50 rounded-md">
          <p className="text-gray-100">{question}</p>
        </div>
        
        {handleSpecialStep()}
      </CardContent>
      <CardFooter className="flex justify-between">
        <Button 
          variant="outline" 
          onClick={onBack}
          disabled={step === 0}
          className="hover:bg-red-800 border-red-500/30"
        >
          {language === 'en' ? "Back" : "Înapoi"}
        </Button>
        {/* Only show the Continue button for text inputs or special steps like 31 or 41 */}
        {(!isYesNoQuestion || step === 31 || step === 41) && (
          <Button 
            className="bg-red-600 hover:bg-red-700 text-white"
            onClick={onNext}
            disabled={isSubmitting}
          >
            {step < totalSteps - 1 ? (language === 'en' ? 'Continue' : 'Continuă') : (language === 'en' ? 'Finish' : 'Finalizează')}
            <Send className="w-4 h-4 ml-2" />
          </Button>
        )}
      </CardFooter>
    </Card>
  );
};
