import { supabase } from '@/integrations/supabase/client';
import { getActiveWeekKey, getTodayAbbrev } from '@/utils/weekUtils';
import { doorUserTasksService } from '@/services/doorUserTasksService';
import { v4 as uuidv4 } from 'uuid';

export interface MindShiftBelief {
  id: string;
  slug: string;
  name: string;
  short_description: string;
  long_description: string | null;
  activation_prompt: string;
  incantation: string;
  emotion_tags: string[];
  order_index: number;
}

export interface MindShiftDistortion {
  id: string;
  slug: string;
  name: string;
  short_description: string;
  example: string | null;
  reframe_template: string | null;
  order_index: number;
}

export interface MindShiftCategory {
  id: string;
  slug: string;
  name: string;
  emoji: string | null;
  description: string | null;
  order_index: number;
}

export type MindShiftStatus = 'draft' | 'processing' | 'complete';
export type MindShiftRecurrence = 'Z' | 'S' | 'L';
export type MindShiftPerceptionArea = 'Sine' | 'Familie' | 'Echipă' | 'Business' | 'Misiune' | 'Spirit';

export interface ChatMessage {
  role: 'coach' | 'user';
  content: string;
  step?: string;
  ts?: string;
}

export interface MindShiftSession {
  id?: string;
  user_id?: string;
  date?: string;
  week_key?: string;
  status?: MindShiftStatus;
  chat_step?: number;
  chat_history?: ChatMessage[];
  title?: string | null;
  category?: string | null;
  recurrence?: MindShiftRecurrence | null;
  perception_area?: string | null;
  emotion?: string | null;
  intensity?: number | null;
  intensity_before?: number | null;
  intensity_after?: number | null;
  situation?: string | null;
  automatic_thought?: string | null;
  distortion_slug?: string | null;
  cognitive_reframe?: string | null;
  positive_reframe?: string | null;
  act_value?: string | null;
  belief_slug?: string | null;
  incantation_text?: string | null;
  commitment_text?: string | null;
  commitment_task_id?: string | null;
  ai_suggestions?: any;
  completed_at?: string | null;
  source?: string;
  created_at?: string;
  updated_at?: string;
}

export interface AISuggestions {
  cognitive_reframe: string;
  positive_reframe: string;
  act_value: string;
  suggested_distortion_slug?: string;
  recommended_belief_slug: string;
  personalized_incantation: string;
}

export interface MindShiftStepResponse {
  message: string;
  suggestions?: any;
  next_step?: number;
}

export const STEP_KEYS = [
  'thought',      // 0
  'category',     // 1
  'recurrence',   // 2
  'situation',    // 3 (situație + emoție + intensity_before)
  'distortion',   // 4
  'reframe',      // 5 (cognitive + positive + ACT)
  'activate',     // 6 (belief + incantation)
  'commit',       // 7 (acțiune + intensity_after)
] as const;

export type StepKey = typeof STEP_KEYS[number];

