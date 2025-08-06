
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
    case 'gods-school':
      return 'Școala Zeilor';
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
    
    // Temporarily disabled until user_progress table is created
    // TODO: Enable after creating user_progress table in Supabase
    console.log(`Progress update for ${activity} temporarily disabled`);
    
    return; // Exit early until tables are created
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
  // Temporarily disabled until user_statistics table is created
  // TODO: Enable after creating user_statistics table in Supabase
  console.log(`User statistics update for ${activity} temporarily disabled`);
};
