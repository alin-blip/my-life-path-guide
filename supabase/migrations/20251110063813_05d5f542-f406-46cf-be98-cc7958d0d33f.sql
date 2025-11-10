-- Add missing position column to user_tasks table
ALTER TABLE public.user_tasks 
ADD COLUMN IF NOT EXISTS position INTEGER DEFAULT 0;

-- Add index for better performance on position ordering
CREATE INDEX IF NOT EXISTS idx_user_tasks_position 
ON public.user_tasks(user_id, list_type, position);