import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { format } from 'date-fns';

export type HabitCategory = 'body' | 'being' | 'balance' | 'business';
export type HabitGroup = 'core4' | 'biz4' | 'custom';

export interface DailyHabit {
  id: string;
  user_id: string;
  name: string;
  category: HabitCategory;
  habit_group: HabitGroup;
  icon: string;
  is_active: boolean;
  position: number;
  created_at: string;
  updated_at: string;
}

export interface HabitCompletion {
  id: string;
  habit_id: string;
  date: string;
  completed_at: string;
}

const DEFAULT_CORE4_HABITS: Omit<DailyHabit, 'id' | 'user_id' | 'created_at' | 'updated_at'>[] = [
  { name: 'Fitness', category: 'body', habit_group: 'core4', icon: 'dumbbell', is_active: true, position: 0 },
  { name: 'Fuel', category: 'body', habit_group: 'core4', icon: 'apple', is_active: true, position: 1 },
  { name: 'Person 1', category: 'balance', habit_group: 'core4', icon: 'heart', is_active: true, position: 2 },
  { name: 'Person 2', category: 'balance', habit_group: 'core4', icon: 'users', is_active: true, position: 3 },
  { name: 'Meditation', category: 'being', habit_group: 'core4', icon: 'brain', is_active: true, position: 4 },
  { name: 'Memoirs', category: 'being', habit_group: 'core4', icon: 'book-open', is_active: true, position: 5 },
  { name: 'Discover', category: 'business', habit_group: 'core4', icon: 'search', is_active: true, position: 6 },
  { name: 'Declare', category: 'business', habit_group: 'core4', icon: 'megaphone', is_active: true, position: 7 },
];

const DEFAULT_BIZ4_HABITS: Omit<DailyHabit, 'id' | 'user_id' | 'created_at' | 'updated_at'>[] = [
  { name: 'Content', category: 'business', habit_group: 'biz4', icon: 'pen-tool', is_active: true, position: 0 },
  { name: 'Engage', category: 'business', habit_group: 'biz4', icon: 'message-circle', is_active: true, position: 1 },
  { name: 'Outreach', category: 'business', habit_group: 'biz4', icon: 'send', is_active: true, position: 2 },
  { name: 'Close', category: 'business', habit_group: 'biz4', icon: 'handshake', is_active: true, position: 3 },
];

