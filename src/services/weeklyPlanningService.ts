import { supabase } from '@/integrations/supabase/client';
import { PlanningResult } from '@/types/door';
import { toDoorWeekKey } from '@/utils/weekKey';
import { DomainCategory } from '@/components/door/DomainSelector';

export interface WeeklyPlanningData {
  id?: string;
  weekKey: string;
  dominoTitle: string;
  weekGoal: string;
  keyPoints: PlanningResult['keyPoints'];
  category?: DomainCategory;
  createdAt?: string;
  updatedAt?: string;
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
      console.error('No user ID found - user might not be authenticated');
      return false;
    }

    // Normalize week_key to door-week format
    const normalizedKey = planData.weekKey.startsWith('door-week-') 
      ? planData.weekKey 
      : toDoorWeekKey(planData.weekKey);

    const category = planData.category || 'business';

    try {
      console.log('📤 Saving weekly plan:', {
        weekKey: normalizedKey,
        category,
        dominoTitle: planData.dominoTitle,
        keyPointsCount: planData.keyPoints?.length || 0
      });

      const { data, error } = await supabase
        .from('weekly_planning')
        .upsert({
          user_id: userId,
          week_key: normalizedKey,
          category,
          domino_title: planData.dominoTitle || '',
          week_goal: planData.weekGoal || '',
          key_points: planData.keyPoints || [],
          review_data: planData.reviewData || {},
          updated_at: new Date().toISOString(),
        }, {
          onConflict: 'user_id,week_key,category'
        })
        .select();

      if (error) {
        console.error('Error saving weekly plan:', error.message, error.details, error.hint);
        return false;
      }

      console.log('✅ Weekly plan saved successfully:', data);
      return true;
    } catch (error: any) {
      console.error('Exception in savePlan:', error?.message || error);
      return false;
    }
  },

  async getPlanForWeek(weekKey: string, category?: DomainCategory): Promise<WeeklyPlanningData | null> {
    const userId = await getUserId();
    if (!userId) return null;

    // Normalize week_key to door-week format for lookup
    const normalizedKey = weekKey.startsWith('door-week-') 
      ? weekKey 
      : toDoorWeekKey(weekKey);

    try {
      let query = supabase
        .from('weekly_planning')
        .select('*')
        .eq('user_id', userId)
        .eq('week_key', normalizedKey);

      if (category) {
        query = query.eq('category', category);
      }

      const { data, error } = await query.maybeSingle();

      if (error || !data) {
        console.log('No plan found for week:', weekKey, category ? `category: ${category}` : '');
        return null;
      }

      return {
        id: data.id,
        weekKey: data.week_key,
        dominoTitle: data.domino_title,
        weekGoal: data.week_goal,
        keyPoints: data.key_points as PlanningResult['keyPoints'],
        category: data.category as DomainCategory,
        reviewData: data.review_data as WeeklyPlanningData['reviewData'],
      };
    } catch (error) {
      console.error('Error fetching plan:', error);
      return null;
    }
  },

  async getPlansForWeek(weekKey: string): Promise<WeeklyPlanningData[]> {
    const userId = await getUserId();
    if (!userId) return [];

    // Normalize week_key to door-week format for lookup
    const normalizedKey = weekKey.startsWith('door-week-') 
      ? weekKey 
      : toDoorWeekKey(weekKey);

    try {
      const { data, error } = await supabase
        .from('weekly_planning')
        .select('*')
        .eq('user_id', userId)
        .eq('week_key', normalizedKey)
        .order('created_at', { ascending: true });

      if (error || !data) {
        console.log('No plans found for week:', weekKey);
        return [];
      }

      return data.map(plan => ({
        id: plan.id,
        weekKey: plan.week_key,
        dominoTitle: plan.domino_title,
        weekGoal: plan.week_goal,
        keyPoints: plan.key_points as PlanningResult['keyPoints'],
        category: plan.category as DomainCategory,
        createdAt: plan.created_at,
        updatedAt: plan.updated_at,
        reviewData: plan.review_data as WeeklyPlanningData['reviewData'],
      }));
    } catch (error) {
      console.error('Error fetching plans:', error);
      return [];
    }
  },

  async getCompletedDomainsForWeek(weekKey: string): Promise<DomainCategory[]> {
    const plans = await this.getPlansForWeek(weekKey);
    return plans.map(p => p.category).filter((c): c is DomainCategory => !!c);
  },

  async getPreviousWeekPlan(currentWeekKey: string, category?: DomainCategory): Promise<WeeklyPlanningData | null> {
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
      
      return await this.getPlanForWeek(prevWeekKey, category);
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
        category: plan.category as DomainCategory,
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
