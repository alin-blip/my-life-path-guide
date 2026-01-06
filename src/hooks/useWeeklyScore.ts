import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/context/AuthContext';
import { format, startOfWeek, endOfWeek, eachDayOfInterval, startOfMonth, endOfMonth, eachWeekOfInterval } from 'date-fns';

export interface DailyScoreEntry {
  date: string;
  score: number;
}

export interface WeeklyScore {
  week_key: string;
  daily_scores: DailyScoreEntry[];
  average_score: number;
  objectives_completed: number;
  objectives_total: number;
  streak_bonus: number;
  total_score: number;
}

export interface MonthlyScore {
  month_key: string;
  weekly_scores: WeeklyScore[];
  average_score: number;
  perfect_days: number;
  total_xp_earned: number;
}

export const useWeeklyScore = () => {
  const { user } = useAuth();
  const [weeklyScore, setWeeklyScore] = useState<WeeklyScore | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const getWeekKey = (date: Date = new Date()): string => {
    const weekStart = startOfWeek(date, { weekStartsOn: 1 });
    return format(weekStart, 'yyyy-MM-dd');
  };

  const fetchWeeklyScore = useCallback(async (weekKey?: string) => {
    if (!user) return;

    const targetWeekKey = weekKey || getWeekKey();

    try {
      const { data, error } = await supabase
        .from('weekly_scores')
        .select('*')
        .eq('user_id', user.id)
        .eq('week_key', targetWeekKey)
        .maybeSingle();

      if (error) throw error;

      if (data) {
        const dailyScoresData = Array.isArray(data.daily_scores) 
          ? data.daily_scores as unknown as DailyScoreEntry[]
          : [];
        setWeeklyScore({
          week_key: data.week_key,
          daily_scores: dailyScoresData,
          average_score: Number(data.average_score) || 0,
          objectives_completed: data.objectives_completed || 0,
          objectives_total: data.objectives_total || 0,
          streak_bonus: data.streak_bonus || 0,
          total_score: Number(data.total_score) || 0,
        });
      } else {
        // Initialize empty week
        setWeeklyScore({
          week_key: targetWeekKey,
          daily_scores: [],
          average_score: 0,
          objectives_completed: 0,
          objectives_total: 0,
          streak_bonus: 0,
          total_score: 0,
        });
      }
    } catch (err) {
      console.error('Error fetching weekly score:', err);
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  const updateDailyScore = useCallback(async (date: string, score: number) => {
    if (!user || !weeklyScore) return;

    const updatedDailyScores = [...weeklyScore.daily_scores];
    const existingIndex = updatedDailyScores.findIndex(d => d.date === date);
    
    if (existingIndex >= 0) {
      updatedDailyScores[existingIndex].score = score;
    } else {
      updatedDailyScores.push({ date, score });
    }

    // Calculate average
    const average = updatedDailyScores.length > 0
      ? updatedDailyScores.reduce((sum, d) => sum + d.score, 0) / updatedDailyScores.length
      : 0;

    // Calculate total score: average (70%) + objectives (20%) + streak bonus (10%)
    const objectivesScore = weeklyScore.objectives_total > 0
      ? (weeklyScore.objectives_completed / weeklyScore.objectives_total) * 100
      : 0;
    const totalScore = (average * 0.7) + (objectivesScore * 0.2) + (weeklyScore.streak_bonus * 0.1);

    const { error } = await supabase
      .from('weekly_scores')
      .upsert({
        user_id: user.id,
        week_key: weeklyScore.week_key,
        daily_scores: updatedDailyScores as unknown as any,
        average_score: average,
        total_score: totalScore,
      });

    if (error) {
      console.error('Error updating weekly score:', error);
      return;
    }

    setWeeklyScore(prev => prev ? {
      ...prev,
      daily_scores: updatedDailyScores,
      average_score: average,
      total_score: totalScore,
    } : null);
  }, [user, weeklyScore]);

  useEffect(() => {
    fetchWeeklyScore();
  }, [fetchWeeklyScore]);

  return {
    weeklyScore,
    isLoading,
    updateDailyScore,
    refetch: fetchWeeklyScore,
  };
};

export const useMonthlyScore = () => {
  const { user } = useAuth();
  const [monthlyScore, setMonthlyScore] = useState<MonthlyScore | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const getMonthKey = (date: Date = new Date()): string => {
    return format(date, 'yyyy-MM');
  };

  const fetchMonthlyScore = useCallback(async (monthKey?: string) => {
    if (!user) return;

    const targetMonthKey = monthKey || getMonthKey();

    try {
      const { data, error } = await supabase
        .from('monthly_scores')
        .select('*')
        .eq('user_id', user.id)
        .eq('month_key', targetMonthKey)
        .maybeSingle();

      if (error) throw error;

      if (data) {
        const weeklyScoresData = Array.isArray(data.weekly_scores)
          ? data.weekly_scores as unknown as WeeklyScore[]
          : [];
        setMonthlyScore({
          month_key: data.month_key,
          weekly_scores: weeklyScoresData,
          average_score: Number(data.average_score) || 0,
          perfect_days: data.perfect_days || 0,
          total_xp_earned: data.total_xp_earned || 0,
        });
      } else {
        setMonthlyScore({
          month_key: targetMonthKey,
          weekly_scores: [],
          average_score: 0,
          perfect_days: 0,
          total_xp_earned: 0,
        });
      }
    } catch (err) {
      console.error('Error fetching monthly score:', err);
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchMonthlyScore();
  }, [fetchMonthlyScore]);

  return {
    monthlyScore,
    isLoading,
    refetch: fetchMonthlyScore,
  };
};
