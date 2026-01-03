import React from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { PenTool, ArrowRight, Check } from 'lucide-react';

interface JournalingStepProps {
  completed: boolean;
  onComplete: (value: boolean) => void;
  onNext: () => void;
}

export function JournalingStep({ completed, onComplete, onNext }: JournalingStepProps) {
  const handleConfirm = () => {
    onComplete(true);
    setTimeout(() => onNext(), 500);
  };

  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center px-4">
      <Card className="w-full max-w-2xl p-8 space-y-8 bg-gradient-to-br from-orange-500/10 via-amber-500/5 to-transparent border-orange-500/20">
        {/* Icon and Title */}
        <div className="text-center space-y-4">
          <div className={`inline-flex items-center justify-center w-24 h-24 rounded-full transition-all duration-500 ${
            completed ? 'bg-green-500/20 scale-110' : 'bg-orange-500/20'
          } mb-4`}>
            {completed ? (
              <Check className="h-12 w-12 text-green-500" />
            ) : (
              <PenTool className="h-12 w-12 text-orange-500" />
            )}
          </div>
          <h1 className="text-3xl font-bold">Journaling</h1>
          <p className="text-muted-foreground text-lg max-w-md mx-auto">
            Scrie-ți gândurile, reflecțiile și ideile într-un jurnal. 
            Clarifică-ți mintea prin scris.
          </p>
        </div>

        {/* Journal prompts */}
        <div className="space-y-4">
          <p className="text-sm font-medium text-center text-muted-foreground">
            Întrebări pentru reflecție:
          </p>
          <div className="grid grid-cols-1 gap-3">
            {[
              'Ce am învățat ieri și cum pot aplica azi?',
              'Ce obstacole anticipez și cum le voi depăși?',
              'Ce îmi doresc cel mai mult să realizez astăzi?',
              'Cum pot fi o versiune mai bună a mea azi?',
            ].map((prompt, index) => (
              <div key={index} className="p-4 rounded-lg bg-muted/30 border-l-4 border-orange-500/50">
                <p className="text-sm">{prompt}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Benefits */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-center text-sm">
          {[
            { emoji: '🧠', label: 'Claritate' },
            { emoji: '💡', label: 'Creativitate' },
            { emoji: '🎯', label: 'Focus' },
            { emoji: '📈', label: 'Progres' },
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
            className="w-full gap-2 bg-orange-500 hover:bg-orange-600"
          >
            <PenTool className="h-5 w-5" />
            Am scris în jurnal
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
