import React, { useEffect, useRef } from 'react';
import { cn } from '@/lib/utils';
import { GoalWizardMessage } from '@/types/goalWizard';
import { Bot, User } from 'lucide-react';
import ReactMarkdown from 'react-markdown';

interface GoalWizardChatProps {
  messages: GoalWizardMessage[];
  isProcessing: boolean;
}

export const GoalWizardChat: React.FC<GoalWizardChatProps> = ({
  messages,
  isProcessing
}) => {
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isProcessing]);

  return (
    <div 
      ref={scrollRef}
      className="flex-1 overflow-y-auto p-4 space-y-4"
    >
      {messages.map((message) => (
        <div
          key={message.id}
          className={cn(
            "flex gap-3",
            message.role === 'user' ? "flex-row-reverse" : "flex-row"
          )}
        >
          <div
            className={cn(
              "w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0",
              message.role === 'user' 
                ? "bg-primary text-primary-foreground" 
                : "bg-muted"
            )}
          >
            {message.role === 'user' ? (
              <User className="w-5 h-5" />
            ) : (
              <Bot className="w-5 h-5" />
            )}
          </div>
          
          <div
            className={cn(
              "max-w-[80%] px-4 py-3",
              message.role === 'user'
                ? "bubble-user rounded-tr-sm"
                : "bubble-ai pl-5 rounded-tl-sm"
            )}
          >
            <div className={cn(
              "prose prose-sm max-w-none",
              message.role === 'user' && "prose-invert"
            )}>
              <ReactMarkdown>{message.content}</ReactMarkdown>
            </div>
          </div>
        </div>
      ))}

      {isProcessing && (
        <div className="flex gap-3">
          <div className="w-9 h-9 rounded-full bg-muted flex items-center justify-center">
            <Bot className="w-5 h-5" />
          </div>
          <div className="bubble-ai pl-5 rounded-tl-sm px-4 py-3">
            <div className="flex items-center gap-1.5">
              <div className="w-2 h-2 rounded-full bg-foreground/40 animate-bounce" style={{ animationDelay: '0ms' }} />
              <div className="w-2 h-2 rounded-full bg-foreground/40 animate-bounce" style={{ animationDelay: '150ms' }} />
              <div className="w-2 h-2 rounded-full bg-foreground/40 animate-bounce" style={{ animationDelay: '300ms' }} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
