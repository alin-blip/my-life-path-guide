import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dumbbell, ArrowRight, Check, CheckCircle2 } from 'lucide-react';
import { ActivitySelector, ActivityType } from '../ActivitySelector';
import { CardioTimer } from '../CardioTimer';
import { WorkoutStep } from '@/components/daily-flow/WorkoutStep';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface ExerciseStepProps {
  completed: boolean;
  onComplete: (value: boolean) => void;
  onNext: () => void;
  onSkip?: () => void;
}

interface ManualActivityData {
  minutes: string;
  kg: string;
  calories: string;
}

export function ExerciseStep({ completed, onComplete, onNext, onSkip }: ExerciseStepProps) {
  const [selectedActivity, setSelectedActivity] = useState<ActivityType | null>(null);
  const [activityCompleted, setActivityCompleted] = useState(false);
  const [showManualEntry, setShowManualEntry] = useState(false);
  const [manualData, setManualData] = useState<ManualActivityData>({ minutes: '', kg: '', calories: '' });
  const [isSaving, setIsSaving] = useState(false);
  const { toast } = useToast();

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
    if (onSkip) {
      onSkip();
    } else {
      onNext();
    }
  };

  const handleSaveManualActivity = async () => {
    if (!manualData.minutes || parseInt(manualData.minutes) <= 0) {
      toast({
        title: "Eroare",
        description: "Te rog introdu numărul de minute.",
        variant: "destructive"
      });
      return;
    }

    setIsSaving(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const today = new Date().toISOString().split('T')[0];
      const durationSeconds = parseInt(manualData.minutes) * 60;

      // Save to activity_sessions table
      const { error } = await supabase
        .from('activity_sessions')
        .insert({
          user_id: user.id,
          activity_type: 'manual',
          date: today,
          duration_seconds: durationSeconds,
          notes: manualData.kg || manualData.calories 
            ? `${manualData.kg ? `${manualData.kg} kg` : ''}${manualData.kg && manualData.calories ? ', ' : ''}${manualData.calories ? `${manualData.calories} kcal` : ''}`
            : null
        });

      if (error) throw error;

      toast({
        title: "Salvat!",
        description: "Activitatea fizică a fost înregistrată.",
      });

      setActivityCompleted(true);
      onComplete(true);
      setShowManualEntry(false);
    } catch (error) {
      console.error('Error saving manual activity:', error);
      toast({
        title: "Eroare",
        description: "Nu s-a putut salva activitatea.",
        variant: "destructive"
      });
    } finally {
      setIsSaving(false);
    }
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

        {/* Manual entry form */}
        {showManualEntry && (
          <Card className="p-6 space-y-4 bg-muted/30 border-primary/20">
            <h3 className="font-semibold text-lg flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5 text-primary" />
              Am făcut deja activitate
            </h3>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="minutes">Minute *</Label>
                <Input
                  id="minutes"
                  type="number"
                  placeholder="ex: 30"
                  value={manualData.minutes}
                  onChange={(e) => setManualData(prev => ({ ...prev, minutes: e.target.value }))}
                  min="1"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="kg">Greutate (kg) - opțional</Label>
                  <Input
                    id="kg"
                    type="number"
                    placeholder="ex: 50"
                    value={manualData.kg}
                    onChange={(e) => setManualData(prev => ({ ...prev, kg: e.target.value }))}
                    min="0"
                    step="0.5"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="calories">Calorii - opțional</Label>
                  <Input
                    id="calories"
                    type="number"
                    placeholder="ex: 200"
                    value={manualData.calories}
                    onChange={(e) => setManualData(prev => ({ ...prev, calories: e.target.value }))}
                    min="0"
                  />
                </div>
              </div>
              <div className="flex gap-3">
                <Button
                  onClick={handleSaveManualActivity}
                  disabled={isSaving}
                  className="flex-1"
                >
                  {isSaving ? 'Se salvează...' : 'Salvează'}
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setShowManualEntry(false)}
                >
                  Anulează
                </Button>
              </div>
            </div>
          </Card>
        )}

        {/* Action buttons */}
        <div className="flex flex-col gap-3">
          {!showManualEntry && !completed && (
            <Button 
              variant="outline"
              onClick={() => setShowManualEntry(true)} 
              size="lg" 
              className="w-full gap-2 border-primary/30 hover:bg-primary/10"
            >
              <CheckCircle2 className="h-5 w-5" />
              Am făcut deja
            </Button>
          )}
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
