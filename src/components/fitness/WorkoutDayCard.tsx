import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { 
  Plus, Trash2, Edit2, Check, X, Bed, Dumbbell,
  GripVertical, ChevronDown, ChevronUp
} from 'lucide-react';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { useLanguage } from '@/context/LanguageContext';
import type { WorkoutProgramDay, WorkoutDayExercise } from '@/types/workout';
import { DAYS_OF_WEEK } from '@/types/workout';

interface WorkoutDayCardProps {
  day: WorkoutProgramDay;
  onUpdateDay: (dayId: string, updates: Partial<WorkoutProgramDay>) => void;
  onAddExercise: (dayId: string, exercise: Partial<WorkoutDayExercise>) => void;
  onUpdateExercise: (exerciseId: string, updates: Partial<WorkoutDayExercise>) => void;
  onDeleteExercise: (exerciseId: string) => void;
  isCompact?: boolean;
}

export function WorkoutDayCard({
  day,
  onUpdateDay,
  onAddExercise,
  onUpdateExercise,
  onDeleteExercise,
  isCompact = false,
}: WorkoutDayCardProps) {
  const { language } = useLanguage();
  const [isExpanded, setIsExpanded] = useState(!isCompact);
  const [editingExercise, setEditingExercise] = useState<string | null>(null);
  const [editingName, setEditingName] = useState(false);
  const [tempName, setTempName] = useState(day.name || '');
  const [tempExercise, setTempExercise] = useState<Partial<WorkoutDayExercise>>({});

  const dayInfo = DAYS_OF_WEEK.find(d => d.value === day.day_of_week);
  const dayLabel = language === 'en' ? dayInfo?.labelEn : dayInfo?.label;
  const dayShort = language === 'en' ? dayInfo?.shortEn : dayInfo?.short;

  const handleSaveName = () => {
    onUpdateDay(day.id, { name: tempName });
    setEditingName(false);
  };

  const handleStartEditExercise = (exercise: WorkoutDayExercise) => {
    setEditingExercise(exercise.id);
    setTempExercise({
      exercise_name: exercise.exercise_name,
      target_sets: exercise.target_sets,
      target_reps: exercise.target_reps,
    });
  };

  const handleSaveExercise = (exerciseId: string) => {
    onUpdateExercise(exerciseId, tempExercise);
    setEditingExercise(null);
    setTempExercise({});
  };

  const [newExerciseId, setNewExerciseId] = useState<string | null>(null);

  const handleAddNewExercise = async () => {
    const nextOrder = (day.exercises?.length || 0);
    // Add with empty name so user must enter it
    await onAddExercise(day.id, {
      exercise_name: '',
      target_sets: 3,
      target_reps: '10',
      order_index: nextOrder,
    });
    // Mark as pending edit - will be handled when exercises update
    setNewExerciseId('pending');
  };

  // Auto-start editing the newest exercise when added
  React.useEffect(() => {
    if (newExerciseId === 'pending' && day.exercises && day.exercises.length > 0) {
      const lastExercise = day.exercises[day.exercises.length - 1];
      if (lastExercise && !lastExercise.exercise_name) {
        setEditingExercise(lastExercise.id);
        setTempExercise({
          exercise_name: '',
          target_sets: lastExercise.target_sets || 3,
          target_reps: lastExercise.target_reps || '10',
        });
        setNewExerciseId(null);
      }
    }
  }, [day.exercises, newExerciseId]);

  if (isCompact) {
    return (
      <Card className={`glass-card ${day.is_rest_day ? 'opacity-60' : ''}`}>
        <CardHeader className="p-3 pb-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Badge variant={day.is_rest_day ? 'secondary' : 'default'} className="text-xs">
                {dayShort}
              </Badge>
              {day.is_rest_day ? (
                <Bed className="w-4 h-4 text-muted-foreground" />
              ) : (
                <Dumbbell className="w-4 h-4 text-primary" />
              )}
            </div>
            <Button 
              variant="ghost" 
              size="sm"
              onClick={() => setIsExpanded(!isExpanded)}
            >
              {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </Button>
          </div>
          {day.name && (
            <p className="text-xs text-muted-foreground truncate">{day.name}</p>
          )}
        </CardHeader>
        
        {isExpanded && (
          <CardContent className="p-3 pt-0">
            {day.is_rest_day ? (
              <p className="text-xs text-muted-foreground text-center py-2">
                {language === 'en' ? 'Rest Day' : 'Zi de odihnă'}
              </p>
            ) : (
              <div className="space-y-1">
                {day.exercises?.map((ex) => (
                  <div key={ex.id} className="text-xs flex justify-between">
                    <span className="truncate">{ex.exercise_name}</span>
                    <span className="text-muted-foreground">{ex.target_sets}×{ex.target_reps}</span>
                  </div>
                ))}
                {(!day.exercises || day.exercises.length === 0) && (
                  <p className="text-xs text-muted-foreground text-center">
                    {language === 'en' ? 'No exercises' : 'Fără exerciții'}
                  </p>
                )}
              </div>
            )}
          </CardContent>
        )}
      </Card>
    );
  }

  return (
    <Card className={`glass-card ${day.is_rest_day ? 'bg-muted/30' : ''}`}>
      <CardHeader className="p-4 pb-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Badge variant={day.is_rest_day ? 'secondary' : 'default'}>
              {dayLabel}
            </Badge>
            
            {editingName ? (
              <div className="flex items-center gap-2">
                <Input
                  value={tempName}
                  onChange={(e) => setTempName(e.target.value)}
                  className="h-7 w-32 text-sm"
                  placeholder={language === 'en' ? 'Day name...' : 'Nume zi...'}
                />
                <Button size="sm" variant="ghost" onClick={handleSaveName}>
                  <Check className="w-4 h-4" />
                </Button>
                <Button size="sm" variant="ghost" onClick={() => setEditingName(false)}>
                  <X className="w-4 h-4" />
                </Button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium">{day.name || (language === 'en' ? 'Unnamed' : 'Fără nume')}</span>
                <Button 
                  size="sm" 
                  variant="ghost" 
                  onClick={() => {
                    setTempName(day.name || '');
                    setEditingName(true);
                  }}
                >
                  <Edit2 className="w-3 h-3" />
                </Button>
              </div>
            )}
          </div>

          <div className="flex items-center gap-2">
            <Label htmlFor={`rest-${day.id}`} className="text-xs text-muted-foreground">
              {language === 'en' ? 'Rest' : 'Odihnă'}
            </Label>
            <Switch
              id={`rest-${day.id}`}
              checked={day.is_rest_day}
              onCheckedChange={(checked) => onUpdateDay(day.id, { is_rest_day: checked })}
            />
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-4 pt-2">
        {day.is_rest_day ? (
          <div className="flex items-center justify-center py-6 text-muted-foreground">
            <Bed className="w-8 h-8 mr-2" />
            <span>{language === 'en' ? 'Rest Day - Recovery Time' : 'Zi de odihnă - Recuperare'}</span>
          </div>
        ) : (
          <div className="space-y-2">
            {day.exercises?.map((exercise, index) => (
              <div 
                key={exercise.id}
                className="flex items-center gap-2 p-2 rounded-lg bg-background/50 hover:bg-background/80 transition-colors"
              >
                <GripVertical className="w-4 h-4 text-muted-foreground cursor-grab" />
                
                {editingExercise === exercise.id ? (
                  <div className="flex-1 flex flex-col gap-2">
                    <Input
                      value={tempExercise.exercise_name || ''}
                      onChange={(e) => setTempExercise({ ...tempExercise, exercise_name: e.target.value })}
                      className="h-9"
                      placeholder={language === 'en' ? 'Exercise name...' : 'Nume exercițiu...'}
                      autoFocus
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          handleSaveExercise(exercise.id);
                        } else if (e.key === 'Escape') {
                          // If it's a new exercise with no name, delete it
                          if (!exercise.exercise_name) {
                            onDeleteExercise(exercise.id);
                          }
                          setEditingExercise(null);
                        }
                      }}
                    />
                    <div className="flex items-center gap-2">
                      <div className="flex items-center gap-1">
                        <Label className="text-xs text-muted-foreground">Sets:</Label>
                        <Input
                          type="number"
                          value={tempExercise.target_sets || 3}
                          onChange={(e) => setTempExercise({ ...tempExercise, target_sets: parseInt(e.target.value) || 3 })}
                          className="h-8 w-16"
                          min={1}
                          max={20}
                        />
                      </div>
                      <span className="text-muted-foreground">×</span>
                      <div className="flex items-center gap-1">
                        <Label className="text-xs text-muted-foreground">Reps:</Label>
                        <Input
                          value={tempExercise.target_reps || ''}
                          onChange={(e) => setTempExercise({ ...tempExercise, target_reps: e.target.value })}
                          className="h-8 w-20"
                          placeholder="10"
                        />
                      </div>
                      <div className="flex-1" />
                      <Button size="sm" variant="default" onClick={() => handleSaveExercise(exercise.id)}>
                        <Check className="w-4 h-4 mr-1" />
                        {language === 'en' ? 'Save' : 'Salvează'}
                      </Button>
                      <Button 
                        size="sm" 
                        variant="ghost" 
                        onClick={() => {
                          if (!exercise.exercise_name) {
                            onDeleteExercise(exercise.id);
                          }
                          setEditingExercise(null);
                        }}
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                ) : (
                  <>
                    <span className="text-sm text-muted-foreground w-6">{index + 1}.</span>
                    <span 
                      className="flex-1 text-sm font-medium cursor-pointer hover:text-primary transition-colors"
                      onClick={() => handleStartEditExercise(exercise)}
                    >
                      {exercise.exercise_name || (language === 'en' ? 'Click to name...' : 'Click pentru nume...')}
                    </span>
                    <Badge variant="outline" className="text-xs">
                      {exercise.target_sets} × {exercise.target_reps}
                    </Badge>
                    <Button 
                      size="sm" 
                      variant="ghost"
                      onClick={() => handleStartEditExercise(exercise)}
                    >
                      <Edit2 className="w-3 h-3" />
                    </Button>
                    <Button 
                      size="sm" 
                      variant="ghost"
                      onClick={() => onDeleteExercise(exercise.id)}
                    >
                      <Trash2 className="w-3 h-3 text-destructive" />
                    </Button>
                  </>
                )}
              </div>
            ))}

            <Button
              variant="outline"
              size="sm"
              className="w-full mt-2"
              onClick={handleAddNewExercise}
            >
              <Plus className="w-4 h-4 mr-2" />
              {language === 'en' ? 'Add Exercise' : 'Adaugă Exercițiu'}
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
