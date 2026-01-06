import React, { useState, useCallback, useRef, useEffect } from 'react';
import { Mic, MicOff, Volume2, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useVoiceInput } from '@/hooks/useVoiceInput';
import { useTextToSpeech } from '@/hooks/useTextToSpeech';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

const NAPOLEON_HILL_SYSTEM_PROMPT = `Tu ești un coach de succes bazat pe cele 13 principii fundamentale din "Think and Grow Rich" de Napoleon Hill:

1. DORINȚA - Punctul de pornire al tuturor realizărilor
2. CREDINȚA - Vizualizarea și credința în atingerea obiectivului  
3. AUTOSUGESTIA - Influențarea subconștientului prin repetiție
4. CUNOȘTINȚE SPECIALIZATE - Puterea cunoașterii organizate și aplicate
5. IMAGINAȚIA - Atelierul minții unde se nasc ideile
6. PLANIFICAREA ORGANIZATĂ - Cristalizarea dorinței în acțiune concretă
7. DECIZIA - Învingerea procrastinării și a îndoielii
8. PERSEVERENȚA - Efortul susținut necesar pentru succes
9. PUTEREA MASTER MIND - Alianța armonioasă cu alte minți
10. TRANSMUTAȚIA ENERGIEI - Canalizarea energiei în creativitate
11. SUBCONȘTIENTUL - Legătura cu Inteligența Infinită
12. CREIERUL - Stația de emisie-recepție a gândurilor
13. AL ȘASELEA SIMȚ - Poarta către Înțelepciunea Infinită

Stilul tău de coaching:
- Răspunzi concis (max 2-3 paragrafe)
- Oferi sfaturi practice și acționabile bazate pe principii
- Folosești citate relevante din carte când e potrivit
- Încurajezi definirea clară a obiectivelor și acțiunea imediată
- Ești empatic dar direct, ca un mentor înțelept
- Răspunzi în limba română`;

interface NapoleonVoiceChatProps {
  onClose?: () => void;
  fullScreen?: boolean;
}

