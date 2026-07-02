import React, { useMemo, useRef, useState } from 'react';
import { addDays, format } from 'date-fns';
import { CalendarClock, ChevronLeft, ChevronRight, Plus, Trash2, Inbox, Check, Bell } from 'lucide-react';
import { WidgetContainer } from './WidgetContainer';
import { WidgetSize } from '@/types/dashboardWidget';
import { useLanguage } from '@/context/LanguageContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import { useTimeBlockTasks, type TimeBlockTask } from '@/hooks/useTimeBlockTasks';
import { useTodayActivity } from '@/hooks/useTodayActivity';
import {
  HOUR_START, HOUR_END, SLOT_HEIGHT_PX, SLOT_MINUTES,
  TOTAL_SLOTS, jsDayToAbbrev, weekMondayForDate, weekKeyForDate, dateForDayInWeek,
  timeToMinutes, minutesToTime, minutesToY, snapToSlot, clampToGrid,
  durationToHeight, formatDayLabel, formatTimeShort, priorityMeta,
  type DayAbbrev,
} from '@/utils/timeBlockHelpers';


interface Props {
  size: WidgetSize;
  onRemove: () => void;
  onResize: (size: WidgetSize) => void;
  dragHandleProps?: any;
}

const DRAG_MIME = 'application/x-time-block-task';

export const TimeBlockCalendarWidget: React.FC<Props> = ({ size, onRemove, onResize, dragHandleProps }) => {
  const { language } = useLanguage();
  const t = (ro: string, en: string) => language === 'ro' ? ro : en;

  const [anchorDate, setAnchorDate] = useState<Date>(new Date());

  // Two visible days: anchorDate and anchorDate+1 (may span two ISO weeks, e.g. Sun→Mon)
  const day1 = anchorDate;
  const day2 = addDays(anchorDate, 1);
  const day1Abbrev = jsDayToAbbrev(day1);
  const day2Abbrev = jsDayToAbbrev(day2);
  const extraWeekKeys = useMemo(
    () => [weekKeyForDate(day1), weekKeyForDate(day2)],
    [day1, day2]
  );

  const { tasks, createTask, updateTask, deleteTask, toggleComplete } = useTimeBlockTasks({
    anchorDate,
    extraWeekKeys,
  });


  const goPrev = () => setAnchorDate(d => addDays(d, -7));
  const goNext = () => setAnchorDate(d => addDays(d, 7));
  const goToday = () => setAnchorDate(new Date());

  const dayTasks = (abbrev: DayAbbrev) => tasks.filter(x => x.day_of_week === abbrev);

  return (
    <WidgetContainer
      title={t('Calendar Time-Block', 'Time-Block Calendar')}
      icon={<CalendarClock className="h-5 w-5" />}
      size={size}
      onRemove={onRemove}
      onResize={onResize}
      dragHandleProps={dragHandleProps}
    >
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-border">
        <div className="flex items-center gap-1">
          <Button size="sm" variant="ghost" onClick={goPrev} aria-label={t('Săptămâna anterioară', 'Previous week')}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <span className="text-xs font-medium px-2 min-w-[120px] text-center">
            {format(weekMondayForDate(anchorDate), 'd MMM')} — {format(addDays(weekMondayForDate(anchorDate), 6), 'd MMM yyyy')}
          </span>
          <Button size="sm" variant="ghost" onClick={goNext} aria-label={t('Săptămâna următoare', 'Next week')}>
            <ChevronRight className="h-4 w-4" />
          </Button>
          <Button size="sm" variant="outline" onClick={goToday} className="ml-2 h-7">
            {t('Azi', 'Today')}
          </Button>
        </div>
        <QuickAddTask onAdd={createTask} defaultDay={day1Abbrev} t={t} />
      </div>

      {/* Coach notification preview */}
      <CoachNotificationPreview tasks={tasks} todayAbbrev={day1Abbrev} t={t} />

      {/* Today's completed activity (Shadow Coach overlay) */}
      <TodayCompletedOverlay t={t} />

      {/* Two-day grid */}
      <div className="grid grid-cols-2 gap-3 pt-3">
        <DayColumn
          date={day1}
          dayAbbrev={day1Abbrev}
          isToday={isSameDay(day1, new Date())}
          label={t('AZI', 'TODAY') + ' — ' + formatDayLabel(day1, language as 'ro' | 'en')}
          tasks={dayTasks(day1Abbrev)}
          onUpdate={updateTask}
          onDelete={deleteTask}
          onToggle={toggleComplete}
          t={t}
        />
        <DayColumn
          date={day2}
          dayAbbrev={day2Abbrev}
          isToday={false}
          label={t('MÂINE', 'TOMORROW') + ' — ' + formatDayLabel(day2, language as 'ro' | 'en')}
          tasks={dayTasks(day2Abbrev)}
          onUpdate={updateTask}
          onDelete={deleteTask}
          onToggle={toggleComplete}
          t={t}
        />
      </div>
    </WidgetContainer>
  );
};

