import { supabase } from '@/integrations/supabase/client';
import { MissionCategory } from '@/types/mission';

export interface WeeklyObjective {
  id: string;
  user_id: string;
  category: MissionCategory;
  title: string;
  description: string;
  week_key: string;
  status: 'pending' | 'completed';
  due_date: string;
  created_at: string;
  updated_at: string;
}

export const objectivesService = {
  async saveWeeklyObjectives(
    category: MissionCategory,
    answers: Record<number, string>,
    weekKey: string
  ): Promise<void> {
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) throw new Error('User not authenticated');

    // Get the week end date for due_date
    const weekNumber = parseInt(weekKey.split('-')[2]);
    const year = parseInt(weekKey.split('-')[1]);
    const weekEndDate = new Date(year, 0, 1 + (weekNumber - 1) * 7);
    weekEndDate.setDate(weekEndDate.getDate() + 6);

    const title = `Weekly Plan - Week ${weekNumber}, ${year}`;
    const description = JSON.stringify(answers);

    const { error } = await supabase
      .from('objectives')
      .upsert({
        user_id: user.id,
        category,
        title,
        description,
        week_key: weekKey,
        status: 'pending',
        due_date: weekEndDate.toISOString().split('T')[0],
      } as any);

    if (error) throw error;
  },

  async loadWeeklyObjectives(
    category: MissionCategory,
    weekKey: string
  ): Promise<Record<number, string> | null> {
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) return null;

    const { data, error } = await supabase
      .from('objectives')
      .select('description')
      .eq('user_id', user.id)
      .eq('category', category)
      .eq('week_key', weekKey)
      .maybeSingle();

    if (error) throw error;
    if (!data) return null;

    try {
      return JSON.parse(data.description);
    } catch {
      return null;
    }
  },

  async getWeeklyActionsForDoor(weekKey: string): Promise<Array<{
    text: string;
    category: MissionCategory;
  }>> {
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) return [];

    const { data, error } = await supabase
      .from('objectives')
      .select('category, description')
      .eq('user_id', user.id)
      .eq('week_key', weekKey);

    if (error) throw error;
    if (!data) return [];

    const actions: Array<{ text: string; category: MissionCategory }> = [];

    data.forEach((objective) => {
      try {
        const answers = JSON.parse(objective.description);
        Object.values(answers).forEach((answer) => {
          if (typeof answer === 'string' && answer.trim()) {
            actions.push({
              text: answer.trim(),
              category: objective.category as MissionCategory
            });
          }
        });
      } catch (e) {
        console.error('Error parsing objective description:', e);
      }
    });

    return actions;
  },

  async getWeeklyObjectivesForDashboard(weekKey: string): Promise<Record<MissionCategory, string[]>> {
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) {
      return {
        body: [],
        being: [],
        balance: [],
        business: [],
        minte: []
      };
    }

    const { data, error } = await supabase
      .from('objectives')
      .select('category, description')
      .eq('user_id', user.id)
      .eq('week_key', weekKey);

    if (error) throw error;
    if (!data) {
      return {
        body: [],
        being: [],
        balance: [],
        business: [],
        minte: []
      };
    }

    const result: Record<MissionCategory, string[]> = {
      body: [],
      being: [],
      balance: [],
      business: [],
      minte: []
    };

    data.forEach((objective) => {
      try {
        const answers = JSON.parse(objective.description);
        const category = objective.category as MissionCategory;
        
        // Luăm doar primele 4 obiective strategice (indices 0-3)
        for (let i = 0; i < 4; i++) {
          if (answers[i] && typeof answers[i] === 'string' && answers[i].trim()) {
            result[category].push(answers[i].trim());
          }
        }
      } catch (e) {
        console.error('Error parsing objective description:', e);
      }
    });

    return result;
  }

};