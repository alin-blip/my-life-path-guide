import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface Mission {
  id: string;
  category: string;
  mission_type: string;
  period: string;
  title: string;
  parent_mission_id: string | null;
  goal_data: any;
}

interface HierarchyChain {
  annual?: { id: string; title: string; period: string };
  quarterly?: { id: string; title: string; period: string };
  monthly?: { id: string; title: string; period: string };
}

export const useHierarchyData = (missionId: string | null) => {
  const [chain, setChain] = useState<HierarchyChain>({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!missionId) {
      setChain({});
      return;
    }

    const fetchHierarchy = async () => {
      setLoading(true);
      try {
        // Fetch the mission and its parent chain
        const { data: mission, error } = await supabase
          .from('missions')
          .select('*')
          .eq('id', missionId)
          .single();

        if (error || !mission) {
          setChain({});
          return;
        }

        const result: HierarchyChain = {};

        // If this is a monthly mission, fetch its parent quarterly
        if (mission.mission_type === 'monthly' && mission.parent_mission_id) {
          const { data: quarterly } = await supabase
            .from('missions')
            .select('*')
            .eq('id', mission.parent_mission_id)
            .single();

          if (quarterly) {
            result.quarterly = { id: quarterly.id, title: quarterly.title || '', period: quarterly.period || '' };

            // If quarterly has a parent annual
            if (quarterly.parent_mission_id) {
              const { data: annual } = await supabase
                .from('missions')
                .select('*')
                .eq('id', quarterly.parent_mission_id)
                .single();

              if (annual) {
                result.annual = { id: annual.id, title: annual.title || '', period: annual.period || '' };
              }
            }
          }
        }

        // If this is a quarterly mission, fetch its parent annual
        if (mission.mission_type === 'quarterly' && mission.parent_mission_id) {
          const { data: annual } = await supabase
            .from('missions')
            .select('*')
            .eq('id', mission.parent_mission_id)
            .single();

          if (annual) {
            result.annual = { id: annual.id, title: annual.title || '', period: annual.period || '' };
          }
        }

        setChain(result);
      } catch (error) {
        console.error('Error fetching hierarchy:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchHierarchy();
  }, [missionId]);

  return { chain, loading };
};

export const useChildMissions = (parentId: string | null, missionType?: string) => {
  const [children, setChildren] = useState<Mission[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!parentId) {
      setChildren([]);
      return;
    }

    const fetchChildren = async () => {
      setLoading(true);
      try {
        let query = supabase
          .from('missions')
          .select('*')
          .eq('parent_mission_id', parentId);

        if (missionType) {
          query = query.eq('mission_type', missionType);
        }

        const { data, error } = await query;

        if (error) throw error;
        setChildren((data as Mission[]) || []);
      } catch (error) {
        console.error('Error fetching child missions:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchChildren();
  }, [parentId, missionType]);

  return { children, loading };
};

export const useAnnualWithChildren = (year: number, category?: string) => {
  const [data, setData] = useState<{
    annual: Mission | null;
    quarterly: Mission[];
    monthly: Mission[];
  }>({ annual: null, quarterly: [], monthly: [] });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const { data: session } = await supabase.auth.getSession();
        if (!session?.session?.user) {
          setLoading(false);
          return;
        }

        const userId = session.session.user.id;
        const yearKey = String(year);

        // Fetch annual mission
        let annualQuery = supabase
          .from('missions')
          .select('*')
          .eq('user_id', userId)
          .eq('mission_type', 'annual')
          .eq('period', yearKey);

        if (category) {
          annualQuery = annualQuery.eq('category', category);
        }

        const { data: annualData } = await annualQuery;
        const annual = annualData?.[0] as Mission | undefined;

        if (!annual) {
          setData({ annual: null, quarterly: [], monthly: [] });
          setLoading(false);
          return;
        }

        // Fetch quarterly missions linked to this annual
        const { data: quarterlyData } = await supabase
          .from('missions')
          .select('*')
          .eq('parent_mission_id', annual.id)
          .eq('mission_type', 'quarterly');

        const quarterly = (quarterlyData as Mission[]) || [];

        // Fetch monthly missions linked to quarterly
        const quarterlyIds = quarterly.map(q => q.id);
        let monthly: Mission[] = [];

        if (quarterlyIds.length > 0) {
          const { data: monthlyData } = await supabase
            .from('missions')
            .select('*')
            .in('parent_mission_id', quarterlyIds)
            .eq('mission_type', 'monthly');

          monthly = (monthlyData as Mission[]) || [];
        }

        setData({ annual, quarterly, monthly });
      } catch (error) {
        console.error('Error fetching annual with children:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [year, category]);

  return { data, loading };
};
