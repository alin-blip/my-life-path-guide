
// Add a better error handler to ensure this file is working as expected
import { supabase } from "@/integrations/supabase/client";

// Function to save a completed stack to the stack library
export const saveToStackLibrary = async (
  type: string,
  sessionId: string,
  answers: Record<string | number, string>,
  questions: string[]
) => {
  try {
    // Check if user is logged in
    const { data: { session } } = await supabase.auth.getSession();
    
    if (session?.user) {
      // Prepare data for saving
      const stackData = {
        title: `${type} Stack Session`,
        type: type,
        content: formatAnswersContent(answers, questions),
        user_id: session.user.id
      };
      
      // Save to Supabase
      const { error } = await supabase
        .from('stack_library')
        .insert(stackData);
      
      if (error) {
        console.error("Error saving to stack library:", error);
        throw error;
      }
      console.log("Successfully saved stack to Supabase library");
    } else {
      console.warn("User not logged in - cannot save stack");
      throw new Error("User not logged in");
    }
  } catch (error) {
    console.error("Error in saveToStackLibrary:", error);
    throw error;
  }
};

// Removed localStorage fallback - all stacks must save to Supabase

// Helper function to format answers for content
const formatAnswersContent = (
  answers: Record<string | number, string>,
  questions: string[]
) => {
  return Object.entries(answers).map(([key, value]) => {
    const index = parseInt(key);
    return {
      question: index >= 0 && index < questions.length ? questions[index] : `Question ${key}`,
      answer: value
    };
  });
};

// Helper function to get stack label
const getStackLabel = (type: string): string => {
  switch (type) {
    case 'power':
      return 'Power Stack';
    case 'anger':
      return 'Anger Stack';
    case 'unlock':
      return 'Unlock Stack';
    case 'divine':
      return 'Divine Stack';
    case 'gods-school':
      return 'Școala Zeilor';
    case 'hormozi':
      return 'Imperiul de Business';
    case 'napoleon-hill':
      return 'Master Plan';
    case 'ai':
      return 'AI Coaching';
    default:
      return 'Custom Stack';
  }
};

// Helper function to get stack color
const getStackColor = (type: string): string => {
  switch (type) {
    case 'power':
      return 'blue';
    case 'anger':
      return 'red';
    case 'unlock':
      return 'green';
    case 'divine':
      return 'purple';
    case 'gods-school':
      return 'amber';
    case 'hormozi':
      return 'orange';
    case 'napoleon-hill':
      return 'emerald';
    case 'ai':
      return 'cyan';
    default:
      return 'blue';
  }
};

// Function to update daily progress - NOW SAVES TO SUPABASE DAILY_PROGRESS TABLE
export const updateDailyProgress = async (
  activity: 'stack' | 'journal' | 'core4',
  data?: any
) => {
  try {
    // Check if user is logged in
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session?.user) {
      console.warn("User not logged in - cannot save progress");
      return;
    }
    
    const today = new Date();
    const date = today.toISOString().split('T')[0]; // YYYY-MM-DD format
    
    try {
      // First, get existing daily progress for today
      const { data: existingProgress } = await supabase
        .from('daily_progress')
        .select('progress_data')
        .eq('user_id', session.user.id)
        .eq('date', date)
        .maybeSingle();

      // Merge with existing progress
      const currentProgressData = (existingProgress?.progress_data as Record<string, any>) || {};
      const updatedProgressData = {
        ...currentProgressData,
        [activity]: {
          completed: true,
          timestamp: new Date().toISOString(),
          ...(data || {})
        }
      };

      // Update daily_progress table
      const { error: dailyProgressError } = await supabase
        .from('daily_progress')
        .upsert({
          user_id: session.user.id,
          date: date,
          progress_data: updatedProgressData
        }, {
          onConflict: 'user_id,date'
        });

      if (dailyProgressError) {
        console.error("Error updating daily progress:", dailyProgressError);
        return;
      }

      // Also update user_progress table for backward compatibility
      const { error: progressError } = await supabase
        .from('user_progress')
        .upsert({
          user_id: session.user.id,
          activity_type: activity,
          activity_data: data || {}
        });

      if (progressError) {
        console.error("Error updating user progress:", progressError);
      }

      // Update user statistics
      await updateUserStatistics(session.user.id, activity);
      
      // Dispatch custom event for dashboard updates
      window.dispatchEvent(new CustomEvent('progressUpdated', {
        detail: { activity, data, date }
      }));
      
      console.log(`✅ Progress saved to Supabase daily_progress for ${activity} on ${date}`);
      
      // Remove localStorage fallback
      localStorage.removeItem(`daily-progress-${date}`);
      
    } catch (supabaseError) {
      console.error("Supabase error:", supabaseError);
    }
  } catch (error) {
    console.error("Error in updateDailyProgress:", error);
  }
};

// Helper function to get ISO week number
const getWeekNumber = (date: Date): number => {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  d.setUTCDate(d.getUTCDate() + 4 - (d.getUTCDay() || 7));
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  return Math.ceil(((d.getTime() - yearStart.getTime()) / 86400000 + 1) / 7);
};

// Helper function to update user statistics
const updateUserStatistics = async (userId: string, activity: string) => {
  try {
    // Get current stats or create new ones
    const { data: stats, error: fetchError } = await supabase
      .from('user_statistics')
      .select('*')
      .eq('user_id', userId)
      .maybeSingle();

    if (fetchError && fetchError.code !== 'PGRST116') {
      console.error("Error fetching user statistics:", fetchError);
      return;
    }

    const today = new Date().toISOString().split('T')[0];
    let updateData: any = {
      user_id: userId,
      last_activity_date: today
    };

    if (stats) {
      // Update existing stats
      if (activity === 'stack') {
        updateData.total_stacks_completed = (stats.total_stacks_completed || 0) + 1;
      } else if (activity === 'journal') {
        updateData.total_journal_entries = (stats.total_journal_entries || 0) + 1;
      } else if (activity === 'core4') {
        updateData.total_core4_sessions = (stats.total_core4_sessions || 0) + 1;
      }

      // Update streak
      const lastActivity = stats.last_activity_date;
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      const yesterdayStr = yesterday.toISOString().split('T')[0];

      if (lastActivity === yesterdayStr) {
        updateData.current_streak = (stats.current_streak || 0) + 1;
        updateData.longest_streak = Math.max(stats.longest_streak || 0, updateData.current_streak);
      } else if (lastActivity !== today) {
        updateData.current_streak = 1;
      }

      const { error: updateError } = await supabase
        .from('user_statistics')
        .update(updateData)
        .eq('user_id', userId);

      if (updateError) {
        console.error("Error updating user statistics:", updateError);
      }
    } else {
      // Create new stats
      updateData.total_stacks_completed = activity === 'stack' ? 1 : 0;
      updateData.total_journal_entries = activity === 'journal' ? 1 : 0;
      updateData.total_core4_sessions = activity === 'core4' ? 1 : 0;
      updateData.current_streak = 1;
      updateData.longest_streak = 1;

      const { error: insertError } = await supabase
        .from('user_statistics')
        .insert(updateData);

      if (insertError) {
        console.error("Error creating user statistics:", insertError);
      }
    }
  } catch (error) {
    console.error("Error in updateUserStatistics:", error);
  }
};

// Removed localStorage fallback for progress - all progress must save to Supabase
