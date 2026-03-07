import { supabase } from '@/integrations/supabase/client';
import { MonthlyMission, MissionCategory } from '@/types/mission';

// Types for database records
interface MissionRecord {
  id: string;
  user_id: string;
  category: string;
  mission_type: string;
  title: string | null;
  goal_data: any;
  measurable_result: string | null;
  end_goal_value: string | null;
  period: string | null;
  is_impossible_game: boolean | null;
  completed: boolean | null;
  created_at: string | null;
  updated_at: string | null;
}

// Get current user ID
async function getCurrentUserId(): Promise<string | null> {
  const { data: { user } } = await supabase.auth.getUser();
  return user?.id || null;
}

// === Annual Goal Answers ===

export async function getAnnualGoalAnswers(category: MissionCategory, language: string): Promise<Record<number, string>> {
  const userId = await getCurrentUserId();
  const localKey = `annualGoalAnswers__${category}__${language}`;
  
  // Always try localStorage first for instant loading
  const localData = loadFromLocalStorage(localKey);
  
  if (!userId) {
    return localData;
  }
  
  try {
    const { data, error } = await supabase
      .from('missions')
      .select('goal_data')
      .eq('user_id', userId)
      .eq('category', category)
      .eq('mission_type', 'annual_answers')
      .eq('is_impossible_game', true)
      .maybeSingle();
    
    if (error) {
      console.error('Error fetching annual goal answers:', error);
      return localData;
    }
    
    if (data?.goal_data) {
      const goalData = data.goal_data as Record<string, any>;
      if (goalData?.answers) {
        // Merge with localStorage (cloud takes priority)
        const cloudAnswers = goalData.answers as Record<number, string>;
        return { ...localData, ...cloudAnswers };
      }
    }
    
    return localData;
  } catch (error) {
    console.error('Error in getAnnualGoalAnswers:', error);
    return localData;
  }
}

export async function saveAnnualGoalAnswers(
  category: MissionCategory, 
  language: string, 
  answers: Record<number, string>
): Promise<boolean> {
  const localKey = `annualGoalAnswers__${category}__${language}`;
  
  // Always save to localStorage as backup
  saveToLocalStorage(localKey, answers);
  
  const userId = await getCurrentUserId();
  if (!userId) {
    return true; // Saved to localStorage only
  }
  
  try {
    const { error } = await supabase
      .from('missions')
      .upsert({
        user_id: userId,
        category: category,
        mission_type: 'annual_answers',
        is_impossible_game: true,
        goal_data: { answers, language },
        updated_at: new Date().toISOString(),
      }, {
        onConflict: 'user_id,category,mission_type',
        ignoreDuplicates: false,
      });
    
    if (error) {
      // If conflict strategy fails, try update
      const { error: updateError } = await supabase
        .from('missions')
        .update({
          goal_data: { answers, language },
          updated_at: new Date().toISOString(),
        })
        .eq('user_id', userId)
        .eq('category', category)
        .eq('mission_type', 'annual_answers');
      
      if (updateError) {
        console.error('Error updating annual goal answers:', updateError);
        return false;
      }
    }
    
    return true;
  } catch (error) {
    console.error('Error in saveAnnualGoalAnswers:', error);
    return false;
  }
}

// === Monthly Mission Answers ===

export async function getMonthlyMissionAnswers(category: MissionCategory, language: string): Promise<Record<number, string>> {
  const userId = await getCurrentUserId();
  const localKey = `monthlyMissionAnswers__${category}__${language}`;
  
  const localData = loadFromLocalStorage(localKey);
  
  if (!userId) {
    return localData;
  }
  
  try {
    const { data, error } = await supabase
      .from('missions')
      .select('goal_data')
      .eq('user_id', userId)
      .eq('category', category)
      .eq('mission_type', 'monthly_answers')
      .eq('is_impossible_game', false)
      .maybeSingle();
    
    if (error) {
      console.error('Error fetching monthly mission answers:', error);
      return localData;
    }
    
    if (data?.goal_data) {
      const goalData = data.goal_data as Record<string, any>;
      if (goalData?.answers) {
        const cloudAnswers = goalData.answers as Record<number, string>;
        return { ...localData, ...cloudAnswers };
      }
    }
    
    return localData;
  } catch (error) {
    console.error('Error in getMonthlyMissionAnswers:', error);
    return localData;
  }
}

export async function saveMonthlyMissionAnswers(
  category: MissionCategory, 
  language: string, 
  answers: Record<number, string>
): Promise<boolean> {
  const localKey = `monthlyMissionAnswers__${category}__${language}`;
  
  // Always save to localStorage as backup
  saveToLocalStorage(localKey, answers);
  
  const userId = await getCurrentUserId();
  if (!userId) {
    return true;
  }
  
  try {
    const { error } = await supabase
      .from('missions')
      .upsert({
        user_id: userId,
        category: category,
        mission_type: 'monthly_answers',
        is_impossible_game: false,
        goal_data: { answers, language },
        updated_at: new Date().toISOString(),
      }, {
        onConflict: 'user_id,category,mission_type',
        ignoreDuplicates: false,
      });
    
    if (error) {
      const { error: updateError } = await supabase
        .from('missions')
        .update({
          goal_data: { answers, language },
          updated_at: new Date().toISOString(),
        })
        .eq('user_id', userId)
        .eq('category', category)
        .eq('mission_type', 'monthly_answers');
      
      if (updateError) {
        console.error('Error updating monthly mission answers:', updateError);
        return false;
      }
    }
    
    return true;
  } catch (error) {
    console.error('Error in saveMonthlyMissionAnswers:', error);
    return false;
  }
}

