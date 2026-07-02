import { supabase } from '@/integrations/supabase/client';
import { format } from 'date-fns';

/**
 * Auto-marks a daily habit as complete when the user finishes a matching
 * routine step. Silent — never throws, always resolves.
 *
 * Matching is case-insensitive on the habit name. If the user has renamed or
 * deleted the habit, this is a no-op.
 */
export async function autoCompleteHabitByName(names: string | string[]): Promise<void> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const nameList = (Array.isArray(names) ? names : [names])
      .map(n => n.trim())
      .filter(Boolean);
    if (nameList.length === 0) return;

    const { data: habits } = await supabase
      .from('daily_habits')
      .select('id, name')
      .eq('user_id', user.id)
      .eq('is_active', true);

    if (!habits || habits.length === 0) return;

    const lowered = nameList.map(n => n.toLowerCase());
    const matches = habits.filter(h =>
      lowered.some(n => h.name.toLowerCase() === n || h.name.toLowerCase().includes(n))
    );
    if (matches.length === 0) return;

    const today = format(new Date(), 'yyyy-MM-dd');

    // Check existing completions to avoid duplicate insert errors
    const { data: existing } = await supabase
      .from('daily_habit_completions')
      .select('habit_id')
      .eq('user_id', user.id)
      .eq('date', today)
      .in('habit_id', matches.map(m => m.id));

    const doneIds = new Set((existing || []).map((e: any) => e.habit_id));
    const toInsert = matches
      .filter(m => !doneIds.has(m.id))
      .map(m => ({ user_id: user.id, habit_id: m.id, date: today }));

    if (toInsert.length === 0) return;

    await supabase.from('daily_habit_completions').insert(toInsert);
    window.dispatchEvent(new CustomEvent('habits:refresh'));
  } catch (err) {
    // Silent — auto-complete must never break the routine flow
    console.warn('[habitAutoComplete] failed:', err);
  }
}

/**
 * Maps routine step ids to habit names that should auto-complete.
 */
export const ROUTINE_STEP_TO_HABIT: Record<string, string[]> = {
  meditation: ['Meditation', 'Meditație'],
  journaling: ['Jurnal', 'Journal'],
  exercise: ['Fitness', 'Sport', 'Workout'],
  mealPlanning: ['Fuel', 'Nutriție', 'Nutrition'],
  relationships: ['Person 1', 'Persoană 1', 'Relații'],
  contentCreation: ['Content', 'Conținut'],
  powerDeclaration: ['Declare', 'Declarație'],
  visionDeclaration: ['Declare', 'Declarație'],
  learn: ['Discover', 'Learn', 'Învață'],
  reading: ['Discover', 'Reading', 'Citit'],
};
