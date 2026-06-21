// PSA Reconstruction Service — per-pattern upsert + fetch all for the user.
import { supabase } from "@/integrations/supabase/client";

export type PsaData = Record<string, string>;

export interface PsaRow {
  id: string;
  belief_key: string;
  data: PsaData;
  progress_percent: number | null;
  updated_at: string;
}

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
  },
};

export function psaProgress(data: PsaData | undefined, fieldKeys: string[]): number {
  if (!data || fieldKeys.length === 0) return 0;
  const filled = fieldKeys.filter((k) => (data[k] ?? "").trim().length > 0).length;
  return Math.round((filled / fieldKeys.length) * 100);
}
