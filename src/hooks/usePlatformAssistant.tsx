import { useState, useCallback, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useLanguage } from '@/context/LanguageContext';
import { generatePlatformSystemPrompt } from '@/data/platformKnowledge';
import { useToast } from '@/hooks/use-toast';

export interface AssistantMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

interface UsePlatformAssistantOptions {
  currentPage?: string;
  onAIResponse?: (response: string) => void;
}

export const usePlatformAssistant = (options: UsePlatformAssistantOptions = {}) => {
  const { currentPage, onAIResponse } = options;
  const { language } = useLanguage();
  const { toast } = useToast();
  
  const [messages, setMessages] = useState<AssistantMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const abortControllerRef = useRef<AbortController | null>(null);

  const sendMessage = useCallback(async (content: string) => {
    if (!content.trim()) return;
    
    setError(null);
    
    // Add user message
    const userMessage: AssistantMessage = {
      id: crypto.randomUUID(),
      role: 'user',
      content: content.trim(),
      timestamp: new Date(),
    };
    
    setMessages(prev => [...prev, userMessage]);
    setIsLoading(true);
    
    // Cancel any previous request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    abortControllerRef.current = new AbortController();
    
    try {
      const systemPrompt = generatePlatformSystemPrompt(
        language as 'en' | 'ro',
        currentPage
      );
      
      const allMessages = [...messages, userMessage].map(m => ({
        role: m.role,
        content: m.content,
      }));
      
      const { data, error: fnError } = await supabase.functions.invoke('platform-assistant', {
        body: {
          messages: allMessages,
          systemPrompt,
          language,
        },
      });
      
      if (fnError) throw fnError;
      
      if (data?.error) {
        throw new Error(data.error);
      }
      
      const aiResponse = data?.response || 'Sorry, I could not generate a response.';
      
      const assistantMessage: AssistantMessage = {
        id: crypto.randomUUID(),
        role: 'assistant',
        content: aiResponse,
        timestamp: new Date(),
      };
      
      setMessages(prev => [...prev, assistantMessage]);
      onAIResponse?.(aiResponse);
      
    } catch (err: unknown) {
      console.error('Platform Assistant error:', err);
      
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
  }, [messages, language, currentPage, onAIResponse, toast]);

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
