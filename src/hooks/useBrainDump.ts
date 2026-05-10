import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { format, addDays } from 'date-fns';
import { getActiveWeekKey, getTomorrowAbbrev } from '@/utils/weekUtils';
import { toast } from 'sonner';

export type BrainDumpType = 'task' | 'thought' | 'idea' | 'gratitude';

export interface BrainDumpItem {
  id: string; // local uuid
  text: string;
  type: BrainDumpType;
  priority?: 1 | 2 | 3 | 4; // for task
  suggestedDay?: 'M' | 'T' | 'W' | 'Th' | 'F' | 'Sa' | 'Su';
  destination?: 'hit' | 'do';
  ignored?: boolean;
}

export function useBrainDump() {
  const [analyzing, setAnalyzing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [items, setItems] = useState<BrainDumpItem[]>([]);

  const analyze = async (text: string) => {
    if (!text.trim()) {
      toast.error('Scrie ceva înainte de analiză');
      return;
    }
    setAnalyzing(true);
    try {
      const { data, error } = await supabase.functions.invoke('evening-brain-dump', {
        body: { text },
      });
      if (error) throw error;
      const raw = (data?.items ?? []) as Omit<BrainDumpItem, 'id'>[];
      const tomorrow = getTomorrowAbbrev() as BrainDumpItem['suggestedDay'];
      setItems(
        raw.map((it) => ({
          ...it,
          id: crypto.randomUUID(),
          suggestedDay: it.type === 'task' ? it.suggestedDay ?? tomorrow : undefined,
          destination: it.type === 'task' ? it.destination ?? 'hit' : undefined,
          priority: it.type === 'task' ? (it.priority ?? 3) : undefined,
        }))
      );
      toast.success(`AI a identificat ${raw.length} ${raw.length === 1 ? 'item' : 'itemi'}`);
    } catch (e: any) {
      console.error('Brain dump analyze error:', e);
      toast.error(e?.message || 'Eroare la analiză');
    } finally {
      setAnalyzing(false);
    }
  };

  const updateItem = (id: string, patch: Partial<BrainDumpItem>) => {
    setItems((prev) => prev.map((it) => (it.id === id ? { ...it, ...patch } : it)));
  };

  const removeItem = (id: string) => {
    setItems((prev) => prev.filter((it) => it.id !== id));
  };

  const saveAll = async (): Promise<boolean> => {
    const active = items.filter((i) => !i.ignored);
    if (active.length === 0) {
      toast.error('Nimic de salvat');
      return false;
    }
    setSaving(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) {
        toast.error('Trebuie să fii autentificat');
        return false;
      }
      const userId = session.user.id;
      const today = format(new Date(), 'yyyy-MM-dd');
      const tomorrowDate = addDays(new Date(), 1);
      const weekKey = getActiveWeekKey(tomorrowDate);

      const tasks = active.filter((i) => i.type === 'task');
      const thoughts = active.filter((i) => i.type === 'thought');
      const ideas = active.filter((i) => i.type === 'idea');
      const gratitudes = active.filter((i) => i.type === 'gratitude');

      const ops: Promise<any>[] = [];

      // Tasks → user_tasks
      if (tasks.length > 0) {
        const rows = tasks.map((t, idx) => ({
          user_id: userId,
          task_id: crypto.randomUUID(),
          title: t.text,
          list_type: t.destination ?? 'hit',
          task_type: t.destination ?? 'hit',
          week_key: weekKey,
          day_of_week: t.suggestedDay ?? null,
          priority: t.priority ?? 3,
          completed: false,
          position: idx,
        }));
        ops.push(Promise.resolve(supabase.from('user_tasks').insert(rows)));
      }

      // Ideas → ideas_bank
      if (ideas.length > 0) {
        const rows = ideas.map((i) => ({
          user_id: userId,
          text: i.text,
          category: 'personal',
          status: 'new',
          priority: 1,
        }));
        ops.push(Promise.resolve(supabase.from('ideas_bank').insert(rows)));
      }

      // Thoughts + gratitudes → daily_progress (merge)
      if (thoughts.length > 0 || gratitudes.length > 0) {
        const { data: existing } = await supabase
          .from('daily_progress')
          .select('notes, progress_data')
          .eq('user_id', userId)
          .eq('date', today)
          .maybeSingle();

        const stamp = format(new Date(), 'dd.MM HH:mm');
        const newThoughtBlock = thoughts.length
          ? `\n\n[Brain Dump ${stamp}]\n` + thoughts.map((t) => `• ${t.text}`).join('\n')
          : '';
        const mergedNotes = (existing?.notes || '') + newThoughtBlock;

        const prevData = (existing?.progress_data as any) || {};
        const prevGratitudes: string[] = Array.isArray(prevData.gratitudes) ? prevData.gratitudes : [];
        const mergedGratitudes = [...prevGratitudes, ...gratitudes.map((g) => g.text)];

        const newData = {
          ...prevData,
          gratitudes: mergedGratitudes,
          brain_dump: true,
          brain_dump_last: new Date().toISOString(),
        };

        ops.push(
          Promise.resolve(
            supabase.from('daily_progress').upsert(
              {
                user_id: userId,
                date: today,
                notes: mergedNotes,
                progress_data: newData,
              },
              { onConflict: 'user_id,date' }
            )
          )
        );
      }

      const results = await Promise.all(ops);
      const firstErr = results.find((r: any) => r?.error)?.error;
      if (firstErr) throw firstErr;

      toast.success(
        `Salvat: ${tasks.length} task${tasks.length !== 1 ? 'uri' : ''}, ${thoughts.length} gând${thoughts.length !== 1 ? 'uri' : ''}, ${ideas.length} ide${ideas.length !== 1 ? 'i' : 'e'}, ${gratitudes.length} mulțumir${gratitudes.length !== 1 ? 'i' : 'e'}`
      );
      setItems([]);
      return true;
    } catch (e: any) {
      console.error('Brain dump save error:', e);
      toast.error(e?.message || 'Eroare la salvare');
      return false;
    } finally {
      setSaving(false);
    }
  };

  return { items, analyzing, saving, analyze, updateItem, removeItem, saveAll, setItems };
}
