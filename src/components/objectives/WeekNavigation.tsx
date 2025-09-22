import React from 'react';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight, Calendar } from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';

interface WeekNavigationProps {
  currentDateRange: string;
  onPreviousWeek: () => void;
  onNextWeek: () => void;
  isCurrentWeek: boolean;
}

export const WeekNavigation: React.FC<WeekNavigationProps> = ({
  currentDateRange,
  onPreviousWeek,
  onNextWeek,
  isCurrentWeek
}) => {
  const { language } = useLanguage();

  return (
    <div className="flex items-center justify-between mb-6 bg-slate-800/50 rounded-lg p-4">
      <Button
        variant="outline"
        size="sm"
        onClick={onPreviousWeek}
        className="flex items-center gap-2"
      >
        <ChevronLeft className="h-4 w-4" />
        {language === 'en' ? 'Previous' : 'Precedenta'}
      </Button>
      
      <div className="flex items-center gap-2 px-4 py-2 bg-slate-700 rounded-lg">
        <Calendar className="h-4 w-4 text-blue-400" />
        <span className="font-medium">{currentDateRange}</span>
        {isCurrentWeek && (
          <span className="ml-2 px-2 py-1 bg-green-600 text-xs rounded-full">
            {language === 'en' ? 'Current' : 'Curent'}
          </span>
        )}
      </div>
      
      <Button
        variant="outline"
        size="sm"
        onClick={onNextWeek}
        className="flex items-center gap-2"
      >
        {language === 'en' ? 'Next' : 'Următoarea'}
        <ChevronRight className="h-4 w-4" />
      </Button>
    </div>
  );
};