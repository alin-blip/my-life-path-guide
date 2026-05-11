import { supabase } from '@/integrations/supabase/client';
import { doorUserTasksService } from '@/services/doorUserTasksService';
import { getWeek, format, parseISO } from 'date-fns';

export interface DailyMasterCompletion {
  date: string;
  completed: boolean;
  completedAt?: string;
}

export interface DailyMasterStats {
  currentStreak: number;
  longestStreak: number;
  totalCompletions: number;
  lastCompletedDate: string | null;
  completedToday: boolean;
}

// Cache key — DB (daily_tracking) is the source of truth.
// localStorage is only an instant-render cache mirroring the latest DB read.
const STORAGE_KEY = 'daily-master-completions';

const getTodayKey = () => format(new Date(), 'yyyy-MM-dd');

const getCachedCompletions = (): Record<string, DailyMasterCompletion> => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : {};
  } catch {
    return {};
  }
};

const writeCache = (completions: Record<string, DailyMasterCompletion>) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(completions));
  } catch (e) {
    console.warn('[dailyMasterService] cache write failed', e);
  }
};

const computeStats = (
  completions: Record<string, DailyMasterCompletion>
): DailyMasterStats => {
  const dates = Object.keys(completions)
    .filter((d) => completions[d].completed)
    .sort();

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // Current streak (walking back from today)
  let currentStreak = 0;
  for (let i = 0; i < 365; i++) {
    const checkDate = new Date(today);
    checkDate.setDate(checkDate.getDate() - i);
    const checkKey = format(checkDate, 'yyyy-MM-dd');
    if (completions[checkKey]?.completed) {
      currentStreak++;
    } else if (i === 0) {
      // today not done yet — keep counting from yesterday
      continue;
    } else {
      break;
    }
  }

  // Longest streak
  let longestStreak = 0;
  let tempStreak = 0;
  let prevDate: Date | null = null;
  for (const dateStr of dates) {
    const date = parseISO(dateStr);
    if (prevDate) {
      const diffDays = Math.round(
        (date.getTime() - prevDate.getTime()) / (1000 * 60 * 60 * 24)
      );
      tempStreak = diffDays === 1 ? tempStreak + 1 : 1;
    } else {
      tempStreak = 1;
    }
    longestStreak = Math.max(longestStreak, tempStreak);
    prevDate = date;
  }

  return {
    currentStreak,
    longestStreak,
    totalCompletions: dates.length,
    lastCompletedDate: dates.length ? dates[dates.length - 1] : null,
    completedToday: !!completions[getTodayKey()]?.completed,
  };
};

export const dailyMasterService = {
  /**
   * Mark today as completed. DB is source of truth; cache mirrors it.
   */
  async markCompleted(): Promise<void> {
    const today = getTodayKey();
    const nowIso = new Date().toISOString();

    // Update cache immediately for instant UI
    const completions = getCachedCompletions();
    completions[today] = { date: today, completed: true, completedAt: nowIso };
    writeCache(completions);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { error } = await supabase
        .from('daily_tracking')
        .upsert(
          {
            user_id: user.id,
            date: today,
            stack_completed: true,
            updated_at: nowIso,
          },
          { onConflict: 'user_id,date' }
        );

      if (error) console.error('[dailyMasterService] DB upsert error:', error);
    } catch (error) {
      console.error('[dailyMasterService] markCompleted error:', error);
    }
  },

  /**
   * Load last 365 days from DB into cache. Returns fresh stats.
   * Call this on auth/mount to hydrate before showing UI.
   */
  async refreshFromDB(): Promise<DailyMasterStats> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return computeStats(getCachedCompletions());

      const cutoff = new Date();
      cutoff.setDate(cutoff.getDate() - 365);
      const cutoffKey = format(cutoff, 'yyyy-MM-dd');

      const { data, error } = await supabase
        .from('daily_tracking')
        .select('date, stack_completed, updated_at')
        .eq('user_id', user.id)
        .eq('stack_completed', true)
        .gte('date', cutoffKey)
        .order('date', { ascending: true });

      if (error) {
        console.error('[dailyMasterService] DB read error:', error);
        return computeStats(getCachedCompletions());
      }

      const completions: Record<string, DailyMasterCompletion> = {};
      for (const row of data ?? []) {
        const dateKey = String(row.date);
        completions[dateKey] = {
          date: dateKey,
          completed: true,
          completedAt: row.updated_at ?? undefined,
        };
      }

      writeCache(completions);
      return computeStats(completions);
    } catch (error) {
      console.error('[dailyMasterService] refreshFromDB error:', error);
      return computeStats(getCachedCompletions());
    }
  },

  /** Synchronous read from cache — for instant render. Combine with refreshFromDB(). */
  getStats(): DailyMasterStats {
    return computeStats(getCachedCompletions());
  },

  isCompletedToday(): boolean {
    return getCachedCompletions()[getTodayKey()]?.completed ?? false;
  },

  calculateStreak(): number {
    return computeStats(getCachedCompletions()).currentStreak;
  },

  // Get today's tasks from To-Do list (Door)
  async getTodaysTasks(): Promise<{ text: string; priority: string }[]> {
    try {
      const today = new Date();
      const weekKey = `door-week-${today.getFullYear()}-${getWeek(today)}`;
      const dayOfWeek = format(today, 'EEEE').toLowerCase();
      const dayMap: Record<string, string> = {
        monday: 'M', tuesday: 'T', wednesday: 'W', thursday: 'Th',
        friday: 'F', saturday: 'Sa', sunday: 'Su',
      };
      const todayAbbrev = dayMap[dayOfWeek];

      const { hitList, doList } = await doorUserTasksService.fetchWeekLists(weekKey);
      return [
        ...hitList.filter((t) => t.day === todayAbbrev && !t.completed),
        ...doList.filter((t) => t.day === todayAbbrev && !t.completed),
      ].map((t) => ({ text: t.text, priority: t.priority || 'none' }));
    } catch (error) {
      console.error('Error fetching today tasks:', error);
      return [];
    }
  },

  formatTasksForPrompt(tasks: { text: string; priority: string }[]): string {
    if (tasks.length === 0) return '';
    const labels: Record<string, string> = {
      'urgent-important': '🔴',
      urgent: '🟠',
      important: '🟡',
      none: '⚪',
    };
    return tasks.map((t) => `${labels[t.priority] || '⚪'} ${t.text}`).join('\n');
  },
};
