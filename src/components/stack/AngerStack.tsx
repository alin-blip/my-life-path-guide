import React from 'react';
import { useAngerStack } from './anger-stack/useAngerStack';
import { AngerStackQuestion } from './anger-stack/AngerStackQuestion';
import { CompletedStack } from './anger-stack/CompletedStack';
import { getQuestions } from './anger-stack/questions';
import { AngerStackProps } from './anger-stack/types';
import { useStackTodoIntegration } from "@/hooks/useStackTodoIntegration";
import { StackIdeaModal } from "./StackIdeaModal";
import { Button } from "@/components/ui/button";
import { Lightbulb } from "lucide-react";

export const AngerStack: React.FC<AngerStackProps> = ({ onAddToHitList }) => {
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
  
  const rawQuestions = getQuestions(document.documentElement.lang === 'en' ? 'en' : 'ro');
  
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

  return (
    <div className="w-full max-w-none space-y-4 sm:space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-4">
        <h2 className="text-lg sm:text-xl font-semibold text-red-400">Anger Stack</h2>
        <Button 
          onClick={openIdeaModal}
          variant="outline"
          size="sm"
          className="border-red-500/30 hover:bg-red-800 text-red-400 w-full sm:w-auto"
        >
          <Lightbulb className="w-4 h-4 mr-2" />
          Adaugă idee nouă
        </Button>
      </div>

      {(committedAction || stackCompleted) && (
        <CompletedStack
          committedAction={committedAction}
          stackCompleted={stackCompleted}
          onReset={resetStack}
          onAddToHotList={!actionAddedToHotList ? addToHotList : () => {}}
          actionAddedToHotList={actionAddedToHotList}
        />
      )}

      {!stackCompleted && (
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
