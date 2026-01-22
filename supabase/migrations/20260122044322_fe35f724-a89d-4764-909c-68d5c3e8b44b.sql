-- Clean up any existing duplicates first (keep the oldest one by id)
DELETE FROM public.daily_habits 
WHERE id IN (
  SELECT id FROM (
    SELECT id, ROW_NUMBER() OVER (PARTITION BY user_id, name ORDER BY created_at ASC, id ASC) as rn
    FROM public.daily_habits
  ) t WHERE rn > 1
);

-- Now add unique constraint to prevent duplicate habits per user
ALTER TABLE public.daily_habits 
ADD CONSTRAINT daily_habits_user_name_unique UNIQUE (user_id, name);