-- Tabel pentru rate limiting public (IP-based)
CREATE TABLE public.public_rate_limits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ip_address TEXT NOT NULL,
  endpoint TEXT NOT NULL,
  request_count INTEGER DEFAULT 1,
  window_start TIMESTAMPTZ DEFAULT now(),
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Index pentru căutări rapide
CREATE INDEX idx_public_rate_limits_ip_endpoint 
ON public.public_rate_limits(ip_address, endpoint, window_start);

-- RLS pentru acces anonim
ALTER TABLE public.public_rate_limits ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow anonymous inserts" ON public.public_rate_limits FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow anonymous select" ON public.public_rate_limits FOR SELECT USING (true);
CREATE POLICY "Allow anonymous update" ON public.public_rate_limits FOR UPDATE USING (true);

-- Funcție de validare email
CREATE OR REPLACE FUNCTION public.validate_email_format()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.email IS NOT NULL AND NEW.email !~ '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$' THEN
    RAISE EXCEPTION 'Invalid email format: %', NEW.email;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Trigger pentru email_leads
CREATE TRIGGER validate_email_leads_email
BEFORE INSERT OR UPDATE ON public.email_leads
FOR EACH ROW EXECUTE FUNCTION public.validate_email_format();

-- Trigger pentru warrior_power_results  
CREATE TRIGGER validate_warrior_power_results_email
BEFORE INSERT OR UPDATE ON public.warrior_power_results
FOR EACH ROW EXECUTE FUNCTION public.validate_email_format();

-- Cleanup function pentru rate limits vechi (rulează periodic)
CREATE OR REPLACE FUNCTION public.cleanup_old_rate_limits()
RETURNS void AS $$
BEGIN
  DELETE FROM public.public_rate_limits 
  WHERE window_start < NOW() - INTERVAL '1 hour';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;