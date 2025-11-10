-- Fix: Make task_id nullable since we use 'id' as primary key
ALTER TABLE public.user_tasks
ALTER COLUMN task_id DROP NOT NULL;

-- Add a comment to explain the column
COMMENT ON COLUMN public.user_tasks.task_id IS 'Legacy column, replaced by id (UUID). Keep for backwards compatibility but nullable.';