import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { PenTool, ArrowRight, Check, BookOpen, Sparkles } from 'lucide-react';
import { IntrospectionStack } from '@/components/stack/introspection-stack/IntrospectionStack';

interface JournalingStepProps {
  completed: boolean;
  onComplete: (value: boolean) => void;
  onNext: () => void;
}

export function JournalingStep({ completed, onComplete, onNext }: JournalingStepProps) {
  const [showStack, setShowStack] = useState(false);

  const handleStackComplete = () => {
    onComplete(true);
    setTimeout(() => onNext(), 500);
  };

  // Completed state
  if (completed) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center px-4">
        <Card className="w-full max-w-2xl p-8 space-y-6 bg-gradient-to-br from-green-500/10 via-emerald-500/5 to-transparent border-green-500/20">
          <div className="text-center space-y-3">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-green-500/20">
              <Check className="h-10 w-10 text-green-500" />
            </div>
            <h1 className="text-2xl font-bold">Jurnaling Completat!</h1>
            <p className="text-muted-foreground">Ai finalizat sesiunea de introspecție profundă.</p>
          </div>
          <Button onClick={onNext} size="lg" className="w-full gap-2">
            Continuă <ArrowRight className="h-5 w-5" />
          </Button>
        </Card>
      </div>
    );
  }

  // Show IntrospectionStack
  if (showStack) {
    return (
      <div className="min-h-[70vh] px-4 pb-20">
        <div className="mb-4">
          <IntrospectionStack
            onAddToHitList={(action) => console.log('Add to HitList:', action)}
            mode="text"
          />
        </div>
        <div className="fixed bottom-0 left-0 right-0 p-4 bg-background/80 backdrop-blur-sm border-t">
          <div className="max-w-2xl mx-auto">
            <Button 
              onClick={handleStackComplete}
              size="lg"
              className="w-full gap-2 bg-green-500 hover:bg-green-600"
            >
              <Check className="h-5 w-5" />
              Finalizează Jurnaling
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // Start screen
  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center px-4">
      <Card className="w-full max-w-2xl p-8 space-y-6 bg-gradient-to-br from-orange-500/10 via-amber-500/5 to-transparent border-orange-500/20">
        <div className="text-center space-y-3">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-orange-500/20">
            <PenTool className="h-10 w-10 text-orange-500" />
          </div>
          <h1 className="text-2xl font-bold">Jurnaling - Introspecție Profundă</h1>
          <p className="text-muted-foreground text-sm max-w-md mx-auto">
            O sesiune ghidată de auto-reflecție cu întrebări puternice care te ajută să te cunoști mai bine.
          </p>
        </div>
        
        <div className="bg-muted/30 rounded-lg p-4 space-y-3">
          <h3 className="font-medium flex items-center gap-2">
            <BookOpen className="h-4 w-4 text-orange-500" />
            Ce vei explora:
          </h3>
          <ul className="text-sm text-muted-foreground space-y-2 ml-6 list-disc">
            <li>Conștientizare de sine - emoții și valori</li>
            <li>Creștere personală - frici și blocaje</li>
            <li>Relații - atenție și conexiuni</li>
            <li>Scop și sens în viață</li>
            <li>Acțiuni concrete pentru schimbare</li>
          </ul>
        </div>

        <div className="flex items-center gap-2 p-3 rounded-lg bg-orange-500/10 border border-orange-500/20">
          <Sparkles className="h-5 w-5 text-orange-500 flex-shrink-0" />
          <p className="text-sm text-muted-foreground">
            Coach AI te va ghida prin întrebări de reflecție și îți va oferi perspective valoroase.
          </p>
        </div>

        <Button 
          onClick={() => setShowStack(true)} 
          size="lg" 
          className="w-full gap-2 bg-orange-500 hover:bg-orange-600"
        >
          <PenTool className="h-5 w-5" />
          Începe Sesiunea de Jurnaling
        </Button>
      </Card>
    </div>
  );
}
