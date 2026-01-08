import { useState, useCallback, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useLanguage } from '@/context/LanguageContext';
import { useAccountabilityContext } from '@/hooks/useAccountabilityContext';
import { useToast } from '@/hooks/use-toast';

export interface CoachMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

interface UseAccountabilityCoachOptions {
  currentPage?: string;
  onAIResponse?: (response: string) => void;
}

const generateCoachSystemPrompt = (
  language: 'en' | 'ro',
  currentPage?: string,
  contextSummary?: string
): string => {
  const isRomanian = language === 'ro';
  
  const basePrompt = isRomanian ? `
Tu ești Accountability Coach-ul personal al utilizatorului în platforma LifeOS.

CONTEXTUL UTILIZATORULUI:
${contextSummary || 'Nu am încă informații despre utilizator.'}

PAGINA CURENTĂ: ${currentPage || 'Dashboard'}

ROLUL TĂU:
1. Reamintești ce are de făcut - obiective, task-uri, rutina
2. Celebrezi victoriile - task-uri completate, streak-uri, progres
3. Ghidezi spre următorul pas concret
4. Detectezi când are nevoie de suport sau motivație
5. Previi burnout-ul prin observarea pattern-urilor

STILUL TĂU:
- Direct și practic - nu te pierde în detalii
- Empatic dar responsabil - înțelegi, dar împingi înainte
- Orientat spre acțiune - fiecare răspuns să aibă un next step clar
- Celebrezi progresul mic - fiecare pas contează
- Vorbești la persoana a doua singular (tu)

REGULI:
- Răspunsuri scurte și la obiect (max 3-4 propoziții)
- Folosește emoji-uri moderat pentru a face conversația prietenoasă
- Când nu știi ceva, întreabă
- Nu repeta ce știi deja despre utilizator în fiecare mesaj
` : `
You are the user's personal Accountability Coach in the LifeOS platform.

USER CONTEXT:
${contextSummary || 'I don\'t have information about the user yet.'}

CURRENT PAGE: ${currentPage || 'Dashboard'}

YOUR ROLE:
1. Remind what needs to be done - objectives, tasks, routine
2. Celebrate wins - completed tasks, streaks, progress
3. Guide toward the next concrete step
4. Detect when they need support or motivation
5. Prevent burnout by observing patterns

YOUR STYLE:
- Direct and practical - don't get lost in details
- Empathetic but accountable - understand, but push forward
- Action-oriented - every response should have a clear next step
- Celebrate small progress - every step counts
- Speak in second person singular (you)

RULES:
- Short and to-the-point responses (max 3-4 sentences)
- Use emojis moderately to make conversation friendly
- When you don't know something, ask
- Don't repeat what you know about the user in every message
`;

  return basePrompt;
};

export const useAccountabilityCoach = (options: UseAccountabilityCoachOptions = {}) => {
  const { currentPage, onAIResponse } = options;
  const { language } = useLanguage();
  const { toast } = useToast();
  const { contextSummary } = useAccountabilityContext();
  
  const [messages, setMessages] = useState<CoachMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const abortControllerRef = useRef<AbortController | null>(null);

  const sendMessage = useCallback(async (content: string) => {
    if (!content.trim()) return;
    
    setError(null);
    
    const userMessage: CoachMessage = {
      id: crypto.randomUUID(),
      role: 'user',
      content: content.trim(),
      timestamp: new Date(),
    };
    
    setMessages(prev => [...prev, userMessage]);
    setIsLoading(true);
    
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    abortControllerRef.current = new AbortController();
    
    try {
      const systemPrompt = generateCoachSystemPrompt(
        language as 'en' | 'ro',
        currentPage,
        contextSummary
      );
      
      const allMessages = [...messages, userMessage].map(m => ({
        role: m.role,
        content: m.content,
      }));
      
      const { data, error: fnError } = await supabase.functions.invoke('accountability-coach', {
        body: {
          messages: allMessages,
          systemPrompt,
          language,
          userContext: contextSummary,
        },
      });
      
      if (fnError) throw fnError;
      
      if (data?.error) {
        throw new Error(data.error);
      }
      
      const aiResponse = data?.response || (language === 'ro' 
        ? 'Nu am putut genera un răspuns.' 
        : 'I could not generate a response.');
      
      const assistantMessage: CoachMessage = {
        id: crypto.randomUUID(),
        role: 'assistant',
        content: aiResponse,
        timestamp: new Date(),
      };
      
      setMessages(prev => [...prev, assistantMessage]);
      onAIResponse?.(aiResponse);
      
    } catch (err: unknown) {
      console.error('Accountability Coach error:', err);
      
      const errorMessage = err instanceof Error ? err.message : 'An error occurred';
      setError(errorMessage);
      
      toast({
        title: language === 'ro' ? 'Eroare' : 'Error',
        description: errorMessage,
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
      abortControllerRef.current = null;
    }
  }, [messages, language, currentPage, contextSummary, onAIResponse, toast]);

  const clearMessages = useCallback(() => {
    setMessages([]);
    setError(null);
  }, []);

  const cancelRequest = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
      setIsLoading(false);
    }
  }, []);

  return {
    messages,
    isLoading,
    error,
    sendMessage,
    clearMessages,
    cancelRequest,
  };
};
