
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
        trigger: type,
        trigger_label: getStackLabel(type),
        color: getStackColor(type),
        questions: questions,
        content: formatAnswersContent(answers, questions),
        user_id: session.user.id
      };
      
      // Save to Supabase
      const { error } = await supabase
        .from('stack_library')
        .insert(stackData);
      
      if (error) {
        console.error("Error saving to stack library:", error);
        saveToLocalStackLibrary(type, sessionId, answers, questions);
      } else {
        console.log("Successfully saved stack to Supabase library");
      }
    } else {
      // User not logged in, save to local storage
      saveToLocalStackLibrary(type, sessionId, answers, questions);
    }
  } catch (error) {
    console.error("Error in saveToStackLibrary:", error);
    saveToLocalStackLibrary(type, sessionId, answers, questions);
  }
};

// Helper function to save stack to local storage
const saveToLocalStackLibrary = (
  type: string,
  sessionId: string,
  answers: Record<string | number, string>,
  questions: string[]
) => {
  try {
    const stackData = {
      id: `local-${sessionId}`,
      trigger: type,
      trigger_label: getStackLabel(type),
      color: getStackColor(type),
      questions: questions,
      content: formatAnswersContent(answers, questions),
      created_at: new Date().toISOString()
    };
    
    // Get existing stacks
    const existingStacks = localStorage.getItem('stack_library') || '[]';
    const stacks = JSON.parse(existingStacks);
    
    // Add new stack
    stacks.push(stackData);
    
    // Save back to localStorage
    localStorage.setItem('stack_library', JSON.stringify(stacks));
    console.log("Saved stack to local storage library");
  } catch (error) {
    console.error("Error saving to local stack library:", error);
  }
};

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
    case 'ai':
      return 'orange';
    default:
      return 'blue';
  }
};

// Function to update daily progress
export const updateDailyProgress = async (
  activity: 'stack' | 'journal' | 'core4',
  data?: any
) => {
  try {
    // Check if user is logged in
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session?.user) {
      console.log("User not logged in, skipping progress update");
      return;
    }
    
    const today = new Date();
    const year = today.getFullYear();
    const weekNumber = getWeekNumber(today);
    const date = today.toISOString().split('T')[0]; // YYYY-MM-DD format
    
    // Check if there's an existing record for today
    const { data: existingData, error: queryError } = await supabase
      .from('user_progress')
      .select('*')
      .eq('user_id', session.user.id)
      .eq('date', date)
      .single();
    
    if (queryError && queryError.code !== 'PGRST116') { // PGRST116 is "no rows returned"
      console.error("Error checking progress:", queryError);
      return;
    }
    
    // Prepare data for upsert
    const progressData: any = {
      user_id: session.user.id,
      date,
      year,
      week_number: weekNumber
    };
    
    // Update the appropriate field based on activity
    if (activity === 'stack') {
      progressData.stack_completed = true;
    } else if (activity === 'journal') {
      progressData.journal_completed = true;
    }
    
    // Calculate daily score
    if (existingData) {
      // Calculate based on what's already completed
      let score = existingData.daily_score || 0;
      
      if (activity === 'stack' && !existingData.stack_completed) {
        score += 1;
      } else if (activity === 'journal' && !existingData.journal_completed) {
        score += 1;
      }
      
      progressData.daily_score = score;
    } else {
      // New record
      progressData.daily_score = activity === 'stack' || activity === 'journal' ? 1 : 0;
    }
    
    // Upsert the record
    const { error: upsertError } = await supabase
      .from('user_progress')
      .upsert(progressData);
    
    if (upsertError) {
      console.error("Error updating progress:", upsertError);
    } else {
      console.log(`Successfully updated progress for ${activity}`);
      
      // Update user statistics
      await updateUserStatistics(session.user.id, activity);
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
    // Check if user has statistics record
    const { data, error: queryError } = await supabase
      .from('user_statistics')
      .select('*')
      .eq('user_id', userId)
      .single();
    
    if (queryError && queryError.code !== 'PGRST116') {
      console.error("Error checking user statistics:", queryError);
      return;
    }
    
    let statsData: any = {
      user_id: userId,
      updated_at: new Date().toISOString()
    };
    
    // Update the appropriate field based on activity
    if (activity === 'stack') {
      statsData.total_stacks = data ? (data.total_stacks || 0) + 1 : 1;
    } else if (activity === 'journal') {
      statsData.total_journals = data ? (data.total_journals || 0) + 1 : 1;
    }
    
    // Calculate total points
    if (data) {
      statsData.total_daily_points = (data.total_daily_points || 0) + 1;
    } else {
      statsData.total_daily_points = 1;
      statsData.total_stacks = activity === 'stack' ? 1 : 0;
      statsData.total_journals = activity === 'journal' ? 1 : 0;
    }
    
    // Upsert the record
    const { error: upsertError } = await supabase
      .from('user_statistics')
      .upsert(statsData);
    
    if (upsertError) {
      console.error("Error updating user statistics:", upsertError);
    } else {
      console.log(`Successfully updated user statistics for ${activity}`);
    }
  } catch (error) {
    console.error("Error in updateUserStatistics:", error);
  }
};
