import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface ObjectivesByCategory {
  body: { annual: any[]; quarterly: any[]; monthly: any[] };
  being: { annual: any[]; quarterly: any[]; monthly: any[] };
  balance: { annual: any[]; quarterly: any[]; monthly: any[] };
  business: { annual: any[]; quarterly: any[]; monthly: any[] };
}

interface ObjectivesStatus {
  hasAnnual: boolean;
  hasQuarterly: boolean;
  hasMonthly: boolean;
  isLoading: boolean;
  annualObjectives: any[];
  quarterlyObjectives: any[];
  monthlyObjectives: any[];
  objectivesByCategory: ObjectivesByCategory;
  availableCategories: string[];
}

const emptyCategory = { annual: [], quarterly: [], monthly: [] };

export const useObjectivesCheck = () => {
  const [status, setStatus] = useState<ObjectivesStatus>({
    hasAnnual: false,
    hasQuarterly: false,
    hasMonthly: false,
    isLoading: true,
    annualObjectives: [],
    quarterlyObjectives: [],
    monthlyObjectives: [],
    objectivesByCategory: {
      body: { ...emptyCategory },
      being: { ...emptyCategory },
      balance: { ...emptyCategory },
      business: { ...emptyCategory },
    },
    availableCategories: [],
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

        // Group by category
        const objectivesByCategory: ObjectivesByCategory = {
          body: { annual: [], quarterly: [], monthly: [] },
          being: { annual: [], quarterly: [], monthly: [] },
          balance: { annual: [], quarterly: [], monthly: [] },
          business: { annual: [], quarterly: [], monthly: [] },
        };

        missions?.forEach(mission => {
          const category = mission.category?.toLowerCase() as keyof ObjectivesByCategory;
          if (category && objectivesByCategory[category]) {
            if (mission.mission_type === 'annual') {
              objectivesByCategory[category].annual.push(mission);
            } else if (mission.mission_type === 'quarterly') {
              objectivesByCategory[category].quarterly.push(mission);
            } else if (mission.mission_type === 'monthly') {
              objectivesByCategory[category].monthly.push(mission);
            }
          }
        });

        // Get available categories (those with at least one objective)
        const availableCategories = Object.keys(objectivesByCategory).filter(cat => {
          const catData = objectivesByCategory[cat as keyof ObjectivesByCategory];
          return catData.annual.length > 0 || catData.quarterly.length > 0 || catData.monthly.length > 0;
        });

        setStatus({
          hasAnnual: annual.length > 0,
          hasQuarterly: quarterly.length > 0,
          hasMonthly: monthly.length > 0,
          isLoading: false,
          annualObjectives: annual,
          quarterlyObjectives: quarterly,
          monthlyObjectives: monthly,
          objectivesByCategory,
          availableCategories,
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
