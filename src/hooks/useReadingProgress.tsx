import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/context/AuthContext';
import { getAllPrinciples } from '@/services/napoleonHillBookService';
import { awardXP } from '@/services/xpService';

export interface ReadingProgress {
  id: string;
  user_id: string;
  page_number: number;
  principle: string;
  chapter: string;
  read_at: string;
  action_completed: boolean;
  notes: string | null;
}

export interface PrincipleProgress {
  principle: string;
  pagesRead: number;
  totalPages: number;
  percentage: number;
  actionsCompleted: number;
}

export const useReadingProgress = () => {
  const { user } = useAuth();
  const [progress, setProgress] = useState<ReadingProgress[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [principleStats, setPrincipleStats] = useState<PrincipleProgress[]>([]);

  // Fetch all reading progress for the user
  const fetchProgress = useCallback(async () => {
    if (!user?.id) {
      setProgress([]);
      setIsLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('book_reading_progress')
        .select('*')
        .eq('user_id', user.id)
        .order('read_at', { ascending: false });

      if (error) throw error;
      
      // Type assertion since we know the structure matches
      setProgress((data || []) as unknown as ReadingProgress[]);
    } catch (error) {
      console.error('Error fetching reading progress:', error);
    } finally {
      setIsLoading(false);
    }
  }, [user?.id]);

  // Calculate principle statistics
  useEffect(() => {
    const principles = getAllPrinciples();
    
    // For a 365-page book cycling through 13 principles
    const pagesPerPrinciple = Math.ceil(365 / principles.length);
    
    const stats: PrincipleProgress[] = principles.map(principle => {
      const pagesForPrinciple = progress.filter(p => p.principle === principle);
      const actionsCompleted = pagesForPrinciple.filter(p => p.action_completed).length;
      
      return {
        principle,
        pagesRead: pagesForPrinciple.length,
        totalPages: pagesPerPrinciple,
        percentage: Math.min(100, Math.round((pagesForPrinciple.length / pagesPerPrinciple) * 100)),
        actionsCompleted
      };
    });
    
    setPrincipleStats(stats);
  }, [progress]);

  useEffect(() => {
    fetchProgress();
  }, [fetchProgress]);

  // Check if a specific page has been read
  const isPageRead = useCallback((pageNumber: number): boolean => {
    return progress.some(p => p.page_number === pageNumber);
  }, [progress]);

  // Check if action was completed for a page
  const isActionCompleted = useCallback((pageNumber: number): boolean => {
    const page = progress.find(p => p.page_number === pageNumber);
    return page?.action_completed || false;
  }, [progress]);

  // Mark a page as read
  const markPageAsRead = async (
    pageNumber: number, 
    principle: string, 
    chapter: string,
    notes?: string
  ): Promise<boolean> => {
    if (!user?.id) return false;

    // Check if page was already read (to avoid duplicate XP)
    const wasAlreadyRead = isPageRead(pageNumber);

    try {
      const { error } = await supabase
        .from('book_reading_progress')
        .upsert({
          user_id: user.id,
          page_number: pageNumber,
          principle,
          chapter,
          read_at: new Date().toISOString(),
          notes: notes || null
        }, {
          onConflict: 'user_id,page_number'
        });

      if (error) throw error;
      
      // Award XP only if this is a new page read
      if (!wasAlreadyRead) {
        awardXP('page_read');
      }
      
      await fetchProgress();
      return true;
    } catch (error) {
      console.error('Error marking page as read:', error);
      return false;
    }
  };

  // Mark action as completed
  const markActionCompleted = async (pageNumber: number): Promise<boolean> => {
    if (!user?.id) return false;

    // Check if action was already completed (to avoid duplicate XP)
    const wasAlreadyCompleted = isActionCompleted(pageNumber);

    try {
      const { error } = await supabase
        .from('book_reading_progress')
        .update({ action_completed: true })
        .eq('user_id', user.id)
        .eq('page_number', pageNumber);

      if (error) throw error;
      
      // Award XP only if this is a new action completion
      if (!wasAlreadyCompleted) {
        awardXP('action_completed');
      }
      
      await fetchProgress();
      return true;
    } catch (error) {
      console.error('Error marking action as completed:', error);
      return false;
    }
  };

  // Add notes to a page
  const addNotes = async (pageNumber: number, notes: string): Promise<boolean> => {
    if (!user?.id) return false;

    try {
      const { error } = await supabase
        .from('book_reading_progress')
        .update({ notes })
        .eq('user_id', user.id)
        .eq('page_number', pageNumber);

      if (error) throw error;
      
      await fetchProgress();
      return true;
    } catch (error) {
      console.error('Error adding notes:', error);
      return false;
    }
  };

  // Get overall statistics
  const getOverallStats = useCallback(() => {
    const totalPagesRead = progress.length;
    const totalActionsCompleted = progress.filter(p => p.action_completed).length;
    const currentStreak = calculateStreak(progress);
    const principlesStarted = new Set(progress.map(p => p.principle)).size;
    const principlesMastered = principleStats.filter(p => p.percentage >= 80).length;

    return {
      totalPagesRead,
      totalActionsCompleted,
      currentStreak,
      principlesStarted,
      principlesMastered,
      overallPercentage: Math.round((totalPagesRead / 365) * 100)
    };
  }, [progress, principleStats]);

  return {
    progress,
    principleStats,
    isLoading,
    isPageRead,
    isActionCompleted,
    markPageAsRead,
    markActionCompleted,
    addNotes,
    getOverallStats,
    refreshProgress: fetchProgress
  };
};

// Helper function to calculate reading streak
function calculateStreak(progress: ReadingProgress[]): number {
  if (progress.length === 0) return 0;

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  // Sort by date descending
  const sortedDates = progress
    .map(p => new Date(p.read_at))
    .sort((a, b) => b.getTime() - a.getTime());

  // Get unique dates
  const uniqueDates = [...new Set(sortedDates.map(d => {
    const date = new Date(d);
    date.setHours(0, 0, 0, 0);
    return date.getTime();
  }))].sort((a, b) => b - a);

  if (uniqueDates.length === 0) return 0;

  // Check if the most recent read was today or yesterday
  const mostRecentRead = uniqueDates[0];
  const diffFromToday = Math.floor((today.getTime() - mostRecentRead) / (1000 * 60 * 60 * 24));
  
  if (diffFromToday > 1) return 0; // Streak is broken

  let streak = 1;
  for (let i = 1; i < uniqueDates.length; i++) {
    const diff = Math.floor((uniqueDates[i - 1] - uniqueDates[i]) / (1000 * 60 * 60 * 24));
    if (diff === 1) {
      streak++;
    } else {
      break;
    }
  }

  return streak;
}
