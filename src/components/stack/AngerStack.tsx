import React, { useState } from 'react';
import { useAngerStack } from './anger-stack/useAngerStack';
import { AngerStackQuestion } from './anger-stack/AngerStackQuestion';
import { CompletedStack } from './anger-stack/CompletedStack';
import { AngerStackExplanation } from './anger-stack/AngerStackExplanation';
import { getQuestions } from './anger-stack/questions';
import { AngerStackProps } from './anger-stack/types';
import { useStackTodoIntegration } from "@/hooks/useStackTodoIntegration";
import { StackIdeaModal } from "./StackIdeaModal";
import { AiGuidedStack } from "./AiGuidedStack";
import { Button } from "@/components/ui/button";
import { Bot, User, Lightbulb } from "lucide-react";

export const AngerStack: React.FC<AngerStackProps> = ({ onAddToHitList }) => {
  const [mode, setMode] = useState<'manual' | 'ai'>('manual');
  const { 
    state, 
    setState, 
    handlers, 
    utils 
  } = useAngerStack({ onAddToHitList });

  const {
    isIdeaModalOpen,
    openIdeaModal,
    closeIdeaModal
  } = useStackTodoIntegration({ onAddToHitList });
  
  const { 
    step, answers, isSubmitting, committedAction, domain, 
    isYesNoQuestion, currentAnswer, stackCompleted, actionAddedToHotList 
  } = state;
  
  const { setDomain } = setState;
  
  const { 
    handleAnswer, handleInputChange, handleNext, 
    handleBack, addToHotList, resetStack 
  } = handlers;
  
  const { getCurrentQuestion } = utils;
  
  
  const handleYesClick = () => {
    handleAnswer("Yes");
    
    if (step === 39) {
      if (answers[38]) {
        setState.setCommittedAction(answers[38]);
      }
      setState.setStep(step + 1);
    } else if (step === 40) {
      if (answers[38]) {
        setState.setCommittedAction(answers[38]);
      }
      setState.setStep(step + 1);
    } else if (step === 30) {
      setTimeout(() => setState.setStep(step + 1), 100);
    } else if (step === 29) {
      setTimeout(() => setState.setStep(step + 1), 100);
    } else {
      const autoAdvanceSteps = [13, 14, 19, 20, 23, 26];
      if (autoAdvanceSteps.includes(step)) {
        setTimeout(() => setState.setStep(step + 1), 100);
      }
    }
  };
  
  const handleNoClick = () => {
    handleAnswer("No");
    
    if (step === 41) {
      handlers.completeStack();
    } else if (step === 30) {
      setTimeout(() => setState.setStep(step + 1), 100);
    } else if (step === 29) {
      setState.setReturnToQuestion(20);
    } else {
      const autoAdvanceSteps = [13, 14, 19, 20, 23, 26, 39, 40];
      if (autoAdvanceSteps.includes(step)) {
        setTimeout(() => setState.setStep(step + 1), 100);
      }
    }
  };
  
  const handleDomainChange = (value: string) => {
    setDomain(value);
    handleAnswer(value);
    setTimeout(() => setState.setStep(step + 1), 100);
  };

  const handleCustomNext = () => {
    handleNext();
  };
  
  const handleCustomBack = () => {
    handleBack();
  };

  const rawQuestions = getQuestions(document.documentElement.lang === 'en' ? 'en' : 'ro');

  if (mode === 'ai') {
    return (
      <AiGuidedStack
        onAddToHitList={onAddToHitList}
        stackType="anger"
        questions={rawQuestions}
        onModeSwitch={() => setMode('manual')}
      />
    );
  }

  return (
    <div className="w-full h-full">
      {!(committedAction || stackCompleted) && (
        <div className="mb-4">
          <div className="flex gap-2 mb-4">
            <Button
              variant={mode === 'manual' ? 'default' : 'outline'}
              onClick={() => setMode('manual')}
              size="sm"
              className="text-xs sm:text-sm"
            >
              <User className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
              Manual
            </Button>
            <Button
              variant="outline"
              onClick={() => setMode('ai')}
              size="sm"
              className="text-xs sm:text-sm"
            >
              <Bot className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
              AI Ghidat
            </Button>
          </div>
          <AngerStackExplanation />
        </div>
      )}
      
      {(committedAction || stackCompleted) ? (
        <CompletedStack
          committedAction={committedAction}
          stackCompleted={stackCompleted}
          onReset={resetStack}
          onAddToHotList={!actionAddedToHotList ? addToHotList : () => {}}
          actionAddedToHotList={actionAddedToHotList}
        />
      ) : (
        <AngerStackQuestion
          step={step}
          totalSteps={rawQuestions.length}
          question={getCurrentQuestion()}
          isYesNoQuestion={isYesNoQuestion}
          domain={domain}
          currentAnswer={currentAnswer}
          isSubmitting={isSubmitting}
          onDomainChange={handleDomainChange}
          onTextChange={handleInputChange}
          onYesClick={handleYesClick}
          onNoClick={handleNoClick}
          onNext={handleCustomNext}
          onBack={handleCustomBack}
        />
      )}

      <StackIdeaModal
        isOpen={isIdeaModalOpen}
        onClose={closeIdeaModal}
        onAddToHitList={onAddToHitList}
      />
    </div>
  );
};
