import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Skeleton } from '@/components/ui/skeleton';
import {
  MessageSquare, Trash2, Send, Shield, Filter,
} from 'lucide-react';
import { useChallengeLiveChat } from '@/hooks/useChallengeLiveChat';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { format, formatDistanceToNow } from 'date-fns';
import { ro } from 'date-fns/locale';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

export const ChallengeAdminChat: React.FC = () => {
  const { user } = useAuth();
  const [selectedDay, setSelectedDay] = useState<string>('all');
  const [replyText, setReplyText] = useState('');
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [sending, setSending] = useState(false);

  // Fetch all live chat messages (no day filter for admin)
  const { messages, isLoading, deleteMessage } = useChallengeLiveChat();

  // Filter messages by selected day
  const filteredMessages = selectedDay === 'all'
    ? messages
    : messages.filter((m) => m.module_id === `challenge-live-chat-day-${selectedDay}`);

  const getDayFromModuleId = (moduleId: string) => {
    const match = moduleId.match(/challenge-live-chat-day-(\d+)/);
    return match ? match[1] : '?';
  };

  const handleReply = async (moduleId: string) => {
    if (!replyText.trim() || !user || sending) return;
    setSending(true);

    const authorName = 'Admin';

    try {
      const { error } = await supabase.from('warriors_way_comments').insert({
        user_id: user.id,
        module_id: moduleId,
        content: replyText.trim(),
        author_name: authorName,
        parent_id: null,
      });

      if (error) throw error;
      setReplyText('');
      setReplyingTo(null);
      toast.success('Răspuns trimis!');
    } catch (error) {
      console.error('Error sending admin reply:', error);
      toast.error('Eroare la trimiterea răspunsului');
    } finally {
      setSending(false);
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-12 w-full" />
        <Skeleton className="h-[500px] w-full" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header + Filter */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <MessageSquare className="h-5 w-5 text-primary" />
                Chat Moderare Challenge
              </CardTitle>
              <CardDescription>
                {filteredMessages.length} mesaje
                {selectedDay !== 'all' && ` din Ziua ${selectedDay}`}
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-muted-foreground" />
              <Select value={selectedDay} onValueChange={setSelectedDay}>
                <SelectTrigger className="w-[150px]">
                  <SelectValue placeholder="Filtrează" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Toate zilele</SelectItem>
                  {[1, 2, 3, 4, 5, 6, 7].map((d) => (
                    <SelectItem key={d} value={String(d)}>
                      Ziua {d}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Messages */}
      <Card>
        <CardContent className="pt-6">
          {filteredMessages.length === 0 ? (
            <p className="text-center text-muted-foreground py-12">
              Nu există mesaje în chat-ul challenge
            </p>
          ) : (
            <ScrollArea className="h-[600px] pr-4">
              <div className="space-y-3">
                {filteredMessages.map((msg) => (
                  <div
                    key={msg.id}
                    className="p-3 rounded-lg border bg-card hover:bg-accent/50 transition-colors"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-medium text-sm">
                            {msg.author_name || 'Anonim'}
                          </span>
                          <Badge variant="outline" className="text-[10px]">
                            Ziua {getDayFromModuleId(msg.module_id)}
                          </Badge>
                          <span className="text-xs text-muted-foreground">
                            {format(new Date(msg.created_at), 'dd MMM, HH:mm', {
                              locale: ro,
                            })}
                          </span>
                        </div>
                        <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                      </div>
                      <div className="flex items-center gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7"
                          onClick={() => {
                            setReplyingTo(
                              replyingTo === msg.id ? null : msg.id
                            );
                            setReplyText('');
                          }}
                        >
                          <Send className="h-3.5 w-3.5" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7 text-destructive hover:text-destructive"
                          onClick={() => deleteMessage(msg.id)}
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </div>

                    {/* Inline reply */}
                    {replyingTo === msg.id && (
                      <div className="flex gap-2 mt-2 pt-2 border-t">
                        <Input
                          value={replyText}
                          onChange={(e) => setReplyText(e.target.value)}
                          placeholder="Răspunde ca Admin..."
                          className="flex-1 h-8 text-sm"
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') handleReply(msg.module_id);
                          }}
                        />
                        <Button
                          size="sm"
                          className="h-8"
                          onClick={() => handleReply(msg.module_id)}
                          disabled={!replyText.trim() || sending}
                        >
                          <Shield className="h-3 w-3 mr-1" />
                          Trimite
                        </Button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </ScrollArea>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
