import { useState, useCallback, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useLanguage } from '@/context/LanguageContext';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

interface UseChallengeCoachOptions {
  currentDay?: number;
}

export const useChallengeCoach = (options: UseChallengeCoachOptions = {}) => {
  const { currentDay = 1 } = options;
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const { language } = useLanguage();
  const abortControllerRef = useRef<AbortController | null>(null);

  const getWelcomeMessage = useCallback(() => {
    if (language === 'ro') {
      return `Salut! 👋 Sunt Challenge Coach-ul tău pentru provocarea "Have It All Lifestyle" de 7 zile.

Ești în **Ziua ${currentDay}**. Sunt aici să te ghidez prin exerciții, să răspund la întrebări și să te țin motivat!

Ce pot face pentru tine azi?`;
    }
    return `Hi! 👋 I'm your Challenge Coach for the 7-day "Have It All Lifestyle" challenge.

You're on **Day ${currentDay}**. I'm here to guide you through exercises, answer questions, and keep you motivated!

What can I do for you today?`;
  }, [currentDay, language]);

  // Generate or retrieve session ID for grouping conversations
  const getSessionId = useCallback(() => {
    const key = `challenge_coach_session_${currentDay}`;
    let sessionId = sessionStorage.getItem(key);
    if (!sessionId) {
      sessionId = `${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
      sessionStorage.setItem(key, sessionId);
    }
    return sessionId;
  }, [currentDay]);

  const sendMessage = useCallback(async (content: string) => {
    if (!content.trim()) return;

    const userMessage: Message = { role: 'user', content };
    setMessages(prev => [...prev, userMessage]);
    setIsLoading(true);

    // Cancel any previous request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    abortControllerRef.current = new AbortController();

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        toast({
          title: language === 'ro' ? 'Autentificare necesară' : 'Authentication required',
          description: language === 'ro' ? 'Te rugăm să te autentifici' : 'Please log in',
          variant: 'destructive',
        });
        setIsLoading(false);
        return;
      }

      const allMessages = [...messages, userMessage].map(m => ({
        role: m.role,
        content: m.content,
      }));

      const sessionId = getSessionId();

      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/challenge-coach`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${session.access_token}`,
          },
          body: JSON.stringify({
            messages: allMessages,
            language,
            currentDay,
            sessionId,
          }),
          signal: abortControllerRef.current.signal,
        }
      );

      if (!response.ok) {
        if (response.status === 429) {
          throw new Error(language === 'ro' ? 'Prea multe cereri. Așteaptă puțin.' : 'Too many requests. Please wait.');
        }
        if (response.status === 402) {
          throw new Error(language === 'ro' ? 'Credite insuficiente.' : 'Insufficient credits.');
        }
        throw new Error(`Error: ${response.status}`);
      }

      // Handle streaming response
      const reader = response.body?.getReader();
      if (!reader) throw new Error('No reader available');

      const decoder = new TextDecoder();
      let assistantContent = '';

      // Add empty assistant message that we'll update
      setMessages(prev => [...prev, { role: 'assistant', content: '' }]);

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        const lines = chunk.split('\n');

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const jsonStr = line.slice(6).trim();
            if (jsonStr === '[DONE]') continue;

            try {
              const parsed = JSON.parse(jsonStr);
              const delta = parsed.choices?.[0]?.delta?.content;
              if (delta) {
                assistantContent += delta;
                setMessages(prev => {
                  const newMessages = [...prev];
                  if (newMessages.length > 0 && newMessages[newMessages.length - 1].role === 'assistant') {
                    newMessages[newMessages.length - 1] = {
                      role: 'assistant',
                      content: assistantContent,
                    };
                  }
                  return newMessages;
                });
              }
            } catch {
              // Ignore parse errors for partial chunks
            }
          }
        }
      }
    } catch (error) {
      if ((error as Error).name === 'AbortError') {
        console.log('Request aborted');
        return;
      }
      console.error('Challenge Coach error:', error);
      toast({
        title: language === 'ro' ? 'Eroare' : 'Error',
        description: (error as Error).message,
        variant: 'destructive',
      });
      // Remove the user message if error
      setMessages(prev => prev.slice(0, -1));
    } finally {
      setIsLoading(false);
    }
  }, [messages, language, currentDay, toast]);

  const clearMessages = useCallback(() => {
    setMessages([]);
  }, []);

  const initializeChat = useCallback(() => {
    if (messages.length === 0) {
      setMessages([{ role: 'assistant', content: getWelcomeMessage() }]);
    }
  }, [messages.length, getWelcomeMessage]);

  return {
    messages,
    isLoading,
    sendMessage,
    clearMessages,
    initializeChat,
    getWelcomeMessage,
  };
};
