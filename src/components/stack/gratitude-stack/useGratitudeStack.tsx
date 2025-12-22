import { useState, useEffect, useRef } from 'react';
import { useToast } from '@/hooks/use-toast';
import { saveToStackLibrary, updateDailyProgress } from '@/utils/stackProgress';
import { supabase } from '@/integrations/supabase/client';
import { getQuestions } from './questions';
import { useStackSession } from '@/hooks/useStackSession';
import { usePersistentSessionId } from '@/hooks/usePersistentSessionId';

interface UseGratitudeStackProps {
  onAddToHitList?: (action: string) => Promise<void> | void;
  existingData?: any;
  isReadOnly?: boolean;
}

export const useGratitudeStack = ({ 
  onAddToHitList,
  existingData,
  isReadOnly = false 
}: UseGratitudeStackProps) => {
  const { toast } = useToast();
  const [currentStep, setCurrentStep] = useState(0);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const [committedAction, setCommittedAction] = useState("");
  const [actionAddedToHotList, setActionAddedToHotList] = useState(false);
  const [showSummary, setShowSummary] = useState(false);
  const [saveStatus, setSaveStatus] = useState("Salvat");
  
  const emergencySaveRef = useRef<() => void>();
  const questions = getQuestions();

  const { sessionId, resetSessionId } = usePersistentSessionId('gratitude');
  const { saveSession, clearSession } = useStackSession({
    stackType: 'gratitude',
    sessionId,
    onSessionRestore: (data) => {
      setCurrentStep(data.step || 0);
      setAnswers(data.answers || {});
      toast({ title: 'Draft restaurat', description: 'Am restaurat progresul recunoștinței.', duration: 2500 });
    }
  });

  // Restore emergency save on mount
  useEffect(() => {
    const restoreEmergencySave = () => {
      try {
        const emergencyKey = `emergency-gratitude-${sessionId}`;
        const emergencyData = localStorage.getItem(emergencyKey);
        
        if (emergencyData) {
          const parsed = JSON.parse(emergencyData);
          const currentAnswersCount = Object.keys(answers).length;
          const emergencyAnswersCount = Object.keys(parsed.answers || {}).length;
          
          if (emergencyAnswersCount > currentAnswersCount) {
            setCurrentStep(parsed.step || 0);
            setAnswers(parsed.answers || {});
            
            toast({
              title: "Progres recuperat",
              description: `Am restaurat ${emergencyAnswersCount} răspunsuri salvate automat.`,
              duration: 3000,
            });
            
            localStorage.removeItem(emergencyKey);
          }
        }
      } catch (error) {
        console.error('Error restoring emergency save:', error);
      }
    };
    
    setTimeout(restoreEmergencySave, 100);
  }, [sessionId]);

  // Emergency save function
  const emergencySave = () => {
    try {
      const emergencyData = {
        step: currentStep,
        answers,
        timestamp: new Date().toISOString(),
        emergencySave: true
      };
      localStorage.setItem(`emergency-gratitude-${sessionId}`, JSON.stringify(emergencyData));
    } catch (error) {
      console.error('Emergency save failed:', error);
    }
  };

  emergencySaveRef.current = emergencySave;

  // Save on visibility change
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'hidden' && emergencySaveRef.current) {
        emergencySaveRef.current();
        setSaveStatus("Salvat automat");
      }
    };

    const handleBeforeUnload = () => {
      if (emergencySaveRef.current) {
        emergencySaveRef.current();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, []);

  // Update emergency save when data changes
  useEffect(() => {
    if (Object.keys(answers).length > 0) {
      emergencySaveRef.current = () => {
        try {
          const emergencyData = {
            step: currentStep,
            answers,
            timestamp: new Date().toISOString(),
            emergencySave: true
          };
          localStorage.setItem(`emergency-gratitude-${sessionId}`, JSON.stringify(emergencyData));
        } catch (error) {
          console.error('Emergency save failed:', error);
        }
      };
    }
  }, [currentStep, answers, sessionId]);

  const committedActionStep = 14;

  const handleComplete = async () => {
    setIsSubmitting(true);
    
    try {
      const { data: { session }, error: authError } = await supabase.auth.getSession();
      
      if (session?.user) {
        const answersJson = JSON.parse(JSON.stringify(answers));
        const { error } = await supabase.from('stack_sessions').upsert({
          session_id: sessionId,
          user_id: session.user.id,
          stack_type: 'gratitude',
          answers: answersJson,
          completed: true
        });
        if (error) {
          console.error("Error saving to Supabase:", error);
        }
      }
      
      await saveToStackLibrary('gratitude', sessionId, answers, questions);
      await updateDailyProgress('stack', { 
        sessionType: 'gratitude',
        answers
      });
      
      const action = answers[committedActionStep];
      
      setIsComplete(true);
      setCommittedAction(action || '');
      setShowSummary(true);
      
      toast({
        title: "Stack finalizat",
        description: "Stack-ul de Recunoștință a fost completat cu succes!",
      });
      
      if (action && action.trim() !== '' && onAddToHitList) {
        try {
          await onAddToHitList(action);
          setActionAddedToHotList(true);
          
          toast({
            title: "Acțiune adăugată",
            description: "Acțiunea a fost adăugată la lista fierbinte.",
          });
        } catch (error) {
          console.error("Error adding action to hot list:", error);
        }
      }

      clearSession();
      resetSessionId();
    } catch (error) {
      console.error("Error completing stack:", error);
      toast({
        title: "Eroare",
        description: "A apărut o eroare. Stack-ul a fost salvat local.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleNext = () => {
    if (!answers[currentStep] && currentStep < questions.length - 1) {
      toast({
        title: "Răspuns necesar",
        description: "Te rugăm să completezi un răspuns înainte de a continua.",
        variant: "destructive",
      });
      return;
    }
    
    if (currentStep < questions.length - 1) {
      const next = currentStep + 1;
      setCurrentStep(next);
      saveSession({ step: next, answers });
    } else {
      handleComplete();
    }
  };
  
  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newAnswers = { ...answers, [currentStep]: e.target.value };
    setAnswers(newAnswers);
    
    try {
      const emergencyData = {
        step: currentStep,
        answers: newAnswers,
        timestamp: new Date().toISOString(),
        emergencySave: true
      };
      localStorage.setItem(`emergency-gratitude-${sessionId}`, JSON.stringify(emergencyData));
      setSaveStatus("Se salvează...");
      setTimeout(() => setSaveStatus("Salvat"), 500);
    } catch (error) {
      console.error('Immediate save failed:', error);
      setSaveStatus("Eroare salvare");
    }
    
    saveSession({ step: currentStep, answers: newAnswers, draftAnswer: e.target.value });
  };

  const resetStack = () => {
    setCurrentStep(0);
    setAnswers({});
    setIsComplete(false);
    setCommittedAction("");
    setActionAddedToHotList(false);
    setShowSummary(false);
    setSaveStatus("Salvat");
    
    try {
      localStorage.removeItem(`emergency-gratitude-${sessionId}`);
    } catch (error) {
      console.error('Error clearing emergency save:', error);
    }
  };
  
  const handleDraftRestore = (draftAnswer: string) => {
    const newAnswers = { ...answers, [currentStep]: draftAnswer };
    setAnswers(newAnswers);
  };

  const addToHotList = async () => {
    if (committedAction && !actionAddedToHotList && onAddToHitList) {
      try {
        await onAddToHitList(committedAction);
        setActionAddedToHotList(true);
        
        toast({
          title: "Acțiune adăugată",
          description: "Acțiunea a fost adăugată la lista fierbinte.",
        });
      } catch (error) {
        console.error("Error manually adding action to hot list:", error);
      }
    }
  };

  const getCurrentQuestion = () => {
    return questions[currentStep] || "";
  };

  const getGratitudeSummary = () => {
    return (
      <div className="space-y-6">
        <div className="bg-emerald-900/30 border border-emerald-700 rounded-lg p-4">
          <h3 className="text-lg font-semibold text-emerald-300 mb-3">🌍 Recunoștință pentru Lume</h3>
          <ul className="space-y-2 text-gray-300">
            {[1, 2, 3].map(i => answers[i] && (
              <li key={i} className="flex items-start gap-2">
                <span className="text-emerald-400">•</span>
                <span>{answers[i]}</span>
              </li>
            ))}
          </ul>
        </div>
        
        <div className="bg-pink-900/30 border border-pink-700 rounded-lg p-4">
          <h3 className="text-lg font-semibold text-pink-300 mb-3">💖 Viață Personală</h3>
          <ul className="space-y-2 text-gray-300">
            {[4, 5, 6].map(i => answers[i] && (
              <li key={i} className="flex items-start gap-2">
                <span className="text-pink-400">•</span>
                <span>{answers[i]}</span>
              </li>
            ))}
          </ul>
        </div>
        
        <div className="bg-blue-900/30 border border-blue-700 rounded-lg p-4">
          <h3 className="text-lg font-semibold text-blue-300 mb-3">💼 Viață Profesională</h3>
          <ul className="space-y-2 text-gray-300">
            {[7, 8, 9].map(i => answers[i] && (
              <li key={i} className="flex items-start gap-2">
                <span className="text-blue-400">•</span>
                <span>{answers[i]}</span>
              </li>
            ))}
          </ul>
        </div>
        
        <div className="bg-amber-900/30 border border-amber-700 rounded-lg p-4">
          <h3 className="text-lg font-semibold text-amber-300 mb-3">🌟 Despre Tine</h3>
          <ul className="space-y-2 text-gray-300">
            {[10, 11, 12].map(i => answers[i] && (
              <li key={i} className="flex items-start gap-2">
                <span className="text-amber-400">•</span>
                <span>{answers[i]}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    );
  };

  return {
    state: {
      step: currentStep,
      answers,
      isSubmitting,
      committedAction,
      stackCompleted: isComplete,
      actionAddedToHotList,
      showSummary,
      sessionId,
      saveStatus
    },
    handlers: {
      handleInputChange,
      handleNext,
      handleBack,
      resetStack,
      addToHotList,
      handleDraftRestore,
      handleAnswer: (step: number, answer: string) => setAnswers({ ...answers, [step]: answer })
    },
    utils: {
      getCurrentQuestion,
      getGratitudeSummary
    }
  };
};
