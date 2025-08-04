import React, { useState, useRef, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AiLiveCoachingExplanation } from './AiLiveCoachingExplanation';
import { useToast } from "@/hooks/use-toast";
import { useStackTodoIntegration } from "@/hooks/useStackTodoIntegration";
import { StackIdeaModal } from "./StackIdeaModal";
import { supabase } from "@/integrations/supabase/client";
import { Send, PlusCircle, Lightbulb, Settings, MessageCircle } from "lucide-react";

interface AiLiveCoachingProps {
  onAddToHitList?: (action: string) => void;
}

interface Message {
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

export const AiLiveCoaching: React.FC<AiLiveCoachingProps> = ({ onAddToHitList }) => {
  const { toast } = useToast();
  const [mode, setMode] = useState<'setup' | 'chat' | 'complete'>('setup');
  const [systemPrompt, setSystemPrompt] = useState(`Ești un coach profesionist AI care ajută oamenii să depășească provocările din viața lor. 

Rolul tău este să:
- Asculți activ și să înțelegi situația utilizatorului
- Pui întrebări care stimulează reflecția și claritatea
- Ghidezi utilizatorul către soluții practice și realizabile
- Ajuți la identificarea obstacolelor și resurselor disponibile
- Propui acțiuni concrete și măsurabile

Răspunde în română și folosește un ton empatic, profesionist și încurajator. Fii concis dar profund în răspunsuri.`);
  const [messages, setMessages] = useState<Message[]>([]);
  const [currentMessage, setCurrentMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [finalAction, setFinalAction] = useState("");
  const chatAreaRef = useRef<HTMLDivElement>(null);
  
  const scrollToBottom = () => {
    if (chatAreaRef.current) {
      chatAreaRef.current.scrollTop = chatAreaRef.current.scrollHeight;
    }
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);
  
  const {
    isIdeaModalOpen,
    openIdeaModal,
    closeIdeaModal
  } = useStackTodoIntegration({ onAddToHitList });

  const sendMessage = async () => {
    if (!currentMessage.trim()) {
      toast({
        title: "Mesaj necesar",
        description: "Te rugăm să scrii un mesaj înainte de a-l trimite.",
        variant: "destructive",
      });
      return;
    }

    const userMessage: Message = {
      role: 'user',
      content: currentMessage,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setCurrentMessage("");
    setIsLoading(true);

    try {
      const { data, error } = await supabase.functions.invoke('ai-live-coaching', {
        body: {
          messages: [...messages, userMessage].map(m => ({
            role: m.role,
            content: m.content
          })),
          systemPrompt
        }
      });

      if (error) throw error;

      const aiMessage: Message = {
        role: 'assistant',
        content: data.message,
        timestamp: new Date()
      };

      setMessages(prev => [...prev, aiMessage]);
    } catch (error) {
      console.error('Error sending message:', error);
      toast({
        title: "Eroare",
        description: "Nu am putut trimite mesajul. Te rugăm să încerci din nou.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const generateFinalAction = async () => {
    setIsLoading(true);
    try {
      const actionPrompt = `Bazându-te pe conversația de mai sus, generează o acțiune concretă, specifică și măsurabilă pe care utilizatorul o poate lua în următoarele 24-48 de ore pentru a avansa către soluționarea provocării sale. Acțiunea să fie clară, practică și direct implementabilă. Răspunde DOAR cu acțiunea, fără explicații suplimentare.`;

      const { data, error } = await supabase.functions.invoke('ai-live-coaching', {
        body: {
          messages: [...messages, {
            role: 'user',
            content: actionPrompt
          }],
          systemPrompt: "Ești un expert în generarea de acțiuni concrete și măsurabile."
        }
      });

      if (error) throw error;

      setFinalAction(data.message);
      setMode('complete');
      
      toast({
        title: "Sesiune finalizată",
        description: "A fost generată o acțiune concretă bazată pe conversație.",
      });
    } catch (error) {
      console.error('Error generating action:', error);
      toast({
        title: "Eroare",
        description: "Nu am putut genera acțiunea finală. Te rugăm să încerci din nou.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const addToHitList = () => {
    if (onAddToHitList && finalAction) {
      onAddToHitList(finalAction);
      setFinalAction("");
    }
  };

  const resetSession = () => {
    setMode('setup');
    setMessages([]);
    setCurrentMessage("");
    setFinalAction("");
  };

  const startChat = () => {
    if (!systemPrompt.trim()) {
      toast({
        title: "Prompt necesar",
        description: "Te rugăm să configurezi instrucțiunile pentru AI înainte de a începe.",
        variant: "destructive",
      });
      return;
    }
    setMode('chat');
  };

  return (
    <div className="w-full h-full flex flex-col">
      {mode === 'complete' ? (
        <div className="w-full p-2 sm:p-4 flex flex-col justify-end h-full">
          <div className="mb-4">
            <h1 className="text-lg sm:text-xl font-semibold text-green-400 mb-2">
              Acțiune Finală Generată
            </h1>
            
            <div className="p-3 bg-background/50 rounded border-l-4 border-green-500 mb-4">
              <p className="text-sm sm:text-base text-foreground">{finalAction}</p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-2">
            <Button 
              variant="outline" 
              onClick={resetSession}
              size="sm"
              className="text-xs sm:text-sm"
            >
              Începe o nouă sesiune
            </Button>
            <Button 
              onClick={addToHitList}
              size="sm"
              className="text-xs sm:text-sm"
            >
              <PlusCircle className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
              Adaugă la lista HIT
            </Button>
          </div>
        </div>
      ) : mode === 'setup' ? (
        <div className="w-full p-2 sm:p-4 flex flex-col justify-end h-full">
          <AiLiveCoachingExplanation />
          
          <div className="mb-4">
            <h1 className="text-lg sm:text-xl font-semibold text-green-400 mb-2">
              <Settings className="w-4 h-4 sm:w-5 sm:h-5 inline mr-2" />
              Configurare AI Coach
            </h1>
          </div>

          <div className="mb-4">
            <Label htmlFor="system-prompt" className="text-sm font-medium text-foreground mb-2 block">
              Instrucțiuni pentru AI Coach
            </Label>
            <Textarea 
              id="system-prompt"
              placeholder="Configurează cum vrei să se comporte AI coach-ul..."
              className="min-h-[120px] sm:min-h-[150px] w-full text-sm"
              value={systemPrompt}
              onChange={(e) => setSystemPrompt(e.target.value)}
            />
            <p className="text-xs text-muted-foreground mt-1">
              Aceste instrucțiuni vor ghida comportamentul AI coach-ului pe parcursul conversației.
            </p>
          </div>

          <Button 
            onClick={startChat}
            className="w-full"
            size="sm"
          >
            <MessageCircle className="w-4 h-4 mr-2" />
            Începe Sesiunea de Coaching
          </Button>
        </div>
      ) : (
        <div className="w-full p-1 sm:p-2 flex flex-col h-full">
          <div className="mb-2">
            <h1 className="text-lg sm:text-xl font-semibold text-green-400 mb-1">
              <MessageCircle className="w-4 h-4 sm:w-5 sm:h-5 inline mr-2" />
              AI Live Coaching
            </h1>
            <p className="text-xs sm:text-sm text-muted-foreground">
              Conversie ({messages.length} mesaje)
            </p>
          </div>

          <div 
            ref={chatAreaRef}
            className="flex-1 mb-2 overflow-y-auto bg-background/30 rounded border p-2 scroll-smooth"
            style={{ maxHeight: 'calc(100vh - 200px)' }}
          >
            {messages.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4">
                Începe conversația scriind primul tău mesaj mai jos...
              </p>
            ) : (
              messages.map((message, index) => (
                <div key={index} className={`mb-3 ${message.role === 'user' ? 'text-right' : 'text-left'}`}>
                  <div className={`inline-block max-w-[80%] p-2 rounded text-sm ${
                    message.role === 'user' 
                      ? 'bg-primary text-primary-foreground' 
                      : 'bg-secondary text-secondary-foreground'
                  }`}>
                    <p>{message.content}</p>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    {message.timestamp.toLocaleTimeString()}
                  </p>
                </div>
              ))
            )}
            {isLoading && (
              <div className="text-left">
                <div className="inline-block bg-secondary text-secondary-foreground p-2 rounded text-sm">
                  AI coach-ul scrie...
                </div>
              </div>
            )}
          </div>
          
          <div className="mb-2 flex gap-2">
            <Textarea 
              placeholder="Scrie mesajul tău aici..."
              className="min-h-[60px] flex-1 text-sm"
              value={currentMessage}
              onChange={(e) => setCurrentMessage(e.target.value)}
              onEnterSubmit={sendMessage}
              disabled={isLoading}
            />
            <Button 
              onClick={sendMessage}
              disabled={isLoading || !currentMessage.trim()}
              size="sm"
              className="px-3"
            >
              <Send className="w-4 h-4" />
            </Button>
          </div>

          <div className="flex gap-2 justify-between">
            <Button 
              variant="outline" 
              onClick={resetSession}
              size="sm"
              className="text-xs sm:text-sm"
            >
              Resetează sesiunea
            </Button>
            <Button 
              onClick={generateFinalAction}
              disabled={isLoading || messages.length < 2}
              size="sm"
              className="text-xs sm:text-sm"
            >
              <Lightbulb className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
              Generează acțiune finală
            </Button>
          </div>
        </div>
      )}

      <StackIdeaModal
        isOpen={isIdeaModalOpen}
        onClose={closeIdeaModal}
        onAddToHitList={onAddToHitList}
      />
    </div>
  );
};
