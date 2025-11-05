-- Create weekly_planning table for persistent storage of AI-generated weekly plans
CREATE TABLE IF NOT EXISTS public.weekly_planning (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  week_key TEXT NOT NULL,
  domino_title TEXT NOT NULL,
  week_goal TEXT,
  key_points JSONB NOT NULL DEFAULT '[]'::jsonb,
  review_data JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(user_id, week_key)
);

-- Enable RLS
ALTER TABLE public.weekly_planning ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Users can view their own weekly planning"
  ON public.weekly_planning
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own weekly planning"
  ON public.weekly_planning
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own weekly planning"
  ON public.weekly_planning
  FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own weekly planning"
  ON public.weekly_planning
  FOR DELETE
  USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all weekly planning"
  ON public.weekly_planning
  FOR SELECT
  USING (has_role(auth.uid(), 'admin'::app_role));

-- Create index for faster queries
CREATE INDEX idx_weekly_planning_user_week ON public.weekly_planning(user_id, week_key);

-- Create trigger for updated_at
CREATE TRIGGER update_weekly_planning_updated_at
  BEFORE UPDATE ON public.weekly_planning
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();