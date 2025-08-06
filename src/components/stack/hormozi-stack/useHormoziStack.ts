import { useState, useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';
import { useStackSession } from '@/hooks/useStackSession';
import { hormoziQuestions, getHormoziQuestionText } from './questions';
import { HormoziStackState, UseHormoziStackProps, HormoziStackData } from './types';
import { saveToStackLibrary, updateDailyProgress } from '@/utils/stackProgress';
import { v4 as uuidv4 } from 'uuid';

export function useHormoziStack({ onAddToHitList }: UseHormoziStackProps = {}) {
  const { toast } = useToast();
  const sessionId = useState(() => uuidv4())[0];
  
  const [state, setState] = useState<HormoziStackState>({
    currentStep: 1,
    answers: {},
    isComplete: false,
    isSubmitting: false,
    committedAction: '',
    actionAddedToHotList: false,
    showSummary: false,
    mode: 'structured'
  });

  const {
    saveSession,
    loadSession,
    clearSession,
    createBackup,
    isAutoSaveEnabled,
    setIsAutoSaveEnabled,
    lastSaveTime,
    unsavedChanges
  } = useStackSession({
    stackType: 'hormozi-business',
    sessionId,
    onSessionRestore: (sessionData: HormoziStackData) => {
      setState(prev => ({
        ...prev,
        currentStep: sessionData.step || 1,
        answers: sessionData.answers || {},
        isComplete: sessionData.isCompleted || false,
        committedAction: sessionData.committedAction || '',
        mode: sessionData.mode || 'structured'
      }));
    }
  });

  const handleComplete = useCallback(async () => {
    setState(prev => ({ ...prev, isSubmitting: true }));

    try {
      // Generate business action based on answers
      const actionText = generateActionPlan(state.answers);

      // Save to stack library
      const questions = hormoziQuestions.map(q => q.question);
      await saveToStackLibrary('hormozi-business', sessionId, state.answers, questions);

      // Update daily progress
      await updateDailyProgress('stack', {
        stackType: 'hormozi-business',
        questionsAnswered: Object.keys(state.answers).length,
        actionGenerated: actionText
      });

      setState(prev => ({
        ...prev,
        isSubmitting: false,
        isComplete: true,
        committedAction: actionText,
        showSummary: true
      }));

      // Clear session since it's complete
      clearSession();

      toast({
        title: "Business analysis complet",
        description: "Analiza ta business cu Alex Hormozi a fost salvată cu succes.",
      });

    } catch (error) {
      console.error('Error completing Hormozi stack:', error);
      setState(prev => ({ ...prev, isSubmitting: false }));
      toast({
        title: "Eroare",
        description: "A apărut o problemă la salvarea analizei business.",
        variant: "destructive"
      });
    }
  }, [state.answers, sessionId, clearSession, toast]);

  const handleNext = useCallback(() => {
    const currentAnswer = state.answers[state.currentStep]?.trim();
    
    if (!currentAnswer) {
      toast({
        title: "Răspuns necesar",
        description: "Te rog să răspunzi la întrebarea curentă pentru a continua.",
        variant: "destructive"
      });
      return;
    }

    if (state.currentStep >= hormoziQuestions.length) {
      handleComplete();
    } else {
      const newStep = state.currentStep + 1;
      setState(prev => ({
        ...prev,
        currentStep: newStep
      }));

      // Save progress
      saveSession({
        step: newStep,
        answers: state.answers
      });
    }
  }, [state.currentStep, state.answers, state.mode, handleComplete, saveSession, toast]);

  const handleBack = useCallback(() => {
    if (state.currentStep > 1) {
      const newStep = state.currentStep - 1;
      setState(prev => ({
        ...prev,
        currentStep: newStep
      }));

      // Save progress
      saveSession({
        step: newStep,
        answers: state.answers
      });
    }
  }, [state.currentStep, state.answers, state.mode, saveSession]);

  const handleInputChange = useCallback((value: string) => {
    const newAnswers = { ...state.answers, [state.currentStep]: value };
    setState(prev => ({
      ...prev,
      answers: newAnswers
    }));

    // Auto-save progress
    saveSession({
      step: state.currentStep,
      answers: newAnswers
    });
  }, [state.currentStep, state.answers, state.mode, saveSession]);

  const resetStack = useCallback(() => {
    setState({
      currentStep: 1,
      answers: {},
      isComplete: false,
      isSubmitting: false,
      committedAction: '',
      actionAddedToHotList: false,
      showSummary: false,
      mode: 'structured'
    });
    clearSession();
  }, [clearSession]);

  const addToHotList = useCallback(() => {
    if (state.committedAction && onAddToHitList) {
      onAddToHitList(state.committedAction);
      setState(prev => ({ ...prev, actionAddedToHotList: true }));
      
      toast({
        title: "Adăugat în Hot List",
        description: "Acțiunea ta business a fost adăugată în Hot List.",
      });
    }
  }, [state.committedAction, onAddToHitList, toast]);

  const switchMode = useCallback((mode: 'structured' | 'chat') => {
    setState(prev => ({ ...prev, mode }));
  }, []);

  const getCurrentQuestion = useCallback(() => {
    return getHormoziQuestionText(state.currentStep, state.answers);
  }, [state.currentStep, state.answers]);

  return {
    // State
    state,
    
    // Handlers
    handlers: {
      handleNext,
      handleBack,
      handleInputChange,
      resetStack,
      addToHotList,
      switchMode
    },

    // Utils
    utils: {
      getCurrentQuestion,
      totalSteps: hormoziQuestions.length
    },

    // Session management
    session: {
      isAutoSaveEnabled,
      setIsAutoSaveEnabled,
      lastSaveTime,
      unsavedChanges,
      createBackup
    }
  };
}

// Helper functions
function generateBusinessInsights(answers: Record<number, string>): string[] {
  const insights = [];
  
  if (answers[1]) insights.push('Situația actuală: ' + answers[1].substring(0, 100) + '...');
  if (answers[2]) insights.push('Obiectiv 90 zile: ' + answers[2]);
  if (answers[3]) insights.push('Bottleneck principal: ' + answers[3]);
  if (answers[5]) insights.push('Cost zilnic al problemei: ' + answers[5]);
  
  return insights;
}

function generateActionPlan(answers: Record<number, string>): string {
  const bottleneck = answers[3] || 'problema principală';
  const target = answers[2] || 'obiectivul financiar';
  const currentSituation = answers[1] || 'situația actuală';
  
  return 'Bazat pe analiza ta: ' + bottleneck + '. Pentru ' + target + ', primul pas concret este să identifici și să rezolvi această problemă în următoarele 48 de ore. Începe prin ' + (currentSituation.toLowerCase().includes('timp') ? 'automatizarea proceselor care îți consumă timpul' : 'optimizarea sistemului de lead generation') + '.';
}