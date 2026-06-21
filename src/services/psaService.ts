// PSA Reconstruction Service — per-pattern upsert + fetch all for the user,
// plus a lightweight history of saves so users can review and restore past versions.
import { supabase } from "@/integrations/supabase/client";

export type PsaData = Record<string, string>;

export interface PsaRow {
  id: string;
  belief_key: string;
  data: PsaData;
  progress_percent: number | null;
  updated_at: string;
}

export interface PsaHistoryRow {
  id: string;
  belief_key: string;
  data: PsaData;
  progress_percent: number;
  created_at: string;
}

/** Max history rows kept per pattern (we trim older ones after each save). */
const HISTORY_MAX_PER_PATTERN = 20;

export const psaService = {
  async getAll(): Promise<Record<string, PsaRow>> {
    const { data: userData } = await supabase.auth.getUser();
    const userId = userData?.user?.id;
    if (!userId) return {};

    const { data, error } = await supabase
      .from("mind_psa_reconstruction")
      .select("id, belief_key, data, progress_percent, updated_at")
      .eq("user_id", userId);

    if (error) {
      console.error("psaService.getAll:", error);
      return {};
    }

    const map: Record<string, PsaRow> = {};
    for (const row of (data ?? []) as any[]) {
      map[row.belief_key] = {
        id: row.id,
        belief_key: row.belief_key,
        data: (row.data ?? {}) as PsaData,
        progress_percent: row.progress_percent ?? 0,
        updated_at: row.updated_at,
      };
    }
    return map;
  },

  async save(beliefKey: string, data: PsaData, progressPercent: number): Promise<void> {
    const { data: userData } = await supabase.auth.getUser();
    const userId = userData?.user?.id;
    if (!userId) throw new Error("Not authenticated");

    const { data: existing } = await supabase
      .from("mind_psa_reconstruction")
      .select("id")
      .eq("user_id", userId)
      .eq("belief_key", beliefKey)
      .maybeSingle();

    if (existing?.id) {
      const { error } = await supabase
        .from("mind_psa_reconstruction")
        .update({
          data: data as any,
          progress_percent: progressPercent,
          updated_at: new Date().toISOString(),
        })
        .eq("id", existing.id);
      if (error) throw error;
    } else {
      const { error } = await supabase
        .from("mind_psa_reconstruction")
        .insert({
          user_id: userId,
          belief_key: beliefKey,
          data: data as any,
          progress_percent: progressPercent,
        });
      if (error) throw error;
    }

    // Best-effort history snapshot. Never throw — history is non-critical.
    try {
      await supabase.from("mind_psa_history").insert({
        user_id: userId,
        belief_key: beliefKey,
        data: data as any,
        progress_percent: progressPercent,
      });
      await trimHistory(userId, beliefKey);
    } catch (e) {
      console.warn("psaService.save: history snapshot failed", e);
    }
  },

  async getHistory(beliefKey: string, limit = 10): Promise<PsaHistoryRow[]> {
    const { data: userData } = await supabase.auth.getUser();
    const userId = userData?.user?.id;
    if (!userId) return [];

    const { data, error } = await supabase
      .from("mind_psa_history")
      .select("id, belief_key, data, progress_percent, created_at")
      .eq("user_id", userId)
      .eq("belief_key", beliefKey)
      .order("created_at", { ascending: false })
      .limit(limit);

    if (error) {
      console.error("psaService.getHistory:", error);
      return [];
    }
    return (data ?? []).map((row: any) => ({
      id: row.id,
      belief_key: row.belief_key,
      data: (row.data ?? {}) as PsaData,
      progress_percent: row.progress_percent ?? 0,
      created_at: row.created_at,
    }));
  },
};

async function trimHistory(userId: string, beliefKey: string) {
  const { data } = await supabase
    .from("mind_psa_history")
    .select("id, created_at")
    .eq("user_id", userId)
    .eq("belief_key", beliefKey)
    .order("created_at", { ascending: false });

  const rows = (data ?? []) as { id: string; created_at: string }[];
  if (rows.length <= HISTORY_MAX_PER_PATTERN) return;
  const toDelete = rows.slice(HISTORY_MAX_PER_PATTERN).map((r) => r.id);
  if (toDelete.length === 0) return;
  await supabase.from("mind_psa_history").delete().in("id", toDelete);
}

export function psaProgress(data: PsaData | undefined, fieldKeys: string[]): number {
  if (!data || fieldKeys.length === 0) return 0;
  const filled = fieldKeys.filter((k) => (data[k] ?? "").trim().length > 0).length;
  return Math.round((filled / fieldKeys.length) * 100);
}
