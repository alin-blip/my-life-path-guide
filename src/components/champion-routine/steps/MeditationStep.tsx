import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Timer, ArrowRight, Play, Square, RotateCcw, AlertCircle, SkipForward, CheckCircle2, Headphones } from 'lucide-react';
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { format } from 'date-fns';
import { useEmpowermentMeditation } from '@/hooks/useEmpowermentMeditation';
import { EmpowermentMeditationPlayer } from '@/components/champion-routine/EmpowermentMeditationPlayer';
import { MeditationSelector } from '@/components/champion-routine/MeditationSelector';
import { BinauralType } from '@/hooks/useBinauralBeats';
import { useStepConfig, MeditationStepConfig } from '@/hooks/useStepConfig';

interface MeditationStepProps {
  initialDuration: number;
  onComplete: (seconds: number) => void;
  onNext: () => void;
  onSkip?: () => void;
}

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
  
  // Get step config
  const { config } = useStepConfig<MeditationStepConfig>('meditation');
  const defaultDurationMinutes = config?.defaultDurationMinutes ?? 10;
  const minMeditationSeconds = defaultDurationMinutes * 60;
  
  // Empowerment meditation hook - now with all meditations
  const { 
    meditation, 
    allMeditations,
    isLoading: isMeditationLoading, 
    hasMeditation,
    selectMeditation,
    toggleFavorite,
    deleteMeditationById
  } = useEmpowermentMeditation();
  
  // Set default tab based on config
  const defaultTab = config.defaultMode === 'guided' && hasMeditation ? 'guided' : 'timer';
  const [activeTab, setActiveTab] = useState<string>(defaultTab);

  // Update tab when meditation loads
  useEffect(() => {
    if (config.defaultMode === 'guided' && hasMeditation && !isMeditationLoading) {
      setActiveTab('guided');
    }
  }, [hasMeditation, isMeditationLoading, config.defaultMode]);
  
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
    onComplete(minMeditationSeconds);
    onNext();
  };

  const handleContinue = () => {
    localStorage.removeItem(storageKey);
    onNext();
  };

  const totalTime = savedDuration + seconds;
  const hasCompleted = savedDuration > 0;
  const hasMinimumTime = savedDuration >= minMeditationSeconds;
  const remainingForMinimum = minMeditationSeconds - totalTime;

  // Progress towards configured minutes
  const progressPercentage = Math.min((totalTime / minMeditationSeconds) * 100, 100);

  // Handle guided meditation complete
  const handleGuidedComplete = (durationSeconds: number) => {
    onComplete(durationSeconds);
    onNext();
  };

  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center px-4">
      <Card className="w-full max-w-2xl p-8 space-y-6 bg-gradient-to-br from-purple-500/10 via-violet-500/5 to-transparent border-purple-500/20">
        {/* Icon and Title */}
        <div className="text-center space-y-4">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-purple-500/20 mb-2">
            <Timer className="h-10 w-10 text-purple-500" />
          </div>
          <h1 className="text-3xl font-bold">Meditație</h1>
          <p className="text-muted-foreground max-w-md mx-auto">
            Minimum 10 minute de prezență și liniște.
          </p>
        </div>

        {/* Tabs for Timer vs Guided Meditation */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="timer" className="gap-2">
              <Timer className="h-4 w-4" />
              Timer
            </TabsTrigger>
            <TabsTrigger value="guided" disabled={!hasMeditation && isMeditationLoading} className="gap-2">
              <Headphones className="h-4 w-4" />
              Meditație Ghidată
              {!hasMeditation && !isMeditationLoading && (
                <span className="text-xs text-muted-foreground">(generează din Dashboard)</span>
              )}
            </TabsTrigger>
          </TabsList>

          {/* Timer Tab Content */}
          <TabsContent value="timer" className="mt-6">
            {/* Timer display */}
            <div className="flex flex-col items-center py-6 space-y-6">
              <div className={`relative w-48 h-48 rounded-full flex items-center justify-center ${
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
                    cx="96"
                    cy="96"
                    r="88"
                    stroke="currentColor"
                    strokeWidth="6"
                    fill="none"
                    className="text-muted/20"
                  />
                  <circle
                    cx="96"
                    cy="96"
                    r="88"
                    stroke="currentColor"
                    strokeWidth="6"
                    fill="none"
                    strokeDasharray={2 * Math.PI * 88}
                    strokeDashoffset={2 * Math.PI * 88 * (1 - progressPercentage / 100)}
                    className="text-purple-500 transition-all duration-1000"
                    strokeLinecap="round"
                  />
                </svg>
                
                <div className="text-center z-10">
                  <p className="text-5xl font-mono font-bold text-foreground">
                    {formatTime(isRunning ? seconds : totalTime)}
                  </p>
                  {isRunning && (
                    <p className="text-xs text-purple-400 mt-1">
                      {remainingForMinimum > 0 
                        ? `${formatTime(remainingForMinimum)} pentru 10 min`
                        : '✓ 10 min atinse!'
                      }
                    </p>
                  )}
                  {!isRunning && savedDuration > 0 && (
                    <p className="text-xs text-purple-400 mt-1">
                      Total: {formatTime(savedDuration)}
                    </p>
                  )}
                </div>
              </div>

              {/* Status text */}
              <div className="text-center">
                <p className={`text-sm ${isRunning ? 'text-purple-400' : 'text-muted-foreground'}`}>
                  {isRunning 
                    ? '🧘 Meditezi...' 
                    : hasMinimumTime 
                      ? `✨ Felicitări! Ai atins ${config.defaultDurationMinutes || 10} minute.` 
                      : hasCompleted 
                        ? `Mai ai nevoie de ${formatTime(minMeditationSeconds - savedDuration)} pentru ${config.defaultDurationMinutes || 10} min`
                        : 'Apasă Start pentru a începe'
                  }
                </p>
              </div>
            </div>

            {/* Auto-save indicator */}
            {isRunning && (
              <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground mb-4">
                <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                Progresul se salvează automat
              </div>
            )}

            {/* Minimum requirement notice */}
            {!hasMinimumTime && !isRunning && (
              <div className="flex items-start gap-3 p-3 rounded-lg bg-amber-500/10 border border-amber-500/30 mb-4">
                <AlertCircle className="h-4 w-4 text-amber-500 flex-shrink-0 mt-0.5" />
                <div className="text-xs">
                  <p className="font-medium text-amber-500 mb-1">Minim 10 minute recomandat</p>
                  <p className="text-muted-foreground">
                    Pentru a beneficia de efectele meditației, practică cel puțin 10 minute.
                  </p>
                </div>
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

              {/* Skip button */}
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
          </TabsContent>

          {/* Guided Meditation Tab Content */}
          <TabsContent value="guided" className="mt-6 space-y-4">
            {/* Meditation Selector - shows when user has meditations */}
            {allMeditations.length > 0 && (
              <MeditationSelector
                meditations={allMeditations}
                selectedId={meditation?.id}
                onSelect={selectMeditation}
                onToggleFavorite={toggleFavorite}
                onDelete={deleteMeditationById}
              />
            )}

            {/* Player for selected meditation */}
            {hasMeditation && meditation ? (
              <EmpowermentMeditationPlayer
                meditationScript={meditation.meditation_script}
                binauralType={(meditation.binaural_type || 'theta') as BinauralType}
                onComplete={handleGuidedComplete}
                onCancel={() => setActiveTab('timer')}
              />
            ) : (
              <div className="text-center py-12 space-y-4">
                <Headphones className="h-12 w-12 mx-auto text-muted-foreground/50" />
                <div>
                  <p className="text-lg font-medium mb-2">Nu ai încă o meditație ghidată</p>
                  <p className="text-sm text-muted-foreground mb-4">
                    Generează o meditație personalizată din obiectivele tale anuale în Dashboard → Vision Board
                  </p>
                </div>
                <Button 
                  variant="outline" 
                  onClick={() => setActiveTab('timer')}
                  className="gap-2"
                >
                  <Timer className="h-4 w-4" />
                  Folosește Timer
                </Button>
              </div>
            )}
          </TabsContent>
        </Tabs>
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
