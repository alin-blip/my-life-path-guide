import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { supabase } from '@/integrations/supabase/client';
import { 
  Dumbbell, Play, Square, Plus, Trash2, Check, Clock, 
  Utensils 
} from 'lucide-react';
import { toast } from 'sonner';
import { format } from 'date-fns';

interface Exercise {
  id: string;
  name: string;
  sets: number;
  reps: number;
  weight: number;
}

interface WorkoutStepProps {
  onComplete: () => void;
}

export const WorkoutStep = ({ onComplete }: WorkoutStepProps) => {
  const [isWorkoutStarted, setIsWorkoutStarted] = useState(false);
  const [startTime, setStartTime] = useState<Date | null>(null);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [mealPlanDone, setMealPlanDone] = useState(false);

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
      const { error } = await supabase
        .from('workout_sessions')
        .update({
          ended_at: new Date().toISOString(),
          total_duration_minutes: Math.floor(elapsedTime / 60)
        })
        .eq('id', sessionId);

      if (error) throw error;

      setIsWorkoutStarted(false);
      toast.success('Workout salvat! 🎉');
    } catch (error) {
      console.error('Error stopping workout:', error);
      toast.error('Nu am putut salva workout-ul');
    }
  };

  const addExercise = () => {
    const newExercise: Exercise = {
      id: crypto.randomUUID(),
      name: '',
      sets: 3,
      reps: 10,
      weight: 0
    };
    setExercises([...exercises, newExercise]);
  };

  const updateExercise = (id: string, field: keyof Exercise, value: string | number) => {
    setExercises(exercises.map(ex => 
      ex.id === id ? { ...ex, [field]: value } : ex
    ));
  };

  const removeExercise = (id: string) => {
    setExercises(exercises.filter(ex => ex.id !== id));
  };

  const saveExercises = async () => {
    if (!sessionId || exercises.length === 0) return;

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const exerciseRecords = exercises.map((ex, index) => ({
        session_id: sessionId,
        user_id: user.id,
        exercise_name: ex.name,
        sets: ex.sets,
        reps: ex.reps,
        weight_kg: ex.weight,
        order_index: index
      }));

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

  const canComplete = !isWorkoutStarted && (exercises.length > 0 || mealPlanDone);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-green-500">
          <Dumbbell className="h-5 w-5" />
          Fitness
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
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
              Stop Workout
            </Button>
          )}
        </div>

        {/* Exercises */}
        {isWorkoutStarted && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-medium">Exerciții</h3>
              <Button variant="outline" size="sm" onClick={addExercise} className="gap-1">
                <Plus className="h-4 w-4" />
                Adaugă
              </Button>
            </div>

            {exercises.map((exercise) => (
              <div key={exercise.id} className="p-4 rounded-lg border bg-card space-y-3">
                <div className="flex items-center gap-2">
                  <Input
                    placeholder="Nume exercițiu"
                    value={exercise.name}
                    onChange={(e) => updateExercise(exercise.id, 'name', e.target.value)}
                    className="flex-1"
                  />
                  <Button 
                    variant="ghost" 
                    size="icon"
                    onClick={() => removeExercise(exercise.id)}
                  >
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </div>
                
                <div className="grid grid-cols-3 gap-2">
                  <div>
                    <Label className="text-xs">Seturi</Label>
                    <Input
                      type="number"
                      value={exercise.sets}
                      onChange={(e) => updateExercise(exercise.id, 'sets', parseInt(e.target.value) || 0)}
                    />
                  </div>
                  <div>
                    <Label className="text-xs">Repetări</Label>
                    <Input
                      type="number"
                      value={exercise.reps}
                      onChange={(e) => updateExercise(exercise.id, 'reps', parseInt(e.target.value) || 0)}
                    />
                  </div>
                  <div>
                    <Label className="text-xs">Greutate (kg)</Label>
                    <Input
                      type="number"
                      value={exercise.weight}
                      onChange={(e) => updateExercise(exercise.id, 'weight', parseFloat(e.target.value) || 0)}
                    />
                  </div>
                </div>
              </div>
            ))}

            {exercises.length > 0 && (
              <Button variant="secondary" onClick={saveExercises} className="w-full">
                Salvează Exercițiile
              </Button>
            )}
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
