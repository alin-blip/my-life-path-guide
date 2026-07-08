import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/context/AuthContext';
import { ACHIEVEMENT_MAP, type AchievementDef } from '@/data/achievements';
import { toast } from 'sonner';

export interface UnlockedAchievement {
  key: string;
  unlocked_at: string;
  seen: boolean;
  metadata: Record<string, unknown>;
  def?: AchievementDef;
}

export const useAchievements = () => {
  const { user } = useAuth();
  const [unlocked, setUnlocked] = useState<UnlockedAchievement[]>([]);
  const [loading, setLoading] = useState(false);

  const refresh = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    try {
      const { data } = await supabase
        .from('achievement_unlocks')
        .select('achievement_key, unlocked_at, seen, metadata')
        .eq('user_id', user.id)
        .order('unlocked_at', { ascending: false });
      setUnlocked(
        (data ?? []).map((r) => ({
          key: r.achievement_key,
          unlocked_at: r.unlocked_at,
          seen: r.seen,
          metadata: (r.metadata as Record<string, unknown>) ?? {},
          def: ACHIEVEMENT_MAP[r.achievement_key],
        })),
      );
    } finally {
      setLoading(false);
    }
  }, [user]);

  const check = useCallback(async (opts?: { silent?: boolean }) => {
    if (!user) return { newly: [] as string[] };
    try {
      const { data, error } = await supabase.functions.invoke('check-achievements', { body: {} });
      if (error) throw error;
      const newly = (data?.newly_unlocked ?? []) as Array<{ key: string }>;
      if (!opts?.silent && newly.length > 0) {
        for (const n of newly) {
          const def = ACHIEVEMENT_MAP[n.key];
          if (def) {
            toast.success(`${def.icon} ${def.title}`, {
              description: def.reward ? `${def.description} — ${def.reward}` : def.description,
              duration: 6000,
            });
          }
        }
        await refresh();
      }
      return { newly: newly.map((n) => n.key) };
    } catch (e) {
      console.warn('check-achievements failed', e);
      return { newly: [] as string[] };
    }
  }, [user, refresh]);

  const markSeen = useCallback(async (keys: string[]) => {
    if (!user || keys.length === 0) return;
    await supabase
      .from('achievement_unlocks')
      .update({ seen: true })
      .eq('user_id', user.id)
      .in('achievement_key', keys);
    setUnlocked((prev) => prev.map((u) => (keys.includes(u.key) ? { ...u, seen: true } : u)));
  }, [user]);

  useEffect(() => { refresh(); }, [refresh]);

  return { unlocked, loading, check, refresh, markSeen };
};
