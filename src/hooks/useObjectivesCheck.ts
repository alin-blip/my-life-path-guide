import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface ObjectivesStatus {
  hasAnnual: boolean;
  hasQuarterly: boolean;
  hasMonthly: boolean;
  isLoading: boolean;
  annualObjectives: any[];
  quarterlyObjectives: any[];
  monthlyObjectives: any[];
}

export const useObjectivesCheck = () => {
  const [status, setStatus] = useState<ObjectivesStatus>({
    hasAnnual: false,
    hasQuarterly: false,
    hasMonthly: false,
    isLoading: true,
    annualObjectives: [],
    quarterlyObjectives: [],
    monthlyObjectives: [],
  });

  useEffect(() => {
    const checkObjectives = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          setStatus(prev => ({ ...prev, isLoading: false }));
          return;
        }

        const { data: missions, error } = await supabase
          .from('missions')
          .select('*')
          .eq('user_id', user.id);

        if (error) throw error;

        const annual = missions?.filter(m => m.mission_type === 'annual') || [];
        const quarterly = missions?.filter(m => m.mission_type === 'quarterly') || [];
        const monthly = missions?.filter(m => m.mission_type === 'monthly') || [];

        setStatus({
          hasAnnual: annual.length > 0,
          hasQuarterly: quarterly.length > 0,
          hasMonthly: monthly.length > 0,
          isLoading: false,
          annualObjectives: annual,
          quarterlyObjectives: quarterly,
          monthlyObjectives: monthly,
        });
      } catch (error) {
        console.error('Error checking objectives:', error);
        setStatus(prev => ({ ...prev, isLoading: false }));
      }
    };

    checkObjectives();
  }, []);

  return status;
};
