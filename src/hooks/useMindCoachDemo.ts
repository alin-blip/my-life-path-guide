import { useState, useCallback } from 'react';
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
  insight: string;
  actionCommitted: string;
}

interface ToolCall {
  name: string;
  arguments: Record<string, any>;
}

interface UseMindCoachDemoOptions {
  onComplete?: (breakthrough: BreakthroughData) => void;
  onAIResponse?: (text: string) => void;
}

// Map lead magnet problems to labels
const problemLabels: Record<string, string> = {
  frustration: 'Frustrare',
  anxiety: 'Anxietate',
  procrastination: 'Amânare',
  fear: 'Frică',
};

export function useMindCoachDemo(options: UseMindCoachDemoOptions = {}) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [currentPhase, setCurrentPhase] = useState<TransformationPhase>(1);
  const [problem, setProblem] = useState<string | null>(null);
  const [intensity, setIntensity] = useState(7);
  const [isComplete, setIsComplete] = useState(false);
  const [breakthroughData, setBreakthroughData] = useState<BreakthroughData | null>(null);

  const DEMO_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/mind-coach-demo`;

  // Process tool calls from AI response
  const processToolCalls = useCallback(async (toolCalls: ToolCall[]) => {
    for (const tool of toolCalls) {
      if (tool.name === 'complete_transformation') {
        const problemLabel = problem ? problemLabels[problem] || problem : tool.arguments.emotion_before;
        const breakthrough: BreakthroughData = {
          emotionBefore: problemLabel,
          intensityBefore: intensity,
          emotionAfter: tool.arguments.emotion_after || 'Claritate',
          insight: tool.arguments.breakthrough_insight || '',
          actionCommitted: tool.arguments.action_committed || '',
        };
        
        setBreakthroughData(breakthrough);
        setIsComplete(true);
        
        if (options.onComplete) {
          options.onComplete(breakthrough);
        }
      }
    }
  }, [problem, intensity, options]);

  // Start a new session
  const startSession = useCallback((selectedProblem: string, selectedIntensity: number) => {
    setProblem(selectedProblem);
    setIntensity(selectedIntensity);
    setMessages([]);
    setCurrentPhase(1);
    setIsComplete(false);
    setBreakthroughData(null);
  }, []);

  // Send message to Mind Coach Demo
  const sendMessage = useCallback(async (userMessage: string) => {
    if (!problem) return;

    const userMsg: Message = { role: 'user', content: userMessage };
    setMessages(prev => [...prev, userMsg]);
    setIsLoading(true);

    let assistantContent = '';
    const pendingToolCalls: ToolCall[] = [];

    try {
      const allMessages = [...messages, userMsg];
      
      // Calculate phase based on message count
      const newPhase = getPhaseFromMessageCount(allMessages.length);
      setCurrentPhase(newPhase);

      const resp = await fetch(DEMO_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'apikey': import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
        },
        body: JSON.stringify({
          messages: allMessages,
          emotion: problem, // Send problem type (frustration, anxiety, etc.)
          intensity,
          phase: newPhase,
        }),
      });

      if (resp.status === 429) {
        toast.error('Prea multe cereri. Încearcă din nou mai târziu sau înscrie-te pentru acces nelimitat.');
        setIsLoading(false);
        return;
      }

      if (!resp.ok || !resp.body) {
        throw new Error('Failed to start stream');
      }

      const reader = resp.body.getReader();
      const decoder = new TextDecoder();
      let textBuffer = '';
      
      const toolCallsInProgress: Map<number, { name: string; arguments: string }> = new Map();

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
            
            const content = parsed.choices?.[0]?.delta?.content;
            if (content) {
              assistantContent += content;
              updateAssistant(assistantContent);
            }
            
            const toolCalls = parsed.choices?.[0]?.delta?.tool_calls;
            if (toolCalls) {
              for (const tc of toolCalls) {
                const idx = tc.index ?? 0;
                if (tc.function?.name) {
                  toolCallsInProgress.set(idx, { 
                    name: tc.function.name, 
                    arguments: tc.function.arguments || '' 
                  });
                } else if (tc.function?.arguments) {
                  const existing = toolCallsInProgress.get(idx);
                  if (existing) {
                    existing.arguments += tc.function.arguments;
                  }
                }
              }
            }

            const finishReason = parsed.choices?.[0]?.finish_reason;
            if (finishReason === 'tool_calls') {
              for (const [, tc] of toolCallsInProgress) {
                try {
                  pendingToolCalls.push({
                    name: tc.name,
                    arguments: tc.arguments ? JSON.parse(tc.arguments) : {},
                  });
                } catch (e) {
                  console.error('Failed to parse tool call arguments:', e);
                }
              }
              await processToolCalls(pendingToolCalls);
            }
          } catch {
            // Partial SSE chunk – keep accumulating in buffer
            textBuffer = line + '\n' + textBuffer;
            break;
          }
        }
      }

      // Process any remaining tool calls
      if (toolCallsInProgress.size > 0 && pendingToolCalls.length === 0) {
        for (const [, tc] of toolCallsInProgress) {
          try {
            pendingToolCalls.push({
              name: tc.name,
              arguments: tc.arguments ? JSON.parse(tc.arguments) : {},
            });
          } catch (e) {
            console.error('Failed to parse remaining tool call:', e);
          }
        }
        if (pendingToolCalls.length > 0) {
          await processToolCalls(pendingToolCalls);
        }
      }

      if (assistantContent && options.onAIResponse) {
        options.onAIResponse(assistantContent);
      }

    } catch (error) {
      console.error('Mind Coach Demo error:', error);
      toast.error('Eroare la comunicarea cu Mind Coach');
    } finally {
      setIsLoading(false);
    }
  }, [problem, intensity, messages, processToolCalls, DEMO_URL, options]);

  // Reset session
  const resetSession = useCallback(() => {
    setMessages([]);
    setProblem(null);
    setIntensity(7);
    setCurrentPhase(1);
    setIsComplete(false);
    setBreakthroughData(null);
  }, []);

  return {
    messages,
    isLoading,
    currentPhase,
    problem,
    intensity,
    isComplete,
    breakthroughData,
    startSession,
    sendMessage,
    resetSession,
    setIntensity,
  };
}
