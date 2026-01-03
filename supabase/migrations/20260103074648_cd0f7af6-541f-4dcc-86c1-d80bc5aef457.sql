-- Extend champion_routine_logs with new fields for Execution Room
ALTER TABLE public.champion_routine_logs 
ADD COLUMN IF NOT EXISTS meals_logged jsonb DEFAULT '[]'::jsonb,
ADD COLUMN IF NOT EXISTS total_calories numeric DEFAULT 0,
ADD COLUMN IF NOT EXISTS total_protein numeric DEFAULT 0,
ADD COLUMN IF NOT EXISTS content_script text,
ADD COLUMN IF NOT EXISTS content_topic text,
ADD COLUMN IF NOT EXISTS pomodoro_sessions integer DEFAULT 0,
ADD COLUMN IF NOT EXISTS big_one_today text,
ADD COLUMN IF NOT EXISTS daily_todos jsonb DEFAULT '[]'::jsonb;