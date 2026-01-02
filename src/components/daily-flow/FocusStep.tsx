import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Target, Play, Pause, RotateCcw, Check, ExternalLink } from 'lucide-react';

interface FocusStepProps {
  onComplete: () => void;
}

export const FocusStep = ({ onComplete }: FocusStepProps) => {
  const navigate = useNavigate();
  const [timeLeft, setTimeLeft] = useState(25 * 60); // 25 minutes
  const [isRunning, setIsRunning] = useState(false);
  const [sessionsCompleted, setSessionsCompleted] = useState(0);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    if (isRunning && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft(prev => prev - 1);
      }, 1000);
    } else if (timeLeft === 0 && isRunning) {
      setIsRunning(false);
      setSessionsCompleted(prev => prev + 1);
      // Play notification sound or show toast
      if ('Notification' in window && Notification.permission === 'granted') {
        new Notification('Pomodoro completat!', { body: 'Ia o pauză de 5 minute.' });
      }
    }

    return () => clearInterval(interval);
  }, [isRunning, timeLeft]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const toggleTimer = () => {
    setIsRunning(!isRunning);
  };

  const resetTimer = () => {
    setIsRunning(false);
    setTimeLeft(25 * 60);
  };

  const goToFocusRoom = () => {
    navigate('/focus-room');
  };

  const progress = ((25 * 60 - timeLeft) / (25 * 60)) * 100;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-orange-500">
          <Target className="h-5 w-5" />
          Focus Room
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Quick Pomodoro Timer */}
        <div className="p-6 rounded-lg bg-muted/50 text-center">
          <div className="text-5xl font-mono font-bold text-foreground mb-4">
            {formatTime(timeLeft)}
          </div>
          
          {/* Progress Ring */}
          <div className="relative w-32 h-32 mx-auto mb-4">
            <svg className="w-full h-full transform -rotate-90">
              <circle
                cx="64"
                cy="64"
                r="56"
                stroke="currentColor"
                strokeWidth="8"
                fill="none"
                className="text-muted"
              />
              <circle
                cx="64"
                cy="64"
                r="56"
                stroke="currentColor"
                strokeWidth="8"
                fill="none"
                strokeDasharray={`${2 * Math.PI * 56}`}
                strokeDashoffset={`${2 * Math.PI * 56 * (1 - progress / 100)}`}
                className="text-primary transition-all duration-1000"
                strokeLinecap="round"
              />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-lg font-medium">
                {sessionsCompleted} sesiuni
              </span>
            </div>
          </div>

          <div className="flex items-center justify-center gap-4">
            <Button
              variant={isRunning ? 'secondary' : 'default'}
              size="lg"
              onClick={toggleTimer}
              className="gap-2"
            >
              {isRunning ? (
                <>
                  <Pause className="h-4 w-4" />
                  Pauză
                </>
              ) : (
                <>
                  <Play className="h-4 w-4" />
                  Start
                </>
              )}
            </Button>
            <Button variant="outline" size="lg" onClick={resetTimer}>
              <RotateCcw className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Go to Full Focus Room */}
        <Button 
          variant="outline" 
          className="w-full gap-2"
          onClick={goToFocusRoom}
        >
          <ExternalLink className="h-4 w-4" />
          Deschide Focus Room Complet
        </Button>

        <Button 
          className="w-full gap-2" 
          onClick={onComplete}
        >
          <Check className="h-4 w-4" />
          Completează Pasul
        </Button>
      </CardContent>
    </Card>
  );
};
