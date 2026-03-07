import { supabase } from '@/integrations/supabase/client';
import { doorUserTasksService } from '@/services/doorUserTasksService';
import { getWeek, format, startOfWeek, isToday, parseISO } from 'date-fns';

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

const STORAGE_KEY = 'daily-master-completions';

// Get today's date in YYYY-MM-DD format
const getTodayKey = () => format(new Date(), 'yyyy-MM-dd');

// Get all completions from localStorage
const getCompletions = (): Record<string, DailyMasterCompletion> => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : {};
  } catch {
    // JSON parse failed – return safe fallback
    return {};
  }
};

// Save completions to localStorage
const saveCompletions = (completions: Record<string, DailyMasterCompletion>) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(completions));
};

export const dailyMasterService = {
  // Mark today as completed
  async markCompleted(): Promise<void> {
    const completions = getCompletions();
    const today = getTodayKey();
    
    completions[today] = {
      date: today,
      completed: true,
      completedAt: new Date().toISOString()
    };
    
    saveCompletions(completions);
    
    // Also save to Supabase for persistence
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        await supabase.from('daily_tracking').upsert({
          user_id: user.id,
          date: today,
          stack_completed: true,
          updated_at: new Date().toISOString()
        }, {
          onConflict: 'user_id,date'
        });
      }
    } catch (error) {
      console.error('Error saving to Supabase:', error);
    }
  },

  // Check if completed today
  isCompletedToday(): boolean {
    const completions = getCompletions();
    const today = getTodayKey();
    return completions[today]?.completed || false;
  },

  // Calculate current streak
  calculateStreak(): number {
    const completions = getCompletions();
    const dates = Object.keys(completions)
      .filter(date => completions[date].completed)
      .sort()
      .reverse();
    
    if (dates.length === 0) return 0;
    
    let streak = 0;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    for (let i = 0; i < dates.length; i++) {
      const checkDate = new Date(today);
      checkDate.setDate(checkDate.getDate() - i);
      const checkKey = format(checkDate, 'yyyy-MM-dd');
      
      if (completions[checkKey]?.completed) {
        streak++;
      } else if (i === 0) {
        // Today not completed yet, check if yesterday was
        continue;
      } else {
        break;
      }
    }
    
    return streak;
  },

  // Get full stats
  getStats(): DailyMasterStats {
    const completions = getCompletions();
    const dates = Object.keys(completions)
      .filter(date => completions[date].completed)
      .sort();
    
    const currentStreak = this.calculateStreak();
    const totalCompletions = dates.length;
    const lastCompletedDate = dates.length > 0 ? dates[dates.length - 1] : null;
    const completedToday = this.isCompletedToday();
    
    // Calculate longest streak
    let longestStreak = 0;
    let tempStreak = 0;
    let prevDate: Date | null = null;
    
    for (const dateStr of dates) {
      const date = parseISO(dateStr);
      if (prevDate) {
        const diffDays = Math.round((date.getTime() - prevDate.getTime()) / (1000 * 60 * 60 * 24));
        if (diffDays === 1) {
          tempStreak++;
        } else {
          longestStreak = Math.max(longestStreak, tempStreak);
          tempStreak = 1;
        }
      } else {
        tempStreak = 1;
      }
      prevDate = date;
    }
    longestStreak = Math.max(longestStreak, tempStreak);
    
    return {
      currentStreak,
      longestStreak,
      totalCompletions,
      lastCompletedDate,
      completedToday
    };
  },

  // Get today's tasks from To-Do list
  async getTodaysTasks(): Promise<{ text: string; priority: string }[]> {
    try {
      const today = new Date();
      const weekKey = `door-week-${today.getFullYear()}-${getWeek(today)}`;
      const dayOfWeek = format(today, 'EEEE').toLowerCase();
      
      // Map day names to abbreviations used in the system
      const dayMap: Record<string, string> = {
        monday: 'M',
        tuesday: 'T',
        wednesday: 'W',
        thursday: 'Th',
        friday: 'F',
        saturday: 'Sa',
        sunday: 'Su'
      };
      const todayAbbrev = dayMap[dayOfWeek];
      
      const { hitList, doList } = await doorUserTasksService.fetchWeekLists(weekKey);
      
      // Filter tasks assigned to today
      const todaysTasks = [
        ...hitList.filter(task => task.day === todayAbbrev && !task.completed),
        ...doList.filter(task => task.day === todayAbbrev && !task.completed)
      ].map(task => ({
        text: task.text,
        priority: task.priority || 'none'
      }));
      
      return todaysTasks;
    } catch (error) {
      console.error('Error fetching today tasks:', error);
      return [];
    }
  },

  // Format tasks for AI prompt
  formatTasksForPrompt(tasks: { text: string; priority: string }[]): string {
    if (tasks.length === 0) return '';
    
    const priorityLabels: Record<string, string> = {
      'urgent-important': '🔴',
      'urgent': '🟠',
      'important': '🟡',
      'none': '⚪'
    };
    
    return tasks.map(t => `${priorityLabels[t.priority] || '⚪'} ${t.text}`).join('\n');
  }
};
