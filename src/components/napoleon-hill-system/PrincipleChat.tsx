import React, { useState, useRef, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { NapoleonHillProject } from '@/services/napoleonHillProjectService';
import { Send, Loader2, Lightbulb } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useVoiceInput } from '@/hooks/useVoiceInput';
import { VoiceInputButton } from '../stack/VoiceInputButton';
import { TextToSpeechButton } from '@/components/ui/TextToSpeechButton';
import { PrincipleProgressRing } from './PrincipleProgressRing';
import { napoleonHillDraftService } from '@/services/napoleonHillDraftService';
import { napoleonHillBackupService } from '@/services/napoleonHillBackupService';

interface Message {
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

interface PrincipleChatProps {
  project: NapoleonHillProject;
  principle: number;
  principleName: string;
  onPrincipleComplete: (principle: number, answer: any, summary: string, actions: any[]) => void;
}

const PRINCIPLE_PROMPTS: Record<number, string> = {
  1: "Care este obiectivul tău specific și măsurabil? Descrie în detaliu ce vrei să realizezi.",
  2: "Ce te face să crezi că vei reuși? Descrie sursele tale de credință și încredere.",
  3: "Cum vei întări zilnic această convingere? Scrie afirmația ta zilnică.",
  4: "Ce cunoștințe îți lipsesc pentru a atinge acest obiectiv?",
  5: "Vizualizează succesul tău. Cum arată viața ta când ai realizat obiectivul?",
  6: "Care sunt pașii concreți pentru a realiza obiectivul? Creează un plan detaliat.",
  7: "Ce decizie fermă iei ACUM? Ce commitment faci?",
  8: "Ce obstacole anticipezi și cum le vei depăși?",
  9: "Cine poate să te susțină în această călătorie? Cine va fi în grupul tău Master Mind?",
  10: "Cum vei canaliza energia ta creativă către acest obiectiv?",
  11: "Ce convingeri limitatoare trebuie să schimbi?",
  12: "Cum vei menține focusul mental și claritatea gândirii?",
  13: "Ce îți spune intuiția despre acest obiectiv?",
  14: "Care este PRIMA acțiune pe care o vei face ASTĂZI?"
};

export const PrincipleChat: React.FC<PrincipleChatProps> = ({
  project,
  principle,
  principleName,
  onPrincipleComplete
}) => {
  const { toast } = useToast();
  const [messages, setMessages] = useState<Message[]>([]);
  const [currentMessage, setCurrentMessage] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [isDraftLoaded, setIsDraftLoaded] = useState(false);
  const chatAreaRef = useRef<HTMLDivElement>(null);
  const autoSaveTimerRef = useRef<NodeJS.Timeout | null>(null);
  
  const existingAnswer = project.principle_answers[principle];
  const existingSummary = project.principle_summaries[principle];

  // Napoleon Hill System Prompt
  const systemPrompt = `Ești un ghid AI bazat pe principiile lui Napoleon Hill din "Think and Grow Rich". 
  
Rolul tău este să ghidezi utilizatorul prin Principiul ${principle}: "${principleName}".

Folosește întrebări profunde care stimulează reflecția și claritatea. Ajută utilizatorul să exploreze în profunzime acest principiu și să-l aplice la obiectivul său specific: "${project.goal_description}".

Răspunde în română, cu empatie și înțelepciune. Fii concis dar profund.`;

  // Voice input integration - accumulate text instead of sending immediately
  const handleVoiceTranscript = (text: string) => {
    setCurrentMessage(prev => {
      const newText = prev ? `${prev} ${text}` : text;
      return newText;
    });
  };
  
  const {
    isConnected,
    isMicOn,
    isAISpeaking,
    isUserSpeaking,
    audioLevel,
    toggleMic
  } = useVoiceInput({
    onTranscript: handleVoiceTranscript,
    systemPrompt,
    enabled: !existingAnswer // Only enable voice if not completed
  });

  const scrollToBottom = () => {
    if (chatAreaRef.current) {
      chatAreaRef.current.scrollTop = chatAreaRef.current.scrollHeight;
    }
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isProcessing]);

