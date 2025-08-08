import React, { useState, useEffect, useRef } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { useToast } from '@/hooks/use-toast';
import { GodsSchoolExplanation } from './GodsSchoolExplanation';
import { GodsSchoolStackProps } from './types';
import { Crown, Sparkles, RotateCcw, CheckCircle, Upload, Send } from 'lucide-react';
import { StackIdeaModal } from '../StackIdeaModal';
import { useStackTodoIntegration } from '@/hooks/useStackTodoIntegration';
import { KnowledgeBaseUploader } from '../KnowledgeBaseUploader';
import { supabase } from '@/integrations/supabase/client';
import { saveToStackLibrary, updateDailyProgress } from '@/utils/stackProgress';
import { useAICallOptimization } from '@/hooks/useAICallOptimization';

interface Message {
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

export const GodsSchoolStack: React.FC<GodsSchoolStackProps> = ({ onAddToHitList }) => {
  const { toast } = useToast();
  const [showExplanation, setShowExplanation] = useState(false);
  const [showKnowledgeBase, setShowKnowledgeBase] = useState(false);
  const [mode, setMode] = useState<'chat' | 'complete'>('chat');
  const [messages, setMessages] = useState<Message[]>([]);
  const [currentMessage, setCurrentMessage] = useState('');
  const { isLoading: isAILoading, executeAICall } = useAICallOptimization({
    debounceMs: 1000,
    maxRetries: 2
  });
  const [finalAction, setFinalAction] = useState('');
  const [actionAddedToHitList, setActionAddedToHitList] = useState(false);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  const { 
    isIdeaModalOpen, 
    currentIdea, 
    openIdeaModal, 
    closeIdeaModal, 
    captureIdea 
  } = useStackTodoIntegration({ onAddToHitList });

  const systemPrompt = `Ești un înțelept spiritual divin care ghidează oamenii bazându-te pe cartea sacră pe care au încărcat-o în biblioteca divină. Rolul tău este să:

- Folosești exclusiv înțelepciunea și principiile din cartea încărcată pentru a răspunde la întrebări
- Citezi și referențiezi pasaje specifice din carte
- Traduci învățăturile din carte în sfaturi practice și acțiuni concrete
- Creezi o experiență de învățare spirituală profundă
- La sfârșitul conversației, să distilezi o acțiune concretă bazată pe învățăturile din carte

Când utilizatorul îți pune o întrebare sau împărtășește o provocare:
1. Caută în cartea încărcată pasaje relevante
2. Explică cum se aplică aceste învățături la situația lor
3. Oferă ghidare spirituală bazată pe textul din carte
4. Sugerează practici sau acțiuni concrete din carte

Vorbește cu înțelepciune divină, fiind empatic și ghidator. Întreabă ce provocare spirituală sau întrebare au pentru care să căutăm răspunsuri în cartea lor sacră.`;

  useEffect(() => {
    if (messages.length === 0 && mode === 'chat') {
      const welcomeMessage: Message = {
        role: 'assistant',
        content: '🌟 Bine ai venit la Școala Zeilor! Sunt înțeleptul tău spiritual care va ghida această călătorie divină bazându-mă pe cartea sacră din biblioteca ta.\n\nCe provocare spirituală sau întrebare ai astăzi pentru care să căutăm împreună răspunsuri în înțelepciunea divină?',
        timestamp: new Date()
      };
      setMessages([welcomeMessage]);
    }
  }, [mode, messages.length]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isAILoading]);

  const sendMessage = async () => {
    if (!currentMessage.trim() || isAILoading) return;

    const userMessage: Message = {
      role: 'user',
      content: currentMessage,
      timestamp: new Date()
    };

    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    setCurrentMessage('');

    const aiCallResult = await executeAICall(
      () => supabase.functions.invoke('ai-live-coaching', {
        body: {
          messages: newMessages.map(msg => ({
            role: msg.role,
            content: msg.content
          })),
          systemPrompt
        }
      }),
      { messages: newMessages },
      {
        showLoadingToast: true,
        loadingMessage: "🙏 Căutând în cartea sacră..."
      }
    );

    if (aiCallResult?.data) {
      const assistantMessage: Message = {
        role: 'assistant',
        content: aiCallResult.data.message,
        timestamp: new Date()
      };

      setMessages(prev => [...prev, assistantMessage]);
    }
  };

