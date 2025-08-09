
import { useState, useEffect } from 'react';
import { usePersistentSessionId } from '@/hooks/usePersistentSessionId';
import { useToast } from "@/hooks/use-toast";
import { useLanguage } from '@/context/LanguageContext';
import { useAuth } from '@/context/AuthContext';
import { supabase } from "@/integrations/supabase/client";
import { AngerStackProps, AngerStackState, UseAngerStackReturn, AngerStackAnswer } from './types';
import { getQuestions } from './questions';
import { Json } from '@/integrations/supabase/types';
import { updateDailyProgress, saveToStackLibrary } from '@/utils/stackProgress';
import { useStackSession } from '@/hooks/useStackSession';

export const useAngerStack = ({ onAddToHitList }: AngerStackProps): UseAngerStackReturn => {
  const { toast } = useToast();
  const { language } = useLanguage();
  const { user } = useAuth();
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<AngerStackAnswer>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [committedAction, setCommittedAction] = useState("");
  const { sessionId, resetSessionId } = usePersistentSessionId('anger-stack');
  const [domain, setDomain] = useState<string>("");
  const [targetName, setTargetName] = useState<string>("");
  const [story, setStory] = useState<string>("");
  const [isYesNoQuestion, setIsYesNoQuestion] = useState(false);
  const [currentAnswer, setCurrentAnswer] = useState<string>("");
  const [returnToQuestion, setReturnToQuestion] = useState<number | null>(null);
  const [stackCompleted, setStackCompleted] = useState(false);
  const [actionAddedToHotList, setActionAddedToHotList] = useState(false);
  
// sessionId is now persistent via usePersistentSessionId

  // Enhanced session management
  const {
    saveSession,
    loadSession,
    clearSession,
    createBackup,
    lastSaveTime,
    unsavedChanges
  } = useStackSession({
    stackType: 'anger-stack',
    sessionId,
    onSessionRestore: (sessionData) => {
      setStep(sessionData.step);
      setAnswers(sessionData.answers);
      if (sessionData.draftAnswer) {
        setCurrentAnswer(sessionData.draftAnswer);
      }
      toast({
        title: "Sesiune restaurată",
        description: "Progresul tău a fost restaurat automat.",
      });
    }
  });

  const rawQuestions = getQuestions(language);
  
  useEffect(() => {
    // Important: Define which questions use yes/no buttons
    const yesNoQuestionIndexes = [13, 14, 19, 20, 23, 26, 29, 30, 39, 40, 31];
    setIsYesNoQuestion(yesNoQuestionIndexes.includes(step));
    
    if (step === 2 && answers[2]) {
      setTargetName(answers[2]);
    }
    
    if (step === 9 && answers[9]) {
      setStory(answers[9]);
    }

    if (returnToQuestion !== null) {
      setStep(returnToQuestion);
      setReturnToQuestion(null);
    }
  }, [step, answers, returnToQuestion]);

  const replacePlaceholders = (question: string) => {
    if (!question) return "";
    
    let processedQuestion = question;
    
    const target = answers[2] || targetName || '';
    if (target) {
      processedQuestion = processedQuestion.replace(/\{peCinece\}/g, target);
    }
    
    if (story || answers[9]) {
      const storyText = story || answers[9] || '';
      processedQuestion = processedQuestion.replace(/\{careEste\}/g, storyText);
    }
    
    return processedQuestion;
  };

  const saveToSupabase = async (questionIndex: number, answer: string) => {
    try {
      // Convert answers to a format that matches the Json type
      const answersJson = JSON.parse(JSON.stringify(answers)) as Json;
      
      const { error } = await supabase.from('anger_stack_sessions').upsert({
        session_id: sessionId,
        user_id: user?.id,
        answers: answersJson,
        completed: false
      });

      if (error) {
        console.error("Error saving to Supabase:", error);
        saveToLocalStorage(questionIndex, answer);
      }
    } catch (error) {
      console.error("Exception saving to Supabase:", error);
      saveToLocalStorage(questionIndex, answer);
    }
  };

  const saveToLocalStorage = (questionIndex: number, answer: string) => {
    try {
      const storageKey = `anger-stack-${sessionId}`;
      const existingData = localStorage.getItem(storageKey);
      const data = existingData ? JSON.parse(existingData) : {};
      
      data[questionIndex] = {
        question: rawQuestions[questionIndex],
        answer: answer,
        timestamp: new Date().toISOString()
      };
      
      localStorage.setItem(storageKey, JSON.stringify(data));
    } catch (error) {
      console.error("Error saving to localStorage:", error);
    }
  };

  const handleAnswer = (value: string) => {
    const newAnswers = { ...answers, [step]: value };
    setAnswers(newAnswers);
    saveToSupabase(step, value);
    setCurrentAnswer("");
    
    if (step === 2) {
      setTargetName(value);
    }
    
    if (step === 9) {
      setStory(value);
    }

    // Auto-save session
    saveSession({
      step,
      answers: newAnswers,
      draftAnswer: value
    });
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setCurrentAnswer(e.target.value);
  };

  const handleNext = () => {
    // Normal flow for questions
    if (isYesNoQuestion) {
      if (!answers[step] && currentAnswer === "") {
        toast({
          title: language === 'en' ? "Response required" : "Răspuns necesar",
          description: language === 'en' 
            ? "Please select Yes or No to continue." 
            : "Te rugăm să selectezi Da sau Nu pentru a continua.",
          variant: "destructive",
        });
        return;
      }
    } else if (step === 1 && !domain) {
      toast({
        title: language === 'en' ? "Domain selection required" : "Selectarea domeniului este obligatorie",
        description: language === 'en' 
          ? "Please select a CORE 4 domain to continue." 
          : "Te rugăm să selectezi un domeniu CORE 4 pentru a continua.",
        variant: "destructive",
      });
      return;
    } else if (!answers[step] && currentAnswer === "") {
      toast({
        title: language === 'en' ? "Response required" : "Răspuns necesar",
        description: language === 'en' 
          ? "Please provide a response before continuing." 
          : "Te rugăm să completezi un răspuns înainte de a continua.",
        variant: "destructive",
      });
      return;
    }
    
    // Make sure we save the text input for all questions that need it
    if (currentAnswer && !isYesNoQuestion) {
      handleAnswer(currentAnswer);
    }
    
    if (step < rawQuestions.length - 1) {
      setStep(step + 1);
    } else {
      completeStack();
    }
  };

  const handleBack = () => {
    if (step > 0) {
      setStep(step - 1);
    }
  };

  const completeStack = () => {
    setIsSubmitting(true);
    
    try {
      // Convert answers to a format that matches the Json type
      const answersJson = JSON.parse(JSON.stringify(answers)) as Json;
      
      supabase.from('anger_stack_sessions').upsert({
        session_id: sessionId,
        user_id: user?.id,
        answers: answersJson,
        completed: true
      }).then(({ error }) => {
        if (error) {
          console.error("Error saving complete session to Supabase:", error);
        }
        
        setIsSubmitting(false);
        setStackCompleted(true);
        
        // Save to Stack Library
        saveToStackLibrary('anger', sessionId, answers, rawQuestions);
        
        // Update daily progress
        updateDailyProgress('stack');
        
        toast({
          title: language === 'en' ? "Stack completed" : "Stack finalizat",
          description: language === 'en' 
            ? "Your anger stack has been completed successfully." 
            : "Stack-ul de furie a fost finalizat cu succes.",
        });
        
        if (answers[38]) {
          setCommittedAction(answers[38]);
          // Auto-add to Hot List if there is a committed action
          if (answers[38] && answers[38].trim() !== '') {
            addToHotList();
          }
        }
      });
    } catch (error) {
      console.error("Exception saving complete session:", error);
      setIsSubmitting(false);
      setStackCompleted(true);
      
      // Save to Stack Library even on error
      saveToStackLibrary('anger', sessionId, answers, rawQuestions);
      
      // Update daily progress
      updateDailyProgress('stack');
      
      toast({
        title: language === 'en' ? "Stack completed" : "Stack finalizat",
        description: language === 'en' 
          ? "Your anger stack has been completed successfully (saved locally)." 
          : "Stack-ul de furie a fost finalizat cu succes (salvat local).",
      });
      
      if (answers[38]) {
        setCommittedAction(answers[38]);
        // Auto-add to Hot List if there is a committed action
        if (answers[38] && answers[38].trim() !== '') {
          addToHotList();
        }
      }
    }
  };

  const addToHotList = () => {
    if (committedAction && !actionAddedToHotList) {
      try {
        // Get current hot list
        const savedHotList = localStorage.getItem('door-hot-list') || "[]";
        const hotList = JSON.parse(savedHotList);
        
        // Add the new item to hot list
        const newItem = {
          id: `stack-${Date.now()}`,
          text: committedAction,
          selected: false,
          priority: 'none'
        };
        
        hotList.push(newItem);
        
        // Save back to localStorage
        localStorage.setItem('door-hot-list', JSON.stringify(hotList));
        
        setActionAddedToHotList(true);
        
        toast({
          title: language === 'en' ? "Added to Hot List" : "Adăugat la lista fierbinte",
          description: language === 'en' 
            ? "Your action has been added to the Hot List successfully." 
            : "Acțiunea ta a fost adăugată cu succes la lista fierbinte.",
        });
        
        // We also call the original onAddToHitList function to maintain compatibility
        if (onAddToHitList) {
          onAddToHitList(committedAction);
        }
      } catch (error) {
        console.error("Error adding to Hot List:", error);
        
        // Fallback to original behavior
        if (onAddToHitList) {
          onAddToHitList(committedAction);
        }
      }
    }
  };

  const resetStack = () => {
    clearSession();
    setStep(0);
    setAnswers({});
    setCommittedAction("");
    setDomain("");
    setTargetName("");
    setStory("");
    resetSessionId();
    setStackCompleted(false);
    setActionAddedToHotList(false);
  };

  const getCurrentQuestion = () => {
    if (step < rawQuestions.length) {
      return replacePlaceholders(rawQuestions[step]);
    }
    return '';
  };

  const state: AngerStackState = {
    step, 
    answers, 
    isSubmitting, 
    committedAction, 
    sessionId, 
    domain, 
    targetName, 
    story, 
    isYesNoQuestion, 
    currentAnswer, 
    returnToQuestion, 
    stackCompleted,
    actionAddedToHotList,
    lastSaveTime,
    unsavedChanges
  };

  const setState = {
    setStep,
    setAnswers,
    setIsSubmitting,
    setCommittedAction,
    setDomain,
    setTargetName,
    setStory,
    setIsYesNoQuestion,
    setCurrentAnswer,
    setReturnToQuestion,
    setStackCompleted,
    setActionAddedToHotList
  };

  const handlers = {
    handleAnswer,
    handleInputChange,
    handleNext,
    handleBack,
    completeStack,
    addToHotList,
    resetStack,
    createBackup
  };

  const utils = {
    getCurrentQuestion,
    replacePlaceholders,
  };

  return { state, setState, handlers, utils };
};
