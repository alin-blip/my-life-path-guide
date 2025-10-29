import { supabase } from '@/integrations/supabase/client';
import { HotListItem, HitListItem, DoListItem, TaskPriority, DayOfWeek } from '@/types/door';

function toDbPriority(priority: TaskPriority | undefined): number {
  switch (priority) {
    case 'important':
      return 2;
    case 'urgent':
      return 3;
    case 'urgent-important':
      return 4;
    case 'none':
    default:
      return 1;
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

export const doorUserTasksService = {
  async fetchGlobalHotList(): Promise<HotListItem[]> {
    const { data, error } = await supabase
      .from('user_tasks')
      .select('id, title, task_type, priority, is_key_point')
      .eq('task_type', 'hot')
      .is('week_key', null)
      .order('position', { ascending: true });

    if (error) throw error;

    const hotList: HotListItem[] = [];
    for (const row of data ?? []) {
      hotList.push({
        id: String(row.id),
        text: row.title as string,
        priority: fromDbPriority(row.priority),
        selected: false,
        isKeyPoint: row.is_key_point || false
      });
    }
    return hotList;
  },

  async fetchWeekLists(weekKey: string): Promise<{
    hitList: HitListItem[];
    doList: DoListItem[];
  }> {
    const { data, error } = await supabase
      .from('user_tasks')
      .select('id, title, task_type, day_of_week, completed, priority, is_key_point')
      .eq('week_key', weekKey)
      .in('task_type', ['hit', 'do'])
      .order('position', { ascending: true });

    if (error) throw error;

    const hitList: HitListItem[] = [];
    const doList: DoListItem[] = [];

    for (const row of data ?? []) {
      const common = {
        id: String(row.id),
        text: row.title as string,
        priority: fromDbPriority(row.priority),
      };

      if (row.task_type === 'hit') {
        hitList.push({
          ...common,
          day: normalizeDay(row.day_of_week),
          completed: Boolean(row.completed),
          isKeyPoint: row.is_key_point || false
        } as HitListItem);
      } else if (row.task_type === 'do') {
        doList.push({
          ...common,
          day: normalizeDay(row.day_of_week),
          completed: Boolean(row.completed)
        } as DoListItem);
      }
    }

    return { hitList, doList };
  },

  async saveGlobalHotList(hotList: HotListItem[]) {
    const userId = await getUserId();
    if (!userId) throw new Error('User not authenticated');

    // Delete all existing hot tasks for this user
    const { error: delErr } = await supabase
      .from('user_tasks')
      .delete()
      .eq('task_type', 'hot')
      .is('week_key', null);
    
    if (delErr) throw delErr;

    if (hotList.length === 0) return { count: 0 };

    const rows: any[] = [];
    hotList.forEach((item, index) => {
      rows.push({
        user_id: userId,
        week_key: null,
        task_type: 'hot',
        title: item.text,
        priority: toDbPriority(item.priority),
        is_key_point: item.isKeyPoint || false,
        completed: false,
        position: index
      });
    });

    const { error: insErr } = await supabase
      .from('user_tasks')
      .insert(rows);

    if (insErr) throw insErr;

    return { count: rows.length };
  },

  async saveWeekLists(weekKey: string, params: {
    hitList: HitListItem[];
    doList: DoListItem[];
  }) {
    const userId = await getUserId();
    if (!userId) throw new Error('User not authenticated');

    // Clear existing hit/do items for this week
    const { error: delErr } = await supabase
      .from('user_tasks')
      .delete()
      .eq('week_key', weekKey)
      .in('task_type', ['hit', 'do']);
    
    if (delErr) throw delErr;

    const rows: any[] = [];
    let position = 0;

    // Add hit list items
    for (const item of params.hitList) {
      rows.push({
        user_id: userId,
        week_key: weekKey,
        task_type: 'hit',
        title: item.text,
        day_of_week: item.day ? String(item.day) : null,
        completed: Boolean(item.completed),
        priority: toDbPriority(item.priority),
        is_key_point: item.isKeyPoint || false,
        position: position++
      });
    }

    // Add do list items
    for (const item of params.doList) {
      rows.push({
        user_id: userId,
        week_key: weekKey,
        task_type: 'do',
        title: item.text,
        day_of_week: item.day ? String(item.day) : null,
        completed: Boolean(item.completed),
        priority: toDbPriority(item.priority),
        position: position++
      });
    }

    if (rows.length === 0) return { count: 0 };

    const { error: insErr } = await supabase
      .from('user_tasks')
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
      week_key: idea.category === 'hot' ? null : weekKey,
      task_type: idea.category,
      title: idea.text,
      priority: toDbPriority(idea.priority),
      position: 0
    };

    if (idea.category !== 'hot') {
      payload.day_of_week = idea.day ? String(idea.day) : 'M';
      payload.completed = false;
    }

    const { error } = await supabase.from('user_tasks').insert(payload);
    if (error) throw error;
  },

  async clearUserHistory(): Promise<number> {
    const userId = await getUserId();
    if (!userId) throw new Error('User not authenticated');

    const { data } = await supabase.rpc('clear_user_task_history', {
      target_user_id: userId
    });

    // Also clear localStorage
    try {
      const keysToRemove: string[] = [];
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && (key.startsWith('door-') || key.includes('weekly-focus') || key.includes('domino'))) {
          keysToRemove.push(key);
        }
      }
      keysToRemove.forEach(key => localStorage.removeItem(key));
      console.log(`Cleared ${keysToRemove.length} localStorage keys`);
    } catch (error) {
      console.warn('Failed to clear localStorage:', error);
    }

    return data || 0;
  }
};