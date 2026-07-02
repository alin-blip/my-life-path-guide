import { useEffect, useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/context/AuthContext';

export interface ShadowSnapshotRow {
  id: string;
  date: string;
  counts_by_axis: Record<string, number>;
  total_count: number;
  top_events: Array<{ axis: string; label: string; source: string }>;
  axes_scores: Record<string, number>;
  reflection?: { done_well?: string; learned?: string; not_done?: string } | null;
}

export function useShadowCoachHistory(days = 7) {
  const { user } = useAuth();
  const [rows, setRows] = useState<ShadowSnapshotRow[]>([]);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    if (!user?.id) { setLoading(false); return; }
    setLoading(true);
    try {
      const since = new Date();
      since.setDate(since.getDate() - days);
      const { data } = await (supabase as any)
        .from('shadow_coach_daily_snapshots')
        .select('*')
        .eq('user_id', user.id)
        .gte('date', since.toISOString().split('T')[0])
        .order('date', { ascending: false });
      setRows((data as any) ?? []);
    } finally {
      setLoading(false);
    }
  }, [user?.id, days]);

  useEffect(() => { refresh(); }, [refresh]);

  return { rows, loading, refresh };
}

/** Save today's snapshot from a client-side ActivitySnapshot. Called on evening reflection completion. */
export async function upsertTodayShadowSnapshot(params: {
  userId: string;
  countsByAxis: Record<string, number>;
  totalCount: number;
  topEvents: Array<{ axis: string; label: string; source?: string; occurredAt?: string }>;
  reflection?: { done_well?: string | null; learned?: string | null; not_done?: string | null };
}) {
  const { userId, countsByAxis, totalCount, topEvents, reflection } = params;
  const today = new Date().toISOString().split('T')[0];

  const { data: axesData } = await supabase
    .from('mind_axis_scores')
    .select('axis,score_healthy')
    .eq('user_id', userId);
  const axesScores: Record<string, number> = {};
  (axesData ?? []).forEach((a: any) => {
    axesScores[a.axis] = Math.round(Number(a.score_healthy ?? 0));
  });

  await (supabase as any)
    .from('shadow_coach_daily_snapshots')
    .upsert({
      user_id: userId,
      date: today,
      counts_by_axis: countsByAxis,
      total_count: totalCount,
      top_events: topEvents.slice(0, 25),
      axes_scores: axesScores,
      reflection: reflection ?? null,
    }, { onConflict: 'user_id,date' });
}
