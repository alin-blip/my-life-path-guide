-- Create table for AI Planning conversation drafts
CREATE TABLE IF NOT EXISTS public.weekly_planning_drafts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  week_key TEXT NOT NULL,
  messages JSONB NOT NULL DEFAULT '[]'::jsonb,
  questions_answered INTEGER NOT NULL DEFAULT 0,
  is_skipping_review BOOLEAN NOT NULL DEFAULT false,
  last_saved_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  
  -- Composite unique constraint: one draft per user per week
  CONSTRAINT unique_user_week_draft UNIQUE (user_id, week_key)
);

-- Enable Row Level Security
ALTER TABLE public.weekly_planning_drafts ENABLE ROW LEVEL SECURITY;

-- RLS Policies: Users can only access their own drafts
CREATE POLICY "Users can view their own planning drafts"
  ON public.weekly_planning_drafts
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own planning drafts"
  ON public.weekly_planning_drafts
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own planning drafts"
  ON public.weekly_planning_drafts
  FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own planning drafts"
  ON public.weekly_planning_drafts
  FOR DELETE
  USING (auth.uid() = user_id);

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_weekly_planning_drafts_updated_at
  BEFORE UPDATE ON public.weekly_planning_drafts
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Create index for faster lookups
CREATE INDEX idx_weekly_planning_drafts_user_week 
  ON public.weekly_planning_drafts(user_id, week_key);