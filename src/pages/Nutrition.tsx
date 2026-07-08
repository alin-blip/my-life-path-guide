import React, { useState, useEffect, useRef } from 'react';
import { Layout } from '@/components/Layout';
import { MealPlanningStep } from '@/components/champion-routine/steps/MealPlanningStep';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { format } from 'date-fns';
import { useToast } from '@/hooks/use-toast';
import type { Json } from '@/integrations/supabase/types';

interface Meal {
  id: string;
  name?: string;
  type?: 'breakfast' | 'lunch' | 'dinner' | 'snack';
  description?: string;
  calories: number;
  protein: number;
  carbs?: number;
  fats?: number;
  time?: string;
}

const Nutrition = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [meals, setMeals] = useState<Meal[]>([]);
  const [totalCalories, setTotalCalories] = useState(0);
  const [totalProtein, setTotalProtein] = useState(0);
  const userIdRef = useRef<string | null>(null);
  const hasLoadedRef = useRef(false);
  const saveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    loadTodayMeals();
  }, []);

  const loadTodayMeals = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    userIdRef.current = user.id;

    const today = format(new Date(), 'yyyy-MM-dd');
    const { data } = await supabase
      .from('champion_routine_logs')
      .select('meals_logged, total_calories, total_protein')
      .eq('user_id', user.id)
      .eq('date', today)
      .maybeSingle();

    if (data) {
      const loadedMeals = Array.isArray(data.meals_logged) ? (data.meals_logged as unknown as Meal[]) : [];
      setMeals(loadedMeals);
      setTotalCalories(data.total_calories || 0);
      setTotalProtein(data.total_protein || 0);
    }
    hasLoadedRef.current = true;
  };

  // Autosave (debounced 600ms) after initial load
  useEffect(() => {
    if (!hasLoadedRef.current || !userIdRef.current) return;
    if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
    saveTimerRef.current = setTimeout(() => {
      void persistMeals(meals, totalCalories, totalProtein);
    }, 600);
    return () => {
      if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
    };
  }, [meals, totalCalories, totalProtein]);

  const persistMeals = async (m: Meal[], cal: number, prot: number) => {
    const userId = userIdRef.current;
    if (!userId) return;
    const today = format(new Date(), 'yyyy-MM-dd');
    const { data: existing } = await supabase
      .from('champion_routine_logs')
      .select('id')
      .eq('user_id', userId)
      .eq('date', today)
      .maybeSingle();

    const payload = {
      meals_logged: JSON.parse(JSON.stringify(m)) as Json,
      total_calories: cal,
      total_protein: prot,
    };

    if (existing) {
      await supabase.from('champion_routine_logs').update(payload).eq('id', existing.id);
    } else {
      await supabase.from('champion_routine_logs').insert([{ user_id: userId, date: today, ...payload }]);
    }
  };

  const handleChange = (newMeals: Meal[], calories: number, protein: number) => {
    setMeals(newMeals);
    setTotalCalories(calories);
    setTotalProtein(protein);
  };


  const handleComplete = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      navigate('/dashboard');
      return;
    }

    const today = format(new Date(), 'yyyy-MM-dd');
    
    // Check if record exists
    const { data: existing } = await supabase
      .from('champion_routine_logs')
      .select('id')
      .eq('user_id', user.id)
      .eq('date', today)
      .maybeSingle();

    if (existing) {
      await supabase
        .from('champion_routine_logs')
        .update({
          meals_logged: JSON.parse(JSON.stringify(meals)) as Json,
          total_calories: totalCalories,
          total_protein: totalProtein,
        })
        .eq('user_id', user.id)
        .eq('date', today);
    } else {
      await supabase
        .from('champion_routine_logs')
        .insert([{
          user_id: user.id,
          date: today,
          meals_logged: JSON.parse(JSON.stringify(meals)) as Json,
          total_calories: totalCalories,
          total_protein: totalProtein,
        }]);
    }

    toast({
      title: "Nutriție salvată",
      description: "Mesele tale au fost salvate cu succes.",
    });
    
    navigate('/dashboard');
  };

  return (
    <Layout>
      <div className="container mx-auto px-4 py-6 max-w-4xl">
        <MealPlanningStep 
          meals={meals}
          totalCalories={totalCalories}
          totalProtein={totalProtein}
          onChange={handleChange}
          onNext={handleComplete}
        />
      </div>
    </Layout>
  );
};

export default Nutrition;
