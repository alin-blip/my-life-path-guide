-- Create Napoleon Hill Projects table for journey tracking
CREATE TABLE IF NOT EXISTS public.napoleon_hill_projects (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  project_name TEXT NOT NULL,
  goal_description TEXT NOT NULL,
  goal_amount TEXT,
  goal_deadline TEXT,
  current_principle INTEGER NOT NULL DEFAULT 1,
  principle_answers JSONB DEFAULT '{}'::jsonb,
  principle_summaries JSONB DEFAULT '{}'::jsonb,
  action_items JSONB DEFAULT '[]'::jsonb,
  status TEXT NOT NULL DEFAULT 'active',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.napoleon_hill_projects ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can manage their own Napoleon Hill projects"
  ON public.napoleon_hill_projects
  FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Create trigger for updated_at
CREATE TRIGGER update_napoleon_hill_projects_updated_at
  BEFORE UPDATE ON public.napoleon_hill_projects
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Create index for better performance
CREATE INDEX idx_napoleon_hill_projects_user_id ON public.napoleon_hill_projects(user_id);
CREATE INDEX idx_napoleon_hill_projects_status ON public.napoleon_hill_projects(status);