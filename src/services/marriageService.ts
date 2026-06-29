import { supabase } from '@/integrations/supabase/client';

export interface MarriageProfile {
  id?: string;
  user_id?: string;
  partner_name: string | null;
  partner_pronoun: string | null;
  relationship_years: number | null;
  children_count: number | null;
  partner_love_language: string | null;
  relationship_context: string | null;
  recurring_patterns?: any[];
  axis_scores?: Record<string, number>;
  last_analysis_at?: string | null;
}

export interface MarriageAttachment {
  type: 'image' | 'text' | 'audio' | 'pdf';
  url?: string;
  content?: string;
  name?: string;
  size?: number;
}

export interface MarriageSession {
  id: string;
  user_id: string;
  title: string;
  conflict_summary: string | null;
  user_context: string | null;
  attachments: MarriageAttachment[];
  attachment_types: string[];
  transcripts: any;
  factual_situation: string | null;
  fact_vs_interpretation: string | null;
  perspective_husband: string | null;
  perspective_wife: string | null;
  perspective_coach: string | null;
  detected_distortions: Array<{ name: string; evidence: string }>;
  axis_diagnosis: Record<string, number>;
  primary_destructured_axis: string | null;
  pattern_recurrence: number;
  task_title: string | null;
  task_description: string | null;
  task_id: string | null;
  task_exported: boolean;
  repair_script?: string[];
  trigger_root?: { past_wound: string; current_trigger: string; cognitive_reframe: string } | null;
  exploration_questions?: Array<{ question: string; for: 'self' | 'partner' }>;
  seven_day_plan?: Array<{ day: number; action: string; intention: string }>;
  status: string;
  created_at: string;
  updated_at: string;
}

export const marriageService = {
  async getProfile(userId: string): Promise<MarriageProfile | null> {
    const { data, error } = await supabase
      .from('marriage_profiles' as any)
      .select('*')
      .eq('user_id', userId)
      .maybeSingle();
    if (error) throw error;
    return data as any;
  },

  async upsertProfile(userId: string, profile: Partial<MarriageProfile>): Promise<MarriageProfile> {
    const { data, error } = await supabase
      .from('marriage_profiles' as any)
      .upsert({ user_id: userId, ...profile }, { onConflict: 'user_id' })
      .select()
      .single();
    if (error) throw error;
    return data as any;
  },

  async listSessions(userId: string, limit = 50): Promise<MarriageSession[]> {
    const { data, error } = await supabase
      .from('marriage_sessions' as any)
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(limit);
    if (error) throw error;
    return (data || []) as any;
  },

  async getSession(id: string): Promise<MarriageSession | null> {
    const { data, error } = await supabase
      .from('marriage_sessions' as any)
      .select('*')
      .eq('id', id)
      .maybeSingle();
    if (error) throw error;
    return data as any;
  },

  async getTimeline(userId: string, limit = 100) {
    const { data, error } = await supabase
      .from('marriage_timeline_events' as any)
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(limit);
    if (error) throw error;
    return data || [];
  },

  async uploadEvidence(userId: string, file: File): Promise<string> {
    const ext = file.name.split('.').pop() || 'bin';
    const path = `${userId}/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
    const { error } = await supabase.storage
      .from('marriage-evidence')
      .upload(path, file, { contentType: file.type, upsert: false });
    if (error) throw error;
    // For private bucket — get a signed URL valid for 1h, AI Gateway fetches it
    const { data, error: signErr } = await supabase.storage
      .from('marriage-evidence')
      .createSignedUrl(path, 60 * 60);
    if (signErr) throw signErr;
    return data.signedUrl;
  },

  async analyze(payload: {
    user_context: string;
    attachments: MarriageAttachment[];
    transcripts: { combined_text: string };
  }) {
    const { data, error } = await supabase.functions.invoke('marriage-coach', { body: payload });
    if (error) throw error;
    return data;
  },

  async transcribeAudio(file: File): Promise<string> {
    const formData = new FormData();
    formData.append('file', file, file.name);
    const { data, error } = await supabase.functions.invoke('marriage-transcribe', { body: formData });
    if (error) throw error;
    return data?.text || '';
  },

  async markTaskExported(sessionId: string, taskId: string) {
    const { error } = await supabase
      .from('marriage_sessions' as any)
      .update({ task_exported: true, task_id: taskId })
      .eq('id', sessionId);
    if (error) throw error;
  },

  async sendFollowup(sessionId: string, message: string): Promise<string> {
    const { data, error } = await supabase.functions.invoke('marriage-coach-followup', {
      body: { session_id: sessionId, message },
    });
    if (error) throw error;
    return data?.message || '';
  },

  async listFollowupMessages(sessionId: string): Promise<Array<{ role: 'user' | 'assistant'; content: string; created_at: string }>> {
    const { data, error } = await supabase
      .from('marriage_session_messages' as any)
      .select('role, content, created_at')
      .eq('session_id', sessionId)
      .order('created_at', { ascending: true });
    if (error) throw error;
    return (data || []) as any;
  },
};
