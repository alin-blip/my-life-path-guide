import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/context/AuthContext';
import { format } from 'date-fns';
import { Json } from '@/integrations/supabase/types';

export interface ChampionPerson {
  id: string;
  name: string;
  relationship_type: string;
  position: number;
  is_active: boolean;
}

export interface ChampionSettings {
  id: string;
  is_configured: boolean;
  default_autosuggestion: string;
  routine_steps_order: string[];
  active_steps: string[];
  habit_steps?: string[];
  include_daily_tasks?: boolean;
  step_configs?: Record<string, any>;
}

export interface Meal {
  id: string;
  name?: string;
  type?: 'breakfast' | 'lunch' | 'dinner' | 'snack';
  description?: string;
  calories: number;
  protein: number;
  carbs?: number;
  fats?: number;
  time?: string;
}

export interface Todo {
  id: string;
  text: string;
  completed: boolean;
}

export interface ChampionLog {
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
  // New fields for Execution Room
  meals_logged: Meal[];
  total_calories: number;
  total_protein: number;
  content_script: string | null;
  content_topic: string | null;
  pomodoro_sessions: number;
  big_one_today: string | null;
  daily_todos: Todo[];
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
          active_steps: settingsData.active_steps as string[] || [],
          habit_steps: settingsData.habit_steps as string[] || [],
          include_daily_tasks: settingsData.include_daily_tasks ?? true,
          step_configs: settingsData.step_configs as Record<string, any> || {}
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
          relationship_actions: logData.relationship_actions as { person_id: string; action: string; completed: boolean }[] || [],
          meals_logged: (logData.meals_logged as unknown as Meal[]) || [],
          total_calories: logData.total_calories || 0,
          total_protein: logData.total_protein || 0,
          content_script: logData.content_script || null,
          content_topic: logData.content_topic || null,
          pomodoro_sessions: logData.pomodoro_sessions || 0,
          big_one_today: logData.big_one_today || null,
          daily_todos: (logData.daily_todos as unknown as Todo[]) || [],
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
            relationship_actions: [],
            meals_logged: [],
            total_calories: 0,
            total_protein: 0,
            content_script: null,
            content_topic: null,
            pomodoro_sessions: 0,
            big_one_today: null,
            daily_todos: [],
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

  const updateMeals = async (meals: Meal[], calories: number, protein: number) => {
    if (!user || !todayLog) return;

    try {
      const { error } = await supabase
        .from('champion_routine_logs')
        .update({ 
          meals_logged: meals as unknown as Json,
          total_calories: calories,
          total_protein: protein
        })
        .eq('id', todayLog.id);

      if (!error) {
        setTodayLog(prev => prev ? { 
          ...prev, 
          meals_logged: meals,
          total_calories: calories,
          total_protein: protein
        } : null);
      }
    } catch (error) {
      console.error('Error updating meals:', error);
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
        active_steps: data.active_steps as string[] || [],
        habit_steps: data.habit_steps as string[] || [],
        include_daily_tasks: data.include_daily_tasks ?? true,
        step_configs: data.step_configs as Record<string, any> || {}
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
    updateMeals,
    addPerson,
    updatePerson,
    removePerson,
    saveSettings,
    updateAutosuggestion,
    refetch: fetchData
  };
}
