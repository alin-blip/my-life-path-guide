import React from 'react';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight, Calendar, CalendarCheck } from 'lucide-react';
import { format, getISOWeek, getYear } from 'date-fns';
import { ro } from 'date-fns/locale';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";

interface WeekSelectorProps {
  currentDate: Date;
  onPreviousWeek: () => void;
  onNextWeek: () => void;
  onSelectDate: (date: Date) => void;
}

export const WeekSelector: React.FC<WeekSelectorProps> = ({
  currentDate,
  onPreviousWeek,
  onNextWeek,
  onSelectDate
}) => {
  const weekNumber = getISOWeek(currentDate);
  const year = getYear(currentDate);
  const isCurrentWeek = getISOWeek(new Date()) === weekNumber && getYear(new Date()) === year;

  return (
    <div className="flex items-center gap-1">
      <Button 
        variant="ghost" 
        size="icon"
        onClick={onPreviousWeek}
        className="h-7 w-7"
      >
        <ChevronLeft className="h-4 w-4" />
      </Button>

      <Popover>
        <PopoverTrigger asChild>
          <Button variant="ghost" size="sm" className="flex items-center gap-1.5 h-7 px-2">
            <Calendar className="h-3.5 w-3.5" />
            <span className="text-xs font-medium">
              S{weekNumber}
            </span>
            {isCurrentWeek && (
              <span className="w-1.5 h-1.5 rounded-full bg-primary" />
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="center">
          <CalendarComponent
            mode="single"
            selected={currentDate}
            onSelect={(date) => {
              if (date) onSelectDate(date);
            }}
            locale={ro}
            className="rounded-md border"
          />
        </PopoverContent>
      </Popover>

      <Button 
        variant="ghost" 
        size="icon"
        onClick={onNextWeek}
        className="h-7 w-7"
        disabled={isCurrentWeek}
      >
        <ChevronRight className="h-4 w-4" />
      </Button>
    </div>
  );
};
