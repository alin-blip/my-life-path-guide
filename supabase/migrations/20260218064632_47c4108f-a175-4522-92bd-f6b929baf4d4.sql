
-- Create ultimate_you_progress table
CREATE TABLE public.ultimate_you_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  day_number INTEGER NOT NULL,
  lesson_completed BOOLEAN DEFAULT false,
  exercise_completed BOOLEAN DEFAULT false,
  coaching_completed BOOLEAN DEFAULT false,
  breakthrough_completed BOOLEAN DEFAULT false,
  exercise_responses JSONB DEFAULT '{}',
  breakthrough_text TEXT,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, day_number)
);

-- Enable RLS
ALTER TABLE public.ultimate_you_progress ENABLE ROW LEVEL SECURITY;

-- RLS policies
CREATE POLICY "Users can view their own ultimate_you progress"
  ON public.ultimate_you_progress FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own ultimate_you progress"
  ON public.ultimate_you_progress FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own ultimate_you progress"
  ON public.ultimate_you_progress FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own ultimate_you progress"
  ON public.ultimate_you_progress FOR DELETE
  USING (auth.uid() = user_id);

-- Trigger for updated_at
CREATE TRIGGER update_ultimate_you_progress_updated_at
  BEFORE UPDATE ON public.ultimate_you_progress
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();
