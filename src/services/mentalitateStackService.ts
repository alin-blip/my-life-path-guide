import { supabase } from '@/integrations/supabase/client';
import { doorUserTasksService } from '@/services/doorUserTasksService';
import { ideasBankService } from '@/services/ideasBankService';

export type MentalitateMode = 'daily' | 'deep_dive';

export interface MentalitateSession {
  id: string;
  user_id: string;
  mode: MentalitateMode;
  deep_dive_axis: string | null;
  phase_answers: Record<string, string>;
  distortion_detected: string | null;
  reframe: string | null;
  action: string | null;
  axes_impacted: string[];
  vina_score: number | null;
  control_score: number | null;
  pattern_summary: string | null;
  completed: boolean;
  domino_task_id: string | null;
  source: string;
  created_at: string;
  updated_at: string;
  completed_at: string | null;
}

function getWeekKey(): string {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  d.setDate(d.getDate() + 3 - ((d.getDay() + 6) % 7));
  const week1 = new Date(d.getFullYear(), 0, 4);
  const weekNum = 1 + Math.round(
    (((d.getTime() - week1.getTime()) / 86400000) - 3 + ((week1.getDay() + 6) % 7)) / 7
  );
  return `door-week-${d.getFullYear()}-${String(weekNum).padStart(2, '0')}`;
}

export const mentalitateStackService = {
  async startSession(mode: MentalitateMode, deepDiveAxis?: string, source = 'stack_page'): Promise<MentalitateSession> {
    const { data: u } = await supabase.auth.getUser();
    if (!u.user) throw new Error('Not authenticated');
    const { data, error } = await supabase
      .from('mentalitate_stack_sessions')
      .insert({
        user_id: u.user.id,
        mode,
        deep_dive_axis: deepDiveAxis ?? null,
        source,
        phase_answers: {},
      })
      .select()
      .single();
    if (error) throw error;
    return data as any;
  },

  async saveAnswer(sessionId: string, questionIdx: number, answer: string) {
    // Merge into JSONB
    const { data: current } = await supabase
      .from('mentalitate_stack_sessions')
      .select('phase_answers')
      .eq('id', sessionId)
      .maybeSingle();
    const next = { ...((current?.phase_answers as any) ?? {}), [`q${questionIdx}`]: answer };
    const { error } = await supabase
      .from('mentalitate_stack_sessions')
      .update({ phase_answers: next })
      .eq('id', sessionId);
    if (error) throw error;
  },

  async callCoach(params: {
    step: 'reflect' | 'finalize' | 'suggest_distortions' | 'suggest_answers';
    sessionId: string;
    mode: MentalitateMode;
    deepDiveAxis?: string;
    phaseAnswers: Record<string, string>;
    currentQuestionIndex?: number;
    targetQuestionIndex?: number;
  }): Promise<any> {
    const { data: sess } = await supabase.auth.getSession();
    const token = sess.session?.access_token;
    const url = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/mentalitate-stack-coach`;
    const res = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        apikey: import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
        Authorization: token ? `Bearer ${token}` : '',
      },
      body: JSON.stringify({
        step: params.step,
        mode: params.mode,
        deep_dive_axis: params.deepDiveAxis,
        phase_answers: params.phaseAnswers,
        current_question_index: params.currentQuestionIndex,
        target_question_index: params.targetQuestionIndex,
      }),
    });
    if (!res.ok) {
      const errBody = await res.json().catch(() => ({}));
      throw new Error(errBody?.error ?? `coach ${res.status}`);
    }
    return res.json();
  },

  async completeSession(sessionId: string, synthesis: {
    reframe: string;
    action: string;
    distortion_detected: string;
    axes_impacted: string[];
    vina_score?: number | null;
    control_score?: number | null;
    pattern_summary: string;
  }, opts?: { createDominoTask?: boolean }): Promise<MentalitateSession> {
    let dominoTaskId: string | null = null;

    if (opts?.createDominoTask && synthesis.action?.trim()) {
      try {
        await doorSupabaseService.addIdeaToWeek(getWeekKey(), {
          id: crypto.randomUUID(),
          text: `🧠 ${synthesis.action.trim()}`,
          category: 'hot',
          priority: 'important',
        });
      } catch (e) {
        console.warn('Failed to push action to Domino Door:', e);
      }
    }

    const { data, error } = await supabase
      .from('mentalitate_stack_sessions')
      .update({
        reframe: synthesis.reframe,
        action: synthesis.action,
        distortion_detected: synthesis.distortion_detected,
        axes_impacted: synthesis.axes_impacted,
        vina_score: synthesis.vina_score ?? null,
        control_score: synthesis.control_score ?? null,
        pattern_summary: synthesis.pattern_summary,
        completed: true,
        domino_task_id: dominoTaskId,
      })
      .eq('id', sessionId)
      .select()
      .single();
    if (error) throw error;
    return data as any;
  },

  async getRecentSessions(limit = 30): Promise<MentalitateSession[]> {
    const { data, error } = await supabase
      .from('mentalitate_stack_sessions')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(limit);
    if (error) throw error;
    return (data ?? []) as any;
  },

  async getTodaySession(): Promise<MentalitateSession | null> {
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);
    const { data, error } = await supabase
      .from('mentalitate_stack_sessions')
      .select('*')
      .eq('mode', 'daily')
      .gte('created_at', startOfDay.toISOString())
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();
    if (error) throw error;
    return data as any;
  },
};
