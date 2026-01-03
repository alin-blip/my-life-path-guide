import React, { useState, useEffect, useRef } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Wind, ArrowRight, Check, Play, Pause } from 'lucide-react';

interface BreathingStepProps {
  completed: boolean;
  onComplete: (value: boolean) => void;
  onNext: () => void;
}

export function BreathingStep({ completed, onComplete, onNext }: BreathingStepProps) {
  const [isActive, setIsActive] = useState(false);
  const [phase, setPhase] = useState<'inhale' | 'hold' | 'exhale'>('inhale');
  const [cycles, setCycles] = useState(0);
  const [secondsInPhase, setSecondsInPhase] = useState(0);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  // Box breathing: 4 sec inhale, 4 sec hold, 4 sec exhale
  const PHASE_DURATION = 4;
  const TARGET_CYCLES = 5;

  useEffect(() => {
    if (isActive && cycles < TARGET_CYCLES) {
      intervalRef.current = setInterval(() => {
        setSecondsInPhase(prev => {
          if (prev >= PHASE_DURATION - 1) {
            // Move to next phase
            if (phase === 'inhale') {
              setPhase('hold');
            } else if (phase === 'hold') {
              setPhase('exhale');
            } else {
              setPhase('inhale');
              setCycles(c => c + 1);
            }
            return 0;
          }
          return prev + 1;
        });
      }, 1000);
    }

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isActive, phase, cycles]);

  useEffect(() => {
    if (cycles >= TARGET_CYCLES && !completed) {
      setIsActive(false);
      onComplete(true);
    }
  }, [cycles, completed, onComplete]);

  const toggleBreathing = () => {
    if (cycles >= TARGET_CYCLES) {
      setCycles(0);
      setSecondsInPhase(0);
      setPhase('inhale');
    }
    setIsActive(!isActive);
  };

  const getPhaseText = () => {
    switch (phase) {
      case 'inhale': return 'Inspiră';
      case 'hold': return 'Ține';
      case 'exhale': return 'Expiră';
    }
  };

  const getCircleScale = () => {
    const progress = secondsInPhase / PHASE_DURATION;
    switch (phase) {
      case 'inhale': return 1 + progress * 0.5;
      case 'hold': return 1.5;
      case 'exhale': return 1.5 - progress * 0.5;
    }
  };

  const handleConfirm = () => {
    onComplete(true);
    setTimeout(() => onNext(), 500);
  };

  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center px-4">
      <Card className="w-full max-w-2xl p-8 space-y-8 bg-gradient-to-br from-cyan-500/10 via-teal-500/5 to-transparent border-cyan-500/20">
        {/* Icon and Title */}
        <div className="text-center space-y-4">
          <div className={`inline-flex items-center justify-center w-24 h-24 rounded-full transition-all duration-500 ${
            completed ? 'bg-green-500/20 scale-110' : 'bg-cyan-500/20'
          } mb-4`}>
            {completed ? (
              <Check className="h-12 w-12 text-green-500" />
            ) : (
              <Wind className="h-12 w-12 text-cyan-500" />
            )}
          </div>
          <h1 className="text-3xl font-bold">Respirație Profundă</h1>
          <p className="text-muted-foreground text-lg max-w-md mx-auto">
            5 cicluri de respirație box breathing pentru calm și claritate mentală.
          </p>
        </div>

        {/* Breathing visualization */}
        {!completed && (
          <div className="flex flex-col items-center py-8 space-y-6">
            <div 
              className="w-40 h-40 rounded-full bg-gradient-to-br from-cyan-400/50 to-teal-400/50 flex items-center justify-center transition-transform duration-1000 ease-in-out"
              style={{ transform: `scale(${getCircleScale()})` }}
            >
              <div className="text-center">
                {isActive ? (
                  <>
                    <p className="text-2xl font-bold text-foreground">{getPhaseText()}</p>
                    <p className="text-4xl font-mono">{PHASE_DURATION - secondsInPhase}</p>
                  </>
                ) : (
                  <Play className="h-12 w-12 text-foreground" />
                )}
              </div>
            </div>

            {/* Progress */}
            <div className="flex gap-2">
              {[...Array(TARGET_CYCLES)].map((_, i) => (
                <div
                  key={i}
                  className={`w-4 h-4 rounded-full transition-all ${
                    i < cycles 
                      ? 'bg-green-500' 
                      : i === cycles && isActive
                        ? 'bg-cyan-500 animate-pulse'
                        : 'bg-muted'
                  }`}
                />
              ))}
            </div>
            <p className="text-sm text-muted-foreground">
              Ciclu {Math.min(cycles + 1, TARGET_CYCLES)} din {TARGET_CYCLES}
            </p>
          </div>
        )}

        {/* Instructions */}
        <div className="grid grid-cols-3 gap-4 text-center text-sm">
          {[
            { label: 'Inspiră', seconds: '4 sec', active: phase === 'inhale' && isActive },
            { label: 'Ține', seconds: '4 sec', active: phase === 'hold' && isActive },
            { label: 'Expiră', seconds: '4 sec', active: phase === 'exhale' && isActive },
          ].map(({ label, seconds, active }) => (
            <div 
              key={label} 
              className={`p-3 rounded-lg transition-all ${
                active ? 'bg-cyan-500/30 border-2 border-cyan-500' : 'bg-muted/30'
              }`}
            >
              <span className="font-medium block">{label}</span>
              <span className="text-muted-foreground text-xs">{seconds}</span>
            </div>
          ))}
        </div>

        {/* Action buttons */}
        {!completed ? (
          <div className="space-y-3">
            <Button 
              onClick={toggleBreathing} 
              size="lg" 
              variant={isActive ? "secondary" : "default"}
              className="w-full gap-2"
            >
              {isActive ? (
                <>
                  <Pause className="h-5 w-5" />
                  Pauză
                </>
              ) : (
                <>
                  <Play className="h-5 w-5" />
                  {cycles > 0 ? 'Continuă' : 'Începe Exercițiul'}
                </>
              )}
            </Button>
            
            {cycles > 0 && !isActive && (
              <Button 
                onClick={handleConfirm} 
                size="lg" 
                variant="outline"
                className="w-full gap-2"
              >
                <Check className="h-5 w-5" />
                Marchează ca finalizat
              </Button>
            )}
          </div>
        ) : (
          <Button 
            onClick={onNext} 
            size="lg" 
            className="w-full gap-2"
          >
            Continuă
            <ArrowRight className="h-5 w-5" />
          </Button>
        )}
      </Card>
    </div>
  );
}
