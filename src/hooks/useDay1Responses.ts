import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface Day1Responses {
  id?: string;
  user_id?: string;
  question_1?: string;
  question_2?: string;
  question_3?: string;
  question_4?: string;
  question_5?: string;
  vision_declaration?: string;
  vision_body?: string;
  vision_spirit?: string;
  vision_relationships?: string;
  vision_business?: string;
  target_date?: string;
  what_i_will_give?: string;
  commitment_confirmed?: boolean;
}

export const useDay1Responses = () => {
  const [responses, setResponses] = useState<Day1Responses>({});
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const { toast } = useToast();

  const fetchResponses = useCallback(async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setIsLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from('challenge_day1_responses')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      if (error && error.code !== 'PGRST116') {
        console.error('Error fetching day 1 responses:', error);
      }

      if (data) {
        setResponses(data);
      }
    } catch (error) {
      console.error('Error in fetchResponses:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchResponses();
  }, [fetchResponses]);

  const saveResponses = useCallback(async (newResponses: Partial<Day1Responses>) => {
    setIsSaving(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast({
          title: 'Authentication required',
          description: 'Please log in to save your progress',
          variant: 'destructive'
        });
        return false;
      }

      const dataToSave = {
        ...responses,
        ...newResponses,
        user_id: user.id
      };

      // Remove id for upsert
      const { id, ...saveData } = dataToSave;

      const { data, error } = await supabase
        .from('challenge_day1_responses')
        .upsert(saveData, { 
          onConflict: 'user_id',
          ignoreDuplicates: false 
        })
        .select()
        .single();

      if (error) {
        console.error('Error saving day 1 responses:', error);
        toast({
          title: 'Error saving',
          description: error.message,
          variant: 'destructive'
        });
        return false;
      }

      setResponses(data);
      return true;
    } catch (error) {
      console.error('Error in saveResponses:', error);
      return false;
    } finally {
      setIsSaving(false);
    }
  }, [responses, toast]);

  const updateResponses = useCallback((newData: Partial<Day1Responses>) => {
    setResponses(prev => ({ ...prev, ...newData }));
  }, []);

  return {
    responses,
    isLoading,
    isSaving,
    saveResponses,
    updateResponses,
    refetch: fetchResponses
  };
};