function isSameDay(a: Date, b: Date) {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
}

// ===================== Coach Notification Preview =====================
interface CoachPreviewProps {
  tasks: TimeBlockTask[];
  todayAbbrev: DayAbbrev;
  t: (ro: string, en: string) => string;
}

const CoachNotificationPreview: React.FC<CoachPreviewProps> = ({ tasks, todayAbbrev, t }) => {
  const now = new Date();
  const nowMin = now.getHours() * 60 + now.getMinutes();

  const nextTask = useMemo(() => {
    return tasks
      .filter(x => x.day_of_week === todayAbbrev && x.scheduled_time && !x.completed)
      .map(x => {
        const [h, m] = (x.scheduled_time as string).split(':').map(Number);
        return { ...x, _min: h * 60 + m };
      })
      .filter(x => x._min >= nowMin - 5)
      .sort((a, b) => a._min - b._min)[0];
  }, [tasks, todayAbbrev, nowMin]);

  const exampleTime = nextTask
    ? (nextTask.scheduled_time as string).slice(0, 5)
    : '09:00';
  const exampleTitle = nextTask?.title ?? t('Sesiune de focus profund', 'Deep focus session');
  const minsUntil = nextTask ? Math.max(0, nextTask._min - nowMin) : null;

  const timingLabel =
    minsUntil === null
      ? t('Exemplu', 'Example')
      : minsUntil <= 0
        ? t('ACUM', 'NOW')
        : minsUntil < 60
          ? t(`în ${minsUntil} min`, `in ${minsUntil} min`)
          : t(`la ${exampleTime}`, `at ${exampleTime}`);

  return (
    <div className="mt-3 rounded-lg border border-primary/30 bg-gradient-to-r from-primary/5 to-accent/5 p-3">
      <div className="flex items-start gap-3">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary/15 text-primary">
          <Bell className="h-4 w-4" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2 mb-1">
            <span className="text-xs font-semibold text-foreground">
              {t('Coach Accountability', 'Accountability Coach')}
            </span>
            <span className="text-[10px] uppercase tracking-wide font-bold text-primary">
              {timingLabel}
            </span>
          </div>
          <p className="text-xs text-muted-foreground leading-relaxed">
            {t(
              `„Hey, e ${exampleTime} — e timpul pentru: `,
              `"Hey, it's ${exampleTime} — time for: `
            )}
            <span className="font-medium text-foreground">{exampleTitle}</span>
            {t('. Hai, intră în treabă acum."', '. Let\'s get into it now."')}
          </p>
          <p className="mt-1 text-[10px] text-muted-foreground/80 italic">
            {t(
              'Coach-ul te anunță automat la ora fiecărui task din calendar.',
              'The coach pings you automatically at each scheduled task time.'
            )}
          </p>
        </div>
      </div>
    </div>
  );
};


// ===================== Day Column =====================
interface DayColumnProps {
  date: Date;
  dayAbbrev: DayAbbrev;
  isToday: boolean;
  label: string;
  tasks: TimeBlockTask[];
  onUpdate: (id: string, patch: Partial<TimeBlockTask>) => void;
  onDelete: (id: string) => void;
  onToggle: (id: string, completed: boolean) => void;
  t: (ro: string, en: string) => string;
}

