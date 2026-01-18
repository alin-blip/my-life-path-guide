import React, { useState, useRef, useEffect } from 'react';
import { Brain, Send, Mic, MicOff, Volume2, VolumeX, BookOpen } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import { WidgetContainer } from './WidgetContainer';
import { useVoiceToText } from '@/hooks/useVoiceToText';
import { useTextToSpeech } from '@/hooks/useTextToSpeech';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { DraggableProvidedDragHandleProps } from '@hello-pangea/dnd';
import { WidgetSize } from '@/types/dashboardWidget';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { NapoleonVoiceChat } from '@/components/napoleon/NapoleonVoiceChat';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

interface NapoleonHillCoachWidgetProps {
  size: WidgetSize;
  onRemove?: () => void;
  onResize?: (size: WidgetSize) => void;
  dragHandleProps?: DraggableProvidedDragHandleProps | null;
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
- Răspunzi concis (max 2-3 paragrafe) pentru că ești într-un widget de dashboard
- Oferi sfaturi practice și acționabile bazate pe principii
- Folosești citate relevante din carte când e potrivit
- Încurajezi definirea clară a obiectivelor și acțiunea imediată
- Ești empatic dar direct, ca un mentor înțelept
- Răspunzi în limba română`;

export const NapoleonHillCoachWidget: React.FC<NapoleonHillCoachWidgetProps> = ({
  size,
  onRemove,
  onResize,
  dragHandleProps
}) => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [ttsEnabled, setTtsEnabled] = useState(false);
  const [voiceChatOpen, setVoiceChatOpen] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Keep the typed text that existed when voice dictation started,
  // then continuously REPLACE with (base + live transcript) to avoid duplicates.
  const voiceBaseRef = useRef<string>('');

  const { 
    isListening, 
    transcript, 
    toggleListening,
    resetTranscript,
    isSupported: isVoiceSupported 
  } = useVoiceToText({
    language: 'ro',
    onTranscript: (text) => {
      const base = voiceBaseRef.current;
      const combined = [base, text].filter(Boolean).join(' ').replace(/\s+/g, ' ').trim();
      setInputMessage(combined);
    }
  });

  const { speak, stop: stopSpeaking, isSpeaking } = useTextToSpeech({
    // Use hook default voiceId (valid for our backend TTS)
    onSpeakingStart: () => {
      // Stop mic while playing TTS (prevents audio focus issues)
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

    // Stop dictation before sending (and reset base) to avoid conflicts with TTS and typing.
    if (isListening) {
      toggleListening();
    }
    voiceBaseRef.current = '';

    const userMessage: Message = { role: 'user', content: textToSend };
    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    resetTranscript();
    setIsLoading(true);

    try {
      const { data, error } = await supabase.functions.invoke('ai-coach', {
        body: {
          messages: [...messages, userMessage].map(m => ({
            role: m.role,
            content: m.content
          })),
          systemPrompt: NAPOLEON_HILL_SYSTEM_PROMPT,
          stackType: 'napoleon-hill-coach'
        }
      });

      if (error) throw error;

      const assistantMessage: Message = {
        role: 'assistant',
        content: data.response || data.message || 'Nu am putut genera un răspuns.'
      };

      setMessages(prev => [...prev, assistantMessage]);

      if (ttsEnabled && assistantMessage.content) {
        speak(assistantMessage.content);
      }
    } catch (error) {
      console.error('Error sending message:', error);
      toast.error('Eroare la trimiterea mesajului');
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
      // Capture what user already typed, then start fresh transcript.
      voiceBaseRef.current = inputMessage.trim();
      resetTranscript();
    }
    toggleListening();
  };

  const isSmall = size === 'small';

  return (
    <>
      <WidgetContainer
        title={t('widgets.napoleonCoach', 'Coach Succes')}
        icon={<Brain className="h-4 w-4" />}
        size={size}
        onRemove={onRemove}
        onResize={onResize}
        dragHandleProps={dragHandleProps}
      >
        <div className="flex flex-col h-full gap-2">
          {/* Big Voice Button - always visible at top */}
          <button
            onClick={() => setVoiceChatOpen(true)}
            className="w-full py-4 px-4 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white font-medium flex items-center justify-center gap-3 transition-all shadow-lg hover:shadow-xl hover:scale-[1.02] active:scale-[0.98]"
          >
            <Mic className="h-6 w-6" />
            <span className="text-lg">Vorbește cu Napoleon</span>
          </button>

          {/* Messages area */}
          <ScrollArea className={`flex-1 ${isSmall ? 'max-h-24' : 'max-h-48'}`}>
            <div ref={scrollRef} className="space-y-2 pr-2">
              {messages.length === 0 ? (
                <div className="text-center text-muted-foreground text-sm py-4">
                  <p className="font-medium">Bună! Sunt coachul tău bazat pe cele 13 principii ale succesului.</p>
                  <p className="mt-1 text-xs">Cu ce te pot ajuta astăzi?</p>
                </div>
              ) : (
                messages.map((msg, idx) => (
                  <div
                    key={idx}
                    className={`text-sm p-2 rounded-lg ${
                      msg.role === 'user'
                        ? 'bg-primary/10 text-foreground ml-4'
                        : 'bg-muted text-foreground mr-4'
                    }`}
                  >
                    {msg.content}
                  </div>
                ))
              )}
              {isLoading && (
                <div className="text-sm text-muted-foreground italic p-2">
                  Se gândește...
                </div>
              )}
            </div>
          </ScrollArea>

          {/* Input area */}
          <div className="flex gap-2 items-end">
            <Textarea
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Sau scrie întrebarea ta..."
              className="min-h-[40px] max-h-20 resize-none text-sm"
              rows={1}
            />
            
            <div className="flex flex-col gap-1">
              {isVoiceSupported && (
                <Button
                  size="icon"
                  variant={isListening ? "destructive" : "outline"}
                  onClick={handleMicToggle}
                  className="h-8 w-8"
                >
                  {isListening ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
                </Button>
              )}
              <Button
                size="icon"
                onClick={() => sendMessage()}
                disabled={!inputMessage.trim() || isLoading}
                className="h-8 w-8"
              >
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Footer controls */}
          {!isSmall && (
            <div className="flex justify-between items-center pt-1 border-t border-border/50">
              <Button
                size="sm"
                variant="ghost"
                onClick={toggleTTS}
                className="text-xs h-7 gap-1"
              >
                {ttsEnabled ? (
                  <>
                    <Volume2 className="h-3 w-3" />
                    TTS Activ
                  </>
                ) : (
                  <>
                    <VolumeX className="h-3 w-3" />
                    TTS Inactiv
                  </>
                )}
              </Button>
              
              <Button
                size="sm"
                variant="ghost"
                onClick={() => navigate('/napoleon-hill')}
                className="text-xs h-7 gap-1"
              >
                <BookOpen className="h-3 w-3" />
                Sesiune completă
              </Button>
            </div>
          )}
        </div>
      </WidgetContainer>

      {/* Voice Chat Dialog */}
      <Dialog open={voiceChatOpen} onOpenChange={setVoiceChatOpen}>
        <DialogContent className="max-w-lg h-[600px] p-0 overflow-hidden">
          <NapoleonVoiceChat onClose={() => setVoiceChatOpen(false)} />
        </DialogContent>
      </Dialog>
    </>
  );
};
