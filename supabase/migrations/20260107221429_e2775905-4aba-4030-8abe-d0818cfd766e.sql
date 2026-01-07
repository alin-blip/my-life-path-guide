-- Create emotional_checkins table for daily emotional tracking
CREATE TABLE public.emotional_checkins (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  emotion TEXT NOT NULL,
  intensity INTEGER NOT NULL CHECK (intensity >= 1 AND intensity <= 10),
  energy_level INTEGER NOT NULL CHECK (energy_level >= 1 AND energy_level <= 10),
  trigger TEXT,
  reaction TEXT,
  result TEXT,
  context TEXT,
  notes TEXT
);

-- Enable RLS
ALTER TABLE public.emotional_checkins ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Users can view their own emotional checkins"
ON public.emotional_checkins FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own emotional checkins"
ON public.emotional_checkins FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own emotional checkins"
ON public.emotional_checkins FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own emotional checkins"
ON public.emotional_checkins FOR DELETE
USING (auth.uid() = user_id);

-- Create emotional_patterns table for AI-detected patterns
CREATE TABLE public.emotional_patterns (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  pattern_type TEXT NOT NULL,
  description TEXT NOT NULL,
  frequency INTEGER NOT NULL DEFAULT 1,
  first_detected TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  last_detected TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  ai_insight TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.emotional_patterns ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Users can view their own emotional patterns"
ON public.emotional_patterns FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own emotional patterns"
ON public.emotional_patterns FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own emotional patterns"
ON public.emotional_patterns FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own emotional patterns"
ON public.emotional_patterns FOR DELETE
USING (auth.uid() = user_id);

-- Create indexes for better query performance
CREATE INDEX idx_emotional_checkins_user_id ON public.emotional_checkins(user_id);
CREATE INDEX idx_emotional_checkins_created_at ON public.emotional_checkins(created_at DESC);
CREATE INDEX idx_emotional_checkins_emotion ON public.emotional_checkins(emotion);
CREATE INDEX idx_emotional_patterns_user_id ON public.emotional_patterns(user_id);

-- Create trigger for updated_at on emotional_patterns
CREATE TRIGGER update_emotional_patterns_updated_at
BEFORE UPDATE ON public.emotional_patterns
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();