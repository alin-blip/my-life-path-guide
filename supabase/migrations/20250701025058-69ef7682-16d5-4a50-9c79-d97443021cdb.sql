
-- Create user roles enum and table for proper admin authentication
CREATE TYPE public.app_role AS ENUM ('admin', 'moderator', 'user');

-- Create user_roles table
CREATE TABLE public.user_roles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    role app_role NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    UNIQUE (user_id, role)
);

-- Enable RLS on user_roles
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Create security definer function to check roles (prevents RLS recursion)
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;

-- RLS policies for user_roles
CREATE POLICY "Users can view their own roles" 
  ON public.user_roles 
  FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Only admins can manage roles" 
  ON public.user_roles 
  FOR ALL 
  USING (public.has_role(auth.uid(), 'admin'));

-- Update existing tables to require authentication for sensitive data
-- Fix overly permissive RLS policies

-- Update anger_stack_sessions - require authentication
DROP POLICY IF EXISTS "Enable read access for all users" ON public.anger_stack_sessions;
CREATE POLICY "Users can view their own anger stack sessions" 
  ON public.anger_stack_sessions 
  FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own anger stack sessions" 
  ON public.anger_stack_sessions 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

-- Update divine_coaching_sessions - require authentication  
DROP POLICY IF EXISTS "Enable read access for all users" ON public.divine_coaching_sessions;
CREATE POLICY "Users can view their own divine coaching sessions" 
  ON public.divine_coaching_sessions 
  FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own divine coaching sessions" 
  ON public.divine_coaching_sessions 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

-- Update ai_live_coaching_sessions - require authentication
DROP POLICY IF EXISTS "Enable read access for all users" ON public.ai_live_coaching_sessions;
CREATE POLICY "Users can view their own AI coaching sessions" 
  ON public.ai_live_coaching_sessions 
  FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own AI coaching sessions" 
  ON public.ai_live_coaching_sessions 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

-- Update power_stack_sessions - require authentication
DROP POLICY IF EXISTS "Enable read access for all users" ON public.power_stack_sessions;
CREATE POLICY "Users can view their own power stack sessions" 
  ON public.power_stack_sessions 
  FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own power stack sessions" 
  ON public.power_stack_sessions 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

-- Ensure all user-specific tables have proper RLS
ALTER TABLE public.user_progress ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage their own progress" 
  ON public.user_progress 
  FOR ALL 
  USING (auth.uid() = user_id);

ALTER TABLE public.journal_entries ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage their own journal entries" 
  ON public.journal_entries 
  FOR ALL 
  USING (auth.uid() = user_id);

ALTER TABLE public.fact_maps ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage their own fact maps" 
  ON public.fact_maps 
  FOR ALL 
  USING (auth.uid() = user_id);

ALTER TABLE public.monthly_missions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage their own monthly missions" 
  ON public.monthly_missions 
  FOR ALL 
  USING (auth.uid() = user_id);

ALTER TABLE public.game_journey_maps ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage their own game journey maps" 
  ON public.game_journey_maps 
  FOR ALL 
  USING (auth.uid() = user_id);

ALTER TABLE public.stack_library ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage their own stack library" 
  ON public.stack_library 
  FOR ALL 
  USING (auth.uid() = user_id);

-- Admin-only policies for sensitive operations
CREATE POLICY "Only admins can view all user statistics" 
  ON public.user_statistics 
  FOR SELECT 
  USING (public.has_role(auth.uid(), 'admin'));

-- Insert a default admin user (replace with your actual user ID)
-- This should be run manually with the actual admin user ID
-- INSERT INTO public.user_roles (user_id, role) VALUES ('YOUR_USER_ID_HERE', 'admin');
