import React, { useState } from 'react';
import { Heart, Plus, Check } from 'lucide-react';
import { WidgetContainer } from './WidgetContainer';
import { WidgetSize } from '@/types/dashboardWidget';
import { useLanguage } from '@/context/LanguageContext';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

interface GratitudeWidgetProps {
  size: WidgetSize;
  onRemove: () => void;
  onResize: (size: WidgetSize) => void;
  dragHandleProps?: any;
}

export const GratitudeWidget: React.FC<GratitudeWidgetProps> = ({
  size,
  onRemove,
  onResize,
  dragHandleProps
}) => {
  const { language } = useLanguage();
  const [items, setItems] = useState<string[]>([]);
  const [newItem, setNewItem] = useState('');

  const addItem = () => {
    if (newItem.trim() && items.length < 3) {
      setItems([...items, newItem.trim()]);
      setNewItem('');
    }
  };

  const isComplete = items.length >= 3;

  return (
    <WidgetContainer
      title={language === 'ro' ? 'Recunoștință' : 'Gratitude'}
      icon={<Heart className="h-4 w-4 text-rose-500" />}
      size={size}
      onRemove={onRemove}
      onResize={onResize}
      dragHandleProps={dragHandleProps}
    >
      <div className="space-y-2">
        {items.map((item, index) => (
          <div key={index} className="flex items-center gap-2 text-sm p-2 rounded bg-rose-500/10">
            <Check className="h-3 w-3 text-rose-500 flex-shrink-0" />
            <span className="line-clamp-1">{item}</span>
          </div>
        ))}
        
        {!isComplete && (
          <div className="flex gap-2">
            <Input
              value={newItem}
              onChange={(e) => setNewItem(e.target.value)}
              placeholder={language === 'ro' ? 'Sunt recunoscător pentru...' : "I'm grateful for..."}
              className="text-sm h-8"
              onKeyPress={(e) => e.key === 'Enter' && addItem()}
            />
            <Button size="icon" variant="outline" className="h-8 w-8 flex-shrink-0" onClick={addItem}>
              <Plus className="h-3 w-3" />
            </Button>
          </div>
        )}

        {isComplete && (
          <p className="text-xs text-center text-rose-500 font-medium">
            {language === 'ro' ? '✨ Ai completat recunoștința de azi!' : '✨ You completed today\'s gratitude!'}
          </p>
        )}

        {!isComplete && (
          <p className="text-xs text-muted-foreground text-center">
            {items.length}/3 {language === 'ro' ? 'lucruri' : 'things'}
          </p>
        )}
      </div>
    </WidgetContainer>
  );
};
