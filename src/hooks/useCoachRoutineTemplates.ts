import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from './use-toast';

export interface CoachRoutineTemplate {
  id: string;
  coach_id: string;
  tribe_id: string | null;
  name: string;
  description: string | null;
  routine_steps_order: any[] | null;
  active_steps: Record<string, boolean> | null;
  step_configs: Record<string, any> | null;
  is_default: boolean;
  created_at: string;
  updated_at: string;
}

export function useCoachRoutineTemplates(coachId: string | undefined) {
  const { toast } = useToast();
  const [templates, setTemplates] = useState<CoachRoutineTemplate[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchTemplates = useCallback(async () => {
    if (!coachId) return;
    setLoading(true);
    const { data, error } = await supabase
      .from('coach_routine_templates')
      .select('*')
      .eq('coach_id', coachId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching templates:', error);
    } else {
      setTemplates((data as any[]) || []);
    }
    setLoading(false);
  }, [coachId]);

  useEffect(() => {
    fetchTemplates();
  }, [fetchTemplates]);

  const createTemplate = useCallback(async (template: {
    name: string;
    description?: string;
    tribe_id?: string | null;
    routine_steps_order?: any[];
    active_steps?: Record<string, boolean>;
    step_configs?: Record<string, any>;
    is_default?: boolean;
  }) => {
    if (!coachId) return null;

    // If setting as default, unset existing defaults first
    if (template.is_default) {
      await supabase
        .from('coach_routine_templates')
        .update({ is_default: false } as any)
        .eq('coach_id', coachId)
        .eq('is_default', true);
    }

    const { data, error } = await supabase
      .from('coach_routine_templates')
      .insert({
        coach_id: coachId,
        ...template,
      } as any)
      .select()
      .single();

    if (error) {
      console.error('Error creating template:', error);
      toast({ title: 'Error', description: 'Could not create template.', variant: 'destructive' });
      return null;
    }

    toast({ title: 'Success', description: 'Routine template created!' });
    await fetchTemplates();
    return data as CoachRoutineTemplate;
  }, [coachId, toast, fetchTemplates]);

  const updateTemplate = useCallback(async (id: string, updates: Partial<CoachRoutineTemplate>) => {
    if (!coachId) return;

    if (updates.is_default) {
      await supabase
        .from('coach_routine_templates')
        .update({ is_default: false } as any)
        .eq('coach_id', coachId)
        .eq('is_default', true);
    }

    const { error } = await supabase
      .from('coach_routine_templates')
      .update(updates as any)
      .eq('id', id);

    if (error) {
      console.error('Error updating template:', error);
      toast({ title: 'Error', description: 'Could not update template.', variant: 'destructive' });
      return;
    }

    toast({ title: 'Success', description: 'Template updated!' });
    await fetchTemplates();
  }, [coachId, toast, fetchTemplates]);

  const deleteTemplate = useCallback(async (id: string) => {
    const { error } = await supabase
      .from('coach_routine_templates')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting template:', error);
      toast({ title: 'Error', description: 'Could not delete template.', variant: 'destructive' });
      return;
    }

    toast({ title: 'Deleted', description: 'Template removed.' });
    await fetchTemplates();
  }, [toast, fetchTemplates]);

  const applyTemplateToTribe = useCallback(async (templateId: string, tribeId: string) => {
    // Get template
    const template = templates.find(t => t.id === templateId);
    if (!template) return;

    // Get tribe members
    const { data: members, error: membersError } = await supabase
      .from('tribe_members')
      .select('user_id')
      .eq('tribe_id', tribeId);

    if (membersError || !members?.length) {
      toast({ title: 'Error', description: 'No members found in tribe.', variant: 'destructive' });
      return;
    }

    // Apply routine to each member's champion_routine_settings
    let successCount = 0;
    for (const member of members) {
      const updatePayload: any = {
        routine_steps_order: template.routine_steps_order,
        active_steps: template.active_steps,
        step_configs: template.step_configs,
      };

      const { error } = await supabase
        .from('champion_routine_settings')
        .update(updatePayload)
        .eq('user_id', member.user_id);

      if (!error) successCount++;
    }

    toast({
      title: 'Applied!',
      description: `Routine applied to ${successCount}/${members.length} members.`,
    });
  }, [templates, toast]);

  return {
    templates,
    loading,
    createTemplate,
    updateTemplate,
    deleteTemplate,
    applyTemplateToTribe,
    refreshTemplates: fetchTemplates,
  };
}
