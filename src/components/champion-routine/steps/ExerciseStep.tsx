import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dumbbell, ArrowRight, Check } from 'lucide-react';
import { ActivitySelector, ActivityType } from '../ActivitySelector';
import { CardioTimer } from '../CardioTimer';
import { WorkoutStep } from '@/components/daily-flow/WorkoutStep';

interface ExerciseStepProps {
  completed: boolean;
  onComplete: (value: boolean) => void;
  onNext: () => void;
}

export function ExerciseStep({ completed, onComplete, onNext }: ExerciseStepProps) {
  const [selectedActivity, setSelectedActivity] = useState<ActivityType | null>(null);
  const [activityCompleted, setActivityCompleted] = useState(false);

  const handleActivitySelect = (type: ActivityType) => {
    setSelectedActivity(type);
    setActivityCompleted(false);
  };

  const handleCardioComplete = (data: { duration: number; distance?: number; notes?: string }) => {
    setActivityCompleted(true);
    onComplete(true);
  };

  const handleWorkoutComplete = () => {
    setActivityCompleted(true);
    onComplete(true);
  };

  const handleSkipActivity = () => {
    onNext();
  };

  // If showing workout, use the full WorkoutStep component
  if (selectedActivity === 'workout') {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between px-4">
          <Button 
            variant="ghost" 
            onClick={() => setSelectedActivity(null)}
          >
            ← Înapoi la selecție
          </Button>
          {activityCompleted && (
            <Button onClick={onNext} className="gap-2">
              Continuă
              <ArrowRight className="h-4 w-4" />
            </Button>
          )}
        </div>
        <WorkoutStep onComplete={handleWorkoutComplete} />
      </div>
    );
  }

  // If showing cardio activity with timer (running, cycling, walking)
  if (selectedActivity === 'running' || selectedActivity === 'cycling' || selectedActivity === 'walking') {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center px-4">
        <div className="w-full max-w-2xl space-y-4">
          <Button 
            variant="ghost" 
            onClick={() => setSelectedActivity(null)}
          >
            ← Înapoi la selecție
          </Button>
          <CardioTimer 
            activityType={selectedActivity}
            onComplete={handleCardioComplete}
            onBack={() => setSelectedActivity(null)}
          />
          {activityCompleted && (
            <Button onClick={onNext} size="lg" className="w-full gap-2">
              Continuă
              <ArrowRight className="h-5 w-5" />
            </Button>
          )}
        </div>
      </div>
    );
  }

  // Activity selection screen
  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center px-4">
      <Card className="w-full max-w-2xl p-8 space-y-8 bg-gradient-to-br from-red-500/10 via-orange-500/5 to-transparent border-red-500/20">
        {/* Icon and Title */}
        <div className="text-center space-y-4">
          <div className={`inline-flex items-center justify-center w-24 h-24 rounded-full transition-all duration-500 ${
            completed ? 'bg-green-500/20 scale-110' : 'bg-red-500/20'
          } mb-4`}>
            {completed ? (
              <Check className="h-12 w-12 text-green-500" />
            ) : (
              <Dumbbell className="h-12 w-12 text-red-500" />
            )}
          </div>
          <h1 className="text-3xl font-bold">Activitate Fizică</h1>
          <p className="text-muted-foreground text-lg max-w-md mx-auto">
            Alege tipul de activitate fizică pe care o vei face astăzi.
          </p>
        </div>

        {/* Activity selector */}
        <ActivitySelector 
          selected={selectedActivity}
          onSelect={handleActivitySelect}
        />

        {/* Benefits */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-center text-sm">
          {[
            { emoji: '💪', label: 'Forță' },
            { emoji: '❤️', label: 'Sănătate' },
            { emoji: '⚡', label: 'Energie' },
            { emoji: '🧠', label: 'Focus' },
          ].map(({ emoji, label }) => (
            <div key={label} className="p-3 rounded-lg bg-muted/30">
              <span className="text-2xl block mb-1">{emoji}</span>
              <span className="text-muted-foreground">{label}</span>
            </div>
          ))}
        </div>

        {/* Skip button */}
        <div className="flex flex-col gap-3">
          {completed && (
            <Button 
              onClick={onNext} 
              size="lg" 
              className="w-full gap-2"
            >
              Continuă
              <ArrowRight className="h-5 w-5" />
            </Button>
          )}
          <Button 
            variant="ghost" 
            onClick={handleSkipActivity}
            className="text-muted-foreground"
          >
            Sari peste activitatea fizică
          </Button>
        </div>
      </Card>
    </div>
  );
}
