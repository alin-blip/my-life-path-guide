import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { MessageSquare, User, Sparkles, Calendar } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { formatDistanceToNow, format } from 'date-fns';
import { ro } from 'date-fns/locale';
import { cn } from '@/lib/utils';

interface ChallengeConversationsTabProps {
  userId: string | null;
}

interface ConversationMessage {
  id: string;
  role: string;
  content: string;
  day_number: number;
  session_id: string | null;
  created_at: string;
}

interface GroupedSession {
  sessionId: string;
  dayNumber: number;
  messages: ConversationMessage[];
  startedAt: string;
}

export const ChallengeConversationsTab: React.FC<ChallengeConversationsTabProps> = ({ userId }) => {
  const [messages, setMessages] = useState<ConversationMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [dayFilter, setDayFilter] = useState<string>('all');

  useEffect(() => {
    if (userId) loadConversations();
  }, [userId]);

  const loadConversations = async () => {
    if (!userId) return;
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('challenge_coach_conversations')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: true });

      if (error) throw error;
      setMessages((data as ConversationMessage[]) || []);
    } catch (error) {
      console.error('Error loading conversations:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredMessages = dayFilter === 'all'
    ? messages
    : messages.filter(m => m.day_number === parseInt(dayFilter));

  // Group by session
  const groupedSessions: GroupedSession[] = [];
  const sessionMap = new Map<string, ConversationMessage[]>();

  filteredMessages.forEach(msg => {
    const key = msg.session_id || msg.created_at;
    if (!sessionMap.has(key)) sessionMap.set(key, []);
    sessionMap.get(key)!.push(msg);
  });

  sessionMap.forEach((msgs, sessionId) => {
    groupedSessions.push({
      sessionId,
      dayNumber: msgs[0].day_number,
      messages: msgs,
      startedAt: msgs[0].created_at,
    });
  });

  // Sort sessions by most recent first
  groupedSessions.sort((a, b) => new Date(b.startedAt).getTime() - new Date(a.startedAt).getTime());

  // Get unique days for filter
  const uniqueDays = [...new Set(messages.map(m => m.day_number))].sort();

  if (!userId) {
    return (
      <Card>
        <CardContent className="py-12 text-center text-muted-foreground">
          Acest contact nu are un cont activ
        </CardContent>
      </Card>
    );
  }

  if (loading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-10 w-48" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Filter */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <MessageSquare className="h-5 w-5 text-primary" />
          <h3 className="font-semibold">Conversații AI Coach</h3>
          <Badge variant="secondary">{messages.length} mesaje</Badge>
        </div>
        <Select value={dayFilter} onValueChange={setDayFilter}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Filtru zi" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Toate zilele</SelectItem>
            <SelectItem value="0">Overview (Day 0)</SelectItem>
            {uniqueDays.filter(d => d > 0).map(day => (
              <SelectItem key={day} value={String(day)}>Ziua {day}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {groupedSessions.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center text-muted-foreground">
            Nu există conversații cu AI Coach
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {groupedSessions.map((session) => (
            <Card key={session.sessionId}>
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    Ziua {session.dayNumber}
                  </CardTitle>
                  <span className="text-xs text-muted-foreground">
                    {format(new Date(session.startedAt), 'dd MMM yyyy, HH:mm', { locale: ro })}
                    {' · '}
                    {formatDistanceToNow(new Date(session.startedAt), { addSuffix: true, locale: ro })}
                  </span>
                </div>
              </CardHeader>
              <CardContent>
                <ScrollArea className="max-h-[400px]">
                  <div className="space-y-3">
                    {session.messages.map((msg) => (
                      <div
                        key={msg.id}
                        className={cn(
                          'flex gap-2',
                          msg.role === 'user' ? 'justify-end' : 'justify-start'
                        )}
                      >
                        {msg.role === 'assistant' && (
                          <div className="w-6 h-6 rounded-full bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center flex-shrink-0 mt-1">
                            <Sparkles className="w-3 h-3 text-white" />
                          </div>
                        )}
                        <div
                          className={cn(
                            'max-w-[80%] rounded-xl px-3 py-2 text-sm',
                            msg.role === 'user'
                              ? 'bg-primary text-primary-foreground'
                              : 'bg-muted'
                          )}
                        >
                          <p className="whitespace-pre-wrap">{msg.content}</p>
                          <p className="text-[10px] opacity-60 mt-1">
                            {format(new Date(msg.created_at), 'HH:mm')}
                          </p>
                        </div>
                        {msg.role === 'user' && (
                          <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0 mt-1">
                            <User className="w-3 h-3 text-primary" />
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};
