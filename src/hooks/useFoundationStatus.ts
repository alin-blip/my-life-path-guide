import { useState, useEffect, useMemo } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { format, getISOWeek, getYear, startOfWeek, addDays } from 'date-fns';

export type FoundationItemType = 'annual' | 'quarterly' | 'monthly' | 'tasks' | 'routine' | 'vision';
export type GoalCategory = 'body' | 'being' | 'balance' | 'business';

export interface FoundationItem {
  id: string;
  type: FoundationItemType;
  message: { en: string; ro: string };
  action: { 
    label: { en: string; ro: string }; 
    route?: string; 
    callback?: () => void;
  };
  priority: number;
  details?: { en: string; ro: string };
}

export interface FoundationStatus {
  // Obiective
  hasAllAnnualCategories: boolean;
  missingAnnualCategories: GoalCategory[];
  hasQuarterly: boolean;
  hasMonthly: boolean;
  
  // Daily
  hasTodayTasks: boolean;
  hasStartedRoutineToday: boolean;
  
  // Vision
  hasVisionBoard: boolean;
  visionBoardMissingCategories: GoalCategory[];
  
  // Overall
  isFoundationComplete: boolean;
  completionPercentage: number;
  pendingItems: FoundationItem[];
  
  // Loading
  isLoading: boolean;
  
  // Refresh function
  refresh: () => Promise<void>;
}

const ALL_CATEGORIES: GoalCategory[] = ['body', 'being', 'balance', 'business'];

