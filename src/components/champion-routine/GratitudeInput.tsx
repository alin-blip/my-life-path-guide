import React from 'react';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Heart } from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';

interface GratitudeInputProps {
  items: string[];
  onChange: (items: string[]) => void;
}

export function GratitudeInput({ items, onChange }: GratitudeInputProps) {
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
    <Card className="p-4 bg-gradient-to-br from-pink-500/10 to-rose-500/10 border-pink-500/20">
      <div className="flex items-center gap-2 mb-3">
        <Heart className="h-5 w-5 text-pink-500" />
        <span className="font-medium text-foreground">
          {t('gratitudeTitle') || '3 lucruri pentru care ești recunoscător'}
        </span>
      </div>
      <div className="space-y-2">
        {displayItems.map((item, index) => (
          <div key={index} className="flex items-center gap-2">
            <span className="text-muted-foreground text-sm w-6">{index + 1}.</span>
            <Input
              value={item}
              onChange={(e) => handleChange(index, e.target.value)}
              placeholder={t('gratitudePlaceholder') || 'Scrie aici...'}
              className="bg-background/50"
            />
          </div>
        ))}
      </div>
    </Card>
  );
}
