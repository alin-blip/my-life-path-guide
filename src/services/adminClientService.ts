import { supabase } from '@/integrations/supabase/client';

export interface AdminClient {
  id: string;
  email: string;
  display_name?: string;
  created_at: string;
  last_sign_in_at?: string;
  doorData: {
    totalTasks: number;
    completedTasks: number;
    currentStreak: number;
    completionRate: number;
    lastActivity?: string;
  };
}

export const adminClientService = {
  async fetchAllClients(): Promise<AdminClient[]> {
    // Fetch users from auth.users (admin only)
    const { data: usersData, error: usersError } = await supabase.auth.admin.listUsers();
    if (usersError) throw usersError;

    // Fetch Door statistics for all users
    const { data: progressData, error: progressError } = await supabase
      .from('daily_progress_stats')
      .select('user_id, total_tasks, completed_tasks, completion_rate, streak_days, date')
      .order('date', { ascending: false });

    if (progressError) throw progressError;

    // Map users with their Door data
    const clients: AdminClient[] = usersData.users.map(user => {
      const userProgress = progressData?.filter(p => p.user_id === user.id) || [];
      const latestProgress = userProgress[0];

      return {
        id: user.id,
        email: user.email || 'Unknown',
        display_name: user.user_metadata?.display_name || user.email?.split('@')[0],
        created_at: user.created_at,
        last_sign_in_at: user.last_sign_in_at,
        doorData: {
          totalTasks: latestProgress?.total_tasks || 0,
          completedTasks: latestProgress?.completed_tasks || 0,
          currentStreak: latestProgress?.streak_days || 0,
          completionRate: Number(latestProgress?.completion_rate || 0),
          lastActivity: latestProgress?.date || undefined,
        }
      };
    });

    return clients.sort((a, b) => 
      new Date(b.last_sign_in_at || b.created_at).getTime() - 
      new Date(a.last_sign_in_at || a.created_at).getTime()
    );
  },

  async fetchClientDoorData(userId: string, days: number = 7) {
    const endDate = new Date().toISOString().split('T')[0];
    const startDate = new Date(Date.now() - (days - 1) * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

    const { data, error } = await supabase
      .from('daily_progress_stats')
      .select('*')
      .eq('user_id', userId)
      .gte('date', startDate)
      .lte('date', endDate)
      .order('date', { ascending: true });

    if (error) throw error;
    return data || [];
  },

  async fetchClientDoorLists(userId: string, weekKey?: string) {
    const targetWeekKey = weekKey || this.getCurrentWeekKey();

    const { data, error } = await supabase
      .from('hot_list_items')
      .select('id, title, list_type, day_of_week, completed, priority, created_at')
      .eq('user_id', userId)
      .eq('week_key', targetWeekKey)
      .order('created_at', { ascending: true });

    if (error) throw error;

    const hotList = data?.filter(item => item.list_type === 'hot') || [];
    const hitList = data?.filter(item => item.list_type === 'hit') || [];
    const doList = data?.filter(item => item.list_type === 'do') || [];

    return { hotList, hitList, doList };
  },

  getCurrentWeekKey(): string {
    const now = new Date();
    const monday = new Date(now);
    monday.setDate(now.getDate() - now.getDay() + 1);
    return monday.toISOString().split('T')[0];
  }
};