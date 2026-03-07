import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { getHeroJourneyQuestions, HeroJourneyQuestion } from './heroJourneyQuestions';

export type ContentType = 'reel' | 'video' | 'post';

interface UseHeroJourneyStackOptions {
  language?: 'en' | 'ro';
  onScriptGenerated?: (script: string) => void;
}

export function useHeroJourneyStack(options: UseHeroJourneyStackOptions = {}) {
  const { language = 'ro', onScriptGenerated } = options;
  
  const questions = getHeroJourneyQuestions(language);
  const [currentStep, setCurrentStep] = useState(1);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [contentType, setContentType] = useState<ContentType>('reel');
  const [generatedScript, setGeneratedScript] = useState<string>('');
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

  const generateScript = useCallback(async () => {
    if (!allAnswered) {
      toast.error(language === 'en' 
        ? 'Please answer all questions first' 
        : 'Te rog completează toate întrebările întâi'
      );
      return null;
    }

    setIsGenerating(true);
    try {
      const { data, error } = await supabase.functions.invoke('generate-hero-journey-script', {
        body: {
          answers,
          contentType,
          language
        }
      });

      if (error) throw error;

      if (data?.script) {
        setGeneratedScript(data.script);
        onScriptGenerated?.(data.script);
        toast.success(language === 'en' ? 'Script generated!' : 'Script generat cu succes!');
        return data.script;
      }
    } catch (error: unknown) {
      console.error('Error generating hero journey script:', error);
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
          ? 'Could not generate script. Try again.' 
          : 'Nu am putut genera scriptul. Încearcă din nou.'
        );
      }
    } finally {
      setIsGenerating(false);
    }
    return null;
  }, [answers, contentType, language, allAnswered, onScriptGenerated]);

  const reset = useCallback(() => {
    setCurrentStep(1);
    setAnswers({});
    setGeneratedScript('');
    setShowPreviousAnswers(false);
  }, []);

  const getAnsweredQuestions = useCallback((): Array<HeroJourneyQuestion & { answer: string }> => {
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
    contentType,
    generatedScript,
    isGenerating,
    showPreviousAnswers,
    
    // Computed
    isFirstStep,
    isLastStep,
    allAnswered,
    currentAnswer: answers[currentStep] || '',
    
    // Actions
    setAnswer,
    setContentType,
    setGeneratedScript,
    setShowPreviousAnswers,
    goNext,
    goBack,
    goToStep,
    generateScript,
    reset,
    getAnsweredQuestions
  };
}
