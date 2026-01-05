import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { DashboardWidget, DashboardWidgetsConfig } from '@/types/dashboardWidget';
import { DEFAULT_WIDGETS } from '@/config/dashboardWidgets';
import { Json } from '@/integrations/supabase/types';
import type { CustomWidget, WidgetConfig } from '@/types/customWidget';

export const useDashboardWidgets = () => {
  const [widgets, setWidgets] = useState<DashboardWidget[]>(DEFAULT_WIDGETS);
  const [customWidgets, setCustomWidgets] = useState<CustomWidget[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchWidgets = useCallback(async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setLoading(false);
        return;
      }

      // Fetch dashboard widget preferences
      const { data, error } = await supabase
        .from('user_preferences')
        .select('dashboard_widgets')
        .eq('user_id', user.id)
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('Error fetching widgets:', error);
      }

      if (data?.dashboard_widgets) {
        const config = data.dashboard_widgets as unknown as DashboardWidgetsConfig;
        if (config.widgets && Array.isArray(config.widgets)) {
          // Filter out champion-routine as it's displayed separately now
          const filteredWidgets = config.widgets.filter(w => w.id !== 'champion-routine');
          setWidgets(filteredWidgets);
        }
      }

      // Fetch custom widgets that are active (shown on dashboard)
      const { data: customData, error: customError } = await supabase
        .from('custom_widgets')
        .select('*')
        .eq('user_id', user.id)
        .eq('is_active', true)
        .order('order_index');

      if (customError) {
        console.error('Error fetching custom widgets:', customError);
      } else if (customData) {
        const parsedCustomWidgets = customData.map(w => ({
          ...w,
          config: w.config as unknown as WidgetConfig,
        })) as CustomWidget[];
        setCustomWidgets(parsedCustomWidgets);
      }
    } catch (error) {
      console.error('Error fetching widgets:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchWidgets();
  }, [fetchWidgets]);

  const saveWidgets = async (newWidgets: DashboardWidget[]) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const config: DashboardWidgetsConfig = { widgets: newWidgets };

      // First check if user preferences exist
      const { data: existing } = await supabase
        .from('user_preferences')
        .select('id')
        .eq('user_id', user.id)
        .single();

      if (existing) {
        // Update existing
        const { error } = await supabase
          .from('user_preferences')
          .update({
            dashboard_widgets: config as unknown as Json,
            updated_at: new Date().toISOString()
          })
          .eq('user_id', user.id);

        if (error) {
          console.error('Error updating widgets:', error);
          return;
        }
      } else {
        // Insert new
        const { error } = await supabase
          .from('user_preferences')
          .insert({
            user_id: user.id,
            dashboard_widgets: config as unknown as Json
          });

        if (error) {
          console.error('Error inserting widgets:', error);
          return;
        }
      }

      setWidgets(newWidgets);
    } catch (error) {
      console.error('Error saving widgets:', error);
    }
  };

  const toggleWidget = async (widgetId: string, enabled: boolean) => {
    const existingWidget = widgets.find(w => w.id === widgetId);
    let newWidgets: DashboardWidget[];

    if (existingWidget) {
      newWidgets = widgets.map(w =>
        w.id === widgetId ? { ...w, enabled } : w
      );
    } else {
      const maxOrder = Math.max(...widgets.map(w => w.order), 0);
      newWidgets = [...widgets, {
        id: widgetId,
        enabled,
        order: maxOrder + 1,
        size: 'medium'
      }];
    }

    await saveWidgets(newWidgets);
  };

  const toggleCustomWidgetOnDashboard = async (widgetId: string, isActive: boolean) => {
    try {
      const { error } = await supabase
        .from('custom_widgets')
        .update({ is_active: isActive })
        .eq('id', widgetId);

      if (error) throw error;
      await fetchWidgets();
    } catch (error) {
      console.error('Error toggling custom widget:', error);
    }
  };

  const reorderWidgets = async (fromIndex: number, toIndex: number) => {
    const enabledWidgets = widgets.filter(w => w.enabled).sort((a, b) => a.order - b.order);
    const [movedWidget] = enabledWidgets.splice(fromIndex, 1);
    enabledWidgets.splice(toIndex, 0, movedWidget);

    const reorderedWidgets = enabledWidgets.map((w, index) => ({
      ...w,
      order: index + 1
    }));

    const disabledWidgets = widgets.filter(w => !w.enabled);
    await saveWidgets([...reorderedWidgets, ...disabledWidgets]);
  };

  const resizeWidget = async (widgetId: string, size: DashboardWidget['size']) => {
    const newWidgets = widgets.map(w =>
      w.id === widgetId ? { ...w, size } : w
    );
    await saveWidgets(newWidgets);
  };

  const getEnabledWidgets = () => {
    return widgets
      .filter(w => w.enabled)
      .sort((a, b) => a.order - b.order);
  };

  const getActiveCustomWidgets = () => {
    return customWidgets.filter(w => w.is_active);
  };

  return {
    widgets,
    customWidgets,
    loading,
    toggleWidget,
    toggleCustomWidgetOnDashboard,
    reorderWidgets,
    resizeWidget,
    getEnabledWidgets,
    getActiveCustomWidgets,
    saveWidgets,
    refetch: fetchWidgets
  };
};
