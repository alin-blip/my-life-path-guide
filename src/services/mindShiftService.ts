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

export interface MindShiftSession {
  id?: string;
  user_id?: string;
  date?: string;
  week_key?: string;
  emotion?: string | null;
  intensity?: number | null;
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
}

export interface AISuggestions {
  cognitive_reframe: string;
  positive_reframe: string;
  act_value: string;
  suggested_distortion_slug?: string;
  recommended_belief_slug: string;
  personalized_incantation: string;
}

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

  async listSessions(limit = 30): Promise<MindShiftSession[]> {
    const { data: auth } = await supabase.auth.getUser();
    if (!auth.user) return [];
    const { data, error } = await supabase
      .from('mind_shift_sessions')
      .select('*')
      .eq('user_id', auth.user.id)
      .order('date', { ascending: false })
      .limit(limit);
    if (error) throw error;
    return (data ?? []) as MindShiftSession[];
  },

  async fetchAISuggestions(input: {
    emotion?: string;
    intensity?: number;
    situation?: string;
    automatic_thought?: string;
    distortion_slug?: string;
  }): Promise<AISuggestions | null> {
    const { data, error } = await supabase.functions.invoke('mind-shift-suggest', {
      body: input,
    });
    if (error) {
      console.error('mind-shift-suggest invoke error', error);
      return null;
    }
    if (data?.error) {
      console.warn('AI returned error', data);
      return null;
    }
    return data as AISuggestions;
  },

  async saveSession(session: MindShiftSession, opts: { createTask?: boolean } = {}): Promise<MindShiftSession> {
    const { data: auth } = await supabase.auth.getUser();
    if (!auth.user) throw new Error('Not authenticated');

    let commitment_task_id = session.commitment_task_id ?? null;

    // Create Door task for today if commitment present and not yet created
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

    // Also write summary into champion_routine_logs for evening recap
    try {
      const today = new Date().toISOString().split('T')[0];
      const summary = {
        session_id: result.id,
        emotion: result.emotion,
        intensity: result.intensity,
        distortion_slug: result.distortion_slug,
        cognitive_reframe: result.cognitive_reframe,
        positive_reframe: result.positive_reframe,
        belief_slug: result.belief_slug,
        incantation: result.incantation_text,
        commitment_text: result.commitment_text,
        commitment_task_id: result.commitment_task_id,
      };
      await supabase
        .from('champion_routine_logs')
        .upsert(
          { user_id: auth.user.id, date: today, mind_shift_summary: summary },
          { onConflict: 'user_id,date' }
        );
    } catch (e) {
      console.warn('Failed to mirror mind shift summary into champion_routine_logs', e);
    }

    return result as MindShiftSession;
  },
};