export const mindShiftService = {
  async loadBeliefs(): Promise<MindShiftBelief[]> {
    const { data, error } = await supabase
      .from('mind_shift_beliefs')
      .select('*')
      .eq('active', true)
      .order('order_index');
    if (error) throw error;
    return (data ?? []) as MindShiftBelief[];
  },

  async loadDistortions(): Promise<MindShiftDistortion[]> {
    const { data, error } = await supabase
      .from('mind_shift_distortions')
      .select('*')
      .eq('active', true)
      .order('order_index');
    if (error) throw error;
    return (data ?? []) as MindShiftDistortion[];
  },

  async loadCategories(): Promise<MindShiftCategory[]> {
    const { data, error } = await supabase
      .from('mind_shift_categories' as any)
      .select('*')
      .eq('active', true)
      .order('order_index');
    if (error) {
      console.warn('loadCategories error', error);
      return [];
    }
    return (data ?? []) as unknown as MindShiftCategory[];
  },

  async getTodaySession(): Promise<MindShiftSession | null> {
    const { data: auth } = await supabase.auth.getUser();
    if (!auth.user) return null;
    const today = new Date().toISOString().split('T')[0];
    const { data, error } = await supabase
      .from('mind_shift_sessions')
      .select('*')
      .eq('user_id', auth.user.id)
      .eq('date', today)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();
    if (error) throw error;
    return data as MindShiftSession | null;
  },

  async getSessionById(id: string): Promise<MindShiftSession | null> {
    const { data, error } = await supabase
      .from('mind_shift_sessions')
      .select('*')
      .eq('id', id)
      .maybeSingle();
    if (error) throw error;
    return data as MindShiftSession | null;
  },

  async listSessions(opts: { limit?: number; status?: MindShiftStatus | 'all' } = {}): Promise<MindShiftSession[]> {
    const { data: auth } = await supabase.auth.getUser();
    if (!auth.user) return [];
    let q = supabase
      .from('mind_shift_sessions')
      .select('*')
      .eq('user_id', auth.user.id)
      .order('created_at', { ascending: false })
      .limit(opts.limit ?? 50);
    if (opts.status && opts.status !== 'all') q = q.eq('status', opts.status);
    const { data, error } = await q;
    if (error) throw error;
    return (data ?? []) as MindShiftSession[];
  },

  async listDrafts(): Promise<MindShiftSession[]> {
    return this.listSessions({ status: 'draft', limit: 100 });
  },

  async countDrafts(): Promise<number> {
    const { data: auth } = await supabase.auth.getUser();
    if (!auth.user) return 0;
    const { count, error } = await supabase
      .from('mind_shift_sessions')
      .select('id', { count: 'exact', head: true })
      .eq('user_id', auth.user.id)
      .in('status', ['draft', 'processing']);
    if (error) return 0;
    return count ?? 0;
  },

  /** Quick capture — creates a draft session with just the thought text. */
  async createDraft(thoughtText: string, source: string = 'dashboard'): Promise<MindShiftSession> {
    const { data: auth } = await supabase.auth.getUser();
    if (!auth.user) throw new Error('Not authenticated');
    const payload: any = {
      user_id: auth.user.id,
      automatic_thought: thoughtText.trim(),
      title: thoughtText.trim().slice(0, 60),
      status: 'draft',
      chat_step: 0,
      source,
      chat_history: [
        { role: 'user', content: thoughtText.trim(), step: 'thought', ts: new Date().toISOString() },
      ],
    };
    const { data, error } = await supabase
      .from('mind_shift_sessions')
      .insert(payload)
      .select()
      .single();
    if (error) throw error;
    return data as MindShiftSession;
  },

  /** Generic patch — used by chat flow to persist progress per step. */
  async patchSession(id: string, patch: Partial<MindShiftSession>): Promise<MindShiftSession> {
    const { data, error } = await supabase
      .from('mind_shift_sessions')
      .update(patch as any)
      .eq('id', id)
      .select()
      .single();
    if (error) throw error;
    return data as MindShiftSession;
  },

  /** Call conversational AI for a specific step. */
  async chatStep(input: {
    sessionId?: string;
    stepKey: StepKey;
    userMessage?: string;
    sessionContext?: Partial<MindShiftSession>;
  }): Promise<MindShiftStepResponse | null> {
    const { data, error } = await supabase.functions.invoke('mind-shift-chat', { body: input });
    if (error) {
      console.error('mind-shift-chat error', error);
      return null;
    }
    if ((data as any)?.error) {
      console.warn('mind-shift-chat returned error', data);
      return null;
    }
    return data as MindShiftStepResponse;
  },

  /** Legacy one-shot suggestions (kept for backward compat with existing UI). */
  async fetchAISuggestions(input: {
    emotion?: string;
    intensity?: number;
    situation?: string;
    automatic_thought?: string;
    distortion_slug?: string;
  }): Promise<AISuggestions | null> {
    const { data, error } = await supabase.functions.invoke('mind-shift-suggest', { body: input });
    if (error) {
      console.error('mind-shift-suggest invoke error', error);
      return null;
    }
    if ((data as any)?.error) return null;
    return data as AISuggestions;
  },

  async saveSession(session: MindShiftSession, opts: { createTask?: boolean } = {}): Promise<MindShiftSession> {
    const { data: auth } = await supabase.auth.getUser();
    if (!auth.user) throw new Error('Not authenticated');

    let commitment_task_id = session.commitment_task_id ?? null;

    if (opts.createTask && session.commitment_text && !commitment_task_id) {
      try {
        const weekKey = getActiveWeekKey();
        const today = getTodayAbbrev() as any;
        const taskId = uuidv4();
        await doorUserTasksService.addIdeaToWeek(weekKey, {
          id: taskId,
          text: `🧠 ${session.commitment_text}`,
          category: 'do',
          priority: 'important',
          day: today,
        });
        commitment_task_id = taskId;
      } catch (e) {
        console.warn('Failed to create Door task for commitment', e);
      }
    }

    const payload: any = {
      ...session,
      user_id: auth.user.id,
      commitment_task_id,
      status: session.status ?? 'complete',
      completed_at: session.completed_at ?? new Date().toISOString(),
      source: session.source ?? 'routine',
    };
    if (!payload.date) payload.date = new Date().toISOString().split('T')[0];

    let result;
    if (session.id) {
      const { data, error } = await supabase
        .from('mind_shift_sessions')
        .update(payload)
        .eq('id', session.id)
        .select()
        .single();
      if (error) throw error;
      result = data;
    } else {
      const { data, error } = await supabase
        .from('mind_shift_sessions')
        .insert(payload)
        .select()
        .single();
      if (error) throw error;
      result = data;
    }

    // Mirror summary into champion_routine_logs (evening recap)
    try {
      const today = new Date().toISOString().split('T')[0];
      const summary = {
        session_id: (result as any).id,
        emotion: (result as any).emotion,
        intensity_before: (result as any).intensity_before ?? (result as any).intensity,
        intensity_after: (result as any).intensity_after,
        distortion_slug: (result as any).distortion_slug,
        cognitive_reframe: (result as any).cognitive_reframe,
        positive_reframe: (result as any).positive_reframe,
        belief_slug: (result as any).belief_slug,
        incantation: (result as any).incantation_text,
        commitment_text: (result as any).commitment_text,
        commitment_task_id: (result as any).commitment_task_id,
        category: (result as any).category,
        recurrence: (result as any).recurrence,
      };
      await supabase
        .from('champion_routine_logs')
        .upsert(
          { user_id: auth.user.id, date: today, mind_shift_summary: summary },
          { onConflict: 'user_id,date' }
        );
    } catch (e) {
      console.warn('Failed to mirror mind shift summary', e);
    }

    return result as MindShiftSession;
  },

  async deleteSession(id: string): Promise<void> {
    const { error } = await supabase.from('mind_shift_sessions').delete().eq('id', id);
    if (error) throw error;
  },

  /** Detect recurring patterns: same category + recurrence='Z' appearing 3+ times in last 14 days. */
  async detectPatterns(): Promise<Array<{ category: string; count: number; lastDate: string }>> {
    const { data: auth } = await supabase.auth.getUser();
    if (!auth.user) return [];
    const since = new Date();
    since.setDate(since.getDate() - 14);
    const { data, error } = await supabase
      .from('mind_shift_sessions')
      .select('category, date, recurrence')
      .eq('user_id', auth.user.id)
      .eq('recurrence', 'Z')
      .gte('date', since.toISOString().split('T')[0])
      .not('category', 'is', null);
    if (error || !data) return [];
    const buckets: Record<string, { count: number; lastDate: string }> = {};
    for (const r of data as any[]) {
      if (!r.category) continue;
      buckets[r.category] = buckets[r.category] ?? { count: 0, lastDate: r.date };
      buckets[r.category].count++;
      if (r.date > buckets[r.category].lastDate) buckets[r.category].lastDate = r.date;
    }
    return Object.entries(buckets)
      .filter(([, v]) => v.count >= 3)
      .map(([category, v]) => ({ category, count: v.count, lastDate: v.lastDate }));
  },

  /** Analytics: this week's mind shift stats for dashboard widget. */
  async getWeekAnalytics(): Promise<{
    count: number;
    avgDelta: number | null;
    dominantEmotion: string | null;
    drafts: number;
  }> {
    const { data: auth } = await supabase.auth.getUser();
    if (!auth.user) return { count: 0, avgDelta: null, dominantEmotion: null, drafts: 0 };
    const start = new Date();
    start.setDate(start.getDate() - 7);
    const startStr = start.toISOString().split('T')[0];
    const [sessionsRes, draftCount] = await Promise.all([
      supabase
        .from('mind_shift_sessions')
        .select('emotion, intensity_before, intensity_after, status')
        .eq('user_id', auth.user.id)
        .gte('date', startStr),
      this.countDrafts(),
    ]);
    const rows = (sessionsRes.data ?? []) as any[];
    const complete = rows.filter((r) => r.status === 'complete');
    const deltas = complete
      .map((r) => (typeof r.intensity_before === 'number' && typeof r.intensity_after === 'number'
        ? r.intensity_before - r.intensity_after : null))
      .filter((v): v is number => v !== null);
    const avgDelta = deltas.length ? Math.round(deltas.reduce((a, b) => a + b, 0) / deltas.length) : null;
    const emotionCounts: Record<string, number> = {};
    rows.forEach((r) => { if (r.emotion) emotionCounts[r.emotion] = (emotionCounts[r.emotion] ?? 0) + 1; });
    const dominantEmotion = Object.entries(emotionCounts).sort((a, b) => b[1] - a[1])[0]?.[0] ?? null;
    return { count: complete.length, avgDelta, dominantEmotion, drafts: draftCount };
  },
};
