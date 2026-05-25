import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { MindShiftSession } from '@/services/mindShiftService';

interface Props {
  sessions: MindShiftSession[];
}

export const MindShiftMatrixTab: React.FC<Props> = ({ sessions }) => {
  const rows = sessions.filter((s) =>
    s.cognitive_reframe || s.positive_reframe || s.act_value
  );

  if (rows.length === 0) {
    return (
      <Card>
        <CardContent className="py-10 text-center text-muted-foreground">
          Nicio matrice încă. Procesează un gând complet ca să apară aici.
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-3">
      {rows.map((r) => (
        <Card key={r.id}>
          <CardContent className="p-4 space-y-3">
            <div className="flex flex-wrap items-center gap-2">
              {r.category && <Badge variant="outline">{r.category}</Badge>}
              {r.recurrence && (
                <Badge className="bg-violet-500/15 text-violet-700 dark:text-violet-300 hover:bg-violet-500/15">
                  {r.recurrence === 'Z' ? 'Zilnic' : r.recurrence === 'S' ? 'Săptămânal' : 'Lunar'}
                </Badge>
              )}
              {r.distortion_slug && <Badge variant="secondary">{r.distortion_slug}</Badge>}
              {typeof r.intensity_before === 'number' && typeof r.intensity_after === 'number' && (
                <Badge variant="outline" className="ml-auto">
                  {r.intensity_before}% → {r.intensity_after}% ({r.intensity_before - r.intensity_after >= 0 ? '−' : '+'}{Math.abs(r.intensity_before - r.intensity_after)})
                </Badge>
              )}
            </div>
            <p className="text-sm font-medium italic">„{r.automatic_thought || '—'}"</p>
            <div className="grid md:grid-cols-3 gap-3 text-sm">
              <div className="bg-muted/30 p-3 rounded">
                <div className="text-xs font-medium text-muted-foreground mb-1">🧠 Cognitive</div>
                {r.cognitive_reframe || <span className="text-muted-foreground italic">—</span>}
              </div>
              <div className="bg-muted/30 p-3 rounded">
                <div className="text-xs font-medium text-muted-foreground mb-1">✨ Positive</div>
                {r.positive_reframe || <span className="text-muted-foreground italic">—</span>}
              </div>
              <div className="bg-muted/30 p-3 rounded">
                <div className="text-xs font-medium text-muted-foreground mb-1">🎯 ACT</div>
                {r.act_value || <span className="text-muted-foreground italic">—</span>}
              </div>
            </div>
            {r.commitment_text && (
              <div className="text-sm rounded-md bg-primary/5 border border-primary/20 p-2">
                ✅ {r.commitment_text}
              </div>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
};
