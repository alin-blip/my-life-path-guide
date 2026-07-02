import { supabase } from '@/integrations/supabase/client';

export interface KillItTodaySession {
  id: string;
  session_date: string;
  state_before: string | null;
  win_of_day: string | null;
  anchor_phrase: string | null;
  tasks_snapshot: string[];
  workout_plan: string | null;
  spiritual_anchor: string | null;
  power_phrase: string | null;
  current_phase: string;
  messages: Array<{ role: 'user' | 'assistant'; content: string; ts?: string }>;
  completed_at: string | null;
}

export const killItTodayService = {
  async getTodaySession(): Promise<KillItTodaySession | null> {
    const { data: userData } = await supabase.auth.getUser();
    if (!userData.user) return null;
    const today = new Date().toISOString().slice(0, 10);
    const { data, error } = await supabase
      .from('kill_it_today_sessions' as any)
      .select('*')
      .eq('user_id', userData.user.id)
      .eq('session_date', today)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();
    if (error) {
      console.error('getTodaySession', error);
      return null;
    }
    return data as any;
  },

  async createSession(): Promise<KillItTodaySession | null> {
    const { data: userData } = await supabase.auth.getUser();
    if (!userData.user) return null;
    const { data, error } = await supabase
      .from('kill_it_today_sessions' as any)
      .insert({ user_id: userData.user.id })
      .select('*')
      .single();
    if (error) {
      console.error('createSession', error);
      return null;
    }
    return data as any;
  },

  async ensureTodaySession(): Promise<KillItTodaySession | null> {
    const existing = await this.getTodaySession();
    if (existing) return existing;
    return this.createSession();
  },

  async saveMessages(sessionId: string, messages: KillItTodaySession['messages']) {
    await supabase
      .from('kill_it_today_sessions' as any)
      .update({ messages })
      .eq('id', sessionId);
  },

  async patch(sessionId: string, patch: Partial<KillItTodaySession>) {
    await supabase
      .from('kill_it_today_sessions' as any)
      .update(patch as any)
      .eq('id', sessionId);
  },
};