  // Load draft when component mounts or principle changes
  useEffect(() => {
    const loadDraft = async () => {
      if (existingAnswer) {
        // Don't load draft if principle is already completed
        setIsDraftLoaded(true);
        return;
      }

      const draft = await napoleonHillDraftService.loadDraft(project.id, principle);
      
      if (draft && draft.length > 0) {
        // Restore draft conversation - ensure timestamps are Date objects
        const restoredMessages: Message[] = draft.map(msg => ({
          ...msg,
          timestamp: msg.timestamp instanceof Date ? msg.timestamp : new Date(msg.timestamp)
        }));
        setMessages(restoredMessages);
        toast({
          title: "💾 Draft restaurat",
          description: "Conversația ta a fost restaurată automat.",
        });
      } else {
        // Add welcome message for new principle
        const welcomeMessage: Message = {
          role: 'assistant',
          content: PRINCIPLE_PROMPTS[principle] || `Să explorăm Principiul ${principle}: ${principleName}. Cum îl aplici la obiectivul tău?`,
          timestamp: new Date()
        };
        setMessages([welcomeMessage]);
      }
      
      setIsDraftLoaded(true);
    };

    setIsDraftLoaded(false);
    setCurrentMessage('');
    loadDraft();
  }, [principle, principleName, existingAnswer, project.id]);

  // Auto-save draft whenever messages change
  useEffect(() => {
    if (!isDraftLoaded || existingAnswer || messages.length === 0) return;

    // Clear existing timer
    if (autoSaveTimerRef.current) {
      clearTimeout(autoSaveTimerRef.current);
    }

    // Set new timer for auto-save (debounced by 2 seconds)
    autoSaveTimerRef.current = setTimeout(async () => {
      const saved = await napoleonHillDraftService.saveDraft(project.id, principle, messages);
      if (saved) {
        console.log('✅ Draft auto-saved');
      }
    }, 2000);

    // Cleanup timer on unmount
    return () => {
      if (autoSaveTimerRef.current) {
        clearTimeout(autoSaveTimerRef.current);
      }
    };
  }, [messages, isDraftLoaded, existingAnswer, project.id, principle]);

