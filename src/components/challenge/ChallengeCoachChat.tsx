import React, { useRef, useEffect, useState } from 'react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Send, Loader2, Sparkles } from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';
import { cn } from '@/lib/utils';
import ReactMarkdown from 'react-markdown';
import { useNavigate } from 'react-router-dom';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

interface ChallengeCoachChatProps {
  messages: Message[];
  isLoading: boolean;
  onSendMessage: (message: string) => void;
  currentDay?: number;
}

const getQuickActions = (language: 'en' | 'ro', currentDay: number) => {
  if (language === 'ro') {
    return [
      { label: 'Ce am de făcut azi?', message: `Ce am de făcut în Ziua ${currentDay}?` },
      { label: 'Explică exercițiile', message: 'Explică-mi exercițiile pentru ziua de azi' },
      { label: 'Sunt blocat', message: 'Mă simt blocat și nu știu de unde să încep' },
      { label: 'Progresul meu', message: 'Cum arată progresul meu în challenge?' },
    ];
  }
  return [
    { label: 'What do I do today?', message: `What do I need to do on Day ${currentDay}?` },
    { label: 'Explain exercises', message: 'Explain the exercises for today' },
    { label: "I'm stuck", message: "I feel stuck and don't know where to start" },
    { label: 'My progress', message: 'How does my challenge progress look?' },
  ];
};

// Extract navigation paths from message content
const extractPaths = (content: string): { path: string; label: string }[] => {
  const pathRegex = /\(\/[a-zA-Z0-9\-\/?=&]+\)/g;
  const matches = content.match(pathRegex) || [];
  return matches.map(match => ({
    path: match.slice(1, -1),
    label: match.slice(1, -1).split('/').pop()?.replace(/[?=&]/g, ' ') || 'Go',
  }));
};

export const ChallengeCoachChat: React.FC<ChallengeCoachChatProps> = ({
  messages,
  isLoading,
  onSendMessage,
  currentDay = 1,
}) => {
  const [input, setInput] = useState('');
  const scrollRef = useRef<HTMLDivElement>(null);
  const { language } = useLanguage();
  const navigate = useNavigate();
  const quickActions = getQuickActions(language as 'en' | 'ro', currentDay);

  // Auto-scroll to bottom
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

  const handleQuickAction = (message: string) => {
    if (!isLoading) {
      onSendMessage(message);
    }
  };

  const handleNavigate = (path: string) => {
    navigate(path);
  };

  return (
    <div className="flex flex-col h-full">
      {/* Messages */}
      <ScrollArea className="flex-1 px-4" ref={scrollRef}>
        <div className="space-y-4 py-4">
          {messages.map((message, index) => {
            const paths = message.role === 'assistant' ? extractPaths(message.content) : [];
            
            return (
              <div
                key={index}
                className={cn(
                  'flex gap-3',
                  message.role === 'user' ? 'justify-end' : 'justify-start'
                )}
              >
                {message.role === 'assistant' && (
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center flex-shrink-0">
                    <Sparkles className="w-4 h-4 text-white" />
                  </div>
                )}
                <div
                  className={cn(
                    'max-w-[80%] rounded-2xl px-4 py-2.5',
                    message.role === 'user'
                      ? 'bg-primary text-primary-foreground rounded-br-md'
                      : 'bg-muted rounded-bl-md'
                  )}
                >
                  {message.role === 'assistant' ? (
                    <div className="prose prose-sm dark:prose-invert max-w-none">
                      <ReactMarkdown>{message.content}</ReactMarkdown>
                      {/* Navigation buttons for paths mentioned */}
                      {paths.length > 0 && (
                        <div className="flex flex-wrap gap-2 mt-3 not-prose">
                          {paths.map((p, i) => (
                            <Button
                              key={i}
                              size="sm"
                              variant="outline"
                              className="text-xs h-7"
                              onClick={() => handleNavigate(p.path)}
                            >
                              {p.path}
                            </Button>
                          ))}
                        </div>
                      )}
                    </div>
                  ) : (
                    <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                  )}
                </div>
              </div>
            );
          })}
          
          {isLoading && messages[messages.length - 1]?.role === 'user' && (
            <div className="flex gap-3">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center flex-shrink-0">
                <Sparkles className="w-4 h-4 text-white" />
              </div>
              <div className="bg-muted rounded-2xl rounded-bl-md px-4 py-3">
                <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />
              </div>
            </div>
          )}
        </div>
      </ScrollArea>

      {/* Quick Actions - show only when few messages */}
      {messages.length <= 2 && (
        <div className="px-4 py-2 border-t border-border">
          <div className="flex flex-wrap gap-2">
            {quickActions.map((action, index) => (
              <Button
                key={index}
                variant="outline"
                size="sm"
                className="text-xs h-7"
                onClick={() => handleQuickAction(action.message)}
                disabled={isLoading}
              >
                {action.label}
              </Button>
            ))}
          </div>
        </div>
      )}

      {/* Input */}
      <div className="p-4 border-t border-border">
        <div className="flex gap-2">
          <Textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onEnterSubmit={handleSend}
            placeholder={language === 'ro' ? 'Scrie un mesaj...' : 'Type a message...'}
            className="min-h-[44px] max-h-[120px] resize-none"
            disabled={isLoading}
          />
          <Button
            onClick={handleSend}
            disabled={!input.trim() || isLoading}
            className="h-[44px] w-[44px] shrink-0 bg-gradient-to-br from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700"
          >
            {isLoading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Send className="w-4 h-4" />
            )}
          </Button>
        </div>
      </div>
    </div>
  );
};
