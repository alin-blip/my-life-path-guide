import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from './use-toast';

export interface Meal {
  type: string; // breakfast, snack1, lunch, snack2, dinner
  name: string;
  calories: number;
  protein: number;
  carbs: number;
  fats: number;
}

export interface MealPlanDay {
  id: string;
  meal_plan_id: string;
  day_of_week: number;
  meals: Meal[];
  created_at: string;
  updated_at: string;
}

export interface MealPlan {
  id: string;
  coach_id: string;
  tribe_id: string | null;
  name: string;
  description: string | null;
  calorie_target: number | null;
  protein_target: number | null;
  carbs_target: number | null;
  fats_target: number | null;
  created_at: string;
  updated_at: string;
  days?: MealPlanDay[];
}

export function useCoachMealPlans(coachId: string | undefined) {
  const { toast } = useToast();
  const [plans, setPlans] = useState<MealPlan[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchPlans = useCallback(async () => {
    if (!coachId) return;
    setLoading(true);
    const { data, error } = await supabase
      .from('meal_plans')
      .select('*')
      .eq('coach_id', coachId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching meal plans:', error);
    } else {
      setPlans((data as any[]) || []);
    }
    setLoading(false);
  }, [coachId]);

  useEffect(() => {
    fetchPlans();
  }, [fetchPlans]);

  const fetchPlanDetails = useCallback(async (planId: string): Promise<MealPlan | null> => {
    const { data: plan, error } = await supabase
      .from('meal_plans')
      .select('*')
      .eq('id', planId)
      .single();
    if (error || !plan) return null;

    const { data: days } = await supabase
      .from('meal_plan_days')
      .select('*')
      .eq('meal_plan_id', planId)
      .order('day_of_week');

    return {
      ...plan,
      days: (days || []).map((d: any) => ({
        ...d,
        meals: Array.isArray(d.meals) ? d.meals : [],
      })),
    } as any;
  }, []);

  const createPlan = useCallback(async (data: {
    name: string;
    description?: string;
    tribe_id?: string | null;
    calorie_target?: number;
    protein_target?: number;
    carbs_target?: number;
    fats_target?: number;
  }) => {
    if (!coachId) return null;

    const { data: plan, error } = await supabase
      .from('meal_plans')
      .insert({
        coach_id: coachId,
        name: data.name,
        description: data.description || null,
        tribe_id: data.tribe_id || null,
        calorie_target: data.calorie_target || null,
        protein_target: data.protein_target || null,
        carbs_target: data.carbs_target || null,
        fats_target: data.fats_target || null,
      } as any)
      .select()
      .single();

    if (error) {
      console.error('Error creating meal plan:', error);
      toast({ title: 'Error', description: 'Could not create meal plan.', variant: 'destructive' });
      return null;
    }

    // Create 7 days
    const daysToCreate = Array.from({ length: 7 }, (_, i) => ({
      meal_plan_id: (plan as any).id,
      day_of_week: i,
      meals: [],
    }));
    await supabase.from('meal_plan_days').insert(daysToCreate);

    toast({ title: 'Success', description: 'Meal plan created!' });
    await fetchPlans();
    return plan as any;
  }, [coachId, toast, fetchPlans]);

  const deletePlan = useCallback(async (id: string) => {
    const { error } = await supabase
      .from('meal_plans')
      .delete()
      .eq('id', id);

    if (error) {
      toast({ title: 'Error', description: 'Could not delete meal plan.', variant: 'destructive' });
      return;
    }
    toast({ title: 'Deleted', description: 'Meal plan removed.' });
    await fetchPlans();
  }, [toast, fetchPlans]);

  const updatePlan = useCallback(async (id: string, updates: Partial<MealPlan>) => {
    const { error } = await supabase
      .from('meal_plans')
      .update(updates as any)
      .eq('id', id);

    if (error) {
      toast({ title: 'Error', description: 'Could not update meal plan.', variant: 'destructive' });
    }
  }, [toast]);

  const updateDayMeals = useCallback(async (dayId: string, meals: Meal[]) => {
    const { error } = await supabase
      .from('meal_plan_days')
      .update({ meals: meals as any } as any)
      .eq('id', dayId);

    if (error) {
      toast({ title: 'Error', description: 'Could not update meals.', variant: 'destructive' });
    }
  }, [toast]);

  const applyPlanToTribe = useCallback(async (planId: string, tribeId: string) => {
    const plan = await fetchPlanDetails(planId);
    if (!plan) {
      toast({ title: 'Error', description: 'Could not load meal plan.', variant: 'destructive' });
      return;
    }

    // Get tribe members
    const { data: members, error: membersError } = await supabase
      .from('tribe_members')
      .select('user_id')
      .eq('tribe_id', tribeId);

    if (membersError || !members?.length) {
      toast({ title: 'Error', description: 'No members found.', variant: 'destructive' });
      return;
    }

    // Update each member's nutrition settings in champion_routine_settings
    let successCount = 0;
    for (const member of members) {
      const updatePayload: any = {
        nutrition_configured: true,
        calorie_target: plan.calorie_target,
        protein_target: plan.protein_target,
        carbs_target: plan.carbs_target,
        fats_target: plan.fats_target,
      };

      const { error } = await supabase
        .from('champion_routine_settings')
        .update(updatePayload)
        .eq('user_id', member.user_id);

      if (!error) successCount++;
    }

    toast({
      title: 'Applied!',
      description: `Nutrition targets sent to ${successCount}/${members.length} members.`,
    });
  }, [fetchPlanDetails, toast]);

  return {
    plans,
    loading,
    createPlan,
    deletePlan,
    updatePlan,
    fetchPlanDetails,
    updateDayMeals,
    applyPlanToTribe,
    refreshPlans: fetchPlans,
  };
}
