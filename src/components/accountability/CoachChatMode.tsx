import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Send, Loader2, User, Trophy } from 'lucide-react';
import { CoachMessage } from '@/hooks/useAccountabilityCoach';
import { cn } from '@/lib/utils';

interface CoachChatModeProps {
  messages: CoachMessage[];
  isLoading: boolean;
  onSendMessage: (message: string) => void;
  quickActions: { label: string; message: string }[];
}

export const CoachChatMode: React.FC<CoachChatModeProps> = ({
  messages,
  isLoading,
  onSendMessage,
  quickActions,
}) => {
  const [input, setInput] = useState('');
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim() && !isLoading) {
      onSendMessage(input.trim());
      setInput('');
    }
  };

  const handleQuickAction = (message: string) => {
    if (!isLoading) {
      onSendMessage(message);
    }
  };

  return (
    <div className="flex flex-col h-full">
      <ScrollArea className="flex-1 px-3" ref={scrollRef}>
        <div className="space-y-3 py-3">
          {messages.length === 0 && (
            <div className="text-center py-8">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center">
                <Trophy className="w-8 h-8 text-white" />
              </div>
              <p className="text-sm text-muted-foreground mb-4">
                Salut! Sunt Coach-ul tău. Cum te pot ajuta?
              </p>
              
              <div className="flex flex-wrap gap-2 justify-center">
                {quickActions.slice(0, 4).map((action, idx) => (
                  <Button
                    key={idx}
                    variant="outline"
                    size="sm"
                    onClick={() => handleQuickAction(action.message)}
                    className="text-xs"
                  >
                    {action.label}
                  </Button>
                ))}
              </div>
            </div>
          )}

          {messages.map((message) => (
            <div
              key={message.id}
              className={cn(
                'flex gap-2',
                message.role === 'user' ? 'justify-end' : 'justify-start'
              )}
            >
              {message.role === 'assistant' && (
                <div className="w-7 h-7 rounded-full bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center flex-shrink-0">
                  <Trophy className="w-4 h-4 text-white" />
                </div>
              )}
              
              <div
                className={cn(
                  'max-w-[85%] rounded-lg px-3 py-2 text-sm',
                  message.role === 'user'
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-muted'
                )}
              >
                <p className="whitespace-pre-wrap">{message.content}</p>
              </div>
              
              {message.role === 'user' && (
                <div className="w-7 h-7 rounded-full bg-secondary flex items-center justify-center flex-shrink-0">
                  <User className="w-4 h-4 text-secondary-foreground" />
                </div>
              )}
            </div>
          ))}

          {isLoading && (
            <div className="flex gap-2 justify-start">
              <div className="w-7 h-7 rounded-full bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center">
                <Trophy className="w-4 h-4 text-white" />
              </div>
              <div className="bg-muted rounded-lg px-3 py-2">
                <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />
              </div>
            </div>
          )}
        </div>
      </ScrollArea>

      {messages.length > 0 && (
        <div className="px-3 pb-2">
          <div className="flex gap-1.5 overflow-x-auto pb-1">
            {quickActions.slice(0, 3).map((action, idx) => (
              <Button
                key={idx}
                variant="ghost"
                size="sm"
                onClick={() => handleQuickAction(action.message)}
                disabled={isLoading}
                className="text-xs whitespace-nowrap h-7 px-2"
              >
                {action.label}
              </Button>
            ))}
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="p-3 border-t border-border">
        <div className="flex gap-2">
          <Input
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Scrie mesajul tău..."
            disabled={isLoading}
            className="flex-1 text-sm"
          />
          <Button
            type="submit"
            size="icon"
            disabled={!input.trim() || isLoading}
          >
            {isLoading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Send className="w-4 h-4" />
            )}
          </Button>
        </div>
      </form>
    </div>
  );
};
