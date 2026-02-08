import React from 'react';
import { Calendar, Clock } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { useLanguage } from '@/context/LanguageContext';

export const CalendarTab: React.FC = () => {
  const { language } = useLanguage();
  const isRo = language === 'ro';

  return (
    <div className="max-w-2xl mx-auto">
      <Card className="border-dashed border-border/60 bg-muted/30">
        <CardContent className="py-16 text-center">
          <Calendar className="h-12 w-12 text-muted-foreground/50 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-foreground mb-2">
            {isRo ? 'Calendar Evenimente' : 'Event Calendar'}
          </h3>
          <p className="text-muted-foreground text-sm max-w-md mx-auto">
            {isRo
              ? 'Sesiunile live de coaching, Q&A-uri și evenimentele comunității vor apărea aici în curând.'
              : 'Live coaching sessions, Q&As, and community events will appear here soon.'}
          </p>
          <div className="flex items-center justify-center gap-2 mt-6 text-xs text-muted-foreground/60">
            <Clock className="h-3.5 w-3.5" />
            <span>{isRo ? 'În curând' : 'Coming soon'}</span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
