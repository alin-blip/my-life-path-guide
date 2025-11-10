import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Send, ArrowLeft, CheckCircle, PlusCircle, RotateCcw } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useStackTodoIntegration } from "@/hooks/useStackTodoIntegration";
import { StackIdeaModal } from "./StackIdeaModal";
import { v4 as uuidv4 } from 'uuid';
import { saveToStackLibrary, updateDailyProgress } from '@/utils/stackProgress';
import { useVoiceInput } from '@/hooks/useVoiceInput';
import { VoiceInputButton } from './VoiceInputButton';
import { VoiceLanguageToggle } from './VoiceLanguageToggle';
import { AISpeakingIndicator } from './AISpeakingIndicator';

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
}

export const AiGuidedStack: React.FC<AiGuidedStackProps> = ({ 
  onAddToHitList, 
  stackType, 
  questions,
  onModeSwitch 
}) => {
  const [mode, setMode] = useState<'setup' | 'chat' | 'complete'>('chat');
  const [messages, setMessages] = useState<Message[]>([]);
  const [currentMessage, setCurrentMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [systemPrompt, setSystemPrompt] = useState('');
  const [finalAction, setFinalAction] = useState('');
  const [actionAddedToHitList, setActionAddedToHitList] = useState(false);
  const [sessionId] = useState(() => uuidv4());
  
  const { toast } = useToast();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  const {
    isIdeaModalOpen,
    openIdeaModal,
    closeIdeaModal,
    captureIdea
  } = useStackTodoIntegration({ onAddToHitList });

  // Voice input integration with deduplication
  const lastTranscriptRef = useRef<string>('');
  
  const {
    isConnected,
    isMicOn,
    isAISpeaking,
    isUserSpeaking,
    audioLevel,
    voiceLanguage,
    changeVoiceLanguage,
    toggleMic
  } = useVoiceInput({
    onTranscript: (text) => {
      // Deduplication: only add if different from last transcript
      if (text && text !== lastTranscriptRef.current) {
        lastTranscriptRef.current = text;
        setCurrentMessage(prev => {
          const newText = prev ? `${prev} ${text}` : text;
          return newText;
        });
      }
    },
    systemPrompt: `Ești un coach AI care ajută utilizatorii cu ${stackType === 'anger' ? 'gestionarea furiei' : 'rugăciune și reflecție spirituală'}. Fii concis, empatic și orientat către acțiune.`,
    enabled: mode === 'chat'
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
      const welcomeMessage: Message = {
        role: 'assistant',
        content: stackType === 'anger' 
          ? 'Salut! Sunt aici să te ajut să treci prin procesul de transformare a furiei în claritate și acțiune constructivă. Să începem - ce te-a adus astăzi la acest exercițiu? Ce situație sau sentiment vrei să explorăm împreună?'
          : 'Bine ai venit într-un spațiu de rugăciune și reflecție spirituală. Sunt aici să te însoțesc în această călătorie de conexiune cu divinitatea și găsire de claritate spirituală. Spune-mi, ce te-a adus astăzi la această rugăciune?',
        timestamp: new Date()
      };
      setMessages([welcomeMessage]);
    }
  }, [stackType, questions]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  const sendMessage = async () => {
    if (!currentMessage.trim() || isLoading) return;

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
    setMode('chat');
    setCurrentMessage('');
    setFinalAction('');
    setActionAddedToHitList(false);
    
    // Add fresh welcome message
    const welcomeMessage: Message = {
      role: 'assistant',
      content: stackType === 'anger' 
        ? 'Salut! Sunt aici să te ajut să treci prin procesul de transformare a furiei în claritate și acțiune constructivă. Să începem - ce te-a adus astăzi la acest exercițiu? Ce situație sau sentiment vrei să explorăm împreună?'
        : 'Bine ai venit într-un spațiu de rugăciune și reflecție spirituală. Sunt aici să te însoțesc în această călătorie de conexiune cu divinitatea și găsire de claritate spirituală. Spune-mi, ce te-a adus astăzi la această rugăciune?',
      timestamp: new Date()
    };
    setMessages([welcomeMessage]);
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
    <div className="w-full p-1 sm:p-2 flex flex-col h-full">
      <Card className={`flex-1 flex flex-col transition-all ${
        isAISpeaking ? 'ring-2 ring-green-500 animate-pulse' : ''
      }`}>
        <CardHeader className="pb-2">
          <CardTitle className="text-lg sm:text-xl">
            AI {stackType === 'anger' ? 'Alchimia Furiei' : 'Dialogul cu Divinitatea'}
          </CardTitle>
          <p className="text-xs sm:text-sm text-muted-foreground">
            Conversație ghidată cu AI coach-ul tău
          </p>
        </CardHeader>
        <CardContent className="flex-1 overflow-y-auto p-2">
          <AISpeakingIndicator isAISpeaking={isAISpeaking} />
          <div className="space-y-3">
            {messages.map((message, index) => (
              <div
                key={index}
                className={`p-2 rounded-lg text-xs sm:text-sm ${
                  message.role === 'user'
                    ? 'bg-primary text-primary-foreground ml-8'
                    : 'bg-muted mr-8'
                }`}
              >
                <div className="whitespace-pre-wrap">{message.content}</div>
                <div className="text-xs opacity-70 mt-1">
                  {message.timestamp.toLocaleTimeString()}
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="bg-muted mr-8 p-2 rounded-lg text-xs sm:text-sm">
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-primary rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                  <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        </CardContent>
        <CardFooter className="flex flex-col gap-2">
          <div className="flex w-full gap-2">
            <Textarea
              value={currentMessage}
              onChange={(e) => setCurrentMessage(e.target.value)}
              placeholder="Scrie mesajul tău aici sau folosește voice input..."
              className="flex-1 min-h-[60px] text-xs sm:text-sm"
              onEnterSubmit={sendMessage}
            />
            <div className="flex flex-col gap-2">
              <VoiceInputButton
                isConnected={isConnected}
                isMicOn={isMicOn}
                isAISpeaking={isAISpeaking}
                isUserSpeaking={isUserSpeaking}
                audioLevel={audioLevel}
                onToggle={toggleMic}
                variant="compact"
                showWaveform={true}
              />
              <Button
                onClick={sendMessage}
                disabled={!currentMessage.trim() || isLoading}
                size="sm"
                className="px-3"
              >
                <Send className="w-3 h-3 sm:w-4 sm:h-4" />
              </Button>
            </div>
          </div>
          <div className="flex w-full gap-2 flex-wrap">
            <VoiceLanguageToggle
              currentLanguage={voiceLanguage}
              onLanguageChange={changeVoiceLanguage}
              disabled={isConnected}
            />
            <Button
              variant="outline"
              onClick={resetSession}
              size="sm"
              className="text-xs sm:text-sm"
            >
              <RotateCcw className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
              Reset
            </Button>
            {onModeSwitch && (
              <Button 
                variant="outline" 
                onClick={onModeSwitch}
                size="sm"
                className="text-xs sm:text-sm"
              >
                <ArrowLeft className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
                Manual
              </Button>
            )}
            <Button
              onClick={generateFinalAction}
              disabled={messages.length === 0 || isLoading}
              size="sm"
              className="text-xs sm:text-sm flex-1"
            >
              Generează Acțiune
            </Button>
          </div>
        </CardFooter>
      </Card>

      <StackIdeaModal
        isOpen={isIdeaModalOpen}
        onClose={closeIdeaModal}
        onAddToHitList={onAddToHitList}
      />
    </div>
  );
};