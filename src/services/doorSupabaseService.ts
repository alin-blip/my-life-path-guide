import { supabase } from '@/integrations/supabase/client';
import { HotListItem, HitListItem, DoListItem, TaskPriority, DayOfWeek } from '@/types/door';

function toDbPriority(priority: TaskPriority | undefined): number | null {
  switch (priority) {
    case 'important':
      return 2;
    case 'urgent':
      return 3;
    case 'urgent-important':
      return 4;
    case 'none':
      return 1;
    default:
      return null;
  }
}

function fromDbPriority(val: number | null): TaskPriority {
  switch (val) {
    case 2:
      return 'important';
    case 3:
      return 'urgent';
    case 4:
      return 'urgent-important';
    default:
      return 'none';
  }
}

function normalizeDay(day: any): DayOfWeek | null {
  if (!day) return null;
  const map: Record<string, DayOfWeek> = {
    monday: 'M', tuesday: 'T', wednesday: 'W', thursday: 'Th', friday: 'F', saturday: 'Sa', sunday: 'Su',
    m: 'M', t: 'T', w: 'W', th: 'Th', f: 'F', sa: 'Sa', su: 'Su',
  };
  const key = String(day).toLowerCase();
  return map[key] || (day as DayOfWeek);
}

async function getUserId(): Promise<string | null> {
  const { data, error } = await supabase.auth.getUser();
  if (error) return null;
  return data.user?.id ?? null;
}

export const doorSupabaseService = {
  async fetchWeekLists(weekKey: string): Promise<{
    hotList: HotListItem[];
    hitList: HitListItem[];
    doList: DoListItem[];
  }> {
    const { data, error } = await supabase
      .from('hot_list_items')
      .select('id, title, list_type, day_of_week, completed, priority, week_key')
      .eq('week_key', weekKey);

    if (error) throw error;

    const hotList: HotListItem[] = [];
    const hitList: HitListItem[] = [];
    const doList: DoListItem[] = [];

    for (const row of data ?? []) {
      const common = {
        id: String(row.id),
        text: row.title as string,
        priority: fromDbPriority((row.priority as number | null) ?? null),
      } as any;

      if (row.list_type === 'hot') {
        hotList.push({ ...common, selected: false } as HotListItem);
      } else if (row.list_type === 'hit') {
        hitList.push({
          id: String(row.id),
          text: row.title as string,
          day: normalizeDay(row.day_of_week),
          completed: Boolean(row.completed),
          priority: fromDbPriority((row.priority as number | null) ?? null),
        });
      } else if (row.list_type === 'do') {
        doList.push({
          id: String(row.id),
          text: row.title as string,
          day: normalizeDay(row.day_of_week),
          completed: Boolean(row.completed),
          priority: fromDbPriority((row.priority as number | null) ?? null),
        });
      }
    }

    return { hotList, hitList, doList };
  },

  async saveWeekLists(weekKey: string, params: {
    hotList: HotListItem[];
    hitList: HitListItem[];
    doList: DoListItem[];
  }) {
    const userId = await getUserId();
    if (!userId) throw new Error('User not authenticated');

    // No auto-delete: just UPSERT what's provided
    const rows: any[] = [];

    for (const item of params.hotList) {
      rows.push({
        user_id: userId,
        week_key: weekKey,
        list_type: 'hot',
        title: item.text,
        priority: toDbPriority(item.priority),
      });
    }

    for (const item of params.hitList) {
      rows.push({
        user_id: userId,
        week_key: weekKey,
        list_type: 'hit',
        title: item.text,
        day_of_week: item.day ? String(item.day) : null,
        completed: !!item.completed,
        priority: toDbPriority(item.priority),
      });
    }

    for (const item of params.doList) {
      rows.push({
        user_id: userId,
        week_key: weekKey,
        list_type: 'do',
        title: item.text,
        day_of_week: item.day ? String(item.day) : null,
        completed: !!item.completed,
        priority: toDbPriority(item.priority),
      });
    }

    if (rows.length === 0) return { count: 0 };

    const { error: insErr } = await supabase
      .from('hot_list_items')
      .insert(rows);

    if (insErr) throw insErr;

    return { count: rows.length };
  },

  async addIdeaToWeek(weekKey: string, idea: {
    id: string;
    text: string;
    category: 'hit' | 'do' | 'hot';
    priority: TaskPriority;
    day?: DayOfWeek;
  }) {
    const userId = await getUserId();
    if (!userId) throw new Error('User not authenticated');

    const payload: any = {
      user_id: userId,
      week_key: weekKey,
      list_type: idea.category,
      title: idea.text,
      priority: toDbPriority(idea.priority),
    };
    if (idea.category !== 'hot') {
      payload.day_of_week = idea.day ? String(idea.day) : 'M';
      payload.completed = false;
    }

    const { error } = await supabase.from('hot_list_items').insert(payload);
    if (error) throw error;
  }
};
