import React, { useState, useRef, useEffect } from 'react';
import { Send, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import { useLanguage } from '@/context/LanguageContext';
import { ChatMessageWithButtons } from './ChatMessageWithButtons';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

interface SidebarChatModeProps {
  messages: Message[];
  isLoading: boolean;
  onSendMessage: (message: string) => void;
}

export const SidebarChatMode: React.FC<SidebarChatModeProps> = ({
  messages,
  isLoading,
  onSendMessage,
}) => {
  const { language } = useLanguage();
  const [input, setInput] = useState('');
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = () => {
    if (input.trim() && !isLoading) {
      onSendMessage(input.trim());
      setInput('');
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const quickActions = language === 'ro' 
    ? ['Ce am de făcut?', 'Motivație', 'Progres']
    : ['What to do?', 'Motivation', 'Progress'];

  return (
    <div className="flex flex-col h-full">
      {/* Messages */}
      <ScrollArea className="flex-1 p-2" ref={scrollRef}>
        <div className="space-y-2">
          {messages.length === 0 && (
            <div className="text-center py-4">
              <p className="text-xs text-muted-foreground mb-3">
                {language === 'ro' 
                  ? 'Întreabă-mă orice despre progresul tău!' 
                  : 'Ask me anything about your progress!'}
              </p>
              <div className="flex flex-wrap gap-1 justify-center">
                {quickActions.map((action) => (
                  <Button
                    key={action}
                    variant="outline"
                    size="sm"
                    className="text-xs h-7 px-2"
                    onClick={() => onSendMessage(action)}
                  >
                    {action}
                  </Button>
                ))}
              </div>
            </div>
          )}

          {messages.map((msg) => (
            <div
              key={msg.id}
              className={cn(
                "p-2 rounded-lg text-xs",
                msg.role === 'user'
                  ? "bg-primary/20 ml-4"
                  : "bg-muted mr-2"
              )}
            >
              {msg.role === 'assistant' ? (
                <ChatMessageWithButtons 
                  content={msg.content} 
                  isCompact={true}
                />
              ) : (
                <p className="text-xs">{msg.content}</p>
              )}
            </div>
          ))}

          {isLoading && (
            <div className="flex items-center gap-2 p-2 bg-muted rounded-lg mr-2">
              <Loader2 className="h-3 w-3 animate-spin" />
              <span className="text-xs text-muted-foreground">
                {language === 'ro' ? 'Gândesc...' : 'Thinking...'}
              </span>
            </div>
          )}
        </div>
      </ScrollArea>

      {/* Input */}
      <div className="p-2 border-t border-amber-500/20">
        <div className="flex gap-1.5">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={language === 'ro' ? 'Întreabă...' : 'Ask...'}
            className="text-xs h-8 bg-background/50"
            disabled={isLoading}
          />
          <Button
            size="icon"
            className="h-8 w-8 shrink-0"
            onClick={handleSend}
            disabled={!input.trim() || isLoading}
          >
            <Send className="h-3.5 w-3.5" />
          </Button>
        </div>
      </div>
    </div>
  );
};
