import React, { useEffect, useState, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/context/AuthContext';
import { useLanguage } from '@/context/LanguageContext';
import { BrotherhoodMessage } from '@/hooks/useBrotherhood';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Send } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { ro } from 'date-fns/locale';

interface GroupChatProps {
  tribeId: string;
  isMember: boolean;
}

export const GroupChat: React.FC<GroupChatProps> = ({ tribeId, isMember }) => {
  const { user } = useAuth();
  const { language } = useLanguage();
  const [messages, setMessages] = useState<BrotherhoodMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [sending, setSending] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  const fetchMessages = async () => {
    const { data } = await supabase
      .from('brotherhood_messages')
      .select('*')
      .eq('tribe_id', tribeId)
      .order('created_at', { ascending: true })
      .limit(200);

    if (data && data.length > 0) {
      const userIds = [...new Set(data.map((m) => m.sender_id))];
      const { data: profiles } = await supabase
        .from('leaderboard_profiles')
        .select('user_id, display_name, avatar_emoji')
        .in('user_id', userIds);

      setMessages(
        data.map((msg) => ({
          ...msg,
          message_type: msg.message_type as 'text' | 'image' | 'file' | 'system',
          sender: profiles?.find((p) => p.user_id === msg.sender_id) || {
            display_name: 'Warrior',
            avatar_emoji: '⚔️',
          },
        }))
      );
    } else {
      setMessages([]);
    }
  };

  useEffect(() => {
    fetchMessages();

    const channel = supabase
      .channel(`group_chat_${tribeId}`)
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'brotherhood_messages',
        filter: `tribe_id=eq.${tribeId}`,
      }, async (payload) => {
        const newMsg = payload.new as any;
        const { data: profile } = await supabase
          .from('leaderboard_profiles')
          .select('user_id, display_name, avatar_emoji')
          .eq('user_id', newMsg.sender_id)
          .maybeSingle();

        setMessages((prev) => [
          ...prev,
          {
            ...newMsg,
            message_type: newMsg.message_type as 'text' | 'image' | 'file' | 'system',
            sender: profile || { display_name: 'Warrior', avatar_emoji: '⚔️' },
          },
        ]);
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [tribeId]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async () => {
    if (!user || !newMessage.trim()) return;
    setSending(true);

    await supabase.from('brotherhood_messages').insert({
      sender_id: user.id,
      tribe_id: tribeId,
      content: newMessage.trim(),
      message_type: 'text',
    });

    setNewMessage('');
    setSending(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="flex flex-col h-[60vh] bg-card border border-border rounded-xl overflow-hidden">
      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {messages.length === 0 ? (
          <div className="flex items-center justify-center h-full text-muted-foreground text-sm">
            {language === 'ro' ? 'Niciun mesaj încă. Începe conversația!' : 'No messages yet. Start the conversation!'}
          </div>
        ) : (
          messages.map((msg) => {
            const isOwn = msg.sender_id === user?.id;
            return (
              <div
                key={msg.id}
                className={`flex items-start gap-2.5 ${isOwn ? 'flex-row-reverse' : ''}`}
              >
                <Avatar className="w-8 h-8 shrink-0">
                  <AvatarFallback className="bg-muted text-xs">
                    {msg.sender?.avatar_emoji || '⚔️'}
                  </AvatarFallback>
                </Avatar>
                <div className={`max-w-[70%] ${isOwn ? 'items-end' : 'items-start'}`}>
                  <div className="flex items-center gap-2 mb-0.5">
                    <span className="text-xs font-medium text-foreground">
                      {msg.sender?.display_name || 'Warrior'}
                    </span>
                    <span className="text-[10px] text-muted-foreground">
                      {formatDistanceToNow(new Date(msg.created_at), {
                        addSuffix: true,
                        locale: language === 'ro' ? ro : undefined,
                      })}
                    </span>
                  </div>
                  <div
                    className={`rounded-xl px-3 py-2 text-sm ${
                      isOwn
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-muted text-foreground'
                    }`}
                  >
                    {msg.content}
                  </div>
                </div>
              </div>
            );
          })
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      {isMember ? (
        <div className="border-t border-border p-3 flex items-center gap-2">
          <Input
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={language === 'ro' ? 'Scrie un mesaj...' : 'Type a message...'}
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
        <div className="border-t border-border p-3 text-center text-sm text-muted-foreground">
          {language === 'ro' ? 'Alătură-te grupului pentru a trimite mesaje.' : 'Join the group to send messages.'}
        </div>
      )}
    </div>
  );
};
