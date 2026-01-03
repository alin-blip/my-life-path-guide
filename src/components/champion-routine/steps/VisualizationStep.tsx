import React from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Eye, ArrowRight, Check } from 'lucide-react';

interface VisualizationStepProps {
  completed: boolean;
  onComplete: (value: boolean) => void;
  onNext: () => void;
}

export function VisualizationStep({ completed, onComplete, onNext }: VisualizationStepProps) {
  const handleConfirm = () => {
    onComplete(true);
    setTimeout(() => onNext(), 500);
  };

  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center px-4">
      <Card className="w-full max-w-2xl p-8 space-y-8 bg-gradient-to-br from-indigo-500/10 via-blue-500/5 to-transparent border-indigo-500/20">
        {/* Icon and Title */}
        <div className="text-center space-y-4">
          <div className={`inline-flex items-center justify-center w-24 h-24 rounded-full transition-all duration-500 ${
            completed ? 'bg-green-500/20 scale-110' : 'bg-indigo-500/20'
          } mb-4`}>
            {completed ? (
              <Check className="h-12 w-12 text-green-500" />
            ) : (
              <Eye className="h-12 w-12 text-indigo-500" />
            )}
          </div>
          <h1 className="text-3xl font-bold">Vizualizare</h1>
          <p className="text-muted-foreground text-lg max-w-md mx-auto">
            Închide ochii și vizualizează-ți ziua perfectă de astăzi. 
            Simte emoțiile pe care le vei avea când totul merge perfect.
          </p>
        </div>

        {/* Visualization guide */}
        <div className="space-y-4">
          <div className="relative p-8 rounded-xl bg-gradient-to-br from-indigo-500/10 to-blue-500/10 border border-indigo-500/20">
            <p className="text-lg text-center italic text-muted-foreground">
              "Imaginează-ți că ești seara acestei zile, privind înapoi la tot ce ai realizat. 
              Cum te simți? Ce ai făcut? Cu cine ai interacționat?"
            </p>
          </div>

          {/* Steps */}
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 text-center text-sm">
            {[
              { step: 1, text: 'Închide ochii', emoji: '👁️' },
              { step: 2, text: 'Respiră adânc', emoji: '🌬️' },
              { step: 3, text: 'Vizualizează', emoji: '✨' },
              { step: 4, text: 'Simte emoția', emoji: '❤️' },
            ].map(({ step, text, emoji }) => (
              <div key={step} className="p-4 rounded-lg bg-muted/30">
                <span className="text-2xl block mb-2">{emoji}</span>
                <span className="text-xs text-muted-foreground">Pas {step}</span>
                <p className="font-medium">{text}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Tips */}
        <div className="p-4 rounded-lg bg-muted/30 border border-muted text-sm">
          <p className="font-medium mb-2">💡 Vizualizează specific:</p>
          <ul className="list-disc list-inside space-y-1 text-muted-foreground">
            <li>Cum arată succesul tău de astăzi?</li>
            <li>Ce conversații importante ai?</li>
            <li>Cum te simți când completezi toate sarcinile?</li>
            <li>Cum te privesc ceilalți când reușești?</li>
          </ul>
        </div>

        {/* Action button */}
        {!completed ? (
          <Button 
            onClick={handleConfirm} 
            size="lg" 
            className="w-full gap-2 bg-indigo-500 hover:bg-indigo-600"
          >
            <Eye className="h-5 w-5" />
            Am vizualizat ziua perfectă
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
