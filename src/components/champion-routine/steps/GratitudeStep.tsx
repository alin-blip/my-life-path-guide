import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Heart, Sparkles, ArrowRight } from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';

interface GratitudeStepProps {
  items: string[];
  onChange: (items: string[]) => void;
  onNext: () => void;
}

export function GratitudeStep({ items, onChange, onNext }: GratitudeStepProps) {
  const { t } = useLanguage();
  const [localItems, setLocalItems] = useState<string[]>(['', '', '']);

  useEffect(() => {
    if (items && items.length > 0) {
      const normalized = [items[0] || '', items[1] || '', items[2] || ''];
      setLocalItems(normalized);
    }
  }, []);

  const handleChange = (index: number, value: string) => {
    const newItems = [...localItems];
    newItems[index] = value;
    setLocalItems(newItems);
    onChange(newItems);
  };

  const canProceed = localItems.some(item => item.trim().length > 0);

  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center px-4">
      <Card className="w-full max-w-2xl p-8 space-y-8 bg-gradient-to-br from-pink-500/10 via-rose-500/5 to-transparent border-pink-500/20">
        {/* Icon and Title */}
        <div className="text-center space-y-4">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-pink-500/20 mb-4">
            <Heart className="h-10 w-10 text-pink-500" />
          </div>
          <h1 className="text-3xl font-bold">Recunoștință</h1>
          <p className="text-muted-foreground text-lg max-w-md mx-auto">
            Pentru ce ești recunoscător astăzi? Scrie 3 lucruri care îți aduc bucurie.
          </p>
        </div>

        {/* Three gratitude inputs */}
        <div className="space-y-4">
          {[0, 1, 2].map((index) => (
            <div key={index} className="relative">
              <div className="absolute left-4 top-4 flex items-center justify-center w-8 h-8 rounded-full bg-pink-500/20 text-pink-500 font-bold text-sm">
                {index + 1}
              </div>
              <Textarea
                placeholder={`Lucrul ${index + 1} pentru care sunt recunoscător...`}
                value={localItems[index]}
                onChange={(e) => handleChange(index, e.target.value)}
                className="pl-16 min-h-[80px] bg-background/50 border-pink-500/20 focus:border-pink-500/50 resize-none"
              />
            </div>
          ))}
        </div>

        {/* Inspiration */}
        <div className="flex items-start gap-3 p-4 rounded-lg bg-muted/30 border border-muted">
          <Sparkles className="h-5 w-5 text-amber-500 flex-shrink-0 mt-0.5" />
          <div className="text-sm text-muted-foreground">
            <p className="font-medium text-foreground mb-1">Exemple:</p>
            <ul className="list-disc list-inside space-y-1">
              <li>Sănătatea mea și a familiei</li>
              <li>Oportunitatea de a crește în fiecare zi</li>
              <li>Oamenii care mă susțin și mă iubesc</li>
            </ul>
          </div>
        </div>

        {/* Next button */}
        <Button 
          onClick={onNext} 
          size="lg" 
          className="w-full gap-2"
          disabled={!canProceed}
        >
          Continuă
          <ArrowRight className="h-5 w-5" />
        </Button>
      </Card>
    </div>
  );
}
