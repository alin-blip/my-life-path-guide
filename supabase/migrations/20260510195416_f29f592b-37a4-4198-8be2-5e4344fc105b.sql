ALTER TABLE public.user_tasks 
  ADD COLUMN IF NOT EXISTS scheduled_time time,
  ADD COLUMN IF NOT EXISTS duration_minutes integer DEFAULT 30;

CREATE INDEX IF NOT EXISTS idx_user_tasks_schedule 
  ON public.user_tasks (user_id, week_key, day_of_week, scheduled_time);