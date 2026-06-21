import { useEffect, useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { DAY_ABBREVS, type DayAbbrev, weekKeyForDate, jsDayToAbbrev } from '@/utils/timeBlockHelpers';

export interface TimeBlockTask {
  id: string;
  title: string;
  completed: boolean;
  priority: number | null;
  day_of_week: DayAbbrev | null;
  scheduled_time: string | null; // HH:mm:ss
  duration_minutes: number | null;
  list_type: string | null;
  is_key_point: boolean | null;
  week_key: string;
}

interface UseTimeBlockOptions {
  anchorDate: Date; // currently focused date; we load its ISO week
  /** Extra week keys to also load (e.g. tomorrow falls in the next ISO week). */
  extraWeekKeys?: string[];
}

export function useTimeBlockTasks({ anchorDate, extraWeekKeys = [] }: UseTimeBlockOptions) {
  const [tasks, setTasks] = useState<TimeBlockTask[]>([]);
  const [loading, setLoading] = useState(true);
  const weekKey = weekKeyForDate(anchorDate);
  const weekKeys = Array.from(new Set([weekKey, ...extraWeekKeys]));
  const weekKeysSig = weekKeys.join('|');

  const load = useCallback(async () => {
    setLoading(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { setLoading(false); return; }

    const { data, error } = await supabase
      .from('user_tasks')
      .select('id, title, completed, priority, day_of_week, scheduled_time, duration_minutes, list_type, is_key_point, week_key')
      .eq('user_id', user.id)
      .in('week_key', weekKeysSig.split('|'))
      .order('scheduled_time', { ascending: true, nullsFirst: false });

    if (!error && data) {
      setTasks(data as TimeBlockTask[]);
    }
    setLoading(false);
  }, [weekKeysSig]);

  useEffect(() => { load(); }, [load]);

  // Realtime sync
  useEffect(() => {
    let channel: ReturnType<typeof supabase.channel> | null = null;
    (async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      channel = supabase
        .channel(`time-block-${weekKeysSig}`)
        .on(
          'postgres_changes',
          { event: '*', schema: 'public', table: 'user_tasks', filter: `user_id=eq.${user.id}` },
          () => { load(); }
        )
        .subscribe();
    })();
    return () => { if (channel) supabase.removeChannel(channel); };
  }, [weekKeysSig, load]);


  const updateTask = useCallback(async (id: string, patch: Partial<TimeBlockTask>) => {
    setTasks(prev => prev.map(t => t.id === id ? { ...t, ...patch } : t));
    const { error } = await supabase
      .from('user_tasks')
      .update(patch as Record<string, unknown>)
      .eq('id', id);
    if (error) {
      console.error('updateTask error', error);
      load(); // resync on failure
    }
  }, [load]);

  const deleteTask = useCallback(async (id: string) => {
    setTasks(prev => prev.filter(t => t.id !== id));
    await supabase.from('user_tasks').delete().eq('id', id);
  }, []);

  const createTask = useCallback(async (input: {
    title: string;
    day_of_week: DayAbbrev;
    scheduled_time?: string | null;
    duration_minutes?: number | null;
    priority?: number;
  }) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    const { data, error } = await supabase
      .from('user_tasks')
      .insert({
        user_id: user.id,
        week_key: weekKey,
        title: input.title,
        day_of_week: input.day_of_week,
        scheduled_time: input.scheduled_time ?? null,
        duration_minutes: input.duration_minutes ?? 30,
        priority: input.priority ?? 2,
        list_type: 'do',
        completed: false,
      })
      .select()
      .single();
    if (!error && data) {
      setTasks(prev => [...prev, data as TimeBlockTask]);
    }
  }, [weekKey]);

  const toggleComplete = useCallback(async (id: string, completed: boolean) => {
    await updateTask(id, { completed });
  }, [updateTask]);

  return {
    tasks,
    loading,
    updateTask,
    deleteTask,
    createTask,
    toggleComplete,
    weekKey,
    refresh: load,
  };
}

export const todayAbbrev = (): DayAbbrev => jsDayToAbbrev(new Date());
export const allDays = DAY_ABBREVS;
