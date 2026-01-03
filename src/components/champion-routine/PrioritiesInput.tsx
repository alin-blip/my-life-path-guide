import React from 'react';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Target } from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';

interface PrioritiesInputProps {
  items: string[];
  onChange: (items: string[]) => void;
}

export function PrioritiesInput({ items, onChange }: PrioritiesInputProps) {
  const { t } = useLanguage();

  const handleChange = (index: number, value: string) => {
    const newItems = [...items];
    newItems[index] = value;
    onChange(newItems);
  };

  // Ensure we always have 3 items
  const displayItems = [...items];
  while (displayItems.length < 3) {
    displayItems.push('');
  }

  return (
    <Card className="p-4 bg-gradient-to-br from-emerald-500/10 to-green-500/10 border-emerald-500/20">
      <div className="flex items-center gap-2 mb-3">
        <Target className="h-5 w-5 text-emerald-500" />
        <span className="font-medium text-foreground">
          {t('prioritiesTitle') || 'Top 3 priorități pentru azi'}
        </span>
      </div>
      <div className="space-y-2">
        {displayItems.map((item, index) => (
          <div key={index} className="flex items-center gap-2">
            <span className={`
              text-sm font-bold w-6 h-6 flex items-center justify-center rounded-full
              ${index === 0 ? 'bg-emerald-500 text-white' : 'bg-muted text-muted-foreground'}
            `}>
              {index + 1}
            </span>
            <Input
              value={item}
              onChange={(e) => handleChange(index, e.target.value)}
              placeholder={index === 0 ? 'Cea mai importantă prioritate...' : 'Prioritate...'}
              className="bg-background/50"
            />
          </div>
        ))}
      </div>
    </Card>
  );
}
