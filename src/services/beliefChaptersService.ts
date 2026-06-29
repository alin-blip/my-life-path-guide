import { supabase } from "@/integrations/supabase/client";
import type { ChapterSlug } from "@/data/credinte-fundamentale";

export interface BeliefChapter {
  id: string;
  slug: string;
  title: string;
  subtitle: string | null;
  description: string | null;
  audio_url: string | null;
  audio_url_2: string | null;
  pptx_url: string | null;
  fishbowl_url: string | null;
  color_hex: string;
  icon: string | null;
  order_index: number;
  cheat_sheet: any;
}

export interface ChapterProgress {
  id?: string;
  chapter_slug: string;
  audio_percent: number;
  pptx_opened: boolean;
  fishbowl_completed: boolean;
  matrix_completed: boolean;
  notes: string | null;
  completed_at: string | null;
}

export interface BeliefAudit {
  id: string;
  responses: Record<string, number>;
  scores: Record<ChapterSlug, number>;
  diagnosis_labels: string[];
  overall_score: number | null;
  strategic_plan: any;
  ai_summary: string | null;
  next_due_at: string | null;
  completed_at: string | null;
  created_at: string;
}

export const beliefChaptersService = {
  async listChapters(): Promise<BeliefChapter[]> {
    const { data, error } = await supabase
      .from("belief_chapters")
      .select("*")
      .eq("is_published", true)
      .order("order_index", { ascending: true });
    if (error) throw error;
    return (data ?? []) as BeliefChapter[];
  },

  async getChapter(slug: string): Promise<BeliefChapter | null> {
    const { data, error } = await supabase
      .from("belief_chapters")
      .select("*")
      .eq("slug", slug)
      .maybeSingle();
    if (error) throw error;
    return data as BeliefChapter | null;
  },

  async updateChapter(slug: string, updates: Partial<BeliefChapter>): Promise<void> {
    const { error } = await supabase
      .from("belief_chapters")
      .update(updates)
      .eq("slug", slug);
    if (error) throw error;
  },

  async listProgress(): Promise<Record<string, ChapterProgress>> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return {};
    const { data, error } = await supabase
      .from("belief_chapter_progress")
      .select("*")
      .eq("user_id", user.id);
    if (error) throw error;
    const map: Record<string, ChapterProgress> = {};
    for (const row of data ?? []) map[row.chapter_slug] = row as ChapterProgress;
    return map;
  },

  async upsertProgress(slug: string, patch: Partial<ChapterProgress>): Promise<void> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("Not authenticated");
    const { error } = await supabase
      .from("belief_chapter_progress")
      .upsert(
        { user_id: user.id, chapter_slug: slug, ...patch },
        { onConflict: "user_id,chapter_slug" },
      );
    if (error) throw error;
  },

  async getFishbowlResponses(slug: string) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;
    const { data, error } = await supabase
      .from("belief_fishbowl_responses")
      .select("*")
      .eq("user_id", user.id)
      .eq("chapter_slug", slug)
      .maybeSingle();
    if (error) throw error;
    return data;
  },

  async saveFishbowlResponses(slug: string, responses: Record<string, string>, ai_feedback?: string) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("Not authenticated");
    const existing = await this.getFishbowlResponses(slug);
    if (existing) {
      const { error } = await supabase
        .from("belief_fishbowl_responses")
        .update({ responses, ai_feedback: ai_feedback ?? existing.ai_feedback })
        .eq("id", existing.id);
      if (error) throw error;
    } else {
      const { error } = await supabase
        .from("belief_fishbowl_responses")
        .insert({ user_id: user.id, chapter_slug: slug, responses, ai_feedback: ai_feedback ?? null });
      if (error) throw error;
    }
  },

  async listAudits(): Promise<BeliefAudit[]> {
    const { data, error } = await supabase
      .from("belief_audits")
      .select("*")
      .order("created_at", { ascending: false });
    if (error) throw error;
    return (data ?? []) as any;
  },

  async getAudit(id: string): Promise<BeliefAudit | null> {
    const { data, error } = await supabase
      .from("belief_audits")
      .select("*")
      .eq("id", id)
      .maybeSingle();
    if (error) throw error;
    return data as any;
  },

  async createAudit(payload: {
    responses: Record<string, number>;
    scores: Record<string, number>;
    diagnosis_labels: string[];
    overall_score: number;
    strategic_plan: any;
    ai_summary: string;
  }): Promise<string> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("Not authenticated");
    const nextDue = new Date();
    nextDue.setDate(nextDue.getDate() + 90);
    const { data, error } = await supabase
      .from("belief_audits")
      .insert({
        user_id: user.id,
        ...payload,
        next_due_at: nextDue.toISOString(),
        completed_at: new Date().toISOString(),
      })
      .select("id")
      .single();
    if (error) throw error;
    return data.id;
  },
};
