import React from 'react';
import { Card } from '@/components/ui/card';
import { useLanguage } from '@/context/LanguageContext';
import { Play } from 'lucide-react';

export const Day1VideoPlaceholder: React.FC = () => {
  const { language } = useLanguage();
  const isRo = language === 'ro';

  return (
    <Card className="aspect-video bg-muted/50 border-dashed border-2 flex items-center justify-center mb-6">
      <div className="text-center p-6">
        <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
          <Play className="h-8 w-8 text-primary/50" />
        </div>
        <p className="text-muted-foreground font-medium">
          🎬 {isRo ? 'Video Explicativ - În Curând' : 'Explainer Video - Coming Soon'}
        </p>
        <p className="text-sm text-muted-foreground/70 mt-1">
          {isRo 
            ? 'Descoperă cum să îți creezi declarația de viziune în stilul Napoleon Hill'
            : 'Learn how to create your vision declaration in Napoleon Hill style'}
        </p>
      </div>
    </Card>
  );
};
