import { supabase } from '@/integrations/supabase/client';
import { format } from 'date-fns';

type SelfCareField = 'sleep_ok' | 'movement_done' | 'food_clean' | 'tech_break_done';

/**
 * Auto-marks a self-care indicator as done for today when the user finishes a
 * matching routine step. Silent — never throws, always resolves.
 */
export async function autoMarkSelfCare(fields: SelfCareField | SelfCareField[]): Promise<void> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const list = Array.isArray(fields) ? fields : [fields];
    if (list.length === 0) return;

    const today = format(new Date(), 'yyyy-MM-dd');

    // Fetch existing log
    const { data: existing } = await (supabase as any)
      .from('belief_self_care_logs')
      .select('id, sleep_ok, movement_done, food_clean, tech_break_done, sleep_hours')
      .eq('user_id', user.id)
      .eq('log_date', today)
      .maybeSingle();

    const merged = {
      sleep_ok: existing?.sleep_ok ?? false,
      movement_done: existing?.movement_done ?? false,
      food_clean: existing?.food_clean ?? false,
      tech_break_done: existing?.tech_break_done ?? false,
    };

    // Skip if all requested fields are already true
    const changed = list.some((f) => !merged[f]);
    if (!changed) return;

    for (const f of list) merged[f] = true;

    const score = [merged.sleep_ok, merged.movement_done, merged.food_clean, merged.tech_break_done]
      .filter(Boolean).length * 25;

    if (existing?.id) {
      await (supabase as any)
        .from('belief_self_care_logs')
        .update({ ...merged, score })
        .eq('id', existing.id);
    } else {
      await (supabase as any)
        .from('belief_self_care_logs')
        .insert({ user_id: user.id, log_date: today, ...merged, score });
    }

    window.dispatchEvent(new CustomEvent('selfCare:refresh'));
  } catch (err) {
    console.warn('[selfCareAutoComplete] failed:', err);
  }
}

/**
 * Map routine step ids to Self Care indicator fields.
 */
export const ROUTINE_STEP_TO_SELF_CARE: Record<string, SelfCareField[]> = {
  exercise: ['movement_done'],
  mealPlanning: ['food_clean'],
  meditation: ['tech_break_done'],
  breathing: ['tech_break_done'],
};
