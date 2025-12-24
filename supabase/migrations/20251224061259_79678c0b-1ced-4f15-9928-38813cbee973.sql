-- Create table for Biz 4 weekly objectives
CREATE TABLE IF NOT EXISTS public.biz4_weekly_objectives (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  week_key TEXT NOT NULL,
  
  -- Objectives targets
  content_target INTEGER DEFAULT 7,
  engage_minutes_target INTEGER DEFAULT 210,
  prospects_target INTEGER DEFAULT 50,
  conversations_target INTEGER DEFAULT 10,
  deals_target INTEGER DEFAULT 2,
  
  -- Optional notes
  notes TEXT,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  UNIQUE(user_id, week_key)
);

-- Enable RLS
ALTER TABLE public.biz4_weekly_objectives ENABLE ROW LEVEL SECURITY;

-- Create RLS policy
CREATE POLICY "Users can manage their own biz4 objectives"
ON public.biz4_weekly_objectives
FOR ALL
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Create trigger for updated_at
CREATE TRIGGER update_biz4_weekly_objectives_updated_at
BEFORE UPDATE ON public.biz4_weekly_objectives
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();