export const NapoleonVoiceChat: React.FC<NapoleonVoiceChatProps> = ({
  onClose,
  fullScreen = false
}) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [currentTranscript, setCurrentTranscript] = useState('');
  const scrollRef = useRef<HTMLDivElement>(null);
  const transcriptRef = useRef<string>(''); // Keep ref in sync for callbacks
  const messagesRef = useRef<Message[]>([]); // Keep messages ref for callbacks
  const shouldRestartMicRef = useRef(false);
  const sendMessageRef = useRef<(text: string) => Promise<void>>();

  // Update refs when state changes
  useEffect(() => {
    transcriptRef.current = currentTranscript;
  }, [currentTranscript]);

  useEffect(() => {
    messagesRef.current = messages;
  }, [messages]);

  // TTS Hook
  const { speak, stop: stopSpeaking, isSpeaking, isLoading: ttsLoading } = useTextToSpeech({
    onSpeakingEnd: () => {
      // After AI finishes speaking, restart mic if we should
      if (shouldRestartMicRef.current && !isProcessing) {
        shouldRestartMicRef.current = false;
        setTimeout(() => {
          startVoice();
        }, 300);
      }
    }
  });

  // Voice Input Hook
  const { 
    isMicOn, 
    isUserSpeaking,
    startVoice, 
    stopVoice, 
    toggleMic,
    voiceLanguage,
    changeVoiceLanguage
  } = useVoiceInput({
    voiceLanguage: 'ro-RO',
    onTranscript: (text) => {
      if (text.trim()) {
        // Accumulate transcript instead of replacing
        setCurrentTranscript(prev => {
          const newText = prev ? `${prev} ${text}` : text;
          return newText.trim();
        });
      }
    },
    onMicStop: () => {
      // When user stops mic, send the message if there's text
      const textToSend = transcriptRef.current.trim();
      if (textToSend && sendMessageRef.current) {
        sendMessageRef.current(textToSend);
        setCurrentTranscript('');
        transcriptRef.current = '';
      }
    }
  });

  // Auto-scroll to bottom
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, currentTranscript]);

  const sendMessage = useCallback(async (text: string) => {
    if (!text.trim() || isProcessing) return;

    const userMessage: Message = { role: 'user', content: text };
    setMessages(prev => [...prev, userMessage]);
    setIsProcessing(true);
    shouldRestartMicRef.current = true; // Mark to restart mic after TTS

    try {
      const { data, error } = await supabase.functions.invoke('ai-coach', {
        body: {
          messages: [...messagesRef.current, userMessage].map(m => ({
            role: m.role,
            content: m.content
          })),
          systemPrompt: NAPOLEON_HILL_SYSTEM_PROMPT,
          stackType: 'napoleon-hill-voice'
        }
      });

      if (error) throw error;

      const responseText = data.response || data.message || 'Nu am putut genera un răspuns.';
      
      const assistantMessage: Message = {
        role: 'assistant',
        content: responseText
      };

      setMessages(prev => [...prev, assistantMessage]);
      setIsProcessing(false);
      
      // Speak the response
      speak(responseText);
    } catch (error) {
      console.error('Error sending message:', error);
      toast.error('Eroare la comunicare cu coach-ul');
      setIsProcessing(false);
      shouldRestartMicRef.current = false;
      // Restart mic on error
      setTimeout(() => startVoice(), 300);
    }
  }, [isProcessing, speak, startVoice]);

  // Keep sendMessage ref updated
  useEffect(() => {
    sendMessageRef.current = sendMessage;
  }, [sendMessage]);

  const handleMainButtonClick = useCallback(() => {
    if (isSpeaking) {
      // Stop AI speaking
      stopSpeaking();
      // Start listening
      startVoice();
    } else if (isMicOn) {
      // Stop mic and send message
      stopVoice();
    } else {
      // Start listening
      startVoice();
    }
  }, [isMicOn, isSpeaking, startVoice, stopVoice, stopSpeaking]);

  const handleClose = useCallback(() => {
    stopVoice();
    stopSpeaking();
    onClose?.();
  }, [stopVoice, stopSpeaking, onClose]);

  // Determine button state
  const isActive = isMicOn || isSpeaking;
  const buttonLabel = isSpeaking 
    ? 'Napoleon vorbește...' 
    : isMicOn 
      ? (isUserSpeaking ? 'Te ascult...' : 'Apasă când termini')
      : 'Apasă pentru a vorbi';

  return (
    <div className={cn(
      "flex flex-col bg-background",
      fullScreen ? "h-screen" : "h-full min-h-[400px]"
    )}>
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-border">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-amber-500/20 flex items-center justify-center">
            <span className="text-xl">🎩</span>
          </div>
          <div>
            <h2 className="font-semibold text-foreground">Napoleon Hill Coach</h2>
            <p className="text-xs text-muted-foreground">Conversație vocală</p>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          {/* Language toggle */}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => changeVoiceLanguage(voiceLanguage === 'ro-RO' ? 'en-US' : 'ro-RO')}
            className="text-xs"
          >
            {voiceLanguage === 'ro-RO' ? '🇷🇴 RO' : '🇺🇸 EN'}
          </Button>
          
          {onClose && (
            <Button variant="ghost" size="icon" onClick={handleClose}>
              <X className="h-5 w-5" />
            </Button>
          )}
        </div>
      </div>

      {/* Messages Area */}
      <ScrollArea className="flex-1 p-4">
        <div ref={scrollRef} className="space-y-4">
          {messages.length === 0 && !currentTranscript && (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">🎩</div>
              <h3 className="text-lg font-medium text-foreground mb-2">
                Bine ai venit!
              </h3>
              <p className="text-sm text-muted-foreground max-w-sm mx-auto">
                Apasă butonul mare de mai jos și spune-mi cu ce te pot ajuta astăzi.
              </p>
            </div>
          )}

          {messages.map((msg, idx) => (
            <div
              key={idx}
              className={cn(
                "p-3 rounded-xl max-w-[85%]",
                msg.role === 'user'
                  ? "bg-primary text-primary-foreground ml-auto"
                  : "bg-muted text-foreground mr-auto"
              )}
            >
              {msg.content}
            </div>
          ))}

          {/* Current transcript (live) */}
          {currentTranscript && (
            <div className="p-3 rounded-xl max-w-[85%] ml-auto bg-primary/50 text-primary-foreground animate-pulse">
              {currentTranscript}...
            </div>
          )}

          {/* Processing indicator */}
          {isProcessing && (
            <div className="p-3 rounded-xl max-w-[85%] mr-auto bg-muted text-muted-foreground">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-amber-500 rounded-full animate-bounce" />
                <div className="w-2 h-2 bg-amber-500 rounded-full animate-bounce [animation-delay:0.1s]" />
                <div className="w-2 h-2 bg-amber-500 rounded-full animate-bounce [animation-delay:0.2s]" />
                <span className="ml-2 text-sm">Napoleon se gândește...</span>
              </div>
            </div>
          )}
        </div>
      </ScrollArea>

      {/* Main Voice Button */}
      <div className="p-6 flex flex-col items-center gap-4 border-t border-border bg-muted/30">
        <button
          onClick={handleMainButtonClick}
          disabled={isProcessing || ttsLoading}
          className={cn(
            "relative w-32 h-32 rounded-full transition-all duration-300 flex items-center justify-center",
            "focus:outline-none focus:ring-4 focus:ring-primary/30",
            "disabled:opacity-50 disabled:cursor-not-allowed",
            isSpeaking 
              ? "bg-amber-500 hover:bg-amber-600 shadow-lg shadow-amber-500/40"
              : isMicOn
                ? "bg-red-500 hover:bg-red-600 shadow-lg shadow-red-500/40"
                : "bg-primary hover:bg-primary/90 shadow-lg shadow-primary/30",
            isActive && "animate-pulse"
          )}
        >
          {/* Pulse rings when active */}
          {isActive && (
            <>
              <span className="absolute inset-0 rounded-full bg-current opacity-20 animate-ping" />
              <span className="absolute inset-[-8px] rounded-full border-2 border-current opacity-30 animate-pulse" />
            </>
          )}
          
          {isSpeaking ? (
            <Volume2 className="h-12 w-12 text-white" />
          ) : isMicOn ? (
            <MicOff className="h-12 w-12 text-white" />
          ) : (
            <Mic className="h-12 w-12 text-white" />
          )}
        </button>

        <p className="text-sm text-muted-foreground text-center">
          {buttonLabel}
        </p>
      </div>
    </div>
  );
};
