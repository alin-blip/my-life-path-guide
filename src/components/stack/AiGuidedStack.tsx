import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Send, ArrowLeft, CheckCircle, PlusCircle, RotateCcw, Volume2, VolumeX, Mic, MicOff, Pause, Play, SkipForward } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useStackTodoIntegration } from "@/hooks/useStackTodoIntegration";
import { StackIdeaModal } from "./StackIdeaModal";
import { v4 as uuidv4 } from 'uuid';
import { saveToStackLibrary, updateDailyProgress } from '@/utils/stackProgress';
import { useVoiceToText } from '@/hooks/useVoiceToText';
import { useTextToSpeech } from '@/hooks/useTextToSpeech';

interface Message {
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

interface AiGuidedStackProps {
  onAddToHitList?: (action: string) => void;
  stackType: 'anger' | 'divine-prayer';
  questions: string[];
  onModeSwitch?: () => void;
  audioMode?: boolean;
}

export const AiGuidedStack: React.FC<AiGuidedStackProps> = ({ 
  onAddToHitList, 
  stackType, 
  questions,
  onModeSwitch,
  audioMode = false
}) => {
  const [mode, setMode] = useState<'setup' | 'chat' | 'complete'>('chat');
  const [messages, setMessages] = useState<Message[]>([]);
  const [currentMessage, setCurrentMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [systemPrompt, setSystemPrompt] = useState('');
  const [finalAction, setFinalAction] = useState('');
  const [actionAddedToHitList, setActionAddedToHitList] = useState(false);
  const [sessionId] = useState(() => uuidv4());
  const [ttsEnabled, setTtsEnabled] = useState(audioMode);
  
  const { toast } = useToast();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const shouldSpeakRef = useRef(false);
  
  const {
    isIdeaModalOpen,
    openIdeaModal,
    closeIdeaModal,
    captureIdea
  } = useStackTodoIntegration({ onAddToHitList });

  // TTS integration with advanced controls
  const {
    speak: speakText,
    stop: stopSpeaking,
    pause: pauseTts,
    resume: resumeTts,
    skip: skipTts,
    changePlaybackRate,
    isSpeaking: isAiSpeaking,
    isLoading: isTtsLoading,
    isPaused: isTtsPaused,
    playbackRate
  } = useTextToSpeech({
    voiceId: localStorage.getItem('preferred-tts-voice') || 'pNInz6obpgDQGcFmaJgB',
    onSpeakingStart: () => console.log('🎵 AI started speaking'),
    onSpeakingEnd: () => {
      console.log('✅ AI finished speaking');
      // Auto-activate microphone after AI finishes speaking in audio mode
      if (audioMode && ttsEnabled) {
        setTimeout(() => {
          startListening();
        }, 500);
      }
    },
    autoPlay: true
  });

  // Voice input with auto-submit
  const {
    transcript,
    isListening,
    startListening,
    stopListening,
    resetTranscript,
    isSupported: isVoiceSupported
  } = useVoiceToText({
    onTranscript: (text) => {
      setCurrentMessage(text);
    },
    language: 'ro', // Can be made dynamic
    autoSubmit: audioMode, // Enable auto-submit in audio mode
    onAutoSubmit: () => {
      if (currentMessage.trim()) {
        sendMessage();
      }
    }
  });

  const getStackPrompt = () => {
    if (stackType === 'anger') {
      return `Ești un coach AI specializat în gestionarea furiei și autoreflecție profundă. Ghidezi utilizatorii printr-un proces terapeutic de 40+ de întrebări pentru a transforma furia în claritate și acțiune constructivă.

ROLUL TĂU:
- Ești un coach empatic și înțelegător care ajută oamenii să-și proceseze furia în mod sănătos
- Folosești întrebările din listă ca pe un ghid, dar adaptezi conversația natural
- Te concentrezi pe transformarea furiei în autoînțelegere și acțiuni pozitive
- Ești direct dar plin de compasiune

REGULĂ STRICTĂ:
- Adresezi EXACT o singură întrebare per mesaj.
- NU numerota și NU pune 2+ întrebări în același răspuns.
- Aștepți răspunsul utilizatorului înainte să treci la următoarea întrebare.

ÎNTREBĂRILE GHID (doar pentru context, NU le afișa pe toate odată):
${questions.map((q, i) => `${i + 1}. ${q}`).join('\n')}

PROCESUL TĂU:
1. Începi prin a întreba despre numele stack-ului și domeniul CORE 4
2. Explorezi gradual sentimentele și gândurile utilizatorului
3. Ajuți la identificarea faptelor vs. povești
4. Ghidezi prin reframe-area situației
5. La final, ajuți la identificarea unei acțiuni concrete

INSTRUCȚIUNI:
- Nu întrebi toate întrebările mecanic - adaptează conversația natural
- Fiecare mesaj al tău conține O SINGURĂ întrebare scurtă și clară
- Fii empatic și înțelegător
- Ajută utilizatorul să-și proceseze emoțiile în mod sănătos
- La final, propune o acțiune concretă care poate fi adăugată la "Hit List"
- Vorbește în română dacă utilizatorul vorbește în română

Începe prin a saluta utilizatorul și a pune O SINGURĂ întrebare inițială: ce situație vrea să exploreze astăzi?`;
    } else {
      return `Ești un coach spiritual AI specializat în rugăciune și reflecție spirituală profundă. Ghidezi utilizatorii printr-un proces de 17 întrebări pentru a-i ajuta să se conecteze cu divinitatea și să găsească claritate spirituală.

ROLUL TĂU:
- Ești un ghid spiritual înțelegător și plin de compasiune
- Facilitezi o experiență profundă de rugăciune și auto-reflecție
- Respecți toate tradițiile spirituale și te adaptezi la credințele utilizatorului
- Ajuți la transformarea provocărilor în înțelegere și acțiune divină

REGULĂ STRICTĂ:
- Adresezi EXACT o singură întrebare per mesaj.
- NU numerota și NU pune 2+ întrebări în același răspuns.
- Aștepți răspunsul utilizatorului înainte să treci la următoarea întrebare.

ÎNTREBĂRILE GHID (doar pentru context, NU le afișa pe toate odată):
${questions.map((q, i) => `${i + 1}. ${q}`).join('\n')}

PROCESUL TĂU:
1. Începi prin a întreba despre titlul acestui stack de rugăciune
2. Explorezi situația și sentimentele care au adus utilizatorul la rugăciune
3. Ghidezi prin procesul "Doamne vreau să știi că..." pentru 4 categorii
4. Facilitezi întrebările divine: "Ce vrei să văd/aud/simt/știu/fac?"
5. La final, ajuți la distilarea unei acțiuni concrete din revelația spirituală

INSTRUCȚIUNI:
- Creează un spațiu sacru și sigur pentru reflecție
- Fii respectuos față de experiența spirituală a utilizatorului
- Adaptează limbajul la tradițiile spirituale ale utilizatorului
- Fiecare mesaj al tău conține O SINGURĂ întrebare scurtă și clară
- La final, ajută la identificarea unei acțiuni concrete care vine din înțelegerea spirituală
- Vorbești în română dacă utilizatorul vorbește în română

Începe prin a saluta cu căldură spirituală și a pune O SINGURĂ întrebare: ce te-a adus la această rugăciune astăzi?`;
    }
  };

  useEffect(() => {
    setSystemPrompt(getStackPrompt());
    
    // Add welcome message when component mounts
    if (messages.length === 0) {
      const welcomeContent = stackType === 'anger' 
        ? 'Salut! Sunt aici să te ajut să treci prin procesul de transformare a furiei în claritate și acțiune constructivă. Să începem - ce te-a adus astăzi la acest exercițiu? Ce situație sau sentiment vrei să explorăm împreună?'
        : 'Bine ai venit într-un spațiu de rugăciune și reflecție spirituală. Sunt aici să te însoțesc în această călătorie de conexiune cu divinitatea și găsire de claritate spirituală. Spune-mi, ce te-a adus astăzi la această rugăciune?';
      
      const welcomeMessage: Message = {
        role: 'assistant',
        content: welcomeContent,
        timestamp: new Date()
      };
      setMessages([welcomeMessage]);
      
      // Speak welcome message if TTS is enabled
      if (ttsEnabled) {
        shouldSpeakRef.current = true;
        setTimeout(() => {
          if (shouldSpeakRef.current) {
            speakText(welcomeContent);
          }
        }, 500);
      }
    }
  }, [stackType, questions, ttsEnabled]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  const sendMessage = async () => {
    if (!currentMessage.trim() || isLoading) return;

    // Stop any ongoing TTS
    if (ttsEnabled && isAiSpeaking) {
      stopSpeaking();
    }

    const userMessage: Message = {
      role: 'user',
      content: currentMessage,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setCurrentMessage('');
    setIsLoading(true);

    try {
      const { data, error } = await supabase.functions.invoke('ai-live-coaching', {
        body: {
          messages: [...messages, userMessage].map(msg => ({
            role: msg.role,
            content: msg.content
          })),
          systemPrompt
        }
      });

      if (error) throw error;

      const assistantMessage: Message = {
        role: 'assistant',
        content: data.message,
        timestamp: new Date()
      };

      setMessages(prev => [...prev, assistantMessage]);
      
      // Speak the AI response if TTS is enabled
      if (ttsEnabled) {
        shouldSpeakRef.current = true;
        setTimeout(() => {
          if (shouldSpeakRef.current) {
            speakText(data.message);
          }
        }, 300);
      }
    } catch (error) {
      console.error('Error sending message:', error);
      toast({
        title: "Eroare",
        description: "Nu am putut trimite mesajul. Te rog încearcă din nou.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const generateFinalAction = async () => {
    if (messages.length === 0) return;

    setIsLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('ai-live-coaching', {
        body: {
          messages: [...messages, {
            role: 'user',
            content: `Pe baza întregii noastre conversații, te rog să generezi o acțiune concretă, specifică și acționabilă pe care o pot întreprinde astăzi. Această acțiune ar trebui să fie rezultatul direct al procesului prin care am trecut și să mă ajute să fac progres real. Răspunde DOAR cu acțiunea concretă, fără explicații suplimentare.`
          }],
          systemPrompt: systemPrompt + "\n\nGenerează o acțiune concretă bazată pe conversația noastră. Fii specific și acționabil."
        }
      });

      if (error) throw error;

      setFinalAction(data.message);
      setMode('complete');

      // Save session to Stack Library (Arsenal)
      try {
        const derivedType = stackType === 'anger' ? 'anger' : 'divine';
        const questionsList: string[] = [...messages.map((m, i) => `Mesaj ${i + 1} (${m.role})`), 'Acțiune finală'];
        const answersMap: Record<string | number, string> = {};
        messages.forEach((m, i) => { answersMap[i] = m.content; });
        answersMap[questionsList.length - 1] = data.message;
        await saveToStackLibrary(derivedType, sessionId, answersMap, questionsList);

        // Also persist in universal stack_sessions
        const { data: authData } = await supabase.auth.getSession();
        const userId = authData.session?.user?.id;
        if (userId) {
          const payload = JSON.parse(JSON.stringify(answersMap));
          const { error: upsertError } = await supabase.from('stack_sessions').upsert({
            user_id: userId,
            session_id: sessionId,
            stack_type: derivedType,
            answers: payload,
            completed: true
          });
          if (upsertError) console.error('Failed to upsert stack_sessions:', upsertError);
          // Mark introspecție complete
          await updateDailyProgress('stack');
        }
      } catch (e) {
        console.error('Failed to save AI guided stack to Stack Library/stack_sessions:', e);
      }
    } catch (error) {
      console.error('Error generating final action:', error);
      toast({
        title: "Eroare",
        description: "Nu am putut genera acțiunea finală. Te rog încearcă din nou.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const addToHitList = () => {
    if (finalAction) {
      captureIdea(finalAction, 'hot', 'important');
      setActionAddedToHitList(true);
    }
  };

  const resetSession = () => {
    // Stop any ongoing TTS
    if (ttsEnabled && isAiSpeaking) {
      stopSpeaking();
    }
    
    setMode('chat');
    setCurrentMessage('');
    setFinalAction('');
    setActionAddedToHitList(false);
    
    // Add fresh welcome message
    const welcomeContent = stackType === 'anger' 
      ? 'Salut! Sunt aici să te ajut să treci prin procesul de transformare a furiei în claritate și acțiune constructivă. Să începem - ce te-a adus astăzi la acest exercițiu? Ce situație sau sentiment vrei să explorăm împreună?'
      : 'Bine ai venit într-un spațiu de rugăciune și reflecție spirituală. Sunt aici să te însoțesc în această călătorie de conexiune cu divinitatea și găsire de claritate spirituală. Spune-mi, ce te-a adus astăzi la această rugăciune?';
    
    const welcomeMessage: Message = {
      role: 'assistant',
      content: welcomeContent,
      timestamp: new Date()
    };
    setMessages([welcomeMessage]);
    
    // Speak welcome message if TTS is enabled
    if (ttsEnabled) {
      shouldSpeakRef.current = true;
      setTimeout(() => {
        if (shouldSpeakRef.current) {
          speakText(welcomeContent);
        }
      }, 500);
    }
  };

  const startChat = () => {
    if (systemPrompt.trim()) {
      setMode('chat');
    }
  };

  if (mode === 'complete') {
    return (
      <div className="w-full p-1 sm:p-2 flex flex-col h-full">
        <Card className="flex-1 flex flex-col">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg sm:text-xl">
              Sesiune Completă - AI {stackType === 'anger' ? 'Alchimia Furiei' : 'Dialogul cu Divinitatea'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="p-3 bg-background/50 rounded border-l-4 border-primary mb-2">
              <p className="text-sm sm:text-base text-foreground">{finalAction}</p>
              {actionAddedToHitList && (
                <div className="flex items-center text-green-400 text-xs sm:text-sm mt-2">
                  <CheckCircle className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
                  Această acțiune a fost adăugată la lista ta fierbinte
                </div>
              )}
            </div>
          </CardContent>
          <CardFooter className="flex gap-2 flex-wrap">
            <Button 
              variant="outline" 
              onClick={resetSession}
              size="sm"
              className="text-xs sm:text-sm"
            >
              <RotateCcw className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
              Începe o nouă sesiune
            </Button>
            {onModeSwitch && (
              <Button 
                variant="outline" 
                onClick={onModeSwitch}
                size="sm"
                className="text-xs sm:text-sm"
              >
                <ArrowLeft className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
                Mod Manual
              </Button>
            )}
            {!actionAddedToHitList && finalAction && (
              <Button 
                onClick={addToHitList}
                size="sm"
                className="text-xs sm:text-sm"
              >
                <PlusCircle className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
                Adaugă la Hit List
              </Button>
            )}
          </CardFooter>
        </Card>

        <StackIdeaModal
          isOpen={isIdeaModalOpen}
          onClose={closeIdeaModal}
          onAddToHitList={onAddToHitList}
        />
      </div>
    );
  }

  if (mode === 'setup') {
    return (
      <div className="w-full p-1 sm:p-2 flex flex-col justify-end h-full">
        <div className="mb-4">
          <h1 className="text-lg sm:text-xl font-semibold text-primary mb-2">
            AI {stackType === 'anger' ? 'Alchimia Furiei' : 'Dialogul cu Divinitatea'}
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground mb-4">
            Configurează AI coach-ul pentru experiența ta ghidată
          </p>
        </div>

        <Card className="mb-4">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Instrucțiuni AI Coach</CardTitle>
          </CardHeader>
          <CardContent>
            <Textarea
              value={systemPrompt}
              onChange={(e) => setSystemPrompt(e.target.value)}
              placeholder="Instrucțiunile pentru AI coach..."
              className="min-h-[200px] text-xs"
            />
          </CardContent>
        </Card>

        <div className="flex gap-2">
          <Button 
            onClick={startChat}
            disabled={!systemPrompt.trim()}
            size="sm"
            className="text-xs sm:text-sm"
          >
            Începe Sesiunea AI
          </Button>
          <Button 
            variant="outline" 
            onClick={onModeSwitch}
            size="sm"
            className="text-xs sm:text-sm"
          >
            <ArrowLeft className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
            Mod Manual
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-background">
      {/* Header fix la top */}
      <div className="border-b border-border bg-card px-4 py-3 flex items-center justify-between">
        <div>
          <h1 className="text-base sm:text-lg font-semibold">
            AI {stackType === 'anger' ? 'Alchimia Furiei' : 'Dialogul cu Divinitatea'}
          </h1>
          <p className="text-xs text-muted-foreground">
            Conversație ghidată cu AI coach-ul tău
            {ttsEnabled && isAiSpeaking && (
              <span className="ml-2 inline-flex items-center">
                <span className="animate-pulse">🔊</span>
                <span className="ml-1">AI vorbește...</span>
              </span>
            )}
          </p>
        </div>
        <div className="flex gap-2">
          {/* TTS Toggle Button */}
          <Button 
            variant={ttsEnabled ? "default" : "outline"}
            onClick={() => {
              const newState = !ttsEnabled;
              setTtsEnabled(newState);
              if (!newState && isAiSpeaking) {
                stopSpeaking();
              }
              toast({
                title: newState ? "🔊 TTS Activat" : "🔇 TTS Dezactivat",
                description: newState 
                  ? "AI va citi răspunsurile cu voce" 
                  : "AI nu va mai citi răspunsurile",
              });
            }}
            size="sm"
            className="text-xs"
            title={ttsEnabled ? "Dezactivează vocea AI" : "Activează vocea AI"}
          >
            {ttsEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
          </Button>
          <Button 
            variant="ghost" 
            onClick={resetSession}
            size="sm"
            className="text-xs"
          >
            <RotateCcw className="w-4 h-4" />
          </Button>
          {onModeSwitch && (
            <Button 
              variant="ghost" 
              onClick={onModeSwitch}
              size="sm"
              className="text-xs"
            >
              <ArrowLeft className="w-4 h-4 mr-1" />
              Manual
            </Button>
          )}
        </div>
      </div>

      {/* Zona de mesaje - scrollable */}
      <div className="flex-1 overflow-y-auto px-4 py-6">
        {isAiSpeaking && (
          <div className="flex items-center justify-center py-2 text-sm text-muted-foreground">
            <span className="inline-flex items-center">
              <span className="animate-pulse mr-2">🔊</span>
              AI vorbește...
            </span>
          </div>
        )}
        <div className="max-w-3xl mx-auto space-y-4">
          {messages.map((message, index) => (
            <div
              key={index}
              className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[85%] rounded-lg p-3 sm:p-4 ${
                  message.role === 'user'
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-muted'
                }`}
              >
                <p className="text-xs sm:text-sm leading-relaxed whitespace-pre-wrap">{message.content}</p>
                <p className="text-[10px] sm:text-xs mt-1 opacity-50">
                  {message.timestamp.toLocaleTimeString('ro-RO', { hour: '2-digit', minute: '2-digit' })}
                </p>
              </div>
            </div>
          ))}
          {isLoading && (
            <div className="flex justify-start">
              <div className="max-w-[85%] rounded-lg p-3 sm:p-4 bg-muted flex items-center space-x-2">
                <div className="flex space-x-1">
                  <div className="w-2 h-2 bg-foreground/50 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                  <div className="w-2 h-2 bg-foreground/50 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                  <div className="w-2 h-2 bg-foreground/50 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Input Area - sticky la bottom */}
      <div className="border-t border-border bg-card p-4">
        <div className="max-w-3xl mx-auto">
          {/* TTS Playback Controls (shown only when TTS is enabled) */}
          {ttsEnabled && (
            <div className="flex items-center justify-center gap-2 mb-3 pb-3 border-b border-border">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => isTtsPaused ? resumeTts() : pauseTts()}
                disabled={!isAiSpeaking}
                className="gap-2"
              >
                {isTtsPaused ? <Play className="h-4 w-4" /> : <Pause className="h-4 w-4" />}
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={skipTts}
                disabled={!isAiSpeaking}
                className="gap-2"
              >
                <SkipForward className="h-4 w-4" />
              </Button>
              <select
                value={playbackRate}
                onChange={(e) => changePlaybackRate(parseFloat(e.target.value))}
                className="h-8 px-2 rounded-md bg-background border border-border text-sm"
              >
                <option value="0.5">0.5x</option>
                <option value="0.75">0.75x</option>
                <option value="1">1x</option>
                <option value="1.25">1.25x</option>
                <option value="1.5">1.5x</option>
                <option value="2">2x</option>
              </select>
            </div>
          )}

          {/* Message Input */}
          <div className="relative flex gap-2">
            <Textarea
              value={currentMessage}
              onChange={(e) => setCurrentMessage(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  sendMessage();
                }
              }}
              placeholder={isListening ? "Vorbești..." : "Scrie mesajul tău aici... (Enter trimite)"}
              className={`min-h-[52px] max-h-32 text-sm resize-none ${
                isListening ? 'ring-2 ring-blue-500' : ''
              }`}
              disabled={isLoading}
            />
            <div className="flex flex-col gap-2">
              {isVoiceSupported && (
                <Button
                  variant={isListening ? "default" : "outline"}
                  size="icon"
                  onClick={() => isListening ? stopListening() : startListening()}
                  disabled={isLoading}
                  className="h-[52px]"
                >
                  {isListening ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
                </Button>
              )}
              <Button
                onClick={sendMessage}
                disabled={!currentMessage.trim() || isLoading}
                size="icon"
                className="h-[52px]"
              >
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Buton pentru generare acțiune finală */}
          {messages.length >= 10 && (
            <Button
              onClick={generateFinalAction}
              disabled={isLoading}
              variant="secondary"
              size="sm"
              className="w-full text-sm font-medium mt-2"
            >
              <CheckCircle className="w-4 h-4 mr-2" />
              Generează Acțiune Finală din Conversație
            </Button>
          )}
        </div>
      </div>

      <StackIdeaModal
        isOpen={isIdeaModalOpen}
        onClose={closeIdeaModal}
        onAddToHitList={onAddToHitList}
      />
    </div>
  );
};