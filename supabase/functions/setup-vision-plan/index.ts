import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface VisionScores {
  body: number;
  being: number;
  balance: number;
  business: number;
}

type Category = keyof VisionScores;

const DAYS_OF_WEEK = ['M', 'T', 'W', 'Th', 'F', 'Sa', 'Su'];

// Task templates per category with suggested days
const taskTemplates: Record<Category, { title: string; titleRo: string; days: string[] }[]> = {
  body: [
    { title: '20 min morning movement', titleRo: '20 min mișcare matinală', days: ['M', 'W', 'F'] },
    { title: 'Track energy level today', titleRo: 'Tracking nivel energie azi', days: ['T', 'Th'] },
    { title: 'Minimum 7 hours sleep', titleRo: 'Minim 7 ore somn', days: ['M', 'T', 'W', 'Th', 'F'] },
  ],
  being: [
    { title: '10 min meditation/breathing', titleRo: '10 min meditație/respirație', days: ['M', 'W', 'F'] },
    { title: '3 things I am grateful for', titleRo: '3 lucruri de recunoștință', days: ['T', 'Th', 'Sa'] },
    { title: '5 min journaling', titleRo: '5 min journaling', days: ['M', 'W', 'F'] },
  ],
  balance: [
    { title: '1h quality time with family', titleRo: '1h quality time cu familia', days: ['Sa', 'Su'] },
    { title: 'Reconnection message to a friend', titleRo: 'Mesaj reconectare prieten', days: ['W'] },
    { title: '2h digital detox', titleRo: '2h digital detox', days: ['Su'] },
  ],
  business: [
    { title: 'TOP 3 priorities today', titleRo: 'TOP 3 priorități azi', days: ['M', 'T', 'W', 'Th', 'F'] },
    { title: '30 min deep work session', titleRo: '30 min sesiune deep work', days: ['M', 'T', 'W', 'Th', 'F'] },
    { title: 'Weekly goals review', titleRo: 'Review obiective săptămânal', days: ['F'] },
  ],
};

function getWeekKey(): string {
  const now = new Date();
  
  // ISO week calculation - matches date-fns getWeek with weekStartsOn: 1, firstWeekContainsDate: 4
  // ISO weeks: Week 1 is the week containing January 4th
  const year = now.getFullYear();
  const jan4 = new Date(year, 0, 4);
  
  // Find Monday of the week containing Jan 4
  const jan4DayOfWeek = jan4.getDay() || 7; // Convert Sunday (0) to 7
  const firstMondayOfYear = new Date(jan4);
  firstMondayOfYear.setDate(jan4.getDate() - (jan4DayOfWeek - 1));
  
  // Calculate which week the current date is in
  const diffMs = now.getTime() - firstMondayOfYear.getTime();
  const diffDays = Math.floor(diffMs / (24 * 60 * 60 * 1000));
  let weekNumber = Math.floor(diffDays / 7) + 1;
  
  // Handle edge cases at year boundaries
  let weekYear = year;
  
  if (weekNumber < 1) {
    // Date is in last week of previous year
    weekYear = year - 1;
    const prevYearJan4 = new Date(weekYear, 0, 4);
    const prevYearJan4Day = prevYearJan4.getDay() || 7;
    const prevYearFirstMonday = new Date(prevYearJan4);
    prevYearFirstMonday.setDate(prevYearJan4.getDate() - (prevYearJan4Day - 1));
    const prevDiffMs = now.getTime() - prevYearFirstMonday.getTime();
    weekNumber = Math.floor(prevDiffMs / (7 * 24 * 60 * 60 * 1000)) + 1;
  } else if (weekNumber > 52) {
    // Check if it's actually week 1 of next year
    const nextYearJan4 = new Date(year + 1, 0, 4);
    const nextYearJan4Day = nextYearJan4.getDay() || 7;
    const nextYearFirstMonday = new Date(nextYearJan4);
    nextYearFirstMonday.setDate(nextYearJan4.getDate() - (nextYearJan4Day - 1));
    
    if (now >= nextYearFirstMonday) {
      weekYear = year + 1;
      weekNumber = 1;
    }
  }
  
  console.log(`Week calculation: date=${now.toISOString()}, weekYear=${weekYear}, weekNumber=${weekNumber}`);
  
  return `door-week-${weekYear}-${String(weekNumber).padStart(2, '0')}`;
}

function getPriorityOrder(scores: VisionScores): Category[] {
  const categories: Category[] = ['body', 'being', 'balance', 'business'];
  return categories.sort((a, b) => scores[a] - scores[b]);
}

Deno.serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const { user_id, scores, language = 'ro' } = await req.json();

    if (!user_id || !scores) {
      return new Response(
        JSON.stringify({ error: 'Missing user_id or scores' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('Setting up vision plan for user:', user_id);
    console.log('Scores:', scores);

    const weekKey = getWeekKey();
    const priorityOrder = getPriorityOrder(scores);
    const tasksToCreate: any[] = [];

    // Create tasks based on priority
    // Priority 1: 3 tasks, Priority 2: 2 tasks, Priority 3-4: 1 task each
    const tasksPerPriority = [3, 2, 1, 1];

    priorityOrder.forEach((category, priorityIndex) => {
      const numTasks = tasksPerPriority[priorityIndex];
      const templates = taskTemplates[category];

      for (let i = 0; i < Math.min(numTasks, templates.length); i++) {
        const template = templates[i];
        // Create task for each suggested day
        for (const day of template.days) {
          tasksToCreate.push({
            user_id,
            title: language === 'en' ? template.title : template.titleRo,
            list_type: 'hit',
            task_type: 'hit', // Changed from 'vision-2026' to 'hit' so it shows in the task list
            week_key: weekKey,
            day_of_week: day, // Assign to specific day
            completed: false,
            priority: priorityIndex === 0 ? 3 : priorityIndex === 1 ? 2 : 1,
            is_key_point: priorityIndex === 0,
          });
        }
      }
    });

    console.log('Creating tasks:', tasksToCreate.length);

    // Insert tasks
    const { data: createdTasks, error: insertError } = await supabase
      .from('user_tasks')
      .insert(tasksToCreate)
      .select();

    if (insertError) {
      console.error('Error creating tasks:', insertError);
      return new Response(
        JSON.stringify({ error: 'Failed to create tasks', details: insertError.message }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('Successfully created tasks:', createdTasks?.length);

    return new Response(
      JSON.stringify({
        success: true,
        tasks_created: createdTasks?.length || 0,
        priority_order: priorityOrder,
        week_key: weekKey,
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error: unknown) {
    console.error('Error in setup-vision-plan:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({ error: 'Internal server error', details: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
