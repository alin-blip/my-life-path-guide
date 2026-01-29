-- Create breakthrough_logs table for Mind Coach transformation sessions
CREATE TABLE IF NOT EXISTS public.breakthrough_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  emotion_before TEXT NOT NULL,
  intensity_before INTEGER CHECK (intensity_before BETWEEN 1 AND 10),
  emotion_after TEXT,
  intensity_after INTEGER CHECK (intensity_after BETWEEN 1 AND 10),
  story_identified TEXT,
  transformation_insight TEXT,
  action_committed TEXT,
  action_added_to_hit_list BOOLEAN DEFAULT FALSE,
  session_id UUID,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.breakthrough_logs ENABLE ROW LEVEL SECURITY;

-- RLS policies for breakthrough_logs
CREATE POLICY "Users can view own breakthroughs"
  ON public.breakthrough_logs
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own breakthroughs"
  ON public.breakthrough_logs
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own breakthroughs"
  ON public.breakthrough_logs
  FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own breakthroughs"
  ON public.breakthrough_logs
  FOR DELETE
  USING (auth.uid() = user_id);

-- Index for fast lookups by user and date
CREATE INDEX idx_breakthrough_logs_user_date 
  ON public.breakthrough_logs(user_id, created_at DESC);