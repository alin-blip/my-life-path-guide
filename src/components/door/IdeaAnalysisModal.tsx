import React, { useState, useRef, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Loader2, Send, Brain, Target, ListChecks, Archive, CheckCircle2, AlertTriangle, XCircle } from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';
import { IdeaBankItem, IdeaAnalysisResult, ideasBankService } from '@/services/ideasBankService';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import ReactMarkdown from 'react-markdown';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

interface IdeaAnalysisModalProps {
  isOpen: boolean;
  onClose: () => void;
  idea: IdeaBankItem | null;
  onMoveToHit?: (idea: IdeaBankItem) => void;
  onMoveToDo?: (idea: IdeaBankItem) => void;
  onArchive?: (idea: IdeaBankItem) => void;
  onAnalysisComplete?: (idea: IdeaBankItem, result: IdeaAnalysisResult) => void;
}

export const IdeaAnalysisModal: React.FC<IdeaAnalysisModalProps> = ({
  isOpen,
  onClose,
  idea,
  onMoveToHit,
  onMoveToDo,
  onArchive,
  onAnalysisComplete
}) => {
  const { t } = useLanguage();
  const { toast } = useToast();
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<IdeaAnalysisResult | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Reset state when modal opens with new idea
  useEffect(() => {
    if (isOpen && idea) {
      setMessages([]);
      setAnalysisResult(null);
      setInputValue('');
      // Start analysis automatically
      startAnalysis();
    }
  }, [isOpen, idea?.id]);

  // Scroll to bottom on new messages
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const startAnalysis = async () => {
    if (!idea) return;
    
    setIsLoading(true);
    const userMessage: Message = { role: 'user', content: `Analizează această idee: "${idea.text}"` };
    setMessages([userMessage]);

    try {
      await streamAnalysis([userMessage]);
    } catch (error) {
      console.error('Error starting analysis:', error);
      toast({
        title: 'Eroare',
        description: 'Nu s-a putut porni analiza',
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const streamAnalysis = async (messagesToSend: Message[]) => {
    // Get user's session token for authentication
    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.access_token) {
      throw new Error('Not authenticated');
    }

    const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/analyze-idea`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${session.access_token}`
      },
      body: JSON.stringify({
        ideaText: idea?.text,
        messages: messagesToSend
      })
    });

    if (!response.ok || !response.body) {
      throw new Error('Failed to start analysis stream');
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let textBuffer = '';
    let assistantContent = '';

    // Add empty assistant message
    setMessages(prev => [...prev, { role: 'assistant', content: '' }]);

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      textBuffer += decoder.decode(value, { stream: true });

      let newlineIndex: number;
      while ((newlineIndex = textBuffer.indexOf('\n')) !== -1) {
        let line = textBuffer.slice(0, newlineIndex);
        textBuffer = textBuffer.slice(newlineIndex + 1);

        if (line.endsWith('\r')) line = line.slice(0, -1);
        if (line.startsWith(':') || line.trim() === '') continue;
        if (!line.startsWith('data: ')) continue;

        const jsonStr = line.slice(6).trim();
        if (jsonStr === '[DONE]') break;

        try {
          const parsed = JSON.parse(jsonStr);
          const content = parsed.choices?.[0]?.delta?.content;
          if (content) {
            assistantContent += content;
            setMessages(prev => {
              const newMessages = [...prev];
              if (newMessages.length > 0 && newMessages[newMessages.length - 1].role === 'assistant') {
                newMessages[newMessages.length - 1] = { role: 'assistant', content: assistantContent };
              }
              return newMessages;
            });
          }
        } catch {
          // Partial SSE chunk – keep accumulating in buffer
          textBuffer = line + '\n' + textBuffer;
          break;
        }
      }
    }

    // Check if response contains analysis result
    checkForAnalysisResult(assistantContent);
  };

  const checkForAnalysisResult = (content: string) => {
    try {
      // Look for JSON in the response
      const jsonMatch = content.match(/\{[\s\S]*"analysis_complete"[\s\S]*\}/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        if (parsed.analysis_complete && parsed.result) {
          setAnalysisResult(parsed.result);
          
          // Save to database
          if (idea) {
            ideasBankService.saveAnalysisResult(idea.id, parsed.result);
            onAnalysisComplete?.(idea, parsed.result);
          }
        }
      }
    } catch {
      // Not a complete analysis yet
    }
  };

  const handleSendMessage = async () => {
    if (!inputValue.trim() || isLoading) return;

    const userMessage: Message = { role: 'user', content: inputValue.trim() };
    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    setInputValue('');
    setIsLoading(true);

    try {
      await streamAnalysis(newMessages);
    } catch (error) {
      console.error('Error sending message:', error);
      toast({
        title: 'Eroare',
        description: 'Nu s-a putut trimite mesajul',
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const getRecommendationBadge = () => {
    if (!analysisResult) return null;

    const config = {
      pursue: { icon: CheckCircle2, label: 'PURSUE', className: 'bg-green-500/20 text-green-400 border-green-500/50' },
      defer: { icon: AlertTriangle, label: 'DEFER', className: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/50' },
      discard: { icon: XCircle, label: 'DISCARD', className: 'bg-red-500/20 text-red-400 border-red-500/50' }
    };

    const { icon: Icon, label, className } = config[analysisResult.recommendation];

    return (
      <div className={`flex items-center gap-2 px-3 py-2 rounded-lg border ${className}`}>
        <Icon className="w-5 h-5" />
        <span className="font-semibold">{label}</span>
        <span className="text-sm opacity-80">({analysisResult.relevance_score}% relevanță)</span>
      </div>
    );
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-2xl h-[80vh] flex flex-col p-0">
        <DialogHeader className="p-4 pb-2 border-b">
          <DialogTitle className="flex items-center gap-2">
            <Brain className="w-5 h-5 text-primary" />
            <span>Analiză Idee</span>
          </DialogTitle>
          {idea && (
            <p className="text-sm text-muted-foreground truncate mt-1">
              "{idea.text}"
            </p>
          )}
        </DialogHeader>

        {/* Messages area */}
        <ScrollArea className="flex-1 p-4" ref={scrollRef}>
          <div className="space-y-4">
            {messages.map((message, index) => (
              <div
                key={index}
                className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[85%] rounded-lg px-4 py-2 ${
                    message.role === 'user'
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-muted'
                  }`}
                >
                  {message.role === 'assistant' ? (
                    <div className="prose prose-sm dark:prose-invert max-w-none">
                      <ReactMarkdown>{message.content || '...'}</ReactMarkdown>
                    </div>
                  ) : (
                    <p className="text-sm">{message.content}</p>
                  )}
                </div>
              </div>
            ))}
            
            {isLoading && messages[messages.length - 1]?.role !== 'assistant' && (
              <div className="flex justify-start">
                <div className="bg-muted rounded-lg px-4 py-2">
                  <Loader2 className="w-4 h-4 animate-spin" />
                </div>
              </div>
            )}
          </div>
        </ScrollArea>

        {/* Analysis result actions */}
        {analysisResult && (
          <div className="p-4 border-t bg-muted/50 space-y-3">
            <div className="flex items-center justify-between">
              {getRecommendationBadge()}
              {analysisResult.is_busy_work && (
                <span className="text-xs text-orange-400 bg-orange-500/20 px-2 py-1 rounded">
                  ⚠️ Risc de busy work
                </span>
              )}
            </div>
            
            <div className="flex gap-2 flex-wrap">
              <Button
                size="sm"
                variant="default"
                onClick={() => idea && onMoveToHit?.(idea)}
                className="gap-1"
              >
                <Target className="w-4 h-4" />
                Mută în HIT
              </Button>
              <Button
                size="sm"
                variant="secondary"
                onClick={() => idea && onMoveToDo?.(idea)}
                className="gap-1"
              >
                <ListChecks className="w-4 h-4" />
                Mută în DO
              </Button>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => idea && onArchive?.(idea)}
                className="gap-1"
              >
                <Archive className="w-4 h-4" />
                Arhivează
              </Button>
            </div>
          </div>
        )}

        {/* Input area */}
        <div className="p-4 border-t">
          <div className="flex gap-2">
            <Input
              ref={inputRef}
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && handleSendMessage()}
              placeholder="Adaugă detalii sau răspunde la întrebări..."
              disabled={isLoading}
              className="flex-1"
            />
            <Button
              onClick={handleSendMessage}
              disabled={isLoading || !inputValue.trim()}
              size="icon"
            >
              {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
