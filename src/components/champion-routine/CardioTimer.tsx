import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Play, Square, Check, Footprints, Bike, PersonStanding } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { format } from 'date-fns';

type CardioActivityType = 'running' | 'cycling' | 'walking';

interface CardioTimerProps {
  activityType: CardioActivityType;
  onComplete: (data: { duration: number; distance?: number; notes?: string }) => void;
  onBack: () => void;
}

const STORAGE_KEY_PREFIX = 'cardio_session_';
const AUTO_SAVE_INTERVAL = 30000; // 30 seconds

interface StoredSession {
  seconds: number;
  distance: string;
  notes: string;
  isRunning: boolean;
  startTime: string | null;
  lastUpdate: number;
}

export function CardioTimer({ activityType, onComplete, onBack }: CardioTimerProps) {
  const today = format(new Date(), 'yyyy-MM-dd');
  const storageKey = `${STORAGE_KEY_PREFIX}${activityType}_${today}`;

  // Initialize from localStorage
  const getInitialState = useCallback((): StoredSession => {
    try {
      const stored = localStorage.getItem(storageKey);
      if (stored) {
        const session: StoredSession = JSON.parse(stored);
        // Check if session is from today and recent (within last 2 hours)
        const isRecent = Date.now() - session.lastUpdate < 7200000;
        if (isRecent) {
          return session;
        }
      }
    } catch (e) {
      console.error('Error reading cardio session:', e);
    }
    return { seconds: 0, distance: '', notes: '', isRunning: false, startTime: null, lastUpdate: Date.now() };
  }, [storageKey]);

  const initialState = getInitialState();
  const [isRunning, setIsRunning] = useState(initialState.isRunning);
  const [seconds, setSeconds] = useState(initialState.seconds);
  const [distance, setDistance] = useState<string>(initialState.distance);
  const [notes, setNotes] = useState<string>(initialState.notes);
  const [isSaved, setIsSaved] = useState(false);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const autoSaveRef = useRef<NodeJS.Timeout | null>(null);
  const startTimeRef = useRef<Date | null>(initialState.startTime ? new Date(initialState.startTime) : null);

  // Save to localStorage
  const saveToStorage = useCallback((currentSeconds: number, running: boolean) => {
    try {
      const session: StoredSession = {
        seconds: currentSeconds,
        distance,
        notes,
        isRunning: running,
        startTime: startTimeRef.current?.toISOString() || null,
        lastUpdate: Date.now()
      };
      localStorage.setItem(storageKey, JSON.stringify(session));
    } catch (e) {
      console.error('Error saving cardio session:', e);
    }
  }, [storageKey, distance, notes]);

  // Timer interval
  useEffect(() => {
    if (isRunning) {
      intervalRef.current = setInterval(() => {
        setSeconds(s => s + 1);
      }, 1000);
    } else if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isRunning]);

  // Auto-save every 30 seconds when running
  useEffect(() => {
    if (isRunning) {
      autoSaveRef.current = setInterval(() => {
        saveToStorage(seconds, true);
      }, AUTO_SAVE_INTERVAL);
    } else if (autoSaveRef.current) {
      clearInterval(autoSaveRef.current);
    }
    return () => {
      if (autoSaveRef.current) clearInterval(autoSaveRef.current);
    };
  }, [isRunning, seconds, saveToStorage]);

  // Handle visibility change - save when tab becomes hidden
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden && isRunning) {
        saveToStorage(seconds, true);
      }
    };

    const handleBeforeUnload = () => {
      if (isRunning) {
        saveToStorage(seconds, true);
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [isRunning, seconds, saveToStorage]);

  // Save distance and notes changes to storage
  useEffect(() => {
    if (seconds > 0 || distance || notes) {
      saveToStorage(seconds, isRunning);
    }
  }, [distance, notes]);

  const formatTime = (totalSeconds: number) => {
    const hrs = Math.floor(totalSeconds / 3600);
    const mins = Math.floor((totalSeconds % 3600) / 60);
    const secs = totalSeconds % 60;
    
    if (hrs > 0) {
      return `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleStart = () => {
    setIsRunning(true);
    if (!startTimeRef.current) {
      startTimeRef.current = new Date();
    }
    saveToStorage(seconds, true);
  };

  const handleStop = async () => {
    setIsRunning(false);
    
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const endTime = new Date();
      const distanceKm = distance ? parseFloat(distance) : null;

      const { error } = await supabase
        .from('activity_sessions')
        .insert({
          user_id: user.id,
          date: format(new Date(), 'yyyy-MM-dd'),
          activity_type: activityType,
          started_at: startTimeRef.current?.toISOString(),
          ended_at: endTime.toISOString(),
          duration_seconds: seconds,
          distance_km: distanceKm,
          notes: notes || null
        });

      if (error) throw error;

      // Clear localStorage after successful save
      localStorage.removeItem(storageKey);
      
      setIsSaved(true);
      toast.success(`${getActivityLabel()} salvat! 🎉`);
      onComplete({ 
        duration: seconds, 
        distance: distanceKm || undefined, 
        notes: notes || undefined 
      });
    } catch (error) {
      console.error('Error saving activity:', error);
      toast.error('Nu am putut salva activitatea');
      // Keep in localStorage for retry
      saveToStorage(seconds, false);
    }
  };

  const getActivityLabel = () => {
    switch (activityType) {
      case 'running': return 'Alergare';
      case 'cycling': return 'Ciclism';
      case 'walking': return 'Mers pe jos';
      default: return 'Activitate';
    }
  };

  const getActivityIcon = () => {
    switch (activityType) {
      case 'running': return PersonStanding;
      case 'cycling': return Bike;
      case 'walking': return Footprints;
      default: return Footprints;
    }
  };

  const getGradient = () => {
    switch (activityType) {
      case 'running': return 'from-green-500/20 to-emerald-500/20 border-green-500/30';
      case 'cycling': return 'from-blue-500/20 to-cyan-500/20 border-blue-500/30';
      case 'walking': return 'from-purple-500/20 to-pink-500/20 border-purple-500/30';
      default: return 'from-gray-500/20 to-gray-500/20';
    }
  };

  const Icon = getActivityIcon();

  return (
    <Card className={`p-8 space-y-8 bg-gradient-to-br ${getGradient()}`}>
      {/* Header */}
      <div className="text-center space-y-4">
        <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-background/50 mb-4">
          <Icon className="h-10 w-10" />
        </div>
        <h1 className="text-2xl font-bold">{getActivityLabel()}</h1>
      </div>

      {/* Timer display */}
      <div className="flex flex-col items-center py-8">
        <div className={`relative w-56 h-56 rounded-full flex items-center justify-center ${
          isRunning 
            ? 'bg-primary/20 animate-pulse' 
            : 'bg-muted/30'
        }`}>
          {isRunning && (
            <div className="absolute inset-0 rounded-full border-4 border-primary/50 animate-ping" style={{ animationDuration: '2s' }} />
          )}
          <p className="text-5xl font-mono font-bold text-foreground z-10">
            {formatTime(seconds)}
          </p>
        </div>
        
        {/* Auto-save indicator */}
        {isRunning && (
          <div className="flex items-center gap-2 mt-4 text-xs text-muted-foreground">
            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
            Progresul se salvează automat
          </div>
        )}
      </div>

      {/* Distance and Notes - visible when running or stopped */}
      {(isRunning || seconds > 0) && (
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="distance">Distanță (km)</Label>
              <Input
                id="distance"
                type="number"
                step="0.1"
                placeholder="0.0"
                value={distance}
                onChange={(e) => setDistance(e.target.value)}
                className="bg-background/50"
              />
            </div>
            <div className="flex items-end">
              {seconds > 0 && distance && (
                <div className="p-3 rounded-lg bg-muted/30 w-full text-center">
                  <p className="text-sm text-muted-foreground">Pace</p>
                  <p className="text-lg font-bold">
                    {(seconds / 60 / parseFloat(distance || '1')).toFixed(2)} min/km
                  </p>
                </div>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Notițe (opțional)</Label>
            <Textarea
              id="notes"
              placeholder="Cum te-ai simțit? Ce traseu ai făcut?"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="bg-background/50 min-h-[80px]"
            />
          </div>
        </div>
      )}

      {/* Action buttons */}
      <div className="flex gap-3">
        {!isRunning && !isSaved ? (
          <Button 
            onClick={handleStart} 
            size="lg" 
            className="flex-1 gap-2"
          >
            <Play className="h-5 w-5" />
            {seconds > 0 ? 'Continuă' : 'Start'}
          </Button>
        ) : isRunning ? (
          <Button 
            onClick={handleStop} 
            size="lg" 
            variant="destructive"
            className="flex-1 gap-2"
          >
            <Square className="h-5 w-5" />
            Stop & Salvează
          </Button>
        ) : (
          <Button 
            size="lg" 
            className="flex-1 gap-2 bg-green-500 hover:bg-green-600"
            disabled
          >
            <Check className="h-5 w-5" />
            Salvat!
          </Button>
        )}
      </div>
    </Card>
  );
}
