import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
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
} from 'lucide-react';
import { useTodayWorkout, ExerciseProgress, SetProgress } from '@/hooks/useTodayWorkout';
import { DAYS_OF_WEEK } from '@/types/workout';
import { cn } from '@/lib/utils';

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
