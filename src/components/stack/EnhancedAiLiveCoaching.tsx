import React, { useState, useRef, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { AiLiveCoachingExplanation } from './AiLiveCoachingExplanation';
import { useToast } from "@/hooks/use-toast";
import { useStackTodoIntegration } from "@/hooks/useStackTodoIntegration";
import { StackIdeaModal } from "./StackIdeaModal";
import { StackResetConfirmation } from "./StackResetConfirmation";
import { StackProgressIndicator } from "./StackProgressIndicator";
import { supabase } from "@/integrations/supabase/client";
import { saveToStackLibrary } from "@/utils/stackProgress";
import { Send, PlusCircle, Lightbulb, MessageCircle, AlertTriangle } from "lucide-react";
import { v4 as uuidv4 } from 'uuid';
import { SuggestionPickerModal } from './SuggestionPickerModal';
import { useVoiceInput } from '@/hooks/useVoiceInput';
import { VoiceInputButton } from './VoiceInputButton';

interface AiLiveCoachingProps {
  onAddToHitList?: (action: string) => void;
}

interface Message {
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

export const EnhancedAiLiveCoaching: React.FC<AiLiveCoachingProps> = ({ onAddToHitList }) => {
  const { toast } = useToast();
  const [sessionId] = useState(() => uuidv4());
  const [mode, setMode] = useState<'chat' | 'complete'>('chat');
  const [systemPrompt] = useState(`Ești un coach profesionist AI care ajută oamenii să depășească provocările din viața lor. 

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
  const [showResetConfirmation, setShowResetConfirmation] = useState(false);
  const [lastSaveTime, setLastSaveTime] = useState<Date | null>(null);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [isSuggestionsOpen, setIsSuggestionsOpen] = useState(false);
  const chatAreaRef = useRef<HTMLDivElement>(null);
  
  // Voice input integration
  const handleVoiceTranscript = async (text: string) => {
    const userMessage: Message = {
      role: 'user',
      content: text,
      timestamp: new Date()
    };
    
    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    setIsLoading(true);

    try {
      const { data, error } = await supabase.functions.invoke('ai-live-coaching', {
        body: {
          messages: newMessages.map(msg => ({
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
        description: "Nu am putut trimite mesajul. Te rugăm să încerci din nou.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  const {
    isConnected,
    isMicOn,
    isAISpeaking,
    toggleMic
  } = useVoiceInput({
    onTranscript: handleVoiceTranscript,
    systemPrompt,
    enabled: mode === 'chat'
  });
  
  const scrollToBottom = () => {
    if (chatAreaRef.current) {
      chatAreaRef.current.scrollTop = chatAreaRef.current.scrollHeight;
    }
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  // Add welcome message when component mounts
  useEffect(() => {
    if (messages.length === 0) {
      const welcomeMessage: Message = {
        role: 'assistant',
        content: 'Bună ziua! Sunt AI coach-ul tău personal și sunt aici să te ajut să găsești soluții pentru provocările din viața ta. Să începem - ce situație sau provocare te aduce astăzi aici? Spune-mi despre ceea ce te preocupă.',
        timestamp: new Date()
      };
      setMessages([welcomeMessage]);
    }
  }, []);

  // Auto-save session
  useEffect(() => {
    if (messages.length > 1) {
      const saveData = {
        sessionId,
        messages,
        timestamp: new Date().toISOString()
      };
      
      localStorage.setItem(`ai-coaching-session-${sessionId}`, JSON.stringify(saveData));
      setLastSaveTime(new Date());
    }
  }, [messages, sessionId]);
  
  const {
    isIdeaModalOpen,
    closeIdeaModal,
    captureIdea
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

      // Save session to Stack Library (Arsenal)
      try {
        const questions: string[] = [...messages.map((m, i) => `Mesaj ${i + 1} (${m.role})`), 'Acțiune finală'];
        const answers: Record<string | number, string> = {};
        messages.forEach((m, i) => { answers[i] = m.content; });
        answers[questions.length - 1] = data.message;
        await saveToStackLibrary('ai', sessionId, answers, questions);
      } catch (e) {
        console.error('Failed to save AI coaching session to Stack Library:', e);
      }
      
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
    if (finalAction) {
      captureIdea(finalAction, 'hot', 'important');
      setFinalAction("");
    }
  };

  const handleResetClick = () => {
    setShowResetConfirmation(true);
  };

  const handleConfirmReset = () => {
    setMode('chat');
    setCurrentMessage("");
    setFinalAction("");
    
    // Clear session storage
    localStorage.removeItem(`ai-coaching-session-${sessionId}`);
    
    // Add fresh welcome message
    const welcomeMessage: Message = {
      role: 'assistant',
      content: 'Bună ziua! Sunt AI coach-ul tău personal și sunt aici să te ajut să găsești soluții pentru provocările din viața ta. Să începem - ce situație sau provocare te aduce astăzi aici? Spune-mi despre ceea ce te preocupă.',
      timestamp: new Date()
    };
    setMessages([welcomeMessage]);
    setShowResetConfirmation(false);
  };

  const createBackup = () => {
    const backupData = {
      sessionId,
      messages,
      finalAction,
      timestamp: new Date().toISOString()
    };
    
    const backupKey = `ai-coaching-backup-${Date.now()}`;
    localStorage.setItem(backupKey, JSON.stringify(backupData));
    
    toast({
      title: "Backup creat",
      description: "Sesiunea curentă a fost salvată ca backup.",
    });
  };

  const generateActionSuggestions = async () => {
    setIsLoading(true);
    try {
      const prompt = 'Pe baza conversației de mai sus, propune 3-5 acțiuni concrete, foarte scurte (max 140 caractere fiecare). Răspunde DOAR ca un JSON array de string-uri.';
      const { data, error } = await supabase.functions.invoke('ai-live-coaching', {
        body: {
          messages: [...messages, { role: 'user', content: prompt }],
          systemPrompt: 'Ești un expert în generarea de opțiuni de acțiuni scurte și acționabile.'
        }
      });
      if (error) throw error;
      let list: string[] = [];
      try {
        list = JSON.parse(data.message);
      } catch {
        list = String(data.message)
          .split(/\n+/)
          .map((l: string) => l.replace(/^[-*]?\s*\d*\.?\s*/, ''))
          .filter(Boolean)
          .slice(0, 5);
      }
      setSuggestions(list);
      setIsSuggestionsOpen(true);
    } catch (e) {
      console.error('Error generating suggestions:', e);
      toast({ title: 'Eroare', description: 'Nu am putut genera sugestii acum.', variant: 'destructive' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelectSuggestion = (s: string) => {
    captureIdea(s, 'hot', 'important');
    setIsSuggestionsOpen(false);
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
              onClick={handleResetClick}
              size="sm"
              className="text-xs sm:text-sm"
            >
              <AlertTriangle className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
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
      ) : (
        <div className="w-full p-1 sm:p-2 flex flex-col h-full">
          {/* Progress indicator */}
          <div className="mb-4">
            <StackProgressIndicator
              currentStep={messages.length}
              totalSteps={20} // Estimate for conversation length
              stackType="AI Live Coaching"
              lastSaveTime={lastSaveTime}
              unsavedChanges={false}
            />
          </div>

          <div 
            ref={chatAreaRef}
            className="flex-1 mb-2 overflow-y-auto bg-background/30 rounded border p-2 scroll-smooth"
            style={{ maxHeight: 'calc(100vh - 300px)' }}
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
          
          <div className="space-y-2">
            <div className="mb-2">
              <h1 className="text-lg sm:text-xl font-semibold text-green-400 mb-1">
                <MessageCircle className="w-4 h-4 sm:w-5 sm:h-5 inline mr-2" />
                AI Live Coaching
              </h1>
              <p className="text-xs sm:text-sm text-muted-foreground">
                Conversie ({messages.length} mesaje)
              </p>
            </div>
            
            <div className="flex gap-2">
              <Textarea 
                placeholder="Scrie mesajul tău aici... sau apasă pe microfon pentru a vorbi"
                className="min-h-[60px] flex-1 text-sm"
                value={currentMessage}
                onChange={(e) => setCurrentMessage(e.target.value)}
                onEnterSubmit={sendMessage}
                disabled={isLoading}
              />
              <div className="flex gap-1">
                <VoiceInputButton
                  isConnected={isConnected}
                  isMicOn={isMicOn}
                  isAISpeaking={isAISpeaking}
                  onToggle={toggleMic}
                  variant="compact"
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
            </div>

            <div className="flex items-center justify-between gap-2">
              <Button 
                variant="outline" 
                onClick={handleResetClick}
                size="sm"
                className="text-xs sm:text-sm"
              >
                <AlertTriangle className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
                Resetează sesiunea
              </Button>
              <div className="flex gap-2">
                <Button 
                  onClick={generateActionSuggestions}
                  disabled={isLoading || messages.length < 2}
                  size="sm"
                  className="text-xs sm:text-sm"
                >
                  <PlusCircle className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
                  Sugestii (2–5)
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
          </div>
        </div>
      )}

      {/* Reset Confirmation Dialog */}
      <StackResetConfirmation
        isOpen={showResetConfirmation}
        onClose={() => setShowResetConfirmation(false)}
        onConfirm={handleConfirmReset}
        onCreateBackup={createBackup}
        stackType="AI Live Coaching"
        currentStep={messages.length}
        totalSteps={20}
        hasAnswers={messages.length > 1}
      />

      <StackIdeaModal
        isOpen={isIdeaModalOpen}
        onClose={closeIdeaModal}
        onAddToHitList={onAddToHitList}
      />

      <SuggestionPickerModal
        isOpen={isSuggestionsOpen}
        onClose={() => setIsSuggestionsOpen(false)}
        suggestions={suggestions}
        onSelect={handleSelectSuggestion}
      />
    </div>
  );
};