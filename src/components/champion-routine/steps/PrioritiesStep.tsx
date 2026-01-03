import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Target, ArrowRight, GripVertical } from 'lucide-react';

interface PrioritiesStepProps {
  items: string[];
  onChange: (items: string[]) => void;
  onNext: () => void;
}

export function PrioritiesStep({ items, onChange, onNext }: PrioritiesStepProps) {
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
      <Card className="w-full max-w-2xl p-8 space-y-8 bg-gradient-to-br from-green-500/10 via-emerald-500/5 to-transparent border-green-500/20">
        {/* Icon and Title */}
        <div className="text-center space-y-4">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-green-500/20 mb-4">
            <Target className="h-10 w-10 text-green-500" />
          </div>
          <h1 className="text-3xl font-bold">Top 3 Priorități</h1>
          <p className="text-muted-foreground text-lg max-w-md mx-auto">
            Care sunt cele 3 lucruri pe care TREBUIE să le faci astăzi? 
            Dacă le faci pe acestea, ziua a fost un succes.
          </p>
        </div>

        {/* Priority inputs */}
        <div className="space-y-4">
          {[0, 1, 2].map((index) => (
            <div key={index} className="flex items-center gap-3">
              <div className={`flex items-center justify-center w-10 h-10 rounded-full font-bold text-lg ${
                index === 0 ? 'bg-red-500/20 text-red-500' :
                index === 1 ? 'bg-orange-500/20 text-orange-500' :
                'bg-yellow-500/20 text-yellow-500'
              }`}>
                {index + 1}
              </div>
              <Input
                placeholder={`Prioritatea ${index + 1}...`}
                value={localItems[index]}
                onChange={(e) => handleChange(index, e.target.value)}
                className="flex-1 h-14 text-lg bg-background/50 border-green-500/20 focus:border-green-500/50"
              />
            </div>
          ))}
        </div>

        {/* Tips */}
        <div className="p-4 rounded-lg bg-muted/30 border border-muted text-sm">
          <p className="font-medium mb-2">💡 Sfat pentru priorități eficiente:</p>
          <ul className="list-disc list-inside space-y-1 text-muted-foreground">
            <li>Alege sarcini care au cel mai mare impact</li>
            <li>Fii specific - "Scrie 500 cuvinte" nu "Lucrează la carte"</li>
            <li>Prima prioritate = cea mai importantă</li>
            <li>Fă-le pe acestea ÎNAINTE de orice altceva</li>
          </ul>
        </div>

        {/* The ONE Thing quote */}
        <div className="p-6 rounded-xl bg-gradient-to-br from-green-500/10 to-emerald-500/10 border border-green-500/20 text-center">
          <p className="text-lg italic">
            "Care este singurul lucru pe care îl pot face, astfel încât făcându-l, 
            totul devine mai ușor sau inutil?"
          </p>
          <p className="text-sm text-muted-foreground mt-2">- Gary Keller, The ONE Thing</p>
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
