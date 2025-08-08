import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Send, ArrowLeft, CheckCircle, PlusCircle, RotateCcw } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useStackTodoIntegration } from "@/hooks/useStackTodoIntegration";
import { StackIdeaModal } from "./StackIdeaModal";

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
  
  const { toast } = useToast();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  const {
    isIdeaModalOpen,
    openIdeaModal,
    closeIdeaModal,
    captureIdea
  } = useStackTodoIntegration({ onAddToHitList });

  const getStackPrompt = () => {
    if (stackType === 'anger') {
      return `Ești un coach AI pragmatic pentru gestionarea furiei.
Ton: ferm, sobru, profesionist. Fără clișee, fără metafore gratuite, fără diminutive, fără emoji. Fraze scurte. Oferă direcție, nu mângâieri verbale. Evită formule sterile (ex. „mulțumesc că ai împărtășit”).
Obiectiv: claritate și o acțiune specifică de făcut azi.

ÎNTREBĂRI GHID:
${questions.map((q, i) => `${i + 1}. ${q}`).join('\n')}

PROCES:
1) Numește stack-ul și domeniul CORE 4.
2) Separă faptele de povești/interpretări.
3) Clarifică emoțiile și nevoile.
4) Reîmparte responsabilitatea și opțiunile reale.
5) Distilează o acțiune concretă (SMART), realistă, pentru azi.

INSTRUCȚIUNI:
- Nu citi mecanic lista; adaptează conversația.
- Menține ritmul scurt și clar.
- Vorbește în română dacă utilizatorul o face.
- La final: propune o singură acțiune concretă, gata de executat.

Începe direct, fără politețuri inutile. Întreabă pe scurt ce situație i-a declanșat furia.`;
    } else {
      return `Ești un ghid spiritual AI cu rigoare și claritate.
Ton: calm, sobru, fără poezie gratuită, fără clișee, fără emoji. Fraze scurte. Oferă direcție clară, nu discurs.
Obiectiv: claritate și un pas concret de făcut azi.

ÎNTREBĂRI GHID:
${questions.map((q, i) => `${i + 1}. ${q}`).join('\n')}

PROCES:
1) Titlul stack-ului de rugăciune.
2) Situația exactă (fapte vs. interpretări).
3) „Doamne, vreau să știi că...” pentru cele 4 categorii.
4) „Ce vrei să văd/aud/simt/știu/fac?”
5) Distilează o acțiune concretă (SMART) pentru azi.

INSTRUCȚIUNI:
- Respectă credințele utilizatorului; nu judeca.
- Menține rigoare și claritate.
- Vorbește în română dacă utilizatorul o face.
- La final: o singură acțiune concretă, fără explicații lungi.

Începe simplu și direct: întreabă ce îl apasă acum, în cuvinte puține.`;
    }
  };

  useEffect(() => {
    setSystemPrompt(getStackPrompt());
    
    // Add welcome message when component mounts
    if (messages.length === 0) {
      const welcomeMessage: Message = {
        role: 'assistant',
        content: stackType === 'anger' 
          ? 'Intrăm direct. Spune pe scurt situația care ți-a declanșat furia. Voi ghida pas cu pas ca să obții claritate și o acțiune concretă.'
          : 'Intrăm în dialog cu liniște și rigoare. Într-o frază, spune exact ce te apasă. Te ghidez spre claritate și un pas concret.',
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
        ? 'Intrăm direct. Spune pe scurt situația care ți-a declanșat furia. Voi ghida pas cu pas ca să obții claritate și o acțiune concretă.'
        : 'Intrăm în dialog cu liniște și rigoare. Într-o frază, spune exact ce te apasă. Te ghidez spre claritate și un pas concret.',
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
            <CardTitle className="text-base sm:text-lg">
              Sesiune Completă — AI {stackType === 'anger' ? 'Alchimia Furiei' : 'Dialogul cu Divinitatea'}
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="p-3 bg-background/50 rounded border border-border">
              <p className="text-sm sm:text-base text-foreground">{finalAction}</p>
              {actionAddedToHitList && (
                <div className="flex items-center text-green-600 text-xs sm:text-sm mt-2">
                  <CheckCircle className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
                  Acțiunea a fost adăugată la lista ta fierbinte
                </div>
              )}
            </div>
          </CardContent>
          <CardFooter className="flex flex-wrap gap-2">
            <Button variant="outline" onClick={resetSession} size="sm" className="text-xs sm:text-sm">
              <RotateCcw className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
              Începe o nouă sesiune
            </Button>
            {onModeSwitch && (
              <Button variant="outline" onClick={onModeSwitch} size="sm" className="text-xs sm:text-sm">
                <ArrowLeft className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
                Mod Manual
              </Button>
            )}
            {!actionAddedToHitList && finalAction && (
              <Button onClick={addToHitList} size="sm" className="text-xs sm:text-sm">
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
      <Card className="flex-1 flex flex-col">
        <CardHeader className="pb-2">
          <CardTitle className="text-base sm:text-lg">
            AI {stackType === 'anger' ? 'Alchimia Furiei' : 'Dialogul cu Divinitatea'}
          </CardTitle>
          <p className="text-xs text-muted-foreground">Conversație ghidată. Ton sobru, orientat spre acțiune.</p>
        </CardHeader>
        <CardContent className="flex-1 overflow-y-auto pt-0">
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
              placeholder="Scrie mesajul tău aici..."
              className="flex-1 min-h-[60px] text-xs sm:text-sm"
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  sendMessage();
                }
              }}
            />
            <Button onClick={sendMessage} disabled={!currentMessage.trim() || isLoading} size="sm" className="px-3">
              <Send className="w-3 h-3 sm:w-4 sm:h-4" />
            </Button>
          </div>
          <div className="flex w-full flex-wrap gap-2">
            <Button variant="outline" onClick={resetSession} size="sm" className="text-xs sm:text-sm">
              <RotateCcw className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
              Reset
            </Button>
            {onModeSwitch && (
              <Button variant="outline" onClick={onModeSwitch} size="sm" className="text-xs sm:text-sm">
                <ArrowLeft className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
                Manual
              </Button>
            )}
            <Button onClick={generateFinalAction} disabled={messages.length === 0 || isLoading} size="sm" className="text-xs sm:text-sm">
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