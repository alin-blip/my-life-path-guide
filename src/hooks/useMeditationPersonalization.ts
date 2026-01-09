import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { format } from 'date-fns';
import { MeditationTemplate } from '@/components/meditation/templates/meditationTemplates';

interface PersonalizationData {
  visionBoard: {
    body?: string;
    being?: string;
    balance?: string;
    business?: string;
  };
  bigOne?: string;
  tasks: string[];
  habits: string[];
  relationships: string[];
  missions: {
    body?: string;
    being?: string;
    balance?: string;
    business?: string;
  };
}

export function useMeditationPersonalization() {
  const [isLoading, setIsLoading] = useState(false);
  
  const loadPersonalizationData = useCallback(async (template: MeditationTemplate): Promise<PersonalizationData> => {
    setIsLoading(true);
    
    const data: PersonalizationData = {
      visionBoard: {},
      tasks: [],
      habits: [],
      relationships: [],
      missions: {}
    };
    
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return data;
      
      const today = format(new Date(), 'yyyy-MM-dd');
      const sources = template.dataSources;
      
      // Load Vision Board objectives
      if (sources.includes('visionBoard')) {
        const { data: missions } = await supabase
          .from('missions')
          .select('category, title, measurable_result')
          .eq('user_id', user.id)
          .eq('mission_type', 'annual')
          .eq('completed', false);
        
        if (missions) {
          missions.forEach(m => {
            const text = m.title || m.measurable_result || '';
            if (m.category === 'body') data.visionBoard.body = text;
            if (m.category === 'being') data.visionBoard.being = text;
            if (m.category === 'balance') data.visionBoard.balance = text;
            if (m.category === 'business') data.visionBoard.business = text;
          });
        }
      }
      
      // Load Big One Today
      if (sources.includes('bigOne')) {
        const { data: routineLog } = await supabase
          .from('champion_routine_logs')
          .select('big_one_today')
          .eq('user_id', user.id)
          .eq('date', today)
          .maybeSingle();
        
        if (routineLog?.big_one_today) {
          data.bigOne = routineLog.big_one_today;
        }
      }
      
      // Load Today's Tasks
      if (sources.includes('tasks')) {
        const dayOfWeek = format(new Date(), 'EEEE').substring(0, 2);
        const { data: tasks } = await supabase
          .from('hot_list_items')
          .select('title')
          .eq('user_id', user.id)
          .eq('day_of_week', dayOfWeek)
          .eq('completed', false)
          .limit(5);
        
        if (tasks) {
          data.tasks = tasks.map(t => t.title);
        }
      }
      
      // Load Active Habits
      if (sources.includes('habits')) {
        const { data: habits } = await supabase
          .from('daily_habits')
          .select('name')
          .eq('user_id', user.id)
          .eq('is_active', true)
          .limit(5);
        
        if (habits) {
          data.habits = habits.map(h => h.name);
        }
      }
      
      // Load Relationships
      if (sources.includes('relationships')) {
        const { data: people } = await supabase
          .from('champion_routine_people')
          .select('name, relationship_type')
          .eq('user_id', user.id)
          .eq('is_active', true)
          .limit(5);
        
        if (people) {
          data.relationships = people.map(p => `${p.name} (${p.relationship_type})`);
        }
      }
      
      // Load Missions for specific categories
      if (sources.includes('missions')) {
        const { data: missions } = await supabase
          .from('missions')
          .select('category, title, measurable_result')
          .eq('user_id', user.id)
          .in('mission_type', ['annual', 'monthly'])
          .eq('completed', false);
        
        if (missions) {
          missions.forEach(m => {
            const text = m.title || m.measurable_result || '';
            if (m.category === 'body' && !data.missions.body) data.missions.body = text;
            if (m.category === 'being' && !data.missions.being) data.missions.being = text;
            if (m.category === 'balance' && !data.missions.balance) data.missions.balance = text;
            if (m.category === 'business' && !data.missions.business) data.missions.business = text;
          });
        }
      }
      
    } catch (error) {
      console.error('Error loading personalization data:', error);
    } finally {
      setIsLoading(false);
    }
    
    return data;
  }, []);
  
  const buildPromptContext = useCallback((template: MeditationTemplate, data: PersonalizationData): string => {
    const parts: string[] = [];
    
    // Vision Board objectives
    if (data.visionBoard.body) parts.push(`Obiectiv Corp: ${data.visionBoard.body}`);
    if (data.visionBoard.being) parts.push(`Obiectiv Suflet: ${data.visionBoard.being}`);
    if (data.visionBoard.balance) parts.push(`Obiectiv Relații: ${data.visionBoard.balance}`);
    if (data.visionBoard.business) parts.push(`Obiectiv Business: ${data.visionBoard.business}`);
    
    // Big One
    if (data.bigOne) parts.push(`Prioritatea #1 de azi: ${data.bigOne}`);
    
    // Tasks
    if (data.tasks.length > 0) parts.push(`Task-uri importante: ${data.tasks.join(', ')}`);
    
    // Habits
    if (data.habits.length > 0) parts.push(`Obiceiuri zilnice: ${data.habits.join(', ')}`);
    
    // Relationships
    if (data.relationships.length > 0) parts.push(`Oameni importanți: ${data.relationships.join(', ')}`);
    
    // Missions
    if (data.missions.body) parts.push(`Misiune sănătate: ${data.missions.body}`);
    if (data.missions.business) parts.push(`Misiune business: ${data.missions.business}`);
    
    return parts.join('\n');
  }, []);
  
  return {
    isLoading,
    loadPersonalizationData,
    buildPromptContext
  };
}
