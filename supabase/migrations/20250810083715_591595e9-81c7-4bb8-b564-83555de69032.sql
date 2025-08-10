-- Fix the search path security issue for the function
CREATE OR REPLACE FUNCTION public.clear_user_task_history(target_user_id UUID)
RETURNS INTEGER 
LANGUAGE plpgsql 
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  deleted_count INTEGER;
BEGIN
  -- Only allow users to clear their own data or admins to clear any data
  IF auth.uid() != target_user_id AND NOT has_role(auth.uid(), 'admin'::app_role) THEN
    RAISE EXCEPTION 'Unauthorized: Cannot clear data for other users';
  END IF;
  
  DELETE FROM public.user_tasks WHERE user_id = target_user_id;
  GET DIAGNOSTICS deleted_count = ROW_COUNT;
  
  RETURN deleted_count;
END;
$$;