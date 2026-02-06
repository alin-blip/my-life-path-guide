import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Skeleton } from '@/components/ui/skeleton';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { MessageSquare, User, Sparkles, Calendar, TrendingUp, Users } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { format, formatDistanceToNow } from 'date-fns';
import { ro } from 'date-fns/locale';
import { cn } from '@/lib/utils';

interface ConversationRow {
  id: string;
  user_id: string;
  role: string;
  content: string;
  day_number: number;
  session_id: string | null;
  created_at: string;
}

interface SessionGroup {
  sessionId: string;
  userId: string;
  userEmail: string;
  dayNumber: number;
  messages: ConversationRow[];
  startedAt: string;
  preview: string;
}

export const CRMConversationsDashboard: React.FC = () => {
  const [conversations, setConversations] = useState<ConversationRow[]>([]);
  const [contactEmails, setContactEmails] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [dayFilter, setDayFilter] = useState<string>('all');
  const [expandedSession, setExpandedSession] = useState<string | null>(null);

  useEffect(() => {
    loadConversations();
  }, []);

  const loadConversations = async () => {
    try {
      setLoading(true);
      
      // Load recent conversations
      const { data, error } = await supabase
        .from('challenge_coach_conversations')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(500);

      if (error) throw error;
      const convos = (data as ConversationRow[]) || [];
      setConversations(convos);

      // Load contact emails for all unique user_ids
      const uniqueUserIds = [...new Set(convos.map(c => c.user_id))];
      if (uniqueUserIds.length > 0) {
        const { data: contacts } = await supabase
          .from('crm_contact_profiles')
          .select('user_id, email, name')
          .in('user_id', uniqueUserIds);

        const emailMap: Record<string, string> = {};
        contacts?.forEach(c => {
          if (c.user_id) {
            emailMap[c.user_id] = c.name || c.email;
          }
        });
        setContactEmails(emailMap);
      }
    } catch (error) {
      console.error('Error loading conversations:', error);
    } finally {
      setLoading(false);
    }
  };

  // Filter by day
  const filtered = dayFilter === 'all'
    ? conversations
    : conversations.filter(c => c.day_number === parseInt(dayFilter));

  // Group by session
  const sessionsMap = new Map<string, ConversationRow[]>();
  // Sort ascending for grouping
  const sortedAsc = [...filtered].sort((a, b) => 
    new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
  );
  
  sortedAsc.forEach(msg => {
    const key = msg.session_id || `${msg.user_id}_${msg.created_at}`;
    if (!sessionsMap.has(key)) sessionsMap.set(key, []);
    sessionsMap.get(key)!.push(msg);
  });

  const sessions: SessionGroup[] = [];
  sessionsMap.forEach((msgs, sessionId) => {
    const userMessages = msgs.filter(m => m.role === 'user');
    sessions.push({
      sessionId,
      userId: msgs[0].user_id,
      userEmail: contactEmails[msgs[0].user_id] || msgs[0].user_id.slice(0, 8),
      dayNumber: msgs[0].day_number,
      messages: msgs,
      startedAt: msgs[0].created_at,
      preview: userMessages[0]?.content.slice(0, 100) || 'No user message',
    });
  });

  // Sort sessions by most recent first
  sessions.sort((a, b) => new Date(b.startedAt).getTime() - new Date(a.startedAt).getTime());

  // Stats
  const totalSessions = sessions.length;
  const uniqueUsers = new Set(conversations.map(c => c.user_id)).size;
  const uniqueDays = [...new Set(conversations.map(c => c.day_number))].sort();
  const userMessages = conversations.filter(c => c.role === 'user');

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="grid grid-cols-3 gap-4">
          <Skeleton className="h-24" />
          <Skeleton className="h-24" />
          <Skeleton className="h-24" />
        </div>
        <Skeleton className="h-96" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <MessageSquare className="h-8 w-8 text-primary" />
              <div>
                <p className="text-2xl font-bold">{totalSessions}</p>
                <p className="text-sm text-muted-foreground">Conversații totale</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <Users className="h-8 w-8 text-primary" />
              <div>
                <p className="text-2xl font-bold">{uniqueUsers}</p>
                <p className="text-sm text-muted-foreground">Utilizatori unici</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <TrendingUp className="h-8 w-8 text-primary" />
              <div>
                <p className="text-2xl font-bold">{userMessages.length}</p>
                <p className="text-sm text-muted-foreground">Întrebări utilizatori</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filter */}
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-lg">Conversații recente</h3>
        <Select value={dayFilter} onValueChange={setDayFilter}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Filtru zi" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Toate zilele</SelectItem>
            <SelectItem value="0">Overview (Day 0)</SelectItem>
            {[1, 2, 3, 4, 5, 6, 7].map(day => (
              <SelectItem key={day} value={String(day)}>Ziua {day}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Sessions list */}
      {sessions.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center text-muted-foreground">
            Nu există conversații încă
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {sessions.map((session) => (
            <Card 
              key={session.sessionId} 
              className={cn(
                'cursor-pointer transition-colors hover:border-primary/50',
                expandedSession === session.sessionId && 'border-primary'
              )}
              onClick={() => setExpandedSession(
                expandedSession === session.sessionId ? null : session.sessionId
              )}
            >
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                      <User className="w-4 h-4 text-primary" />
                    </div>
                    <div>
                      <p className="font-medium text-sm">{session.userEmail}</p>
                      <p className="text-xs text-muted-foreground">
                        Ziua {session.dayNumber} · {session.messages.length} mesaje
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <Badge variant="outline" className="text-xs">
                      Day {session.dayNumber}
                    </Badge>
                    <p className="text-xs text-muted-foreground mt-1">
                      {formatDistanceToNow(new Date(session.startedAt), { addSuffix: true, locale: ro })}
                    </p>
                  </div>
                </div>
                {expandedSession !== session.sessionId && (
                  <p className="text-sm text-muted-foreground mt-2 truncate pl-11">
                    "{session.preview}"
                  </p>
                )}
              </CardHeader>

              {expandedSession === session.sessionId && (
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
              )}
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};
