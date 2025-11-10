import { supabase } from '@/integrations/supabase/client';

interface DraftData {
  messages: Array<{ role: 'user' | 'assistant'; content: string }>;
  questionsAnswered: number;
  isSkippingReview: boolean;
}

interface DraftRecord {
  id: string;
  user_id: string;
  week_key: string;
  messages: any;
  questions_answered: number;
  is_skipping_review: boolean;
  last_saved_at: string;
  created_at: string;
  updated_at: string;
}

interface DraftDataWithTimestamp extends DraftData {
  lastSavedAt?: string;
}

const getUserId = async (): Promise<string | null> => {
  const { data: { user } } = await supabase.auth.getUser();
  return user?.id || null;
};

export const weeklyPlanningDraftService = {
  /**
   * Save or update a draft in the database
   */
  async saveDraft(weekKey: string, draftData: DraftData): Promise<boolean> {
    try {
      const userId = await getUserId();
      if (!userId) {
        console.error('❌ No authenticated user for saving draft');
        return false;
      }

      const { error } = await supabase
        .from('weekly_planning_drafts')
        .upsert({
          user_id: userId,
          week_key: weekKey,
          messages: draftData.messages,
          questions_answered: draftData.questionsAnswered,
          is_skipping_review: draftData.isSkippingReview,
          last_saved_at: new Date().toISOString(),
        }, {
          onConflict: 'user_id,week_key'
        });

      if (error) {
        console.error('❌ Error saving draft to database:', error);
        return false;
      }

      console.log('✅ Draft saved to database:', { weekKey, messagesCount: draftData.messages.length });
      return true;
    } catch (error) {
      console.error('❌ Unexpected error saving draft:', error);
      return false;
    }
  },

  /**
   * Load the latest draft for a specific week
   */
  async loadDraft(weekKey: string): Promise<DraftDataWithTimestamp | null> {
    try {
      const userId = await getUserId();
      if (!userId) {
        console.error('❌ No authenticated user for loading draft');
        return null;
      }

      const { data, error } = await supabase
        .from('weekly_planning_drafts')
        .select('*')
        .eq('user_id', userId)
        .eq('week_key', weekKey)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          // No draft found - this is normal
          console.log('ℹ️ No draft found for week:', weekKey);
          return null;
        }
        console.error('❌ Error loading draft from database:', error);
        return null;
      }

      const record = data as DraftRecord;
      
      console.log('✅ Draft loaded from database:', { 
        weekKey, 
        messagesCount: record.messages?.length || 0,
        lastSaved: record.last_saved_at 
      });

      return {
        messages: record.messages || [],
        questionsAnswered: record.questions_answered || 0,
        isSkippingReview: record.is_skipping_review || false,
        lastSavedAt: record.last_saved_at,
      };
    } catch (error) {
      console.error('❌ Unexpected error loading draft:', error);
      return null;
    }
  },

  /**
   * Delete a draft from the database
   */
  async deleteDraft(weekKey: string): Promise<boolean> {
    try {
      const userId = await getUserId();
      if (!userId) {
        console.error('❌ No authenticated user for deleting draft');
        return false;
      }

      const { error } = await supabase
        .from('weekly_planning_drafts')
        .delete()
        .eq('user_id', userId)
        .eq('week_key', weekKey);

      if (error) {
        console.error('❌ Error deleting draft from database:', error);
        return false;
      }

      console.log('✅ Draft deleted from database:', weekKey);
      return true;
    } catch (error) {
      console.error('❌ Unexpected error deleting draft:', error);
      return false;
    }
  },

  /**
   * Get all drafts for the current user
   */
  async getAllDrafts(): Promise<DraftRecord[]> {
    try {
      const userId = await getUserId();
      if (!userId) {
        console.error('❌ No authenticated user for loading drafts');
        return [];
      }

      const { data, error } = await supabase
        .from('weekly_planning_drafts')
        .select('*')
        .eq('user_id', userId)
        .order('last_saved_at', { ascending: false });

      if (error) {
        console.error('❌ Error loading drafts from database:', error);
        return [];
      }

      return (data as DraftRecord[]) || [];
    } catch (error) {
      console.error('❌ Unexpected error loading drafts:', error);
      return [];
    }
  }
};
