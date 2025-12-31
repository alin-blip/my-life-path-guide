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

// Task templates per category
const taskTemplates: Record<Category, { title: string; titleRo: string }[]> = {
  body: [
    { title: '20 min morning movement', titleRo: '20 min mișcare matinală' },
    { title: 'Track energy level today', titleRo: 'Tracking nivel energie azi' },
    { title: 'Minimum 7 hours sleep', titleRo: 'Minim 7 ore somn' },
  ],
  being: [
    { title: '10 min meditation/breathing', titleRo: '10 min meditație/respirație' },
    { title: '3 things I am grateful for', titleRo: '3 lucruri de recunoștință' },
    { title: '5 min journaling', titleRo: '5 min journaling' },
  ],
  balance: [
    { title: '1h quality time with family', titleRo: '1h quality time cu familia' },
    { title: 'Reconnection message to a friend', titleRo: 'Mesaj reconectare prieten' },
    { title: '2h digital detox', titleRo: '2h digital detox' },
  ],
  business: [
    { title: 'TOP 3 priorities today', titleRo: 'TOP 3 priorități azi' },
    { title: '30 min deep work session', titleRo: '30 min sesiune deep work' },
    { title: 'Weekly goals review', titleRo: 'Review obiective săptămânal' },
  ],
};

function getWeekKey(): string {
  const now = new Date();
  const startOfYear = new Date(now.getFullYear(), 0, 1);
  const days = Math.floor((now.getTime() - startOfYear.getTime()) / (24 * 60 * 60 * 1000));
  const weekNumber = Math.ceil((days + startOfYear.getDay() + 1) / 7);
  return `door-week-${now.getFullYear()}-${String(weekNumber).padStart(2, '0')}`;
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
        tasksToCreate.push({
          user_id,
          title: language === 'en' ? template.title : template.titleRo,
          list_type: 'hit',
          week_key: weekKey,
          completed: false,
          task_type: 'vision-2026',
          priority: priorityIndex === 0 ? 3 : priorityIndex === 1 ? 2 : 1, // 3 = urgent-important
          is_key_point: priorityIndex === 0,
        });
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
