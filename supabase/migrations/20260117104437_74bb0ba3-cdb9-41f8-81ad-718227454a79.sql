-- Create table for lead magnet analytics/tracking
CREATE TABLE public.lead_magnet_events (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT,
  session_id TEXT NOT NULL,
  lead_magnet TEXT NOT NULL, -- 'warrior_power', 'vision_2026'
  event_type TEXT NOT NULL, -- 'page_view', 'cta_click', 'quiz_start', 'step_complete', 'lead_capture', 'quiz_complete', 'results_view', 'bounce'
  event_data JSONB DEFAULT '{}',
  page_path TEXT,
  referrer TEXT,
  device_type TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Index for faster queries
CREATE INDEX idx_lead_magnet_events_session ON public.lead_magnet_events(session_id);
CREATE INDEX idx_lead_magnet_events_email ON public.lead_magnet_events(email);
CREATE INDEX idx_lead_magnet_events_lead_magnet ON public.lead_magnet_events(lead_magnet);
CREATE INDEX idx_lead_magnet_events_created_at ON public.lead_magnet_events(created_at DESC);

-- Enable RLS
ALTER TABLE public.lead_magnet_events ENABLE ROW LEVEL SECURITY;

-- Allow inserts from anyone (for anonymous tracking)
CREATE POLICY "Anyone can insert lead magnet events"
ON public.lead_magnet_events
FOR INSERT
WITH CHECK (true);

-- Only admins can read
CREATE POLICY "Admins can read all lead magnet events"
ON public.lead_magnet_events
FOR SELECT
USING (public.has_role(auth.uid(), 'admin'));

-- Add columns to crm_contact_profiles for aggregated analytics
ALTER TABLE public.crm_contact_profiles 
ADD COLUMN IF NOT EXISTS vision_2026_score NUMERIC,
ADD COLUMN IF NOT EXISTS vision_2026_completed_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS warrior_power_started_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS warrior_power_completed_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS lead_magnet_clicks INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS time_on_quiz_seconds INTEGER;