  const generateFinalAction = async () => {
    if (messages.length === 0 || isAILoading) return;

    const aiCallResult = await executeAICall(
      () => supabase.functions.invoke('ai-live-coaching', {
        body: {
          messages: [...messages, {
            role: 'user',
            content: `Pe baza întregii noastre conversații și a înțelepciunii din cartea sacră, te rog să generezi o acțiune concretă, specifică și acționabilă pe care o pot întreprinde astăzi. Această acțiune ar trebui să fie rezultatul direct al învățăturilor divine din carte și să mă ajute să fac progres spiritual real. Răspunde DOAR cu acțiunea concretă, fără explicații suplimentare.`
          }],
          systemPrompt: systemPrompt + "\n\nGenerează o acțiune concretă bazată pe conversația noastră și pe învățăturile din cartea sacră. Fii specific și acționabil."
        }
      }),
      { messages, action: 'final' },
      {
        showLoadingToast: true,
        loadingMessage: "🎯 Generez acțiunea ta divină..."
      }
    );

    if (aiCallResult?.data) {
      setFinalAction(aiCallResult.data.message);
      setMode('complete');

      // Save the stack session to library
      await saveStackSession(messages, aiCallResult.data.message);
      
      // Update daily progress
      await updateDailyProgress('stack', {
        stackType: 'gods-school',
        sessionId: `gods-school-${Date.now()}`,
        messagesCount: messages.length,
        finalAction: aiCallResult.data.message
      });
    }
  };

  const addToHitList = () => {
    if (finalAction) {
      captureIdea(finalAction, 'hot', 'important');
      setActionAddedToHitList(true);
      toast({
        title: "✨ Acțiune Divină Salvată",
        description: "Acțiunea ta a fost adăugată la Hot List!"
      });
    }
  };

  const saveStackSession = async (chatMessages: Message[], finalActionText: string) => {
    try {
      const sessionId = `gods-school-${Date.now()}`;
      
      // Format the chat conversation for the library
      const conversationData = {
        conversation: chatMessages.map(msg => ({
          role: msg.role,
          content: msg.content,
          timestamp: msg.timestamp
        })),
        finalAction: finalActionText,
        sessionDate: new Date().toISOString()
      };

      // Create a formatted content for display
      const formattedAnswers: Record<string, string> = {
        'conversation': JSON.stringify(conversationData, null, 2),
        'finalAction': finalActionText
      };

      const questions = ['Conversația Divină Completă', 'Acțiunea Finală Generată'];

      await saveToStackLibrary('gods-school', sessionId, formattedAnswers, questions);
      
      toast({
        title: "📚 Stack Salvat în Bibliotecă",
        description: "Sesiunea ta de coaching divin a fost salvată în biblioteca de stack-uri!"
      });
    } catch (error) {
      console.error('Error saving stack session:', error);
      toast({
        title: "Avertisment",
        description: "Stack-ul nu a putut fi salvat în bibliotecă, dar acțiunea a fost generată cu succes.",
        variant: "destructive"
      });
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
      content: '🌟 Bine ai revenit la Școala Zeilor! Sunt gata să te ghidez într-o nouă călătorie spirituală bazându-mă pe cartea sacră din biblioteca ta.\n\nCe nouă provocare spirituală sau întrebare ai pentru această sesiune divină?',
      timestamp: new Date()
    };
    setMessages([welcomeMessage]);
  };

  if (showExplanation) {
    return (
      <div className="space-y-6">
        <GodsSchoolExplanation />
        <div className="flex gap-3">
          <Button 
            onClick={() => setShowExplanation(false)}
            className="bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700"
          >
            <Crown className="h-4 w-4 mr-2" />
            Începe Călătoria Divină
          </Button>
        </div>
      </div>
    );
  }

  // Completion view
  if (mode === 'complete') {
    return (
      <div className="space-y-6">
        <Card className="border-amber-200 bg-gradient-to-br from-amber-50 to-orange-50">
          <CardHeader className="text-center">
            <div className="mx-auto w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center mb-4">
              <Crown className="h-8 w-8 text-amber-600" />
            </div>
            <CardTitle className="text-2xl text-amber-900">🌟 Școala Zeilor Completată</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="bg-white p-4 rounded-lg border border-amber-200">
              <h3 className="font-semibold text-amber-900 mb-2">Acțiunea Ta Divină:</h3>
              <p className="text-amber-800 italic">{finalAction}</p>
              {actionAddedToHitList && (
                <div className="flex items-center text-green-600 text-sm mt-2">
                  <CheckCircle className="w-4 h-4 mr-1" />
                  Această acțiune a fost adăugată la Hot List
                </div>
              )}
            </div>
            
            <div className="flex flex-wrap gap-3">
              <Button
                onClick={addToHitList}
                disabled={actionAddedToHitList}
                className="bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700"
              >
                {actionAddedToHitList ? (
                  <>
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Adăugat la Hot List
                  </>
                ) : (
                  <>
                    <Sparkles className="h-4 w-4 mr-2" />
                    Adaugă la Hot List
                  </>
                )}
              </Button>
              
              <Button
                onClick={resetSession}
                variant="outline"
                className="border-amber-300 text-amber-700 hover:bg-amber-50"
              >
                <RotateCcw className="h-4 w-4 mr-2" />
                Nouă Călătorie
              </Button>
            </div>
          </CardContent>
        </Card>

        <StackIdeaModal
          isOpen={isIdeaModalOpen}
          onClose={closeIdeaModal}
          onAddToHitList={onAddToHitList}
        />
      </div>
    );
  }

