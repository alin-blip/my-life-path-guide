import React, { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { MindShiftSession } from '@/services/mindShiftService';

interface Props {
  sessions: MindShiftSession[];
}

const AREAS = ['Sine', 'Familie', 'Echipă', 'Business', 'Misiune', 'Spirit', 'Neasignat'] as const;

export const MindShiftPerceptieTab: React.FC<Props> = ({ sessions }) => {
  const grouped = useMemo(() => {
    const buckets: Record<string, MindShiftSession[]> = {};
    AREAS.forEach((a) => (buckets[a] = []));
    sessions.forEach((s) => {
      const k = (s.perception_area as string) || 'Neasignat';
      if (!buckets[k]) buckets[k] = [];
      buckets[k].push(s);
    });
    return buckets;
  }, [sessions]);

  return (
    <div className="space-y-3">
      <Card className="bg-muted/30 border-dashed">
        <CardContent className="p-3 text-xs text-muted-foreground">
          Aria de percepție se setează din chat-ul de procesare ("unde apare cel mai des acest gând?"). Vezi distribuția gândurilor pe arii pentru a identifica unde se formează tipare.
        </CardContent>
      </Card>
      {AREAS.map((area) => {
        const items = grouped[area] ?? [];
        if (items.length === 0) return null;
        return (
          <Card key={area}>
            <CardHeader className="pb-2">
              <CardTitle className="text-base flex items-center gap-2">
                {area}
                <Badge variant="secondary">{items.length}</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {items.map((s) => (
                <div key={s.id} className="text-sm flex items-start gap-2">
                  <span className="text-muted-foreground">•</span>
                  <span className="flex-1">„{s.automatic_thought || s.title || '—'}"</span>
                  {s.recurrence && <Badge variant="outline" className="text-[10px]">{s.recurrence}</Badge>}
                </div>
              ))}
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
};
