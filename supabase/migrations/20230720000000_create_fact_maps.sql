
-- Create fact_maps table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.fact_maps (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  category TEXT NOT NULL,
  items JSONB NOT NULL DEFAULT '[]'::jsonb,
  user_id UUID,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Add RLS policies
ALTER TABLE public.fact_maps ENABLE ROW LEVEL SECURITY;

-- Users can view their own fact maps
CREATE POLICY "Users can view their own fact maps"
  ON public.fact_maps
  FOR SELECT
  USING (auth.uid() = user_id);

-- Users can insert their own fact maps
CREATE POLICY "Users can insert their own fact maps"
  ON public.fact_maps
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users can update their own fact maps
CREATE POLICY "Users can update their own fact maps"
  ON public.fact_maps
  FOR UPDATE
  USING (auth.uid() = user_id);

-- Create monthly_missions table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.monthly_missions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  category TEXT NOT NULL,
  name TEXT NOT NULL,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  is_impossible_game BOOLEAN DEFAULT false,
  questions JSONB DEFAULT '{}'::jsonb,
  parts JSONB DEFAULT '[]'::jsonb,
  result JSONB DEFAULT '{}'::jsonb,
  user_id UUID,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Add RLS policies
ALTER TABLE public.monthly_missions ENABLE ROW LEVEL SECURITY;

-- Users can view their own monthly missions
CREATE POLICY "Users can view their own monthly missions"
  ON public.monthly_missions
  FOR SELECT
  USING (auth.uid() = user_id);

-- Users can insert their own monthly missions
CREATE POLICY "Users can insert their own monthly missions"
  ON public.monthly_missions
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users can update their own monthly missions
CREATE POLICY "Users can update their own monthly missions"
  ON public.monthly_missions
  FOR UPDATE
  USING (auth.uid() = user_id);
