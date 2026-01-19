-- Add category column to weekly_planning
ALTER TABLE public.weekly_planning 
ADD COLUMN IF NOT EXISTS category TEXT DEFAULT 'business';

-- Drop existing unique constraint if exists
ALTER TABLE public.weekly_planning 
DROP CONSTRAINT IF EXISTS weekly_planning_user_id_week_key_key;

-- Create new unique constraint including category
ALTER TABLE public.weekly_planning 
ADD CONSTRAINT weekly_planning_user_week_category_key UNIQUE (user_id, week_key, category);

-- Add index for faster queries by category
CREATE INDEX IF NOT EXISTS idx_weekly_planning_category ON public.weekly_planning(category);

-- Also add category to weekly_planning_drafts for draft persistence
ALTER TABLE public.weekly_planning_drafts 
ADD COLUMN IF NOT EXISTS category TEXT DEFAULT 'business';

-- Update unique constraint for drafts
ALTER TABLE public.weekly_planning_drafts 
DROP CONSTRAINT IF EXISTS weekly_planning_drafts_user_id_week_key_key;

ALTER TABLE public.weekly_planning_drafts 
ADD CONSTRAINT weekly_planning_drafts_user_week_category_key UNIQUE (user_id, week_key, category);

-- Add category to user_tasks for task grouping by domain
ALTER TABLE public.user_tasks 
ADD COLUMN IF NOT EXISTS domain_category TEXT DEFAULT NULL;

-- Index for domain filtering
CREATE INDEX IF NOT EXISTS idx_user_tasks_domain ON public.user_tasks(domain_category);