-- Create challenge_progress table to track user progress through the 7-day challenge
CREATE TABLE public.challenge_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  day_number INTEGER NOT NULL CHECK (day_number >= 1 AND day_number <= 7),
  completed BOOLEAN DEFAULT false,
  completed_at TIMESTAMP WITH TIME ZONE,
  video_watched BOOLEAN DEFAULT false,
  actions_completed JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE (user_id, day_number)
);

-- Enable RLS
ALTER TABLE public.challenge_progress ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Users can view their own challenge progress"
ON public.challenge_progress
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own challenge progress"
ON public.challenge_progress
FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own challenge progress"
ON public.challenge_progress
FOR UPDATE
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Create trigger for updated_at
CREATE TRIGGER update_challenge_progress_updated_at
BEFORE UPDATE ON public.challenge_progress
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();