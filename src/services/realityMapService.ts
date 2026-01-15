import { supabase } from '@/integrations/supabase/client';
import { WarriorPowerScores } from '@/data/warriorPowerQuestions';

export interface RealityMapData {
  id: string;
  user_id: string;
  scores: WarriorPowerScores;
  created_at: string;
  updated_at: string;
}

export const getRealityMapScores = async (): Promise<WarriorPowerScores | null> => {
  try {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.user) return null;

    // First try to get from fact_maps with reality-scores category
    const { data: factMapData, error: factMapError } = await supabase
      .from('fact_maps')
      .select('items')
      .eq('user_id', session.user.id)
      .eq('category', 'reality-scores')
      .maybeSingle();

    if (factMapData?.items) {
      return factMapData.items as unknown as WarriorPowerScores;
    }

    // Fallback: Check if there are warrior power scores from email_leads
    const { data: leadData, error: leadError } = await supabase
      .from('email_leads')
      .select('metadata')
      .eq('email', session.user.email || '')
      .eq('lead_magnet', 'warrior-power')
      .maybeSingle();

    if (leadData?.metadata && typeof leadData.metadata === 'object') {
      const metadata = leadData.metadata as Record<string, unknown>;
      if (metadata.scores) {
        return metadata.scores as WarriorPowerScores;
      }
    }

    return null;
  } catch (error) {
    console.error('Error fetching reality map scores:', error);
    return null;
  }
};

export const saveRealityMapScores = async (scores: WarriorPowerScores): Promise<boolean> => {
  try {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.user) return false;

    // Check if record exists
    const { data: existing } = await supabase
      .from('fact_maps')
      .select('id')
      .eq('user_id', session.user.id)
      .eq('category', 'reality-scores')
      .maybeSingle();

    if (existing) {
      // Update existing
      const { error } = await supabase
        .from('fact_maps')
        .update({
          title: 'Reality Map Scores',
          items: JSON.parse(JSON.stringify(scores)),
          updated_at: new Date().toISOString()
        })
        .eq('id', existing.id);

      if (error) {
        console.error('Error updating reality map scores:', error);
        return false;
      }
    } else {
      // Insert new
      const { error } = await supabase
        .from('fact_maps')
        .insert([{
          user_id: session.user.id,
          category: 'reality-scores',
          title: 'Reality Map Scores',
          items: JSON.parse(JSON.stringify(scores))
        }]);

      if (error) {
        console.error('Error inserting reality map scores:', error);
        return false;
      }
    }

    return true;
  } catch (error) {
    console.error('Error saving reality map scores:', error);
    return false;
  }
};

export const getDimensionStartIndex = (dimension: string): number => {
  const dimensionMap: Record<string, number> = {
    body: 0,
    being: 2,
    balance: 4,
    business: 6
  };
  return dimensionMap[dimension] || 0;
};
