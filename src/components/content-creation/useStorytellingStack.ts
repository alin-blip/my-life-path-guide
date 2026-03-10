import { useState, useCallback, useEffect, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { getStorytellingQuestions, StorytellingQuestion } from './storytellingQuestions';

export type ContentType = 'reel' | 'video' | 'post';

const DRAFT_KEY = 'storytelling-draft';

interface DraftData {
  answers: Record<number, string>;
  contentType: ContentType;
  generatedScript: string;
  currentStep: number;
  timestamp: string;
}

interface UseStorytellingStackOptions {
  language?: 'en' | 'ro';
  onScriptGenerated?: (script: string) => void;
}

export function useStorytellingStack(options: UseStorytellingStackOptions = {}) {
  const { language = 'ro', onScriptGenerated } = options;
  
  const questions = getStorytellingQuestions(language);
  const [currentStep, setCurrentStep] = useState(1);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [contentType, setContentType] = useState<ContentType>('reel');
  const [generatedScript, setGeneratedScript] = useState<string>('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [showPreviousAnswers, setShowPreviousAnswers] = useState(false);
  const initialLoadDone = useRef(false);

  // Load draft on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem(DRAFT_KEY);
      if (saved) {
        const draft: DraftData = JSON.parse(saved);
        const age = Date.now() - new Date(draft.timestamp).getTime();
        // Restore if less than 4 hours old
        if (age < 4 * 3600000) {
          if (Object.keys(draft.answers).length > 0) {
            setAnswers(draft.answers);
            setContentType(draft.contentType || 'reel');
            setCurrentStep(draft.currentStep || 1);
            if (draft.generatedScript) {
              setGeneratedScript(draft.generatedScript);
            }
            console.log('📥 Storytelling draft restored', { answersCount: Object.keys(draft.answers).length });
          }
        } else {
          localStorage.removeItem(DRAFT_KEY);
        }
      }
    } catch (e) {
      console.error('Error loading storytelling draft:', e);
    }
    initialLoadDone.current = true;
  }, []);

  // Save draft on changes
  useEffect(() => {
    if (!initialLoadDone.current) return;
    try {
      const draft: DraftData = {
        answers,
        contentType,
        generatedScript,
        currentStep,
        timestamp: new Date().toISOString(),
      };
      localStorage.setItem(DRAFT_KEY, JSON.stringify(draft));
    } catch (e) {
      console.error('Error saving storytelling draft:', e);
    }
  }, [answers, contentType, generatedScript, currentStep]);

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
      const { data, error } = await supabase.functions.invoke('generate-story-script', {
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
    } catch (error: any) {
      console.error('Error generating story script:', error);
      if (error.message?.includes('429')) {
        toast.error(language === 'en' 
          ? 'Too many requests. Try again in a few seconds.' 
          : 'Prea multe cereri. Încearcă din nou în câteva secunde.'
        );
      } else if (error.message?.includes('402')) {
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
    localStorage.removeItem(DRAFT_KEY);
  }, []);

  const clearDraft = useCallback(() => {
    localStorage.removeItem(DRAFT_KEY);
  }, []);

  const getAnsweredQuestions = useCallback((): Array<StorytellingQuestion & { answer: string }> => {
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
    clearDraft,
    getAnsweredQuestions
  };
}
