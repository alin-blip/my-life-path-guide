/**
 * Centralized week key utilities for consistent week calculations
 * across the entire application (frontend and edge functions).
 * 
 * Uses ISO week numbering where:
 * - Week starts on Monday
 * - Week 1 is the week containing January 4th
 * 
 * SUNDAY LOGIC:
 * - Execution week: Monday-Saturday
 * - Sunday: Review & Planning day for the UPCOMING week
 */

import { getWeek, getYear, startOfWeek, addWeeks, addDays } from 'date-fns';

/**
 * Get the week key for a specific date in door format: "door-week-YYYY-WW"
 * Uses ISO week numbering consistent with date-fns
 */
export function getWeekKey(date: Date = new Date()): string {
  const weekStart = startOfWeek(date, { weekStartsOn: 1 });
  const weekNum = getWeek(weekStart, { weekStartsOn: 1, firstWeekContainsDate: 4 });
  const year = getYear(weekStart);
  return `door-week-${year}-${String(weekNum).padStart(2, '0')}`;
}

/**
 * Get the ACTIVE week key based on Sunday planning logic:
 * - Monday-Saturday: returns current week key (execution mode)
 * - Sunday: returns NEXT week key (planning mode)
 * 
 * This is the PRIMARY function to use for Door/Tasks features.
 */
export function getActiveWeekKey(date: Date = new Date()): string {
  const dayOfWeek = date.getDay();
  const isSunday = dayOfWeek === 0;
  
  if (isSunday) {
    // Sunday = Planning day → show next week
    const nextMonday = addDays(date, 1);
    return getWeekKey(nextMonday);
  }
  
  return getWeekKey(date);
}

/**
 * Check if today is Sunday (planning day)
 */
export function isSundayPlanningDay(date: Date = new Date()): boolean {
  return date.getDay() === 0;
}

/**
 * Get today's day abbreviation (M, T, W, Th, F, Sa, Su)
 */
export function getTodayAbbrev(): string {
  const DAY_MAP: Record<number, string> = {
    1: 'M',
    2: 'T',
    3: 'W',
    4: 'Th',
    5: 'F',
    6: 'Sa',
    0: 'Su',
  };
  const dayOfWeek = new Date().getDay();
  return DAY_MAP[dayOfWeek];
}

/**
 * Parse a week key to extract year and week number
 */
export function parseWeekKey(weekKey: string): { year: number; week: number } | null {
  const match = weekKey.match(/door-week-(\d{4})-(\d{1,2})/);
  if (!match) return null;
  return {
    year: parseInt(match[1], 10),
    week: parseInt(match[2], 10),
  };
}

/**
 * Get week key for planning purposes.
 * Monday-Saturday: saves to current week
 * Sunday: saves to next week (for advance planning)
 * 
 * @deprecated Use getActiveWeekKey() instead - same logic, clearer name
 */
export function getWeekKeyForPlanning(date: Date = new Date()): string {
  return getActiveWeekKey(date);
}
