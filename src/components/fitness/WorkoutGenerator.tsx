
import React, { useState } from 'react';
import { useLanguage } from '@/context/LanguageContext';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardContent, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Loader2 } from 'lucide-react';
import userPreferencesService from '@/services/fitness/userPreferencesService';
import workoutService, { WorkoutProgram, Workout, WorkoutExercise } from '@/services/fitness/workoutService';

export function WorkoutGenerator() {
  const { t } = useLanguage();
  const [isGenerating, setIsGenerating] = useState(false);
  const [activeDay, setActiveDay] = useState('day-1');
  
  // State for workout preferences
  const [preferences, setPreferences] = useState(userPreferencesService.getWorkoutPreferences());
  
  // State for workout program
  const [workoutProgram, setWorkoutProgram] = useState<WorkoutProgram | null>(null);

  const updatePreference = (field: keyof typeof preferences, value: any) => {
    const updatedPreferences = { ...preferences, [field]: value };
    setPreferences(updatedPreferences);
    userPreferencesService.updateWorkoutPreferences(updatedPreferences);
  };

  const muscleGroups = [
    'chest', 'back', 'shoulders', 'legs', 'arms', 'core'
  ];

  const toggleMuscleGroup = (muscleGroup: string) => {
    const currentTargets = [...preferences.targetMuscleGroups];
    if (currentTargets.includes(muscleGroup)) {
      updatePreference('targetMuscleGroups', currentTargets.filter(mg => mg !== muscleGroup));
    } else {
      updatePreference('targetMuscleGroups', [...currentTargets, muscleGroup]);
    }
  };
  
  const generateWorkoutProgram = () => {
    setIsGenerating(true);
    
    // Simulate API call delay
    setTimeout(() => {
      try {
        const program = workoutService.generateWorkoutProgram(
          preferences.goal,
          preferences.level,
          preferences.location,
          preferences.daysPerWeek,
          preferences.targetMuscleGroups
        );
        
        setWorkoutProgram(program);
        setActiveDay('day-1');
      } catch (error) {
        console.error('Error generating workout program:', error);
      } finally {
        setIsGenerating(false);
      }
    }, 1500);
  };

  return (
    <div className="space-y-6">
      {!workoutProgram ? (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>{t('workoutGoal')}</CardTitle>
              </CardHeader>
              <CardContent>
                <Select 
                  value={preferences.goal} 
                  onValueChange={(value: typeof preferences.goal) => updatePreference('goal', value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="build_muscle">{t('buildMuscle')}</SelectItem>
                    <SelectItem value="lose_fat">{t('loseFat')}</SelectItem>
                    <SelectItem value="improve_cardio">{t('improveCardio')}</SelectItem>
                    <SelectItem value="general_fitness">{t('generalFitness')}</SelectItem>
                    <SelectItem value="flexibility">{t('flexibility')}</SelectItem>
                  </SelectContent>
                </Select>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>{t('workoutLevel')}</CardTitle>
              </CardHeader>
              <CardContent>
                <Select 
                  value={preferences.level} 
                  onValueChange={(value: typeof preferences.level) => updatePreference('level', value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="beginner">{t('beginner')}</SelectItem>
                    <SelectItem value="intermediate">{t('intermediate')}</SelectItem>
                    <SelectItem value="advanced">{t('advanced')}</SelectItem>
                  </SelectContent>
                </Select>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>{t('workoutLocation')}</CardTitle>
              </CardHeader>
              <CardContent>
                <Select 
                  value={preferences.location} 
                  onValueChange={(value: typeof preferences.location) => updatePreference('location', value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="gym">{t('gym')}</SelectItem>
                    <SelectItem value="home">{t('home')}</SelectItem>
                    <SelectItem value="outdoors">{t('outdoors')}</SelectItem>
                  </SelectContent>
                </Select>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>{t('daysPerWeek')}</CardTitle>
              </CardHeader>
              <CardContent>
                <Select 
                  value={preferences.daysPerWeek.toString()} 
                  onValueChange={(value) => updatePreference('daysPerWeek', parseInt(value))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">1</SelectItem>
                    <SelectItem value="2">2</SelectItem>
                    <SelectItem value="3">3</SelectItem>
                    <SelectItem value="4">4</SelectItem>
                    <SelectItem value="5">5</SelectItem>
                    <SelectItem value="6">6</SelectItem>
                    <SelectItem value="7">7</SelectItem>
                  </SelectContent>
                </Select>
              </CardContent>
            </Card>
            
            <Card className="md:col-span-2">
              <CardHeader>
                <CardTitle>{t('targetMuscles')}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {muscleGroups.map((muscleGroup) => (
                    <div key={muscleGroup} className="flex items-center space-x-2">
                      <Checkbox 
                        id={`muscle-${muscleGroup}`}
                        checked={preferences.targetMuscleGroups.includes(muscleGroup)}
                        onCheckedChange={() => toggleMuscleGroup(muscleGroup)}
                      />
                      <Label htmlFor={`muscle-${muscleGroup}`} className="capitalize">
                        {muscleGroup}
                      </Label>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
          
          <Button 
            onClick={generateWorkoutProgram} 
            className="w-full"
            disabled={isGenerating}
          >
            {isGenerating ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                {t('loadingWorkout')}
              </>
            ) : (
              t('generatePlan')
            )}
          </Button>
        </div>
      ) : (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-2xl font-bold">{workoutProgram.title}</h2>
              <p className="text-muted-foreground">{workoutProgram.description}</p>
            </div>
            <Button variant="outline" onClick={() => setWorkoutProgram(null)}>
              {t('recalculate')}
            </Button>
          </div>
          
          <Tabs value={activeDay} onValueChange={setActiveDay}>
            <TabsList className="grid" style={{ gridTemplateColumns: `repeat(${workoutProgram.daysPerWeek}, 1fr)` }}>
              {workoutProgram.workouts.map((_, index) => (
                <TabsTrigger 
                  key={`day-${index + 1}`} 
                  value={`day-${index + 1}`}
                  className="data-[state=active]:bg-warrior-accent"
                >
                  {t('day')} {index + 1}
                </TabsTrigger>
              ))}
            </TabsList>
            
            {workoutProgram.workouts.map((workout, index) => (
              <TabsContent key={`day-content-${index + 1}`} value={`day-${index + 1}`} className="mt-4">
                <WorkoutDisplay workout={workout} />
              </TabsContent>
            ))}
          </Tabs>
          
          <Button className="w-full">
            {t('save')} {t('workoutGenerator')}
          </Button>
        </div>
      )}
    </div>
  );
}

interface WorkoutDisplayProps {
  workout: Workout;
}

function WorkoutDisplay({ workout }: WorkoutDisplayProps) {
  const { t } = useLanguage();
  
  return (
    <div className="space-y-6">
      <div className="pb-2 border-b border-warrior-muted/20">
        <h3 className="text-lg font-medium">{workout.title}</h3>
        <div className="flex justify-between items-center mt-2">
          <p className="text-sm text-muted-foreground">{workout.description}</p>
          <p className="text-sm">{t('duration')}: {workout.duration} {t('duration')}</p>
        </div>
      </div>
      
      <div className="space-y-4">
        {workout.exercises.map((exerciseItem, index) => (
          <Card key={`exercise-${index}`} className="bg-warrior-dark border-warrior-muted/10">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">{exerciseItem.exercise.name}</CardTitle>
              <p className="text-xs text-muted-foreground capitalize">
                {exerciseItem.exercise.muscleGroup} · {exerciseItem.exercise.type}
              </p>
            </CardHeader>
            <CardContent>
              <p className="text-sm mb-4">{exerciseItem.exercise.description}</p>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {exerciseItem.sets && (
                  <div>
                    <p className="text-xs text-muted-foreground">{t('sets')}</p>
                    <p>{exerciseItem.sets}</p>
                  </div>
                )}
                
                {exerciseItem.reps && (
                  <div>
                    <p className="text-xs text-muted-foreground">{t('reps')}</p>
                    <p>{exerciseItem.reps}</p>
                  </div>
                )}
                
                {exerciseItem.rest && (
                  <div>
                    <p className="text-xs text-muted-foreground">{t('rest')}</p>
                    <p>{exerciseItem.rest}s</p>
                  </div>
                )}
                
                {exerciseItem.duration && (
                  <div>
                    <p className="text-xs text-muted-foreground">{t('duration')}</p>
                    <p>{exerciseItem.duration}m</p>
                  </div>
                )}
                
                {exerciseItem.intensity && (
                  <div>
                    <p className="text-xs text-muted-foreground">{t('intensity')}</p>
                    <p className="capitalize">{exerciseItem.intensity}</p>
                  </div>
                )}
                
                {exerciseItem.exercise.equipment !== 'bodyweight' && exerciseItem.exercise.equipment !== 'none' && (
                  <div>
                    <p className="text-xs text-muted-foreground">{t('equipmentNeeded')}</p>
                    <p className="capitalize">{exerciseItem.exercise.equipment}</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
