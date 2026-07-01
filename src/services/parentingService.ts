import { supabase } from '@/integrations/supabase/client';

export interface ParentingChild {
  id: string;
  user_id: string;
  name: string;
  birth_year: number;
  birth_month?: number | null;
  gender?: 'male' | 'female' | 'other' | 'undisclosed' | null;
  nickname?: string | null;
  strengths?: string | null;
  challenges?: string | null;
  notes?: string | null;
  is_active: boolean;
  position: number;
  created_at: string;
  updated_at: string;
}

export interface ParentingProfile {
  id?: string;
  user_id?: string;
  detected_style: 'authoritative' | 'authoritarian' | 'permissive' | 'neglectful' | 'mixed' | 'unknown';
  co_parent_name?: string | null;
  onboarding_completed: boolean;
  daily_nudge_enabled: boolean;
  preferred_language: 'ro' | 'en';
  notes?: string | null;
}

export interface EvidenceSource {
  id: string;
  slug: string;
  author: string;
  year: number | null;
  title: string;
  url: string | null;
  source_type: string | null;
  topic: string[] | null;
  confidence: 'high' | 'medium' | 'low';
  summary_ro: string | null;
  summary_en: string | null;
}

export type PiagetStage = 'sensorimotor' | 'preoperational' | 'concrete_operational' | 'formal_operational';
export type EriksonStage = 'trust' | 'autonomy' | 'initiative' | 'industry' | 'identity';

export interface AgeContext {
  age: number;
  piaget: PiagetStage;
  erikson: EriksonStage;
  piagetLabel: { ro: string; en: string };
  eriksonLabel: { ro: string; en: string };
  ageBand: '0-2' | '2-7' | '7-11' | '12-18';
}

export function getAgeContext(birthYear: number, birthMonth?: number | null): AgeContext {
  const now = new Date();
  let age = now.getFullYear() - birthYear;
  if (birthMonth && now.getMonth() + 1 < birthMonth) age -= 1;
  age = Math.max(0, age);

  let piaget: PiagetStage, erikson: EriksonStage, ageBand: AgeContext['ageBand'];
  let piagetLabel: AgeContext['piagetLabel'], eriksonLabel: AgeContext['eriksonLabel'];

  if (age <= 2) {
    piaget = 'sensorimotor'; erikson = 'trust'; ageBand = '0-2';
    piagetLabel = { ro: 'Senzoriomotor', en: 'Sensorimotor' };
    eriksonLabel = { ro: 'Încredere vs Neîncredere', en: 'Trust vs Mistrust' };
  } else if (age <= 7) {
    piaget = 'preoperational'; erikson = age <= 3 ? 'autonomy' : 'initiative'; ageBand = '2-7';
    piagetLabel = { ro: 'Preoperațional', en: 'Preoperational' };
    eriksonLabel = age <= 3
      ? { ro: 'Autonomie vs Rușine', en: 'Autonomy vs Shame' }
      : { ro: 'Inițiativă vs Vină', en: 'Initiative vs Guilt' };
  } else if (age <= 11) {
    piaget = 'concrete_operational'; erikson = 'industry'; ageBand = '7-11';
    piagetLabel = { ro: 'Operațional-Concret', en: 'Concrete Operational' };
    eriksonLabel = { ro: 'Sârguință vs Inferioritate', en: 'Industry vs Inferiority' };
  } else {
    piaget = 'formal_operational'; erikson = 'identity'; ageBand = '12-18';
    piagetLabel = { ro: 'Formal-Operațional', en: 'Formal Operational' };
    eriksonLabel = { ro: 'Identitate vs Confuzie', en: 'Identity vs Role Confusion' };
  }

  return { age, piaget, erikson, ageBand, piagetLabel, eriksonLabel };
}

