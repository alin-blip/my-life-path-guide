import { supabase } from '@/integrations/supabase/client';

interface Message {
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date | string;
}

interface PrincipleDraft {
  id: string;
  user_id: string;
  project_id: string;
  principle_number: number;
  messages: Message[];
  last_saved_at: string;
  created_at: string;
  updated_at: string;
}

export const napoleonHillDraftService = {
  // Save or update draft for a principle
  async saveDraft(projectId: string, principleNumber: number, messages: Message[]): Promise<boolean> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return false;

      // Convert Date objects to ISO strings
      const serializedMessages = messages.map(msg => ({
        ...msg,
        timestamp: msg.timestamp instanceof Date ? msg.timestamp.toISOString() : msg.timestamp
      }));

      const { error } = await supabase
        .from('napoleon_hill_principle_drafts')
        .upsert({
          user_id: user.id,
          project_id: projectId,
          principle_number: principleNumber,
          messages: serializedMessages,
          last_saved_at: new Date().toISOString()
        }, {
          onConflict: 'project_id,principle_number'
        });

      if (error) {
        console.error('Error saving Napoleon Hill draft:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Error in saveDraft:', error);
      return false;
    }
  },

  // Load draft for a principle
  async loadDraft(projectId: string, principleNumber: number): Promise<Message[] | null> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return null;

      const { data, error } = await supabase
        .from('napoleon_hill_principle_drafts')
        .select('messages')
        .eq('project_id', projectId)
        .eq('principle_number', principleNumber)
        .eq('user_id', user.id)
        .maybeSingle();

      if (error) {
        console.error('Error loading Napoleon Hill draft:', error);
        return null;
      }

      if (!data) return null;

      // Convert ISO strings back to Date objects
      const messages = (data.messages as any[]).map(msg => ({
        ...msg,
        timestamp: new Date(msg.timestamp)
      }));

      return messages;
    } catch (error) {
      console.error('Error in loadDraft:', error);
      return null;
    }
  },

  // Delete draft after principle is completed
  async deleteDraft(projectId: string, principleNumber: number): Promise<boolean> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return false;

      const { error } = await supabase
        .from('napoleon_hill_principle_drafts')
        .delete()
        .eq('project_id', projectId)
        .eq('principle_number', principleNumber)
        .eq('user_id', user.id);

      if (error) {
        console.error('Error deleting Napoleon Hill draft:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Error in deleteDraft:', error);
      return false;
    }
  },

  // Check if draft exists
  async hasDraft(projectId: string, principleNumber: number): Promise<boolean> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return false;

      const { data, error } = await supabase
        .from('napoleon_hill_principle_drafts')
        .select('id')
        .eq('project_id', projectId)
        .eq('principle_number', principleNumber)
        .eq('user_id', user.id)
        .maybeSingle();

      if (error) {
        console.error('Error checking Napoleon Hill draft:', error);
        return false;
      }

      return !!data;
    } catch (error) {
      console.error('Error in hasDraft:', error);
      return false;
    }
  }
};