import React from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Droplets, ArrowRight, Check } from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';

interface HydrationStepProps {
  completed: boolean;
  onComplete: (value: boolean) => void;
  onNext: () => void;
}

export function HydrationStep({ completed, onComplete, onNext }: HydrationStepProps) {
  const { t } = useLanguage();

  const handleConfirm = () => {
    onComplete(true);
    setTimeout(() => onNext(), 500);
  };

  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center px-4">
      <Card className="w-full max-w-2xl p-8 space-y-8 bg-gradient-to-br from-blue-500/10 via-cyan-500/5 to-transparent border-blue-500/20">
        {/* Icon and Title */}
        <div className="text-center space-y-4">
          <div className={`inline-flex items-center justify-center w-24 h-24 rounded-full transition-all duration-500 ${
            completed ? 'bg-green-500/20 scale-110' : 'bg-blue-500/20'
          } mb-4`}>
            {completed ? (
              <Check className="h-12 w-12 text-green-500" />
            ) : (
              <Droplets className="h-12 w-12 text-blue-500" />
            )}
          </div>
          <h1 className="text-3xl font-bold">Hidratare</h1>
          <p className="text-muted-foreground text-lg max-w-md mx-auto">
            Începe-ți ziua cu un pahar mare de apă pentru a-ți activa metabolismul și a-ți hidrata corpul.
          </p>
        </div>

        {/* Water glass visualization */}
        <div className="flex justify-center py-8">
          <div className={`relative w-32 h-40 rounded-b-3xl border-4 transition-all duration-1000 ${
            completed ? 'border-green-500' : 'border-blue-400'
          }`}>
            <div className={`absolute bottom-0 left-0 right-0 rounded-b-2xl transition-all duration-1000 ${
              completed 
                ? 'bg-gradient-to-t from-green-400 to-green-300 h-full' 
                : 'bg-gradient-to-t from-blue-500/30 to-transparent h-1/4'
            }`} />
            {completed && (
              <div className="absolute inset-0 flex items-center justify-center">
                <Check className="h-12 w-12 text-white" />
              </div>
            )}
          </div>
        </div>

        {/* Benefits */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-center text-sm">
          {[
            { emoji: '⚡', label: 'Energie' },
            { emoji: '🧠', label: 'Claritate mentală' },
            { emoji: '💪', label: 'Metabolism activ' },
          ].map(({ emoji, label }) => (
            <div key={label} className="p-3 rounded-lg bg-muted/30">
              <span className="text-2xl block mb-1">{emoji}</span>
              <span className="text-muted-foreground">{label}</span>
            </div>
          ))}
        </div>

        {/* Action button */}
        {!completed ? (
          <Button 
            onClick={handleConfirm} 
            size="lg" 
            className="w-full gap-2 bg-blue-500 hover:bg-blue-600"
          >
            <Droplets className="h-5 w-5" />
            Am băut un pahar de apă
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
