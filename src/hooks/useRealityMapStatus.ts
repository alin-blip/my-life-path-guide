import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { WarriorPowerScores } from '@/data/warriorPowerQuestions';

interface UseRealityMapStatusReturn {
  hasRealityMap: boolean;
  isLoading: boolean;
  scores: WarriorPowerScores | null;
  refetch: () => Promise<void>;
}

export const useRealityMapStatus = (): UseRealityMapStatusReturn => {
  const [hasRealityMap, setHasRealityMap] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [scores, setScores] = useState<WarriorPowerScores | null>(null);

  const fetchRealityMapStatus = async () => {
    setIsLoading(true);
    
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session?.user) {
        setHasRealityMap(false);
        setScores(null);
        setIsLoading(false);
        return;
      }

      // Check fact_maps for reality-scores
      const { data: factMapData, error: factMapError } = await supabase
        .from('fact_maps')
        .select('items')
        .eq('user_id', session.user.id)
        .eq('category', 'reality-scores')
        .maybeSingle();

      if (factMapData?.items) {
        setHasRealityMap(true);
        setScores(factMapData.items as unknown as WarriorPowerScores);
        setIsLoading(false);
        return;
      }

      // Fallback: Check warrior_power_results table
      const { data: warriorResults } = await supabase
        .from('warrior_power_results')
        .select('scores')
        .eq('user_id', session.user.id)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (warriorResults?.scores) {
        setHasRealityMap(true);
        setScores(warriorResults.scores as unknown as WarriorPowerScores);
        setIsLoading(false);
        return;
      }

      // Last fallback: Check email_leads
      const { data: leadData } = await supabase
        .from('email_leads')
        .select('metadata')
        .eq('email', session.user.email || '')
        .eq('lead_magnet', 'warrior-power')
        .maybeSingle();

      if (leadData?.metadata && typeof leadData.metadata === 'object') {
        const metadata = leadData.metadata as Record<string, unknown>;
        if (metadata.scores) {
          setHasRealityMap(true);
          setScores(metadata.scores as WarriorPowerScores);
          setIsLoading(false);
          return;
        }
      }

      setHasRealityMap(false);
      setScores(null);
    } catch (error) {
      console.error('Error checking Reality Map status:', error);
      setHasRealityMap(false);
      setScores(null);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchRealityMapStatus();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(() => {
      fetchRealityMapStatus();
    });

    return () => subscription.unsubscribe();
  }, []);

  return {
    hasRealityMap,
    isLoading,
    scores,
    refetch: fetchRealityMapStatus
  };
};
