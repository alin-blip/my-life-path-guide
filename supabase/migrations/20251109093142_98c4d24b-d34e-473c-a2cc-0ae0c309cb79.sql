-- Add individual columns to weekly_planning for backward compatibility
ALTER TABLE public.weekly_planning 
  ADD COLUMN IF NOT EXISTS domino_title TEXT,
  ADD COLUMN IF NOT EXISTS week_goal TEXT,
  ADD COLUMN IF NOT EXISTS key_points JSONB DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS review_data JSONB DEFAULT '{}'::jsonb;

-- Create user_statistics table
CREATE TABLE IF NOT EXISTS public.user_statistics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  total_stacks_completed INTEGER DEFAULT 0,
  total_journal_entries INTEGER DEFAULT 0,
  total_core4_sessions INTEGER DEFAULT 0,
  last_activity_date TIMESTAMPTZ,
  current_streak INTEGER DEFAULT 0,
  longest_streak INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.user_statistics ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own statistics"
ON public.user_statistics FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own statistics"
ON public.user_statistics FOR UPDATE
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can insert their own statistics"
ON public.user_statistics FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

-- Admins can view all statistics
CREATE POLICY "Admins can view all statistics"
ON public.user_statistics FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- Add update trigger
CREATE TRIGGER update_user_statistics_updated_at BEFORE UPDATE ON public.user_statistics
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Create index
CREATE INDEX IF NOT EXISTS idx_user_statistics_user_id ON public.user_statistics(user_id);