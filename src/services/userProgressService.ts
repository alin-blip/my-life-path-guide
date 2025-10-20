import { supabase } from '@/integrations/supabase/client';

export interface CoreDataByDay {
  [key: string]: {
    [activityId: string]: boolean;
  };
}

export interface DailyFourData {
  [key: string]: {
    video: boolean;
    text: boolean;
    audio: boolean;
    image: boolean;
    podcast?: boolean;
    webinar?: boolean;
  };
}

export const userProgressService = {
  /**
   * Save Core 4 progress to Supabase
   */
  async saveCoreProgress(date: string, coreData: CoreDataByDay): Promise<void> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { error } = await supabase
      .from('user_progress')
      .upsert({
        user_id: user.id,
        date,
        activity_type: 'core',
        activity_data: coreData,
        updated_at: new Date().toISOString(),
      }, {
        onConflict: 'user_id,date,activity_type'
      });

    if (error) {
      console.error('Error saving core progress:', error);
      throw error;
    }
  },

  /**
   * Save Daily Four progress to Supabase
   */
  async saveDailyFourProgress(date: string, dailyFourData: DailyFourData): Promise<void> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { error } = await supabase
      .from('user_progress')
      .upsert({
        user_id: user.id,
        date,
        activity_type: 'daily_four',
        activity_data: dailyFourData,
        updated_at: new Date().toISOString(),
      }, {
        onConflict: 'user_id,date,activity_type'
      });

    if (error) {
      console.error('Error saving daily four progress:', error);
      throw error;
    }
  },

  /**
   * Load Core 4 progress from Supabase
   */
  async loadCoreProgress(date: string): Promise<CoreDataByDay | null> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;

    const { data, error } = await supabase
      .from('user_progress')
      .select('activity_data')
      .eq('user_id', user.id)
      .eq('date', date)
      .eq('activity_type', 'core')
      .single();

    if (error) {
      if (error.code === 'PGRST116') return null; // No rows found
      console.error('Error loading core progress:', error);
      return null;
    }

    return data?.activity_data as CoreDataByDay;
  },

  /**
   * Load Daily Four progress from Supabase
   */
  async loadDailyFourProgress(date: string): Promise<DailyFourData | null> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;

    const { data, error } = await supabase
      .from('user_progress')
      .select('activity_data')
      .eq('user_id', user.id)
      .eq('date', date)
      .eq('activity_type', 'daily_four')
      .single();

    if (error) {
      if (error.code === 'PGRST116') return null; // No rows found
      console.error('Error loading daily four progress:', error);
      return null;
    }

    return data?.activity_data as DailyFourData;
  },

  /**
   * Load all progress for current week
   */
  async loadWeekProgress(weekStartDate: string): Promise<{
    core: CoreDataByDay | null;
    dailyFour: DailyFourData | null;
  }> {
    const core = await this.loadCoreProgress(weekStartDate);
    const dailyFour = await this.loadDailyFourProgress(weekStartDate);
    
    return { core, dailyFour };
  },

  /**
   * Migrate data from localStorage to Supabase
   */
  async migrateLocalStorageData(): Promise<void> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    try {
      // Try to get data from localStorage
      const coreDataStr = localStorage.getItem('user-core-data');
      const dailyFourDataStr = localStorage.getItem('user-daily-four-data');

      const today = new Date().toISOString().split('T')[0];

      // Migrate Core data
      if (coreDataStr) {
        const coreData = JSON.parse(coreDataStr);
        await this.saveCoreProgress(today, coreData);
        console.log('✅ Core data migrated to Supabase');
      }

      // Migrate Daily Four data
      if (dailyFourDataStr) {
        const dailyFourData = JSON.parse(dailyFourDataStr);
        await this.saveDailyFourProgress(today, dailyFourData);
        console.log('✅ Daily Four data migrated to Supabase');
      }
    } catch (error) {
      console.error('Error migrating localStorage data:', error);
    }
  }
};
