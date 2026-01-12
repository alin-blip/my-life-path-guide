import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { format } from 'date-fns';
import { toast } from 'sonner';
import { getWeekKey } from '@/utils/weekUtils';

interface KeyPoint {
  title: string;
  completed: boolean;
  isContinuation?: boolean;
}

export interface UseBigOneReturn {
  bigOne: string | null;
  setBigOne: (value: string) => Promise<void>;
  isLoading: boolean;
  isSaving: boolean;
  isFromWeeklyKeys: boolean;
  suggestedBigOne: string | null;
}

export const useBigOne = (): UseBigOneReturn => {
  const [bigOne, setBigOneState] = useState<string | null>(null);
  const [suggestedBigOne, setSuggestedBigOne] = useState<string | null>(null);
  const [isFromWeeklyKeys, setIsFromWeeklyKeys] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  const today = format(new Date(), 'yyyy-MM-dd');
  const weekKey = getWeekKey();

  // Fetch Big One - Priority: 1) weekly_planning.key_points (first incomplete), 2) champion_routine_logs
  const fetchBigOne = useCallback(async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setIsLoading(false);
        return;
      }

      // 1. First check weekly_planning for key_points (Door Weekly Keys)
      const { data: weeklyPlan } = await supabase
        .from('weekly_planning')
        .select('key_points')
        .eq('user_id', user.id)
        .eq('week_key', weekKey)
        .maybeSingle();

      if (weeklyPlan?.key_points && Array.isArray(weeklyPlan.key_points)) {
        const keyPoints = weeklyPlan.key_points as unknown as KeyPoint[];
        const firstIncomplete = keyPoints.find(kp => !kp.completed);
        
        if (firstIncomplete) {
          setSuggestedBigOne(firstIncomplete.title);
        }
      }

      // 2. Then check champion_routine_logs for today's set Big One
      const { data: logData, error } = await supabase
        .from('champion_routine_logs')
        .select('big_one_today')
        .eq('user_id', user.id)
        .eq('date', today)
        .maybeSingle();

      if (error) throw error;

      if (logData?.big_one_today) {
        setBigOneState(logData.big_one_today);
        setIsFromWeeklyKeys(false);
      } else if (suggestedBigOne) {
        // If no explicit Big One set, use the suggested one from weekly keys
        setBigOneState(suggestedBigOne);
        setIsFromWeeklyKeys(true);
      }
    } catch (error) {
      console.error('Error fetching Big One:', error);
    } finally {
      setIsLoading(false);
    }
  }, [today, weekKey, suggestedBigOne]);

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
    isFromWeeklyKeys,
    suggestedBigOne,
  };
};
