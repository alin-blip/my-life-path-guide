import { format, startOfWeek, addDays, getISOWeek, getISOWeekYear } from 'date-fns';

export const DAY_ABBREVS = ['M', 'T', 'W', 'Th', 'F', 'Sa', 'Su'] as const;
export type DayAbbrev = typeof DAY_ABBREVS[number];

export const HOUR_START = 6;
export const HOUR_END = 22;
export const SLOT_MINUTES = 30;
export const SLOT_HEIGHT_PX = 24; // height per 30-min slot
export const TOTAL_SLOTS = ((HOUR_END - HOUR_START) * 60) / SLOT_MINUTES;

/** Returns the JS day index (0=Mon..6=Sun) for an ISO date */
export function jsDayToAbbrev(date: Date): DayAbbrev {
  // getDay: 0=Sun..6=Sat. We want M..Su index.
  const d = date.getDay();
  return DAY_ABBREVS[d === 0 ? 6 : d - 1];
}

export function weekKeyForDate(date: Date): string {
  const y = getISOWeekYear(date);
  const w = String(getISOWeek(date)).padStart(2, '0');
  return `door-week-${y}-${w}`;
}

/** Monday of the ISO week for the given date */
export function weekMondayForDate(date: Date): Date {
  return startOfWeek(date, { weekStartsOn: 1 });
}

export function dateForDayInWeek(monday: Date, day: DayAbbrev): Date {
  const idx = DAY_ABBREVS.indexOf(day);
  return addDays(monday, idx);
}

/** "HH:mm:ss" -> minutes from 00:00 */
export function timeToMinutes(t: string | null | undefined): number | null {
  if (!t) return null;
  const [h, m] = t.split(':').map(Number);
  if (Number.isNaN(h) || Number.isNaN(m)) return null;
  return h * 60 + m;
}

export function minutesToTime(min: number): string {
  const h = Math.floor(min / 60);
  const m = min % 60;
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:00`;
}

/** Convert minutes-from-midnight -> Y position px from top of grid */
export function minutesToY(min: number): number {
  const fromStart = min - HOUR_START * 60;
  return (fromStart / SLOT_MINUTES) * SLOT_HEIGHT_PX;
}

/** Snap minutes to the nearest slot boundary */
export function snapToSlot(min: number): number {
  return Math.round(min / SLOT_MINUTES) * SLOT_MINUTES;
}

export function clampToGrid(min: number): number {
  return Math.max(HOUR_START * 60, Math.min(HOUR_END * 60 - SLOT_MINUTES, min));
}

export function durationToHeight(durationMin: number): number {
  return Math.max(SLOT_HEIGHT_PX, (durationMin / SLOT_MINUTES) * SLOT_HEIGHT_PX);
}

export function formatTimeShort(t: string | null | undefined): string {
  if (!t) return '';
  return t.slice(0, 5);
}

export const PRIORITY_META: Record<number, { icon: string; label: string; color: string }> = {
  1: { icon: '🔥', label: 'Urgent + Important', color: 'bg-red-500/20 border-red-500/50 text-red-100' },
  2: { icon: '⭐', label: 'Important', color: 'bg-amber-500/20 border-amber-500/50 text-amber-100' },
  3: { icon: '⚡', label: 'Urgent', color: 'bg-blue-500/20 border-blue-500/50 text-blue-100' },
  4: { icon: '💤', label: 'Later', color: 'bg-zinc-500/20 border-zinc-500/50 text-zinc-100' },
};

export function priorityMeta(p: number | null | undefined) {
  return PRIORITY_META[p ?? 2] ?? PRIORITY_META[2];
}

export function formatDayLabel(date: Date, lang: 'ro' | 'en'): string {
  const ro = ['Lun', 'Mar', 'Mie', 'Joi', 'Vin', 'Sâm', 'Dum'];
  const en = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  const idx = date.getDay() === 0 ? 6 : date.getDay() - 1;
  const names = lang === 'ro' ? ro : en;
  return `${names[idx]} ${format(date, 'd MMM')}`;
}
