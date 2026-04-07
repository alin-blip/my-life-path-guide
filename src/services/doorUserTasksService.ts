import { supabase } from '@/integrations/supabase/client';
import { HotListItem, HitListItem, DoListItem, TaskPriority, DayOfWeek } from '@/types/door';
import { v4 as uuidv4 } from 'uuid';

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
    const userId = await getUserId();
    if (!userId) return [];

    const { data, error } = await supabase
      .from('user_tasks')
      .select('id, title, task_type, priority, is_key_point')
      .eq('user_id', userId)
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
    const userId = await getUserId();
    if (!userId) return { hitList: [], doList: [] };

    const { data, error } = await supabase
      .from('user_tasks')
      .select('id, title, task_type, day_of_week, completed, priority, is_key_point')
      .eq('user_id', userId)
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

    // Filter out empty items before saving
    const validItems = hotList.filter(item => item.text && item.text.trim().length > 0);

    // DELETE all existing hot list items first (week_key MUST be null for hot list)
    await supabase
      .from('user_tasks')
      .delete()
      .eq('user_id', userId)
      .eq('task_type', 'hot')
      .is('week_key', null);

    if (validItems.length === 0) return { count: 0 };

    const rows: any[] = [];
    validItems.forEach((item, index) => {
      rows.push({
        user_id: userId,
        week_key: null, // CRITICAL: Hot list items are global, not week-specific
        task_type: 'hot',
        list_type: 'hot',
        title: item.text.trim(),
        priority: toDbPriority(item.priority),
        is_key_point: item.isKeyPoint || false,
        completed: false,
        position: index
      });
    });

    // Use upsert-like behavior: since we deleted first, insert should work
    // But use onConflict to handle any race conditions with the unique constraint
    const { error: insErr } = await supabase
      .from('user_tasks')
      .insert(rows);

    // If duplicate key error, it's a race condition — ignore and retry next cycle
    if (insErr && insErr.code === '23505') {
      console.warn('[doorUserTasksService] Duplicate key on hot list save — skipping (race condition)');
      return { count: rows.length };
    }
    if (insErr) throw insErr;

    return { count: rows.length };
  },

  async saveWeekLists(weekKey: string, params: {
    hitList: HitListItem[];
    doList: DoListItem[];
  }) {
    const userId = await getUserId();
    if (!userId) throw new Error('User not authenticated');

    // Fetch existing tasks to preserve IDs and only update what changed
    const { data: existingTasks, error: fetchErr } = await supabase
      .from('user_tasks')
      .select('id, task_id, title, day_of_week, task_type, completed, priority, is_key_point, position')
      .eq('user_id', userId)
      .eq('week_key', weekKey)
      .in('task_type', ['hit', 'do']);

    if (fetchErr) throw fetchErr;

    const byRowId = new Map<string, any>();
    const byTaskId = new Map<string, any>();
    const byNaturalKey = new Map<string, any>();

    const normalizeTitle = (t: any) => String(t ?? '').trim().toLowerCase();
    const makeKey = (title: any, day: any, taskType: 'hit' | 'do') => {
      const d = normalizeDay(day) ?? 'null';
      return `${normalizeTitle(title)}|${d}|${taskType}`;
    };

    for (const task of existingTasks ?? []) {
      if (task?.id) byRowId.set(String(task.id), task);
      if (task?.task_id) byTaskId.set(String(task.task_id), task);
      byNaturalKey.set(makeKey(task.title, task.day_of_week, task.task_type as 'hit' | 'do'), task);
    }

    // Deduplicate hitList by title + day before saving
    const seenHit = new Set<string>();
    const uniqueHitList = params.hitList.filter(item => {
      const key = `${normalizeTitle(item.text)}|${normalizeDay(item.day) ?? 'null'}`;
      if (seenHit.has(key)) return false;
      seenHit.add(key);
      return true;
    });

    // Deduplicate doList by title + day before saving
    const seenDo = new Set<string>();
    const uniqueDoList = params.doList.filter(item => {
      const key = `${normalizeTitle(item.text)}|${normalizeDay(item.day) ?? 'null'}`;
      if (seenDo.has(key)) return false;
      seenDo.add(key);
      return true;
    });

    // Collect all current task IDs from the lists
    const currentIds = new Set<string>();
    const upsertRows: any[] = [];
    let position = 0;

    // Prepare hit list rows - preserve existing IDs (match by row id OR task_id OR natural key)
    for (const item of uniqueHitList) {
      const naturalKey = makeKey(item.text, item.day, 'hit');
      const existingTask = byRowId.get(item.id) || byTaskId.get(item.id) || byNaturalKey.get(naturalKey);
      const taskId = existingTask ? String(existingTask.id) : uuidv4();
      currentIds.add(taskId);

      upsertRows.push({
        id: taskId,
        user_id: userId,
        week_key: weekKey,
        task_type: 'hit',
        list_type: 'hit',
        task_id: existingTask?.task_id ? String(existingTask.task_id) : String(item.id),
        title: item.text,
        day_of_week: item.day ? String(item.day) : null,
        completed: Boolean(item.completed),
        priority: toDbPriority(item.priority),
        is_key_point: item.isKeyPoint || false,
        position: position++
      });
    }

    // Prepare do list rows - preserve existing IDs (match by row id OR task_id OR natural key)
    for (const item of uniqueDoList) {
      const naturalKey = makeKey(item.text, item.day, 'do');
      const existingTask = byRowId.get(item.id) || byTaskId.get(item.id) || byNaturalKey.get(naturalKey);
      const taskId = existingTask ? String(existingTask.id) : uuidv4();
      currentIds.add(taskId);

      upsertRows.push({
        id: taskId,
        user_id: userId,
        week_key: weekKey,
        task_type: 'do',
        list_type: 'do',
        task_id: existingTask?.task_id ? String(existingTask.task_id) : String(item.id),
        title: item.text,
        day_of_week: item.day ? String(item.day) : null,
        completed: Boolean(item.completed),
        priority: toDbPriority(item.priority),
        position: position++
      });
    }

    // NOTE: We intentionally do NOT delete tasks that are missing from the in-memory lists.
    // This prevents a race condition where tasks added by addIdeaToWeek (directly to DB)
    // get deleted because the in-memory state hasn't been refreshed yet.
    // Explicit task removal (e.g., moveTaskBackToHotList) handles its own deletion.

    if (upsertRows.length === 0) {
      return { count: 0 };
    }

    // UPSERT to update existing or insert new tasks
    const { error: upsertErr } = await supabase
      .from('user_tasks')
      .upsert(upsertRows, { onConflict: 'id' });

    if (upsertErr) throw upsertErr;

    return { count: upsertRows.length };
  },

  async archiveWeekTasks(weekKey: string, taskTypes?: ('hit' | 'do' | 'hot')[]) {
    const { error } = await supabase.rpc('archive_user_tasks', {
      target_week_key: weekKey,
      target_task_types: taskTypes || null
    });
    if (error) throw error;
  },

  async addIdeaToWeek(weekKey: string, idea: {
    id: string;
    text: string;
    category: 'hit' | 'do' | 'hot';
    priority: TaskPriority;
    day?: DayOfWeek;
  }) {
    console.log('🔄 addIdeaToWeek called:', { weekKey, idea });

    const userId = await getUserId();
    console.log('👤 User ID:', userId);

    if (!userId) {
      console.error('❌ No user authenticated for addIdeaToWeek');
      throw new Error('User not authenticated');
    }

    // Determine the current day abbreviation if not provided
    const days: DayOfWeek[] = ['Su', 'M', 'T', 'W', 'Th', 'F', 'Sa'];
    const todayAbbrev = days[new Date().getDay()];
    const effectiveDay = idea.day || todayAbbrev;

    // Check if duplicate exists in user_tasks
    const dupQuery = supabase
      .from('user_tasks')
      .select('id')
      .eq('user_id', userId)
      .eq('title', idea.text)
      .eq('task_type', idea.category);

    const { data: existing } = idea.category === 'hot'
      ? await dupQuery.is('week_key', null).limit(1)
      : await dupQuery.eq('week_key', weekKey).eq('day_of_week', effectiveDay).limit(1);

    if (existing && existing.length > 0) {
      console.log('⚠️ Duplicate task detected, skipping insert:', idea.text);
      return existing;
    }

    // Save to user_tasks for Door + dashboard sync
    const payload: any = {
      id: uuidv4(),
      user_id: userId,
      title: idea.text,
      task_type: idea.category,
      list_type: idea.category,
      completed: false,
      priority: toDbPriority(idea.priority),
      selected: false,
      is_key_point: false,
      position: null,
      area: null,
      task_id: idea.id || null,
    };

    if (idea.category === 'hot') {
      payload.week_key = null;
      payload.day_of_week = null;
    } else {
      payload.week_key = weekKey;
      payload.day_of_week = effectiveDay;
    }

    console.log('📦 Inserting task into user_tasks:', payload);

    const { data, error } = await supabase.from('user_tasks').insert(payload).select();

    if (error) {
      console.error('❌ Error inserting task:', error);
      throw error;
    }

    console.log('✅ Task inserted successfully:', data);
    return data;
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
  },

  async removeDuplicateTasks(): Promise<{ removed: number; kept: number }> {
    const userId = await getUserId();
    if (!userId) throw new Error('User not authenticated');

    // Fetch all tasks for the user
    const { data: allTasks, error: fetchError } = await supabase
      .from('user_tasks')
      .select('id, title, task_type, week_key, day_of_week, completed')
      .eq('user_id', userId)
      .order('created_at', { ascending: true });

    if (fetchError) throw fetchError;
    if (!allTasks || allTasks.length === 0) return { removed: 0, kept: 0 };

    // Group by unique key: title + task_type + week_key + day_of_week
    const seen = new Map<string, string>();
    const duplicateIds: string[] = [];

    for (const task of allTasks) {
      const key = `${task.title}|${task.task_type}|${task.week_key || 'null'}|${task.day_of_week || 'null'}`;
      
      if (seen.has(key)) {
        // This is a duplicate - mark for deletion
        duplicateIds.push(task.id);
      } else {
        // First occurrence - keep it
        seen.set(key, task.id);
      }
    }

    if (duplicateIds.length === 0) {
      return { removed: 0, kept: allTasks.length };
    }

    // Delete duplicates in batches of 100
    const batchSize = 100;
    for (let i = 0; i < duplicateIds.length; i += batchSize) {
      const batch = duplicateIds.slice(i, i + batchSize);
      const { error: deleteError } = await supabase
        .from('user_tasks')
        .delete()
        .in('id', batch);

      if (deleteError) throw deleteError;
    }

    return { removed: duplicateIds.length, kept: allTasks.length - duplicateIds.length };
  }
};