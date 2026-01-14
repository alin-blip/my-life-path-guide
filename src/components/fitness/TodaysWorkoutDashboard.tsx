import React, { useState, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Label } from '@/components/ui/label';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dumbbell,
  Play,
  Square,
  Timer,
  ChevronDown,
  ChevronUp,
  Check,
  Copy,
  Plus,
  Trash2,
  RotateCcw,
  Target,
  CheckCircle2,
  FileText,
  Pencil,
  Save,
} from 'lucide-react';
import { useTodayWorkout, ExerciseProgress, SetProgress } from '@/hooks/useTodayWorkout';
import { DAYS_OF_WEEK } from '@/types/workout';
import { cn } from '@/lib/utils';
import { supabase } from '@/integrations/supabase/client';
import { format } from 'date-fns';
import { toast } from 'sonner';

// Manual exercise interface
interface ManualSetLog {
  setNumber: number;
  reps: number;
  weight: number;
  completed: boolean;
}

interface ManualExercise {
  id: string;
  name: string;
  plannedSets: number;
  sets: ManualSetLog[];
}

// Preset exercises for adding extra
const PRESET_EXERCISES = [
  { name: 'Bench Press', category: 'Piept' },
  { name: 'Incline Bench Press', category: 'Piept' },
  { name: 'Dumbbell Press', category: 'Piept' },
  { name: 'Deadlift', category: 'Spate' },
  { name: 'Barbell Row', category: 'Spate' },
  { name: 'Pull-ups', category: 'Spate' },
  { name: 'Lat Pulldown', category: 'Spate' },
  { name: 'Squat', category: 'Picioare' },
  { name: 'Leg Press', category: 'Picioare' },
  { name: 'Romanian Deadlift', category: 'Picioare' },
  { name: 'Overhead Press', category: 'Umeri' },
  { name: 'Lateral Raises', category: 'Umeri' },
  { name: 'Barbell Curl', category: 'Brațe' },
  { name: 'Tricep Pushdown', category: 'Brațe' },
];

interface TodaysWorkoutDashboardProps {
  onComplete: () => void;
}