export const useDailyHabits = (date: Date = new Date()) => {
  const [habits, setHabits] = useState<DailyHabit[]>([]);
  const [completions, setCompletions] = useState<HabitCompletion[]>([]);
  const [habitStreaks, setHabitStreaks] = useState<Record<string, number>>({});
  const [isLoading, setIsLoading] = useState(true);

  const dateString = format(date, 'yyyy-MM-dd');

  // Calculate streak for a single habit
  const calculateHabitStreak = useCallback(async (habitId: string, userId: string): Promise<number> => {
    const { data: completions } = await supabase
      .from('daily_habit_completions')
      .select('date')
      .eq('habit_id', habitId)
      .eq('user_id', userId)
      .order('date', { ascending: false });

    if (!completions || completions.length === 0) return 0;

    let streak = 0;
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    for (let i = 0; i < completions.length; i++) {
      const completionDate = new Date(completions[i].date);
      completionDate.setHours(0, 0, 0, 0);
      
      const expectedDate = new Date(today);
      expectedDate.setDate(today.getDate() - streak);
      
      const diffDays = Math.floor((expectedDate.getTime() - completionDate.getTime()) / (1000 * 60 * 60 * 24));
      
      if (diffDays === 0) {
        streak++;
      } else if (diffDays === 1 && streak === 0) {
        // Yesterday counts as start of streak if today not done yet
        streak++;
      } else {
        break;
      }
    }

    return streak;
  }, []);

  // Fetch all streaks for habits
  const fetchAllStreaks = useCallback(async (habitsToCheck: DailyHabit[], userId: string) => {
    const streaks: Record<string, number> = {};
    
    await Promise.all(
      habitsToCheck.map(async (habit) => {
        streaks[habit.id] = await calculateHabitStreak(habit.id, userId);
      })
    );
    
    setHabitStreaks(streaks);
  }, [calculateHabitStreak]);

  const seedDefaultHabits = useCallback(async (userId: string) => {
    // Check if habits already exist to prevent duplicates
    const { data: existingHabits } = await supabase
      .from('daily_habits')
      .select('id')
      .eq('user_id', userId)
      .limit(1);
    
    if (existingHabits && existingHabits.length > 0) {
      return; // Already has habits, don't seed
    }

    const allDefaults = [...DEFAULT_CORE4_HABITS, ...DEFAULT_BIZ4_HABITS];
    
    const habitsToInsert = allDefaults.map((habit, index) => ({
      ...habit,
      user_id: userId,
      position: index,
    }));

    const { error } = await supabase
      .from('daily_habits')
      .insert(habitsToInsert);

    if (error) {
      console.error('Error seeding default habits:', error);
    }
  }, []);

  const fetchHabits = useCallback(async () => {
    setIsLoading(true);
    
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      setIsLoading(false);
      return;
    }

    // Fetch habits
    const { data: habitsData, error: habitsError } = await supabase
      .from('daily_habits')
      .select('*')
      .eq('user_id', user.id)
      .order('habit_group', { ascending: true })
      .order('position', { ascending: true });

    if (habitsError) {
      console.error('Error fetching habits:', habitsError);
      setIsLoading(false);
      return;
    }

    // If no habits exist, seed defaults
    let finalHabits: DailyHabit[] = [];
    if (!habitsData || habitsData.length === 0) {
      await seedDefaultHabits(user.id);
      // Refetch after seeding
      const { data: seededHabits } = await supabase
        .from('daily_habits')
        .select('*')
        .eq('user_id', user.id)
        .order('habit_group', { ascending: true })
        .order('position', { ascending: true });
      
      finalHabits = (seededHabits as DailyHabit[]) || [];
      setHabits(finalHabits);
    } else {
      finalHabits = habitsData as DailyHabit[];
      setHabits(finalHabits);
    }
    
    // Fetch streaks for all habits
    await fetchAllStreaks(finalHabits, user.id);

    // Fetch completions for today
    const { data: completionsData, error: completionsError } = await supabase
      .from('daily_habit_completions')
      .select('*')
      .eq('user_id', user.id)
      .eq('date', dateString);

    if (completionsError) {
      console.error('Error fetching completions:', completionsError);
    } else {
      setCompletions((completionsData as HabitCompletion[]) || []);
    }

    setIsLoading(false);
  }, [dateString, seedDefaultHabits, fetchAllStreaks]);

  useEffect(() => {
    fetchHabits();
  }, [fetchHabits]);

  const toggleHabit = useCallback(async (habitId: string) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const existingCompletion = completions.find(c => c.habit_id === habitId);

    if (existingCompletion) {
      // Remove completion
      const { error } = await supabase
        .from('daily_habit_completions')
        .delete()
        .eq('id', existingCompletion.id);

      if (!error) {
        setCompletions(prev => prev.filter(c => c.id !== existingCompletion.id));
      }
    } else {
      // Add completion
      const { data, error } = await supabase
        .from('daily_habit_completions')
        .insert({
          user_id: user.id,
          habit_id: habitId,
          date: dateString,
        })
        .select()
        .single();

      if (!error && data) {
        setCompletions(prev => [...prev, data as HabitCompletion]);
      }
    }
  }, [completions, dateString]);

  const addHabit = useCallback(async (habit: Omit<DailyHabit, 'id' | 'user_id' | 'created_at' | 'updated_at'>) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data, error } = await supabase
      .from('daily_habits')
      .insert({ ...habit, user_id: user.id })
      .select()
      .single();

    if (!error && data) {
      setHabits(prev => [...prev, data as DailyHabit]);
      return data as DailyHabit;
    }
    return null;
  }, []);

  const updateHabit = useCallback(async (id: string, updates: Partial<DailyHabit>) => {
    const { error } = await supabase
      .from('daily_habits')
      .update(updates)
      .eq('id', id);

    if (!error) {
      setHabits(prev => prev.map(h => h.id === id ? { ...h, ...updates } : h));
    }
  }, []);

  const deleteHabit = useCallback(async (id: string) => {
    const { error } = await supabase
      .from('daily_habits')
      .delete()
      .eq('id', id);

    if (!error) {
      setHabits(prev => prev.filter(h => h.id !== id));
    }
  }, []);

  const isHabitCompleted = useCallback((habitId: string) => {
    return completions.some(c => c.habit_id === habitId);
  }, [completions]);

  // Calculate progress by group
  const getGroupProgress = useCallback((group: HabitGroup) => {
    const groupHabits = habits.filter(h => h.habit_group === group && h.is_active);
    const completedCount = groupHabits.filter(h => isHabitCompleted(h.id)).length;
    return {
      total: groupHabits.length,
      completed: completedCount,
      percentage: groupHabits.length > 0 ? (completedCount / groupHabits.length) * 100 : 0,
    };
  }, [habits, isHabitCompleted]);

  // Get habits by group
  const getHabitsByGroup = useCallback((group: HabitGroup) => {
    return habits.filter(h => h.habit_group === group && h.is_active);
  }, [habits]);

  // Get streak for a habit
  const getHabitStreak = useCallback((habitId: string) => {
    return habitStreaks[habitId] || 0;
  }, [habitStreaks]);

  // Reorder habits (for drag-and-drop)
  const reorderHabits = useCallback(async (reorderedHabits: DailyHabit[]) => {
    // Update local state immediately
    setHabits(prev => {
      const otherHabits = prev.filter(h => !reorderedHabits.find(r => r.id === h.id));
      return [...otherHabits, ...reorderedHabits].sort((a, b) => {
        if (a.habit_group !== b.habit_group) {
          return a.habit_group.localeCompare(b.habit_group);
        }
        return (a.position || 0) - (b.position || 0);
      });
    });

    // Update positions in database
    await Promise.all(
      reorderedHabits.map((habit, index) =>
        supabase
          .from('daily_habits')
          .update({ position: index })
          .eq('id', habit.id)
      )
    );
  }, []);

  return {
    habits,
    completions,
    isLoading,
    toggleHabit,
    addHabit,
    updateHabit,
    deleteHabit,
    isHabitCompleted,
    getGroupProgress,
    getHabitsByGroup,
    getHabitStreak,
    reorderHabits,
    refetch: fetchHabits,
  };
};
