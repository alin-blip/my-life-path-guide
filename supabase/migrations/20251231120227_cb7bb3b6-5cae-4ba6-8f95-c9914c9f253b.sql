-- Create onboarding_progress table
CREATE TABLE public.onboarding_progress (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  current_day INTEGER NOT NULL DEFAULT 1,
  completed_days INTEGER[] NOT NULL DEFAULT '{}',
  started_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  completed_at TIMESTAMP WITH TIME ZONE,
  is_completed BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  CONSTRAINT unique_user_onboarding UNIQUE (user_id)
);

-- Enable RLS
ALTER TABLE public.onboarding_progress ENABLE ROW LEVEL SECURITY;

-- Create policy for users to manage their own onboarding progress
CREATE POLICY "Users can manage their own onboarding progress"
ON public.onboarding_progress
FOR ALL
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Create daily_checkins table
CREATE TABLE public.daily_checkins (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  mood_score INTEGER CHECK (mood_score >= 1 AND mood_score <= 5),
  top_priority TEXT,
  gratitude_note TEXT,
  energy_level INTEGER CHECK (energy_level >= 1 AND energy_level <= 5),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  CONSTRAINT unique_user_daily_checkin UNIQUE (user_id, date)
);

-- Enable RLS
ALTER TABLE public.daily_checkins ENABLE ROW LEVEL SECURITY;

-- Create policy for users to manage their own daily checkins
CREATE POLICY "Users can manage their own daily checkins"
ON public.daily_checkins
FOR ALL
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Create weekly_reviews table
CREATE TABLE public.weekly_reviews (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  week_key TEXT NOT NULL,
  wins TEXT[],
  lessons TEXT[],
  improvements TEXT[],
  next_week_focus TEXT,
  overall_rating INTEGER CHECK (overall_rating >= 1 AND overall_rating <= 5),
  body_progress INTEGER CHECK (body_progress >= 0 AND body_progress <= 100),
  being_progress INTEGER CHECK (being_progress >= 0 AND being_progress <= 100),
  balance_progress INTEGER CHECK (balance_progress >= 0 AND balance_progress <= 100),
  business_progress INTEGER CHECK (business_progress >= 0 AND business_progress <= 100),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  CONSTRAINT unique_user_weekly_review UNIQUE (user_id, week_key)
);

-- Enable RLS
ALTER TABLE public.weekly_reviews ENABLE ROW LEVEL SECURITY;

-- Create policy for users to manage their own weekly reviews
CREATE POLICY "Users can manage their own weekly reviews"
ON public.weekly_reviews
FOR ALL
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Add area column to user_tasks if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'user_tasks' 
    AND column_name = 'area'
  ) THEN
    ALTER TABLE public.user_tasks ADD COLUMN area TEXT CHECK (area IN ('body', 'being', 'balance', 'business'));
  END IF;
END $$;

-- Create trigger for updated_at on new tables
CREATE TRIGGER update_onboarding_progress_updated_at
  BEFORE UPDATE ON public.onboarding_progress
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_daily_checkins_updated_at
  BEFORE UPDATE ON public.daily_checkins
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_weekly_reviews_updated_at
  BEFORE UPDATE ON public.weekly_reviews
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();