-- Create app_role enum for user roles
CREATE TYPE public.app_role AS ENUM ('admin', 'moderator', 'user');

-- Create user_roles table
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role app_role NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, role)
);

ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Create has_role function
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  )
$$;

-- Error logs table
CREATE TABLE public.error_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  error_message TEXT NOT NULL,
  stack_trace TEXT,
  component_name TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.error_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can insert their own error logs"
ON public.error_logs FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

-- Fact maps table
CREATE TABLE public.fact_maps (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  category TEXT NOT NULL,
  goals JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.fact_maps ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their own fact maps"
ON public.fact_maps FOR ALL
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Stack library table
CREATE TABLE public.stack_library (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  type TEXT NOT NULL,
  content JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.stack_library ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their own stack library"
ON public.stack_library FOR ALL
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Stack sessions table
CREATE TABLE public.stack_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  session_id TEXT NOT NULL,
  stack_type TEXT NOT NULL,
  data JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, session_id)
);

ALTER TABLE public.stack_sessions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their own stack sessions"
ON public.stack_sessions FOR ALL
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Divine coaching sessions table
CREATE TABLE public.divine_coaching_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  session_id TEXT NOT NULL,
  step_number INTEGER,
  question TEXT,
  answer TEXT,
  answers TEXT,
  message TEXT,
  type TEXT,
  is_system_response BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.divine_coaching_sessions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their own divine coaching sessions"
ON public.divine_coaching_sessions FOR ALL
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Anger stack sessions table
CREATE TABLE public.anger_stack_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  session_id TEXT NOT NULL,
  data JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, session_id)
);

ALTER TABLE public.anger_stack_sessions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their own anger stack sessions"
ON public.anger_stack_sessions FOR ALL
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Knowledge base files table
CREATE TABLE public.knowledge_base_files (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  file_name TEXT NOT NULL,
  file_path TEXT NOT NULL,
  file_type TEXT,
  file_size INTEGER,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.knowledge_base_files ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their own knowledge base files"
ON public.knowledge_base_files FOR ALL
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Daily progress table
CREATE TABLE public.daily_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  date DATE NOT NULL,
  progress_data JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, date)
);

ALTER TABLE public.daily_progress ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their own daily progress"
ON public.daily_progress FOR ALL
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Daily progress stats table
CREATE TABLE public.daily_progress_stats (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  date DATE NOT NULL,
  total_tasks INTEGER DEFAULT 0,
  completed_tasks INTEGER DEFAULT 0,
  hot_list_items INTEGER DEFAULT 0,
  hit_list_items INTEGER DEFAULT 0,
  do_list_items INTEGER DEFAULT 0,
  completion_rate DECIMAL(5,2) DEFAULT 0,
  streak_days INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, date)
);

ALTER TABLE public.daily_progress_stats ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their own daily progress stats"
ON public.daily_progress_stats FOR ALL
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Admins can view all daily progress stats
CREATE POLICY "Admins can view all daily progress stats"
ON public.daily_progress_stats FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- Hot list items table (for Door feature)
CREATE TABLE public.hot_list_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  week_key TEXT NOT NULL,
  item_id TEXT NOT NULL,
  text TEXT NOT NULL,
  list_type TEXT NOT NULL CHECK (list_type IN ('hot', 'hit', 'do')),
  priority INTEGER,
  day TEXT,
  completed BOOLEAN DEFAULT false,
  selected BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.hot_list_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their own hot list items"
ON public.hot_list_items FOR ALL
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- User tasks table (for Door feature)
CREATE TABLE public.user_tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  task_id TEXT NOT NULL,
  text TEXT NOT NULL,
  list_type TEXT NOT NULL CHECK (list_type IN ('hot', 'hit', 'do')),
  week_key TEXT,
  priority INTEGER,
  day TEXT,
  completed BOOLEAN DEFAULT false,
  selected BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, task_id)
);

ALTER TABLE public.user_tasks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their own tasks"
ON public.user_tasks FOR ALL
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Create indexes for better performance
CREATE INDEX idx_user_tasks_user_id ON public.user_tasks(user_id);
CREATE INDEX idx_user_tasks_week_key ON public.user_tasks(week_key);
CREATE INDEX idx_hot_list_items_user_id ON public.hot_list_items(user_id);
CREATE INDEX idx_hot_list_items_week_key ON public.hot_list_items(week_key);
CREATE INDEX idx_daily_progress_stats_user_date ON public.daily_progress_stats(user_id, date);

-- Update timestamp trigger function
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add update triggers
CREATE TRIGGER update_fact_maps_updated_at BEFORE UPDATE ON public.fact_maps
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_stack_library_updated_at BEFORE UPDATE ON public.stack_library
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_stack_sessions_updated_at BEFORE UPDATE ON public.stack_sessions
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_anger_stack_sessions_updated_at BEFORE UPDATE ON public.anger_stack_sessions
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_daily_progress_stats_updated_at BEFORE UPDATE ON public.daily_progress_stats
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_hot_list_items_updated_at BEFORE UPDATE ON public.hot_list_items
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_user_tasks_updated_at BEFORE UPDATE ON public.user_tasks
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();