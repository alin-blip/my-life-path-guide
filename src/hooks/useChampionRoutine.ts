import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/context/AuthContext';
import { format } from 'date-fns';

interface ChampionPerson {
  id: string;
  name: string;
  relationship_type: string;
  position: number;
  is_active: boolean;
}

interface ChampionSettings {
  id: string;
  is_configured: boolean;
  default_autosuggestion: string;
  routine_steps_order: string[];
  active_steps: string[];
}

interface ChampionLog {
  id: string;
  date: string;
  water_drunk: boolean;
  light_exposure: boolean;
  breathing_completed: boolean;
  meditation_duration_seconds: number;
  gratitude_items: string[];
  autosuggestion_text: string | null;
  autosuggestion_completed: boolean;
  visualization_completed: boolean;
  reading_completed: boolean;
  journaling_completed: boolean;
  exercise_completed: boolean;
  priorities: string[];
  relationship_actions: { person_id: string; action: string; completed: boolean }[];
}

const DEFAULT_AUTOSUGGESTION = 'Every day, in every way, I am getting better and better.';

export function useChampionRoutine() {
  const { user } = useAuth();
  const [people, setPeople] = useState<ChampionPerson[]>([]);
  const [settings, setSettings] = useState<ChampionSettings | null>(null);
  const [todayLog, setTodayLog] = useState<ChampionLog | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const today = format(new Date(), 'yyyy-MM-dd');

  const fetchData = useCallback(async () => {
    if (!user) return;
    setIsLoading(true);

    try {
      // Fetch people
      const { data: peopleData } = await supabase
        .from('champion_routine_people')
        .select('*')
        .eq('user_id', user.id)
        .eq('is_active', true)
        .order('position');
      
      setPeople(peopleData || []);

      // Fetch settings
      const { data: settingsData } = await supabase
        .from('champion_routine_settings')
        .select('*')
        .eq('user_id', user.id)
        .single();
      
      if (settingsData) {
        setSettings({
          ...settingsData,
          routine_steps_order: settingsData.routine_steps_order as string[] || [],
          active_steps: settingsData.active_steps as string[] || []
        });
      }

      // Fetch or create today's log
      const { data: logData } = await supabase
        .from('champion_routine_logs')
        .select('*')
        .eq('user_id', user.id)
        .eq('date', today)
        .single();

      if (logData) {
        setTodayLog({
          ...logData,
          gratitude_items: logData.gratitude_items as string[] || [],
          priorities: logData.priorities as string[] || [],
          relationship_actions: logData.relationship_actions as { person_id: string; action: string; completed: boolean }[] || []
        });
      } else {
        // Create new log for today
        const { data: newLog } = await supabase
          .from('champion_routine_logs')
          .insert({
            user_id: user.id,
            date: today,
            autosuggestion_text: settingsData?.default_autosuggestion || DEFAULT_AUTOSUGGESTION
          })
          .select()
          .single();

        if (newLog) {
          setTodayLog({
            ...newLog,
            gratitude_items: [],
            priorities: [],
            relationship_actions: []
          });
        }
      }
    } catch (error) {
      console.error('Error fetching champion routine data:', error);
    } finally {
      setIsLoading(false);
    }
  }, [user, today]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const updateLog = async (field: keyof ChampionLog, value: any) => {
    if (!user || !todayLog) return;

    try {
      const { error } = await supabase
        .from('champion_routine_logs')
        .update({ [field]: value })
        .eq('id', todayLog.id);

      if (!error) {
        setTodayLog(prev => prev ? { ...prev, [field]: value } : null);
      }
    } catch (error) {
      console.error('Error updating log:', error);
    }
  };

  const addPerson = async (name: string, relationshipType: string) => {
    if (!user) return;

    const position = people.length;
    const { data, error } = await supabase
      .from('champion_routine_people')
      .insert({
        user_id: user.id,
        name,
        relationship_type: relationshipType,
        position
      })
      .select()
      .single();

    if (!error && data) {
      setPeople(prev => [...prev, data]);
    }
    return { data, error };
  };

  const updatePerson = async (id: string, updates: Partial<ChampionPerson>) => {
    const { error } = await supabase
      .from('champion_routine_people')
      .update(updates)
      .eq('id', id);

    if (!error) {
      setPeople(prev => prev.map(p => p.id === id ? { ...p, ...updates } : p));
    }
    return { error };
  };

  const removePerson = async (id: string) => {
    const { error } = await supabase
      .from('champion_routine_people')
      .update({ is_active: false })
      .eq('id', id);

    if (!error) {
      setPeople(prev => prev.filter(p => p.id !== id));
    }
    return { error };
  };

  const saveSettings = async (newSettings: Partial<ChampionSettings>) => {
    if (!user) return;

    const { data, error } = await supabase
      .from('champion_routine_settings')
      .upsert({
        user_id: user.id,
        ...newSettings,
        is_configured: true
      })
      .select()
      .single();

    if (!error && data) {
      setSettings({
        ...data,
        routine_steps_order: data.routine_steps_order as string[] || [],
        active_steps: data.active_steps as string[] || []
      });
    }
    return { data, error };
  };

  const updateAutosuggestion = async (text: string) => {
    if (!user) return;
    
    // Update settings
    await saveSettings({ default_autosuggestion: text });
    
    // Update today's log
    if (todayLog) {
      await updateLog('autosuggestion_text', text);
    }
  };

  return {
    people,
    settings,
    todayLog,
    isLoading,
    isConfigured: settings?.is_configured ?? false,
    autosuggestion: todayLog?.autosuggestion_text || settings?.default_autosuggestion || DEFAULT_AUTOSUGGESTION,
    updateLog,
    addPerson,
    updatePerson,
    removePerson,
    saveSettings,
    updateAutosuggestion,
    refetch: fetchData
  };
}
