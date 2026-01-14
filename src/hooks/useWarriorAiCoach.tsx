import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

interface RelevantLesson {
  moduleId: string;
  title: string;
  section: string;
  order: number;
}

export const useWarriorAiCoach = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [relevantLessons, setRelevantLessons] = useState<RelevantLesson[]>([]);
  const [error, setError] = useState<string | null>(null);

  const askQuestion = useCallback(async (question: string): Promise<string | null> => {
    if (!question.trim()) {
      toast.error('Te rog să scrii o întrebare');
      return null;
    }

    setIsLoading(true);
    setError(null);
    
    const userMessage: Message = { role: 'user', content: question };
    setMessages(prev => [...prev, userMessage]);

    try {
      const { data, error: fnError } = await supabase.functions.invoke('warrior-ai-coach', {
        body: { 
          question,
          conversationHistory: messages.map(m => ({
            role: m.role,
            content: m.content
          }))
        }
      });

      if (fnError) {
        throw new Error(fnError.message || 'Eroare la comunicarea cu mentorul');
      }

      if (data?.error) {
        throw new Error(data.error);
      }

      const assistantMessage: Message = { 
        role: 'assistant', 
        content: data?.response || 'Nu am putut genera un răspuns.' 
      };
      
      setMessages(prev => [...prev, assistantMessage]);
      setRelevantLessons(data?.relevantLessons || []);
      
      return data?.response || null;
    } catch (err) {
      console.error('Error asking Warrior AI:', err);
      const errorMessage = err instanceof Error ? err.message : 'Eroare necunoscută';
      setError(errorMessage);
      toast.error('Eroare la comunicarea cu mentorul AI');
      
      // Remove the user message if we failed
      setMessages(prev => prev.slice(0, -1));
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [messages]);

  const resetConversation = useCallback(() => {
    setMessages([]);
    setRelevantLessons([]);
    setError(null);
  }, []);

  const removeLastMessage = useCallback(() => {
    setMessages(prev => prev.slice(0, -2)); // Remove last Q&A pair
  }, []);

  return {
    messages,
    isLoading,
    relevantLessons,
    error,
    askQuestion,
    resetConversation,
    removeLastMessage,
    hasMessages: messages.length > 0
  };
};
