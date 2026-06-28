import { supabase } from '@/integrations/supabase/client';

export interface StackSessionData {
  session_id: string;
  stack_type: 'anger' | 'divine' | 'hormozi' | 'gods-school' | 'napoleon-hill' | 'frustration' | 'fear';
  step?: number;
  answers: Record<number | string, any>;
  timestamp: string;
  isCompleted?: boolean;
  committedAction?: string;
  mode?: 'structured' | 'chat';
  currentAnswer?: string;
  draftAnswer?: string;
  challenge_day_number?: number;
}

export const stackSessionsService = {
  /**
   * Salvează o sesiune de stack în Supabase
   */
  async saveStackSession(sessionData: StackSessionData): Promise<{ success: boolean; error?: any; sessionId?: string }> {
    try {
      const { data: userData } = await supabase.auth.getUser();
      
      if (!userData?.user?.id) {
        console.warn('No authenticated user, skipping Supabase save');
        return { success: false, error: 'No authenticated user' };
      }

      const insertData: any = {
        session_id: sessionData.session_id,
        stack_type: sessionData.stack_type,
        user_id: userData.user.id,
        answers: sessionData.answers,
        completed: sessionData.isCompleted || false,
        updated_at: new Date().toISOString()
      };

      // Add challenge_day_number if provided
      if (sessionData.challenge_day_number) {
        insertData.challenge_day_number = sessionData.challenge_day_number;
      }

      const { data, error } = await supabase
        .from('stack_sessions')
        .upsert(insertData, {
          onConflict: 'session_id,stack_type'
        })
        .select('id')
        .single();

      if (error) {
        console.error('Error saving stack session to Supabase:', error);
        return { success: false, error };
      }

      return { success: true, sessionId: data?.id };
    } catch (error) {
      console.error('Exception saving stack session:', error);
      return { success: false, error };
    }
  },

  /**
   * Încarcă o sesiune de stack din Supabase
   */
  async loadStackSession(sessionId: string, stackType: string): Promise<StackSessionData | null> {
    try {
      const { data: userData } = await supabase.auth.getUser();
      
      if (!userData?.user?.id) {
        return null;
      }

      const { data, error } = await supabase
        .from('stack_sessions')
        .select('*')
        .eq('session_id', sessionId)
        .eq('stack_type', stackType)
        .eq('user_id', userData.user.id)
        .maybeSingle();

      if (error) {
        console.error('Error loading stack session from Supabase:', error);
        return null;
      }

      if (!data) {
        return null;
      }

      return {
        session_id: data.session_id,
        stack_type: data.stack_type as any,
        answers: data.answers as Record<number | string, any>,
        timestamp: data.updated_at,
        isCompleted: data.completed
      };
    } catch (error) {
      console.error('Exception loading stack session:', error);
      return null;
    }
  },

  /**
   * Șterge o sesiune de stack din Supabase
   */
  async clearStackSession(sessionId: string, stackType: string): Promise<{ success: boolean }> {
    try {
      const { data: userData } = await supabase.auth.getUser();
      
      if (!userData?.user?.id) {
        return { success: false };
      }

      const { error } = await supabase
        .from('stack_sessions')
        .delete()
        .eq('session_id', sessionId)
        .eq('stack_type', stackType)
        .eq('user_id', userData.user.id);

      if (error) {
        console.error('Error clearing stack session from Supabase:', error);
        return { success: false };
      }

      return { success: true };
    } catch (error) {
      console.error('Exception clearing stack session:', error);
      return { success: false };
    }
  },

  /**
   * Migrează sesiuni din localStorage în Supabase
   */
  async migrateLocalStorageToSupabase(): Promise<number> {
    let migratedCount = 0;
    
    try {
      const { data: userData } = await supabase.auth.getUser();
      
      if (!userData?.user?.id) {
        return 0;
      }

      // Scanăm toate cheile din localStorage
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        
        if (key && key.startsWith('stack-session-')) {
          try {
            const data = localStorage.getItem(key);
            if (data) {
              const sessionData: StackSessionData = JSON.parse(data);
              
              // Salvăm în Supabase
              const result = await this.saveStackSession(sessionData);
              
              if (result.success) {
                migratedCount++;
                console.log(`Migrated session: ${key}`);
              }
            }
          } catch (e) {
            console.error(`Error migrating ${key}:`, e);
          }
        }
      }
      
      return migratedCount;
    } catch (error) {
      console.error('Error during migration:', error);
      return migratedCount;
    }
  }
};
