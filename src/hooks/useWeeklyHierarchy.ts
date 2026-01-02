import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { getMonth, getYear, getISOWeek } from 'date-fns';

interface Mission {
  id: string;
  title: string | null;
  period: string | null;
  category: string;
  mission_type: string;
  parent_mission_id: string | null;
}

interface WeeklyHierarchy {
  monthly: Mission | null;
  quarterly: Mission | null;
  annual: Mission | null;
}

export const useWeeklyHierarchy = (weekKey: string | null) => {
  const [hierarchy, setHierarchy] = useState<WeeklyHierarchy>({
    monthly: null,
    quarterly: null,
    annual: null,
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!weekKey) {
      setHierarchy({ monthly: null, quarterly: null, annual: null });
      return;
    }

    const fetchHierarchy = async () => {
      setLoading(true);
      try {
        const { data: session } = await supabase.auth.getSession();
        if (!session?.session?.user) {
          setLoading(false);
          return;
        }

        const userId = session.session.user.id;

        // Parse week key to get month/year (e.g., "2025-W01" -> January 2025)
        const [yearStr, weekStr] = weekKey.split('-W');
        const year = parseInt(yearStr, 10);
        const week = parseInt(weekStr, 10);
        
        // Approximate month from week number
        const monthNum = Math.ceil(week / 4.33);
        const monthKey = `${year}-${String(Math.min(monthNum, 12)).padStart(2, '0')}`;

        // Fetch monthly mission for this period
        const { data: monthlyData } = await supabase
          .from('missions')
          .select('*')
          .eq('user_id', userId)
          .eq('mission_type', 'monthly')
          .eq('period', monthKey)
          .limit(1);

        const monthly = (monthlyData?.[0] as Mission) || null;

        let quarterly: Mission | null = null;
        let annual: Mission | null = null;

        // If we have a monthly mission with a parent, fetch the quarterly
        if (monthly?.parent_mission_id) {
          const { data: quarterlyData } = await supabase
            .from('missions')
            .select('*')
            .eq('id', monthly.parent_mission_id)
            .single();

          quarterly = (quarterlyData as Mission) || null;

          // If quarterly has a parent, fetch the annual
          if (quarterly?.parent_mission_id) {
            const { data: annualData } = await supabase
              .from('missions')
              .select('*')
              .eq('id', quarterly.parent_mission_id)
              .single();

            annual = (annualData as Mission) || null;
          }
        }

        setHierarchy({ monthly, quarterly, annual });
      } catch (error) {
        console.error('Error fetching weekly hierarchy:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchHierarchy();
  }, [weekKey]);

  return { hierarchy, loading };
};
