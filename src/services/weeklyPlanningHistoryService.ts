import { supabase } from '@/integrations/supabase/client';
import { PlanningResult } from '@/types/door';

export interface WeeklyPlanningHistoryItem {
  id: string;
  weekKey: string;
  dominoTitle: string;
  weekGoal: string;
  keyPoints: PlanningResult['keyPoints'];
  reviewData?: {
    completedKeys: number[];
    learnings: string[];
    continuedKeys: number[];
  };
  versionNumber: number;
  createdAt: string;
  snapshotReason: string;
}

async function getUserId(): Promise<string | null> {
  const { data, error } = await supabase.auth.getUser();
  if (error) {
    console.error('Error getting user:', error);
    return null;
  }
  return data.user?.id ?? null;
}

export const weeklyPlanningHistoryService = {
  /**
   * Get all history versions for a specific week
   */
  async getHistoryForWeek(weekKey: string): Promise<WeeklyPlanningHistoryItem[]> {
    const userId = await getUserId();
    if (!userId) return [];

    try {
      const { data, error } = await supabase
        .from('weekly_planning_history')
        .select('*')
        .eq('user_id', userId)
        .eq('week_key', weekKey)
        .order('version_number', { ascending: false });

      if (error || !data) {
        console.error('Error fetching history:', error);
        return [];
      }

      return data.map(item => ({
        id: item.id,
        weekKey: item.week_key,
        dominoTitle: item.domino_title || '',
        weekGoal: item.week_goal || '',
        keyPoints: (item.key_points || []) as PlanningResult['keyPoints'],
        reviewData: item.review_data as WeeklyPlanningHistoryItem['reviewData'],
        versionNumber: item.version_number,
        createdAt: item.created_at,
        snapshotReason: item.snapshot_reason || 'auto_save',
      }));
    } catch (error) {
      console.error('Error in getHistoryForWeek:', error);
      return [];
    }
  },

  /**
   * Get all history across all weeks (limited to last 50)
   */
  async getAllHistory(): Promise<WeeklyPlanningHistoryItem[]> {
    const userId = await getUserId();
    if (!userId) return [];

    try {
      const { data, error } = await supabase
        .from('weekly_planning_history')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(50);

      if (error || !data) {
        console.error('Error fetching all history:', error);
        return [];
      }

      return data.map(item => ({
        id: item.id,
        weekKey: item.week_key,
        dominoTitle: item.domino_title || '',
        weekGoal: item.week_goal || '',
        keyPoints: (item.key_points || []) as PlanningResult['keyPoints'],
        reviewData: item.review_data as WeeklyPlanningHistoryItem['reviewData'],
        versionNumber: item.version_number,
        createdAt: item.created_at,
        snapshotReason: item.snapshot_reason || 'auto_save',
      }));
    } catch (error) {
      console.error('Error in getAllHistory:', error);
      return [];
    }
  },

  /**
   * Manually create a snapshot (backup)
   */
  async createSnapshot(
    weekKey: string, 
    dominoTitle: string, 
    weekGoal: string, 
    keyPoints: PlanningResult['keyPoints'],
    reason: string = 'manual_backup'
  ): Promise<boolean> {
    const userId = await getUserId();
    if (!userId) return false;

    try {
      // Get next version number
      const { data: existingVersions } = await supabase
        .from('weekly_planning_history')
        .select('version_number')
        .eq('user_id', userId)
        .eq('week_key', weekKey)
        .order('version_number', { ascending: false })
        .limit(1);

      const nextVersion = (existingVersions?.[0]?.version_number || 0) + 1;

      const { error } = await supabase
        .from('weekly_planning_history')
        .insert({
          user_id: userId,
          week_key: weekKey,
          domino_title: dominoTitle,
          week_goal: weekGoal,
          key_points: keyPoints,
          version_number: nextVersion,
          snapshot_reason: reason,
        });

      if (error) {
        console.error('Error creating snapshot:', error);
        return false;
      }

      console.log('✅ Snapshot created successfully, version:', nextVersion);
      return true;
    } catch (error) {
      console.error('Error in createSnapshot:', error);
      return false;
    }
  },

  /**
   * Delete a specific history version
   */
  async deleteVersion(historyId: string): Promise<boolean> {
    const userId = await getUserId();
    if (!userId) return false;

    try {
      const { error } = await supabase
        .from('weekly_planning_history')
        .delete()
        .eq('id', historyId)
        .eq('user_id', userId);

      if (error) {
        console.error('Error deleting history version:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Error in deleteVersion:', error);
      return false;
    }
  },

  /**
   * Clean up old history (keep only last N versions per week)
   */
  async cleanupOldHistory(keepVersionsPerWeek: number = 10): Promise<void> {
    const userId = await getUserId();
    if (!userId) return;

    try {
      // Get all week keys
      const { data: weeks } = await supabase
        .from('weekly_planning_history')
        .select('week_key')
        .eq('user_id', userId);

      if (!weeks) return;

      const uniqueWeeks = [...new Set(weeks.map(w => w.week_key))];

      for (const weekKey of uniqueWeeks) {
        // Get all versions for this week
        const { data: versions } = await supabase
          .from('weekly_planning_history')
          .select('id, version_number')
          .eq('user_id', userId)
          .eq('week_key', weekKey)
          .order('version_number', { ascending: false });

        if (!versions || versions.length <= keepVersionsPerWeek) continue;

        // Delete old versions
        const toDelete = versions.slice(keepVersionsPerWeek);
        for (const version of toDelete) {
          await supabase
            .from('weekly_planning_history')
            .delete()
            .eq('id', version.id);
        }
      }

      console.log('✅ History cleanup completed');
    } catch (error) {
      console.error('Error in cleanupOldHistory:', error);
    }
  }
};
