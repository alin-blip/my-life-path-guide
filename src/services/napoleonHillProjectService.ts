import { supabase } from '@/integrations/supabase/client';

export interface NapoleonHillProject {
  id: string;
  user_id: string;
  project_name: string;
  goal_description: string;
  goal_amount?: string;
  goal_deadline?: string;
  current_principle: number;
  principle_answers: Record<string, any>;
  principle_summaries: Record<string, string>;
  action_items: Array<{
    principle: number;
    action: string;
    completed: boolean;
  }>;
  status: 'active' | 'completed' | 'archived';
  created_at: string;
  updated_at: string;
}

export const napoleonHillProjectService = {
  async getUserId(): Promise<string | null> {
    const { data, error } = await supabase.auth.getUser();
    if (error) return null;
    return data.user?.id ?? null;
  },

  async createProject(projectData: {
    project_name: string;
    goal_description: string;
    goal_amount?: string;
    goal_deadline?: string;
  }): Promise<NapoleonHillProject | null> {
    const userId = await this.getUserId();
    if (!userId) return null;

    const { data, error } = await supabase
      .from('napoleon_hill_projects')
      .insert({
        user_id: userId,
        project_name: projectData.project_name,
        goal_description: projectData.goal_description,
        goal_amount: projectData.goal_amount,
        goal_deadline: projectData.goal_deadline,
        current_principle: 1,
        status: 'active'
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating Napoleon Hill project:', error);
      return null;
    }

    return data as NapoleonHillProject;
  },

  async getProjects(status?: 'active' | 'completed' | 'archived'): Promise<NapoleonHillProject[]> {
    const userId = await this.getUserId();
    if (!userId) return [];

    let query = supabase
      .from('napoleon_hill_projects')
      .select('*')
      .eq('user_id', userId)
      .order('updated_at', { ascending: false });

    if (status) {
      query = query.eq('status', status);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Error fetching Napoleon Hill projects:', error);
      return [];
    }

    return (data || []) as NapoleonHillProject[];
  },

  async getProject(projectId: string): Promise<NapoleonHillProject | null> {
    const userId = await this.getUserId();
    if (!userId) return null;

    const { data, error } = await supabase
      .from('napoleon_hill_projects')
      .select('*')
      .eq('id', projectId)
      .eq('user_id', userId)
      .single();

    if (error) {
      console.error('Error fetching Napoleon Hill project:', error);
      return null;
    }

    return data as NapoleonHillProject;
  },

  async updateProject(projectId: string, updates: Partial<NapoleonHillProject>): Promise<boolean> {
    const userId = await this.getUserId();
    if (!userId) return false;

    const { error } = await supabase
      .from('napoleon_hill_projects')
      .update(updates)
      .eq('id', projectId)
      .eq('user_id', userId);

    if (error) {
      console.error('Error updating Napoleon Hill project:', error);
      return false;
    }

    return true;
  },

  async savePrincipleProgress(
    projectId: string,
    principle: number,
    answer: any,
    summary?: string,
    actions?: Array<{ action: string; completed: boolean }>
  ): Promise<boolean> {
    const project = await this.getProject(projectId);
    if (!project) return false;

    const updatedAnswers = {
      ...project.principle_answers,
      [principle]: answer
    };

    const updatedSummaries = summary
      ? { ...project.principle_summaries, [principle]: summary }
      : project.principle_summaries;

    const updatedActions = actions
      ? [
          ...project.action_items,
          ...actions.map(a => ({ principle, ...a }))
        ]
      : project.action_items;

    return await this.updateProject(projectId, {
      principle_answers: updatedAnswers,
      principle_summaries: updatedSummaries,
      action_items: updatedActions,
      current_principle: Math.max(principle + 1, project.current_principle)
    });
  },

  async completeProject(projectId: string): Promise<boolean> {
    return await this.updateProject(projectId, {
      status: 'completed',
      current_principle: 14
    });
  },

  async archiveProject(projectId: string): Promise<boolean> {
    return await this.updateProject(projectId, {
      status: 'archived'
    });
  },

  async deleteProject(projectId: string): Promise<boolean> {
    const userId = await this.getUserId();
    if (!userId) return false;

    const { error } = await supabase
      .from('napoleon_hill_projects')
      .delete()
      .eq('id', projectId)
      .eq('user_id', userId);

    if (error) {
      console.error('Error deleting Napoleon Hill project:', error);
      return false;
    }

    return true;
  }
};
