import { useState, useCallback, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useLanguage } from '@/context/LanguageContext';

export interface SalesMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

interface UseSalesCoachOptions {
  onNavigate?: (path: string) => void;
}

export const useSalesCoach = (options: UseSalesCoachOptions = {}) => {
  const [messages, setMessages] = useState<SalesMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);
  const { language } = useLanguage();

  const sendMessage = useCallback(async (content: string): Promise<void> => {
    if (!content.trim()) return;

    // Cancel any pending request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    abortControllerRef.current = new AbortController();

    const userMessage: SalesMessage = {
      id: crypto.randomUUID(),
      role: 'user',
      content: content.trim(),
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setIsLoading(true);
    setError(null);

    try {
      const conversationHistory = [...messages, userMessage].map(m => ({
        role: m.role,
        content: m.content,
      }));

      const { data, error: fnError } = await supabase.functions.invoke('sales-coach', {
        body: {
          messages: conversationHistory,
          language,
        },
      });

      if (fnError) {
        throw new Error(fnError.message || 'Eroare la comunicare');
      }

      const assistantMessage: SalesMessage = {
        id: crypto.randomUUID(),
        role: 'assistant',
        content: data?.response || (language === 'ro' 
          ? 'Nu am putut genera un răspuns. Încearcă din nou!'
          : 'Could not generate a response. Try again!'),
        timestamp: new Date(),
      };

      setMessages(prev => [...prev, assistantMessage]);

    } catch (err) {
      if (err instanceof Error && err.name === 'AbortError') {
        return;
      }
      
      console.error('Sales coach error:', err);
      const errorMsg = language === 'ro' 
        ? 'Eroare la comunicare. Încearcă din nou!'
        : 'Communication error. Try again!';
      setError(errorMsg);
      toast.error(errorMsg);
      
      // Remove the user message on error
      setMessages(prev => prev.slice(0, -1));
    } finally {
      setIsLoading(false);
    }
  }, [messages, language]);

  const clearMessages = useCallback(() => {
    setMessages([]);
    setError(null);
  }, []);

  const cancelRequest = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
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
    hasMessages: messages.length > 0,
  };
};
