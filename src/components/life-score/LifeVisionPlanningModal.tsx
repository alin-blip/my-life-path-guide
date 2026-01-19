import React, { useState, useEffect, useRef } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Loader2, Send, Sparkles, Mic } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { GoalCategory } from '@/types/goalWizard';
import { motion, AnimatePresence } from 'framer-motion';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

interface WeeklyKey {
  id: number;
  title: string;
  objective: string;
  steps: Array<{
    text: string;
    day: string;
    listType: 'hit' | 'do';
  }>;
  deadline?: string;
}

export interface VisionPlanData {
  category: GoalCategory;
  categoryLabel: string;
  annualVision: string;
  quarterlyMilestone: string;
  monthlyFocus: string;
  weeklyKeys: WeeklyKey[];
}

interface LifeVisionPlanningModalProps {
  isOpen: boolean;
  onClose: () => void;
  category: GoalCategory;
  categoryLabel: string;
  onPlanComplete: (planData: VisionPlanData) => void;
  language: 'en' | 'ro';
}

const CATEGORY_LABELS: Record<GoalCategory, { en: string; ro: string }> = {
  business: { en: 'Business', ro: 'Business' },
  body: { en: 'Body & Health', ro: 'Corp & Sănătate' },
  being: { en: 'Spirit & Mindset', ro: 'Spirit & Mindset' },
  balance: { en: 'Relationships', ro: 'Relații' },
};

export const LifeVisionPlanningModal: React.FC<LifeVisionPlanningModalProps> = ({
  isOpen,
  onClose,
  category,
  categoryLabel,
  onPlanComplete,
  language,
}) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  const MAX_MESSAGES_TO_SEND = 40;

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Initial greeting when modal opens
  useEffect(() => {
    if (isOpen && messages.length === 0) {
      const greeting = language === 'ro'
        ? `Bună! 🎯 Hai să creăm strategia ta pentru ${categoryLabel}. Care este obiectivul tău mare pentru acest an? Ce vrei să realizezi în ${categoryLabel}?`
        : `Hello! 🎯 Let's create your ${categoryLabel} strategy. What's your big goal for this year? What do you want to achieve in ${categoryLabel}?`;
      
      setMessages([{ role: 'assistant', content: greeting }]);
    }
  }, [isOpen, categoryLabel, language]);

  // Reset when closing
  useEffect(() => {
    if (!isOpen) {
      setMessages([]);
      setInput('');
    }
  }, [isOpen]);

  const streamChat = async (messagesToSend: Message[]) => {
    try {
      const { data: sessionData } = await supabase.auth.getSession();
      const accessToken = sessionData.session?.access_token;
      
      if (!accessToken) {
        throw new Error('Not authenticated');
      }

      const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/life-vision-ai`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'apikey': `${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
          'Authorization': `Bearer ${accessToken}`,
        },
        body: JSON.stringify({
          messages: messagesToSend,
          category,
          categoryLabel,
        }),
      });

      if (!response.ok) {
        const errorText = await response.text().catch(() => '');
        throw new Error(`HTTP ${response.status}: ${errorText || 'Request failed'}`);
      }

      const reader = response.body?.getReader();
      if (!reader) throw new Error('No reader available');

      const decoder = new TextDecoder();
      let buffer = '';
      let currentAssistantMessage = '';
      let hasStartedAssistantMessage = false;
      let toolCallArguments = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\\n');
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
              
              if (toolCall?.function?.arguments) {
                toolCallArguments += toolCall.function.arguments;
              }
              
              // Check if this is the final chunk with complete arguments
              if (toolCall?.function?.name === 'save_vision_plan' || toolCallArguments.includes('\\\"weeklyKeys\\\"')) {
                try {
                  // Try to parse when we have enough data
                  if (toolCallArguments.endsWith('}')) {
                    const planningData = JSON.parse(toolCallArguments);
                    console.log('📝 Vision plan received from AI:', planningData);
                    
                    // Create complete plan data
                    const completePlan: VisionPlanData = {
                      category,
                      categoryLabel,
                      annualVision: planningData.annualVision,
                      quarterlyMilestone: planningData.quarterlyMilestone,
                      monthlyFocus: planningData.monthlyFocus,
                      weeklyKeys: planningData.weeklyKeys,
                    };
                    
                    onPlanComplete(completePlan);
                    return;
                  }
                } catch {
                  // Not complete yet, keep accumulating
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
            // Ignore parsing errors for incomplete chunks
          }
        }
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleSendMessage = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: Message = { role: 'user', content: input.trim() };
    const newMessages = [...messages, userMessage];
    const messagesToSend = newMessages.slice(-MAX_MESSAGES_TO_SEND);

    setMessages(newMessages);
    setInput('');
    setIsLoading(true);

    try {
      await streamChat(messagesToSend);
    } catch (error) {
      console.error('Error sending message:', error);
      toast({
        title: language === 'ro' ? 'Eroare' : 'Error',
        description: language === 'ro' ? 'Nu s-a putut trimite mesajul' : 'Could not send message',
        variant: 'destructive',
      });
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-2xl h-[80vh] flex flex-col p-0 gap-0">
        <DialogHeader className="px-6 py-4 border-b bg-gradient-to-r from-primary/10 to-secondary/10">
          <DialogTitle className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-primary" />
            {language === 'ro' ? `Planificare ${categoryLabel}` : `${categoryLabel} Planning`}
          </DialogTitle>
        </DialogHeader>

        <ScrollArea className="flex-1 p-4" ref={scrollAreaRef}>
          <div className="space-y-4 pb-4">
            <AnimatePresence initial={false}>
              {messages.map((msg, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.2 }}
                  className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[85%] rounded-2xl px-4 py-3 ${
                      msg.role === 'user'
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-muted'
                    }`}
                  >
                    <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>

            {isLoading && messages[messages.length - 1]?.role === 'user' && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex justify-start"
              >
                <div className="bg-muted rounded-2xl px-4 py-3">
                  <div className="flex items-center gap-2">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span className="text-sm text-muted-foreground">
                      {language === 'ro' ? 'Se gândește...' : 'Thinking...'}
                    </span>
                  </div>
                </div>
              </motion.div>
            )}
            <div ref={messagesEndRef} />
          </div>
        </ScrollArea>

        <div className="p-4 border-t bg-background">
          <div className="flex gap-2">
            <Textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyPress}
              placeholder={language === 'ro' ? 'Scrie răspunsul tău...' : 'Type your response...'}
              className="min-h-[60px] max-h-[120px] resize-none"
              disabled={isLoading}
            />
            <Button
              onClick={handleSendMessage}
              disabled={!input.trim() || isLoading}
              size="icon"
              className="h-[60px] w-[60px]"
            >
              {isLoading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <Send className="w-5 h-5" />
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
