import { supabase } from '@/integrations/supabase/client';
import { PlanningResult } from '@/types/door';

export interface WeeklyPlanningData {
  id?: string;
  weekKey: string;
  dominoTitle: string;
  weekGoal: string;
  keyPoints: PlanningResult['keyPoints'];
  reviewData?: {
    completedKeys: number[];
    learnings: string[];
    continuedKeys: number[];
  };
}

async function getUserId(): Promise<string | null> {
  const { data, error } = await supabase.auth.getUser();
  if (error) {
    console.error('Error getting user:', error);
    return null;
  }
  return data.user?.id ?? null;
}

export const weeklyPlanningService = {
  async savePlan(planData: WeeklyPlanningData): Promise<boolean> {
    const userId = await getUserId();
    if (!userId) {
      console.error('No user ID found');
      return false;
    }

    try {
      const { error } = await supabase
        .from('weekly_planning')
        .upsert({
          user_id: userId,
          week_key: planData.weekKey,
          domino_title: planData.dominoTitle,
          week_goal: planData.weekGoal,
          key_points: planData.keyPoints,
          review_data: planData.reviewData || {},
          updated_at: new Date().toISOString(),
        }, {
          onConflict: 'user_id,week_key'
        });

      if (error) {
        console.error('Error saving weekly plan:', error);
        return false;
      }

      console.log('✅ Weekly plan saved successfully');
      return true;
    } catch (error) {
      console.error('Error in savePlan:', error);
      return false;
    }
  },

  async getPlanForWeek(weekKey: string): Promise<WeeklyPlanningData | null> {
    const userId = await getUserId();
    if (!userId) return null;

    try {
      const { data, error } = await supabase
        .from('weekly_planning')
        .select('*')
        .eq('user_id', userId)
        .eq('week_key', weekKey)
        .single();

      if (error || !data) {
        console.log('No plan found for week:', weekKey);
        return null;
      }

      return {
        id: data.id,
        weekKey: data.week_key,
        dominoTitle: data.domino_title,
        weekGoal: data.week_goal,
        keyPoints: data.key_points as PlanningResult['keyPoints'],
        reviewData: data.review_data as WeeklyPlanningData['reviewData'],
      };
    } catch (error) {
      console.error('Error fetching plan:', error);
      return null;
    }
  },

  async getPreviousWeekPlan(currentWeekKey: string): Promise<WeeklyPlanningData | null> {
    const userId = await getUserId();
    if (!userId) return null;

    try {
      // Parse current week key (format: YYYY-WXX)
      const [year, weekStr] = currentWeekKey.split('-W');
      const currentWeekNum = parseInt(weekStr);
      
      // Calculate previous week
      let prevWeekNum = currentWeekNum - 1;
      let prevYear = parseInt(year);
      
      if (prevWeekNum < 1) {
        prevWeekNum = 52; // Assume 52 weeks in previous year
        prevYear -= 1;
      }
      
      const prevWeekKey = `${prevYear}-W${prevWeekNum.toString().padStart(2, '0')}`;
      
      return await this.getPlanForWeek(prevWeekKey);
    } catch (error) {
      console.error('Error fetching previous week plan:', error);
      return null;
    }
  },

  async getAllPlans(): Promise<WeeklyPlanningData[]> {
    const userId = await getUserId();
    if (!userId) return [];

    try {
      const { data, error } = await supabase
        .from('weekly_planning')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error || !data) {
        console.error('Error fetching all plans:', error);
        return [];
      }

      return data.map(plan => ({
        id: plan.id,
        weekKey: plan.week_key,
        dominoTitle: plan.domino_title,
        weekGoal: plan.week_goal,
        keyPoints: plan.key_points as PlanningResult['keyPoints'],
        reviewData: plan.review_data as WeeklyPlanningData['reviewData'],
      }));
    } catch (error) {
      console.error('Error in getAllPlans:', error);
      return [];
    }
  },

  async deletePlan(planId: string): Promise<boolean> {
    const userId = await getUserId();
    if (!userId) {
      console.error('No user ID found');
      return false;
    }

    try {
      const { error } = await supabase
        .from('weekly_planning')
        .delete()
        .eq('id', planId)
        .eq('user_id', userId); // Ensure user can only delete their own plans

      if (error) {
        console.error('Error deleting plan:', error);
        return false;
      }

      console.log('✅ Plan deleted successfully');
      return true;
    } catch (error) {
      console.error('Error in deletePlan:', error);
      return false;
    }
  }
};
