
import { useState, useEffect, useRef } from 'react';
import { useToast } from '@/hooks/use-toast';
import { saveToStackLibrary, updateDailyProgress } from '@/utils/stackProgress';
import { supabase } from '@/integrations/supabase/client';
import { getQuestions } from './questions';
import { useStackSession } from '@/hooks/useStackSession';
import { usePersistentSessionId } from '@/hooks/usePersistentSessionId';

interface UseDivinePrayerStackProps {
  onAddToHitList?: (action: string) => Promise<void> | void;
  existingData?: any;
  isReadOnly?: boolean;
}

export const useDivinePrayerStack = ({ 
  onAddToHitList,
  existingData,
  isReadOnly = false 
}: UseDivinePrayerStackProps) => {
  const { toast } = useToast();
  const [currentStep, setCurrentStep] = useState(0);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const [committedAction, setCommittedAction] = useState("");
  const [actionAddedToHotList, setActionAddedToHotList] = useState(false);
  const [showSummary, setShowSummary] = useState(false);
  const [saveStatus, setSaveStatus] = useState("Salvat");
  
  // Refs for emergency saves
  const emergencySaveRef = useRef<() => void>();
  const lastAnswerRef = useRef<string>("");

const questions = getQuestions();

// Persistent session id and auto-save
const { sessionId, resetSessionId } = usePersistentSessionId('divine-prayer');
const { saveSession, clearSession } = useStackSession({
  stackType: 'divine-prayer',
  sessionId,
  onSessionRestore: (data) => {
    setCurrentStep(data.step || 0);
    setAnswers(data.answers || {});
    toast({ title: 'Draft restaurat', description: 'Am restaurat progresul rugăciunii.', duration: 2500 });
  }
});

// Restore emergency save on mount (higher priority than useStackSession)
useEffect(() => {
  const restoreEmergencySave = () => {
    try {
      const emergencyKey = `emergency-divine-${sessionId}`;
      const emergencyData = localStorage.getItem(emergencyKey);
      
      if (emergencyData) {
        const parsed = JSON.parse(emergencyData);
        const currentAnswersCount = Object.keys(answers).length;
        const emergencyAnswersCount = Object.keys(parsed.answers || {}).length;
        
        // Restore if emergency save has more data
        if (emergencyAnswersCount > currentAnswersCount) {
          console.log('🚨 Restoring emergency save:', {
            emergencyAnswers: emergencyAnswersCount,
            currentAnswers: currentAnswersCount,
            step: parsed.step
          });
          
          setCurrentStep(parsed.step || 0);
          setAnswers(parsed.answers || {});
          
          toast({
            title: "Progres recuperat",
            description: `Am restaurat ${emergencyAnswersCount} răspunsuri salvate automat.`,
            duration: 3000,
          });
          
          // Clean up emergency save after successful restore
          localStorage.removeItem(emergencyKey);
        }
      }
    } catch (error) {
      console.error('Error restoring emergency save:', error);
    }
  };
  
  // Run on mount with slight delay to let useStackSession try first
  setTimeout(restoreEmergencySave, 100);
}, [sessionId]);

// Emergency save function for immediate persistence
const emergencySave = () => {
  try {
    const emergencyData = {
      step: currentStep,
      answers,
      timestamp: new Date().toISOString(),
      emergencySave: true
    };
    localStorage.setItem(`emergency-divine-${sessionId}`, JSON.stringify(emergencyData));
    console.log('🚨 Emergency save executed');
  } catch (error) {
    console.error('Emergency save failed:', error);
  }
};

emergencySaveRef.current = emergencySave;

// Save on visibility change (tab switch)
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
        localStorage.setItem(`emergency-divine-${sessionId}`, JSON.stringify(emergencyData));
      } catch (error) {
        console.error('Emergency save failed:', error);
      }
    };
  }
}, [currentStep, answers, sessionId]);
  
