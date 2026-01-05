import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/context/AuthContext';
import { toast } from 'sonner';
import type { CustomWidget, WidgetTemplate, WidgetData, WidgetConfig } from '@/types/customWidget';

export function useCustomWidgets() {
  const { user } = useAuth();
  const [widgets, setWidgets] = useState<CustomWidget[]>([]);
  const [templates, setTemplates] = useState<WidgetTemplate[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchWidgets = useCallback(async () => {
    if (!user?.id) return;

    try {
      const { data, error } = await supabase
        .from('custom_widgets')
        .select('*')
        .eq('user_id', user.id)
        .order('order_index');

      if (error) throw error;
      
      // Parse config from JSONB with proper type casting
      const parsedWidgets = (data || []).map(w => ({
        ...w,
        config: w.config as unknown as WidgetConfig,
      })) as CustomWidget[];
      
      setWidgets(parsedWidgets);
    } catch (error) {
      console.error('Error fetching widgets:', error);
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  const fetchTemplates = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('widget_templates')
        .select('*')
        .order('is_official', { ascending: false })
        .order('usage_count', { ascending: false });

      if (error) throw error;
      
      const parsedTemplates = (data || []).map(t => ({
        ...t,
        config: t.config as unknown as WidgetConfig,
      })) as WidgetTemplate[];
      
      setTemplates(parsedTemplates);
    } catch (error) {
      console.error('Error fetching templates:', error);
    }
  }, []);

  useEffect(() => {
    fetchWidgets();
    fetchTemplates();
  }, [fetchWidgets, fetchTemplates]);

  const createWidget = async (name: string, config: WidgetConfig, description?: string): Promise<CustomWidget | null> => {
    if (!user?.id) return null;

    try {
      const maxOrder = Math.max(...widgets.map(w => w.order_index), -1);
      
      // Type assertion for insert
      const insertData = {
        user_id: user.id,
        name,
        description,
        config: config as unknown as Record<string, unknown>,
        order_index: maxOrder + 1,
      };
      
      const { data, error } = await (supabase
        .from('custom_widgets') as any)
        .insert(insertData)
        .select()
        .single();

      if (error) throw error;
      
      await fetchWidgets();
      toast.success('Widget creat cu succes!');
      return { ...data, config: data.config as unknown as WidgetConfig } as CustomWidget;
    } catch (error) {
      console.error('Error creating widget:', error);
      toast.error('Eroare la crearea widget-ului');
      return null;
    }
  };

  const updateWidget = async (widgetId: string, updates: Partial<Omit<CustomWidget, 'config'>> & { config?: WidgetConfig }) => {
    try {
      const dbUpdates: Record<string, unknown> = { ...updates };
      if (updates.config) {
        dbUpdates.config = updates.config as unknown as Record<string, unknown>;
      }
      
      const { error } = await supabase
        .from('custom_widgets')
        .update(dbUpdates as any)
        .eq('id', widgetId);

      if (error) throw error;
      await fetchWidgets();
      toast.success('Widget actualizat!');
    } catch (error) {
      console.error('Error updating widget:', error);
      toast.error('Eroare la actualizare');
    }
  };

  const deleteWidget = async (widgetId: string) => {
    try {
      const { error } = await supabase
        .from('custom_widgets')
        .delete()
        .eq('id', widgetId);

      if (error) throw error;
      await fetchWidgets();
      toast.success('Widget șters!');
    } catch (error) {
      console.error('Error deleting widget:', error);
      toast.error('Eroare la ștergere');
    }
  };

  const toggleWidget = async (widgetId: string, isActive: boolean) => {
    await updateWidget(widgetId, { is_active: isActive });
  };

  const reorderWidgets = async (widgetIds: string[]) => {
    try {
      const updates = widgetIds.map((id, index) => 
        supabase
          .from('custom_widgets')
          .update({ order_index: index })
          .eq('id', id)
      );

      await Promise.all(updates);
      await fetchWidgets();
    } catch (error) {
      console.error('Error reordering widgets:', error);
    }
  };

  // Widget Data Management
  const getWidgetData = async (widgetId: string, date?: string): Promise<WidgetData | null> => {
    if (!user?.id) return null;

    try {
      const targetDate = date || new Date().toISOString().split('T')[0];
      
      const { data, error } = await supabase
        .from('widget_data')
        .select('*')
        .eq('widget_id', widgetId)
        .eq('user_id', user.id)
        .eq('date', targetDate)
        .maybeSingle();

      if (error) throw error;
      if (!data) return null;
      
      return {
        ...data,
        data: data.data as Record<string, unknown>,
      } as WidgetData;
    } catch (error) {
      console.error('Error fetching widget data:', error);
      return null;
    }
  };

  const saveWidgetData = async (widgetId: string, data: Record<string, unknown>, date?: string) => {
    if (!user?.id) return;

    try {
      const targetDate = date || new Date().toISOString().split('T')[0];
      
      const upsertData = {
        widget_id: widgetId,
        user_id: user.id,
        date: targetDate,
        data: data as unknown as Record<string, unknown>,
      };
      
      const { error } = await (supabase
        .from('widget_data') as any)
        .upsert(upsertData, {
          onConflict: 'widget_id,user_id,date',
        });

      if (error) throw error;
    } catch (error) {
      console.error('Error saving widget data:', error);
      toast.error('Eroare la salvare date');
    }
  };

  const getWidgetHistory = async (widgetId: string, days: number = 30): Promise<WidgetData[]> => {
    if (!user?.id) return [];

    try {
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - days);
      
      const { data, error } = await supabase
        .from('widget_data')
        .select('*')
        .eq('widget_id', widgetId)
        .eq('user_id', user.id)
        .gte('date', startDate.toISOString().split('T')[0])
        .order('date', { ascending: true });

      if (error) throw error;
      
      return (data || []).map(d => ({
        ...d,
        data: d.data as Record<string, unknown>,
      })) as WidgetData[];
    } catch (error) {
      console.error('Error fetching widget history:', error);
      return [];
    }
  };

  // Template Management
  const createTemplate = async (widget: CustomWidget, category?: string): Promise<WidgetTemplate | null> => {
    if (!user?.id) return null;

    try {
      const insertData = {
        name: widget.name,
        description: widget.description,
        config: widget.config as unknown as Record<string, unknown>,
        category,
        icon: widget.config.icon,
        creator_user_id: user.id,
      };
      
      const { data, error } = await (supabase
        .from('widget_templates') as any)
        .insert(insertData)
        .select()
        .single();

      if (error) throw error;
      
      await fetchTemplates();
      toast.success('Template creat!');
      return { ...data, config: data.config as unknown as WidgetConfig } as WidgetTemplate;
    } catch (error) {
      console.error('Error creating template:', error);
      toast.error('Eroare la crearea template-ului');
      return null;
    }
  };

  const applyTemplate = async (template: WidgetTemplate): Promise<CustomWidget | null> => {
    if (!user?.id) return null;

    try {
      const result = await createWidget(template.name, template.config, template.description);
      
      // Increment usage count
      await supabase
        .from('widget_templates')
        .update({ usage_count: (template.usage_count || 0) + 1 })
        .eq('id', template.id);

      await fetchTemplates();
      return result;
    } catch (error) {
      console.error('Error applying template:', error);
      return null;
    }
  };

  const getActiveWidgets = () => widgets.filter(w => w.is_active);

  return {
    widgets,
    templates,
    loading,
    createWidget,
    updateWidget,
    deleteWidget,
    toggleWidget,
    reorderWidgets,
    getWidgetData,
    saveWidgetData,
    getWidgetHistory,
    createTemplate,
    applyTemplate,
    getActiveWidgets,
    refetch: fetchWidgets,
  };
}
