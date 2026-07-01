import { supabase } from '@/integrations/supabase/client';

export type ParentingToolType =
  | 'ratio_5to1'
  | 'no_but'
  | 'emotion_coaching'
  | 'repair_log'
  | 'serve_return';

export interface DailyToolLog {
  id: string;
  user_id: string;
  child_id: string | null;
  log_date: string; // YYYY-MM-DD
  tool_type: ParentingToolType;
  positives_count: number;
  negatives_count: number;
  content: string | null;
  metadata: Record<string, unknown>;
  created_at: string;
}

function todayISO(): string {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${dd}`;
}

export const parentingToolsService = {
  today: todayISO,

  /** Get today's row for one tool, per child (or general). */
  async getToday(userId: string, tool: ParentingToolType, childId: string | null): Promise<DailyToolLog | null> {
    let q = supabase
      .from('parenting_daily_tools' as any)
      .select('*')
      .eq('user_id', userId)
      .eq('tool_type', tool)
      .eq('log_date', todayISO());
    q = childId ? q.eq('child_id', childId) : q.is('child_id', null);
    const { data, error } = await q.maybeSingle();
    if (error) throw error;
    return data as any;
  },

  async upsertToday(payload: {
    user_id: string;
    child_id: string | null;
    tool_type: ParentingToolType;
    positives_count?: number;
    negatives_count?: number;
    content?: string | null;
    metadata?: Record<string, unknown>;
  }): Promise<DailyToolLog> {
    const existing = await this.getToday(payload.user_id, payload.tool_type, payload.child_id);
    if (existing) {
      const { data, error } = await supabase
        .from('parenting_daily_tools' as any)
        .update({
          positives_count: payload.positives_count ?? existing.positives_count,
          negatives_count: payload.negatives_count ?? existing.negatives_count,
          content: payload.content ?? existing.content,
          metadata: payload.metadata ?? existing.metadata,
        })
        .eq('id', existing.id)
        .select()
        .single();
      if (error) throw error;
      return data as any;
    }
    const { data, error } = await supabase
      .from('parenting_daily_tools' as any)
      .insert({
        user_id: payload.user_id,
        child_id: payload.child_id,
        tool_type: payload.tool_type,
        log_date: todayISO(),
        positives_count: payload.positives_count ?? 0,
        negatives_count: payload.negatives_count ?? 0,
        content: payload.content ?? null,
        metadata: payload.metadata ?? {},
      })
      .select()
      .single();
    if (error) throw error;
    return data as any;
  },

  /** Compute a streak of consecutive days with any log for this tool. */
  async getStreak(userId: string, tool: ParentingToolType, childId: string | null): Promise<number> {
    let q = supabase
      .from('parenting_daily_tools' as any)
      .select('log_date')
      .eq('user_id', userId)
      .eq('tool_type', tool)
      .order('log_date', { ascending: false })
      .limit(60);
    q = childId ? q.eq('child_id', childId) : q.is('child_id', null);
    const { data, error } = await q;
    if (error) throw error;
    const dates = new Set((data || []).map((r: any) => r.log_date as string));
    let streak = 0;
    const cur = new Date();
    for (let i = 0; i < 60; i++) {
      const y = cur.getFullYear();
      const m = String(cur.getMonth() + 1).padStart(2, '0');
      const dd = String(cur.getDate()).padStart(2, '0');
      if (!dates.has(`${y}-${m}-${dd}`)) break;
      streak++;
      cur.setDate(cur.getDate() - 1);
    }
    return streak;
  },

  async listRecent(userId: string, tool: ParentingToolType, childId: string | null, limit = 14) {
    let q = supabase
      .from('parenting_daily_tools' as any)
      .select('*')
      .eq('user_id', userId)
      .eq('tool_type', tool)
      .order('log_date', { ascending: false })
      .limit(limit);
    q = childId ? q.eq('child_id', childId) : q.is('child_id', null);
    const { data, error } = await q;
    if (error) throw error;
    return ((data || []) as unknown) as DailyToolLog[];
  },

  async addRepair(payload: {
    user_id: string;
    child_id: string | null;
    what_happened: string;
    what_you_said: string;
    repair_action: string;
  }): Promise<DailyToolLog> {
    const { data, error } = await supabase
      .from('parenting_daily_tools' as any)
      .insert({
        user_id: payload.user_id,
        child_id: payload.child_id,
        tool_type: 'repair_log' as ParentingToolType,
        log_date: todayISO(),
        content: payload.what_happened,
        metadata: {
          what_you_said: payload.what_you_said,
          repair_action: payload.repair_action,
        },
      })
      .select()
      .single();
    if (error) throw error;
    return data as any;
  },
};
