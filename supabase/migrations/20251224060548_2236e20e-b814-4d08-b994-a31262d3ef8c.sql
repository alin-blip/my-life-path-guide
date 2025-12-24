-- Create table for detailed Biz 4 metrics tracking
CREATE TABLE IF NOT EXISTS public.biz4_daily_metrics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  
  -- Content metrics
  content_completed BOOLEAN DEFAULT FALSE,
  content_pieces_count INTEGER DEFAULT 0,
  content_type TEXT,
  
  -- Engage metrics  
  engage_completed BOOLEAN DEFAULT FALSE,
  engage_minutes INTEGER DEFAULT 0,
  engage_comments_count INTEGER DEFAULT 0,
  
  -- Outreach metrics
  outreach_completed BOOLEAN DEFAULT FALSE,
  outreach_prospects_count INTEGER DEFAULT 0,
  outreach_channels TEXT[],
  
  -- Close metrics
  close_completed BOOLEAN DEFAULT FALSE,
  close_conversations_count INTEGER DEFAULT 0,
  close_deals_won INTEGER DEFAULT 0,
  
  -- Weekly Two metrics
  podcast_completed BOOLEAN DEFAULT FALSE,
  podcast_episode_number INTEGER,
  webinar_completed BOOLEAN DEFAULT FALSE,
  webinar_attendees_count INTEGER,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  UNIQUE(user_id, date)
);

-- Enable RLS
ALTER TABLE public.biz4_daily_metrics ENABLE ROW LEVEL SECURITY;

-- Create RLS policy for users to manage their own metrics
CREATE POLICY "Users can manage their own biz4 metrics"
ON public.biz4_daily_metrics
FOR ALL
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Create trigger for updated_at
CREATE TRIGGER update_biz4_daily_metrics_updated_at
BEFORE UPDATE ON public.biz4_daily_metrics
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Enable realtime for the table
ALTER PUBLICATION supabase_realtime ADD TABLE public.biz4_daily_metrics;