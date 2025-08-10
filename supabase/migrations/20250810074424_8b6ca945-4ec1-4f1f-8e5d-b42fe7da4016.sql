-- Fix the update_daily_progress trigger function to handle DELETE operations correctly
CREATE OR REPLACE FUNCTION public.update_daily_progress()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  -- Use COALESCE to get user_id from NEW or OLD depending on operation type
  -- For INSERT/UPDATE use NEW.user_id, for DELETE use OLD.user_id
  INSERT INTO public.daily_progress_stats (
    user_id,
    date,
    total_tasks,
    completed_tasks,
    hot_list_items,
    hit_list_items,
    do_list_items,
    completion_rate
  )
  SELECT 
    COALESCE(NEW.user_id, OLD.user_id) as target_user_id,
    CURRENT_DATE,
    COALESCE(hot_count, 0) + COALESCE(hit_count, 0) + COALESCE(do_count, 0) as total_tasks,
    COALESCE(completed_count, 0) as completed_tasks,
    COALESCE(hot_count, 0) as hot_list_items,
    COALESCE(hit_count, 0) as hit_list_items,
    COALESCE(do_count, 0) as do_list_items,
    CASE 
      WHEN (COALESCE(hot_count, 0) + COALESCE(hit_count, 0) + COALESCE(do_count, 0)) > 0
      THEN (COALESCE(completed_count, 0) * 100.0) / (COALESCE(hot_count, 0) + COALESCE(hit_count, 0) + COALESCE(do_count, 0))
      ELSE 0
    END as completion_rate
  FROM (
    SELECT 
      COUNT(CASE WHEN list_type = 'hot' THEN 1 END) as hot_count,
      COUNT(CASE WHEN list_type = 'hit' THEN 1 END) as hit_count,
      COUNT(CASE WHEN list_type = 'do' THEN 1 END) as do_count,
      COUNT(CASE WHEN completed = true THEN 1 END) as completed_count
    FROM hot_list_items 
    WHERE user_id = COALESCE(NEW.user_id, OLD.user_id)
      AND week_key = COALESCE(NEW.week_key, OLD.week_key)
  ) stats
  ON CONFLICT (user_id, date) 
  DO UPDATE SET
    total_tasks = EXCLUDED.total_tasks,
    completed_tasks = EXCLUDED.completed_tasks,
    hot_list_items = EXCLUDED.hot_list_items,
    hit_list_items = EXCLUDED.hit_list_items,
    do_list_items = EXCLUDED.do_list_items,
    completion_rate = EXCLUDED.completion_rate,
    updated_at = now();

  -- Return the appropriate record based on operation type
  IF TG_OP = 'DELETE' THEN
    RETURN OLD;
  ELSE
    RETURN NEW;
  END IF;
END;
$function$;