const DayColumn: React.FC<DayColumnProps> = ({ dayAbbrev, isToday, label, tasks, onUpdate, onDelete, onToggle, t }) => {
  const gridRef = useRef<HTMLDivElement>(null);
  const scheduled = tasks.filter(x => x.scheduled_time);
  const unscheduled = tasks.filter(x => !x.scheduled_time);

  const handleDropOnGrid = (e: React.DragEvent) => {
    e.preventDefault();
    const data = e.dataTransfer.getData(DRAG_MIME);
    if (!data || !gridRef.current) return;
    const { id, durationMinutes } = JSON.parse(data) as { id: string; durationMinutes: number };
    const rect = gridRef.current.getBoundingClientRect();
    const yWithin = e.clientY - rect.top;
    const minutesFromStart = (yWithin / SLOT_HEIGHT_PX) * SLOT_MINUTES;
    const absMin = clampToGrid(snapToSlot(HOUR_START * 60 + minutesFromStart));
    onUpdate(id, {
      day_of_week: dayAbbrev,
      scheduled_time: minutesToTime(absMin),
      duration_minutes: durationMinutes || 30,
    });
  };

  const handleDropOnBin = (e: React.DragEvent) => {
    e.preventDefault();
    const data = e.dataTransfer.getData(DRAG_MIME);
    if (!data) return;
    const { id } = JSON.parse(data) as { id: string };
    onUpdate(id, { day_of_week: dayAbbrev, scheduled_time: null });
  };

  const allowDrop = (e: React.DragEvent) => e.preventDefault();

  // Now-line position
  const now = new Date();
  const nowMinutes = now.getHours() * 60 + now.getMinutes();
  const showNow = isToday && nowMinutes >= HOUR_START * 60 && nowMinutes <= HOUR_END * 60;

  return (
    <div className={cn(
      'rounded-lg border border-border bg-card/30 overflow-hidden flex flex-col',
      isToday && 'ring-1 ring-primary/40'
    )}>
      <div className="px-3 py-2 text-xs font-semibold border-b border-border bg-muted/30">
        {label}
      </div>

      <ScrollArea className="h-[440px]">
        <div
          ref={gridRef}
          className="relative"
          style={{ height: TOTAL_SLOTS * SLOT_HEIGHT_PX }}
          onDragOver={allowDrop}
          onDrop={handleDropOnGrid}
        >
          {/* hour lines */}
          {Array.from({ length: HOUR_END - HOUR_START + 1 }).map((_, i) => {
            const hour = HOUR_START + i;
            return (
              <div
                key={hour}
                className="absolute left-0 right-0 border-t border-border/40 flex items-start"
                style={{ top: i * 2 * SLOT_HEIGHT_PX }}
              >
                <span className="text-[10px] text-muted-foreground pl-1 -mt-1.5 bg-card/30">
                  {String(hour).padStart(2, '0')}:00
                </span>
              </div>
            );
          })}

          {/* now line */}
          {showNow && (
            <div
              className="absolute left-0 right-0 border-t-2 border-red-500 z-20 pointer-events-none"
              style={{ top: minutesToY(nowMinutes) }}
            >
              <span className="absolute -top-2 left-1 text-[9px] bg-red-500 text-white px-1 rounded">
                {format(now, 'HH:mm')}
              </span>
            </div>
          )}

          {/* tasks */}
          {scheduled.map(task => (
            <TaskCard
              key={task.id}
              task={task}
              onUpdate={onUpdate}
              onDelete={onDelete}
              onToggle={onToggle}
              t={t}
            />
          ))}
        </div>
      </ScrollArea>

      {/* Bin: unscheduled */}
      <div
        onDragOver={allowDrop}
        onDrop={handleDropOnBin}
        className="border-t border-border bg-muted/20 p-2 min-h-[60px]"
      >
        <div className="flex items-center gap-1.5 text-[11px] font-medium text-muted-foreground mb-1.5">
          <Inbox className="h-3 w-3" /> {t('Fără oră', 'No time')} ({unscheduled.length})
        </div>
        <div className="flex flex-wrap gap-1">
          {unscheduled.length === 0 && (
            <span className="text-[10px] text-muted-foreground italic">{t('Trage aici task-uri fără oră', 'Drop tasks here')}</span>
          )}
          {unscheduled.map(task => (
            <UnscheduledChip key={task.id} task={task} onUpdate={onUpdate} onDelete={onDelete} t={t} />
          ))}
        </div>
      </div>
    </div>
  );
};

