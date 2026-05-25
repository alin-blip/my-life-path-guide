import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Brain, Trash2, MessageSquare, Sparkles, Clock } from 'lucide-react';
import { MindShiftSession, mindShiftService } from '@/services/mindShiftService';
import { format } from 'date-fns';
import { ro } from 'date-fns/locale';
import { toast } from 'sonner';

interface Props {
  drafts: MindShiftSession[];
  onResume: (session: MindShiftSession) => void;
  onRefresh: () => void;
}

export const MindShiftInboxTab: React.FC<Props> = ({ drafts, onResume, onRefresh }) => {
  const [deleting, setDeleting] = useState<string | null>(null);

  const handleDelete = async (id: string) => {
    if (!confirm('Șterg acest gând?')) return;
    setDeleting(id);
    try {
      await mindShiftService.deleteSession(id);
      toast.success('Șters');
      onRefresh();
    } catch (e: any) {
      toast.error(e.message ?? 'Eroare');
    } finally {
      setDeleting(null);
    }
  };

  if (drafts.length === 0) {
    return (
      <Card>
        <CardContent className="py-10 text-center text-muted-foreground">
          <Sparkles className="h-8 w-8 mx-auto mb-2 opacity-50" />
          <p>Nicio captură nelucrată. Folosește widget-ul "Notează un gând" din Dashboard sau începe direct din tabul "Azi".</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-3">
      {drafts.map((d) => (
        <Card key={d.id} className="hover:border-primary/40 transition-colors">
          <CardHeader className="pb-2">
            <div className="flex items-start justify-between gap-2">
              <div className="flex-1 min-w-0">
                <CardTitle className="text-base line-clamp-2">
                  {d.title || d.automatic_thought || '(gând fără text)'}
                </CardTitle>
                <div className="flex flex-wrap gap-1 mt-1 text-xs">
                  <Badge variant="outline" className="text-[10px]">
                    {d.status === 'draft' ? 'draft' : 'în lucru'}
                  </Badge>
                  {d.category && <Badge variant="secondary" className="text-[10px]">{d.category}</Badge>}
                  {d.recurrence && <Badge className="text-[10px] bg-violet-500/15 text-violet-700 dark:text-violet-300 hover:bg-violet-500/15">{d.recurrence}</Badge>}
                  <span className="text-muted-foreground flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    {d.created_at && format(new Date(d.created_at), 'd MMM HH:mm', { locale: ro })}
                  </span>
                </div>
              </div>
            </div>
          </CardHeader>
          <CardContent className="pt-0 flex gap-2">
            <Button size="sm" onClick={() => onResume(d)} className="flex-1">
              <MessageSquare className="h-4 w-4 mr-1" />
              {d.chat_step && d.chat_step > 0 ? `Continuă (pas ${d.chat_step}/7)` : 'Prelucrează'}
            </Button>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => handleDelete(d.id!)}
              disabled={deleting === d.id}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};
