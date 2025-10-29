-- FAZA 2: Privacy & Data Protection
-- Creăm funcție security definer pentru a proteja accesul la email-uri
CREATE OR REPLACE FUNCTION public.get_user_email(_user_id uuid)
RETURNS text
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT email 
  FROM public.profiles 
  WHERE user_id = _user_id
  LIMIT 1;
$$;

-- FAZA 4: Monitoring & Observability
-- Creăm tabelul pentru error logging
CREATE TABLE IF NOT EXISTS public.error_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  error_message TEXT NOT NULL,
  error_stack TEXT,
  component_stack TEXT,
  url TEXT,
  user_agent TEXT,
  timestamp TIMESTAMPTZ DEFAULT NOW(),
  resolved BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS pe error_logs
ALTER TABLE public.error_logs ENABLE ROW LEVEL SECURITY;

-- Policy pentru admini să vadă toate erorile
CREATE POLICY "Admins can view all error logs"
ON public.error_logs
FOR SELECT
USING (has_role(auth.uid(), 'admin'::app_role));

-- Policy pentru useri să vadă propriile erori
CREATE POLICY "Users can view their own error logs"
ON public.error_logs
FOR SELECT
USING (auth.uid() = user_id);

-- Policy pentru insert (orice utilizator autentificat poate loga erori)
CREATE POLICY "Authenticated users can insert error logs"
ON public.error_logs
FOR INSERT
WITH CHECK (auth.uid() = user_id OR auth.uid() IS NOT NULL);

-- Index pentru query-uri rapide
CREATE INDEX IF NOT EXISTS idx_error_logs_timestamp ON public.error_logs(timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_error_logs_user_id ON public.error_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_error_logs_resolved ON public.error_logs(resolved) WHERE resolved = false;

-- Creăm tabelul pentru admin alerts (AI credits monitoring)
CREATE TABLE IF NOT EXISTS public.admin_alerts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  type TEXT NOT NULL,
  message TEXT NOT NULL,
  severity TEXT NOT NULL DEFAULT 'info',
  metadata JSONB DEFAULT '{}'::jsonb,
  resolved BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  resolved_at TIMESTAMPTZ
);

-- Enable RLS
ALTER TABLE public.admin_alerts ENABLE ROW LEVEL SECURITY;

-- Policy pentru admini
CREATE POLICY "Admins can manage all alerts"
ON public.admin_alerts
FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role));

-- Index
CREATE INDEX IF NOT EXISTS idx_admin_alerts_created ON public.admin_alerts(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_admin_alerts_resolved ON public.admin_alerts(resolved) WHERE resolved = false;