import { useEffect, useState, useCallback } from 'react';
import { useAuth } from '@/context/AuthContext';
import {
  getTodayActivity,
  DailyActivitySnapshot,
} from '@/services/dailyActivityService';

export function useTodayActivity() {
  const { user } = useAuth();
  const [snapshot, setSnapshot] = useState<DailyActivitySnapshot | null>(null);
  const [isLoading, setIsLoading] = useState(true);

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

  return { snapshot, isLoading, refresh };
}
