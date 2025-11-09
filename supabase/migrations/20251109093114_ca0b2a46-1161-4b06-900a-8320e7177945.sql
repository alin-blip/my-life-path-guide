-- Add missing columns to user_tasks
ALTER TABLE public.user_tasks 
  ADD COLUMN IF NOT EXISTS task_type TEXT,
  ADD COLUMN IF NOT EXISTS is_key_point BOOLEAN DEFAULT false;

-- Add items column to fact_maps (backward compatibility)
ALTER TABLE public.fact_maps ADD COLUMN IF NOT EXISTS items JSONB DEFAULT '[]'::jsonb;

-- Create objectives table
CREATE TABLE IF NOT EXISTS public.objectives (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  week_key TEXT NOT NULL,
  category TEXT NOT NULL,
  description TEXT NOT NULL,
  completed BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, week_key, category, description)
);

ALTER TABLE public.objectives ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their own objectives"
ON public.objectives FOR ALL
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Create user_progress table
CREATE TABLE IF NOT EXISTS public.user_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  activity_type TEXT NOT NULL,
  activity_data JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.user_progress ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their own progress"
ON public.user_progress FOR ALL
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Create weekly_planning table
CREATE TABLE IF NOT EXISTS public.weekly_planning (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  week_key TEXT NOT NULL,
  plan_data JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, week_key)
);

ALTER TABLE public.weekly_planning ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their own weekly planning"
ON public.weekly_planning FOR ALL
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Add completed and answers columns to stack_sessions for backward compatibility
ALTER TABLE public.stack_sessions 
  ADD COLUMN IF NOT EXISTS completed BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS answers JSONB DEFAULT '{}'::jsonb;

-- Create clear_user_task_history function
CREATE OR REPLACE FUNCTION public.clear_user_task_history(target_user_id UUID)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Only allow admins or the user themselves to clear history
  IF auth.uid() != target_user_id AND NOT public.has_role(auth.uid(), 'admin') THEN
    RAISE EXCEPTION 'Unauthorized';
  END IF;
  
  DELETE FROM public.user_tasks WHERE user_id = target_user_id;
  DELETE FROM public.hot_list_items WHERE user_id = target_user_id;
END;
$$;

-- Add update triggers
CREATE TRIGGER update_objectives_updated_at BEFORE UPDATE ON public.objectives
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_user_progress_updated_at BEFORE UPDATE ON public.user_progress
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_weekly_planning_updated_at BEFORE UPDATE ON public.weekly_planning
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_objectives_user_week ON public.objectives(user_id, week_key);
CREATE INDEX IF NOT EXISTS idx_user_progress_user_id ON public.user_progress(user_id);
CREATE INDEX IF NOT EXISTS idx_weekly_planning_user_week ON public.weekly_planning(user_id, week_key);