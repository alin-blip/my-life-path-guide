
import { supabase } from '@/integrations/supabase/client';
import { FactMapGoal, FactMapItem, formatFromSupabase, formatForSupabase } from '@/types/factMaps';

export const getFactMaps = async () => {
  try {
    const { data, error } = await supabase
      .from('fact_maps')
      .select('*');
    
    if (error) throw error;
    
    return data.map(item => formatFromSupabase(item));
  } catch (error) {
    console.error('Error fetching fact maps:', error);
    return [];
  }
};

export const getFactMapById = async (mapId: string) => {
  try {
    const { data, error } = await supabase
      .from('fact_maps')
      .select('*')
      .eq('id', mapId)
      .single();
    
    if (error) throw error;
    
    return formatFromSupabase(data);
  } catch (error) {
    console.error(`Error fetching fact map with ID ${mapId}:`, error);
    return null;
  }
};

export const saveFactMaps = async (maps: FactMapItem[]) => {
  try {
    const formattedMaps = maps.map(map => formatForSupabase(map));
    
    for (const map of formattedMaps) {
      const { error } = await supabase
        .from('fact_maps')
        .upsert(map, { onConflict: 'id' });
      
      if (error) throw error;
    }
    
    return true;
  } catch (error) {
    console.error('Error saving fact maps:', error);
    return false;
  }
};

export const deleteFactMap = async (mapId: string) => {
  try {
    const { error } = await supabase
      .from('fact_maps')
      .delete()
      .eq('id', mapId);
    
    if (error) throw error;
    
    return true;
  } catch (error) {
    console.error(`Error deleting fact map with ID ${mapId}:`, error);
    return false;
  }
};

export const saveFactMapGoalAnswers = async (mapId: string, goalId: string, answers: Record<string, string>) => {
  try {
    // First, get the current map
    const map = await getFactMapById(mapId);
    
    if (!map) {
      throw new Error(`Map with ID ${mapId} not found`);
    }
    
    // Find the goal and update its answers
    const updatedItems = map.items.map(item => {
      if (item.id === goalId) {
        return {
          ...item,
          answers,
          updatedAt: new Date().toISOString()
        };
      }
      return item;
    });
    
    // Save the updated map
    const updatedMap: FactMapItem = {
      ...map,
      items: updatedItems,
      updatedAt: new Date().toISOString()
    };
    
    const success = await saveFactMaps([updatedMap]);
    
    if (!success) {
      throw new Error('Failed to save answers');
    }
    
    // Also save to localStorage as a fallback
    localStorage.setItem(`factMap-${mapId}-${goalId}-answers`, JSON.stringify(answers));
    
    return true;
  } catch (error) {
    console.error('Error saving answers:', error);
    // Still save to localStorage even if the API call fails
    localStorage.setItem(`factMap-${mapId}-${goalId}-answers`, JSON.stringify(answers));
    return false;
  }
};
