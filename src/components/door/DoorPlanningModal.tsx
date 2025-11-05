import React, { useState, useEffect, useRef } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Progress } from '@/components/ui/progress';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Loader2, Send, Sparkles, SkipForward } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { PlanningResult, PreviousWeekData } from '@/types/door';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

interface DoorPlanningModalProps {
  isOpen: boolean;
  onClose: () => void;
  previousWeekData?: PreviousWeekData;
  onPlanningComplete: (data: PlanningResult) => void;
}

export const DoorPlanningModal: React.FC<DoorPlanningModalProps> = ({
  isOpen,
  onClose,
  previousWeekData,
  onPlanningComplete,
}) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSkippingReview, setIsSkippingReview] = useState(false);
  const [questionsAnswered, setQuestionsAnswered] = useState(0);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  const totalQuestions = previousWeekData ? 22 : 18; // 4 review questions + 18 new week, or just 18
  const progress = (questionsAnswered / totalQuestions) * 100;

  useEffect(() => {
    if (isOpen && messages.length === 0) {
      // Start conversation
      startConversation();
    }
  }, [isOpen]);

  useEffect(() => {
    // Auto-scroll to bottom when new messages arrive
    if (scrollAreaRef.current) {
      const scrollElement = scrollAreaRef.current.querySelector('[data-radix-scroll-area-viewport]');
      if (scrollElement) {
        scrollElement.scrollTop = scrollElement.scrollHeight;
      }
    }
  }, [messages]);

  const startConversation = async () => {
    setIsLoading(true);
    
    try {
      const mode = previousWeekData && !isSkippingReview ? 'review' : 'new';
      
      await streamChat({
        mode,
        previousWeekData: mode === 'review' ? previousWeekData : undefined,
        messages: [],
      });
    } catch (error) {
      console.error('Error starting conversation:', error);
      toast({
        title: 'Eroare',
        description: 'Nu s-a putut porni conversația cu AI-ul',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSkipReview = () => {
    setIsSkippingReview(true);
    setMessages([]);
    setQuestionsAnswered(0);
    startConversation();
  };

  const handleSendMessage = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: Message = { role: 'user', content: input.trim() };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);
    setQuestionsAnswered(prev => prev + 1);

    try {
      const mode = previousWeekData && !isSkippingReview && questionsAnswered < 4 ? 'review' : 'new';
      
      await streamChat({
        mode,
        previousWeekData: mode === 'review' ? previousWeekData : undefined,
        messages: [...messages, userMessage],
      });
    } catch (error) {
      console.error('Error sending message:', error);
      toast({
        title: 'Eroare',
        description: 'Nu s-a putut trimite mesajul',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const streamChat = async ({ mode, previousWeekData, messages: chatMessages }: {
    mode: 'review' | 'new';
    previousWeekData?: PreviousWeekData;
    messages: Message[];
  }) => {
    const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/door-ai-planning`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
      },
      body: JSON.stringify({ mode, previousWeekData, messages: chatMessages }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const reader = response.body?.getReader();
    if (!reader) throw new Error('No reader available');

    const decoder = new TextDecoder();
    let buffer = '';
    let currentAssistantMessage = '';
    let hasStartedAssistantMessage = false;

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split('\n');
      buffer = lines.pop() || '';

      for (let line of lines) {
        line = line.trim();
        if (!line || line.startsWith(':')) continue;
        if (!line.startsWith('data: ')) continue;

        const data = line.slice(6).trim();
        if (data === '[DONE]') continue;

        try {
          const parsed = JSON.parse(data);
          
          // Check for tool calls (structured output)
          if (parsed.choices?.[0]?.delta?.tool_calls) {
            const toolCall = parsed.choices[0].delta.tool_calls[0];
            if (toolCall?.function?.name === 'save_planning' && toolCall?.function?.arguments) {
              try {
                const planningData = JSON.parse(toolCall.function.arguments);
                onPlanningComplete(planningData);
                onClose();
                return;
              } catch (e) {
                console.error('Error parsing planning data:', e);
              }
            }
          }

          // Regular content streaming
          const content = parsed.choices?.[0]?.delta?.content;
          if (content) {
            currentAssistantMessage += content;
            
            if (!hasStartedAssistantMessage) {
              hasStartedAssistantMessage = true;
              setMessages(prev => [...prev, { role: 'assistant', content: currentAssistantMessage }]);
            } else {
              setMessages(prev => {
                const newMessages = [...prev];
                if (newMessages[newMessages.length - 1]?.role === 'assistant') {
                  newMessages[newMessages.length - 1] = {
                    role: 'assistant',
                    content: currentAssistantMessage
                  };
                }
                return newMessages;
              });
            }
          }
        } catch (e) {
          // Ignore parse errors for incomplete JSON
        }
      }
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[80vh] flex flex-col p-0">
        <DialogHeader className="px-6 pt-6 pb-4 border-b">
          <DialogTitle className="flex items-center gap-2 text-xl">
            <Sparkles className="w-5 h-5 text-purple-500" />
            AI Weekly Planning Assistant
          </DialogTitle>
        </DialogHeader>

        <ScrollArea className="flex-1 px-6 py-4" ref={scrollAreaRef}>
          <div className="space-y-4">
            {messages.map((msg, idx) => (
              <div
                key={idx}
                className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[80%] rounded-lg px-4 py-2 ${
                    msg.role === 'user'
                      ? 'bg-blue-500 text-white'
                      : 'bg-muted text-foreground'
                  }`}
                >
                  <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-muted rounded-lg px-4 py-2 flex items-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span className="text-sm text-muted-foreground">AI gândește...</span>
                </div>
              </div>
            )}
          </div>
        </ScrollArea>

        <div className="px-6 pb-6 border-t pt-4 space-y-3">
          <div className="space-y-2">
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>Progres: {questionsAnswered}/{totalQuestions} întrebări</span>
              <span>{Math.round(progress)}%</span>
            </div>
            <Progress value={progress} className="h-2" />
          </div>

          {previousWeekData && !isSkippingReview && questionsAnswered === 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleSkipReview}
              className="w-full"
            >
              <SkipForward className="w-4 h-4 mr-2" />
              Sari peste review, planifică direct săptămâna nouă
            </Button>
          )}

          <div className="flex gap-2">
            <Textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Scrie răspunsul tău... (Enter = trimite, Shift+Enter = rând nou)"
              className="resize-none"
              rows={2}
              disabled={isLoading}
            />
            <Button
              onClick={handleSendMessage}
              disabled={isLoading || !input.trim()}
              size="icon"
              className="h-auto"
            >
              <Send className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
