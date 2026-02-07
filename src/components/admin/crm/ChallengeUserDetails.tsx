import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  MessageSquare, FileText, Eye, AlertCircle,
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { format } from 'date-fns';
import { ro } from 'date-fns/locale';

interface ChallengeUserDetailsProps {
  userId: string;
}

interface UserComment {
  id: string;
  content: string;
  module_id: string;
  created_at: string;
  author_name: string | null;
}

interface Day1Response {
  question_1: string | null;
  question_2: string | null;
  question_3: string | null;
  question_4: string | null;
  question_5: string | null;
  vision_body: string | null;
  vision_spirit: string | null;
  vision_relationships: string | null;
  vision_business: string | null;
  vision_declaration: string | null;
  target_date: string | null;
  what_i_will_give: string | null;
  commitment_confirmed: boolean | null;
  created_at: string | null;
}

export const ChallengeUserDetails: React.FC<ChallengeUserDetailsProps> = ({ userId }) => {
  const [loading, setLoading] = useState(true);
  const [comments, setComments] = useState<UserComment[]>([]);
  const [day1Data, setDay1Data] = useState<Day1Response | null>(null);

  useEffect(() => {
    loadData();
  }, [userId]);

  const loadData = async () => {
    try {
      setLoading(true);

      // Fetch user's comments across all challenge modules
      const { data: commentsData } = await supabase
        .from('warriors_way_comments')
        .select('id, content, module_id, created_at, author_name')
        .eq('user_id', userId)
        .like('module_id', 'challenge%')
        .order('created_at', { ascending: false })
        .limit(50);

      setComments(commentsData || []);

      // Fetch Day 1 responses
      const { data: day1 } = await supabase
        .from('challenge_day1_responses')
        .select('*')
        .eq('user_id', userId)
        .maybeSingle();

      setDay1Data(day1);
    } catch (error) {
      console.error('Error loading challenge user details:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-32 w-full" />
        <Skeleton className="h-32 w-full" />
      </div>
    );
  }

  const getModuleLabel = (moduleId: string) => {
    if (moduleId.startsWith('challenge-live-chat-day-')) {
      const day = moduleId.replace('challenge-live-chat-day-', '');
      return `Chat Ziua ${day}`;
    }
    if (moduleId.startsWith('challenge-day-')) {
      const day = moduleId.replace('challenge-day-', '');
      return `Comunitate Ziua ${day}`;
    }
    return moduleId;
  };

  return (
    <div className="space-y-4">
      {/* Day 1 Responses */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base">
            <FileText className="h-4 w-4 text-purple-500" />
            Răspunsuri Ziua 1
          </CardTitle>
          <CardDescription>Viziune, declarație și exerciții</CardDescription>
        </CardHeader>
        <CardContent>
          {!day1Data ? (
            <p className="text-sm text-muted-foreground text-center py-4">
              Nu a completat exercițiile din Ziua 1
            </p>
          ) : (
            <ScrollArea className="max-h-[400px]">
              <div className="space-y-3">
                {day1Data.vision_declaration && (
                  <div className="p-3 rounded-lg bg-primary/5 border border-primary/20">
                    <p className="text-xs font-semibold text-primary mb-1">📜 Declarație Napoleon Hill</p>
                    <p className="text-sm whitespace-pre-wrap">{day1Data.vision_declaration}</p>
                  </div>
                )}

                {[
                  { label: '💪 Viziune Corp', value: day1Data.vision_body },
                  { label: '✨ Viziune Spirit', value: day1Data.vision_spirit },
                  { label: '💕 Viziune Relații', value: day1Data.vision_relationships },
                  { label: '💰 Viziune Business', value: day1Data.vision_business },
                  { label: '🎯 Dată țintă', value: day1Data.target_date },
                  { label: '🔥 Ce voi oferi', value: day1Data.what_i_will_give },
                ].map(
                  (item) =>
                    item.value && (
                      <div key={item.label} className="p-2 rounded border">
                        <p className="text-xs font-medium text-muted-foreground mb-1">{item.label}</p>
                        <p className="text-sm">{item.value}</p>
                      </div>
                    )
                )}

                {/* WHY Questions */}
                {[1, 2, 3, 4, 5].map((q) => {
                  const value = day1Data[`question_${q}` as keyof Day1Response];
                  return value ? (
                    <div key={q} className="p-2 rounded border">
                      <p className="text-xs font-medium text-muted-foreground mb-1">
                        Întrebarea {q}
                      </p>
                      <p className="text-sm">{String(value)}</p>
                    </div>
                  ) : null;
                })}

                {day1Data.commitment_confirmed && (
                  <Badge className="bg-green-500">✅ Commitment confirmat</Badge>
                )}
              </div>
            </ScrollArea>
          )}
        </CardContent>
      </Card>

      {/* User Comments */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base">
            <MessageSquare className="h-4 w-4 text-blue-500" />
            Comentarii Challenge
            <Badge variant="secondary">{comments.length}</Badge>
          </CardTitle>
          <CardDescription>Toate mesajele din chat și comunitate</CardDescription>
        </CardHeader>
        <CardContent>
          {comments.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-4">
              Nu a lăsat comentarii în challenge
            </p>
          ) : (
            <ScrollArea className="max-h-[300px]">
              <div className="space-y-2">
                {comments.map((comment) => (
                  <div key={comment.id} className="p-2 rounded border text-sm">
                    <div className="flex items-center gap-2 mb-1">
                      <Badge variant="outline" className="text-[10px]">
                        {getModuleLabel(comment.module_id)}
                      </Badge>
                      <span className="text-xs text-muted-foreground">
                        {format(new Date(comment.created_at), 'dd MMM, HH:mm', { locale: ro })}
                      </span>
                    </div>
                    <p className="whitespace-pre-wrap">{comment.content}</p>
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
