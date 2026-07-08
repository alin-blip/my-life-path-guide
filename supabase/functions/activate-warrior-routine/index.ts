import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

type WarriorType = 'reactor' | 'disciplined' | 'experimenter' | 'warrior';

// Mirror of src/data/warriorTypes.ts — WARRIOR_TEMPLATES
const TEMPLATES: Record<WarriorType, {
  routine_steps_order: string[];
  active_steps: string[];
  step_configs: Record<string, unknown>;
  meditation_default_duration: number;
  reading_pages_per_day: number;
  workout_goal: string;
  workout_level: string;
  workout_days_per_week: number;
  learn_task_type: string;
  learn_task_description: string;
  apply_teach_description: string;
  default_autosuggestion: string;
  journaling_min_words: number;
}> = {
  reactor: {
    routine_steps_order: ['hydration', 'gratitude', 'mindShifting', 'meditation', 'exercise', 'mealPlanning', 'relationships'],
    active_steps: ['hydration', 'gratitude', 'mindShifting', 'meditation', 'exercise', 'mealPlanning', 'relationships'],
    step_configs: { meditation: { duration: 3, mode: 'timer' }, exercise: { type: 'light', duration: 10 }, gratitude: { count: 1 } },
    meditation_default_duration: 3,
    reading_pages_per_day: 5,
    workout_goal: 'wellness', workout_level: 'beginner', workout_days_per_week: 3,
    learn_task_type: 'article',
    learn_task_description: '1 articol scurt (5 min)',
    apply_teach_description: '1 acțiune din inbox — clar, specific',
    default_autosuggestion: 'În fiecare zi devin mai calm și în control.',
    journaling_min_words: 0,
  },
  disciplined: {
    routine_steps_order: ['hydration', 'gratitude', 'mindShifting', 'meditation', 'visualization', 'exercise', 'mealPlanning', 'reading', 'learn', 'apply', 'relationships', 'dailyTasks'],
    active_steps: ['hydration', 'gratitude', 'mindShifting', 'meditation', 'visualization', 'exercise', 'mealPlanning', 'reading', 'learn', 'apply', 'relationships', 'dailyTasks'],
    step_configs: { meditation: { duration: 10, mode: 'timer', binaural: 'theta' }, exercise: { type: 'full', duration: 25 }, reading: { pages: 10 } },
    meditation_default_duration: 10,
    reading_pages_per_day: 10,
    workout_goal: 'muscle', workout_level: 'intermediate', workout_days_per_week: 4,
    learn_task_type: 'book',
    learn_task_description: '10 pagini din cartea curentă',
    apply_teach_description: 'HIT din Master Plan — aliniat la viziune 90 zile',
    default_autosuggestion: 'Fiecare pas mă apropie de viziunea mea.',
    journaling_min_words: 100,
  },
  experimenter: {
    routine_steps_order: ['hydration', 'breathing', 'mindShifting', 'meditation', 'gratitude', 'exercise', 'mealPlanning', 'learn', 'contentCreation', 'relationships'],
    active_steps: ['hydration', 'breathing', 'mindShifting', 'meditation', 'gratitude', 'exercise', 'mealPlanning', 'learn', 'contentCreation', 'relationships'],
    step_configs: { meditation: { duration: 5, mode: 'timer' }, breathing: { technique: 'box' }, exercise: { type: 'varied' } },
    meditation_default_duration: 5,
    reading_pages_per_day: 15,
    workout_goal: 'endurance', workout_level: 'intermediate', workout_days_per_week: 4,
    learn_task_type: 'podcast',
    learn_task_description: '1 podcast/TED + note în journal',
    apply_teach_description: '1 experiment nou (testează ceva timp de 7 zile)',
    default_autosuggestion: 'Sunt deschis să învăț și să evoluez zilnic.',
    journaling_min_words: 150,
  },
  warrior: {
    routine_steps_order: ['hydration', 'lightExposure', 'gratitude', 'mindShifting', 'meditation', 'visualization', 'autosuggestion', 'exercise', 'mealPlanning', 'reading', 'journaling', 'learn', 'apply', 'contentCreation', 'relationships', 'dailyTasks'],
    active_steps: ['hydration', 'lightExposure', 'gratitude', 'mindShifting', 'meditation', 'visualization', 'autosuggestion', 'exercise', 'mealPlanning', 'reading', 'journaling', 'learn', 'apply', 'contentCreation', 'relationships', 'dailyTasks'],
    step_configs: { meditation: { duration: 15, mode: 'timer', binaural: 'theta' }, exercise: { type: 'heavy', duration: 40 }, reading: { pages: 20 }, journaling: { minWords: 300 } },
    meditation_default_duration: 15,
    reading_pages_per_day: 20,
    workout_goal: 'muscle', workout_level: 'advanced', workout_days_per_week: 5,
    learn_task_type: 'book',
    learn_task_description: '20 pagini + note strategice',
    apply_teach_description: 'HIT din viziune 90 zile — strategic, mișcă acul',
    default_autosuggestion: 'Sunt Warrior. Execut cu intenție, aliniat la viziune.',
    journaling_min_words: 300,
  },
};

serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });

  try {
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );

    // Require authenticated user
    const authHeader = req.headers.get('Authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return new Response(JSON.stringify({ error: 'Authentication required' }), {
        status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }
    const token = authHeader.slice(7);
    const { data: userData, error: userErr } = await supabase.auth.getUser(token);
    if (userErr || !userData?.user) {
      return new Response(JSON.stringify({ error: 'Invalid token' }), {
        status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }
    const userId = userData.user.id;

    const body = await req.json();
    const { warrior_type, result_id } = body;

    if (!warrior_type || !TEMPLATES[warrior_type as WarriorType]) {
      return new Response(JSON.stringify({ error: 'Invalid warrior_type' }), {
        status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const template = TEMPLATES[warrior_type as WarriorType];

    // Upsert champion_routine_settings for this user with template values
    const settingsPayload = {
      user_id: userId,
      is_configured: true,
      routine_steps_order: template.routine_steps_order,
      active_steps: template.active_steps,
      step_configs: template.step_configs,
      meditation_default_duration: template.meditation_default_duration,
      reading_pages_per_day: template.reading_pages_per_day,
      workout_goal: template.workout_goal,
      workout_level: template.workout_level,
      workout_days_per_week: template.workout_days_per_week,
      learn_task_type: template.learn_task_type,
      learn_task_description: template.learn_task_description,
      apply_teach_description: template.apply_teach_description,
      default_autosuggestion: template.default_autosuggestion,
      journaling_min_words: template.journaling_min_words,
      setup_completed_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    const { error: upsertErr } = await supabase
      .from('champion_routine_settings')
      .upsert(settingsPayload, { onConflict: 'user_id' });

    if (upsertErr) {
      console.error('[activate-warrior-routine] upsert error', upsertErr);
      return new Response(JSON.stringify({ error: upsertErr.message }), {
        status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Mark quiz result activated (if result_id given)
    if (result_id) {
      await supabase
        .from('quiz_routine_results')
        .update({ activated: true, activated_at: new Date().toISOString(), user_id: userId })
        .eq('id', result_id);
    }

    return new Response(JSON.stringify({
      success: true,
      warrior_type,
      redirect_url: '/daily-flow?new=1',
    }), { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
  } catch (e) {
    console.error('[activate-warrior-routine] error', e);
    return new Response(JSON.stringify({ error: (e as Error).message }), {
      status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