// === Monthly Missions (Full Objects) ===

export async function getMonthlyMissions(): Promise<MonthlyMission[]> {
  const userId = await getCurrentUserId();
  const localKey = 'monthlyMissions';
  
  // Load from localStorage first
  const localMissions = loadFromLocalStorage(localKey) as MonthlyMission[] || [];
  
  if (!userId) {
    return localMissions;
  }
  
  try {
    const { data, error } = await supabase
      .from('missions')
      .select('*')
      .eq('user_id', userId)
      .in('mission_type', ['monthly', 'annual']);
    
    if (error) {
      console.error('Error fetching monthly missions:', error);
      return localMissions;
    }
    
    if (data && data.length > 0) {
      // Convert database records to MonthlyMission format
      const cloudMissions: MonthlyMission[] = data.map(record => {
        const goalData = (record.goal_data || {}) as Record<string, any>;
        return {
          id: record.id,
          category: record.category as MissionCategory,
          name: record.title || '',
          startDate: goalData?.startDate || '',
          endDate: goalData?.endDate || '',
          isImpossibleGame: record.is_impossible_game || false,
          questions: goalData?.questions || {
            impossibleFruits: [],
            stopDoing: '',
            sustainDoing: '',
            startDoing: '',
            obstacles: '',
            opportunities: '',
            talents: '',
            currentMindsets: '',
            requiredMindsets: '',
            currentSkills: '',
            requiredSkills: '',
            currentResources: '',
            requiredResources: '',
            finalThoughts: '',
            primaryLessons: '',
          },
          parts: goalData?.parts || [],
          result: {
            measurableResult: record.measurable_result || '',
            endGoalValue: record.end_goal_value || '',
            immediateActions: goalData?.immediateActions || '',
          },
          createdAt: record.created_at || new Date().toISOString(),
        };
      });
      
      return cloudMissions;
    }
    
    return localMissions;
  } catch (error) {
    console.error('Error in getMonthlyMissions:', error);
    return localMissions;
  }
}

export async function saveMonthlyMission(mission: MonthlyMission): Promise<boolean> {
  const localKey = 'monthlyMissions';
  
  // Update localStorage
  const existing = loadFromLocalStorage(localKey) as MonthlyMission[] || [];
  const idx = existing.findIndex(m => m.id === mission.id);
  if (idx >= 0) {
    existing[idx] = mission;
  } else {
    existing.push(mission);
  }
  saveToLocalStorage(localKey, existing);
  
  const userId = await getCurrentUserId();
  if (!userId) {
    return true;
  }
  
  try {
    // First try to check if record exists
    const { data: existing } = await supabase
      .from('missions')
      .select('id')
      .eq('id', mission.id)
      .maybeSingle();
    
    const goalDataJson = JSON.parse(JSON.stringify({
      startDate: mission.startDate,
      endDate: mission.endDate,
      questions: mission.questions,
      parts: mission.parts,
      immediateActions: mission.result?.immediateActions,
    }));
    
    if (existing) {
      // Update existing record
      const { error } = await supabase
        .from('missions')
        .update({
          category: mission.category,
          mission_type: mission.isImpossibleGame ? 'annual' : 'monthly',
          title: mission.name,
          is_impossible_game: mission.isImpossibleGame || false,
          measurable_result: mission.result?.measurableResult || null,
          end_goal_value: mission.result?.endGoalValue || null,
          goal_data: goalDataJson,
          updated_at: new Date().toISOString(),
        })
        .eq('id', mission.id);
      
      if (error) {
        console.error('Error updating monthly mission:', error);
        return false;
      }
    } else {
      // Insert new record
      const { error } = await supabase
        .from('missions')
        .insert([{
          id: mission.id,
          user_id: userId,
          category: mission.category,
          mission_type: mission.isImpossibleGame ? 'annual' : 'monthly',
          title: mission.name,
          is_impossible_game: mission.isImpossibleGame || false,
          measurable_result: mission.result?.measurableResult || null,
          end_goal_value: mission.result?.endGoalValue || null,
          goal_data: goalDataJson,
          updated_at: new Date().toISOString(),
        }]);
      
      if (error) {
        console.error('Error inserting monthly mission:', error);
        return false;
      }
    }
    
    return true;
  } catch (error) {
    console.error('Error in saveMonthlyMission:', error);
    return false;
  }
}

// === Sync on Auth ===

export async function syncLocalMissionsToCloud(): Promise<void> {
  const userId = await getCurrentUserId();
  if (!userId) return;
  
  try {
    // Sync monthly missions
    const localMissions = loadFromLocalStorage('monthlyMissions') as MonthlyMission[] || [];
    
    for (const mission of localMissions) {
      await saveMonthlyMission(mission);
    }
    
    console.log('Synced local missions to cloud');
  } catch (error) {
    console.error('Error syncing missions to cloud:', error);
  }
}

// === LocalStorage Helpers ===

function loadFromLocalStorage(key: string): any {
  try {
    const stored = localStorage.getItem(key);
    return stored ? JSON.parse(stored) : {};
  } catch {
    // JSON parse failed – return safe fallback
    return {};
  }
}

function saveToLocalStorage(key: string, data: any): void {
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch (error) {
    console.warn('Failed to save to localStorage:', error);
  }
}
