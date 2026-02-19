import React from 'react';
import {
  startOfMonth, endOfMonth, startOfWeek, endOfWeek,
  eachDayOfInterval, format, isSameMonth, isToday, isSameDay, addMonths, subMonths
} from 'date-fns';
import { ro, enUS } from 'date-fns/locale';
import { ChevronLeft, ChevronRight, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { TribeEvent } from '@/hooks/useCoachTribeEvents';

interface CalendarGridProps {
  currentMonth: Date;
  onMonthChange: (date: Date) => void;
  events: TribeEvent[];
  onEventClick: (event: TribeEvent) => void;
  onAddEvent?: () => void;
  isAdmin: boolean;
  isRo: boolean;
}

export const CalendarGrid: React.FC<CalendarGridProps> = ({
  currentMonth, onMonthChange, events, onEventClick, onAddEvent, isAdmin, isRo
}) => {
  const locale = isRo ? ro : enUS;
  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const calStart = startOfWeek(monthStart, { weekStartsOn: 1 });
  const calEnd = endOfWeek(monthEnd, { weekStartsOn: 1 });
  const days = eachDayOfInterval({ start: calStart, end: calEnd });

  const weekDays = isRo
    ? ['Lun', 'Mar', 'Mie', 'Joi', 'Vin', 'Sâm', 'Dum']
    : ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

  const getEventsForDay = (day: Date) =>
    events.filter(e => isSameDay(new Date(e.start_at), day));

  return (
    <div className="w-full">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" onClick={() => onMonthChange(subMonths(currentMonth, 1))}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <h2 className="text-lg font-semibold text-foreground capitalize">
            {format(currentMonth, 'MMMM yyyy', { locale })}
          </h2>
          <Button variant="ghost" size="icon" onClick={() => onMonthChange(addMonths(currentMonth, 1))}>
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => onMonthChange(new Date())}>
            {isRo ? 'Azi' : 'Today'}
          </Button>
          {isAdmin && onAddEvent && (
            <Button size="sm" onClick={onAddEvent} className="gap-1">
              <Plus className="h-4 w-4" />
              {isRo ? 'Eveniment' : 'Event'}
            </Button>
          )}
        </div>
      </div>

      {/* Week day headers */}
      <div className="grid grid-cols-7 border-b border-border">
        {weekDays.map(d => (
          <div key={d} className="py-2 text-center text-xs font-medium text-muted-foreground uppercase">
            {d}
          </div>
        ))}
      </div>

      {/* Day cells */}
      <div className="grid grid-cols-7 border-l border-border">
        {days.map((day, i) => {
          const dayEvents = getEventsForDay(day);
          const inMonth = isSameMonth(day, currentMonth);
          const today = isToday(day);

          return (
            <div
              key={i}
              className={cn(
                'min-h-[90px] md:min-h-[110px] border-r border-b border-border p-1 transition-colors',
                !inMonth && 'bg-muted/30',
                today && 'bg-primary/5'
              )}
            >
              <div className="flex items-center justify-center mb-0.5">
                <span className={cn(
                  'text-xs font-medium w-6 h-6 flex items-center justify-center rounded-full',
                  today && 'bg-primary text-primary-foreground',
                  !inMonth && 'text-muted-foreground/50'
                )}>
                  {format(day, 'd')}
                </span>
              </div>
              <div className="space-y-0.5">
                {dayEvents.slice(0, 2).map(ev => (
                  <button
                    key={ev.id}
                    onClick={() => onEventClick(ev)}
                    className="w-full text-left text-[10px] md:text-xs px-1 py-0.5 rounded bg-primary/10 text-primary hover:bg-primary/20 truncate transition-colors"
                  >
                    {format(new Date(ev.start_at), 'h:mma').toLowerCase()} - {ev.title}
                  </button>
                ))}
                {dayEvents.length > 2 && (
                  <span className="text-[10px] text-muted-foreground px-1">+{dayEvents.length - 2} more</span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
