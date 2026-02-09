
-- Create personal_power_progress table
CREATE TABLE public.personal_power_progress (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  day_number INTEGER NOT NULL CHECK (day_number >= 1 AND day_number <= 30),
  lesson_completed BOOLEAN NOT NULL DEFAULT false,
  exercise_completed BOOLEAN NOT NULL DEFAULT false,
  coaching_completed BOOLEAN NOT NULL DEFAULT false,
  breakthrough_completed BOOLEAN NOT NULL DEFAULT false,
  exercise_responses JSONB DEFAULT '{}',
  breakthrough_text TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, day_number)
);

-- Enable Row Level Security
ALTER TABLE public.personal_power_progress ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Users can view their own progress"
ON public.personal_power_progress
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own progress"
ON public.personal_power_progress
FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own progress"
ON public.personal_power_progress
FOR UPDATE
USING (auth.uid() = user_id);

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_personal_power_progress_updated_at
BEFORE UPDATE ON public.personal_power_progress
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Add index for faster lookups
CREATE INDEX idx_personal_power_progress_user_day ON public.personal_power_progress(user_id, day_number);
