import React from 'react';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight, Calendar } from 'lucide-react';
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
    <div className="flex items-center justify-between gap-2 bg-card/50 rounded-lg px-3 py-2 border border-border/50">
      <Button 
        variant="ghost" 
        size="icon"
        onClick={onPreviousWeek}
        className="h-8 w-8"
      >
        <ChevronLeft className="h-4 w-4" />
      </Button>

      <Popover>
        <PopoverTrigger asChild>
          <Button variant="ghost" className="flex items-center gap-2 h-8">
            <Calendar className="h-4 w-4" />
            <span className="font-medium">
              Săptămâna {weekNumber}, {year}
            </span>
            {isCurrentWeek && (
              <span className="text-xs bg-primary/20 text-primary px-2 py-0.5 rounded-full">
                Curentă
              </span>
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
        className="h-8 w-8"
        disabled={isCurrentWeek}
      >
        <ChevronRight className="h-4 w-4" />
      </Button>
    </div>
  );
};