const committedActionStep = 16; // Pasul pentru acțiunea angajată

  const handleComplete = async () => {
    // Verificăm dacă utilizatorul a răspuns la întrebările esențiale
    const requiredSteps = [0, 1, 2, 3, 4, 16]; // Presupunem că acestea sunt pașii esențiali
    const missingRequiredAnswers = requiredSteps.filter(step => !answers[step] || answers[step].trim() === '');
    
    if (missingRequiredAnswers.length > 0) {
      toast({
        title: "Stack incomplet",
        description: "Te rugăm să răspunzi la toate întrebările esențiale înainte de a finaliza.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    
    try {
      // Verificăm dacă utilizatorul este conectat
      const { data: { session }, error: authError } = await supabase.auth.getSession();
      
      if (authError) {
        console.warn("Authentication error:", authError);
        // Continue with local storage only if auth fails
      }
      
      // folosim sessionId persistent
      
      if (session?.user) {
        console.log("Saving divine stack session to Supabase (stack_sessions)");
        const answersJson = JSON.parse(JSON.stringify(answers));
        const { error } = await supabase.from('stack_sessions').upsert({
          session_id: sessionId,
          user_id: session.user.id,
          stack_type: 'divine',
          answers: answersJson,
          completed: true
        });
        if (error) {
          console.error("Error saving to Supabase:", error);
        } else {
          console.log("Successfully saved to stack_sessions");
        }
      }
      
      // Salvăm în biblioteca de stack-uri
      await saveToStackLibrary('divine', sessionId, answers, questions);
      
      // Actualizăm progresul zilnic
      console.log("Updating daily progress for stack");
      await updateDailyProgress('stack', { 
        sessionType: 'divine',
        answers
      });
      
      // Obținem acțiunea angajată din răspunsuri
      const action = answers[committedActionStep];
      
      setIsComplete(true);
      setCommittedAction(action || '');
      setShowSummary(true);
      
      toast({
        title: "Stack finalizat",
        description: "Stack-ul de rugăciune a fost completat cu succes!",
      });
      
      // Fix: Verify that action exists and onAddToHitList function was provided before calling it
      if (action && action.trim() !== '' && onAddToHitList) {
        console.log("Adding action to hot list:", action);
        try {
          await onAddToHitList(action); // Await the async function call
          setActionAddedToHotList(true); // Mark action as added to hot list
          
          toast({
            title: "Acțiune adăugată",
            description: "Acțiunea a fost adăugată la lista fierbinte.",
          });
        } catch (error) {
          console.error("Error adding action to hot list:", error);
          toast({
            title: "Eroare la adăugarea acțiunii",
            description: "Acțiunea nu a putut fi salvată în lista fierbinte.",
            variant: "destructive",
          });
        }
      } else {
        console.warn("Could not add action to hot list. Action:", action, "onAddToHitList function:", !!onAddToHitList);
      }

      // Clear session on successful completion
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
    if (!answers[currentStep] && currentStep < 16) {
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
    
    // Immediate emergency save to localStorage
    try {
      const emergencyData = {
        step: currentStep,
        answers: newAnswers,
        timestamp: new Date().toISOString(),
        emergencySave: true
      };
      localStorage.setItem(`emergency-divine-${sessionId}`, JSON.stringify(emergencyData));
      setSaveStatus("Se salvează...");
      
      // Update status after a short delay
      setTimeout(() => setSaveStatus("Salvat"), 500);
    } catch (error) {
      console.error('Immediate save failed:', error);
      setSaveStatus("Eroare salvare");
    }
    
    // Also trigger the regular auto-save
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
    
    // Clear emergency saves
    try {
      localStorage.removeItem(`emergency-divine-${sessionId}`);
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
      console.log("Manually adding action to hot list:", committedAction);
      try {
        await onAddToHitList(committedAction);
        setActionAddedToHotList(true);
        
        toast({
          title: "Acțiune adăugată",
          description: "Acțiunea a fost adăugată la lista fierbinte.",
        });
      } catch (error) {
        console.error("Error manually adding action to hot list:", error);
        toast({
          title: "Eroare la adăugarea acțiunii",
          description: "Acțiunea nu a putut fi salvată în lista fierbinte.",
          variant: "destructive",
        });
      }
    }
  };

  const getCurrentQuestion = () => {
    const question = questions[currentStep] || "";
    if (currentStep === 2 && answers[1]) {
      // Înlocuim {peCine} din întrebarea curentă dacă este disponibil
      return question.replace('{peCine}', answers[1]);
    } else if (currentStep === 3 && answers[1]) {
      // Înlocuim {peCine} din întrebarea curentă dacă este disponibil
      return question.replace('{peCine}', answers[1]);
    }
    return question;
  };

  const getDivineSummary = () => {
    return (
      <div className="space-y-4">
        <p className="text-purple-300">
          Reflecția ta asupra rugăciunii și conversației cu Dumnezeu a fost salvată.
          Prin această conversație, ai identificat acțiuni concrete pentru alinierea ta spirituală.
        </p>
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
      getDivineSummary
    }
  };
};
