import { supabase } from '@/integrations/supabase/client';

export interface DailyProgressStats {
  id: string;
  user_id: string;
  date: string;
  total_tasks: number;
  completed_tasks: number;
  hot_list_items: number;
  hit_list_items: number;
  do_list_items: number;
  completion_rate: number;
  streak_days: number;
  created_at: string;
  updated_at: string;
}

export const doorProgressService = {
  async getDailyProgress(date?: string): Promise<DailyProgressStats | null> {
    const targetDate = date || new Date().toISOString().split('T')[0];
    
    const { data, error } = await supabase
      .from('daily_progress_stats')
      .select('*')
      .eq('date', targetDate)
      .single();
    
    if (error) {
      if (error.code === 'PGRST116') { // No rows found
        return null;
      }
      throw error;
    }
    
    return data;
  },

  async getWeeklyProgress(startDate: string, endDate: string): Promise<DailyProgressStats[]> {
    const { data, error } = await supabase
      .from('daily_progress_stats')
      .select('*')
      .gte('date', startDate)
      .lte('date', endDate)
      .order('date', { ascending: true });
    
    if (error) throw error;
    return data || [];
  },

  async getMonthlyProgress(year: number, month: number): Promise<DailyProgressStats[]> {
    const startDate = `${year}-${String(month).padStart(2, '0')}-01`;
    const endDate = `${year}-${String(month).padStart(2, '0')}-${new Date(year, month, 0).getDate()}`;
    
    return this.getWeeklyProgress(startDate, endDate);
  },

  async getCurrentStreak(): Promise<number> {
    const today = new Date().toISOString().split('T')[0];
    
    const { data, error } = await supabase
      .from('daily_progress_stats')
      .select('streak_days')
      .eq('date', today)
      .single();
    
    if (error) return 0;
    return data?.streak_days || 0;
  },

  async updateStreakManually(date: string, streakDays: number): Promise<void> {
    const { error } = await supabase
      .from('daily_progress_stats')
      .update({ streak_days: streakDays })
      .eq('date', date);
    
    if (error) throw error;
  },

  async getCompletionTrend(days: number = 7): Promise<DailyProgressStats[]> {
    const endDate = new Date().toISOString().split('T')[0];
    const startDate = new Date(Date.now() - (days - 1) * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    
    return this.getWeeklyProgress(startDate, endDate);
  }
};