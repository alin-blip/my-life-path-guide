-- Add week_key column to objectives table for weekly navigation
ALTER TABLE public.objectives 
ADD COLUMN week_key TEXT;

-- Create index for efficient querying by week_key
CREATE INDEX idx_objectives_week_key ON public.objectives(user_id, week_key);

-- Create index for category and week_key combination
CREATE INDEX idx_objectives_category_week ON public.objectives(user_id, category, week_key);