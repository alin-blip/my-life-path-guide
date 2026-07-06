
import { supabase } from '@/integrations/supabase/client';
import { FactMapGoal, FactMapItem, formatFromSupabase, formatForSupabase } from '@/types/factMaps';
import { MissionCategory } from '@/types/mission';
import { v4 as uuidv4 } from 'uuid';

async function getCurrentUserId(): Promise<string | null> {
  const { data: { user } } = await supabase.auth.getUser();
  return user?.id ?? null;
}

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
    const userId = await getCurrentUserId();
    if (!userId) throw new Error('User not authenticated');

    const formattedMaps = maps.map(map => ({
      ...formatForSupabase({ ...map, userId: map.userId || userId }),
      user_id: map.userId || userId,
    }));
    
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
    const map = await getFactMapById(mapId);
    
    if (!map) {
      throw new Error(`Map with ID ${mapId} not found`);
    }
    
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
    
    const updatedMap: FactMapItem = {
      ...map,
      items: updatedItems,
      updatedAt: new Date().toISOString()
    };
    
    const success = await saveFactMaps([updatedMap]);
    
    if (!success) {
      throw new Error('Failed to save answers');
    }
    
    return true;
  } catch (error) {
    console.error('Error saving answers:', error);
    return false;
  }
};

/** Create a monthly or impossible mission stored as a fact_map row. */
export const createMissionMap = async (
  type: 'monthly' | 'impossible',
  category: MissionCategory,
  name?: string,
): Promise<FactMapItem | null> => {
  const now = new Date().toISOString();
  const map: FactMapItem = {
    id: uuidv4(),
    title: name || `${type === 'monthly' ? 'MM' : 'IG'} ${category}`,
    category: type,
    createdAt: now,
    updatedAt: now,
    items: [{
      id: uuidv4(),
      name: category,
      description: '',
      status: 'pending',
      createdAt: now,
      updatedAt: now,
      answers: {},
    }],
  };
  const ok = await saveFactMaps([map]);
  return ok ? map : null;
};

/** Create a foundation fact map for a single 4B category pillar. */
export const createFoundationMap = async (
  category: string,
  title: string,
  answers: Record<string, string> = {},
): Promise<FactMapItem | null> => {
  const now = new Date().toISOString();
  const map: FactMapItem = {
    id: uuidv4(),
    title,
    category: 'foundation',
    createdAt: now,
    updatedAt: now,
    items: [{
      id: uuidv4(),
      name: category,
      description: '',
      status: 'pending',
      createdAt: now,
      updatedAt: now,
      answers,
    }],
  };
  const ok = await saveFactMaps([map]);
  return ok ? map : null;
};

export const updateFoundationAnswers = async (
  mapId: string,
  categoryName: string,
  answers: Record<string, string>,
): Promise<boolean> => {
  const map = await getFactMapById(mapId);
  if (!map) return false;
  const now = new Date().toISOString();
  const updatedItems = map.items.map(item =>
    item.name.toLowerCase() === categoryName.toLowerCase()
      ? { ...item, answers, updatedAt: now, status: 'in-progress' as const }
      : item
  );
  return saveFactMaps([{ ...map, items: updatedItems, updatedAt: now }]);
};

export const findFoundationMapForCategory = async (category: string): Promise<FactMapItem | null> => {
  const maps = await getFactMaps();
  return maps.find(
    m => m.category === 'foundation' &&
      m.items.some(i => i.name.toLowerCase() === category.toLowerCase())
  ) ?? null;
};

export const findOrCreateMonthlyMission = async (
  category: string,
  name: string,
  answers: Record<string, string>,
): Promise<boolean> => {
  const maps = await getFactMaps();
  const existing = maps.find(
    m => m.category === 'monthly' &&
      m.items.some(i => i.name.toLowerCase() === category.toLowerCase())
  );
  if (existing) {
    const now = new Date().toISOString();
    const updatedItems = existing.items.map(item =>
      item.name.toLowerCase() === category.toLowerCase()
        ? { ...item, answers, updatedAt: now }
        : item
    );
    return saveFactMaps([{ ...existing, items: updatedItems, updatedAt: now }]);
  }
  const map = await createMissionMap('monthly', category as MissionCategory, name);
  if (!map) return false;
  return updateFoundationAnswers(map.id, category, answers);
};
