import React, { useState, useCallback, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Mic, MicOff, Volume2, VolumeX, Loader2, Bot, User, Square } from 'lucide-react';
import { useVoiceConversation } from '@/hooks/useVoiceConversation';
import { supabase } from '@/integrations/supabase/client';
import { useLanguage } from '@/context/LanguageContext';
import { generatePlatformSystemPrompt } from '@/data/platformKnowledge';
import { cn } from '@/lib/utils';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
}

interface AssistantVoiceModeProps {
  currentPage?: string;
  quickActions: { label: string; message: string }[];
}

export const AssistantVoiceMode: React.FC<AssistantVoiceModeProps> = ({
  currentPage,
  quickActions,
}) => {
  const { language } = useLanguage();
  const [messages, setMessages] = useState<Message[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const speakAIRef = useRef<((text: string) => void) | null>(null);

  const handleUserMessage = useCallback(async (transcript: string) => {
    const userMessage: Message = {
      id: crypto.randomUUID(),
      role: 'user',
      content: transcript,
    };
    
    setMessages(prev => [...prev, userMessage]);
    setIsProcessing(true);

    try {
      const systemPrompt = generatePlatformSystemPrompt(
        language as 'en' | 'ro',
        currentPage
      );

      const allMessages = [...messages, userMessage].map(m => ({
        role: m.role,
        content: m.content,
      }));

      const { data, error } = await supabase.functions.invoke('platform-assistant', {
        body: {
          messages: allMessages,
          systemPrompt,
          language,
        },
      });

      if (error) throw error;

      const aiResponse = data?.response || 'Sorry, I could not respond.';
      
      const assistantMessage: Message = {
        id: crypto.randomUUID(),
        role: 'assistant',
        content: aiResponse,
      };
      
      setMessages(prev => [...prev, assistantMessage]);
      
      // Speak the response
      if (speakAIRef.current) {
        speakAIRef.current(aiResponse);
      }

    } catch (err) {
      console.error('Voice assistant error:', err);
    } finally {
      setIsProcessing(false);
    }
  }, [messages, language, currentPage]);

  const voiceConversation = useVoiceConversation({
    onUserMessage: handleUserMessage,
    onAIResponse: (response) => {
      // Already handled in handleUserMessage
    },
    language: language === 'ro' ? 'ro-RO' : 'en-US',
    silenceThreshold: 2000,
    playbackRate: 1.25,
  });

  // Update speakAI ref
  useEffect(() => {
    speakAIRef.current = voiceConversation.speakAI;
  }, [voiceConversation.speakAI]);

  // Auto-scroll
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleQuickAction = async (message: string) => {
    await handleUserMessage(message);
  };

  const getStatusText = () => {
    if (voiceConversation.isAISpeaking) return 'AI vorbește...';
    if (isProcessing) return 'Procesez...';
    if (voiceConversation.isListening) return 'Te ascult...';
    return 'Apasă pentru a vorbi';
  };

  return (
    <div className="flex flex-col h-full">
      {/* Messages */}
      <ScrollArea className="flex-1 px-3" ref={scrollRef}>
        <div className="space-y-3 py-3">
          {messages.length === 0 && (
            <div className="text-center py-6">
              <Mic className="w-10 h-10 mx-auto mb-3 text-primary/60" />
              <p className="text-sm text-muted-foreground mb-3">
                Apasă microfonul și vorbește
              </p>
              
              <div className="flex flex-wrap gap-2 justify-center">
                {quickActions.slice(0, 3).map((action, idx) => (
                  <Button
                    key={idx}
                    variant="outline"
                    size="sm"
                    onClick={() => handleQuickAction(action.message)}
                    disabled={voiceConversation.isActive || isProcessing}
                    className="text-xs"
                  >
                    {action.label}
                  </Button>
                ))}
              </div>
            </div>
          )}

          {messages.map((message) => (
            <div
              key={message.id}
              className={cn(
                'flex gap-2',
                message.role === 'user' ? 'justify-end' : 'justify-start'
              )}
            >
              {message.role === 'assistant' && (
                <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <Bot className="w-3 h-3 text-primary" />
                </div>
              )}
              
              <div
                className={cn(
                  'max-w-[85%] rounded-lg px-3 py-2 text-sm',
                  message.role === 'user'
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-muted'
                )}
              >
                <p className="whitespace-pre-wrap">{message.content}</p>
              </div>
              
              {message.role === 'user' && (
                <div className="w-6 h-6 rounded-full bg-secondary flex items-center justify-center flex-shrink-0">
                  <User className="w-3 h-3 text-secondary-foreground" />
                </div>
              )}
            </div>
          ))}

          {/* Live transcript */}
          {voiceConversation.currentTranscript && (
            <div className="flex gap-2 justify-end">
              <div className="max-w-[85%] rounded-lg px-3 py-2 text-sm bg-primary/20 border border-primary/30">
                <p className="text-muted-foreground italic">
                  {voiceConversation.currentTranscript}...
                </p>
              </div>
            </div>
          )}

          {isProcessing && (
            <div className="flex gap-2 justify-start">
              <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center">
                <Bot className="w-3 h-3 text-primary" />
              </div>
              <div className="bg-muted rounded-lg px-3 py-2">
                <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />
              </div>
            </div>
          )}
        </div>
      </ScrollArea>

      {/* Voice Controls */}
      <div className="p-4 border-t border-border">
        <div className="text-center mb-3">
          <p className="text-xs text-muted-foreground">{getStatusText()}</p>
        </div>
        
        <div className="flex justify-center gap-3">
          {/* Skip AI Speech */}
          {voiceConversation.isAISpeaking && (
            <Button
              variant="outline"
              size="icon"
              onClick={voiceConversation.stopAISpeech}
              className="h-12 w-12"
            >
              <Square className="w-5 h-5" />
            </Button>
          )}
          
          {/* Main Mic Button */}
          <Button
            variant={voiceConversation.isListening ? 'default' : 'outline'}
            size="icon"
            onClick={voiceConversation.isActive ? voiceConversation.stopConversation : voiceConversation.startConversation}
            disabled={isProcessing}
            className={cn(
              'h-14 w-14 rounded-full transition-all',
              voiceConversation.isListening && 'animate-pulse ring-2 ring-primary ring-offset-2'
            )}
          >
            {voiceConversation.isListening ? (
              <Mic className="w-6 h-6" />
            ) : (
              <MicOff className="w-6 h-6" />
            )}
          </Button>
          
          {/* Volume indicator */}
          {voiceConversation.isAISpeaking && (
            <div className="h-12 w-12 rounded-full border flex items-center justify-center">
              <Volume2 className="w-5 h-5 text-primary animate-pulse" />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
