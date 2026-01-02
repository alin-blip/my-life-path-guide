import React, { useState } from 'react';
import { useLanguage } from '@/context/LanguageContext';
import { DailyHabitsSection } from '@/components/habits/DailyHabitsSection';
import { StartDayFlow } from '@/components/habits/StartDayFlow';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { Calendar as CalendarIcon } from 'lucide-react';
import { format } from 'date-fns';

export const Dashboard: React.FC = () => {
  const { language } = useLanguage();
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [calendarOpen, setCalendarOpen] = useState(false);

  return (
    <div className="w-full max-w-2xl mx-auto py-4 px-2 md:py-8 md:px-4">
      {/* Header with date selector */}
      <div className="flex justify-between items-center mb-6 animate-fade-in">
        <h1 className="text-2xl md:text-3xl font-bold gradient-text">
          {language === 'en' ? 'My Daily' : 'Zilnica mea'}
        </h1>
        
        <Popover open={calendarOpen} onOpenChange={setCalendarOpen}>
          <PopoverTrigger asChild>
            <Button variant="glass" size="sm" className="flex items-center gap-2">
              <CalendarIcon className="w-4 h-4" />
              <span>{format(selectedDate, 'dd MMM yyyy')}</span>
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="end">
            <Calendar
              mode="single"
              selected={selectedDate}
              onSelect={(date) => {
                if (date) {
                  setSelectedDate(date);
                  setCalendarOpen(false);
                }
              }}
              initialFocus
            />
          </PopoverContent>
        </Popover>
      </div>
      
      {/* Start Your Day Flow - main focus */}
      <div className="mb-6">
        <StartDayFlow />
      </div>
      
      {/* Daily Habits - grouped by category */}
      <div className="mb-6">
        <DailyHabitsSection date={selectedDate} />
      </div>
    </div>
  );
};
