import React, { useEffect, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Brain, Loader2, Target } from 'lucide-react';
import { format } from 'date-fns';
import { ro } from 'date-fns/locale';
import { mentalitateStackService, MentalitateSession } from '@/services/mentalitateStackService';
import { AXIS_LABELS_RO } from '@/data/mentalitate-stack/questions';

export const SessionHistory: React.FC = () => {
  const [sessions, setSessions] = useState<MentalitateSession[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    mentalitateStackService.getRecentSessions(30)
      .then(setSessions)
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-10 text-muted-foreground">
        <Loader2 className="w-5 h-5 animate-spin" />
      </div>
    );
  }

  const completed = sessions.filter((s) => s.completed);
  if (completed.length === 0) {
    return (
      <div className="text-center py-10 text-sm text-muted-foreground">
        Nu ai încă reconstrucții finalizate. Începe prima ta sesiune din tab-ul «Reconstrucția Mentală».
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {completed.map((s) => (
        <Card key={s.id} className="border-border/60">
          <CardContent className="p-4 space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Brain className="w-4 h-4 text-violet-500" />
                <span className="text-xs text-muted-foreground">
                  {format(new Date(s.created_at), "d MMM yyyy 'la' HH:mm", { locale: ro })}
                </span>
                <Badge variant="outline" className="text-[10px]">
                  {s.mode === 'daily' ? 'Zilnic' : 'Deep-Dive'}
                </Badge>
                {s.deep_dive_axis && (
                  <Badge variant="outline" className="text-[10px] border-violet-500/40">
                    {AXIS_LABELS_RO[s.deep_dive_axis]?.name ?? s.deep_dive_axis}
                  </Badge>
                )}
              </div>
              {s.distortion_detected && (
                <Badge variant="secondary" className="text-[10px]">{s.distortion_detected}</Badge>
              )}
            </div>
            {s.reframe && (
              <div className="text-sm leading-relaxed">{s.reframe}</div>
            )}
            {s.action && (
              <div className="flex items-start gap-2 text-xs bg-emerald-500/5 border border-emerald-500/20 rounded-md p-2">
                <Target className="w-3 h-3 text-emerald-500 mt-0.5 shrink-0" />
                <span>{s.action}</span>
              </div>
            )}
            {s.axes_impacted?.length > 0 && (
              <div className="flex flex-wrap gap-1">
                {s.axes_impacted.map((a) => (
                  <Badge key={a} variant="outline" className="text-[10px]">
                    {AXIS_LABELS_RO[a]?.name ?? a}
                  </Badge>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
};
