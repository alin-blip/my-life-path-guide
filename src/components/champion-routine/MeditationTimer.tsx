import React, { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Play, Square, Timer } from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';

interface MeditationTimerProps {
  onComplete: (durationSeconds: number) => void;
  initialDuration?: number;
}

export function MeditationTimer({ onComplete, initialDuration = 0 }: MeditationTimerProps) {
  const { t } = useLanguage();
  const [isRunning, setIsRunning] = useState(false);
  const [seconds, setSeconds] = useState(initialDuration);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (isRunning) {
      intervalRef.current = setInterval(() => {
        setSeconds(prev => prev + 1);
      }, 1000);
    } else if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isRunning]);

  const formatTime = (totalSeconds: number) => {
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleStart = () => {
    setIsRunning(true);
  };

  const handleStop = () => {
    setIsRunning(false);
    onComplete(seconds);
  };

  return (
    <Card className="p-4 bg-gradient-to-br from-purple-500/10 to-indigo-500/10 border-purple-500/20">
      <div className="flex flex-col items-center gap-4">
        <div className="flex items-center gap-2 text-muted-foreground">
          <Timer className="h-4 w-4" />
          <span className="text-sm font-medium">{t('meditation') || 'Meditație'}</span>
        </div>
        
        <div className="text-4xl font-mono font-bold text-foreground">
          {formatTime(seconds)}
        </div>

        <div className="flex gap-2">
          {!isRunning ? (
            <Button
              onClick={handleStart}
              size="lg"
              className="bg-purple-600 hover:bg-purple-700 text-white gap-2"
            >
              <Play className="h-5 w-5" />
              START
            </Button>
          ) : (
            <Button
              onClick={handleStop}
              size="lg"
              variant="destructive"
              className="gap-2"
            >
              <Square className="h-5 w-5" />
              STOP
            </Button>
          )}
        </div>

        {seconds > 0 && !isRunning && (
          <p className="text-sm text-muted-foreground">
            {t('meditationCompleted') || 'Meditație completată'}: {formatTime(seconds)}
          </p>
        )}
      </div>
    </Card>
  );
}
