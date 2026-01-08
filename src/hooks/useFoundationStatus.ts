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
  const [hasWeeklyPlanning, setHasWeeklyPlanning] = useState(false);
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

      // Build week key in the door-week format
      const doorWeekKey = `door-week-${getYear(today)}-${getISOWeek(today).toString().padStart(2, '0')}`;

      // Fetch all data in parallel
      const [
        annualMissionsResult,
        quarterlyMissionsResult,
        monthlyMissionsResult,
        todayTasksResult,
        weeklyPlanningResult,
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
        
        // 4. Today's tasks (Domino Door) - check multiple week_key formats
        supabase
          .from('user_tasks')
          .select('id')
          .eq('user_id', userId)
          .or(`week_key.eq.${weekKey},week_key.eq.${doorWeekKey}`)
          .or(`day_of_week.eq.${todayDayName},day.eq.${todayStr}`)
          .limit(1),
        
        // 5. Weekly planning (check if user has done AI planning this week)
        supabase
          .from('weekly_planning')
          .select('id, key_points')
          .eq('user_id', userId)
          .or(`week_key.eq.${weekKey},week_key.eq.${doorWeekKey}`)
          .limit(1),
        
        // 6. Champion routine today - check if at least one action was completed
        supabase
          .from('champion_routine_logs')
          .select('id, breathing_completed, meditation_duration_seconds, visualization_completed, reading_completed, autosuggestion_completed, exercise_completed, journaling_completed, gratitude_items')
          .eq('user_id', userId)
          .eq('date', todayStr)
          .limit(1),
        
        // 7. Vision Board - get ALL records to consolidate
        supabase
          .from('vision_boards')
          .select('body_image_url, being_image_url, balance_image_url, business_image_url')
          .eq('user_id', userId)
          .order('created_at', { ascending: false })
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

      // Process weekly planning (has key_points with content)
      const weeklyPlanData = weeklyPlanningResult.data?.[0];
      const hasKeyPoints = weeklyPlanData?.key_points && 
        Array.isArray(weeklyPlanData.key_points) && 
        (weeklyPlanData.key_points as any[]).length > 0;
      setHasWeeklyPlanning(hasKeyPoints || false);

      // Process routine - check if at least one action was completed
      const routineLog = routineResult.data?.[0];
      const hasCompletedRoutineAction = routineLog && (
        routineLog.breathing_completed ||
        (routineLog.meditation_duration_seconds && routineLog.meditation_duration_seconds > 0) ||
        routineLog.visualization_completed ||
        routineLog.reading_completed ||
        routineLog.autosuggestion_completed ||
        routineLog.exercise_completed ||
        routineLog.journaling_completed ||
        (routineLog.gratitude_items && Array.isArray(routineLog.gratitude_items) && (routineLog.gratitude_items as any[]).length > 0)
      );
      setHasStartedRoutineToday(hasCompletedRoutineAction || false);

      // Process vision board - consolidate from all records
      const visionRecords = visionBoardResult.data || [];
      const visionCategories: GoalCategory[] = [];
      
      // Check across all records for any existing images
      const hasBody = visionRecords.some(r => r.body_image_url);
      const hasBeing = visionRecords.some(r => r.being_image_url);
      const hasBalance = visionRecords.some(r => r.balance_image_url);
      const hasBusiness = visionRecords.some(r => r.business_image_url);
      
      if (hasBody) visionCategories.push('body');
      if (hasBeing) visionCategories.push('being');
      if (hasBalance) visionCategories.push('balance');
      if (hasBusiness) visionCategories.push('business');
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

    // Only show Domino Door notification if no tasks AND no weekly planning done
    if (!hasTodayTasks && !hasWeeklyPlanning) {
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
  }, [hasAllAnnualCategories, missingAnnualCategories, hasQuarterly, hasMonthly, hasVisionBoard, hasTodayTasks, hasWeeklyPlanning, hasStartedRoutineToday]);

  // Calculate completion - count hasTodayTasks OR hasWeeklyPlanning as done
  const totalItems = 6; // annual, quarterly, monthly, vision, tasks/planning, routine
  const completedItems = [
    hasAllAnnualCategories,
    hasQuarterly,
    hasMonthly,
    hasVisionBoard,
    hasTodayTasks || hasWeeklyPlanning, // Either tasks or weekly planning counts
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
