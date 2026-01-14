import { useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/context/AuthContext';
import { useWorkoutProgram } from './useWorkoutProgram';
import { toast } from 'sonner';
import { format } from 'date-fns';
import type { WorkoutProgramDay, WorkoutDayExercise } from '@/types/workout';

export interface SetProgress {
  setNumber: number;
  reps: number;
  weight: number;
  completed: boolean;
}

export interface ExerciseProgress {
  id: string;
  planId: string; // ID from workout_day_exercises
  name: string;
  targetSets: number;
  targetReps: string;
  targetWeight?: number;
  sets: SetProgress[];
  isExpanded: boolean;
}

interface StoredTodaySession {
  sessionId: string | null;
  startTime: string | null;
  elapsedTime: number;
  exercises: ExerciseProgress[];
  lastUpdate: number;
}

const today = format(new Date(), 'yyyy-MM-dd');
const SESSION_KEY = `today_workout_${today}`;
const SESSION_MAX_AGE = 7200000; // 2 hours

const getStoredSession = (): StoredTodaySession | null => {
  try {
    const stored = localStorage.getItem(SESSION_KEY);
    if (stored) {
      const session = JSON.parse(stored) as StoredTodaySession;
      if (Date.now() - session.lastUpdate < SESSION_MAX_AGE) {
        return session;
      }
    }
  } catch {
    // Ignore errors
  }
  return null;
};

// Helper to get current day of week (0=Monday, 6=Sunday)
const getCurrentDayOfWeek = () => {
  const jsDay = new Date().getDay();
  return jsDay === 0 ? 6 : jsDay - 1;
};

export function useTodayWorkout() {
  const { user } = useAuth();
  const { activeProgram, loading: programLoading } = useWorkoutProgram();
  
  const storedSession = getStoredSession();
  
  const [selectedDayOfWeek, setSelectedDayOfWeek] = useState<number>(getCurrentDayOfWeek());
  const [todayPlan, setTodayPlan] = useState<WorkoutProgramDay | null>(null);
  const [sessionId, setSessionId] = useState<string | null>(storedSession?.sessionId || null);
  const [isStarted, setIsStarted] = useState(!!storedSession?.sessionId);
  const [startTime, setStartTime] = useState<Date | null>(
    storedSession?.startTime ? new Date(storedSession.startTime) : null
  );
  const [elapsedTime, setElapsedTime] = useState(() => {
    if (storedSession?.startTime && storedSession.sessionId) {
      return Math.floor((Date.now() - new Date(storedSession.startTime).getTime()) / 1000);
    }
    return storedSession?.elapsedTime || 0;
  });
  const [exercises, setExercises] = useState<ExerciseProgress[]>(storedSession?.exercises || []);
  const [loading, setLoading] = useState(true);
  
  const autoSaveRef = useRef<NodeJS.Timeout | null>(null);

  // Get workout for selected day
  const getWorkoutForDay = useCallback((dayOfWeek: number) => {
    if (!activeProgram?.days) return null;
    return activeProgram.days.find(d => d.day_of_week === dayOfWeek) || null;
  }, [activeProgram]);

  // Initialize exercises from workout plan
  const initializeExercises = useCallback((workout: WorkoutProgramDay | null) => {
    if (workout?.exercises && workout.exercises.length > 0) {
      const initialExercises: ExerciseProgress[] = workout.exercises.map((ex, idx) => ({
        id: crypto.randomUUID(),
        planId: ex.id,
        name: ex.exercise_name,
        targetSets: ex.target_sets,
        targetReps: ex.target_reps || '10',
        targetWeight: ex.target_weight_kg,
        sets: Array.from({ length: ex.target_sets }, (_, i) => ({
          setNumber: i + 1,
          reps: 0,
          weight: ex.target_weight_kg || 0,
          completed: false,
        })),
        isExpanded: idx === 0,
      }));
      setExercises(initialExercises);
    } else {
      setExercises([]);
    }
  }, []);

  // Load workout when program is ready or selected day changes
  useEffect(() => {
    if (!programLoading && activeProgram) {
      const workout = getWorkoutForDay(selectedDayOfWeek);
      setTodayPlan(workout);
      
      // Only initialize exercises if no active session and it's the first load
      if (!storedSession?.exercises?.length && !isStarted) {
        initializeExercises(workout);
      }
      setLoading(false);
    } else if (!programLoading) {
      setLoading(false);
    }
  }, [programLoading, activeProgram, selectedDayOfWeek, getWorkoutForDay, initializeExercises, isStarted]);

  // Handle day change - reinitialize exercises if not in an active session
  const handleSetSelectedDayOfWeek = useCallback((day: number) => {
    if (isStarted) {
      toast.error('Nu poți schimba ziua în timpul antrenamentului');
      return;
    }
    setSelectedDayOfWeek(day);
    const workout = getWorkoutForDay(day);
    setTodayPlan(workout);
    initializeExercises(workout);
  }, [isStarted, getWorkoutForDay, initializeExercises]);

  // Timer effect
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isStarted && startTime) {
      interval = setInterval(() => {
        setElapsedTime(Math.floor((Date.now() - startTime.getTime()) / 1000));
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isStarted, startTime]);

  // Save to localStorage
  const saveToStorage = useCallback(() => {
    const session: StoredTodaySession = {
      sessionId,
      startTime: startTime?.toISOString() || null,
      elapsedTime,
      exercises,
      lastUpdate: Date.now(),
    };
    try {
      localStorage.setItem(SESSION_KEY, JSON.stringify(session));
    } catch {
      // Ignore storage errors
    }
  }, [sessionId, startTime, elapsedTime, exercises]);

  // Clear stored session
  const clearStoredSession = useCallback(() => {
    try {
      localStorage.removeItem(SESSION_KEY);
    } catch {
      // Ignore errors
    }
  }, []);

  // Auto-save every 30 seconds
  useEffect(() => {
    if (isStarted || exercises.some(e => e.sets.some(s => s.completed))) {
      autoSaveRef.current = setInterval(() => {
        saveToStorage();
      }, 30000);
    }
    
    return () => {
      if (autoSaveRef.current) {
        clearInterval(autoSaveRef.current);
      }
    };
  }, [isStarted, exercises, saveToStorage]);

  // Save on state changes
  useEffect(() => {
    if (isStarted || exercises.length > 0) {
      saveToStorage();
    }
  }, [exercises, isStarted, saveToStorage]);

  // Save on visibility change
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden && (isStarted || exercises.length > 0)) {
        saveToStorage();
      }
    };
    
    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [isStarted, exercises.length, saveToStorage]);

  const startSession = async () => {
    if (!user?.id) return;

    try {
      const { data, error } = await supabase
        .from('workout_sessions')
        .insert({
          user_id: user.id,
          date: today,
          started_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (error) throw error;

      setSessionId(data.id);
      setStartTime(new Date());
      setIsStarted(true);
      toast.success('Antrenament început! 💪');
    } catch (error) {
      console.error('Error starting session:', error);
      toast.error('Nu am putut porni antrenamentul');
    }
  };

  const endSession = async () => {
    if (!sessionId) return;

    try {
      // Save all exercises
      await saveAllExercises();

      const { error } = await supabase
        .from('workout_sessions')
        .update({
          ended_at: new Date().toISOString(),
          total_duration_minutes: Math.floor(elapsedTime / 60),
        })
        .eq('id', sessionId);

      if (error) throw error;

      setIsStarted(false);
      clearStoredSession();
      toast.success('Antrenament salvat! 🎉');
      return true;
    } catch (error) {
      console.error('Error ending session:', error);
      toast.error('Nu am putut salva antrenamentul');
      return false;
    }
  };

  const saveAllExercises = async () => {
    if (!sessionId || !user?.id) return;

    const exerciseRecords = exercises.flatMap((ex, exIndex) =>
      ex.sets
        .filter(set => set.reps > 0 || set.weight > 0)
        .map((set, setIdx) => ({
          session_id: sessionId,
          user_id: user.id,
          exercise_name: ex.name,
          sets: set.setNumber,
          reps: set.reps,
          weight_kg: set.weight,
          order_index: exIndex * 100 + setIdx,
          notes: set.completed 
            ? `Set ${set.setNumber}/${ex.targetSets} ✓ (plan: ${ex.targetReps} reps)`
            : `Set ${set.setNumber}/${ex.targetSets}`,
        }))
    );

    if (exerciseRecords.length === 0) return;

    const { error } = await supabase
      .from('workout_exercises')
      .insert(exerciseRecords);

    if (error) throw error;
  };

  const updateSetProgress = (exerciseId: string, setIndex: number, updates: Partial<SetProgress>) => {
    setExercises(prev => prev.map(ex => {
      if (ex.id !== exerciseId) return ex;
      
      const newSets = [...ex.sets];
      newSets[setIndex] = { ...newSets[setIndex], ...updates };
      
      return { ...ex, sets: newSets };
    }));
  };

  const toggleSetCompleted = (exerciseId: string, setIndex: number) => {
    setExercises(prev => prev.map(ex => {
      if (ex.id !== exerciseId) return ex;
      
      const newSets = [...ex.sets];
      newSets[setIndex] = { ...newSets[setIndex], completed: !newSets[setIndex].completed };
      
      return { ...ex, sets: newSets };
    }));
  };

  const toggleExerciseExpanded = (exerciseId: string) => {
    setExercises(prev => prev.map(ex => ({
      ...ex,
      isExpanded: ex.id === exerciseId ? !ex.isExpanded : ex.isExpanded,
    })));
  };

  const copyFromLastSession = async (exerciseId: string) => {
    const exercise = exercises.find(e => e.id === exerciseId);
    if (!exercise || !user?.id) return;

    try {
      const { data, error } = await supabase
        .from('workout_exercises')
        .select('reps, weight_kg, sets')
        .eq('user_id', user.id)
        .eq('exercise_name', exercise.name)
        .order('created_at', { ascending: false })
        .limit(exercise.targetSets);

      if (error) throw error;

      if (!data || data.length === 0) {
        toast.info('Nu am găsit date anterioare pentru acest exercițiu');
        return;
      }

      setExercises(prev => prev.map(ex => {
        if (ex.id !== exerciseId) return ex;
        
        const newSets = ex.sets.map((set, idx) => {
          if (idx < data.length) {
            return {
              ...set,
              reps: data[idx].reps || 0,
              weight: data[idx].weight_kg || 0,
              completed: false,
            };
          }
          return set;
        });

        return { ...ex, sets: newSets };
      }));

      toast.success(`Copiate ${Math.min(data.length, exercise.sets.length)} seturi`);
    } catch (error) {
      console.error('Error copying from last session:', error);
      toast.error('Nu am putut copia datele');
    }
  };

  const addExtraExercise = (name: string) => {
    const newExercise: ExerciseProgress = {
      id: crypto.randomUUID(),
      planId: '',
      name,
      targetSets: 3,
      targetReps: '10',
      sets: Array.from({ length: 3 }, (_, i) => ({
        setNumber: i + 1,
        reps: 0,
        weight: 0,
        completed: false,
      })),
      isExpanded: true,
    };
    setExercises(prev => [...prev, newExercise]);
  };

  const removeExercise = (exerciseId: string) => {
    setExercises(prev => prev.filter(e => e.id !== exerciseId));
  };

  const updateExerciseSetsCount = (exerciseId: string, count: number) => {
    setExercises(prev => prev.map(ex => {
      if (ex.id !== exerciseId) return ex;

      const currentSets = ex.sets.length;
      let newSets = [...ex.sets];

      if (count > currentSets) {
        for (let i = currentSets; i < count; i++) {
          newSets.push({ setNumber: i + 1, reps: 0, weight: 0, completed: false });
        }
      } else if (count < currentSets) {
        newSets = newSets.slice(0, count);
      }

      return { ...ex, targetSets: count, sets: newSets };
    }));
  };

  const getCompletedProgress = () => {
    const totalSets = exercises.reduce((sum, ex) => sum + ex.sets.length, 0);
    const completedSets = exercises.reduce(
      (sum, ex) => sum + ex.sets.filter(s => s.completed).length,
      0
    );
    return { totalSets, completedSets, percentage: totalSets > 0 ? (completedSets / totalSets) * 100 : 0 };
  };

  const formatTime = (seconds: number) => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    if (hrs > 0) {
      return `${hrs}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const resetSession = () => {
    setIsStarted(false);
    setStartTime(null);
    setElapsedTime(0);
    setSessionId(null);
    
    // Reinitialize from plan
    if (todayPlan?.exercises) {
      const initialExercises: ExerciseProgress[] = todayPlan.exercises.map((ex, idx) => ({
        id: crypto.randomUUID(),
        planId: ex.id,
        name: ex.exercise_name,
        targetSets: ex.target_sets,
        targetReps: ex.target_reps || '10',
        targetWeight: ex.target_weight_kg,
        sets: Array.from({ length: ex.target_sets }, (_, i) => ({
          setNumber: i + 1,
          reps: 0,
          weight: ex.target_weight_kg || 0,
          completed: false,
        })),
        isExpanded: idx === 0,
      }));
      setExercises(initialExercises);
    } else {
      setExercises([]);
    }
    
    clearStoredSession();
    toast.info('Sesiune resetată');
  };

  return {
    // State
    todayPlan,
    exercises,
    sessionId,
    isStarted,
    elapsedTime,
    loading: loading || programLoading,
    hasActiveProgram: !!activeProgram,
    hasTodayWorkout: !!(todayPlan && !todayPlan.is_rest_day && todayPlan.exercises?.length),
    selectedDayOfWeek,
    
    // Actions
    startSession,
    endSession,
    resetSession,
    updateSetProgress,
    toggleSetCompleted,
    toggleExerciseExpanded,
    copyFromLastSession,
    addExtraExercise,
    removeExercise,
    updateExerciseSetsCount,
    setSelectedDayOfWeek: handleSetSelectedDayOfWeek,
    
    // Helpers
    getCompletedProgress,
    formatTime,
  };
}
