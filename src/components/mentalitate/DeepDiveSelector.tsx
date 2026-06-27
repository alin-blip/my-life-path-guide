import React, { useEffect, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Brain, ChevronRight } from 'lucide-react';
import { AXIS_LABELS_RO } from '@/data/mentalitate-stack/questions';
import { supabase } from '@/integrations/supabase/client';

interface Props {
  onSelect: (axis: string) => void;
}

const AXES_ORDER = ['cognitiva', 'emotionala', 'afectiva', 'volitiva', 'comportamentala', 'profesionala'];

export const DeepDiveSelector: React.FC<Props> = ({ onSelect }) => {
  const [scores, setScores] = useState<Record<string, number>>({});

  useEffect(() => {
    (async () => {
      const { data } = await supabase.from('mind_axis_scores').select('axis, score_healthy');
      const m: Record<string, number> = {};
      for (const r of data ?? []) m[(r as any).axis] = (r as any).score_healthy ?? 50;
      setScores(m);
    })();
  }, []);

  const sorted = [...AXES_ORDER].sort((a, b) => (scores[a] ?? 50) - (scores[b] ?? 50));

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
      {sorted.map((axis) => {
        const info = AXIS_LABELS_RO[axis];
        const score = scores[axis];
        const hasScore = typeof score === 'number';
        return (
          <Card
            key={axis}
            className="cursor-pointer hover:border-violet-500/50 transition-colors"
            onClick={() => onSelect(axis)}
          >
            <CardContent className="p-4 space-y-2">
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-2">
                  <div className="w-9 h-9 rounded-xl bg-violet-500/15 flex items-center justify-center">
                    <Brain className="w-4 h-4 text-violet-500" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-sm">{info.name}</h4>
                    <p className="text-[11px] text-muted-foreground capitalize">{axis}</p>
                  </div>
                </div>
                {hasScore && (
                  <Badge
                    variant="outline"
                    className={
                      score < 50
                        ? 'border-rose-500/40 text-rose-600 dark:text-rose-400'
                        : score < 70
                          ? 'border-amber-500/40 text-amber-600 dark:text-amber-400'
                          : 'border-emerald-500/40 text-emerald-600 dark:text-emerald-400'
                    }
                  >
                    {Math.round(score)}/100
                  </Badge>
                )}
              </div>
              <p className="text-xs text-muted-foreground">{info.reframe}</p>
              <Button size="sm" variant="ghost" className="w-full justify-between text-violet-600 dark:text-violet-400">
                Deep-Dive 14 întrebări <ChevronRight className="w-3 h-3" />
              </Button>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
};
