CREATE OR REPLACE FUNCTION public.auto_set_user_task_defaults()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public', 'pg_temp'
AS $function$
BEGIN
  IF NEW.user_id IS NULL THEN
    NEW.user_id := auth.uid();
  END IF;

  -- Only auto-set week_key for weekly lists (hit/do). Hot list items are global
  -- and must keep week_key NULL so they appear in the Hot List.
  IF NEW.week_key IS NULL AND NEW.task_type IS DISTINCT FROM 'hot' THEN
    NEW.week_key := 'door-week-' || to_char(now(), 'IYYY-IW');
  END IF;

  RETURN NEW;
END;
$function$;

-- Fix already-inserted hot tasks that were auto-assigned a week_key today
UPDATE public.user_tasks
SET week_key = NULL
WHERE task_type = 'hot'
  AND week_key IS NOT NULL
  AND created_at > now() - interval '1 day';