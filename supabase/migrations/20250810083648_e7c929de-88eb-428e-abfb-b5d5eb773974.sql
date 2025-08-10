-- Create user_tasks table for door functionality with proper RLS
CREATE TABLE public.user_tasks (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  week_key TEXT NOT NULL,
  task_type TEXT NOT NULL CHECK (task_type IN ('hot', 'hit', 'do')),
  title TEXT NOT NULL,
  description TEXT,
  completed BOOLEAN NOT NULL DEFAULT false,
  priority INTEGER DEFAULT 1,
  day_of_week TEXT,
  position INTEGER DEFAULT 0,
  is_key_point BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.user_tasks ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for user isolation
CREATE POLICY "Users can view their own tasks" 
ON public.user_tasks 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own tasks" 
ON public.user_tasks 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own tasks" 
ON public.user_tasks 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own tasks" 
ON public.user_tasks 
FOR DELETE 
USING (auth.uid() = user_id);

-- Admins can view all tasks
CREATE POLICY "Admins can view all tasks" 
ON public.user_tasks 
FOR SELECT 
USING (has_role(auth.uid(), 'admin'::app_role));

-- Create index for better performance
CREATE INDEX idx_user_tasks_user_week ON public.user_tasks(user_id, week_key);
CREATE INDEX idx_user_tasks_type ON public.user_tasks(task_type);

-- Create trigger for updated_at
CREATE TRIGGER update_user_tasks_updated_at
BEFORE UPDATE ON public.user_tasks
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Clear localStorage history by creating a function to handle migration
CREATE OR REPLACE FUNCTION public.clear_user_task_history(target_user_id UUID)
RETURNS INTEGER AS $$
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
$$ LANGUAGE plpgsql SECURITY DEFINER;