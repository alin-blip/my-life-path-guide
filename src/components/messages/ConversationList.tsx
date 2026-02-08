import React from 'react';
import { cn } from '@/lib/utils';
import { formatDistanceToNow } from 'date-fns';
import { ro } from 'date-fns/locale';
import { useLanguage } from '@/context/LanguageContext';
import type { Conversation } from '@/hooks/useDirectMessages';

interface ConversationListProps {
  conversations: Conversation[];
  selectedPartnerId: string | null;
  onSelect: (partnerId: string) => void;
}

export const ConversationList: React.FC<ConversationListProps> = ({
  conversations,
  selectedPartnerId,
  onSelect,
}) => {
  const { language } = useLanguage();

  if (!conversations.length) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-6 text-center">
        <p className="text-muted-foreground text-sm">
          {language === 'ro' ? 'Nicio conversație încă' : 'No conversations yet'}
        </p>
        <p className="text-muted-foreground/60 text-xs mt-1">
          {language === 'ro'
            ? 'Începe o conversație nouă din pagina de membri'
            : 'Start a new conversation from the members page'}
        </p>
      </div>
    );
  }

  return (
    <div className="divide-y divide-border/40">
      {conversations.map((conv) => (
        <button
          key={conv.partner_id}
          onClick={() => onSelect(conv.partner_id)}
          className={cn(
            'w-full flex items-center gap-3 p-3 hover:bg-accent/40 transition-colors text-left',
            selectedPartnerId === conv.partner_id && 'bg-accent/60'
          )}
        >
          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-lg shrink-0">
            {conv.partner_emoji}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium truncate">{conv.partner_name}</span>
              <span className="text-[10px] text-muted-foreground shrink-0 ml-2">
                {formatDistanceToNow(new Date(conv.last_message_at), {
                  addSuffix: false,
                  locale: language === 'ro' ? ro : undefined,
                })}
              </span>
            </div>
            <div className="flex items-center justify-between mt-0.5">
              <p className="text-xs text-muted-foreground truncate">{conv.last_message}</p>
              {conv.unread_count > 0 && (
                <span className="bg-destructive text-destructive-foreground text-[10px] font-bold rounded-full min-w-[18px] h-[18px] flex items-center justify-center px-1 ml-2 shrink-0">
                  {conv.unread_count}
                </span>
              )}
            </div>
          </div>
        </button>
      ))}
    </div>
  );
};
