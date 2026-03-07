import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { getPathToSuccessQuestions, PathToSuccessQuestion } from './pathToSuccessQuestions';

interface UsePathToSuccessStackOptions {
  language?: 'en' | 'ro';
  onPlanGenerated?: (plan: string) => void;
}

export function usePathToSuccessStack(options: UsePathToSuccessStackOptions = {}) {
  const { language = 'ro', onPlanGenerated } = options;
  
  const questions = getPathToSuccessQuestions(language);
  const [currentStep, setCurrentStep] = useState(1);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [generatedPlan, setGeneratedPlan] = useState<string>('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [showPreviousAnswers, setShowPreviousAnswers] = useState(false);

  const currentQuestion = questions[currentStep - 1];
  const totalSteps = questions.length;
  const isFirstStep = currentStep === 1;
  const isLastStep = currentStep === totalSteps;
  const allAnswered = questions.every((_, idx) => answers[idx + 1]?.trim());

  const setAnswer = useCallback((step: number, value: string) => {
    setAnswers(prev => ({ ...prev, [step]: value }));
  }, []);

  const goNext = useCallback(() => {
    if (!isLastStep) {
      setCurrentStep(prev => prev + 1);
    }
  }, [isLastStep]);

  const goBack = useCallback(() => {
    if (!isFirstStep) {
      setCurrentStep(prev => prev - 1);
    }
  }, [isFirstStep]);

  const goToStep = useCallback((step: number) => {
    if (step >= 1 && step <= totalSteps) {
      setCurrentStep(step);
    }
  }, [totalSteps]);

  const generatePlan = useCallback(async () => {
    if (!allAnswered) {
      toast.error(language === 'en' 
        ? 'Please answer all questions first' 
        : 'Te rog completează toate întrebările întâi'
      );
      return null;
    }

    setIsGenerating(true);
    try {
      const { data, error } = await supabase.functions.invoke('generate-path-plan', {
        body: {
          answers,
          language
        }
      });

      if (error) throw error;

      if (data?.plan) {
        setGeneratedPlan(data.plan);
        onPlanGenerated?.(data.plan);
        toast.success(language === 'en' ? 'Transformation plan created!' : 'Plan de transformare creat cu succes!');
        return data.plan;
      }
    } catch (error: unknown) {
      console.error('Error generating path plan:', error);
      const message = error instanceof Error ? error.message : String(error);
      if (message.includes('429')) {
        toast.error(language === 'en' 
          ? 'Too many requests. Try again in a few seconds.' 
          : 'Prea multe cereri. Încearcă din nou în câteva secunde.'
        );
      } else if (message.includes('402')) {
        toast.error(language === 'en' 
          ? 'Insufficient credits. Add credits to workspace.' 
          : 'Credits insuficiente. Adaugă credite în workspace.'
        );
      } else {
        toast.error(language === 'en' 
          ? 'Could not generate plan. Try again.' 
          : 'Nu am putut genera planul. Încearcă din nou.'
        );
      }
    } finally {
      setIsGenerating(false);
    }
    return null;
  }, [answers, language, allAnswered, onPlanGenerated]);

  const reset = useCallback(() => {
    setCurrentStep(1);
    setAnswers({});
    setGeneratedPlan('');
    setShowPreviousAnswers(false);
  }, []);

  const getAnsweredQuestions = useCallback((): Array<PathToSuccessQuestion & { answer: string }> => {
    return questions
      .filter((_, idx) => answers[idx + 1]?.trim())
      .map((q, idx) => ({ ...q, answer: answers[idx + 1] }));
  }, [questions, answers]);

  return {
    // State
    currentStep,
    totalSteps,
    currentQuestion,
    questions,
    answers,
    generatedPlan,
    isGenerating,
    showPreviousAnswers,
    
    // Computed
    isFirstStep,
    isLastStep,
    allAnswered,
    currentAnswer: answers[currentStep] || '',
    
    // Actions
    setAnswer,
    setGeneratedPlan,
    setShowPreviousAnswers,
    goNext,
    goBack,
    goToStep,
    generatePlan,
    reset,
    getAnsweredQuestions
  };
}