export const parentingService = {
  async getProfile(userId: string): Promise<ParentingProfile | null> {
    const { data, error } = await supabase
      .from('parenting_profiles' as any)
      .select('*')
      .eq('user_id', userId)
      .maybeSingle();
    if (error) throw error;
    return data as any;
  },

  async upsertProfile(userId: string, patch: Partial<ParentingProfile>): Promise<ParentingProfile> {
    const { data, error } = await supabase
      .from('parenting_profiles' as any)
      .upsert({ user_id: userId, ...patch }, { onConflict: 'user_id' })
      .select()
      .single();
    if (error) throw error;
    return data as any;
  },

  async listChildren(userId: string): Promise<ParentingChild[]> {
    const { data, error } = await supabase
      .from('parenting_children' as any)
      .select('*')
      .eq('user_id', userId)
      .eq('is_active', true)
      .order('position', { ascending: true });
    if (error) throw error;
    return (data || []) as any;
  },

  async getChild(id: string): Promise<ParentingChild | null> {
    const { data, error } = await supabase
      .from('parenting_children' as any)
      .select('*')
      .eq('id', id)
      .maybeSingle();
    if (error) throw error;
    return data as any;
  },

  async createChild(userId: string, payload: Omit<Partial<ParentingChild>, 'id' | 'user_id'> & { name: string; birth_year: number }): Promise<ParentingChild> {
    const { data, error } = await supabase
      .from('parenting_children' as any)
      .insert({ user_id: userId, ...payload })
      .select()
      .single();
    if (error) throw error;
    return data as any;
  },

  async updateChild(id: string, patch: Partial<ParentingChild>): Promise<ParentingChild> {
    const { data, error } = await supabase
      .from('parenting_children' as any)
      .update(patch)
      .eq('id', id)
      .select()
      .single();
    if (error) throw error;
    return data as any;
  },

  async deactivateChild(id: string): Promise<void> {
    const { error } = await supabase
      .from('parenting_children' as any)
      .update({ is_active: false })
      .eq('id', id);
    if (error) throw error;
  },

  async listEvidenceSources(topics?: string[]): Promise<EvidenceSource[]> {
    let q = supabase.from('parenting_evidence_sources' as any).select('*');
    if (topics && topics.length) q = q.overlaps('topic', topics);
    const { data, error } = await q.order('year', { ascending: false });
    if (error) throw error;
    return (data || []) as any;
  },

  async coachChat(payload: { messages: Array<{ role: 'user' | 'assistant'; content: string }>; child_id?: string; session_id?: string; language?: 'ro' | 'en' }): Promise<string> {
    const { data, error } = await supabase.functions.invoke('parenting-coach', { body: payload });
    if (error) throw error;
    return (data as any)?.message || '';
  },

  async saveToxicityScan(userId: string, payload: {
    child_id?: string | null;
    raw_answers: Record<string, number>;
    authoritative_score: number;
    authoritarian_score: number;
    permissive_score: number;
    neglectful_score: number;
    dominant_style: string;
    toxic_patterns: Record<string, number>;
  }): Promise<{ id: string }> {
    const { data, error } = await supabase
      .from('parenting_toxicity_scans' as any)
      .insert({ user_id: userId, ...payload })
      .select('id')
      .single();
    if (error) throw error;
    return data as any;
  },

  async analyzeToxicity(payload: {
    scan_id: string;
    language?: 'ro' | 'en';
    child_context?: { name?: string; age?: number; piaget?: string; erikson?: string };
  }): Promise<{ interpretation: string; action_plan: Array<{ title: string; why: string; how: string }> }> {
    const { data, error } = await supabase.functions.invoke('parenting-toxicity-analyze', { body: payload });
    if (error) throw error;
    return data as any;
  },

  async getScan(scanId: string) {
    const { data, error } = await supabase
      .from('parenting_toxicity_scans' as any)
      .select('*')
      .eq('id', scanId)
      .maybeSingle();
    if (error) throw error;
    return data as any;
  },

  async listScans(userId: string, childId?: string) {
    let q = supabase.from('parenting_toxicity_scans' as any).select('*').eq('user_id', userId);
    if (childId) q = q.eq('child_id', childId);
    const { data, error } = await q.order('created_at', { ascending: false });
    if (error) throw error;
    return (data || []) as any[];
  },

  // ============ Sessions / Coach ============
  async createSession(userId: string, payload: { child_id?: string | null; session_type?: string; title?: string }) {
    const { data, error } = await supabase
      .from('parenting_sessions' as any)
      .insert({
        user_id: userId,
        child_id: payload.child_id || null,
        session_type: payload.session_type || 'coach',
        title: payload.title || null,
      })
      .select()
      .single();
    if (error) throw error;
    return data as any;
  },

  async listSessions(userId: string, childId?: string | null) {
    let q = supabase
      .from('parenting_sessions' as any)
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(30);
    if (childId) q = q.eq('child_id', childId);
    const { data, error } = await q;
    if (error) throw error;
    return (data || []) as any[];
  },

  async getSessionMessages(sessionId: string) {
    const { data, error } = await supabase
      .from('parenting_session_messages' as any)
      .select('*')
      .eq('session_id', sessionId)
      .order('created_at', { ascending: true });
    if (error) throw error;
    return (data || []) as any[];
  },

  async updateSession(id: string, patch: Record<string, unknown>) {
    const { error } = await supabase
      .from('parenting_sessions' as any)
      .update(patch)
      .eq('id', id);
    if (error) throw error;
  },

  // ============ Timeline ============
  async listTimelineEvents(userId: string, childId?: string | null) {
    let q = supabase
      .from('parenting_timeline_events' as any)
      .select('*')
      .eq('user_id', userId)
      .order('event_date', { ascending: false })
      .limit(100);
    if (childId) q = q.eq('child_id', childId);
    const { data, error } = await q;
    if (error) throw error;
    return (data || []) as any[];
  },

  async addTimelineEvent(userId: string, payload: {
    child_id?: string | null;
    event_type: 'rupture' | 'repair' | 'breakthrough' | 'milestone' | 'concern' | 'gratitude';
    title: string;
    description?: string;
    emotional_intensity?: number;
    tags?: string[];
    event_date?: string;
  }) {
    const { data, error } = await supabase
      .from('parenting_timeline_events' as any)
      .insert({
        user_id: userId,
        child_id: payload.child_id || null,
        event_type: payload.event_type,
        title: payload.title,
        description: payload.description || null,
        emotional_intensity: payload.emotional_intensity || null,
        tags: payload.tags || null,
        event_date: payload.event_date || new Date().toISOString(),
      })
      .select()
      .single();
    if (error) throw error;
    return data as any;
  },

  async deleteTimelineEvent(id: string) {
    const { error } = await supabase
      .from('parenting_timeline_events' as any)
      .delete()
      .eq('id', id);
    if (error) throw error;
  },
};
