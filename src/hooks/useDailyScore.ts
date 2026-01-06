import { useState, useEffect, useCallback, useMemo } from 'react';
import { useProgress } from '@/context/ProgressContext';
import { useDoorContent } from '@/hooks/useDoorContent';
import { supabase } from '@/integrations/supabase/client';

interface BigOne {
  text: string | null;
  completed: boolean;
  id?: string;
}

interface NextAction {
  type: 'routine' | 'bigone-set' | 'bigone-complete' | 'core' | 'biz' | 'tasks' | 'reading' | 'complete';
  title: string;
  route?: string;
  priority: number;
}

interface ProgressSection {
  routine: { done: boolean; score: number };
  core: { completed: number; total: number; score: number };
  biz: { completed: number; total: number; score: number };
  bigOne: { set: boolean; completed: boolean; score: number };
  tasks: { completed: number; total: number; score: number };
  reading: { done: boolean; score: number };
}

export interface DailyScoreData {
  totalScore: number;
  bigOne: BigOne;
  nextAction: NextAction;
  progress: ProgressSection;
  streak: number;
  xpLevel: number;
  greeting: string;
}

const getGreeting = (): string => {
  const hour = new Date().getHours();
  if (hour < 12) return 'Bună dimineața';
  if (hour < 18) return 'Bună ziua';
  return 'Bună seara';
};

