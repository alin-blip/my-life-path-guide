import React, { useState, useEffect, useRef } from 'react';
import { Send } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { MessageBubble } from './MessageBubble';
import { useAuth } from '@/context/AuthContext';
import { useLanguage } from '@/context/LanguageContext';
import type { DirectMessage } from '@/hooks/useDirectMessages';

interface ConversationThreadProps {
  partnerName: string;
  partnerEmoji: string;
  messages: DirectMessage[];
  onSend: (content: string) => Promise<any>;
  loading: boolean;
}

export const ConversationThread: React.FC<ConversationThreadProps> = ({
  partnerName,
  partnerEmoji,
  messages,
  onSend,
  loading,
}) => {
  const { user } = useAuth();
  const { language } = useLanguage();
  const [input, setInput] = useState('');
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || sending) return;
    setSending(true);
    await onSend(input);
    setInput('');
    setSending(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="flex flex-col h-full">
      {/* Thread header */}
      <div className="p-4 border-b border-border/60 flex items-center gap-3">
        <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center text-lg">
          {partnerEmoji}
        </div>
        <span className="font-medium text-sm">{partnerName}</span>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {loading && !messages.length ? (
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary" />
          </div>
        ) : messages.length === 0 ? (
          <p className="text-center text-muted-foreground text-sm py-8">
            {language === 'ro' ? 'Începe conversația!' : 'Start the conversation!'}
          </p>
        ) : (
          messages.map((msg) => (
            <MessageBubble
              key={msg.id}
              content={msg.content}
              createdAt={msg.created_at}
              isMine={msg.sender_id === user?.id}
            />
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="p-3 border-t border-border/60 flex gap-2">
        <Input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={language === 'ro' ? 'Scrie un mesaj...' : 'Type a message...'}
          className="flex-1"
          disabled={sending}
        />
        <Button
          size="icon"
          onClick={handleSend}
          disabled={!input.trim() || sending}
        >
          <Send className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
};
