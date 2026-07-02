import { useEffect, useState, useCallback, useRef } from 'react';
import { useAuth } from '@/context/AuthContext';
import {
  getTodayActivity,
  DailyActivitySnapshot,
} from '@/services/dailyActivityService';
import { upsertTodayShadowSnapshot } from './useShadowCoachHistory';

export function useTodayActivity() {
  const { user } = useAuth();
  const [snapshot, setSnapshot] = useState<DailyActivitySnapshot | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const backupSavedRef = useRef(false);

  const refresh = useCallback(async () => {
    if (!user?.id) {
      setSnapshot(null);
      setIsLoading(false);
      return;
    }
    setIsLoading(true);
    try {
      const snap = await getTodayActivity(user.id);
      setSnapshot(snap);
    } catch {
      setSnapshot({
        date: new Date().toISOString().split('T')[0],
        items: [],
        countsByAxis: { body: 0, being: 0, balance: 0, business: 0, mind: 0 },
        totalCount: 0,
      });
    } finally {
      setIsLoading(false);
    }
  }, [user?.id]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  // Fallback: auto-save a shadow snapshot in the evening even if user skips
  // the evening reflection, so history/analytics always have a daily row.
  useEffect(() => {
    if (!user?.id || !snapshot || backupSavedRef.current) return;
    const hour = new Date().getHours();
    if (hour < 18) return;
    if (snapshot.totalCount === 0) return;
    backupSavedRef.current = true;
    upsertTodayShadowSnapshot({
      userId: user.id,
      countsByAxis: snapshot.countsByAxis,
      totalCount: snapshot.totalCount,
      topEvents: snapshot.items.slice(0, 25).map(i => ({
        axis: i.axis,
        label: i.label,
        source: (i as any).source,
        occurredAt: (i as any).occurredAt,
      })),
    }).catch(() => { /* silent */ });
  }, [user?.id, snapshot]);

  return { snapshot, isLoading, refresh };
}
