import React, { useState, useEffect, useRef } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Play, Pause, RotateCcw, Check } from 'lucide-react';

interface PomodoroTimerProps {
  onComplete: (sessions: number) => void;
  initialSessions?: number;
}

const POMODORO_DURATION = 25 * 60; // 25 minutes in seconds

export function PomodoroTimer({ onComplete, initialSessions = 0 }: PomodoroTimerProps) {
  const [isRunning, setIsRunning] = useState(false);
  const [secondsLeft, setSecondsLeft] = useState(POMODORO_DURATION);
  const [completedSessions, setCompletedSessions] = useState(initialSessions);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (isRunning && secondsLeft > 0) {
      intervalRef.current = setInterval(() => {
        setSecondsLeft(s => {
          if (s <= 1) {
            // Session complete
            setIsRunning(false);
            const newSessions = completedSessions + 1;
            setCompletedSessions(newSessions);
            onComplete(newSessions);
            return POMODORO_DURATION;
          }
          return s - 1;
        });
      }, 1000);
    } else if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isRunning, secondsLeft, completedSessions, onComplete]);

  const formatTime = (totalSeconds: number) => {
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const progress = ((POMODORO_DURATION - secondsLeft) / POMODORO_DURATION) * 100;

  const handleReset = () => {
    setIsRunning(false);
    setSecondsLeft(POMODORO_DURATION);
  };

  return (
    <div className="space-y-6">
      {/* Timer Circle */}
      <div className="flex flex-col items-center">
        <div className="relative w-48 h-48">
          {/* Background circle */}
          <svg className="w-full h-full transform -rotate-90">
            <circle
              cx="96"
              cy="96"
              r="88"
              stroke="currentColor"
              strokeWidth="8"
              fill="none"
              className="text-muted/20"
            />
            <circle
              cx="96"
              cy="96"
              r="88"
              stroke="currentColor"
              strokeWidth="8"
              fill="none"
              strokeDasharray={2 * Math.PI * 88}
              strokeDashoffset={2 * Math.PI * 88 * (1 - progress / 100)}
              className={`transition-all duration-1000 ${isRunning ? 'text-red-500' : 'text-primary'}`}
              strokeLinecap="round"
            />
          </svg>
          {/* Time display */}
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-4xl font-mono font-bold">{formatTime(secondsLeft)}</span>
            {isRunning && (
              <span className="text-sm text-red-500 animate-pulse mt-1">🍅 Deep Work</span>
            )}
          </div>
        </div>

        {/* Sessions counter */}
        <div className="flex items-center gap-2 mt-4">
          {[1, 2, 3, 4].map((session) => (
            <div
              key={session}
              className={`w-4 h-4 rounded-full transition-all ${
                session <= completedSessions
                  ? 'bg-green-500 scale-110'
                  : 'bg-muted/30'
              }`}
            />
          ))}
          <span className="text-sm text-muted-foreground ml-2">
            {completedSessions} sesiuni complete
          </span>
        </div>
      </div>

      {/* Controls */}
      <div className="flex gap-3 justify-center">
        <Button
          variant="outline"
          size="icon"
          onClick={handleReset}
          disabled={secondsLeft === POMODORO_DURATION && !isRunning}
        >
          <RotateCcw className="h-4 w-4" />
        </Button>
        <Button
          size="lg"
          onClick={() => setIsRunning(!isRunning)}
          className={`px-8 gap-2 ${isRunning ? 'bg-orange-500 hover:bg-orange-600' : ''}`}
        >
          {isRunning ? (
            <>
              <Pause className="h-5 w-5" />
              Pauză
            </>
          ) : (
            <>
              <Play className="h-5 w-5" />
              {secondsLeft === POMODORO_DURATION ? 'Start' : 'Continuă'}
            </>
          )}
        </Button>
      </div>

      {/* Tips */}
      {!isRunning && completedSessions === 0 && (
        <div className="text-center text-sm text-muted-foreground p-4 bg-muted/20 rounded-lg">
          <p className="font-medium mb-2">🎯 Reguli Pomodoro:</p>
          <ul className="space-y-1">
            <li>• 25 minute de focus intens</li>
            <li>• Fără distrageri - telefon pe silent</li>
            <li>• După 4 sesiuni, pauză lungă 15-30 min</li>
          </ul>
        </div>
      )}
    </div>
  );
}
