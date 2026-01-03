import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface NutritionSettings {
  nutrition_configured: boolean;
  weight_kg: number | null;
  height_cm: number | null;
  age: number | null;
  activity_level: string;
  calorie_target: number;
  protein_target: number;
  carbs_target: number;
  fats_target: number;
  protein_percent: number;
  carbs_percent: number;
  fats_percent: number;
}

const DEFAULT_SETTINGS: NutritionSettings = {
  nutrition_configured: false,
  weight_kg: null,
  height_cm: null,
  age: null,
  activity_level: 'moderate',
  calorie_target: 2000,
  protein_target: 150,
  carbs_target: 250,
  fats_target: 65,
  protein_percent: 30,
  carbs_percent: 50,
  fats_percent: 20,
};

export function useNutritionSettings() {
  const [settings, setSettings] = useState<NutritionSettings>(DEFAULT_SETTINGS);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setIsLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from('champion_routine_settings')
        .select('nutrition_configured, weight_kg, height_cm, age, activity_level, calorie_target, protein_target, carbs_target, fats_target, protein_percent, carbs_percent, fats_percent')
        .eq('user_id', user.id)
        .maybeSingle();

      if (error) throw error;

      if (data) {
        setSettings({
          nutrition_configured: data.nutrition_configured ?? false,
          weight_kg: data.weight_kg,
          height_cm: data.height_cm,
          age: data.age,
          activity_level: data.activity_level ?? 'moderate',
          calorie_target: data.calorie_target ?? 2000,
          protein_target: data.protein_target ?? 150,
          carbs_target: data.carbs_target ?? 250,
          fats_target: data.fats_target ?? 65,
          protein_percent: data.protein_percent ?? 30,
          carbs_percent: data.carbs_percent ?? 50,
          fats_percent: data.fats_percent ?? 20,
        });
      }
    } catch (error) {
      console.error('Error fetching nutrition settings:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const saveSettings = async (newSettings: Partial<NutritionSettings>) => {
    setIsSaving(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const updateData = {
        ...newSettings,
        nutrition_configured: true,
        updated_at: new Date().toISOString(),
      };

      const { error } = await supabase
        .from('champion_routine_settings')
        .upsert({
          user_id: user.id,
          ...updateData,
        }, {
          onConflict: 'user_id',
        });

      if (error) throw error;

      setSettings(prev => ({
        ...prev,
        ...updateData,
      }));

      toast.success('Setări salvate cu succes!');
      return true;
    } catch (error) {
      console.error('Error saving nutrition settings:', error);
      toast.error('Eroare la salvarea setărilor');
      return false;
    } finally {
      setIsSaving(false);
    }
  };

  return {
    settings,
    isLoading,
    isSaving,
    saveSettings,
    refetch: fetchSettings,
  };
}
