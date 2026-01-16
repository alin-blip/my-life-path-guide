import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Lightbulb, ArrowRight, Check, MessageSquare, PenTool, Video } from 'lucide-react';
import { useChampionRoutine } from '@/hooks/useChampionRoutine';

interface ApplyStepProps {
  completed: boolean;
  notes: string | null;
  onComplete: (value: boolean) => void;
  onNotesChange: (notes: string) => void;
  onNext: () => void;
}

const APPLY_SUGGESTIONS = [
  { icon: MessageSquare, text: 'Explic cuiva ce am învățat' },
  { icon: PenTool, text: 'Scriu în jurnal sau notez' },
  { icon: Video, text: 'Fac un video sau audio' },
  { icon: Lightbulb, text: 'Aplic practic într-un proiect' },
];

export function ApplyStep({ completed, notes, onComplete, onNotesChange, onNext }: ApplyStepProps) {
  const { settings } = useChampionRoutine();
  const [localNotes, setLocalNotes] = useState(notes || '');
  
  const applyDescription = (settings as any)?.apply_teach_description || '';

  const handleConfirm = () => {
    if (localNotes.trim()) {
      onNotesChange(localNotes);
    }
    onComplete(true);
    setTimeout(() => onNext(), 500);
  };

  const handleSuggestionClick = (text: string) => {
    setLocalNotes(prev => prev ? `${prev}\n${text}` : text);
  };

  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center px-4">
      <Card className="w-full max-w-2xl p-8 space-y-6 bg-gradient-to-br from-yellow-500/10 via-amber-500/5 to-transparent border-yellow-500/20">
        {/* Icon and Title */}
        <div className="text-center space-y-3">
          <div className={`inline-flex items-center justify-center w-20 h-20 rounded-full transition-all duration-500 ${
            completed ? 'bg-green-500/20 scale-110' : 'bg-yellow-500/20'
          }`}>
            {completed ? (
              <Check className="h-10 w-10 text-green-500" />
            ) : (
              <Lightbulb className="h-10 w-10 text-yellow-500" />
            )}
          </div>
          <h1 className="text-2xl font-bold">Aplică sau Predă</h1>
          <p className="text-muted-foreground text-sm max-w-md mx-auto">
            Cel mai bun mod de a reține este să aplici sau să predai altora ce ai învățat.
          </p>
        </div>

        {/* User's configured description */}
        {applyDescription && (
          <div className="p-4 rounded-lg bg-yellow-500/10 border border-yellow-500/20">
            <p className="text-sm font-medium text-yellow-600 dark:text-yellow-400 mb-1">
              Planul tău:
            </p>
            <p className="text-foreground">{applyDescription}</p>
          </div>
        )}

        {/* Quick suggestions */}
        <div className="space-y-2">
          <p className="text-xs text-muted-foreground">Cum ai aplicat/predat azi?</p>
          <div className="grid grid-cols-2 gap-2">
            {APPLY_SUGGESTIONS.map(({ icon: Icon, text }, index) => (
              <button
                key={index}
                onClick={() => handleSuggestionClick(text)}
                className="p-3 rounded-lg bg-muted/30 border border-muted-foreground/20 text-left text-sm hover:bg-muted/50 transition-colors flex items-center gap-2"
              >
                <Icon className="h-4 w-4 text-yellow-500 shrink-0" />
                <span className="text-xs">{text}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Notes input */}
        <div className="space-y-2">
          <Textarea
            value={localNotes}
            onChange={(e) => setLocalNotes(e.target.value)}
            placeholder="Descrie cum ai aplicat sau predat... (opțional)"
            className="min-h-[100px] resize-none bg-background/50 border-yellow-500/30 focus:border-yellow-500"
          />
        </div>

        {/* Action button */}
        {!completed ? (
          <Button 
            onClick={handleConfirm} 
            size="lg" 
            className="w-full gap-2 bg-yellow-500 hover:bg-yellow-600 text-black"
          >
            <Lightbulb className="h-5 w-5" />
            Am aplicat/predat azi
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
