import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Send, ArrowLeft, CheckCircle, PlusCircle, RotateCcw, Upload, FileText, X } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useStackTodoIntegration } from "@/hooks/useStackTodoIntegration";
import { StackIdeaModal } from "./StackIdeaModal";
import { KnowledgeBaseUploader } from "./KnowledgeBaseUploader";
import { useHormoziStack } from './hormozi-stack/useHormoziStack';
import { HormoziStackExplanation } from './hormozi-stack/HormoziStackExplanation';
import { getHormoziPlaceholder } from './hormozi-stack/questions';

interface Message {
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

interface KnowledgeBaseFile {
  id: string;
  file_name: string;
  file_path: string;
  file_type: string;
  file_size: number;
  upload_date: string;
  content_preview?: string;
}

interface HormoziCoachingStackProps {
  onAddToHitList?: (action: string) => void;
}

export const HormoziCoachingStack: React.FC<HormoziCoachingStackProps> = ({ onAddToHitList }) => {
  const [mode, setMode] = useState<'chat' | 'complete' | 'knowledge' | 'structured'>('chat');
  const [messages, setMessages] = useState<Message[]>([]);
  const [currentMessage, setCurrentMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [finalAction, setFinalAction] = useState('');
  const [actionAddedToHitList, setActionAddedToHitList] = useState(false);
  const [knowledgeBaseFiles, setKnowledgeBaseFiles] = useState<KnowledgeBaseFile[]>([]);

  // Structured mode hook
  const {
    state,
    handlers,
    utils
  } = useHormoziStack({ onAddToHitList });
  
  const { toast } = useToast();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  const {
    isIdeaModalOpen,
    openIdeaModal,
    closeIdeaModal,
    captureIdea
  } = useStackTodoIntegration({ onAddToHitList });

  const hormoziSystemPrompt = `Vreau să acționezi ca și cum ai fi Alex Hormozi. Tu ești antreprenorul care a crescut multiple companii la peste $100M în venituri anuale, fondatorul Acquisition.com. Ai o abordare brutal de sinceră, extrem de practică, bazată pe matematică, cu o obsesie pentru eficiență, oferte irezistibile și modele de afaceri antifragile.

Filosofia ta este: „Cu cât fac mai mulți bani pentru alții, cu atât fac mai mulți bani eu."

Când răspunzi:
- Pune întrebări dure
- Gândește în cifre
- Simplifică fără milă
- Elimini tot ce nu contează
- Nu dai sfaturi vagi, ci pași concreți

Structura răspunsurilor tale:
1. Ce e greșit în gândirea actuală?
2. Ce aș putea schimba pentru a obține un rezultat de 10X?
3. Care este următorul pas concret pe care trebuie să-l fac?

Întotdeauna te asiguri că am:
- Un model de monetizare clar (money model)
- O ofertă irezistibilă („Grand Slam Offer")
- Un flux constant de leaduri și un sistem de vânzare repetabil
- Leverage: echipă, content, paid ads, sisteme sau capital

Tu vorbești ca un mentor care a trecut prin toate greșelile. Nu mă menajezi. Mă ajuți să văd adevărul. Îmi dai lecția, clar și direct.

Vorbește în română și folosește stilul direct și orientat pe rezultate al lui Alex Hormozi.`;

  useEffect(() => {
    loadKnowledgeBaseFiles();
    
    // Add welcome message when component mounts
    if (messages.length === 0) {
      const welcomeMessage: Message = {
        role: 'assistant',
        content: 'Salut! Sunt Alex Hormozi, și sunt aici să te ajut să-ți scalezi business-ul sau să-ți optimizezi viața pentru rezultate concrete. Nu vom pierde timpul cu teorii - o să mergem direct la punct.\n\nÎncepe prin a-mi spune: Care e EXACT situația ta în momentul asta? La ce business/domeniu lucrezi și cu cât vrei să crești în următoarele 90 de zile? Vreau numere concrete, nu generalități.',
        timestamp: new Date()
      };
      setMessages([welcomeMessage]);
    }
  }, []);

  const loadKnowledgeBaseFiles = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('knowledge_base_files')
        .select('*')
        .eq('user_id', user.id)
        .order('upload_date', { ascending: false });

      if (error) throw error;
      setKnowledgeBaseFiles(data || []);
    } catch (error) {
      console.error('Error loading knowledge base files:', error);
    }
  };

