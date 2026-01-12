import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { format } from 'date-fns';
import { toast } from 'sonner';
import { getWeekKey } from '@/utils/weekUtils';

export interface UseBigOneReturn {
  bigOne: string | null;
  setBigOne: (value: string) => Promise<void>;
  isLoading: boolean;
  isSaving: boolean;
}

export const useBigOne = (): UseBigOneReturn => {
  const [bigOne, setBigOneState] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  const today = format(new Date(), 'yyyy-MM-dd');
  const weekKey = getWeekKey();

  // Fetch Big One from champion_routine_logs
  const fetchBigOne = useCallback(async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setIsLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from('champion_routine_logs')
        .select('big_one_today')
        .eq('user_id', user.id)
        .eq('date', today)
        .maybeSingle();

      if (error) throw error;

      if (data?.big_one_today) {
        setBigOneState(data.big_one_today);
      }
    } catch (error) {
      console.error('Error fetching Big One:', error);
    } finally {
      setIsLoading(false);
    }
  }, [today]);

  useEffect(() => {
    fetchBigOne();
  }, [fetchBigOne]);

  // Save Big One to both champion_routine_logs and optionally sync to weekly planning
  const setBigOne = useCallback(async (value: string) => {
    setIsSaving(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast.error('Trebuie să fii autentificat');
        return;
      }

      // Update local state immediately
      setBigOneState(value);

      // Save to champion_routine_logs
      const { error: logError } = await supabase
        .from('champion_routine_logs')
        .upsert({
          user_id: user.id,
          date: today,
          big_one_today: value,
        }, {
          onConflict: 'user_id,date'
        });

      if (logError) throw logError;

      // Note: weekly_planning doesn't have big_one_today field
      // Big One is stored only in champion_routine_logs

    } catch (error) {
      console.error('Error saving Big One:', error);
      toast.error('Nu am putut salva prioritatea');
    } finally {
      setIsSaving(false);
    }
  }, [today]);

  return {
    bigOne,
    setBigOne,
    isLoading,
    isSaving,
  };
};
