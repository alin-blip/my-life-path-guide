-- Fix function search_path for all existing functions
-- This prevents search_path injection attacks

-- Update update_updated_at_column function
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $function$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$function$;

-- Update has_role function
CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role app_role)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public, pg_temp
AS $function$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  )
$function$;

-- Update clear_user_task_history function
CREATE OR REPLACE FUNCTION public.clear_user_task_history(target_user_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $function$
BEGIN
  -- Only allow admins or the user themselves to clear history
  IF auth.uid() != target_user_id AND NOT public.has_role(auth.uid(), 'admin') THEN
    RAISE EXCEPTION 'Unauthorized';
  END IF;
  
  DELETE FROM public.user_tasks WHERE user_id = target_user_id;
  DELETE FROM public.hot_list_items WHERE user_id = target_user_id;
END;
$function$;

-- Update auto_set_user_task_defaults function
CREATE OR REPLACE FUNCTION public.auto_set_user_task_defaults()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $function$
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
$function$;

-- Update auto_set_hot_list_defaults function
CREATE OR REPLACE FUNCTION public.auto_set_hot_list_defaults()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $function$
BEGIN
  IF NEW.user_id IS NULL THEN
    NEW.user_id := auth.uid();
  END IF;
  
  IF NEW.week_key IS NULL THEN
    NEW.week_key := 'door-week-' || to_char(now(), 'IYYY-IW');
  END IF;
  
  RETURN NEW;
END;
$function$;

-- Update archive_user_tasks function
CREATE OR REPLACE FUNCTION public.archive_user_tasks(target_week_key text, target_task_types text[] DEFAULT NULL::text[])
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $function$
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
$function$;