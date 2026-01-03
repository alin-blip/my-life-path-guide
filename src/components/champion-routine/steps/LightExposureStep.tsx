import React from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Sun, ArrowRight, Check } from 'lucide-react';

interface LightExposureStepProps {
  completed: boolean;
  onComplete: (value: boolean) => void;
  onNext: () => void;
}

export function LightExposureStep({ completed, onComplete, onNext }: LightExposureStepProps) {
  const handleConfirm = () => {
    onComplete(true);
    setTimeout(() => onNext(), 500);
  };

  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center px-4">
      <Card className="w-full max-w-2xl p-8 space-y-8 bg-gradient-to-br from-yellow-500/10 via-orange-500/5 to-transparent border-yellow-500/20">
        {/* Icon and Title */}
        <div className="text-center space-y-4">
          <div className={`inline-flex items-center justify-center w-24 h-24 rounded-full transition-all duration-500 ${
            completed ? 'bg-green-500/20 scale-110' : 'bg-yellow-500/20'
          } mb-4`}>
            {completed ? (
              <Check className="h-12 w-12 text-green-500" />
            ) : (
              <Sun className="h-12 w-12 text-yellow-500 animate-pulse" />
            )}
          </div>
          <h1 className="text-3xl font-bold">Expunere la Lumină</h1>
          <p className="text-muted-foreground text-lg max-w-md mx-auto">
            Expune-te la lumina naturală pentru 5-10 minute pentru a-ți regla ritmul circadian și a-ți crește energia.
          </p>
        </div>

        {/* Sun rays animation */}
        <div className="flex justify-center py-8 relative">
          <div className={`relative transition-all duration-500 ${completed ? 'opacity-50' : 'opacity-100'}`}>
            <div className="w-32 h-32 rounded-full bg-gradient-to-br from-yellow-400 to-orange-500 shadow-lg shadow-yellow-500/50 flex items-center justify-center">
              <Sun className="h-16 w-16 text-white" />
            </div>
            {!completed && (
              <>
                {[...Array(8)].map((_, i) => (
                  <div
                    key={i}
                    className="absolute w-2 h-8 bg-gradient-to-t from-yellow-400 to-transparent rounded-full animate-pulse"
                    style={{
                      top: '50%',
                      left: '50%',
                      transformOrigin: 'center 0',
                      transform: `translate(-50%, -50%) rotate(${i * 45}deg) translateY(-80px)`,
                      animationDelay: `${i * 100}ms`,
                    }}
                  />
                ))}
              </>
            )}
          </div>
        </div>

        {/* Benefits */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-center text-sm">
          {[
            { emoji: '😴', label: 'Somn mai bun' },
            { emoji: '🌅', label: 'Ritm circadian' },
            { emoji: '😊', label: 'Mood îmbunătățit' },
          ].map(({ emoji, label }) => (
            <div key={label} className="p-3 rounded-lg bg-muted/30">
              <span className="text-2xl block mb-1">{emoji}</span>
              <span className="text-muted-foreground">{label}</span>
            </div>
          ))}
        </div>

        {/* Tips */}
        <div className="p-4 rounded-lg bg-muted/30 border border-muted text-sm">
          <p className="font-medium mb-2">💡 Sugestii:</p>
          <ul className="list-disc list-inside space-y-1 text-muted-foreground">
            <li>Ieși afară sau stai lângă o fereastră deschisă</li>
            <li>Evită ochelarii de soare în primele minute</li>
            <li>Combină cu exercițiile de respirație</li>
          </ul>
        </div>

        {/* Action button */}
        {!completed ? (
          <Button 
            onClick={handleConfirm} 
            size="lg" 
            className="w-full gap-2 bg-yellow-500 hover:bg-yellow-600 text-black"
          >
            <Sun className="h-5 w-5" />
            Am primit lumină naturală
          </Button>
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
