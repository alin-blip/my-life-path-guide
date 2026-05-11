import { supabase } from '@/integrations/supabase/client';

const LS_KEY = 'vision_plan_scores';
const LS_ONBOARDING_KEY = 'vision_onboarding_complete';

export type VisionScores = Record<string, number>;

/**
 * Persistence: DB (user_preferences.vision_quiz_scores) is source of truth.
 * localStorage is a cache so the modal/dashboard can render instantly without await.
 */
export const visionScoresService = {
  /** Save scores to DB and mirror to cache. */
  async save(userId: string, scores: VisionScores): Promise<void> {
    try {
      localStorage.setItem(LS_KEY, JSON.stringify(scores));
    } catch {
      // Ignore storage errors
    }
    try {
      const { error } = await supabase
        .from('user_preferences')
        .upsert(
          { user_id: userId, vision_quiz_scores: scores as any },
          { onConflict: 'user_id' }
        );
      if (error) console.error('[visionScores] save error:', error);
    } catch (e) {
      console.error('[visionScores] save threw:', e);
    }
  },

  /** Load from DB; falls back to cache. Updates cache on success. */
  async load(userId: string): Promise<VisionScores | null> {
    try {
      const { data, error } = await supabase
        .from('user_preferences')
        .select('vision_quiz_scores')
        .eq('user_id', userId)
        .maybeSingle();

      if (!error && data?.vision_quiz_scores) {
        const scores = data.vision_quiz_scores as VisionScores;
        try {
          localStorage.setItem(LS_KEY, JSON.stringify(scores));
        } catch {
          // Ignore storage errors
        }
        return scores;
      }
    } catch (e) {
      console.error('[visionScores] load error:', e);
    }
    return this.getCached();
  },

  /**
   * One-shot sync: if cache has scores but DB doesn't, push cache → DB.
   * Call after auth so the legacy localStorage value gets persisted server-side.
   */
  async syncCacheToDB(userId: string): Promise<void> {
    const cached = this.getCached();
    if (!cached) return;
    try {
      const { data } = await supabase
        .from('user_preferences')
        .select('vision_quiz_scores')
        .eq('user_id', userId)
        .maybeSingle();
      if (!data?.vision_quiz_scores) {
        await this.save(userId, cached);
      }
    } catch (e) {
      console.error('[visionScores] syncCacheToDB error:', e);
    }
  },

  getCached(): VisionScores | null {
    try {
      const raw = localStorage.getItem(LS_KEY);
      if (!raw) return null;
      return JSON.parse(raw);
    } catch {
      return null;
    }
  },

  isOnboardingComplete(): boolean {
    return localStorage.getItem(LS_ONBOARDING_KEY) === 'true';
  },

  markOnboardingComplete(): void {
    localStorage.setItem(LS_ONBOARDING_KEY, 'true');
  },

  clearCache(): void {
    localStorage.removeItem(LS_KEY);
  },
};
