import { useState, useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';
import { useStackSession } from '@/hooks/useStackSession';
import { useStackTodoIntegration } from '@/hooks/useStackTodoIntegration';
import { GodsSchoolStackState, UseGodsSchoolStackProps, GodsSchoolStackData } from './types';
import { getGodsSchoolQuestionText, getGodsSchoolPlaceholder, godsSchoolQuestions } from './questions';
import { supabase } from '@/integrations/supabase/client';
import { usePersistentSessionId } from '@/hooks/usePersistentSessionId';
 
export const useGodsSchoolStack = ({ onAddToHitList }: UseGodsSchoolStackProps = {}) => {
  const { toast } = useToast();
  const { openIdeaModal } = useStackTodoIntegration();
  const { sessionId, resetSessionId } = usePersistentSessionId('gods-school');

  const [state, setState] = useState<GodsSchoolStackState>({
    currentStep: 1,
    answers: {},
    isComplete: false,
    isSubmitting: false,
    committedAction: '',
    actionAddedToHotList: false,
    showSummary: false,
    mode: 'structured'
  });

  // Session management with auto-save
  const sessionProps = useStackSession({
    stackType: 'gods-school',
    sessionId,
    onSessionRestore: (sessionData) => {
      setState(prevState => ({
        ...prevState,
        currentStep: sessionData.step || 1,
        answers: sessionData.answers || {},
        isComplete: sessionData.isCompleted || false,
        committedAction: sessionData.committedAction || '',
        mode: (sessionData.mode as 'structured' | 'chat') || 'structured'
      }));
    }
  });

  const saveSessionData = useCallback(() => {
    const sessionData: GodsSchoolStackData = {
      sessionId,
      stackType: 'gods-school',
      step: state.currentStep,
      answers: state.answers,
      timestamp: new Date().toISOString(),
      isCompleted: state.isComplete,
      committedAction: state.committedAction,
      mode: state.mode
    };
    sessionProps.saveSession(sessionData);
  }, [state, sessionId, sessionProps]);

  const handleComplete = useCallback(async () => {
    if (state.isSubmitting) return;

    setState(prev => ({ ...prev, isSubmitting: true }));

    try {
      // Generate action plan based on answers
      const actionPlan = generateDivineActionPlan(state.answers);
      
      // Save to Supabase using divine_coaching_sessions table as template
      const { data: userData } = await supabase.auth.getUser();
      const { error } = await supabase.from('divine_coaching_sessions').insert({
        session_id: sessionId,
        answers: JSON.stringify(state.answers),
        step_number: state.currentStep,
        question: 'completion',
        answer: 'completed',
        user_id: userData?.user?.id,
        created_at: new Date().toISOString()
      });

      if (error) {
        console.error('Error saving gods school session:', error);
      }

      // Update daily progress with notes field for tracking
      const today = new Date().toISOString().split('T')[0];
      const { data: userData2 } = await supabase.auth.getUser();
      await supabase.from('daily_progress').upsert({
        date: today,
        user_id: userData2?.user?.id,
        notes: `Gods School completed: ${actionPlan}`
      }, {
        onConflict: 'date'
      });

      setState(prev => ({
        ...prev,
        isComplete: true,
        isSubmitting: false,
        committedAction: actionPlan,
        showSummary: true
      }));

      // Clear session after completion
      sessionProps.clearSession();

      toast({
        title: "🌟 Școala Zeilor Completată",
        description: "Înțelepciunea divină a fost integrată. Ești pregătit pentru acțiune!"
      });

    } catch (error) {
      console.error('Error completing gods school stack:', error);
      setState(prev => ({ ...prev, isSubmitting: false }));
      
      toast({
        title: "Eroare",
        description: "A apărut o problemă la finalizarea stack-ului.",
        variant: "destructive"
      });
    }
  }, [state, sessionId, sessionProps, toast]);

  const generateDivineActionPlan = (answers: Record<number, string>): string => {
    const challenge = answers[1] || "provocarea ta actuală";
    const principle = answers[5] || "principiul divin";
    const action = answers[11] || "acțiunea ta";
    
    return `Pentru a depăși ${challenge}, voi aplica principiul de ${principle} prin ${action}. Aceasta este calea mea către înțelepciunea divină.`;
  };

  const handleNext = useCallback(() => {
    if (state.currentStep < godsSchoolQuestions.length) {
      setState(prev => ({
        ...prev,
        currentStep: prev.currentStep + 1
      }));
      saveSessionData();
    } else {
      handleComplete();
    }
  }, [state.currentStep, handleComplete, saveSessionData]);

  const handleBack = useCallback(() => {
    if (state.currentStep > 1) {
      setState(prev => ({
        ...prev,
        currentStep: prev.currentStep - 1
      }));
      saveSessionData();
    }
  }, [state.currentStep, saveSessionData]);

  const handleInputChange = useCallback((value: string) => {
    setState(prev => ({
      ...prev,
      answers: {
        ...prev.answers,
        [prev.currentStep]: value
      }
    }));
    
    // Auto-save with debounce
    setTimeout(() => {
      saveSessionData();
    }, 1000);
  }, [saveSessionData]);

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
    sessionProps.clearSession();
    resetSessionId();
  }, [sessionProps, resetSessionId]);

  const addToHotList = useCallback(() => {
    if (state.committedAction && onAddToHitList) {
      onAddToHitList(state.committedAction);
      setState(prev => ({ ...prev, actionAddedToHotList: true }));
      
      toast({
        title: "✨ Adăugat la Hot List",
        description: "Acțiunea divină a fost adăugată la lista ta!"
      });
    } else if (state.committedAction) {
      openIdeaModal();
    }
  }, [state.committedAction, onAddToHitList, toast, openIdeaModal]);

  const switchMode = useCallback((mode: 'structured' | 'chat') => {
    setState(prev => ({ ...prev, mode }));
    saveSessionData();
  }, [saveSessionData]);

  const getCurrentQuestion = useCallback(() => {
    return getGodsSchoolQuestionText(state.currentStep, state.answers, 'ro');
  }, [state.currentStep, state.answers]);

  return {
    state,
    handlers: {
      handleNext,
      handleBack,
      handleInputChange,
      resetStack,
      addToHotList,
      switchMode
    },
    utils: {
      getCurrentQuestion,
      getPlaceholder: () => getGodsSchoolPlaceholder('ro'),
      getTotalQuestions: () => godsSchoolQuestions.length
    },
    session: {
      ...sessionProps,
      saveSession: saveSessionData
    }
  };
};