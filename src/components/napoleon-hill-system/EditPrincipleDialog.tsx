import React, { useState, useRef, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
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

interface Message {
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

interface EditPrincipleDialogProps {
  isOpen: boolean;
  onClose: () => void;
  project: NapoleonHillProject;
  principle: number;
  principleName: string;
  existingAnswer: string;
  onSave: (principle: number, answer: any, summary: string, actions: any[]) => void;
}

export const EditPrincipleDialog: React.FC<EditPrincipleDialogProps> = ({
  isOpen,
  onClose,
  project,
  principle,
  principleName,
  existingAnswer,
  onSave
}) => {
  const { toast } = useToast();
  const [messages, setMessages] = useState<Message[]>([]);
  const [currentMessage, setCurrentMessage] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const chatAreaRef = useRef<HTMLDivElement>(null);

  // Napoleon Hill System Prompt
  const systemPrompt = `Ești un ghid AI bazat pe principiile lui Napoleon Hill din "Think and Grow Rich". 
  
Rolul tău este să ghidezi utilizatorul prin Principiul ${principle}: "${principleName}".

Folosește întrebări profunde care stimulează reflecția și claritatea. Ajută utilizatorul să exploreze în profunzime acest principiu și să-l aplice la obiectivul său specific: "${project.goal_description}".

Răspunde în română, cu empatie și înțelepciune. Fii concis dar profund.`;

  // Voice input integration
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
    systemPrompt
  });

  const scrollToBottom = () => {
    if (chatAreaRef.current) {
      chatAreaRef.current.scrollTop = chatAreaRef.current.scrollHeight;
    }
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isProcessing]);

  // Load existing conversation when dialog opens
  useEffect(() => {
    if (isOpen && existingAnswer) {
      // Parse existing conversation
      const conversationLines = existingAnswer.split('\n\n');
      const parsedMessages: Message[] = conversationLines
        .filter(line => line.trim())
        .map(line => {
          const isUser = line.startsWith('Tu:');
          const content = line.replace(/^(Tu|AI): /, '');
          return {
            role: (isUser ? 'user' : 'assistant') as 'user' | 'assistant',
            content,
            timestamp: new Date()
          };
        });
      
      setMessages(parsedMessages);
    }
  }, [isOpen, existingAnswer]);

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

  const handleSaveEdited = async () => {
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
      
      try {
        const jsonMatch = aiResponse.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          const parsed = JSON.parse(jsonMatch[0]);
          const summary = parsed.summary || aiResponse.substring(0, 200);
          const actions = parsed.actions || [];

          onSave(
            principle,
            fullConversation,
            summary,
            actions.map((action: string) => ({ action, completed: false }))
          );
          
          toast({
            title: "✅ Principiu actualizat!",
            description: "Modificările au fost salvate cu succes."
          });
          
          onClose();
        } else {
          throw new Error('No JSON found');
        }
      } catch (parseError) {
        onSave(
          principle,
          fullConversation,
          aiResponse.substring(0, 200),
          []
        );
        
        toast({
          title: "✅ Principiu actualizat!",
          description: "Modificările au fost salvate."
        });
        
        onClose();
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
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3">
            <span>Editează Principiul {principle}: {principleName}</span>
            <PrincipleProgressRing 
              messageCount={messages.length}
              size={60}
            />
          </DialogTitle>
          <DialogDescription>
            Continuă conversația pentru a îmbunătăți și clarifica răspunsurile tale.
          </DialogDescription>
        </DialogHeader>

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

          <div className="flex gap-2 justify-end">
            <Button 
              onClick={onClose}
              variant="outline"
              disabled={isProcessing}
            >
              Anulează
            </Button>
            <Button 
              onClick={handleSaveEdited} 
              disabled={isProcessing || messages.length < 2}
              variant="default"
            >
              {isProcessing ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Salvez...
                </>
              ) : (
                <>
                  <Lightbulb className="w-4 h-4 mr-2" />
                  Salvează Modificările
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};