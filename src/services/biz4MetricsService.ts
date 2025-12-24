import { supabase } from '@/integrations/supabase/client';

export interface Biz4DailyMetrics {
  id?: string;
  user_id?: string;
  date: string;
  
  // Content metrics
  content_completed: boolean;
  content_pieces_count: number;
  content_type?: string;
  
  // Engage metrics
  engage_completed: boolean;
  engage_minutes: number;
  engage_comments_count: number;
  
  // Outreach metrics
  outreach_completed: boolean;
  outreach_prospects_count: number;
  outreach_channels: string[];
  
  // Close metrics
  close_completed: boolean;
  close_conversations_count: number;
  close_deals_won: number;
  
  // Weekly Two
  podcast_completed: boolean;
  podcast_episode_number?: number;
  webinar_completed: boolean;
  webinar_attendees_count?: number;
}

export interface WeeklyReport {
  weekStart: string;
  weekEnd: string;
  totalContent: number;
  totalEngageMinutes: number;
  totalProspects: number;
  totalConversations: number;
  totalDealsWon: number;
  conversionRate: number;
  completionByDay: {
    date: string;
    content: boolean;
    engage: boolean;
    outreach: boolean;
    close: boolean;
  }[];
  podcastCompleted: boolean;
  webinarCompleted: boolean;
}

const getDefaultMetrics = (date: string): Biz4DailyMetrics => ({
  date,
  content_completed: false,
  content_pieces_count: 0,
  engage_completed: false,
  engage_minutes: 0,
  engage_comments_count: 0,
  outreach_completed: false,
  outreach_prospects_count: 0,
  outreach_channels: [],
  close_completed: false,
  close_conversations_count: 0,
  close_deals_won: 0,
  podcast_completed: false,
  webinar_completed: false,
});

