import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { MindShiftSession, MindShiftBelief } from '@/services/mindShiftService';
import { format } from 'date-fns';
import { ro } from 'date-fns/locale';

interface Props {
  sessions: MindShiftSession[];
  beliefs: MindShiftBelief[];
}

export const MindShiftJournalTab: React.FC<Props> = ({ sessions, beliefs }) => {
  const complete = sessions.filter((s) => s.status === 'complete' || s.completed_at);

  if (complete.length === 0) {
    return (
      <Card>
        <CardContent className="py-10 text-center text-muted-foreground">
          Niciun jurnal încă. Termină prima sesiune din "Azi".
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-3">
      {complete.map((s) => {
        const before = s.intensity_before ?? s.intensity ?? null;
        const after = s.intensity_after ?? null;
        const delta = before !== null && after !== null ? before - after : null;
        return (
          <Card key={s.id}>
            <CardHeader className="pb-2">
              <CardTitle className="text-base flex items-center justify-between gap-2">
                <span>{s.date && format(new Date(s.date), 'EEEE, d MMM yyyy', { locale: ro })}</span>
                <div className="flex gap-1 flex-wrap">
                  {s.emotion && <Badge variant="outline">{s.emotion}</Badge>}
                  {s.category && <Badge variant="secondary" className="text-[10px]">{s.category}</Badge>}
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent className="text-sm space-y-2">
              {before !== null && (
                <div className="space-y-1">
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span>Intensitate înainte</span>
                    <span className="font-medium">{before}%</span>
                  </div>
                  <Progress value={before} className="h-1.5 [&>div]:bg-red-400" />
                  {after !== null && (
                    <>
                      <div className="flex items-center justify-between text-xs text-muted-foreground mt-1">
                        <span>După reframe</span>
                        <span className="font-medium">
                          {after}% {delta !== null && delta > 0 && <span className="text-green-500">(−{delta})</span>}
                        </span>
                      </div>
                      <Progress value={after} className="h-1.5 [&>div]:bg-green-400" />
                    </>
                  )}
                </div>
              )}
              {s.automatic_thought && (
                <div><span className="text-muted-foreground">Gând: </span>„{s.automatic_thought}"</div>
              )}
              {s.cognitive_reframe && (
                <div><span className="text-muted-foreground">Reframe: </span>{s.cognitive_reframe}</div>
              )}
              {s.belief_slug && (
                <div>
                  <span className="text-muted-foreground">Credință: </span>
                  {beliefs.find((b) => b.slug === s.belief_slug)?.name ?? s.belief_slug}
                </div>
              )}
              {s.commitment_text && (
                <div className="rounded-md bg-primary/5 border border-primary/20 p-2 text-sm">
                  🎯 {s.commitment_text}
                </div>
              )}
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
};
