import { useState, useEffect, useCallback, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { supabase } from '@/integrations/supabase/client';
import { 
  Dumbbell, Play, Square, Plus, Trash2, Check, 
  Utensils, History, CheckCircle2, Copy, Save, RotateCcw
} from 'lucide-react';
import { toast } from 'sonner';
import { WorkoutHistory } from './WorkoutHistory';
import { format } from 'date-fns';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { TodaysWorkoutDashboard } from '@/components/fitness/TodaysWorkoutDashboard';
import { useTodayWorkout } from '@/hooks/useTodayWorkout';

// Lista de exerciții predefinite
const PRESET_EXERCISES = [
  { name: 'Bench Press', category: 'Piept' },
  { name: 'Incline Bench Press', category: 'Piept' },
  { name: 'Decline Bench Press', category: 'Piept' },
  { name: 'Dumbbell Press', category: 'Piept' },
  { name: 'Dumbbell Flyes', category: 'Piept' },
  { name: 'Cable Crossover', category: 'Piept' },
  { name: 'Push-ups', category: 'Piept' },
  { name: 'Deadlift', category: 'Spate' },
  { name: 'Barbell Row', category: 'Spate' },
  { name: 'Pull-ups', category: 'Spate' },
  { name: 'Lat Pulldown', category: 'Spate' },
  { name: 'Seated Cable Row', category: 'Spate' },
  { name: 'T-Bar Row', category: 'Spate' },
  { name: 'Face Pulls', category: 'Spate' },
  { name: 'Squat', category: 'Picioare' },
  { name: 'Front Squat', category: 'Picioare' },
  { name: 'Leg Press', category: 'Picioare' },
  { name: 'Romanian Deadlift', category: 'Picioare' },
  { name: 'Leg Curl', category: 'Picioare' },
  { name: 'Leg Extension', category: 'Picioare' },
  { name: 'Calf Raises', category: 'Picioare' },
  { name: 'Lunges', category: 'Picioare' },
  { name: 'Bulgarian Split Squat', category: 'Picioare' },
  { name: 'Overhead Press', category: 'Umeri' },
  { name: 'Lateral Raises', category: 'Umeri' },
  { name: 'Front Raises', category: 'Umeri' },
  { name: 'Rear Delt Flyes', category: 'Umeri' },
  { name: 'Arnold Press', category: 'Umeri' },
  { name: 'Shrugs', category: 'Umeri' },
  { name: 'Barbell Curl', category: 'Brațe' },
  { name: 'Dumbbell Curl', category: 'Brațe' },
  { name: 'Hammer Curl', category: 'Brațe' },
  { name: 'Tricep Pushdown', category: 'Brațe' },
  { name: 'Skull Crushers', category: 'Brațe' },
  { name: 'Tricep Dips', category: 'Brațe' },
  { name: 'Close Grip Bench Press', category: 'Brațe' },
  { name: 'Plank', category: 'Core' },
  { name: 'Crunches', category: 'Core' },
  { name: 'Russian Twists', category: 'Core' },
  { name: 'Leg Raises', category: 'Core' },
  { name: 'Ab Wheel Rollout', category: 'Core' },
  { name: 'Running', category: 'Cardio' },
  { name: 'Cycling', category: 'Cardio' },
  { name: 'Rowing', category: 'Cardio' },
  { name: 'Jump Rope', category: 'Cardio' },
  { name: 'Burpees', category: 'Cardio' },
];

interface SetLog {
  setNumber: number;
  reps: number;
  weight: number;
  completed: boolean;
}

interface Exercise {
  id: string;
  name: string;
  plannedSets: number;
  sets: SetLog[];
}

interface WorkoutStepProps {
  onComplete: () => void;
}

interface StoredWorkoutSession {
  isWorkoutStarted: boolean;
  startTime: string | null;
  elapsedTime: number;
  exercises: Exercise[];
  sessionId: string | null;
  lastUpdate: number;
}

const today = format(new Date(), 'yyyy-MM-dd');
const WORKOUT_SESSION_KEY = `workout_session_${today}`;
const SESSION_MAX_AGE = 7200000; // 2 hours

const getStoredSession = (): StoredWorkoutSession | null => {
  try {
    const stored = localStorage.getItem(WORKOUT_SESSION_KEY);
    if (stored) {
      const session = JSON.parse(stored) as StoredWorkoutSession;
      if (Date.now() - session.lastUpdate < SESSION_MAX_AGE) {
        return session;
      }
    }
  } catch {
    // Ignore errors
  }
  return null;
};

export const WorkoutStep = ({ onComplete }: WorkoutStepProps) => {
  // Check for planned workout
  const { hasTodayWorkout, hasActiveProgram, loading: planLoading } = useTodayWorkout();
  
  // Initialize state from localStorage
  const storedSession = getStoredSession();
  
  const [isWorkoutStarted, setIsWorkoutStarted] = useState(storedSession?.isWorkoutStarted || false);
  const [startTime, setStartTime] = useState<Date | null>(
    storedSession?.startTime ? new Date(storedSession.startTime) : null
  );
  const [elapsedTime, setElapsedTime] = useState(() => {
    // Recalculate elapsed time based on stored startTime
    if (storedSession?.isWorkoutStarted && storedSession.startTime) {
      return Math.floor((Date.now() - new Date(storedSession.startTime).getTime()) / 1000);
    }
    return storedSession?.elapsedTime || 0;
  });
  const [exercises, setExercises] = useState<Exercise[]>(storedSession?.exercises || []);
  const [sessionId, setSessionId] = useState<string | null>(storedSession?.sessionId || null);
  const [mealPlanDone, setMealPlanDone] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [showRecoveryBanner, setShowRecoveryBanner] = useState(
    storedSession?.isWorkoutStarted && storedSession.exercises.length > 0
  );
  
  const autoSaveRef = useRef<NodeJS.Timeout | null>(null);

  // Save to localStorage
  const saveToStorage = useCallback(() => {
    const session: StoredWorkoutSession = {
      isWorkoutStarted,
      startTime: startTime?.toISOString() || null,
      elapsedTime,
      exercises,
      sessionId,
      lastUpdate: Date.now()
    };
    try {
      localStorage.setItem(WORKOUT_SESSION_KEY, JSON.stringify(session));
    } catch {
      // Ignore storage errors
    }
  }, [isWorkoutStarted, startTime, elapsedTime, exercises, sessionId]);

  // Clear stored session
  const clearStoredSession = useCallback(() => {
    try {
      localStorage.removeItem(WORKOUT_SESSION_KEY);
    } catch {
      // Ignore errors
    }
  }, []);

  // Timer effect
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isWorkoutStarted && startTime) {
      interval = setInterval(() => {
        setElapsedTime(Math.floor((Date.now() - startTime.getTime()) / 1000));
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isWorkoutStarted, startTime]);

  // Auto-save every 30 seconds when workout is active
  useEffect(() => {
    if (isWorkoutStarted || exercises.length > 0) {
      autoSaveRef.current = setInterval(() => {
        saveToStorage();
      }, 30000);
    }
    
    return () => {
      if (autoSaveRef.current) {
        clearInterval(autoSaveRef.current);
      }
    };
  }, [isWorkoutStarted, exercises.length, saveToStorage]);

  // Save on state changes
  useEffect(() => {
    if (isWorkoutStarted || exercises.length > 0) {
      saveToStorage();
    }
  }, [exercises, isWorkoutStarted, saveToStorage]);

  // Save on visibility change and before unload
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden && (isWorkoutStarted || exercises.length > 0)) {
        saveToStorage();
      }
    };
    
    const handleBeforeUnload = () => {
      if (isWorkoutStarted || exercises.length > 0) {
        saveToStorage();
      }
    };
    
    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('beforeunload', handleBeforeUnload);
    
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [isWorkoutStarted, exercises.length, saveToStorage]);

  // Handle reset workout
  const resetWorkout = useCallback(() => {
    setIsWorkoutStarted(false);
    setStartTime(null);
    setElapsedTime(0);
    setExercises([]);
    setSessionId(null);
    setShowRecoveryBanner(false);
    clearStoredSession();
    toast.info('Workout resetat');
  }, [clearStoredSession]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const startWorkout = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('workout_sessions')
        .insert({
          user_id: user.id,
          date: format(new Date(), 'yyyy-MM-dd'),
          started_at: new Date().toISOString()
        })
        .select()
        .single();

      if (error) throw error;

      setSessionId(data.id);
      setStartTime(new Date());
      setIsWorkoutStarted(true);
      toast.success('Workout început! 💪');
    } catch (error) {
      console.error('Error starting workout:', error);
      toast.error('Nu am putut porni workout-ul');
    }
  };

  const stopWorkout = async () => {
    if (!sessionId) return;

    try {
      // Salvează toate exercițiile înainte de a opri
      await saveExercises();

      const { error } = await supabase
        .from('workout_sessions')
        .update({
          ended_at: new Date().toISOString(),
          total_duration_minutes: Math.floor(elapsedTime / 60)
        })
        .eq('id', sessionId);

      if (error) throw error;

      setIsWorkoutStarted(false);
      clearStoredSession(); // Clear localStorage after successful save
      toast.success('Workout salvat! 🎉');
    } catch (error) {
      console.error('Error stopping workout:', error);
      toast.error('Nu am putut salva workout-ul');
    }
  };

  const addExercise = (exerciseName?: string) => {
    const newExercise: Exercise = {
      id: crypto.randomUUID(),
      name: exerciseName || '',
      plannedSets: 3,
      sets: [
        { setNumber: 1, reps: 0, weight: 0, completed: false },
        { setNumber: 2, reps: 0, weight: 0, completed: false },
        { setNumber: 3, reps: 0, weight: 0, completed: false },
      ]
    };
    setExercises([...exercises, newExercise]);
  };

  const updateExerciseName = (id: string, name: string) => {
    setExercises(exercises.map(ex => 
      ex.id === id ? { ...ex, name } : ex
    ));
  };

  const updatePlannedSets = (id: string, count: number) => {
    setExercises(exercises.map(ex => {
      if (ex.id !== id) return ex;
      
      const currentSets = ex.sets.length;
      let newSets = [...ex.sets];
      
      if (count > currentSets) {
        // Adaugă seturi noi
        for (let i = currentSets; i < count; i++) {
          newSets.push({ setNumber: i + 1, reps: 0, weight: 0, completed: false });
        }
      } else if (count < currentSets) {
        // Elimină seturi
        newSets = newSets.slice(0, count);
      }
      
      return { ...ex, plannedSets: count, sets: newSets };
    }));
  };

  const updateSet = (exerciseId: string, setIndex: number, field: 'reps' | 'weight', value: number) => {
    setExercises(exercises.map(ex => {
      if (ex.id !== exerciseId) return ex;
      
      const newSets = [...ex.sets];
      newSets[setIndex] = { ...newSets[setIndex], [field]: value };
      
      return { ...ex, sets: newSets };
    }));
  };

  const toggleSetCompleted = (exerciseId: string, setIndex: number) => {
    setExercises(exercises.map(ex => {
      if (ex.id !== exerciseId) return ex;
      
      const newSets = [...ex.sets];
      newSets[setIndex] = { ...newSets[setIndex], completed: !newSets[setIndex].completed };
      
      return { ...ex, sets: newSets };
    }));
  };

  const removeExercise = (id: string) => {
    setExercises(exercises.filter(ex => ex.id !== id));
  };

  const copyFromLastSession = async (exerciseId: string, exerciseName: string) => {
    if (!exerciseName.trim()) {
      toast.error('Selectează mai întâi un exercițiu');
      return;
    }

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Caută ultima sesiune cu acest exercițiu
      const { data, error } = await supabase
        .from('workout_exercises')
        .select('reps, weight_kg, sets, notes')
        .eq('user_id', user.id)
        .eq('exercise_name', exerciseName)
        .order('created_at', { ascending: false })
        .limit(10);

      if (error) throw error;

      if (!data || data.length === 0) {
        toast.info('Nu am găsit date anterioare pentru acest exercițiu');
        return;
      }

      // Grupează pe seturi și ia ultimele valori
      const lastSets = data.map((record, idx) => ({
        setNumber: idx + 1,
        reps: record.reps || 0,
        weight: record.weight_kg || 0,
        completed: false
      }));

      setExercises(exercises.map(ex => {
        if (ex.id !== exerciseId) return ex;
        
        // Actualizează seturile cu datele de la ultima sesiune
        const newSets = ex.sets.map((set, idx) => {
          if (idx < lastSets.length) {
            return {
              ...set,
              reps: lastSets[idx].reps,
              weight: lastSets[idx].weight,
              completed: false
            };
          }
          return set;
        });

        return { ...ex, sets: newSets };
      }));

      toast.success(`Copiate ${Math.min(lastSets.length, exercises.find(e => e.id === exerciseId)?.sets.length || 0)} seturi de la ultima sesiune`);
    } catch (error) {
      console.error('Error copying from last session:', error);
      toast.error('Nu am putut copia datele');
    }
  };

  const saveExercises = async () => {
    if (!sessionId || exercises.length === 0) return;

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Salvează fiecare set ca un record separat cu informații despre set
      const exerciseRecords = exercises.flatMap((ex, exIndex) => 
        ex.sets
          .filter(set => set.completed && set.reps > 0)
          .map((set, setIdx) => ({
            session_id: sessionId,
            user_id: user.id,
            exercise_name: ex.name,
            sets: set.setNumber,
            reps: set.reps,
            weight_kg: set.weight,
            order_index: exIndex * 100 + setIdx,
            notes: `Set ${set.setNumber}/${ex.plannedSets}`
          }))
      );

      if (exerciseRecords.length === 0) return;

      const { error } = await supabase
        .from('workout_exercises')
        .insert(exerciseRecords);

      if (error) throw error;

      toast.success('Exerciții salvate!');
    } catch (error) {
      console.error('Error saving exercises:', error);
      toast.error('Nu am putut salva exercițiile');
    }
  };

  // Salvează un singur exercițiu
  const saveExercise = async (exerciseId: string) => {
    if (!sessionId) return;

    const exercise = exercises.find(ex => ex.id === exerciseId);
    if (!exercise || !exercise.name.trim()) {
      toast.error('Completează numele exercițiului');
      return;
    }

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Șterge înregistrările anterioare pentru acest exercițiu din această sesiune
      await supabase
        .from('workout_exercises')
        .delete()
        .eq('session_id', sessionId)
        .eq('exercise_name', exercise.name);

      // Salvează toate seturile cu reps > 0 (indiferent dacă sunt completate)
      const exerciseRecords = exercise.sets
        .filter(set => set.reps > 0 || set.weight > 0)
        .map((set, idx) => ({
          session_id: sessionId,
          user_id: user.id,
          exercise_name: exercise.name,
          sets: set.setNumber,
          reps: set.reps,
          weight_kg: set.weight,
          order_index: idx,
          notes: set.completed ? `Set ${set.setNumber}/${exercise.plannedSets} ✓` : `Set ${set.setNumber}/${exercise.plannedSets}`
        }));

      if (exerciseRecords.length === 0) {
        toast.info('Adaugă cel puțin un set cu reps sau greutate');
        return;
      }

      const { error } = await supabase
        .from('workout_exercises')
        .insert(exerciseRecords);

      if (error) throw error;

      toast.success(`${exercise.name} salvat! 💾`);
    } catch (error) {
      console.error('Error saving exercise:', error);
      toast.error('Nu am putut salva exercițiul');
    }
  };

  const canComplete = !isWorkoutStarted && (exercises.length > 0 || mealPlanDone);

  const groupedExercises = PRESET_EXERCISES.reduce((acc, ex) => {
    if (!acc[ex.category]) acc[ex.category] = [];
    acc[ex.category].push(ex.name);
    return acc;
  }, {} as Record<string, string[]>);

  const getCompletedSetsCount = (exercise: Exercise) => {
    return exercise.sets.filter(s => s.completed).length;
  };

  // If there's a planned workout from the weekly program, use the new dashboard
  if (hasActiveProgram && hasTodayWorkout && !planLoading) {
    return <TodaysWorkoutDashboard onComplete={onComplete} />;
  }

  // Loading state for plan check
  if (planLoading) {
    return (
      <Card>
        <CardContent className="p-8 flex items-center justify-center">
          <Dumbbell className="h-6 w-6 text-muted-foreground animate-bounce" />
        </CardContent>
      </Card>
    );
  }

  // Manual workout UI (fallback when no program)
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-green-500">
          <Dumbbell className="h-5 w-5" />
          Fitness
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Recovery Banner */}
        {showRecoveryBanner && !isWorkoutStarted && exercises.length > 0 && (
          <div className="p-4 rounded-lg bg-amber-500/10 border border-amber-500/30">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-amber-600 dark:text-amber-400">
                  Sesiune găsită în memorie
                </p>
                <p className="text-sm text-muted-foreground">
                  {exercises.length} exerciții, {formatTime(elapsedTime)} înregistrat
                </p>
              </div>
              <div className="flex gap-2">
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={resetWorkout}
                  className="gap-1"
                >
                  <RotateCcw className="h-4 w-4" />
                  Resetează
                </Button>
                <Button 
                  size="sm"
                  onClick={() => {
                    setShowRecoveryBanner(false);
                    toast.success('Continuă de unde ai rămas!');
                  }}
                  className="gap-1"
                >
                  <Play className="h-4 w-4" />
                  Continuă
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Workout Timer */}
        <div className="p-4 rounded-lg bg-muted/50 text-center">
          <div className="text-4xl font-mono font-bold text-foreground mb-4">
            {formatTime(elapsedTime)}
          </div>
          
          {!isWorkoutStarted ? (
            <Button onClick={startWorkout} className="gap-2">
              <Play className="h-4 w-4" />
              Start Workout
            </Button>
          ) : (
            <Button onClick={stopWorkout} variant="destructive" className="gap-2">
              <Square className="h-4 w-4" />
              Stop & Salvează
            </Button>
          )}
        </div>

        {/* Exercises */}
        {isWorkoutStarted && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-medium">Exerciții</h3>
              <div className="flex gap-2">
                <Select onValueChange={(value) => addExercise(value)}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Adaugă exercițiu..." />
                  </SelectTrigger>
                  <SelectContent className="max-h-[300px]">
                    {Object.entries(groupedExercises).map(([category, exList]) => (
                      <div key={category}>
                        <div className="px-2 py-1.5 text-sm font-semibold text-muted-foreground bg-muted/50">
                          {category}
                        </div>
                        {exList.map((name) => (
                          <SelectItem key={name} value={name}>
                            {name}
                          </SelectItem>
                        ))}
                      </div>
                    ))}
                  </SelectContent>
                </Select>
                <Button variant="outline" size="sm" onClick={() => addExercise()} className="gap-1">
                  <Plus className="h-4 w-4" />
                  Custom
                </Button>
              </div>
            </div>

            {exercises.map((exercise) => (
              <div key={exercise.id} className="p-4 rounded-lg border bg-card space-y-4">
                {/* Header exercițiu */}
                <div className="flex items-center gap-2">
                  <Input
                    placeholder="Nume exercițiu"
                    value={exercise.name}
                    onChange={(e) => updateExerciseName(exercise.id, e.target.value)}
                    className="flex-1 font-medium"
                  />
                  <div className="flex items-center gap-1">
                    <Label className="text-xs text-muted-foreground whitespace-nowrap">Seturi:</Label>
                    <Input
                      type="number"
                      min={1}
                      max={10}
                      value={exercise.plannedSets}
                      onChange={(e) => updatePlannedSets(exercise.id, parseInt(e.target.value) || 1)}
                      className="w-16"
                    />
                  </div>
                  <Button 
                    variant="ghost" 
                    size="icon"
                    onClick={() => copyFromLastSession(exercise.id, exercise.name)}
                    title="Copiază de la ultima sesiune"
                  >
                    <Copy className="h-4 w-4 text-primary" />
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="icon"
                    onClick={() => saveExercise(exercise.id)}
                    title="Salvează progresul"
                    className="text-green-500 hover:text-green-600 hover:bg-green-500/10"
                  >
                    <Save className="h-4 w-4" />
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="icon"
                    onClick={() => removeExercise(exercise.id)}
                  >
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </div>

                {/* Progres */}
                <div className="text-sm text-muted-foreground">
                  Completate: {getCompletedSetsCount(exercise)}/{exercise.plannedSets} seturi
                </div>

                {/* Sets individuali */}
                <div className="space-y-2">
                  {exercise.sets.map((set, idx) => (
                    <div 
                      key={idx} 
                      className={`flex items-center gap-2 p-2 rounded-md transition-colors ${
                        set.completed ? 'bg-green-500/10 border border-green-500/30' : 'bg-muted/30'
                      }`}
                    >
                      <Button
                        variant={set.completed ? "default" : "outline"}
                        size="sm"
                        className={`h-8 w-8 p-0 ${set.completed ? 'bg-green-500 hover:bg-green-600' : ''}`}
                        onClick={() => toggleSetCompleted(exercise.id, idx)}
                      >
                        {set.completed ? (
                          <CheckCircle2 className="h-4 w-4" />
                        ) : (
                          <span className="text-xs font-bold">{set.setNumber}</span>
                        )}
                      </Button>
                      
                      <div className="flex items-center gap-1 flex-1">
                        <Input
                          type="number"
                          placeholder="Reps"
                          value={set.reps || ''}
                          onChange={(e) => updateSet(exercise.id, idx, 'reps', parseInt(e.target.value) || 0)}
                          className="w-20 h-8 text-center"
                        />
                        <span className="text-muted-foreground text-sm">reps</span>
                      </div>
                      
                      <div className="flex items-center gap-1 flex-1">
                        <Input
                          type="number"
                          placeholder="Kg"
                          step="0.5"
                          value={set.weight || ''}
                          onChange={(e) => updateSet(exercise.id, idx, 'weight', parseFloat(e.target.value) || 0)}
                          className="w-20 h-8 text-center"
                        />
                        <span className="text-muted-foreground text-sm">kg</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Meal Planning Checkbox */}
        <div 
          className="flex items-center gap-4 p-4 rounded-lg bg-muted/50 cursor-pointer hover:bg-muted transition-colors"
          onClick={() => setMealPlanDone(!mealPlanDone)}
        >
          <div className={`h-5 w-5 rounded border flex items-center justify-center ${
            mealPlanDone ? 'bg-primary border-primary' : 'border-muted-foreground'
          }`}>
            {mealPlanDone && <Check className="h-3 w-3 text-primary-foreground" />}
          </div>
          <Utensils className="h-5 w-5 text-orange-500" />
          <div className="flex-1">
            <p className="font-medium">Meal Planning</p>
            <p className="text-sm text-muted-foreground">Am planificat mesele pentru azi</p>
          </div>
        </div>

        {/* Workout History Toggle */}
        <Button
          variant="outline"
          onClick={() => setShowHistory(!showHistory)}
          className="w-full gap-2"
        >
          <History className="h-4 w-4" />
          {showHistory ? 'Ascunde Istoric' : 'Vezi Istoric Workout-uri'}
        </Button>

        {showHistory && (
          <div className="border rounded-lg p-4 bg-muted/20">
            <WorkoutHistory />
          </div>
        )}

        <Button
          className="w-full gap-2" 
          onClick={onComplete}
          disabled={!canComplete}
        >
          <Check className="h-4 w-4" />
          Completează Pasul
        </Button>
      </CardContent>
    </Card>
  );
};
