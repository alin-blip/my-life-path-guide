import { supabase } from '@/integrations/supabase/client';

export type IdeaCategory = 'work' | 'personal' | 'urgent' | 'project';
export type IdeaStatus = 'new' | 'analyzed' | 'approved' | 'rejected' | 'archived';

export interface IdeaAnalysisResult {
  relevance_score: number;
  is_aligned: boolean;
  recommendation: 'pursue' | 'defer' | 'discard';
  reasoning: string;
  alignment?: {
    annual?: { aligned: boolean; objective: string };
    quarterly?: { aligned: boolean; objective: string };
    monthly?: { aligned: boolean; objective: string };
  };
  estimated_effort?: 'low' | 'medium' | 'high';
  urgency?: 'low' | 'medium' | 'high';
  is_busy_work?: boolean;
}

export interface IdeaBankItem {
  id: string;
  text: string;
  category: IdeaCategory;
  priority: number;
  status: IdeaStatus;
  analysis_result: IdeaAnalysisResult | null;
  linked_objective_id: string | null;
  analyzed_at: string | null;
  created_at: string;
  updated_at: string;
}

async function getUserId(): Promise<string | null> {
  const { data, error } = await supabase.auth.getUser();
  if (error) return null;
  return data.user?.id ?? null;
}

export const ideasBankService = {
  async fetchAllIdeas(): Promise<IdeaBankItem[]> {
    const userId = await getUserId();
    if (!userId) return [];

    const { data, error } = await supabase
      .from('ideas_bank')
      .select('*')
      .eq('user_id', userId)
      .neq('status', 'archived')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching ideas:', error);
      throw error;
    }

    return (data ?? []).map(row => ({
      id: row.id,
      text: row.text,
      category: row.category as IdeaCategory,
      priority: row.priority ?? 1,
      status: row.status as IdeaStatus,
      analysis_result: row.analysis_result as unknown as IdeaAnalysisResult | null,
      linked_objective_id: row.linked_objective_id,
      analyzed_at: row.analyzed_at,
      created_at: row.created_at,
      updated_at: row.updated_at
    }));
  },

  async addIdea(text: string, category: IdeaCategory = 'work', priority: number = 1): Promise<IdeaBankItem> {
    const userId = await getUserId();
    if (!userId) throw new Error('User not authenticated');

    const { data, error } = await supabase
      .from('ideas_bank')
      .insert({
        user_id: userId,
        text: text.trim(),
        category,
        priority,
        status: 'new'
      })
      .select()
      .single();

    if (error) {
      console.error('Error adding idea:', error);
      throw error;
    }

    return {
      id: data.id,
      text: data.text,
      category: data.category as IdeaCategory,
      priority: data.priority ?? 1,
      status: data.status as IdeaStatus,
      analysis_result: data.analysis_result as unknown as IdeaAnalysisResult | null,
      linked_objective_id: data.linked_objective_id,
      analyzed_at: data.analyzed_at,
      created_at: data.created_at,
      updated_at: data.updated_at
    };
  },

  async updateIdea(id: string, updates: Partial<Pick<IdeaBankItem, 'text' | 'category' | 'priority' | 'status'>>): Promise<void> {
    const userId = await getUserId();
    if (!userId) throw new Error('User not authenticated');

    const { error } = await supabase
      .from('ideas_bank')
      .update(updates)
      .eq('id', id)
      .eq('user_id', userId);

    if (error) {
      console.error('Error updating idea:', error);
      throw error;
    }
  },

  async deleteIdea(id: string): Promise<void> {
    const userId = await getUserId();
    if (!userId) throw new Error('User not authenticated');

    const { error } = await supabase
      .from('ideas_bank')
      .delete()
      .eq('id', id)
      .eq('user_id', userId);

    if (error) {
      console.error('Error deleting idea:', error);
      throw error;
    }
  },

  async archiveIdea(id: string): Promise<void> {
    await this.updateIdea(id, { status: 'archived' });
  },

  async saveAnalysisResult(id: string, result: IdeaAnalysisResult): Promise<void> {
    const userId = await getUserId();
    if (!userId) throw new Error('User not authenticated');

    const { error } = await supabase
      .from('ideas_bank')
      .update({
        analysis_result: result as any,
        status: result.recommendation === 'pursue' ? 'approved' : 
                result.recommendation === 'defer' ? 'analyzed' : 'rejected',
        analyzed_at: new Date().toISOString()
      })
      .eq('id', id)
      .eq('user_id', userId);

    if (error) {
      console.error('Error saving analysis result:', error);
      throw error;
    }
  },

  async getIdeasByStatus(status: IdeaStatus): Promise<IdeaBankItem[]> {
    const userId = await getUserId();
    if (!userId) return [];

    const { data, error } = await supabase
      .from('ideas_bank')
      .select('*')
      .eq('user_id', userId)
      .eq('status', status)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching ideas by status:', error);
      throw error;
    }

    return (data ?? []).map(row => ({
      id: row.id,
      text: row.text,
      category: row.category as IdeaCategory,
      priority: row.priority ?? 1,
      status: row.status as IdeaStatus,
      analysis_result: row.analysis_result as unknown as IdeaAnalysisResult | null,
      linked_objective_id: row.linked_objective_id,
      analyzed_at: row.analyzed_at,
      created_at: row.created_at,
      updated_at: row.updated_at
    }));
  }
};
