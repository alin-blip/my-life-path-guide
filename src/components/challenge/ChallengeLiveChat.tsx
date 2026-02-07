import React, { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Skeleton } from '@/components/ui/skeleton';
import { MessageSquare, Send, Trash2, Shield } from 'lucide-react';
import { useChallengeLiveChat } from '@/hooks/useChallengeLiveChat';
import { useAdminAuth } from '@/hooks/useAdminAuth';
import { useAuth } from '@/context/AuthContext';
import { formatDistanceToNow } from 'date-fns';
import { ro } from 'date-fns/locale';

interface ChallengeLiveChatProps {
  dayNumber: number;
  language?: 'ro' | 'en';
}

export const ChallengeLiveChat: React.FC<ChallengeLiveChatProps> = ({
  dayNumber,
  language = 'ro',
}) => {
  const { user } = useAuth();
  const { isAdmin } = useAdminAuth();
  const { messages, isLoading, sendMessage, deleteMessage } =
    useChallengeLiveChat(dayNumber);
  const [newMessage, setNewMessage] = useState('');
  const [sending, setSending] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const isAuthenticated = !!user;

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async () => {
    if (!newMessage.trim() || sending) return;
    setSending(true);
    const success = await sendMessage(newMessage);
    if (success) setNewMessage('');
    setSending(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  // Check if a message is from an admin (we can't know for sure from client,
  // but we can mark the current user's messages if they are admin)
  const isAdminMessage = (msgUserId: string) => {
    return isAdmin && msgUserId === user?.id;
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader className="pb-3">
          <Skeleton className="h-6 w-48" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-[300px] w-full" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-primary/20">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-base">
          <MessageSquare className="h-5 w-5 text-primary" />
          {language === 'en' ? 'Live Chat' : 'Chat General'}
          <Badge variant="secondary" className="text-xs">
            {messages.length} {language === 'en' ? 'messages' : 'mesaje'}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {/* Messages area */}
        <div
          ref={scrollRef}
          className="h-[350px] overflow-y-auto space-y-3 pr-2 scroll-smooth"
        >
          {messages.length === 0 ? (
            <div className="flex items-center justify-center h-full text-muted-foreground text-sm">
              {language === 'en'
                ? 'No messages yet. Be the first to write!'
                : 'Niciun mesaj încă. Fii primul care scrie!'}
            </div>
          ) : (
            messages.map((msg) => {
              const isMine = msg.user_id === user?.id;

              return (
                <div
                  key={msg.id}
                  className={`flex gap-2 ${isMine ? 'flex-row-reverse' : ''}`}
                >
                  <div
                    className={`max-w-[80%] rounded-lg p-3 ${
                      isMine
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-muted'
                    }`}
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs font-semibold">
                        {msg.author_name || 'Anonim'}
                      </span>
                      {isAdminMessage(msg.user_id) && (
                        <Badge
                          variant="outline"
                          className="text-[10px] px-1 py-0 h-4 border-amber-500 text-amber-500"
                        >
                          <Shield className="h-2.5 w-2.5 mr-0.5" />
                          Admin
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm whitespace-pre-wrap break-words">
                      {msg.content}
                    </p>
                    <div className="flex items-center justify-between mt-1">
                      <span
                        className={`text-[10px] ${
                          isMine
                            ? 'text-primary-foreground/60'
                            : 'text-muted-foreground'
                        }`}
                      >
                        {formatDistanceToNow(new Date(msg.created_at), {
                          addSuffix: true,
                          locale: language === 'ro' ? ro : undefined,
                        })}
                      </span>
                      {(isAdmin || isMine) && (
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-5 w-5 opacity-50 hover:opacity-100"
                          onClick={() => deleteMessage(msg.id)}
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Input area */}
        {isAuthenticated ? (
          <div className="flex gap-2">
            <Input
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={
                language === 'en'
                  ? 'Write a message...'
                  : 'Scrie un mesaj...'
              }
              disabled={sending}
              className="flex-1"
            />
            <Button
              size="icon"
              onClick={handleSend}
              disabled={!newMessage.trim() || sending}
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>
        ) : (
          <p className="text-center text-sm text-muted-foreground py-2">
            {language === 'en'
              ? 'Log in to participate in chat'
              : 'Autentifică-te pentru a participa la chat'}
          </p>
        )}
      </CardContent>
    </Card>
  );
};