  // Main chat interface
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Crown className="h-6 w-6 text-amber-600" />
          <h1 className="text-2xl font-bold text-amber-900">Școala Zeilor</h1>
          <Badge variant="outline" className="border-amber-300 text-amber-700">
            Chat Divin cu Knowledge Base
          </Badge>
        </div>
        
        <Button
          variant="outline"
          size="sm"
          onClick={() => setShowKnowledgeBase(!showKnowledgeBase)}
          className="border-amber-300 text-amber-700 hover:bg-amber-50"
        >
          <Upload className="h-4 w-4 mr-1" />
          Biblioteca Divină
        </Button>
      </div>

      {/* Knowledge Base Uploader */}
      {showKnowledgeBase && (
        <Card className="border-amber-200 bg-gradient-to-br from-amber-50 to-orange-50">
          <CardHeader>
            <CardTitle className="text-amber-900 flex items-center gap-2">
              <Upload className="h-5 w-5" />
              Biblioteca Divină - Încarcă Cartea Ta
            </CardTitle>
          </CardHeader>
          <CardContent>
            <KnowledgeBaseUploader 
              onUploadComplete={() => {
                toast({
                  title: "📚 Cartea a fost adăugată în Biblioteca Divină",
                  description: "Înțelepciunea din carte va ghida conversațiile tale divine!"
                });
              }}
            />
          </CardContent>
        </Card>
      )}

      {/* Chat Messages */}
      <Card className="border-amber-200 bg-card/60 backdrop-blur-xs shadow-glass border">
        <CardHeader>
          <CardTitle className="text-amber-300 flex items-center gap-2 font-display">
            <Sparkles className="h-5 w-5" />
            Conversația Divină
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="max-h-[60vh] overflow-y-auto space-y-4 mb-4 p-2">
            {messages.map((message, index) => (
              <div
                key={index}
                className={`p-3 rounded-lg ${
                  message.role === 'user'
                    ? 'bg-amber-100/20 border border-amber-200/30 ml-8 text-amber-50'
                    : 'bg-white/10 border border-amber-300/30 mr-8 text-amber-100'
                }`}
              >
                <div className="whitespace-pre-wrap text-sm leading-relaxed">{message.content}</div>
                <div className="text-xs opacity-70 mt-2 text-amber-200">
                  {message.timestamp.toLocaleTimeString()}
                </div>
              </div>
            ))}
            {isAILoading && (
              <div className="bg-white/10 border border-amber-300/30 mr-8 p-3 rounded-lg">
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-amber-400 rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-amber-400 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                  <div className="w-2 h-2 bg-amber-400 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                  <span className="text-sm text-amber-200 ml-2">Căutând în cartea sacră...</span>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Message Input */}
          <div className="space-y-3">
            <Textarea
              value={currentMessage}
              onChange={(e) => setCurrentMessage(e.target.value)}
              placeholder="Împărtășește provocarea ta spirituală sau pune o întrebare divină..."
              className="min-h-[80px] border-amber-200/40 focus:border-amber-400 bg-white/5 text-amber-50 placeholder:text-amber-300"
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  sendMessage();
                }
              }}
            />
            <div className="flex gap-2 justify-between">
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={resetSession}
                  size="sm"
                  className="border-amber-300/50 text-amber-200 hover:bg-amber-50/10"
                >
                  <RotateCcw className="h-4 w-4 mr-1" />
                  Reset
                </Button>
              </div>
              <div className="flex gap-2">
                <Button
                  onClick={generateFinalAction}
                  disabled={messages.length <= 1 || isAILoading}
                  variant="outline"
                  size="sm"
                  className="border-amber-300/50 text-amber-200 hover:bg-amber-50/10"
                >
                  <Crown className="h-4 w-4 mr-1" />
                  Generează Acțiune
                </Button>
                <Button
                  onClick={sendMessage}
                  disabled={!currentMessage.trim() || isAILoading}
                  className="bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700"
                >
                  <Send className="h-4 w-4 mr-1" />
                  Trimite
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Stack Idea Modal */}
      <StackIdeaModal
        isOpen={isIdeaModalOpen}
        onClose={closeIdeaModal}
        onAddToHitList={onAddToHitList}
      />
    </div>
  );
};
