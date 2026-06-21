// Belief Matrix Service — per-belief upsert + fetch all for the user.
import { supabase } from "@/integrations/supabase/client";

export type BeliefData = Record<string, string>;

export interface BeliefRow {
  id: string;
  belief_key: string;
  data: BeliefData;
  updated_at: string;
}

export const beliefMatrixService = {
  async getAll(): Promise<Record<string, BeliefRow>> {
    const { data: userData } = await supabase.auth.getUser();
    const userId = userData?.user?.id;
    if (!userId) return {};

    const { data, error } = await supabase
      .from("mind_belief_matrix")
      .select("id, belief_key, data, updated_at")
      .eq("user_id", userId);

    if (error) {
      console.error("beliefMatrix.getAll:", error);
      return {};
    }

    const map: Record<string, BeliefRow> = {};
    for (const row of (data ?? []) as any[]) {
      map[row.belief_key] = {
        id: row.id,
        belief_key: row.belief_key,
        data: (row.data ?? {}) as BeliefData,
        updated_at: row.updated_at,
      };
    }
    return map;
  },

  async save(beliefKey: string, data: BeliefData): Promise<void> {
    const { data: userData } = await supabase.auth.getUser();
    const userId = userData?.user?.id;
    if (!userId) throw new Error("Not authenticated");

    // Try update first, fall back to insert (no unique constraint guaranteed)
    const { data: existing } = await supabase
      .from("mind_belief_matrix")
      .select("id")
      .eq("user_id", userId)
      .eq("belief_key", beliefKey)
      .maybeSingle();

    if (existing?.id) {
      const { error } = await supabase
        .from("mind_belief_matrix")
        .update({ data: data as any, updated_at: new Date().toISOString() })
        .eq("id", existing.id);
      if (error) throw error;
    } else {
      const { error } = await supabase
        .from("mind_belief_matrix")
        .insert({ user_id: userId, belief_key: beliefKey, data: data as any });
      if (error) throw error;
    }
  },
};

/** % of non-empty fields in a belief's saved data given expected field keys. */
export function beliefProgress(
  data: BeliefData | undefined,
  fieldKeys: string[],
): number {
  if (!data || fieldKeys.length === 0) return 0;
  const filled = fieldKeys.filter((k) => (data[k] ?? "").trim().length > 0).length;
  return Math.round((filled / fieldKeys.length) * 100);
}