  const sendMessageToAI = async (messageText: string) => {
    const userMessage: Message = {
      role: 'user',
      content: messageText,
      timestamp: new Date()
    };

    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    setIsProcessing(true);

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
        description: "Nu am putut trimite mesajul. Te rog încearcă din nou.",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const sendMessage = async () => {
    if (!currentMessage.trim()) return;
    await sendMessageToAI(currentMessage);
    setCurrentMessage("");
  };

  const handleCompletePrinciple = async () => {
    if (messages.length < 2) {
      toast({
        title: "Mai multe răspunsuri necesare",
        description: "Te rugăm să ai o conversație mai amplă înainte de a finaliza.",
        variant: "destructive"
      });
      return;
    }

    setIsProcessing(true);

    try {
      // Collect all user messages as the answer
      const fullConversation = messages.map(m => `${m.role === 'user' ? 'Tu' : 'AI'}: ${m.content}`).join('\n\n');

      // Generate AI summary and extract actions
      const { data, error } = await supabase.functions.invoke('ai-live-coaching', {
        body: {
          messages: [
            {
              role: 'user',
              content: `Bazat pe conversația despre Principiul "${principleName}" pentru proiectul Napoleon Hill:

${fullConversation}

Te rog să generezi:
1. Un sumar concis (2-3 propoziții) care să captureze esența înțelegerii utilizatorului despre acest principiu
2. 2-4 acțiuni concrete, măsurabile pe care utilizatorul le poate face pentru a aplica acest principiu

Răspunde în format JSON:
{
  "summary": "sumar aici...",
  "actions": ["acțiunea 1", "acțiunea 2", ...]
}`
            }
          ],
          systemPrompt: 'Tu ești un asistent AI care ajută la structurarea răspunsurilor utilizatorului în formate clare și acționabile. Răspunde doar în JSON.'
        }
      });

      if (error) throw error;

      let aiResponse = data.message;
      
      // Try to parse JSON from AI response
      try {
        const jsonMatch = aiResponse.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          const parsed = JSON.parse(jsonMatch[0]);
          const summary = parsed.summary || aiResponse.substring(0, 200);
          const actions = parsed.actions || [];

          // Delete draft after successful completion
          await napoleonHillDraftService.deleteDraft(project.id, principle);

          // Trigger auto-backup in background (non-blocking)
          napoleonHillBackupService.autoBackupIfNeeded().catch(err => 
            console.warn('Auto-backup failed:', err)
          );

          onPrincipleComplete(
            principle,
            fullConversation,
            summary,
            actions.map((action: string) => ({ action, completed: false }))
          );
        } else {
          throw new Error('No JSON found');
        }
      } catch (parseError) {
        // Delete draft even on fallback
        await napoleonHillDraftService.deleteDraft(project.id, principle);
        
        // Trigger auto-backup in background (non-blocking)
        napoleonHillBackupService.autoBackupIfNeeded().catch(err => 
          console.warn('Auto-backup failed:', err)
        );
        
        // Fallback if JSON parsing fails
        onPrincipleComplete(
          principle,
          fullConversation,
          aiResponse.substring(0, 200),
          []
        );
      }
    } catch (error) {
      console.error('Error processing principle:', error);
      toast({
        title: "Eroare",
        description: "Nu am putut procesa răspunsul. Te rog încearcă din nou.",
        variant: "destructive"
      });
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <Card className="p-6">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-xl font-bold text-foreground">
          Principiul {principle}: {principleName}
        </h3>
        {!existingAnswer && (
          <PrincipleProgressRing 
            messageCount={messages.length}
            isCompleted={false}
          />
        )}
      </div>

      {existingAnswer ? (
        <div className="space-y-4">
          <div className="p-4 bg-muted rounded-lg">
            <p className="text-sm text-muted-foreground mb-2">Conversația ta:</p>
            <p className="text-foreground whitespace-pre-wrap text-sm">{existingAnswer}</p>
          </div>
          
          {existingSummary && (
            <div className="p-4 bg-primary/10 border border-primary/20 rounded-lg">
              <p className="text-sm font-semibold text-primary mb-2">Sumar:</p>
              <p className="text-foreground">{existingSummary}</p>
            </div>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          <div 
            ref={chatAreaRef}
            className="mb-4 overflow-y-auto bg-background/30 rounded border p-3 scroll-smooth"
            style={{ maxHeight: '400px', minHeight: '200px' }}
          >
            {messages.map((message, index) => (
              <div key={index} className={`mb-3 ${message.role === 'user' ? 'text-right' : 'text-left'}`}>
                <div className={`inline-block max-w-[85%] p-3 rounded text-sm ${
                  message.role === 'user' 
                    ? 'bg-primary text-primary-foreground' 
                    : 'bg-secondary text-secondary-foreground'
                }`}>
                  <p className="whitespace-pre-wrap">{message.content}</p>
                  {message.role === 'assistant' && (
                    <div className="mt-2 flex justify-end">
                      <TextToSpeechButton 
                        text={message.content}
                        variant="ghost"
                        size="sm"
                      />
                    </div>
                  )}
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  {message.timestamp.toLocaleTimeString('ro-RO', { hour: '2-digit', minute: '2-digit' })}
                </p>
              </div>
            ))}
            {isProcessing && (
              <div className="text-left">
                <div className="inline-block bg-secondary text-secondary-foreground p-3 rounded text-sm">
                  <Loader2 className="w-4 h-4 inline animate-spin mr-2" />
                  AI-ul scrie...
                </div>
              </div>
            )}
          </div>

          <div className="flex gap-2">
            <Textarea 
              placeholder="Scrie mesajul tău aici sau folosește microfonul..."
              className="min-h-[80px] flex-1 text-sm"
              value={currentMessage}
              onChange={(e) => setCurrentMessage(e.target.value)}
              onEnterSubmit={sendMessage}
              disabled={isProcessing}
            />
            <div className="flex flex-col gap-1">
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
                disabled={isProcessing || !currentMessage.trim()}
                size="sm"
                className="px-3"
              >
                <Send className="w-4 h-4" />
              </Button>
            </div>
          </div>

          <Button 
            onClick={handleCompletePrinciple} 
            disabled={isProcessing || messages.length < 2}
            className="w-full"
            variant="default"
          >
            {isProcessing ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Procesez...
              </>
            ) : (
              <>
                <Lightbulb className="w-4 h-4 mr-2" />
                Finalizează Principiul {principle}
              </>
            )}
          </Button>
        </div>
      )}
    </Card>
  );
};
