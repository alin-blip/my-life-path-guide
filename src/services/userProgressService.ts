import { supabase } from '@/integrations/supabase/client';
import { logger } from '@/lib/logger';

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
    logger.group('💾 Saving Core Progress', () => {
      logger.info('Date:', date);
      logger.info('Data keys:', Object.keys(coreData));
      logger.table(coreData);
    });

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      logger.warn('❌ No user found, cannot save core progress');
      return;
    }

    const payload = {
      user_id: user.id,
      activity_type: `core_${date}`,
      activity_data: coreData,
      updated_at: new Date().toISOString(),
    };

    logger.info('📤 Upserting to user_progress:', payload);

    const { error } = await supabase
      .from('user_progress')
      .upsert(payload, {
        onConflict: 'user_id,activity_type'
      });

    if (error) {
      logger.error('❌ Error saving core progress:', error);
      throw error;
    }

    logger.info('✅ Core progress saved successfully');
  },

  /**
   * Save Daily Four progress to Supabase
   */
  async saveDailyFourProgress(date: string, dailyFourData: DailyFourData): Promise<void> {
    logger.group('💾 Saving Daily Four Progress', () => {
      logger.info('Date:', date);
      logger.info('Data keys:', Object.keys(dailyFourData));
      logger.table(dailyFourData);
    });

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      logger.warn('❌ No user found, cannot save daily four progress');
      return;
    }

    const payload = {
      user_id: user.id,
      activity_type: `daily_four_${date}`,
      activity_data: dailyFourData,
      updated_at: new Date().toISOString(),
    };

    logger.info('📤 Upserting to user_progress:', payload);

    const { error } = await supabase
      .from('user_progress')
      .upsert(payload, {
        onConflict: 'user_id,activity_type'
      });

    if (error) {
      logger.error('❌ Error saving daily four progress:', error);
      throw error;
    }

    logger.info('✅ Daily four progress saved successfully');
  },

  /**
   * Load Core 4 progress from Supabase
   */
  async loadCoreProgress(date: string): Promise<CoreDataByDay | null> {
    logger.info('📥 Loading Core Progress for date:', date);

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      logger.warn('❌ No user found, cannot load core progress');
      return null;
    }

    const { data, error } = await supabase
      .from('user_progress')
      .select('activity_data')
      .eq('user_id', user.id)
      .eq('activity_type', `core_${date}`)
      .maybeSingle();

    if (error) {
      if (error.code === 'PGRST116') {
        logger.info('ℹ️ No core progress found for this date');
        return null;
      }
      logger.error('❌ Error loading core progress:', error);
      return null;
    }

    logger.info('✅ Core progress loaded:', data?.activity_data);
    return data?.activity_data as CoreDataByDay;
  },

  /**
   * Load Daily Four progress from Supabase
   */
  async loadDailyFourProgress(date: string): Promise<DailyFourData | null> {
    logger.info('📥 Loading Daily Four Progress for date:', date);

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      logger.warn('❌ No user found, cannot load daily four progress');
      return null;
    }

    const { data, error } = await supabase
      .from('user_progress')
      .select('activity_data')
      .eq('user_id', user.id)
      .eq('activity_type', `daily_four_${date}`)
      .maybeSingle();

    if (error) {
      if (error.code === 'PGRST116') {
        logger.info('ℹ️ No daily four progress found for this date');
        return null;
      }
      logger.error('❌ Error loading daily four progress:', error);
      return null;
    }

    logger.info('✅ Daily four progress loaded:', data?.activity_data);
    return data?.activity_data as DailyFourData;
  },

  /**
   * Load all progress for current week
   */
  async loadWeekProgress(weekStartDate: string): Promise<{
    core: CoreDataByDay | null;
    dailyFour: DailyFourData | null;
  }> {
    logger.info('📅 Loading Week Progress for week starting:', weekStartDate);
    
    const core = await this.loadCoreProgress(weekStartDate);
    const dailyFour = await this.loadDailyFourProgress(weekStartDate);
    
    logger.info('✅ Week progress loaded successfully');
    return { core, dailyFour };
  },

  /**
   * Migrate data from localStorage to Supabase
   */
  async migrateLocalStorageData(): Promise<void> {
    logger.info('🔄 Starting localStorage migration...');
    
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      logger.warn('❌ No user found, cannot migrate data');
      return;
    }

    try {
      // Try to get data from localStorage
      const coreDataStr = localStorage.getItem('user-core-data');
      const dailyFourDataStr = localStorage.getItem('user-daily-four-data');

      logger.group('📦 localStorage Data Found', () => {
        logger.info('Core data exists:', !!coreDataStr);
        logger.info('Daily Four data exists:', !!dailyFourDataStr);
      });

      const today = new Date().toISOString().split('T')[0];

      // Migrate Core data
      if (coreDataStr) {
        const coreData = JSON.parse(coreDataStr);
        logger.info('🔄 Migrating Core data...');
        await this.saveCoreProgress(today, coreData);
        logger.info('✅ Core data migrated to Lovable Cloud');
      }

      // Migrate Daily Four data
      if (dailyFourDataStr) {
        const dailyFourData = JSON.parse(dailyFourDataStr);
        logger.info('🔄 Migrating Daily Four data...');
        await this.saveDailyFourProgress(today, dailyFourData);
        logger.info('✅ Daily Four data migrated to Lovable Cloud');
      }

      logger.info('✅ Migration completed successfully');
    } catch (error) {
      logger.error('❌ Error migrating localStorage data:', error);
    }
  }
};