export function TodaysWorkoutDashboard({ onComplete }: TodaysWorkoutDashboardProps) {
  const {
    todayPlan,
    exercises,
    isStarted,
    elapsedTime,
    loading,
    hasTodayWorkout,
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
    getCompletedProgress,
    formatTime,
  } = useTodayWorkout();

  const [showAddExercise, setShowAddExercise] = useState(false);
  const [activeTab, setActiveTab] = useState<'template' | 'manual'>('template');
  
  // Manual workout state
  const [manualExercises, setManualExercises] = useState<ManualExercise[]>([]);
  const [isManualStarted, setIsManualStarted] = useState(false);
  const [manualStartTime, setManualStartTime] = useState<Date | null>(null);
  const [manualElapsedTime, setManualElapsedTime] = useState(0);
  const [manualSessionId, setManualSessionId] = useState<string | null>(null);

  // Timer for manual mode
  React.useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isManualStarted && manualStartTime) {
      interval = setInterval(() => {
        setManualElapsedTime(Math.floor((Date.now() - manualStartTime.getTime()) / 1000));
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isManualStarted, manualStartTime]);

  const formatManualTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const startManualWorkout = async () => {
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

      setManualSessionId(data.id);
      setManualStartTime(new Date());
      setIsManualStarted(true);
      toast.success('Workout manual început! 💪');
    } catch (error) {
      console.error('Error starting manual workout:', error);
      toast.error('Nu am putut porni workout-ul');
    }
  };

  const stopManualWorkout = async () => {
    if (!manualSessionId) return;

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Save all exercises
      const exerciseRecords = manualExercises.flatMap((ex, exIndex) => 
        ex.sets
          .filter(set => set.reps > 0 || set.weight > 0)
          .map((set, setIdx) => ({
            session_id: manualSessionId,
            user_id: user.id,
            exercise_name: ex.name,
            sets: set.setNumber,
            reps: set.reps,
            weight_kg: set.weight,
            order_index: exIndex * 100 + setIdx,
            notes: set.completed ? `Set ${set.setNumber}/${ex.plannedSets} ✓` : `Set ${set.setNumber}/${ex.plannedSets}`
          }))
      );

      if (exerciseRecords.length > 0) {
        const { error: exerciseError } = await supabase
          .from('workout_exercises')
          .insert(exerciseRecords);
        if (exerciseError) throw exerciseError;
      }

      // Update session
      const { error } = await supabase
        .from('workout_sessions')
        .update({
          ended_at: new Date().toISOString(),
          total_duration_minutes: Math.floor(manualElapsedTime / 60)
        })
        .eq('id', manualSessionId);

      if (error) throw error;

      setIsManualStarted(false);
      setManualExercises([]);
      setManualSessionId(null);
      setManualStartTime(null);
      setManualElapsedTime(0);
      toast.success('Workout salvat! 🎉');
      onComplete();
    } catch (error) {
      console.error('Error stopping manual workout:', error);
      toast.error('Nu am putut salva workout-ul');
    }
  };

  const addManualExercise = (exerciseName?: string) => {
    const newExercise: ManualExercise = {
      id: crypto.randomUUID(),
      name: exerciseName || '',
      plannedSets: 3,
      sets: [
        { setNumber: 1, reps: 0, weight: 0, completed: false },
        { setNumber: 2, reps: 0, weight: 0, completed: false },
        { setNumber: 3, reps: 0, weight: 0, completed: false },
      ]
    };
    setManualExercises([...manualExercises, newExercise]);
  };

  const updateManualExerciseName = (id: string, name: string) => {
    setManualExercises(manualExercises.map(ex => 
      ex.id === id ? { ...ex, name } : ex
    ));
  };

  const updateManualPlannedSets = (id: string, count: number) => {
    setManualExercises(manualExercises.map(ex => {
      if (ex.id !== id) return ex;
      
      const currentSets = ex.sets.length;
      let newSets = [...ex.sets];
      
      if (count > currentSets) {
        for (let i = currentSets; i < count; i++) {
          newSets.push({ setNumber: i + 1, reps: 0, weight: 0, completed: false });
        }
      } else if (count < currentSets) {
        newSets = newSets.slice(0, count);
      }
      
      return { ...ex, plannedSets: count, sets: newSets };
    }));
  };

  const updateManualSet = (exerciseId: string, setIndex: number, field: 'reps' | 'weight', value: number) => {
    setManualExercises(manualExercises.map(ex => {
      if (ex.id !== exerciseId) return ex;
      
      const newSets = [...ex.sets];
      newSets[setIndex] = { ...newSets[setIndex], [field]: value };
      
      return { ...ex, sets: newSets };
    }));
  };

  const toggleManualSetCompleted = (exerciseId: string, setIndex: number) => {
    setManualExercises(manualExercises.map(ex => {
      if (ex.id !== exerciseId) return ex;
      
      const newSets = [...ex.sets];
      newSets[setIndex] = { ...newSets[setIndex], completed: !newSets[setIndex].completed };
      
      return { ...ex, sets: newSets };
    }));
  };

  const removeManualExercise = (id: string) => {
    setManualExercises(manualExercises.filter(ex => ex.id !== id));
  };

  const getManualCompletedSetsCount = (exercise: ManualExercise) => {
    return exercise.sets.filter(s => s.completed).length;
  };

  if (loading) {
    return (
      <Card className="animate-pulse">
        <CardContent className="p-8">
          <div className="flex items-center justify-center gap-2">
            <Dumbbell className="h-6 w-6 text-muted-foreground animate-bounce" />
            <span className="text-muted-foreground">Se încarcă antrenamentul...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!hasTodayWorkout) {
    return (
      <Card>
        <CardContent className="p-8 text-center space-y-4">
          <div className="w-16 h-16 mx-auto rounded-full bg-muted flex items-center justify-center">
            <Dumbbell className="h-8 w-8 text-muted-foreground" />
          </div>
          <div>
            <h3 className="font-semibold text-lg">Niciun antrenament planificat</h3>
            <p className="text-muted-foreground text-sm mt-1">
              {todayPlan?.is_rest_day 
                ? 'Azi e zi de odihnă! 😴'
                : 'Creează un program săptămânal pentru a vedea antrenamentul zilei.'}
            </p>
          </div>
          <Button variant="outline" onClick={onComplete}>
            Continuă fără antrenament
          </Button>
        </CardContent>
      </Card>
    );
  }

  const progress = getCompletedProgress();
  const dayInfo = DAYS_OF_WEEK.find(d => d.value === todayPlan?.day_of_week);

  const handleEndSession = async () => {
    const success = await endSession();
    if (success) {
      onComplete();
    }
  };

  const groupedPresets = PRESET_EXERCISES.reduce((acc, ex) => {
    if (!acc[ex.category]) acc[ex.category] = [];
    acc[ex.category].push(ex.name);
    return acc;
  }, {} as Record<string, string[]>);

  return (
    <Card className="overflow-hidden">
      {/* Mode Tabs */}
      <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as 'template' | 'manual')} className="w-full">
        <div className="border-b">
          <TabsList className="w-full h-12 p-1 bg-muted/30 rounded-none">
            <TabsTrigger value="template" className="flex-1 gap-2 data-[state=active]:bg-background">
              <FileText className="h-4 w-4" />
              Template
            </TabsTrigger>
            <TabsTrigger value="manual" className="flex-1 gap-2 data-[state=active]:bg-background">
              <Pencil className="h-4 w-4" />
              Manual
            </TabsTrigger>
          </TabsList>
        </div>

        {/* Template Tab Content */}
        <TabsContent value="template" className="m-0">
          {/* Header with gradient */}
          <div className="bg-gradient-to-r from-primary/20 via-primary/10 to-transparent p-6 border-b">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center">
                  <Dumbbell className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <h2 className="font-bold text-xl">
                    {dayInfo?.label} - {todayPlan?.name || 'Antrenament'}
                  </h2>
                  <p className="text-sm text-muted-foreground">
                    {exercises.length} exerciții planificate
                  </p>
                </div>
              </div>

              {/* Timer */}
              <div className="text-right">
                <div className={cn(
                  "text-3xl font-mono font-bold",
                  isStarted && "text-primary"
                )}>
                  {formatTime(elapsedTime)}
                </div>
                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                  <Timer className="h-3 w-3" />
                  <span>Timp scurs</span>
                </div>
              </div>
            </div>

            {/* Progress bar */}
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Progres</span>
                <span className="font-medium">
                  {progress.completedSets}/{progress.totalSets} seturi ({Math.round(progress.percentage)}%)
                </span>
              </div>
              <Progress value={progress.percentage} className="h-2" />
            </div>

            {/* Action buttons */}
            <div className="flex gap-2 mt-4">
              {!isStarted ? (
                <Button onClick={startSession} className="gap-2 flex-1">
                  <Play className="h-4 w-4" />
                  Începe Antrenamentul
                </Button>
              ) : (
                <>
                  <Button onClick={handleEndSession} variant="default" className="gap-2 flex-1">
                    <Square className="h-4 w-4" />
                    Termină & Salvează
                  </Button>
                  <Button onClick={resetSession} variant="outline" size="icon">
                    <RotateCcw className="h-4 w-4" />
                  </Button>
                </>
              )}
            </div>
          </div>

          <CardContent className="p-4 space-y-3">
            {/* Exercise cards */}
            {exercises.map((exercise, index) => (
              <ExerciseCard
                key={exercise.id}
                exercise={exercise}
                index={index}
                isStarted={isStarted}
                onToggleExpanded={() => toggleExerciseExpanded(exercise.id)}
                onToggleSetCompleted={(setIndex) => toggleSetCompleted(exercise.id, setIndex)}
                onUpdateSet={(setIndex, field, value) => 
                  updateSetProgress(exercise.id, setIndex, { [field]: value })
                }
                onCopyLastSession={() => copyFromLastSession(exercise.id)}
                onRemove={() => removeExercise(exercise.id)}
                onUpdateSetsCount={(count) => updateExerciseSetsCount(exercise.id, count)}
              />
            ))}

            {/* Add exercise */}
            {isStarted && (
              <div className="pt-2">
                {showAddExercise ? (
                  <div className="flex gap-2">
                    <Select onValueChange={(value) => {
                      addExtraExercise(value);
                      setShowAddExercise(false);
                    }}>
                      <SelectTrigger className="flex-1">
                        <SelectValue placeholder="Selectează exercițiu..." />
                      </SelectTrigger>
                      <SelectContent className="max-h-[300px]">
                        {Object.entries(groupedPresets).map(([category, names]) => (
                          <div key={category}>
                            <div className="px-2 py-1.5 text-sm font-semibold text-muted-foreground bg-muted/50">
                              {category}
                            </div>
                            {names.map((name) => (
                              <SelectItem key={name} value={name}>
                                {name}
                              </SelectItem>
                            ))}
                          </div>
                        ))}
                      </SelectContent>
                    </Select>
                    <Button variant="ghost" onClick={() => setShowAddExercise(false)}>
                      Anulează
                    </Button>
                  </div>
                ) : (
                  <Button 
                    variant="outline" 
                    className="w-full gap-2 border-dashed"
                    onClick={() => setShowAddExercise(true)}
                  >
                    <Plus className="h-4 w-4" />
                    Adaugă exercițiu extra
                  </Button>
                )}
              </div>
            )}

            {/* Complete button when not started */}
            {!isStarted && progress.completedSets > 0 && (
              <Button onClick={onComplete} className="w-full gap-2 mt-4">
                <Check className="h-4 w-4" />
                Completează Antrenamentul
              </Button>
            )}
          </CardContent>
        </TabsContent>

        {/* Manual Tab Content */}
        <TabsContent value="manual" className="m-0">
          <div className="p-4 space-y-4">
            {/* Timer and controls */}
            <div className="p-4 rounded-lg bg-muted/50 text-center">
              <div className="text-4xl font-mono font-bold text-foreground mb-4">
                {formatManualTime(manualElapsedTime)}
              </div>
              
              {!isManualStarted ? (
                <Button onClick={startManualWorkout} className="gap-2" size="lg">
                  <Play className="h-5 w-5" />
                  Start Workout Manual
                </Button>
              ) : (
                <Button onClick={stopManualWorkout} variant="destructive" className="gap-2">
                  <Square className="h-4 w-4" />
                  Stop & Salvează
                </Button>
              )}
            </div>

            {/* Manual exercises */}
            {isManualStarted && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-medium">Exerciții</h3>
                  <div className="flex gap-2">
                    <Select onValueChange={(value) => addManualExercise(value)}>
                      <SelectTrigger className="w-[180px]">
                        <SelectValue placeholder="Adaugă exercițiu..." />
                      </SelectTrigger>
                      <SelectContent className="max-h-[300px]">
                        {Object.entries(groupedPresets).map(([category, exList]) => (
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
                    <Button variant="outline" size="sm" onClick={() => addManualExercise()} className="gap-1">
                      <Plus className="h-4 w-4" />
                      Custom
                    </Button>
                  </div>
                </div>

                {manualExercises.map((exercise) => (
                  <div key={exercise.id} className="p-4 rounded-lg border bg-card space-y-4">
                    {/* Header exercițiu */}
                    <div className="flex items-center gap-2">
                      <Input
                        placeholder="Nume exercițiu (ex: Squat, Bench Press...)"
                        value={exercise.name}
                        onChange={(e) => updateManualExerciseName(exercise.id, e.target.value)}
                        className="flex-1 font-medium"
                      />
                      <div className="flex items-center gap-1">
                        <Label className="text-xs text-muted-foreground whitespace-nowrap">Seturi:</Label>
                        <Input
                          type="number"
                          min={1}
                          max={10}
                          value={exercise.plannedSets}
                          onChange={(e) => updateManualPlannedSets(exercise.id, parseInt(e.target.value) || 1)}
                          className="w-16"
                        />
                      </div>
                      <Button 
                        variant="ghost" 
                        size="icon"
                        onClick={() => removeManualExercise(exercise.id)}
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>

                    {/* Progres */}
                    <div className="text-sm text-muted-foreground">
                      Completate: {getManualCompletedSetsCount(exercise)}/{exercise.plannedSets} seturi
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
                            onClick={() => toggleManualSetCompleted(exercise.id, idx)}
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
                              onChange={(e) => updateManualSet(exercise.id, idx, 'reps', parseInt(e.target.value) || 0)}
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
                              onChange={(e) => updateManualSet(exercise.id, idx, 'weight', parseFloat(e.target.value) || 0)}
                              className="w-20 h-8 text-center"
                            />
                            <span className="text-muted-foreground text-sm">kg</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}

                {manualExercises.length === 0 && (
                  <div className="text-center py-8 text-muted-foreground">
                    <Dumbbell className="h-8 w-8 mx-auto mb-2 opacity-50" />
                    <p>Adaugă primul exercițiu folosind butoanele de mai sus</p>
                  </div>
                )}
              </div>
            )}

            {!isManualStarted && (
              <div className="text-center py-4 text-muted-foreground text-sm">
                Apasă "Start Workout Manual" pentru a adăuga exerciții cu nume, seturi, kg și repetări
              </div>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </Card>
  );
}

interface ExerciseCardProps {
  exercise: ExerciseProgress;
  index: number;
  isStarted: boolean;
  onToggleExpanded: () => void;
  onToggleSetCompleted: (setIndex: number) => void;
  onUpdateSet: (setIndex: number, field: 'reps' | 'weight', value: number) => void;
  onCopyLastSession: () => void;
  onRemove: () => void;
  onUpdateSetsCount: (count: number) => void;
}

function ExerciseCard({
  exercise,
  index,
  isStarted,
  onToggleExpanded,
  onToggleSetCompleted,
  onUpdateSet,
  onCopyLastSession,
  onRemove,
  onUpdateSetsCount,
}: ExerciseCardProps) {
  const completedSets = exercise.sets.filter(s => s.completed).length;
  const allCompleted = completedSets === exercise.sets.length;
  const isExtra = !exercise.planId;

  return (
    <Collapsible open={exercise.isExpanded} onOpenChange={onToggleExpanded}>
      <div className={cn(
        "border rounded-lg overflow-hidden transition-all",
        allCompleted && "border-green-500/50 bg-green-500/5",
        !allCompleted && exercise.isExpanded && "border-primary/50"
      )}>
        {/* Exercise header */}
        <CollapsibleTrigger asChild>
          <div className="flex items-center gap-3 p-3 cursor-pointer hover:bg-muted/50 transition-colors">
            <div className={cn(
              "w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold",
              allCompleted 
                ? "bg-green-500 text-white" 
                : "bg-muted text-muted-foreground"
            )}>
              {allCompleted ? <Check className="h-4 w-4" /> : index + 1}
            </div>
            
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className="font-medium truncate">{exercise.name}</span>
                {isExtra && (
                  <Badge variant="secondary" className="text-xs">Extra</Badge>
                )}
              </div>
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <Target className="h-3 w-3" />
                <span>{exercise.targetSets} × {exercise.targetReps}</span>
                {exercise.targetWeight && (
                  <span>@ {exercise.targetWeight}kg</span>
                )}
                <span className="mx-1">•</span>
                <span className={cn(
                  allCompleted && "text-green-500 font-medium"
                )}>
                  {completedSets}/{exercise.sets.length} completate
                </span>
              </div>
            </div>

            {exercise.isExpanded ? (
              <ChevronUp className="h-5 w-5 text-muted-foreground" />
            ) : (
              <ChevronDown className="h-5 w-5 text-muted-foreground" />
            )}
          </div>
        </CollapsibleTrigger>

        {/* Exercise content */}
        <CollapsibleContent>
          <div className="border-t p-3 space-y-3">
            {/* Quick actions */}
            {isStarted && (
              <div className="flex gap-2">
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="gap-1"
                  onClick={onCopyLastSession}
                >
                  <Copy className="h-3 w-3" />
                  Copiază ultima
                </Button>
                <div className="flex items-center gap-1 ml-auto">
                  <span className="text-xs text-muted-foreground">Seturi:</span>
                  <Input
                    type="number"
                    min={1}
                    max={10}
                    value={exercise.targetSets}
                    onChange={(e) => onUpdateSetsCount(parseInt(e.target.value) || 1)}
                    className="w-14 h-7 text-center text-sm"
                  />
                </div>
                {isExtra && (
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="h-7 w-7"
                    onClick={onRemove}
                  >
                    <Trash2 className="h-3 w-3 text-destructive" />
                  </Button>
                )}
              </div>
            )}

            {/* Sets table */}
            <div className="space-y-2">
              {exercise.sets.map((set, setIndex) => (
                <div
                  key={setIndex}
                  className={cn(
                    "flex items-center gap-2 p-2 rounded-md transition-colors",
                    set.completed 
                      ? "bg-green-500/10 border border-green-500/30" 
                      : "bg-muted/30"
                  )}
                >
                  <Button
                    variant={set.completed ? "default" : "outline"}
                    size="sm"
                    className={cn(
                      "h-8 w-8 p-0",
                      set.completed && "bg-green-500 hover:bg-green-600"
                    )}
                    onClick={() => onToggleSetCompleted(setIndex)}
                    disabled={!isStarted}
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
                      placeholder={exercise.targetReps}
                      value={set.reps || ''}
                      onChange={(e) => onUpdateSet(setIndex, 'reps', parseInt(e.target.value) || 0)}
                      className="w-16 h-8 text-center"
                      disabled={!isStarted}
                    />
                    <span className="text-sm text-muted-foreground">reps</span>
                  </div>

                  <div className="flex items-center gap-1 flex-1">
                    <Input
                      type="number"
                      placeholder={exercise.targetWeight?.toString() || '0'}
                      step="0.5"
                      value={set.weight || ''}
                      onChange={(e) => onUpdateSet(setIndex, 'weight', parseFloat(e.target.value) || 0)}
                      className="w-16 h-8 text-center"
                      disabled={!isStarted}
                    />
                    <span className="text-sm text-muted-foreground">kg</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </CollapsibleContent>
      </div>
    </Collapsible>
  );
}
