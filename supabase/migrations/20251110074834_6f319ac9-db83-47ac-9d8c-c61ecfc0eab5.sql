-- Step 1: Create archived_tasks table for safe "deletion"
CREATE TABLE IF NOT EXISTS public.archived_tasks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  original_task_id uuid NOT NULL,
  user_id uuid NOT NULL,
  task_type text NOT NULL,
  week_key text,
  title text NOT NULL,
  completed boolean DEFAULT false,
  archived_at timestamp with time zone DEFAULT now(),
  original_data jsonb DEFAULT '{}'::jsonb,
  created_at timestamp with time zone DEFAULT now()
);

ALTER TABLE public.archived_tasks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their own archived tasks"
ON public.archived_tasks
FOR ALL
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Step 2: Backfill week_key for all user_tasks with null week_key
-- Calculate week_key from created_at: format 'door-week-YYYY-WW'
UPDATE public.user_tasks
SET week_key = 'door-week-' || to_char(created_at, 'IYYY-IW')
WHERE week_key IS NULL;

-- Step 3: Create trigger function to auto-set user_id and week_key
CREATE OR REPLACE FUNCTION public.auto_set_user_task_defaults()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Auto-set user_id if missing
  IF NEW.user_id IS NULL THEN
    NEW.user_id := auth.uid();
  END IF;
  
  -- Auto-set week_key if missing (current week)
  IF NEW.week_key IS NULL THEN
    NEW.week_key := 'door-week-' || to_char(now(), 'IYYY-IW');
  END IF;
  
  RETURN NEW;
END;
$$;

-- Attach trigger to user_tasks
DROP TRIGGER IF EXISTS set_user_task_defaults ON public.user_tasks;
CREATE TRIGGER set_user_task_defaults
  BEFORE INSERT ON public.user_tasks
  FOR EACH ROW
  EXECUTE FUNCTION public.auto_set_user_task_defaults();

-- Step 4: Same trigger for hot_list_items
CREATE OR REPLACE FUNCTION public.auto_set_hot_list_defaults()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NEW.user_id IS NULL THEN
    NEW.user_id := auth.uid();
  END IF;
  
  IF NEW.week_key IS NULL THEN
    NEW.week_key := 'door-week-' || to_char(now(), 'IYYY-IW');
  END IF;
  
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS set_hot_list_defaults ON public.hot_list_items;
CREATE TRIGGER set_hot_list_defaults
  BEFORE INSERT ON public.hot_list_items
  FOR EACH ROW
  EXECUTE FUNCTION public.auto_set_hot_list_defaults();

-- Step 5: Create archive function (replaces DELETE)
CREATE OR REPLACE FUNCTION public.archive_user_tasks(
  target_week_key text,
  target_task_types text[] DEFAULT NULL
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Move matching tasks to archived_tasks
  INSERT INTO public.archived_tasks (
    original_task_id, user_id, task_type, week_key, title, completed, original_data
  )
  SELECT 
    id, user_id, task_type, week_key, title, completed,
    jsonb_build_object(
      'day', day,
      'day_of_week', day_of_week,
      'priority', priority,
      'is_key_point', is_key_point,
      'list_type', list_type,
      'selected', selected,
      'position', position
    )
  FROM public.user_tasks
  WHERE user_id = auth.uid()
    AND week_key = target_week_key
    AND (target_task_types IS NULL OR task_type = ANY(target_task_types));
  
  -- Now delete from user_tasks (safe because we have archive)
  DELETE FROM public.user_tasks
  WHERE user_id = auth.uid()
    AND week_key = target_week_key
    AND (target_task_types IS NULL OR task_type = ANY(target_task_types));
END;
$$;