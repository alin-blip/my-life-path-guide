import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useLanguage } from '@/context/LanguageContext';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Play, Pause, RotateCcw, Coffee, Brain, Settings, Music, Volume2, VolumeX } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useBinauralBeats, type BinauralType } from '@/hooks/useBinauralBeats';

type TimerMode = 'focus' | 'shortBreak' | 'longBreak';

interface PomodoroTimerProps {
  activeTaskId: string | null;
  onComplete: () => void;
}

const TIMER_PRESETS = {
  focus: 25 * 60,
  shortBreak: 5 * 60,
  longBreak: 15 * 60,
};

export const PomodoroTimer: React.FC<PomodoroTimerProps> = ({
  activeTaskId,
  onComplete,
}) => {
  const { language } = useLanguage();
  const [mode, setMode] = useState<TimerMode>('focus');
  const [timeLeft, setTimeLeft] = useState(TIMER_PRESETS.focus);
  const [isRunning, setIsRunning] = useState(false);
  const [pomodorosCompleted, setPomodorosCompleted] = useState(0);
  const intervalRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const totalTime = TIMER_PRESETS[mode];
  const progress = ((totalTime - timeLeft) / totalTime) * 100;

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleComplete = useCallback(() => {
    setIsRunning(false);
    
    if (mode === 'focus') {
      setPomodorosCompleted(prev => prev + 1);
      onComplete();
      
      // After 4 pomodoros, suggest long break
      if ((pomodorosCompleted + 1) % 4 === 0) {
        setMode('longBreak');
        setTimeLeft(TIMER_PRESETS.longBreak);
      } else {
        setMode('shortBreak');
        setTimeLeft(TIMER_PRESETS.shortBreak);
      }
    } else {
      setMode('focus');
      setTimeLeft(TIMER_PRESETS.focus);
    }
  }, [mode, pomodorosCompleted, onComplete]);

  useEffect(() => {
    if (isRunning && timeLeft > 0) {
      intervalRef.current = setInterval(() => {
        setTimeLeft(prev => prev - 1);
      }, 1000);
    } else if (timeLeft === 0) {
      handleComplete();
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isRunning, timeLeft, handleComplete]);

  // Keyboard shortcut
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.code === 'Space' && !e.target?.toString().includes('input')) {
        e.preventDefault();
        setIsRunning(prev => !prev);
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, []);

  const toggleTimer = () => setIsRunning(prev => !prev);

  const resetTimer = () => {
    setIsRunning(false);
    setTimeLeft(TIMER_PRESETS[mode]);
  };

  const switchMode = (newMode: TimerMode) => {
    setIsRunning(false);
    setMode(newMode);
    setTimeLeft(TIMER_PRESETS[newMode]);
  };

  const getModeColor = () => {
    switch (mode) {
      case 'focus': return 'text-primary';
      case 'shortBreak': return 'text-green-500';
      case 'longBreak': return 'text-blue-500';
    }
  };

  const getModeGradient = () => {
    switch (mode) {
      case 'focus': return 'from-primary/20 to-primary/5';
      case 'shortBreak': return 'from-green-500/20 to-green-500/5';
      case 'longBreak': return 'from-blue-500/20 to-blue-500/5';
    }
  };

  return (
    <div className={cn(
      "bg-card border border-border rounded-2xl p-8 transition-all duration-500",
      `bg-gradient-to-br ${getModeGradient()}`
    )}>
      {/* Mode Selector */}
      <div className="flex justify-center gap-2 mb-8">
        <Button
          variant={mode === 'focus' ? 'default' : 'ghost'}
          size="sm"
          onClick={() => switchMode('focus')}
          className="gap-2"
        >
          <Brain className="w-4 h-4" />
          {language === 'en' ? 'Focus' : 'Focus'}
        </Button>
        <Button
          variant={mode === 'shortBreak' ? 'default' : 'ghost'}
          size="sm"
          onClick={() => switchMode('shortBreak')}
          className="gap-2"
        >
          <Coffee className="w-4 h-4" />
          {language === 'en' ? 'Short Break' : 'Pauză Scurtă'}
        </Button>
        <Button
          variant={mode === 'longBreak' ? 'default' : 'ghost'}
          size="sm"
          onClick={() => switchMode('longBreak')}
          className="gap-2"
        >
          <Coffee className="w-4 h-4" />
          {language === 'en' ? 'Long Break' : 'Pauză Lungă'}
        </Button>
      </div>

      {/* Timer Display */}
      <div className="relative flex items-center justify-center mb-8">
        {/* Circular Progress */}
        <div className="relative w-64 h-64 md:w-80 md:h-80">
          <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
            {/* Background circle */}
            <circle
              cx="50"
              cy="50"
              r="45"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              className="text-muted/20"
            />
            {/* Progress circle */}
            <circle
              cx="50"
              cy="50"
              r="45"
              fill="none"
              stroke="currentColor"
              strokeWidth="3"
              strokeLinecap="round"
              strokeDasharray={`${progress * 2.83} 283`}
              className={cn("transition-all duration-1000", getModeColor())}
            />
          </svg>
          
          {/* Time Display */}
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className={cn(
              "text-5xl md:text-6xl font-mono font-bold transition-colors",
              getModeColor()
            )}>
              {formatTime(timeLeft)}
            </span>
            <span className="text-sm text-muted-foreground mt-2 uppercase tracking-wide">
              {mode === 'focus' 
                ? (language === 'en' ? 'Focus Time' : 'Timp de Focus')
                : mode === 'shortBreak'
                ? (language === 'en' ? 'Short Break' : 'Pauză Scurtă')
                : (language === 'en' ? 'Long Break' : 'Pauză Lungă')
              }
            </span>
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className="flex items-center justify-center gap-4">
        <Button
          variant="outline"
          size="icon"
          onClick={resetTimer}
          className="w-12 h-12 rounded-full"
        >
          <RotateCcw className="w-5 h-5" />
        </Button>
        
        <Button
          size="lg"
          onClick={toggleTimer}
          className={cn(
            "w-20 h-20 rounded-full text-lg font-semibold transition-all",
            isRunning 
              ? "bg-destructive hover:bg-destructive/90" 
              : "bg-primary hover:bg-primary/90"
          )}
        >
          {isRunning ? (
            <Pause className="w-8 h-8" />
          ) : (
            <Play className="w-8 h-8 ml-1" />
          )}
        </Button>

        <Button
          variant="outline"
          size="icon"
          className="w-12 h-12 rounded-full"
        >
          <Settings className="w-5 h-5" />
        </Button>
      </div>

      {/* Keyboard hint */}
      <p className="text-center text-xs text-muted-foreground mt-6">
        {language === 'en' ? 'Press' : 'Apasă'} <kbd className="px-2 py-0.5 bg-muted rounded text-xs">Space</kbd> {language === 'en' ? 'to start/pause' : 'pentru start/pauză'}
      </p>

      {/* Session Counter */}
      <div className="flex justify-center gap-2 mt-6">
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className={cn(
              "w-3 h-3 rounded-full transition-all",
              i <= (pomodorosCompleted % 4 || (pomodorosCompleted > 0 ? 4 : 0))
                ? "bg-primary"
                : "bg-muted"
            )}
          />
        ))}
      </div>
    </div>
  );
};
