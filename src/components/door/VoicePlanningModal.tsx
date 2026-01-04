import React, { useState, useEffect, useRef } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Loader2, Sparkles } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { PlanningResult } from '@/types/door';
import { weeklyPlanningService } from '@/services/weeklyPlanningService';
import { getISOWeek, getYear } from 'date-fns';
import { useVoiceInput } from '@/hooks/useVoiceInput';
import { VoiceInputButton } from '@/components/stack/VoiceInputButton';
import { VoiceLanguageToggle } from '@/components/stack/VoiceLanguageToggle';
import { supabase } from '@/integrations/supabase/client';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

interface SelectedObjective {
  category: string;
  objectiveId: string;
  title: string;
}

interface VoicePlanningModalProps {
  isOpen: boolean;
  onClose: () => void;
  onPlanningComplete: (data?: PlanningResult) => void;
  selectedObjectives?: SelectedObjective[];
}

export const VoicePlanningModal: React.FC<VoicePlanningModalProps> = ({
  isOpen,
  onClose,
  onPlanningComplete,
}) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [conversationHistory, setConversationHistory] = useState<Message[]>([]);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  // Voice input integration - same as in Stack
  const {
    isConnected,
    isMicOn,
    isUserSpeaking,
    voiceLanguage,
    changeVoiceLanguage,
    toggleMic
  } = useVoiceInput({
    onTranscript: async (transcript) => {
      // Validare transcript
      const trimmedTranscript = transcript.trim();
      if (!trimmedTranscript) {
        console.log('⚠️ Empty transcript, skipping');
        return;
      }

      // Add user message
      const userMessage: Message = { role: 'user', content: trimmedTranscript };
      
      // Update history first, then use it in the API call
      const updatedHistory = [...conversationHistory, userMessage];
      
      // Keep only last 40 messages to stay within 100-message limit
      const truncatedHistory = updatedHistory.slice(-40);
      
      setConversationHistory(truncatedHistory);
      setMessages(prev => [...prev, userMessage]);
      
      console.log('📤 Sending to door-ai-planning:', {
        mode: 'new',
        messagesCount: truncatedHistory.length,
        lastMessage: userMessage.content.substring(0, 50)
      });
      
      // Send to AI
      setIsProcessing(true);
      try {
        const { data, error } = await supabase.functions.invoke('door-ai-planning', {
          body: {
            mode: 'new',
            messages: truncatedHistory,
          }
        });

        if (error) throw error;

        if (data?.message) {
          const aiMessage: Message = { role: 'assistant', content: data.message };
          setConversationHistory(prev => [...prev, aiMessage]);
          setMessages(prev => [...prev, aiMessage]);
        }

        if (data?.planningData) {
          const today = new Date();
          const currentWeekKey = `${getYear(today)}-W${getISOWeek(today).toString().padStart(2, '0')}`;
          
          await weeklyPlanningService.savePlan({
            weekKey: currentWeekKey,
            dominoTitle: data.planningData.dominoTitle,
            weekGoal: data.planningData.weekGoal,
            keyPoints: data.planningData.keyPoints,
          });
          
          onPlanningComplete(data.planningData);
          onClose();
        }
      } catch (error) {
        console.error('Error processing voice:', error);
        toast({
          title: 'Eroare',
          description: 'Nu s-a putut procesa mesajul',
          variant: 'destructive',
        });
      } finally {
        setIsProcessing(false);
      }
    },
    enabled: true
  });

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    if (scrollAreaRef.current) {
      const scrollElement = scrollAreaRef.current.querySelector('[data-radix-scroll-area-viewport]');
      if (scrollElement) {
        scrollElement.scrollTop = scrollElement.scrollHeight;
      }
    }
  }, [messages]);

  // Welcome message on open
  useEffect(() => {
    if (isOpen && messages.length === 0) {
      setMessages([{
        role: 'assistant',
        content: 'Bună! Sunt aici să te ajut cu planificarea săptămânii. Poți vorbi sau scrie. Ce obiectiv principal ai pentru săptămâna aceasta?'
      }]);
    }
  }, [isOpen]);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[80vh] flex flex-col p-0">
        <DialogHeader className="px-6 pt-6 pb-4 border-b">
          <DialogTitle className="flex items-center gap-2 text-xl">
            <Sparkles className="w-5 h-5 text-purple-500" />
            AI Weekly Planning
            {isProcessing && (
              <span className="ml-2 text-sm font-normal text-muted-foreground">
                <Loader2 className="inline w-3 h-3 animate-spin" /> Procesare...
              </span>
            )}
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
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-muted text-foreground'
                  }`}
                >
                  <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>

        <div className="px-6 pb-6 border-t pt-4">
          <div className="flex items-center justify-center gap-3">
            <VoiceLanguageToggle
              currentLanguage={voiceLanguage}
              onLanguageChange={changeVoiceLanguage}
              disabled={isMicOn || isProcessing}
            />
            <VoiceInputButton 
              isMicOn={isMicOn}
              isConnected={isConnected}
              isAISpeaking={false}
              isUserSpeaking={isUserSpeaking}
              audioLevel={0}
              onToggle={toggleMic}
              variant="compact"
              disabled={isProcessing}
            />
          </div>
          <p className="text-center text-sm text-muted-foreground mt-3">
            {isMicOn 
              ? 'Vorbește acum - microfonul este activ' 
              : 'Click pe microfon pentru a începe planificarea'}
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
};
