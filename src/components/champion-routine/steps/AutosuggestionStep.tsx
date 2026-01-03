import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Sparkles, ArrowRight, Check, Edit2, X } from 'lucide-react';

interface AutosuggestionStepProps {
  text: string;
  completed: boolean;
  onTextChange: (text: string) => void;
  onComplete: (value: boolean) => void;
  onNext: () => void;
}

export function AutosuggestionStep({ 
  text, 
  completed, 
  onTextChange, 
  onComplete, 
  onNext 
}: AutosuggestionStepProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [localText, setLocalText] = useState(text);

  const handleSaveEdit = () => {
    onTextChange(localText);
    setIsEditing(false);
  };

  const handleConfirm = () => {
    onComplete(true);
    setTimeout(() => onNext(), 500);
  };

  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center px-4">
      <Card className="w-full max-w-2xl p-8 space-y-8 bg-gradient-to-br from-amber-500/10 via-yellow-500/5 to-transparent border-amber-500/20">
        {/* Icon and Title */}
        <div className="text-center space-y-4">
          <div className={`inline-flex items-center justify-center w-24 h-24 rounded-full transition-all duration-500 ${
            completed ? 'bg-green-500/20 scale-110' : 'bg-amber-500/20'
          } mb-4`}>
            {completed ? (
              <Check className="h-12 w-12 text-green-500" />
            ) : (
              <Sparkles className="h-12 w-12 text-amber-500" />
            )}
          </div>
          <h1 className="text-3xl font-bold">Autosugestie</h1>
          <p className="text-muted-foreground text-lg max-w-md mx-auto">
            Citește-ți afirmația cu voce tare, de 3 ori, cu convingere și emoție.
          </p>
        </div>

        {/* Affirmation display */}
        {!isEditing ? (
          <div className="relative p-8 rounded-xl bg-gradient-to-br from-amber-500/20 to-yellow-500/10 border border-amber-500/30">
            <Button
              variant="ghost"
              size="sm"
              className="absolute top-2 right-2 text-muted-foreground hover:text-foreground"
              onClick={() => setIsEditing(true)}
            >
              <Edit2 className="h-4 w-4" />
            </Button>
            <p className="text-2xl font-serif text-center italic leading-relaxed">
              "{text}"
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            <Textarea
              value={localText}
              onChange={(e) => setLocalText(e.target.value)}
              className="min-h-[120px] text-lg"
              placeholder="Scrie-ți afirmația personalizată..."
            />
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                onClick={() => {
                  setLocalText(text);
                  setIsEditing(false);
                }}
                className="gap-2"
              >
                <X className="h-4 w-4" />
                Anulează
              </Button>
              <Button onClick={handleSaveEdit} className="gap-2 flex-1">
                <Check className="h-4 w-4" />
                Salvează
              </Button>
            </div>
          </div>
        )}

        {/* How to use */}
        {!isEditing && (
          <div className="space-y-4">
            <div className="grid grid-cols-3 gap-4 text-center">
              {[1, 2, 3].map((num) => (
                <div key={num} className="p-4 rounded-lg bg-muted/30">
                  <span className="text-3xl font-bold text-amber-500">{num}</span>
                  <p className="text-sm text-muted-foreground mt-2">
                    {num === 1 && 'Citește cu voce tare'}
                    {num === 2 && 'Simte emoția'}
                    {num === 3 && 'Vizualizează'}
                  </p>
                </div>
              ))}
            </div>

            <div className="p-4 rounded-lg bg-muted/30 border border-muted text-sm">
              <p className="font-medium mb-2">💡 De ce funcționează:</p>
              <p className="text-muted-foreground">
                Repetând afirmații pozitive cu emoție și convingere, reprogramezi 
                subconștientul pentru succes și abundență.
              </p>
            </div>
          </div>
        )}

        {/* Action button */}
        {!isEditing && (
          !completed ? (
            <Button 
              onClick={handleConfirm} 
              size="lg" 
              className="w-full gap-2 bg-amber-500 hover:bg-amber-600 text-black"
            >
              <Sparkles className="h-5 w-5" />
              Am citit afirmația de 3 ori
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
          )
        )}
      </Card>
    </div>
  );
}
