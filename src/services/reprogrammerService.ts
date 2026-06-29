import { supabase } from '@/integrations/supabase/client';

export type Phase = 'audit' | 'decupling' | 'forgiveness' | 'rewriting' | 'completed';

export interface ReprogrammerSession {
  id: string;
  user_id: string;
  title: string | null;
  current_phase: Phase;
  status: 'in_progress' | 'completed' | 'abandoned';
  axis: string | null;
  root_belief: string | null;
  source_event: string | null;
  source_age_range: string | null;
  source_who: string | null;
  created_at: string;
  updated_at: string;
  completed_at: string | null;
}

export interface ReprogrammerArtifact {
  id: string;
  session_id: string;
  phase: 'audit' | 'decupling' | 'forgiveness' | 'rewriting';
  payload: any;
  created_at: string;
}

export interface LibraryEntry {
  id: string;
  user_id: string;
  session_id: string | null;
  old_belief: string;
  new_belief: string;
  source_event: string | null;
  source_age_range: string | null;
  parental_pattern: string | null;
  axis: string | null;
  mantra_morning: string | null;
  mantra_evening: string | null;
  weekly_task: string | null;
  installation_status: 'active' | 'paused' | 'installed';
  days_target: number;
  times_repeated: number;
  installed_at: string | null;
  created_at: string;
}

const db = supabase as any;

export const reprogrammerService = {
  async listSessions(): Promise<ReprogrammerSession[]> {
    const { data, error } = await db
      .from('belief_reprogrammer_sessions')
      .select('*')
      .order('updated_at', { ascending: false });
    if (error) throw error;
    return data || [];
  },

  async getSession(id: string): Promise<ReprogrammerSession | null> {
    const { data, error } = await db
      .from('belief_reprogrammer_sessions')
      .select('*')
      .eq('id', id)
      .maybeSingle();
    if (error) throw error;
    return data;
  },

  async createSession(title?: string): Promise<ReprogrammerSession> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');
    const { data, error } = await db
      .from('belief_reprogrammer_sessions')
      .insert({ user_id: user.id, title: title ?? null })
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  async updateSession(id: string, patch: Partial<ReprogrammerSession>): Promise<void> {
    const { error } = await db.from('belief_reprogrammer_sessions').update(patch).eq('id', id);
    if (error) throw error;
  },

  async saveArtifact(sessionId: string, phase: ReprogrammerArtifact['phase'], payload: any): Promise<void> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');
    const { data: existing } = await db
      .from('belief_reprogrammer_artifacts')
      .select('id')
      .eq('session_id', sessionId)
      .eq('phase', phase)
      .maybeSingle();
    if (existing) {
      const { error } = await db
        .from('belief_reprogrammer_artifacts')
        .update({ payload })
        .eq('id', existing.id);
      if (error) throw error;
    } else {
      const { error } = await db
        .from('belief_reprogrammer_artifacts')
        .insert({ session_id: sessionId, user_id: user.id, phase, payload });
      if (error) throw error;
    }
  },

  async listArtifacts(sessionId: string): Promise<ReprogrammerArtifact[]> {
    const { data, error } = await db
      .from('belief_reprogrammer_artifacts')
      .select('*')
      .eq('session_id', sessionId);
    if (error) throw error;
    return data || [];
  },

  async getArtifact(sessionId: string, phase: ReprogrammerArtifact['phase']): Promise<ReprogrammerArtifact | null> {
    const { data, error } = await db
      .from('belief_reprogrammer_artifacts')
      .select('*')
      .eq('session_id', sessionId)
      .eq('phase', phase)
      .maybeSingle();
    if (error) throw error;
    return data;
  },

  async listLibrary(): Promise<LibraryEntry[]> {
    const { data, error } = await db
      .from('belief_reprogrammer_library')
      .select('*')
      .order('created_at', { ascending: false });
    if (error) throw error;
    return data || [];
  },

  async createLibraryEntry(payload: Partial<LibraryEntry>): Promise<LibraryEntry> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');
    const { data, error } = await db
      .from('belief_reprogrammer_library')
      .insert({ ...payload, user_id: user.id })
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  async createMantras(libraryId: string, morning?: string | null, evening?: string | null): Promise<void> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');
    const rows: any[] = [];
    if (morning) rows.push({ user_id: user.id, library_id: libraryId, text: morning, slot: 'morning' });
    if (evening) rows.push({ user_id: user.id, library_id: libraryId, text: evening, slot: 'evening' });
    if (!rows.length) return;
    const { error } = await db.from('belief_mantras').insert(rows);
    if (error) throw error;
  },

  async listActiveMantras(slot?: 'morning' | 'evening'): Promise<{ id: string; text: string; slot: string }[]> {
    let q = db.from('belief_mantras').select('id, text, slot').eq('active', true);
    if (slot) q = q.in('slot', [slot, 'both']);
    const { data, error } = await q;
    if (error) throw error;
    return data || [];
  },

  async callAI(mode: string, body: any): Promise<any> {
    const { data, error } = await supabase.functions.invoke('beliefs-reprogrammer', {
      body: { mode, ...body },
    });
    if (error) throw error;
    return data;
  },
};