export const biz4MetricsService = {
  async getDailyMetrics(date: string): Promise<Biz4DailyMetrics> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return getDefaultMetrics(date);

      const { data, error } = await supabase
        .from('biz4_daily_metrics')
        .select('*')
        .eq('user_id', user.id)
        .eq('date', date)
        .maybeSingle();

      if (error) {
        console.error('Error fetching biz4 metrics:', error);
        return getDefaultMetrics(date);
      }

      if (!data) return getDefaultMetrics(date);

      return {
        ...data,
        outreach_channels: data.outreach_channels || [],
      } as Biz4DailyMetrics;
    } catch (error) {
      console.error('Error in getDailyMetrics:', error);
      return getDefaultMetrics(date);
    }
  },

  async saveDailyMetrics(metrics: Partial<Biz4DailyMetrics>): Promise<boolean> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return false;

      const date = metrics.date || new Date().toISOString().split('T')[0];

      const { error } = await supabase
        .from('biz4_daily_metrics')
        .upsert({
          user_id: user.id,
          date,
          ...metrics,
        }, {
          onConflict: 'user_id,date',
        });

      if (error) {
        console.error('Error saving biz4 metrics:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Error in saveDailyMetrics:', error);
      return false;
    }
  },

  async updateActionMetrics(
    actionId: 'content' | 'engage' | 'outreach' | 'close' | 'podcast' | 'webinar',
    metrics: Record<string, any>,
    date?: string
  ): Promise<boolean> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return false;

      const targetDate = date || new Date().toISOString().split('T')[0];
      
      // Build update object based on action
      const updateData: Record<string, any> = {
        user_id: user.id,
        date: targetDate,
      };

      switch (actionId) {
        case 'content':
          updateData.content_completed = metrics.completed ?? true;
          if (metrics.pieces_count !== undefined) updateData.content_pieces_count = metrics.pieces_count;
          if (metrics.type !== undefined) updateData.content_type = metrics.type;
          break;
        case 'engage':
          updateData.engage_completed = metrics.completed ?? true;
          if (metrics.minutes !== undefined) updateData.engage_minutes = metrics.minutes;
          if (metrics.comments_count !== undefined) updateData.engage_comments_count = metrics.comments_count;
          break;
        case 'outreach':
          updateData.outreach_completed = metrics.completed ?? true;
          if (metrics.prospects_count !== undefined) updateData.outreach_prospects_count = metrics.prospects_count;
          if (metrics.channels !== undefined) updateData.outreach_channels = metrics.channels;
          break;
        case 'close':
          updateData.close_completed = metrics.completed ?? true;
          if (metrics.conversations_count !== undefined) updateData.close_conversations_count = metrics.conversations_count;
          if (metrics.deals_won !== undefined) updateData.close_deals_won = metrics.deals_won;
          break;
        case 'podcast':
          updateData.podcast_completed = metrics.completed ?? true;
          if (metrics.episode_number !== undefined) updateData.podcast_episode_number = metrics.episode_number;
          break;
        case 'webinar':
          updateData.webinar_completed = metrics.completed ?? true;
          if (metrics.attendees_count !== undefined) updateData.webinar_attendees_count = metrics.attendees_count;
          break;
      }

      const { error } = await supabase
        .from('biz4_daily_metrics')
        .upsert(updateData as any, {
          onConflict: 'user_id,date',
        });

      if (error) {
        console.error('Error updating action metrics:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Error in updateActionMetrics:', error);
      return false;
    }
  },

  async getWeeklyReport(weekStart: string): Promise<WeeklyReport> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      // Calculate week end (7 days from start)
      const startDate = new Date(weekStart);
      const endDate = new Date(startDate);
      endDate.setDate(endDate.getDate() + 6);
      const weekEnd = endDate.toISOString().split('T')[0];

      const defaultReport: WeeklyReport = {
        weekStart,
        weekEnd,
        totalContent: 0,
        totalEngageMinutes: 0,
        totalProspects: 0,
        totalConversations: 0,
        totalDealsWon: 0,
        conversionRate: 0,
        completionByDay: [],
        podcastCompleted: false,
        webinarCompleted: false,
      };

      if (!user) return defaultReport;

      const { data, error } = await supabase
        .from('biz4_daily_metrics')
        .select('*')
        .eq('user_id', user.id)
        .gte('date', weekStart)
        .lte('date', weekEnd)
        .order('date', { ascending: true });

      if (error) {
        console.error('Error fetching weekly report:', error);
        return defaultReport;
      }

      if (!data || data.length === 0) return defaultReport;

      // Aggregate metrics
      let totalContent = 0;
      let totalEngageMinutes = 0;
      let totalProspects = 0;
      let totalConversations = 0;
      let totalDealsWon = 0;
      let podcastCompleted = false;
      let webinarCompleted = false;

      const completionByDay = data.map(day => {
        totalContent += day.content_pieces_count || 0;
        totalEngageMinutes += day.engage_minutes || 0;
        totalProspects += day.outreach_prospects_count || 0;
        totalConversations += day.close_conversations_count || 0;
        totalDealsWon += day.close_deals_won || 0;
        if (day.podcast_completed) podcastCompleted = true;
        if (day.webinar_completed) webinarCompleted = true;

        return {
          date: day.date,
          content: day.content_completed || false,
          engage: day.engage_completed || false,
          outreach: day.outreach_completed || false,
          close: day.close_completed || false,
        };
      });

      // Calculate conversion rate (prospects to deals)
      const conversionRate = totalProspects > 0 
        ? Math.round((totalDealsWon / totalProspects) * 100) 
        : 0;

      return {
        weekStart,
        weekEnd,
        totalContent,
        totalEngageMinutes,
        totalProspects,
        totalConversations,
        totalDealsWon,
        conversionRate,
        completionByDay,
        podcastCompleted,
        webinarCompleted,
      };
    } catch (error) {
      console.error('Error in getWeeklyReport:', error);
      return {
        weekStart,
        weekEnd: weekStart,
        totalContent: 0,
        totalEngageMinutes: 0,
        totalProspects: 0,
        totalConversations: 0,
        totalDealsWon: 0,
        conversionRate: 0,
        completionByDay: [],
        podcastCompleted: false,
        webinarCompleted: false,
      };
    }
  },

  async getTodayIncompleteActions(): Promise<string[]> {
    try {
      const today = new Date().toISOString().split('T')[0];
      const metrics = await this.getDailyMetrics(today);
      
      const incomplete: string[] = [];
      if (!metrics.content_completed) incomplete.push('content');
      if (!metrics.engage_completed) incomplete.push('engage');
      if (!metrics.outreach_completed) incomplete.push('outreach');
      if (!metrics.close_completed) incomplete.push('close');
      
      return incomplete;
    } catch (error) {
      console.error('Error getting incomplete actions:', error);
      return ['content', 'engage', 'outreach', 'close'];
    }
  },
};
