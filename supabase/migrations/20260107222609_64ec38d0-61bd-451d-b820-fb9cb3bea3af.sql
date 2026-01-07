-- Create time_entries table for tracking time and energy
CREATE TABLE public.time_entries (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  category TEXT NOT NULL CHECK (category IN ('work', 'health', 'relationships', 'personal', 'spirituality', 'learning')),
  activity TEXT NOT NULL,
  started_at TIMESTAMP WITH TIME ZONE,
  ended_at TIMESTAMP WITH TIME ZONE,
  duration_minutes INTEGER NOT NULL DEFAULT 0,
  energy_before INTEGER CHECK (energy_before >= 1 AND energy_before <= 10),
  energy_after INTEGER CHECK (energy_after >= 1 AND energy_after <= 10),
  satisfaction INTEGER CHECK (satisfaction >= 1 AND satisfaction <= 10),
  was_planned BOOLEAN DEFAULT false,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create burnout_alerts table
CREATE TABLE public.burnout_alerts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  alert_type TEXT NOT NULL CHECK (alert_type IN ('overwork', 'energy_drain', 'imbalance', 'no_recovery')),
  severity TEXT NOT NULL CHECK (severity IN ('low', 'medium', 'high', 'critical')),
  description TEXT NOT NULL,
  metric_value NUMERIC,
  recommendations TEXT[],
  acknowledged_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create weekly_time_reports table
CREATE TABLE public.weekly_time_reports (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  week_start DATE NOT NULL,
  total_hours NUMERIC DEFAULT 0,
  category_breakdown JSONB DEFAULT '{}'::jsonb,
  energy_average NUMERIC,
  roi_score NUMERIC,
  ai_summary TEXT,
  ai_recommendations TEXT[],
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, week_start)
);

-- Enable RLS on all tables
ALTER TABLE public.time_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.burnout_alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.weekly_time_reports ENABLE ROW LEVEL SECURITY;

-- RLS policies for time_entries
CREATE POLICY "Users can view their own time entries"
ON public.time_entries FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own time entries"
ON public.time_entries FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own time entries"
ON public.time_entries FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own time entries"
ON public.time_entries FOR DELETE
USING (auth.uid() = user_id);

-- RLS policies for burnout_alerts
CREATE POLICY "Users can view their own burnout alerts"
ON public.burnout_alerts FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own burnout alerts"
ON public.burnout_alerts FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own burnout alerts"
ON public.burnout_alerts FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own burnout alerts"
ON public.burnout_alerts FOR DELETE
USING (auth.uid() = user_id);

-- RLS policies for weekly_time_reports
CREATE POLICY "Users can view their own weekly reports"
ON public.weekly_time_reports FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own weekly reports"
ON public.weekly_time_reports FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own weekly reports"
ON public.weekly_time_reports FOR UPDATE
USING (auth.uid() = user_id);

-- Create indexes for performance
CREATE INDEX idx_time_entries_user_date ON public.time_entries(user_id, date);
CREATE INDEX idx_time_entries_category ON public.time_entries(user_id, category);
CREATE INDEX idx_burnout_alerts_user ON public.burnout_alerts(user_id, created_at);
CREATE INDEX idx_weekly_reports_user_week ON public.weekly_time_reports(user_id, week_start);