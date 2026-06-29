import React, { useEffect, useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Activity, Moon, Utensils, Smartphone, Footprints, ArrowRight } from 'lucide-react';

interface Log {
  score: number | null;
  sleep_hours: number | null;
  movement_minutes: number | null;
  food_quality: number | null;
  tech_break_taken: boolean | null;
}

export function SelfCareWidget() {
  const navigate = useNavigate();
  const [log, setLog] = useState<Log | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;
        const today = new Date().toISOString().slice(0, 10);
        const { data } = await (supabase as any)
          .from('belief_self_care_logs')
          .select('score, sleep_hours, movement_minutes, food_quality, tech_break_taken')
          .eq('user_id', user.id)
          .eq('log_date', today)
          .maybeSingle();
        setLog(data || null);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const score = log?.score ?? null;
  const tone = score === null
    ? 'border-l-muted-foreground/30 bg-muted/30'
    : score >= 75 ? 'border-l-emerald-500 bg-emerald-500/5'
    : score >= 50 ? 'border-l-amber-500 bg-amber-500/5'
    : 'border-l-rose-500 bg-rose-500/5';

  return (
    <Card className={`p-5 border-l-4 ${tone}`}>
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <Activity className="h-4 w-4 text-primary" />
            <span className="text-xs uppercase tracking-wide text-muted-foreground">Grija de Sine — azi</span>
            {score !== null && (
              <Badge variant="outline" className="ml-2">{score}/100</Badge>
            )}
          </div>
          <h3 className="font-display text-lg font-semibold">
            {score === null ? 'Nu ai bifat încă indicatorii zilei' : 'Executive Health Dashboard'}
          </h3>
          {!loading && (
            <div className="flex items-center gap-4 mt-3 text-xs text-muted-foreground flex-wrap">
              <span className="flex items-center gap-1"><Moon className="h-3 w-3" /> {log?.sleep_hours ?? '–'}h somn</span>
              <span className="flex items-center gap-1"><Footprints className="h-3 w-3" /> {log?.movement_minutes ?? '–'} min</span>
              <span className="flex items-center gap-1"><Utensils className="h-3 w-3" /> Mâncare {log?.food_quality ?? '–'}/10</span>
              <span className="flex items-center gap-1"><Smartphone className="h-3 w-3" /> Pauză tech {log?.tech_break_taken ? '✓' : '—'}</span>
            </div>
          )}
        </div>
        <Button size="sm" variant="default" className="gap-2" onClick={() => navigate('/credinte/grija-de-sine')}>
          {score === null ? 'Bifează azi' : 'Actualizează'} <ArrowRight className="h-4 w-4" />
        </Button>
      </div>
    </Card>
  );
}
