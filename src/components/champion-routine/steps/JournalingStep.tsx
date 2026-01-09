import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { PenTool, ArrowRight, Check, Lightbulb } from 'lucide-react';

interface JournalingStepProps {
  completed: boolean;
  onComplete: (value: boolean) => void;
  onNext: () => void;
}

const JOURNAL_PROMPTS = [
  'Ce am învățat ieri și cum pot aplica azi?',
  'Ce obstacole anticipez și cum le voi depăși?',
  'Ce îmi doresc cel mai mult să realizez astăzi?',
  'Cum pot fi o versiune mai bună a mea azi?',
];

export function JournalingStep({ completed, onComplete, onNext }: JournalingStepProps) {
  const [journalText, setJournalText] = useState('');
  const [showPrompts, setShowPrompts] = useState(false);

  const handleConfirm = () => {
    onComplete(true);
    setTimeout(() => onNext(), 500);
  };

  const wordCount = journalText.trim().split(/\s+/).filter(w => w.length > 0).length;

  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center px-4">
      <Card className="w-full max-w-2xl p-8 space-y-6 bg-gradient-to-br from-orange-500/10 via-amber-500/5 to-transparent border-orange-500/20">
        {/* Icon and Title */}
        <div className="text-center space-y-3">
          <div className={`inline-flex items-center justify-center w-20 h-20 rounded-full transition-all duration-500 ${
            completed ? 'bg-green-500/20 scale-110' : 'bg-orange-500/20'
          }`}>
            {completed ? (
              <Check className="h-10 w-10 text-green-500" />
            ) : (
              <PenTool className="h-10 w-10 text-orange-500" />
            )}
          </div>
          <h1 className="text-2xl font-bold">Journaling</h1>
          <p className="text-muted-foreground text-sm max-w-md mx-auto">
            Scrie-ți gândurile și reflecțiile. Clarifică-ți mintea prin scris.
          </p>
        </div>

        {/* Journal textarea */}
        <div className="space-y-3">
          <Textarea
            value={journalText}
            onChange={(e) => setJournalText(e.target.value)}
            placeholder="Scrie aici gândurile tale..."
            className="min-h-[200px] resize-none bg-background/50 border-orange-500/30 focus:border-orange-500"
            disabled={completed}
          />
          <div className="flex justify-between items-center text-xs text-muted-foreground">
            <span>{wordCount} cuvinte</span>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowPrompts(!showPrompts)}
              className="gap-1 text-xs h-7"
            >
              <Lightbulb className="h-3 w-3" />
              {showPrompts ? 'Ascunde' : 'Inspirație'}
            </Button>
          </div>
        </div>

        {/* Journal prompts - collapsible */}
        {showPrompts && (
          <div className="space-y-2 animate-in fade-in slide-in-from-top-2 duration-200">
            <p className="text-xs font-medium text-muted-foreground">
              Întrebări pentru reflecție:
            </p>
            <div className="grid grid-cols-1 gap-2">
              {JOURNAL_PROMPTS.map((prompt, index) => (
                <button
                  key={index}
                  onClick={() => setJournalText(prev => prev ? `${prev}\n\n${prompt}\n` : `${prompt}\n`)}
                  className="p-3 rounded-lg bg-muted/30 border-l-4 border-orange-500/50 text-left text-sm hover:bg-muted/50 transition-colors"
                >
                  {prompt}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Action button */}
        {!completed ? (
          <Button 
            onClick={handleConfirm} 
            size="lg" 
            className="w-full gap-2 bg-orange-500 hover:bg-orange-600"
            disabled={wordCount < 3}
          >
            <PenTool className="h-5 w-5" />
            Am terminat ({wordCount} cuvinte)
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