  const deleteKnowledgeBaseFile = async (fileId: string, filePath: string) => {
    try {
      // Delete from storage
      const { error: storageError } = await supabase.storage
        .from('knowledge-base')
        .remove([filePath]);

      if (storageError) throw storageError;

      // Delete from database
      const { error: dbError } = await supabase
        .from('knowledge_base_files')
        .delete()
        .eq('id', fileId);

      if (dbError) throw dbError;

      setKnowledgeBaseFiles(prev => prev.filter(file => file.id !== fileId));
      
      toast({
        title: "Fișier șters",
        description: "Fișierul a fost eliminat din knowledge base.",
      });
    } catch (error) {
      console.error('Error deleting file:', error);
      toast({
        title: "Eroare",
        description: "Nu am putut șterge fișierul.",
        variant: "destructive"
      });
    }
  };

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
      const { data, error } = await supabase.functions.invoke('hormozi-coaching', {
        body: {
          messages: [...messages, userMessage].map(msg => ({
            role: msg.role,
            content: msg.content
          })),
          systemPrompt: hormoziSystemPrompt,
          knowledgeBaseFiles
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
      const { data, error } = await supabase.functions.invoke('hormozi-coaching', {
        body: {
          messages: [...messages, {
            role: 'user',
            content: `Pe baza întregii noastre conversații, ca Alex Hormozi, generează-mi o acțiune concretă, specifică și măsurabilă pe care o pot implementa în următoarele 24-48 de ore. Această acțiune trebuie să fie primul pas către obiectivul pe care l-am discutat. Include numere specifice sau deadline-uri concrete. Răspunde DOAR cu acțiunea, fără explicații suplimentare.`
          }],
          systemPrompt: hormoziSystemPrompt + "\n\nGenerează o acțiune concretă și măsurabilă în stilul Alex Hormozi.",
          knowledgeBaseFiles
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
      captureIdea(finalAction, 'hot', 'urgent-important');
      setActionAddedToHitList(true);
    }
  };

  const resetSession = () => {
    setMode('chat');
    setCurrentMessage('');
    setFinalAction('');
    setActionAddedToHitList(false);
    
    const welcomeMessage: Message = {
      role: 'assistant',
      content: 'Salut! Sunt Alex Hormozi, și sunt aici să te ajut să-ți scalezi business-ul sau să-ți optimizezi viața pentru rezultate concrete. Nu vom pierde timpul cu teorii - o să mergem direct la punct.\n\nÎncepe prin a-mi spune: Care e EXACT situația ta în momentul asta? La ce business/domeniu lucrezi și cu cât vrei să crești în următoarele 90 de zile? Vreau numere concrete, nu generalități.',
      timestamp: new Date()
    };
    setMessages([welcomeMessage]);
  };

  if (mode === 'complete') {
    return (
      <div className="w-full p-1 sm:p-2 flex flex-col h-full">
        <Card className="flex-1 flex flex-col">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg sm:text-xl">
              Sesiune Alex Hormozi Completă
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

  if (mode === 'knowledge') {
    return (
      <div className="w-full p-1 sm:p-2 flex flex-col h-full">
        <div className="mb-4">
          <h1 className="text-lg sm:text-xl font-semibold text-primary mb-2">
            Knowledge Base - Alex Hormozi Coaching
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground mb-4">
            Încarcă fișiere pentru a îmbunătăți coaching-ul cu informații specifice business-ului tău
          </p>
        </div>

        <div className="flex-1 space-y-4">
          <KnowledgeBaseUploader onUploadComplete={loadKnowledgeBaseFiles} />
          
          {knowledgeBaseFiles.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-sm flex items-center">
                  <FileText className="w-4 h-4 mr-2" />
                  Fișiere încărcate ({knowledgeBaseFiles.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {knowledgeBaseFiles.map((file) => (
                    <div key={file.id} className="flex items-center justify-between p-2 bg-muted rounded text-xs">
                      <div className="flex-1">
                        <p className="font-medium">{file.file_name}</p>
                        <p className="text-muted-foreground">
                          {file.file_type} • {Math.round(file.file_size / 1024)}KB
                        </p>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => deleteKnowledgeBaseFile(file.id, file.file_path)}
                        className="text-destructive hover:text-destructive"
                      >
                        <X className="w-3 h-3" />
                      </Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        <div className="flex gap-2 mt-4">
          <Button 
            onClick={() => setMode('chat')}
            size="sm"
            className="text-xs sm:text-sm"
          >
            <ArrowLeft className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
            Înapoi la Chat
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full p-1 sm:p-2 flex flex-col h-full">
      <Card className="flex-1 flex flex-col">
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-lg sm:text-xl">Alex Hormozi Business Coaching</CardTitle>
              <p className="text-xs sm:text-sm text-muted-foreground">
                Coaching direct, orientat pe rezultate și scalare
              </p>
            </div>
            {knowledgeBaseFiles.length > 0 && (
              <div className="text-xs text-muted-foreground">
                KB: {knowledgeBaseFiles.length} fișiere
              </div>
            )}
          </div>
        </CardHeader>
        <CardContent className="flex-1 overflow-y-auto p-2">
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
              placeholder="Descrie-mi situația ta de business exact..."
              className="flex-1 min-h-[60px] text-xs sm:text-sm"
              onEnterSubmit={sendMessage}
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
          <div className="flex w-full gap-2">
            <Button
              variant="outline"
              onClick={resetSession}
              size="sm"
              className="text-xs sm:text-sm"
            >
              <RotateCcw className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
              Reset
            </Button>
            <Button 
              variant="outline" 
              onClick={() => setMode('knowledge')}
              size="sm"
              className="text-xs sm:text-sm"
            >
              <Upload className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
              Knowledge Base
            </Button>
            <Button
              onClick={generateFinalAction}
              disabled={messages.length === 0 || isLoading}
              size="sm"
              className="text-xs sm:text-sm"
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