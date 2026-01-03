import React, { useState, useEffect, useRef } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Timer, ArrowRight, Play, Square, RotateCcw } from 'lucide-react';

interface MeditationStepProps {
  initialDuration: number;
  onComplete: (seconds: number) => void;
  onNext: () => void;
}

export function MeditationStep({ initialDuration, onComplete, onNext }: MeditationStepProps) {
  const [isRunning, setIsRunning] = useState(false);
  const [seconds, setSeconds] = useState(0);
  const [savedDuration, setSavedDuration] = useState(initialDuration);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

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
      onComplete(total);
    } else {
      setIsRunning(true);
    }
  };

  const handleReset = () => {
    setIsRunning(false);
    setSeconds(0);
    setSavedDuration(0);
  };

  const totalTime = savedDuration + seconds;
  const hasCompleted = savedDuration > 0;

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
            Ia-ți un moment pentru liniște și prezență. Nu există timp minim - meditează cât simți că ai nevoie.
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
            
            <div className="text-center z-10">
              <p className="text-6xl font-mono font-bold text-foreground">
                {formatTime(seconds)}
              </p>
              {savedDuration > 0 && !isRunning && (
                <p className="text-sm text-purple-400 mt-2">
                  Total: {formatTime(savedDuration)}
                </p>
              )}
            </div>
          </div>

          {/* Status text */}
          <p className={`text-lg ${isRunning ? 'text-purple-400' : 'text-muted-foreground'}`}>
            {isRunning ? '🧘 Meditezi...' : hasCompleted ? '✨ Sesiune salvată' : 'Apasă Start pentru a începe'}
          </p>
        </div>

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
        <div className="flex gap-3">
          {!hasCompleted || isRunning ? (
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
                  Start
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
                onClick={onNext} 
                size="lg" 
                className="flex-1 gap-2"
              >
                Continuă
                <ArrowRight className="h-5 w-5" />
              </Button>
            </>
          )}
        </div>
      </Card>
    </div>
  );
}
