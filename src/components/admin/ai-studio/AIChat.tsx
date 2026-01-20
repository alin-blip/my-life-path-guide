import React, { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Send, Bot, User, Loader2, Copy, Check } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

export const AIChat: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const copyToClipboard = async (text: string, index: number) => {
    await navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
    toast({ title: 'Copiat!', description: 'Textul a fost copiat în clipboard' });
  };

  const sendMessage = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: Message = { role: 'user', content: input };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error('No session');

      const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/admin-ai-assistant`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'chat',
          messages: [...messages, userMessage],
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'AI request failed');
      }

      // Handle streaming response
      const reader = response.body?.getReader();
      const decoder = new TextDecoder();
      let assistantContent = '';

      if (reader) {
        setMessages(prev => [...prev, { role: 'assistant', content: '' }]);

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          const chunk = decoder.decode(value, { stream: true });
          const lines = chunk.split('\n');

          for (const line of lines) {
            if (line.startsWith('data: ') && line !== 'data: [DONE]') {
              try {
                const data = JSON.parse(line.slice(6));
                const content = data.choices?.[0]?.delta?.content;
                if (content) {
                  assistantContent += content;
                  setMessages(prev => {
                    const updated = [...prev];
                    updated[updated.length - 1] = { role: 'assistant', content: assistantContent };
                    return updated;
                  });
                }
              } catch (e) {
                // Skip invalid JSON
              }
            }
          }
        }
      }
    } catch (error) {
      console.error('AI Chat error:', error);
      toast({
        title: 'Eroare',
        description: error instanceof Error ? error.message : 'Nu am putut procesa cererea',
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="h-[600px] flex flex-col">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2">
          <Bot className="w-5 h-5 text-primary" />
          Chat cu AI-ul RoWarrior
        </CardTitle>
      </CardHeader>
      <CardContent className="flex-1 flex flex-col">
        <ScrollArea className="flex-1 pr-4 mb-4" ref={scrollRef}>
          {messages.length === 0 ? (
            <div className="h-full flex items-center justify-center text-muted-foreground">
              <div className="text-center space-y-2">
                <Bot className="w-12 h-12 mx-auto opacity-50" />
                <p>Salut! Sunt AI-ul tău pentru content creation.</p>
                <p className="text-sm">Întreabă-mă orice despre platforma RoWarrior!</p>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {messages.map((message, index) => (
                <div
                  key={index}
                  className={`flex gap-3 ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  {message.role === 'assistant' && (
                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <Bot className="w-4 h-4 text-primary" />
                    </div>
                  )}
                  <div
                    className={`max-w-[80%] rounded-lg p-3 ${
                      message.role === 'user'
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-muted'
                    }`}
                  >
                    <div className="prose prose-sm max-w-none dark:prose-invert text-sm">
                      <ReactMarkdown>{message.content}</ReactMarkdown>
                    </div>
                    {message.role === 'assistant' && message.content && (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="mt-2 h-6 text-xs"
                        onClick={() => copyToClipboard(message.content, index)}
                      >
                        {copiedIndex === index ? (
                          <Check className="w-3 h-3 mr-1" />
                        ) : (
                          <Copy className="w-3 h-3 mr-1" />
                        )}
                        Copy
                      </Button>
                    )}
                  </div>
                  {message.role === 'user' && (
                    <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center flex-shrink-0">
                      <User className="w-4 h-4 text-primary-foreground" />
                    </div>
                  )}
                </div>
              ))}
              {isLoading && messages[messages.length - 1]?.role === 'user' && (
                <div className="flex gap-3">
                  <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                    <Loader2 className="w-4 h-4 text-primary animate-spin" />
                  </div>
                  <div className="bg-muted rounded-lg p-3">
                    <p className="text-sm text-muted-foreground">Se generează răspunsul...</p>
                  </div>
                </div>
              )}
            </div>
          )}
        </ScrollArea>

        <div className="flex gap-2">
          <Textarea
            placeholder="Scrie mesajul tău..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
              if (e.key === 'Enter' && !e.shiftKey && !isMobile) {
                e.preventDefault();
                sendMessage();
              }
            }}
            className="resize-none"
            rows={2}
          />
          <Button onClick={sendMessage} disabled={isLoading || !input.trim()}>
            {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
