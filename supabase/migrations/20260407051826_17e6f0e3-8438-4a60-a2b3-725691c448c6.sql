
-- Step 1: Remove duplicate user_tasks, keeping only the earliest created row per unique combo
DELETE FROM public.user_tasks
WHERE id NOT IN (
  SELECT DISTINCT ON (user_id, title, task_type, COALESCE(week_key, ''), COALESCE(day_of_week, ''))
    id
  FROM public.user_tasks
  ORDER BY user_id, title, task_type, COALESCE(week_key, ''), COALESCE(day_of_week, ''), created_at ASC
);

-- Step 2: Add unique constraint to prevent future duplicates
CREATE UNIQUE INDEX IF NOT EXISTS idx_user_tasks_no_duplicates 
ON public.user_tasks (user_id, title, task_type, COALESCE(week_key, ''), COALESCE(day_of_week, ''));