// ===================== Task card (scheduled) =====================
interface TaskCardProps {
  task: TimeBlockTask;
  onUpdate: (id: string, patch: Partial<TimeBlockTask>) => void;
  onDelete: (id: string) => void;
  onToggle: (id: string, completed: boolean) => void;
  t: (ro: string, en: string) => string;
}

const TaskCard: React.FC<TaskCardProps> = ({ task, onUpdate, onDelete, onToggle, t }) => {
  const startMin = timeToMinutes(task.scheduled_time) ?? HOUR_START * 60;
  const top = minutesToY(startMin);
  const height = durationToHeight(task.duration_minutes ?? 30);
  const meta = priorityMeta(task.priority);

  const handleDragStart = (e: React.DragEvent) => {
    e.dataTransfer.setData(DRAG_MIME, JSON.stringify({
      id: task.id,
      durationMinutes: task.duration_minutes ?? 30,
    }));
    e.dataTransfer.effectAllowed = 'move';
  };

  return (
    <Popover>
      <PopoverTrigger asChild>
        <div
          draggable
          onDragStart={handleDragStart}
          className={cn(
            'absolute left-12 right-1 rounded-md border px-1.5 py-1 cursor-grab active:cursor-grabbing overflow-hidden text-[11px] shadow-sm hover:shadow-md transition-shadow z-10',
            meta.color,
            task.completed && 'opacity-50 line-through'
          )}
          style={{ top, height }}
        >
          <div className="flex items-center gap-1 font-medium truncate">
            <span>{meta.icon}</span>
            <span className="truncate">{task.title}</span>
          </div>
          <div className="text-[9px] opacity-80">
            {formatTimeShort(task.scheduled_time)} · {task.duration_minutes ?? 30}m
          </div>
        </div>
      </PopoverTrigger>
      <PopoverContent className="w-64 p-3 space-y-2">
        <div className="text-sm font-medium truncate">{task.title}</div>

        <div className="grid grid-cols-2 gap-2">
          <label className="text-[11px] space-y-1">
            <span className="text-muted-foreground">{t('Oră', 'Time')}</span>
            <Input
              type="time"
              value={(task.scheduled_time ?? '').slice(0, 5)}
              onChange={e => onUpdate(task.id, { scheduled_time: e.target.value ? `${e.target.value}:00` : null })}
              className="h-7 text-xs"
            />
          </label>
          <label className="text-[11px] space-y-1">
            <span className="text-muted-foreground">{t('Durata (min)', 'Duration (min)')}</span>
            <Input
              type="number"
              min={15}
              step={15}
              value={task.duration_minutes ?? 30}
              onChange={e => onUpdate(task.id, { duration_minutes: Math.max(15, Number(e.target.value) || 30) })}
              className="h-7 text-xs"
            />
          </label>
        </div>

        <label className="text-[11px] space-y-1 block">
          <span className="text-muted-foreground">{t('Prioritate', 'Priority')}</span>
          <Select
            value={String(task.priority ?? 2)}
            onValueChange={(v) => onUpdate(task.id, { priority: Number(v) })}
          >
            <SelectTrigger className="h-7 text-xs"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="1">🔥 {t('Urgent + Important', 'Urgent + Important')}</SelectItem>
              <SelectItem value="2">⭐ {t('Important', 'Important')}</SelectItem>
              <SelectItem value="3">⚡ {t('Urgent', 'Urgent')}</SelectItem>
              <SelectItem value="4">💤 {t('Mai târziu', 'Later')}</SelectItem>
            </SelectContent>
          </Select>
        </label>

        <div className="flex justify-between pt-1">
          <Button size="sm" variant="outline" onClick={() => onToggle(task.id, !task.completed)} className="h-7 text-xs">
            <Check className="h-3 w-3 mr-1" /> {task.completed ? t('Refă', 'Reopen') : t('Gata', 'Done')}
          </Button>
          <Button size="sm" variant="ghost" onClick={() => onDelete(task.id)} className="h-7 text-xs text-destructive">
            <Trash2 className="h-3 w-3" />
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
};

// ===================== Unscheduled chip =====================
interface ChipProps {
  task: TimeBlockTask;
  onUpdate: (id: string, patch: Partial<TimeBlockTask>) => void;
  onDelete: (id: string) => void;
  t: (ro: string, en: string) => string;
}

const UnscheduledChip: React.FC<ChipProps> = ({ task, onUpdate, onDelete, t }) => {
  const meta = priorityMeta(task.priority);
  const handleDragStart = (e: React.DragEvent) => {
    e.dataTransfer.setData(DRAG_MIME, JSON.stringify({
      id: task.id,
      durationMinutes: task.duration_minutes ?? 30,
    }));
    e.dataTransfer.effectAllowed = 'move';
  };
  return (
    <Popover>
      <PopoverTrigger asChild>
        <div
          draggable
          onDragStart={handleDragStart}
          className={cn(
            'rounded px-1.5 py-0.5 text-[10px] border cursor-grab truncate max-w-[140px]',
            meta.color,
            task.completed && 'opacity-50 line-through'
          )}
        >
          {meta.icon} {task.title}
        </div>
      </PopoverTrigger>
      <PopoverContent className="w-56 p-2 space-y-2">
        <div className="text-xs font-medium truncate">{task.title}</div>
        <div className="text-[11px] text-muted-foreground">{t('Trage în grid pentru a programa', 'Drag onto grid to schedule')}</div>
        <div className="flex justify-end">
          <Button size="sm" variant="ghost" onClick={() => onDelete(task.id)} className="h-6 text-xs text-destructive">
            <Trash2 className="h-3 w-3" />
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
};

// ===================== Quick add =====================
interface QuickAddProps {
  onAdd: (input: { title: string; day_of_week: DayAbbrev; scheduled_time?: string | null; duration_minutes?: number; priority?: number }) => void;
  defaultDay: DayAbbrev;
  t: (ro: string, en: string) => string;
}

const QuickAddTask: React.FC<QuickAddProps> = ({ onAdd, defaultDay, t }) => {
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [time, setTime] = useState('');
  const [duration, setDuration] = useState(30);
  const [day, setDay] = useState<DayAbbrev>(defaultDay);
  const [priority, setPriority] = useState(2);

  React.useEffect(() => { setDay(defaultDay); }, [defaultDay]);

  const submit = () => {
    if (!title.trim()) return;
    onAdd({
      title: title.trim(),
      day_of_week: day,
      scheduled_time: time ? `${time}:00` : null,
      duration_minutes: duration,
      priority,
    });
    setTitle(''); setTime(''); setDuration(30); setOpen(false);
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button size="sm" className="h-7"><Plus className="h-3 w-3 mr-1" /> {t('Task', 'Task')}</Button>
      </PopoverTrigger>
      <PopoverContent className="w-72 p-3 space-y-2">
        <Input
          placeholder={t('Ce vrei să faci?', 'What do you want to do?')}
          value={title}
          onChange={e => setTitle(e.target.value)}
          onKeyDown={e => { if (e.key === 'Enter') submit(); }}
          autoFocus
        />
        <div className="grid grid-cols-2 gap-2">
          <Input type="time" value={time} onChange={e => setTime(e.target.value)} className="h-8 text-xs" placeholder="HH:mm" />
          <Input type="number" min={15} step={15} value={duration} onChange={e => setDuration(Math.max(15, Number(e.target.value) || 30))} className="h-8 text-xs" />
        </div>
        <div className="grid grid-cols-2 gap-2">
          <Select value={day} onValueChange={(v) => setDay(v as DayAbbrev)}>
            <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="M">{t('Lun', 'Mon')}</SelectItem>
              <SelectItem value="T">{t('Mar', 'Tue')}</SelectItem>
              <SelectItem value="W">{t('Mie', 'Wed')}</SelectItem>
              <SelectItem value="Th">{t('Joi', 'Thu')}</SelectItem>
              <SelectItem value="F">{t('Vin', 'Fri')}</SelectItem>
              <SelectItem value="Sa">{t('Sâm', 'Sat')}</SelectItem>
              <SelectItem value="Su">{t('Dum', 'Sun')}</SelectItem>
            </SelectContent>
          </Select>
          <Select value={String(priority)} onValueChange={(v) => setPriority(Number(v))}>
            <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="1">🔥 P1</SelectItem>
              <SelectItem value="2">⭐ P2</SelectItem>
              <SelectItem value="3">⚡ P3</SelectItem>
              <SelectItem value="4">💤 P4</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <Button size="sm" className="w-full" onClick={submit}>{t('Adaugă', 'Add')}</Button>
      </PopoverContent>
    </Popover>
  );
};
