import React from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { BookOpen, ArrowRight, Check } from 'lucide-react';

interface ReadingStepProps {
  completed: boolean;
  onComplete: (value: boolean) => void;
  onNext: () => void;
}

export function ReadingStep({ completed, onComplete, onNext }: ReadingStepProps) {
  const handleConfirm = () => {
    onComplete(true);
    setTimeout(() => onNext(), 500);
  };

  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center px-4">
      <Card className="w-full max-w-2xl p-8 space-y-8 bg-gradient-to-br from-emerald-500/10 via-green-500/5 to-transparent border-emerald-500/20">
        {/* Icon and Title */}
        <div className="text-center space-y-4">
          <div className={`inline-flex items-center justify-center w-24 h-24 rounded-full transition-all duration-500 ${
            completed ? 'bg-green-500/20 scale-110' : 'bg-emerald-500/20'
          } mb-4`}>
            {completed ? (
              <Check className="h-12 w-12 text-green-500" />
            ) : (
              <BookOpen className="h-12 w-12 text-emerald-500" />
            )}
          </div>
          <h1 className="text-3xl font-bold">Citit</h1>
          <p className="text-muted-foreground text-lg max-w-md mx-auto">
            Citește minimum 10 pagini dintr-o carte de dezvoltare personală. 
            Cunoașterea este putere.
          </p>
        </div>

        {/* Book visualization */}
        <div className="flex justify-center py-8">
          <div className="relative">
            <div className="w-40 h-52 rounded-r-lg bg-gradient-to-br from-emerald-600 to-green-700 shadow-xl flex items-center justify-center">
              <BookOpen className="h-16 w-16 text-white/80" />
            </div>
            <div className="absolute -right-1 top-0 bottom-0 w-4 bg-gradient-to-r from-emerald-800 to-emerald-700 rounded-r" />
          </div>
        </div>

        {/* Statistics */}
        <div className="grid grid-cols-3 gap-4 text-center">
          {[
            { value: '10', label: 'pagini/zi', subtext: '= 3,650 pagini/an' },
            { value: '15', label: 'cărți/an', subtext: 'dacă citești 10 pag/zi' },
            { value: '1%', label: 'mai bun', subtext: 'în fiecare zi' },
          ].map(({ value, label, subtext }) => (
            <div key={label} className="p-4 rounded-lg bg-muted/30">
              <span className="text-3xl font-bold text-emerald-500">{value}</span>
              <p className="font-medium text-sm">{label}</p>
              <p className="text-xs text-muted-foreground mt-1">{subtext}</p>
            </div>
          ))}
        </div>

        {/* Reading tips */}
        <div className="p-4 rounded-lg bg-muted/30 border border-muted text-sm">
          <p className="font-medium mb-2">📚 Recomandări de cărți:</p>
          <ul className="list-disc list-inside space-y-1 text-muted-foreground">
            <li>Think and Grow Rich - Napoleon Hill</li>
            <li>Atomic Habits - James Clear</li>
            <li>The 7 Habits of Highly Effective People</li>
            <li>The Power of Now - Eckhart Tolle</li>
          </ul>
        </div>

        {/* Action button */}
        {!completed ? (
          <Button 
            onClick={handleConfirm} 
            size="lg" 
            className="w-full gap-2 bg-emerald-500 hover:bg-emerald-600"
          >
            <BookOpen className="h-5 w-5" />
            Am citit minimum 10 pagini
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