export const useFoundationStatus = (): FoundationStatus => {
  const [isLoading, setIsLoading] = useState(true);
  const [annualCategories, setAnnualCategories] = useState<GoalCategory[]>([]);
  const [hasQuarterly, setHasQuarterly] = useState(false);
  const [hasMonthly, setHasMonthly] = useState(false);
  const [hasTodayTasks, setHasTodayTasks] = useState(false);
  const [hasStartedRoutineToday, setHasStartedRoutineToday] = useState(false);
  const [visionBoardCategories, setVisionBoardCategories] = useState<GoalCategory[]>([]);

  const fetchFoundationStatus = async () => {
    setIsLoading(true);
    
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) {
        setIsLoading(false);
        return;
      }

      const userId = session.user.id;
      const today = new Date();
      const todayStr = format(today, 'yyyy-MM-dd');
      const weekKey = `${getYear(today)}-W${getISOWeek(today).toString().padStart(2, '0')}`;
      const dayNames = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
      const todayDayName = dayNames[today.getDay()];

      // Fetch all data in parallel
      const [
        annualMissionsResult,
        quarterlyMissionsResult,
        monthlyMissionsResult,
        todayTasksResult,
        routineResult,
        visionBoardResult
      ] = await Promise.all([
        // 1. Annual objectives by category
        supabase
          .from('missions')
          .select('category')
          .eq('user_id', userId)
          .eq('mission_type', 'annual'),
        
        // 2. Quarterly objectives
        supabase
          .from('missions')
          .select('id')
          .eq('user_id', userId)
          .eq('mission_type', 'quarterly')
          .limit(1),
        
        // 3. Monthly objectives
        supabase
          .from('missions')
          .select('id')
          .eq('user_id', userId)
          .eq('mission_type', 'monthly')
          .limit(1),
        
        // 4. Today's tasks (Domino Door)
        supabase
          .from('user_tasks')
          .select('id')
          .eq('user_id', userId)
          .eq('week_key', weekKey)
          .or(`day_of_week.eq.${todayDayName},day.eq.${todayStr}`)
          .limit(1),
        
        // 5. Champion routine today
        supabase
          .from('champion_routine_logs')
          .select('id')
          .eq('user_id', userId)
          .eq('date', todayStr)
          .limit(1),
        
        // 6. Vision Board
        supabase
          .from('vision_boards')
          .select('body_image_url, being_image_url, balance_image_url, business_image_url')
          .eq('user_id', userId)
          .order('created_at', { ascending: false })
          .limit(1)
          .maybeSingle()
      ]);

      // Process annual categories
      const foundAnnualCategories = (annualMissionsResult.data || [])
        .map(m => m.category as GoalCategory)
        .filter((c, i, arr) => arr.indexOf(c) === i);
      setAnnualCategories(foundAnnualCategories);

      // Process quarterly
      setHasQuarterly((quarterlyMissionsResult.data?.length || 0) > 0);

      // Process monthly
      setHasMonthly((monthlyMissionsResult.data?.length || 0) > 0);

      // Process today tasks
      setHasTodayTasks((todayTasksResult.data?.length || 0) > 0);

      // Process routine
      setHasStartedRoutineToday((routineResult.data?.length || 0) > 0);

      // Process vision board
      const vb = visionBoardResult.data;
      const visionCategories: GoalCategory[] = [];
      if (vb?.body_image_url) visionCategories.push('body');
      if (vb?.being_image_url) visionCategories.push('being');
      if (vb?.balance_image_url) visionCategories.push('balance');
      if (vb?.business_image_url) visionCategories.push('business');
      setVisionBoardCategories(visionCategories);

    } catch (error) {
      console.error('Error fetching foundation status:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchFoundationStatus();
  }, []);

  // Computed values
  const missingAnnualCategories = useMemo(() => 
    ALL_CATEGORIES.filter(c => !annualCategories.includes(c)),
    [annualCategories]
  );

  const hasAllAnnualCategories = missingAnnualCategories.length === 0;

  const visionBoardMissingCategories = useMemo(() =>
    ALL_CATEGORIES.filter(c => !visionBoardCategories.includes(c)),
    [visionBoardCategories]
  );

  const hasVisionBoard = visionBoardMissingCategories.length === 0;

  // Build pending items
  const pendingItems = useMemo(() => {
    const items: FoundationItem[] = [];

    if (!hasAllAnnualCategories) {
      const categoryLabels: Record<GoalCategory, { en: string; ro: string }> = {
        body: { en: 'Body', ro: 'Corp' },
        being: { en: 'Spirituality', ro: 'Spiritualitate' },
        balance: { en: 'Relationships', ro: 'Relații' },
        business: { en: 'Business', ro: 'Business' }
      };
      const missing = missingAnnualCategories.map(c => categoryLabels[c]);
      
      items.push({
        id: 'annual',
        type: 'annual',
        message: {
          en: 'Complete your annual objectives',
          ro: 'Completează obiectivele anuale'
        },
        details: {
          en: `Missing: ${missing.map(m => m.en).join(', ')}`,
          ro: `Lipsește: ${missing.map(m => m.ro).join(', ')}`
        },
        action: {
          label: { en: 'Complete', ro: 'Completează' },
          route: '/door?tab=annual'
        },
        priority: 1
      });
    }

    if (!hasQuarterly) {
      items.push({
        id: 'quarterly',
        type: 'quarterly',
        message: {
          en: 'Set your 90-day objectives',
          ro: 'Setează obiectivele pentru 90 de zile'
        },
        action: {
          label: { en: 'Set objectives', ro: 'Setează' },
          route: '/door?tab=quarterly'
        },
        priority: 2
      });
    }

    if (!hasMonthly) {
      items.push({
        id: 'monthly',
        type: 'monthly',
        message: {
          en: 'Define your monthly focus',
          ro: 'Definește focusul pentru luna aceasta'
        },
        action: {
          label: { en: 'Define', ro: 'Definește' },
          route: '/door?tab=monthly'
        },
        priority: 3
      });
    }

    if (!hasVisionBoard) {
      items.push({
        id: 'vision',
        type: 'vision',
        message: {
          en: 'Generate your Vision Board',
          ro: 'Generează Vision Board-ul'
        },
        action: {
          label: { en: 'Generate', ro: 'Generează' },
          route: '/dashboard'
        },
        priority: 4
      });
    }

    if (!hasTodayTasks) {
      items.push({
        id: 'tasks',
        type: 'tasks',
        message: {
          en: 'No tasks set for today in Domino Door',
          ro: 'Nu ai task-uri pentru astăzi în Domino Door'
        },
        action: {
          label: { en: 'Plan tasks', ro: 'Planifică' },
          route: '/door'
        },
        priority: 5
      });
    }

    if (!hasStartedRoutineToday) {
      items.push({
        id: 'routine',
        type: 'routine',
        message: {
          en: 'Start your Champion Routine',
          ro: 'Începe Rutina de Campion'
        },
        action: {
          label: { en: 'Start', ro: 'Începe' },
          route: '/dashboard'
        },
        priority: 6
      });
    }

    return items.sort((a, b) => a.priority - b.priority);
  }, [hasAllAnnualCategories, missingAnnualCategories, hasQuarterly, hasMonthly, hasVisionBoard, hasTodayTasks, hasStartedRoutineToday]);

  // Calculate completion
  const totalItems = 6; // annual, quarterly, monthly, vision, tasks, routine
  const completedItems = [
    hasAllAnnualCategories,
    hasQuarterly,
    hasMonthly,
    hasVisionBoard,
    hasTodayTasks,
    hasStartedRoutineToday
  ].filter(Boolean).length;

  const completionPercentage = Math.round((completedItems / totalItems) * 100);
  const isFoundationComplete = pendingItems.length === 0;

  return {
    hasAllAnnualCategories,
    missingAnnualCategories,
    hasQuarterly,
    hasMonthly,
    hasTodayTasks,
    hasStartedRoutineToday,
    hasVisionBoard,
    visionBoardMissingCategories,
    isFoundationComplete,
    completionPercentage,
    pendingItems,
    isLoading,
    refresh: fetchFoundationStatus
  };
};
