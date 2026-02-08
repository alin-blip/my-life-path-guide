import React from 'react';
import { cn } from '@/lib/utils';
import { formatDistanceToNow } from 'date-fns';
import { ro } from 'date-fns/locale';
import { useLanguage } from '@/context/LanguageContext';

interface MessageBubbleProps {
  content: string;
  createdAt: string;
  isMine: boolean;
}

export const MessageBubble: React.FC<MessageBubbleProps> = ({ content, createdAt, isMine }) => {
  const { language } = useLanguage();

  return (
    <div className={cn('flex', isMine ? 'justify-end' : 'justify-start')}>
      <div
        className={cn(
          'max-w-[75%] rounded-2xl px-4 py-2.5 text-sm',
          isMine
            ? 'bg-primary text-primary-foreground rounded-br-md'
            : 'bg-muted text-foreground rounded-bl-md'
        )}
      >
        <p className="whitespace-pre-wrap break-words">{content}</p>
        <p className={cn(
          'text-[10px] mt-1',
          isMine ? 'text-primary-foreground/60' : 'text-muted-foreground'
        )}>
          {formatDistanceToNow(new Date(createdAt), {
            addSuffix: true,
            locale: language === 'ro' ? ro : undefined,
          })}
        </p>
      </div>
    </div>
  );
};
