import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Timer, ArrowRight, Play, Square, RotateCcw, AlertCircle, SkipForward, CheckCircle2 } from 'lucide-react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { format } from 'date-fns';

interface MeditationStepProps {
  initialDuration: number;
  onComplete: (seconds: number) => void;
  onNext: () => void;
  onSkip?: () => void;
}

const MIN_MEDITATION_SECONDS = 10 * 60; // 10 minutes minimum
const STORAGE_KEY_PREFIX = 'meditation_session_';
const AUTO_SAVE_INTERVAL = 10000; // 10 seconds

interface StoredSession {
  seconds: number;
  savedDuration: number;
  isRunning: boolean;
  lastUpdate: number;
}

export function MeditationStep({ initialDuration, onComplete, onNext, onSkip }: MeditationStepProps) {
  const today = format(new Date(), 'yyyy-MM-dd');
  const storageKey = `${STORAGE_KEY_PREFIX}${today}`;
  
  // Initialize from localStorage or props
  const getInitialState = useCallback((): { seconds: number; savedDuration: number; wasRunning: boolean } => {
    try {
      const stored = localStorage.getItem(storageKey);
      if (stored) {
        const session: StoredSession = JSON.parse(stored);
        // Check if session is from today and recent (within last hour)
        const isRecent = Date.now() - session.lastUpdate < 3600000;
        if (isRecent) {
          return {
            seconds: session.isRunning ? session.seconds : 0,
            savedDuration: Math.max(session.savedDuration, initialDuration),
            wasRunning: session.isRunning
          };
        }
      }
    } catch (e) {
      console.error('Error reading meditation session:', e);
    }
    return { seconds: 0, savedDuration: initialDuration, wasRunning: false };
  }, [storageKey, initialDuration]);

  const initialState = getInitialState();
  const [isRunning, setIsRunning] = useState(initialState.wasRunning);
  const [seconds, setSeconds] = useState(initialState.seconds);
  const [savedDuration, setSavedDuration] = useState(initialState.savedDuration);
  const [showSkipDialog, setShowSkipDialog] = useState(false);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const autoSaveRef = useRef<NodeJS.Timeout | null>(null);

  // Save to localStorage
  const saveToStorage = useCallback((currentSeconds: number, currentSaved: number, running: boolean) => {
    try {
      const session: StoredSession = {
        seconds: currentSeconds,
        savedDuration: currentSaved,
        isRunning: running,
        lastUpdate: Date.now()
      };
      localStorage.setItem(storageKey, JSON.stringify(session));
    } catch (e) {
      console.error('Error saving meditation session:', e);
    }
  }, [storageKey]);

  // Save to database
  const saveToDatabase = useCallback((totalSeconds: number) => {
    if (totalSeconds > 0) {
      onComplete(totalSeconds);
    }
  }, [onComplete]);

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

  // Auto-save every 10 seconds when running
  useEffect(() => {
    if (isRunning) {
      autoSaveRef.current = setInterval(() => {
        const total = savedDuration + seconds;
        saveToStorage(seconds, savedDuration, true);
        saveToDatabase(total);
      }, AUTO_SAVE_INTERVAL);
    } else if (autoSaveRef.current) {
      clearInterval(autoSaveRef.current);
    }
    return () => {
      if (autoSaveRef.current) clearInterval(autoSaveRef.current);
    };
  }, [isRunning, seconds, savedDuration, saveToStorage, saveToDatabase]);

  // Handle visibility change - save when tab becomes hidden
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden && isRunning) {
        const total = savedDuration + seconds;
        saveToStorage(seconds, savedDuration, true);
        saveToDatabase(total);
      }
    };

    const handleBeforeUnload = () => {
      if (isRunning) {
        const total = savedDuration + seconds;
        saveToStorage(seconds, savedDuration, true);
        // Sync save to database
        saveToDatabase(total);
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [isRunning, seconds, savedDuration, saveToStorage, saveToDatabase]);

  const formatTime = (totalSeconds: number) => {
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleStartStop = () => {
    if (isRunning) {
      setIsRunning(false);
      const total = savedDuration + seconds;
      setSavedDuration(total);
      setSeconds(0);
      saveToStorage(0, total, false);
      onComplete(total);
    } else {
      setIsRunning(true);
      saveToStorage(seconds, savedDuration, true);
    }
  };

  const handleReset = () => {
    setIsRunning(false);
    setSeconds(0);
    setSavedDuration(0);
    saveToStorage(0, 0, false);
  };

  const handleSkipWithoutMeditation = () => {
    setShowSkipDialog(false);
    localStorage.removeItem(storageKey);
    onComplete(0);
    if (onSkip) {
      onSkip();
    } else {
      onNext();
    }
  };

  const handleAlreadyMeditated = () => {
    setShowSkipDialog(false);
    localStorage.removeItem(storageKey);
    onComplete(MIN_MEDITATION_SECONDS);
    onNext();
  };

  const handleContinue = () => {
    localStorage.removeItem(storageKey);
    onNext();
  };

  const totalTime = savedDuration + seconds;
  const hasCompleted = savedDuration > 0;
  const hasMinimumTime = savedDuration >= MIN_MEDITATION_SECONDS;
  const remainingForMinimum = MIN_MEDITATION_SECONDS - totalTime;

  // Progress towards 10 minutes
  const progressPercentage = Math.min((totalTime / MIN_MEDITATION_SECONDS) * 100, 100);

  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center px-4">
      <Card className="w-full max-w-2xl p-8 space-y-8 bg-gradient-to-br from-purple-500/10 via-violet-500/5 to-transparent border-purple-500/20">
        {/* Icon and Title */}
        <div className="text-center space-y-4">
          <div className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-purple-500/20 mb-4">
            <Timer className="h-12 w-12 text-purple-500" />
          </div>
          <h1 className="text-3xl font-bold">Meditație</h1>
          <p className="text-muted-foreground text-lg max-w-md mx-auto">
            Minimum 10 minute de prezență și liniște.
          </p>
        </div>

        {/* Timer display */}
        <div className="flex flex-col items-center py-8 space-y-6">
          <div className={`relative w-56 h-56 rounded-full flex items-center justify-center ${
            isRunning 
              ? 'bg-gradient-to-br from-purple-500/30 to-violet-500/30 animate-pulse' 
              : 'bg-gradient-to-br from-purple-500/20 to-violet-500/20'
          }`}>
            {/* Outer ring animation when running */}
            {isRunning && (
              <div className="absolute inset-0 rounded-full border-4 border-purple-500/50 animate-ping" style={{ animationDuration: '3s' }} />
            )}
            
            {/* Progress ring */}
            <svg className="absolute inset-0 w-full h-full transform -rotate-90">
              <circle
                cx="112"
                cy="112"
                r="100"
                stroke="currentColor"
                strokeWidth="8"
                fill="none"
                className="text-muted/20"
              />
              <circle
                cx="112"
                cy="112"
                r="100"
                stroke="currentColor"
                strokeWidth="8"
                fill="none"
                strokeDasharray={2 * Math.PI * 100}
                strokeDashoffset={2 * Math.PI * 100 * (1 - progressPercentage / 100)}
                className="text-purple-500 transition-all duration-1000"
                strokeLinecap="round"
              />
            </svg>
            
            <div className="text-center z-10">
              <p className="text-6xl font-mono font-bold text-foreground">
                {formatTime(isRunning ? seconds : totalTime)}
              </p>
              {isRunning && (
                <p className="text-sm text-purple-400 mt-2">
                  {remainingForMinimum > 0 
                    ? `${formatTime(remainingForMinimum)} pentru 10 min`
                    : '✓ 10 min atinse!'
                  }
                </p>
              )}
              {!isRunning && savedDuration > 0 && (
                <p className="text-sm text-purple-400 mt-2">
                  Total: {formatTime(savedDuration)}
                </p>
              )}
            </div>
          </div>

          {/* Status text */}
          <div className="text-center">
            <p className={`text-lg ${isRunning ? 'text-purple-400' : 'text-muted-foreground'}`}>
              {isRunning 
                ? '🧘 Meditezi...' 
                : hasMinimumTime 
                  ? '✨ Felicitări! Ai atins 10 minute.' 
                  : hasCompleted 
                    ? `Mai ai nevoie de ${formatTime(MIN_MEDITATION_SECONDS - savedDuration)} pentru 10 min`
                    : 'Apasă Start pentru a începe'
              }
            </p>
          </div>
        </div>

        {/* Auto-save indicator */}
        {isRunning && (
          <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground">
            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
            Progresul se salvează automat
          </div>
        )}

        {/* Minimum requirement notice */}
        {!hasMinimumTime && !isRunning && (
          <div className="flex items-start gap-3 p-4 rounded-lg bg-amber-500/10 border border-amber-500/30">
            <AlertCircle className="h-5 w-5 text-amber-500 flex-shrink-0 mt-0.5" />
            <div className="text-sm">
              <p className="font-medium text-amber-500 mb-1">Minim 10 minute recomandat</p>
              <p className="text-muted-foreground">
                Pentru a beneficia de efectele meditației, practică cel puțin 10 minute.
              </p>
            </div>
          </div>
        )}

        {/* Tips when not running */}
        {!isRunning && !hasCompleted && (
          <div className="p-4 rounded-lg bg-muted/30 border border-muted text-sm">
            <p className="font-medium mb-2">💡 Sugestii pentru meditație:</p>
            <ul className="list-disc list-inside space-y-1 text-muted-foreground">
              <li>Găsește o poziție confortabilă</li>
              <li>Concentrează-te pe respirație</li>
              <li>Lasă gândurile să treacă fără să le judeci</li>
            </ul>
          </div>
        )}

        {/* Action buttons */}
        <div className="flex flex-col gap-3">
          <div className="flex gap-3">
            {!hasMinimumTime || isRunning ? (
              <Button 
                onClick={handleStartStop} 
                size="lg" 
                className={`flex-1 gap-2 ${isRunning ? 'bg-red-500 hover:bg-red-600' : 'bg-purple-500 hover:bg-purple-600'}`}
              >
                {isRunning ? (
                  <>
                    <Square className="h-5 w-5" />
                    Stop & Salvează
                  </>
                ) : (
                  <>
                    <Play className="h-5 w-5" />
                    {hasCompleted ? 'Continuă Meditația' : 'Start'}
                  </>
                )}
              </Button>
            ) : (
              <>
                <Button 
                  onClick={handleReset} 
                  size="lg" 
                  variant="outline"
                  className="gap-2"
                >
                  <RotateCcw className="h-5 w-5" />
                  Adaugă timp
                </Button>
                <Button 
                  onClick={handleContinue} 
                  size="lg" 
                  className="flex-1 gap-2"
                >
                  Continuă
                  <ArrowRight className="h-5 w-5" />
                </Button>
              </>
            )}
          </div>

          {/* Skip button - always visible when not running */}
          {!isRunning && !hasMinimumTime && (
            <Button 
              onClick={() => setShowSkipDialog(true)} 
              size="lg" 
              variant="ghost"
              className="w-full gap-2 text-muted-foreground hover:text-foreground"
            >
              <SkipForward className="h-4 w-4" />
              Sari peste acest pas
            </Button>
          )}
        </div>
      </Card>

      {/* Skip confirmation dialog */}
      <AlertDialog open={showSkipDialog} onOpenChange={setShowSkipDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-amber-500" />
              Sari peste meditație?
            </AlertDialogTitle>
            <AlertDialogDescription className="text-base">
              <span className="text-amber-500 font-medium">Atenție:</span> Ziua de astăzi va fi memorată fără meditație.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="flex-col sm:flex-row gap-2">
            <AlertDialogCancel className="mt-0">Anulează</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleAlreadyMeditated}
              className="bg-green-600 hover:bg-green-700 gap-2"
            >
              <CheckCircle2 className="h-4 w-4" />
              Am meditat deja
            </AlertDialogAction>
            <AlertDialogAction 
              onClick={handleSkipWithoutMeditation}
              className="bg-amber-600 hover:bg-amber-700"
            >
              OK, sar meditația
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
