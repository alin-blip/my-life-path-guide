-- Create checkout_events table for tracking conversion funnel
CREATE TABLE public.checkout_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id),
  session_id TEXT,
  event_type TEXT NOT NULL,
  plan_id TEXT,
  source TEXT,
  error_message TEXT,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.checkout_events ENABLE ROW LEVEL SECURITY;

-- Allow inserts from anyone (including anonymous for tracking before auth)
CREATE POLICY "Allow inserts from anyone" ON public.checkout_events 
  FOR INSERT WITH CHECK (true);

-- Allow anyone to select (for analytics dashboard)
CREATE POLICY "Allow select for analytics" ON public.checkout_events 
  FOR SELECT USING (true);

-- Add indexes for faster queries
CREATE INDEX idx_checkout_events_created_at ON public.checkout_events(created_at DESC);
CREATE INDEX idx_checkout_events_source ON public.checkout_events(source);
CREATE INDEX idx_checkout_events_event_type ON public.checkout_events(event_type);