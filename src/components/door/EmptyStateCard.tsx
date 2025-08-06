import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { LucideIcon } from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';

interface EmptyStateCardProps {
  icon: LucideIcon;
  title: string;
  description: string;
  actionLabel: string;
  onAction: () => void;
  emoji?: string;
}

export const EmptyStateCard: React.FC<EmptyStateCardProps> = ({
  icon: Icon,
  title,
  description,
  actionLabel,
  onAction,
  emoji
}) => {
  const { language } = useLanguage();

  return (
    <Card className="border-dashed border-2 border-muted-foreground/25 bg-muted/10">
      <CardContent className="flex flex-col items-center justify-center text-center p-12">
        <div className="flex flex-col items-center gap-4 mb-6">
          {emoji && (
            <div className="text-4xl mb-2">{emoji}</div>
          )}
          <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
            <Icon className="w-6 h-6 text-primary" />
          </div>
        </div>
        
        <h3 className="text-lg font-semibold mb-2">{title}</h3>
        <p className="text-sm text-muted-foreground mb-6 max-w-sm">
          {description}
        </p>
        
        <Button onClick={onAction} variant="outline" className="animate-pulse">
          {actionLabel}
        </Button>
      </CardContent>
    </Card>
  );
};