export const useDailyScore = () => {
  const { coreData, dailyFourData, selectedDay, getCoreScore, getDailyFourScore } = useProgress();
  const { hitList, activeDay } = useDoorContent();
  
  const [routineCompleted, setRoutineCompleted] = useState(false);
  const [readingCompleted, setReadingCompleted] = useState(false);
  const [bigOne, setBigOne] = useState<BigOne>({ text: null, completed: false });
  const [streak, setStreak] = useState(0);
  const [xpLevel, setXpLevel] = useState(1);
  const [loading, setLoading] = useState(true);

  // Fetch additional data
  useEffect(() => {
    const fetchData = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session?.user) {
          setLoading(false);
          return;
        }

        const today = new Date().toISOString().split('T')[0];
        const userId = session.user.id;

        // Fetch Champion Routine status
        const { data: routineData } = await supabase
          .from('champion_routine_logs')
          .select('*')
          .eq('user_id', userId)
          .eq('date', today)
          .maybeSingle();

        if (routineData) {
          // Count completed routine steps
          let completedSteps = 0;
          const totalSteps = 10;
          
          if (routineData.water_drunk) completedSteps++;
          if (routineData.breathing_completed) completedSteps++;
          if ((routineData.meditation_duration_seconds || 0) >= 600) completedSteps++;
          
          // Handle gratitude_items as Json type
          const gratitudeItems = routineData.gratitude_items as string[] | null;
          if (Array.isArray(gratitudeItems) && gratitudeItems.some((i: string) => i?.trim())) completedSteps++;
          
          if (routineData.autosuggestion_completed) completedSteps++;
          if (routineData.visualization_completed) completedSteps++;
          if (routineData.exercise_completed) completedSteps++;
          
          // Handle meals_logged as Json type
          const mealsLogged = routineData.meals_logged as any[] | null;
          if (Array.isArray(mealsLogged) && mealsLogged.length > 0) completedSteps++;
          
          if (routineData.content_script || (routineData.pomodoro_sessions || 0) > 0) completedSteps++;
          
          // Handle relationship_actions as Json type
          const relationshipActions = routineData.relationship_actions as any[] | null;
          if (Array.isArray(relationshipActions) && relationshipActions.some((a: any) => a?.completed)) completedSteps++;
          
          // Consider routine complete if at least 70% of steps are done
          const routineComplete = completedSteps >= Math.floor(totalSteps * 0.7);
          setRoutineCompleted(routineComplete);
        }

        // Fetch Big One for today
        const { data: bigOneData } = await supabase
          .from('user_tasks')
          .select('*')
          .eq('user_id', userId)
          .eq('is_key_point', true)
          .eq('day', today)
          .maybeSingle();

        if (bigOneData) {
          setBigOne({
            text: bigOneData.title,
            completed: bigOneData.completed || false,
            id: bigOneData.id
          });
        }

        // Fetch reading progress for today
        const { data: readingData } = await supabase
          .from('book_reading_progress')
          .select('*')
          .eq('user_id', userId)
          .eq('read_at', today)
          .maybeSingle();

        setReadingCompleted(!!readingData);

        // Fetch streak and XP
        const { data: xpData } = await supabase
          .from('user_xp')
          .select('current_level, total_xp')
          .eq('user_id', userId)
          .maybeSingle();

        if (xpData) {
          setXpLevel(xpData.current_level);
        }

        const { data: statsData } = await supabase
          .from('user_statistics')
          .select('current_streak')
          .eq('user_id', userId)
          .maybeSingle();

        if (statsData) {
          setStreak(statsData.current_streak || 0);
        }

        setLoading(false);
      } catch (error) {
        console.error('Error fetching daily score data:', error);
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Calculate Core 4 progress for today
  const coreProgress = useMemo(() => {
    const dayData = coreData[selectedDay] || {};
    const completed = Object.values(dayData).filter(Boolean).length;
    return { completed, total: 8 };
  }, [coreData, selectedDay]);

  // Calculate Biz 4 progress for today
  const bizProgress = useMemo(() => {
    const dayData = dailyFourData[selectedDay]?.dailyActivities || [];
    const completed = dayData.filter(a => a.completed).length;
    return { completed, total: 4 };
  }, [dailyFourData, selectedDay]);

  // Calculate tasks progress
  const tasksProgress = useMemo(() => {
    const todayTasks = hitList.filter(item => item.day === activeDay);
    const completed = todayTasks.filter(item => item.completed).length;
    return { completed, total: todayTasks.length };
  }, [hitList, activeDay]);

  // Calculate total score (0-100)
  const calculateScore = useCallback((): ProgressSection => {
    // Champion Routine: 25 points
    const routineScore = routineCompleted ? 25 : 0;

    // Core 4: 20 points (2.5 per activity)
    const coreScore = Math.min((coreProgress.completed / 8) * 20, 20);

    // Biz 4: 20 points (5 per activity)
    const bizScore = Math.min((bizProgress.completed / 4) * 20, 20);

    // Big One: 15 points (5 for setting, 10 for completing)
    let bigOneScore = 0;
    if (bigOne.text) bigOneScore += 5;
    if (bigOne.completed) bigOneScore += 10;

    // Tasks: 10 points
    const tasksScore = tasksProgress.total > 0 
      ? Math.min((tasksProgress.completed / tasksProgress.total) * 10, 10) 
      : 0;

    // Reading: 10 points
    const readingScore = readingCompleted ? 10 : 0;

    return {
      routine: { done: routineCompleted, score: routineScore },
      core: { ...coreProgress, score: coreScore },
      biz: { ...bizProgress, score: bizScore },
      bigOne: { set: !!bigOne.text, completed: bigOne.completed, score: bigOneScore },
      tasks: { ...tasksProgress, score: tasksScore },
      reading: { done: readingCompleted, score: readingScore }
    };
  }, [routineCompleted, coreProgress, bizProgress, bigOne, tasksProgress, readingCompleted]);

  // Determine next action with priority
  const getNextAction = useCallback((progress: ProgressSection): NextAction => {
    const actions: NextAction[] = [];

    // Priority 1: Champion Routine not started
    if (!progress.routine.done) {
      actions.push({
        type: 'routine',
        title: 'Începe Rutina de Campion',
        route: '/champion-routine',
        priority: 1
      });
    }

    // Priority 2: Big One not set
    if (!progress.bigOne.set) {
      actions.push({
        type: 'bigone-set',
        title: 'Setează "Big One" pentru azi',
        route: '/door',
        priority: 2
      });
    }

    // Priority 3: Big One not completed
    if (progress.bigOne.set && !progress.bigOne.completed) {
      actions.push({
        type: 'bigone-complete',
        title: `Completează: ${bigOne.text}`,
        route: '/door',
        priority: 3
      });
    }

    // Priority 4: Core 4 incomplete
    if (progress.core.completed < progress.core.total) {
      actions.push({
        type: 'core',
        title: `Core 4: ${progress.core.completed}/${progress.core.total}`,
        route: '/core',
        priority: 4
      });
    }

    // Priority 5: Biz 4 incomplete
    if (progress.biz.completed < progress.biz.total) {
      actions.push({
        type: 'biz',
        title: `Biz 4: ${progress.biz.completed}/${progress.biz.total}`,
        route: '/daily-four',
        priority: 5
      });
    }

    // Priority 6: Tasks
    if (progress.tasks.total > 0 && progress.tasks.completed < progress.tasks.total) {
      actions.push({
        type: 'tasks',
        title: `Tasks: ${progress.tasks.completed}/${progress.tasks.total}`,
        route: '/door',
        priority: 6
      });
    }

    // Priority 7: Reading
    if (!progress.reading.done) {
      actions.push({
        type: 'reading',
        title: 'Citește pagina zilei',
        route: '/reading',
        priority: 7
      });
    }

    // All complete
    if (actions.length === 0) {
      return {
        type: 'complete',
        title: 'Zi perfectă! 🎉 Relaxează-te sau explorează.',
        priority: 100
      };
    }

    // Return highest priority action
    return actions.sort((a, b) => a.priority - b.priority)[0];
  }, [bigOne.text]);

  // Build final data
  const data = useMemo((): DailyScoreData => {
    const progress = calculateScore();
    const totalScore = Math.round(
      progress.routine.score +
      progress.core.score +
      progress.biz.score +
      progress.bigOne.score +
      progress.tasks.score +
      progress.reading.score
    );

    return {
      totalScore,
      bigOne,
      nextAction: getNextAction(progress),
      progress,
      streak,
      xpLevel,
      greeting: getGreeting()
    };
  }, [calculateScore, getNextAction, bigOne, streak, xpLevel]);

  const refetch = useCallback(async () => {
    setLoading(true);
    // Re-trigger the useEffect
    const event = new CustomEvent('progressUpdated');
    window.dispatchEvent(event);
  }, []);

  return {
    data,
    loading,
    refetch
  };
};
