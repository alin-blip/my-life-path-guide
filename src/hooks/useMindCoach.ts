import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { MindCoachEmotion, getEmotionInfo } from '@/components/mind-coach/ExtendedEmotionPicker';
import { TransformationPhase, getPhaseFromMessageCount } from '@/components/mind-coach/PhaseIndicator';
import { toast } from 'sonner';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

interface BreakthroughData {
  emotionBefore: string;
  intensityBefore: number;
  emotionAfter: string;
  intensityAfter?: number;
  storyIdentified?: string;
  insight: string;
  actionCommitted: string;
}

interface ToolCall {
  name: string;
  arguments: Record<string, any>;
}

interface UseMindCoachOptions {
  onAddToHitList?: (task: string, priority?: string) => void;
  onAddHabit?: (name: string, category: string) => void;
  onComplete?: (breakthrough: BreakthroughData) => void;
}

export function useMindCoach(options: UseMindCoachOptions = {}) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [currentPhase, setCurrentPhase] = useState<TransformationPhase>(1);
  const [emotion, setEmotion] = useState<MindCoachEmotion | null>(null);
  const [intensity, setIntensity] = useState(5);
  const [isComplete, setIsComplete] = useState(false);
  const [breakthroughData, setBreakthroughData] = useState<BreakthroughData | null>(null);
  const [sessionId, setSessionId] = useState<string | null>(null);

  const CHAT_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/mind-coach`;

  // Process tool calls from AI response
  const processToolCalls = useCallback(async (toolCalls: ToolCall[]) => {
    for (const tool of toolCalls) {
      switch (tool.name) {
        case 'add_to_hit_list':
          if (options.onAddToHitList) {
            options.onAddToHitList(tool.arguments.task, tool.arguments.priority);
            toast.success('Acțiune adăugată în HIT List! 🎯');
          }
          break;
          
        case 'add_habit':
          if (options.onAddHabit) {
            options.onAddHabit(tool.arguments.name, tool.arguments.category);
            toast.success('Obicei nou adăugat! 💪');
          }
          break;
          
        case 'complete_transformation':
          const emotionInfo = emotion ? getEmotionInfo(emotion) : null;
          const breakthrough: BreakthroughData = {
            emotionBefore: emotionInfo?.labelRo || tool.arguments.emotion_before,
            intensityBefore: intensity,
            emotionAfter: tool.arguments.emotion_after || 'Putere',
            insight: tool.arguments.breakthrough_insight || '',
            actionCommitted: tool.arguments.action_committed || '',
          };
          
          setBreakthroughData(breakthrough);
          setIsComplete(true);
          
          // Save to database
          await saveBreakthrough(breakthrough);
          
          if (options.onComplete) {
            options.onComplete(breakthrough);
          }
          break;
      }
    }
  }, [emotion, intensity, options]);

  // Save breakthrough to database
  const saveBreakthrough = async (breakthrough: BreakthroughData) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      await supabase.from('breakthrough_logs').insert({
        user_id: user.id,
        emotion_before: breakthrough.emotionBefore,
        intensity_before: breakthrough.intensityBefore,
        emotion_after: breakthrough.emotionAfter,
        intensity_after: breakthrough.intensityAfter,
        story_identified: breakthrough.storyIdentified,
        transformation_insight: breakthrough.insight,
        action_committed: breakthrough.actionCommitted,
        session_id: sessionId,
      });
    } catch (error) {
      console.error('Error saving breakthrough:', error);
    }
  };

  // Start a new session
  const startSession = useCallback((selectedEmotion: MindCoachEmotion, selectedIntensity: number) => {
    setEmotion(selectedEmotion);
    setIntensity(selectedIntensity);
    setSessionId(crypto.randomUUID());
    setMessages([]);
    setCurrentPhase(1);
    setIsComplete(false);
    setBreakthroughData(null);
  }, []);

  // Send message to Mind Coach
  const sendMessage = useCallback(async (userMessage: string) => {
    if (!emotion) return;

    const userMsg: Message = { role: 'user', content: userMessage };
    setMessages(prev => [...prev, userMsg]);
    setIsLoading(true);

    let assistantContent = '';
    const pendingToolCalls: ToolCall[] = [];

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.access_token) {
        throw new Error('Not authenticated');
      }

      const emotionInfo = getEmotionInfo(emotion);
      const allMessages = [...messages, userMsg];
      
      // Calculate phase based on message count
      const newPhase = getPhaseFromMessageCount(allMessages.length);
      setCurrentPhase(newPhase);

      const resp = await fetch(CHAT_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({
          messages: allMessages,
          emotion: emotionInfo?.labelRo || emotion,
          intensity,
          phase: newPhase,
        }),
      });

      if (resp.status === 429) {
        toast.error('Prea multe cereri. Așteaptă câteva secunde...');
        setIsLoading(false);
        return;
      }

      if (resp.status === 402) {
        toast.error('Credite epuizate. Contactează suportul.');
        setIsLoading(false);
        return;
      }

      if (!resp.ok || !resp.body) {
        throw new Error('Failed to start stream');
      }

      const reader = resp.body.getReader();
      const decoder = new TextDecoder();
      let textBuffer = '';

      const updateAssistant = (content: string) => {
        assistantContent = content;
        setMessages(prev => {
          const last = prev[prev.length - 1];
          if (last?.role === 'assistant') {
            return prev.map((m, i) => (i === prev.length - 1 ? { ...m, content } : m));
          }
          return [...prev, { role: 'assistant', content }];
        });
      };

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        
        textBuffer += decoder.decode(value, { stream: true });
        
        let newlineIndex: number;
        while ((newlineIndex = textBuffer.indexOf('\n')) !== -1) {
          let line = textBuffer.slice(0, newlineIndex);
          textBuffer = textBuffer.slice(newlineIndex + 1);

          if (line.endsWith('\r')) line = line.slice(0, -1);
          if (line.startsWith(':') || line.trim() === '') continue;
          if (!line.startsWith('data: ')) continue;

          const jsonStr = line.slice(6).trim();
          if (jsonStr === '[DONE]') break;

          try {
            const parsed = JSON.parse(jsonStr);
            
            // Handle regular content
            const content = parsed.choices?.[0]?.delta?.content;
            if (content) {
              assistantContent += content;
              updateAssistant(assistantContent);
            }
            
            // Handle tool calls
            const toolCalls = parsed.choices?.[0]?.delta?.tool_calls;
            if (toolCalls) {
              for (const tc of toolCalls) {
                if (tc.function?.name) {
                  pendingToolCalls.push({
                    name: tc.function.name,
                    arguments: tc.function.arguments ? JSON.parse(tc.function.arguments) : {},
                  });
                }
              }
            }

            // Check for finish reason with tool calls
            const finishReason = parsed.choices?.[0]?.finish_reason;
            if (finishReason === 'tool_calls' && pendingToolCalls.length > 0) {
              await processToolCalls(pendingToolCalls);
            }
          } catch {
            // Partial JSON, wait for more data
            textBuffer = line + '\n' + textBuffer;
            break;
          }
        }
      }

      // Process any remaining tool calls
      if (pendingToolCalls.length > 0) {
        await processToolCalls(pendingToolCalls);
      }

    } catch (error) {
      console.error('Mind Coach error:', error);
      toast.error('Eroare la comunicarea cu Mind Coach');
    } finally {
      setIsLoading(false);
    }
  }, [emotion, intensity, messages, processToolCalls, CHAT_URL]);

  // Reset session
  const resetSession = useCallback(() => {
    setMessages([]);
    setEmotion(null);
    setIntensity(5);
    setCurrentPhase(1);
    setIsComplete(false);
    setBreakthroughData(null);
    setSessionId(null);
  }, []);

  return {
    messages,
    isLoading,
    currentPhase,
    emotion,
    intensity,
    isComplete,
    breakthroughData,
    startSession,
    sendMessage,
    resetSession,
    setIntensity,
  };
}
