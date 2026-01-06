import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Send, Mic, MicOff, Volume2, VolumeX, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useVoiceToText } from '@/hooks/useVoiceToText';
import { useTextToSpeech } from '@/hooks/useTextToSpeech';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

export const RelationshipCoachChat: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'assistant',
      content: 'Bună! 💕 Sunt coach-ul tău pentru relații. Sunt aici să te ajut să îți îmbunătățești conexiunile cu cei dragi. Ce relație ai vrea să discutăm azi? Poate fi cu partenerul, familia, prietenii sau colegii.'
    }
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [ttsEnabled, setTtsEnabled] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  const voiceBaseRef = useRef<string>('');

  const { 
    isListening, 
    toggleListening, 
    resetTranscript,
    isSupported: voiceSupported 
  } = useVoiceToText({
    language: 'ro',
    onTranscript: (text) => {
      const base = voiceBaseRef.current;
      const combined = [base, text].filter(Boolean).join(' ').replace(/\s+/g, ' ').trim();
      setInputMessage(combined);
    }
  });

  const { speak, stop: stopSpeaking, isSpeaking } = useTextToSpeech({
    onSpeakingStart: () => {
      if (isListening) {
        toggleListening();
      }
    }
  });

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const sendMessage = async (messageText?: string) => {
    const textToSend = messageText || inputMessage.trim();
    if (!textToSend || isLoading) return;

    if (isListening) {
      toggleListening();
    }
    voiceBaseRef.current = '';

    const userMessage: Message = { role: 'user', content: textToSend };
    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsLoading(true);

    try {
      const { data, error } = await supabase.functions.invoke('relationship-coach', {
        body: {
          messages: [...messages, userMessage].map(m => ({
            role: m.role,
            content: m.content
          }))
        }
      });

      if (error) throw error;

      const assistantMessage: Message = {
        role: 'assistant',
        content: data.response || data.message || 'Îmi pare rău, a apărut o eroare.'
      };

      setMessages(prev => [...prev, assistantMessage]);

      if (ttsEnabled && assistantMessage.content) {
        speak(assistantMessage.content);
      }
    } catch (error: any) {
      console.error('Error sending message:', error);
      toast({
        title: 'Eroare',
        description: error.message || 'Nu am putut trimite mesajul.',
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const toggleTTS = () => {
    if (isSpeaking) {
      stopSpeaking();
    }
    setTtsEnabled(prev => !prev);
  };

  const handleMicToggle = () => {
    if (!isListening) {
      voiceBaseRef.current = inputMessage.trim();
      resetTranscript();
    }
    toggleListening();
  };

  return (
    <div className="flex flex-col h-full">
      <ScrollArea ref={scrollRef} className="flex-1 p-4">
        <div className="space-y-4">
          {messages.map((message, index) => (
            <div
              key={index}
              className={cn(
                "flex",
                message.role === 'user' ? "justify-end" : "justify-start"
              )}
            >
              <div
                className={cn(
                  "max-w-[85%] rounded-2xl px-4 py-2",
                  message.role === 'user'
                    ? "bg-pink-600 text-white"
                    : "bg-muted"
                )}
              >
                <p className="text-sm whitespace-pre-wrap">{message.content}</p>
              </div>
            </div>
          ))}
          
          {isLoading && (
            <div className="flex justify-start">
              <div className="bg-muted rounded-2xl px-4 py-2">
                <Loader2 className="h-4 w-4 animate-spin" />
              </div>
            </div>
          )}
        </div>
      </ScrollArea>

      <div className="border-t p-4">
        <div className="flex items-center gap-2">
          <Button
            size="icon"
            variant={ttsEnabled ? "default" : "outline"}
            onClick={toggleTTS}
            className="h-9 w-9 flex-shrink-0"
            title={ttsEnabled ? "Dezactivează voce" : "Activează voce"}
          >
            {ttsEnabled ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}
          </Button>

          <Input
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Scrie un mesaj..."
            className="flex-1"
            disabled={isLoading}
          />

          {voiceSupported && (
            <Button
              size="icon"
              variant={isListening ? "destructive" : "outline"}
              onClick={handleMicToggle}
              className="h-9 w-9 flex-shrink-0"
            >
              {isListening ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
            </Button>
          )}

          <Button
            size="icon"
            onClick={() => sendMessage()}
            disabled={!inputMessage.trim() || isLoading}
            className="h-9 w-9 flex-shrink-0"
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
};
