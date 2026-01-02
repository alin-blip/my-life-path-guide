import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { format } from 'date-fns';
import { toast } from 'sonner';

interface DailyFlowSession {
  id: string;
  user_id: string;
  date: string;
  started_at: string;
  completed_at: string | null;
  current_step: string;
  steps_completed: Record<string, boolean>;
}

const TOTAL_STEPS = 6;

export const useDailyFlow = () => {
  const [session, setSession] = useState<DailyFlowSession | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const today = format(new Date(), 'yyyy-MM-dd');

  const fetchSession = useCallback(async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setIsLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from('daily_flow_sessions')
        .select('*')
        .eq('user_id', user.id)
        .eq('date', today)
        .maybeSingle();

      if (error) throw error;
      
      if (data) {
        setSession({
          ...data,
          steps_completed: (data.steps_completed as Record<string, boolean>) || {}
        });
      }
    } catch (error) {
      console.error('Error fetching daily flow session:', error);
    } finally {
      setIsLoading(false);
    }
  }, [today]);

  useEffect(() => {
    fetchSession();
  }, [fetchSession]);

  const startDay = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast.error('Trebuie să fii autentificat');
        return;
      }

      const { data, error } = await supabase
        .from('daily_flow_sessions')
        .upsert({
          user_id: user.id,
          date: today,
          current_step: 'morning',
          steps_completed: {},
          started_at: new Date().toISOString()
        }, {
          onConflict: 'user_id,date'
        })
        .select()
        .single();

      if (error) throw error;

      setSession({
        ...data,
        steps_completed: (data.steps_completed as Record<string, boolean>) || {}
      });
      toast.success('Să începem ziua! 💪');
    } catch (error) {
      console.error('Error starting day:', error);
      toast.error('Nu am putut porni sesiunea');
    }
  };

  const completeStep = async (stepId: string) => {
    if (!session) return;

    try {
      const newStepsCompleted = {
        ...session.steps_completed,
        [stepId]: true
      };

      const completedCount = Object.values(newStepsCompleted).filter(Boolean).length;
      const isFullyCompleted = completedCount === TOTAL_STEPS;

      const { error } = await supabase
        .from('daily_flow_sessions')
        .update({
          steps_completed: newStepsCompleted,
          current_step: stepId,
          completed_at: isFullyCompleted ? new Date().toISOString() : null,
          updated_at: new Date().toISOString()
        })
        .eq('id', session.id);

      if (error) throw error;

      setSession(prev => prev ? {
        ...prev,
        steps_completed: newStepsCompleted,
        completed_at: isFullyCompleted ? new Date().toISOString() : null
      } : null);

      toast.success('Pas completat! ✅');
    } catch (error) {
      console.error('Error completing step:', error);
      toast.error('Nu am putut salva progresul');
    }
  };

  const isStepCompleted = (stepId: string): boolean => {
    return session?.steps_completed?.[stepId] === true;
  };

  const completedCount = session 
    ? Object.values(session.steps_completed).filter(Boolean).length 
    : 0;

  return {
    session,
    isLoading,
    startDay,
    completeStep,
    isStepCompleted,
    completedCount,
    totalSteps: TOTAL_STEPS
  };
};
