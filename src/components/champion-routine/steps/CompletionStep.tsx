import React, { useEffect, useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Trophy, PartyPopper, Calendar, ArrowRight, Sparkles } from 'lucide-react';
import confetti from 'canvas-confetti';
import { useNavigate } from 'react-router-dom';

interface CompletionStepProps {
  completedSteps: number;
  totalSteps: number;
  meditationDuration: number;
  onViewHistory?: () => void;
}

export function CompletionStep({ 
  completedSteps, 
  totalSteps, 
  meditationDuration,
  onViewHistory 
}: CompletionStepProps) {
  const navigate = useNavigate();
  const [showConfetti, setShowConfetti] = useState(false);

  useEffect(() => {
    // Trigger confetti on mount
    const timer = setTimeout(() => {
      setShowConfetti(true);
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 }
      });
    }, 500);

    return () => clearTimeout(timer);
  }, []);

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return mins > 0 ? `${mins} min ${secs} sec` : `${secs} sec`;
  };

  const completionPercentage = Math.round((completedSteps / totalSteps) * 100);

  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center px-4">
      <Card className="w-full max-w-2xl p-8 space-y-8 bg-gradient-to-br from-yellow-500/10 via-amber-500/10 to-orange-500/10 border-yellow-500/30">
        {/* Trophy animation */}
        <div className="text-center space-y-4">
          <div className="relative inline-flex items-center justify-center">
            <div className="absolute inset-0 w-32 h-32 rounded-full bg-yellow-500/20 animate-ping" style={{ animationDuration: '2s' }} />
            <div className="w-32 h-32 rounded-full bg-gradient-to-br from-yellow-400 to-amber-500 flex items-center justify-center shadow-lg shadow-yellow-500/50">
              <Trophy className="h-16 w-16 text-white" />
            </div>
          </div>
          
          <div className="space-y-2">
            <h1 className="text-4xl font-bold flex items-center justify-center gap-2">
              Felicitări! <PartyPopper className="h-8 w-8 text-yellow-500" />
            </h1>
            <p className="text-xl text-muted-foreground">
              Ai completat Rutina de Campion!
            </p>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 text-center">
          <div className="p-4 rounded-lg bg-muted/30">
            <p className="text-3xl font-bold text-green-500">{completedSteps}</p>
            <p className="text-sm text-muted-foreground">Pași completați</p>
          </div>
          <div className="p-4 rounded-lg bg-muted/30">
            <p className="text-3xl font-bold text-purple-500">{formatDuration(meditationDuration)}</p>
            <p className="text-sm text-muted-foreground">Meditație</p>
          </div>
          <div className="p-4 rounded-lg bg-muted/30">
            <p className="text-3xl font-bold text-amber-500">{completionPercentage}%</p>
            <p className="text-sm text-muted-foreground">Completare</p>
          </div>
        </div>

        {/* Motivational message */}
        <div className="p-6 rounded-xl bg-gradient-to-br from-primary/10 to-primary/5 border border-primary/20 text-center">
          <Sparkles className="h-8 w-8 mx-auto text-primary mb-3" />
          <p className="text-lg">
            Fiecare zi în care îți faci rutina te aduce mai aproape de versiunea 
            extraordinară a ta. Continuă așa! 
          </p>
        </div>

        {/* Actions */}
        <div className="flex flex-col gap-3">
          <Button 
            onClick={() => navigate('/dashboard')} 
            size="lg" 
            className="w-full gap-2"
          >
            Înapoi la Dashboard
            <ArrowRight className="h-5 w-5" />
          </Button>
          
          {onViewHistory && (
            <Button 
              onClick={onViewHistory} 
              size="lg" 
              variant="outline"
              className="w-full gap-2"
            >
              <Calendar className="h-5 w-5" />
              Vezi Istoricul
            </Button>
          )}
        </div>
      </Card>
    </div>
  );
}
