CREATE TABLE public.couple_verdict_leads (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  access_token text NOT NULL UNIQUE DEFAULT encode(gen_random_bytes(24), 'hex'),
  name text NOT NULL,
  email text NOT NULL,
  language text NOT NULL DEFAULT 'ro',
  marketing_consent boolean NOT NULL DEFAULT false,
  situation text NOT NULL,
  my_perspective text NOT NULL,
  partner_perspective text NOT NULL,
  verdict jsonb,
  plan jsonb,
  paid boolean NOT NULL DEFAULT false,
  paid_plan text,
  paid_at timestamptz,
  stripe_session_id text,
  ip_hash text,
  utm jsonb,
  followup_sent jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.couple_verdict_leads TO authenticated;
GRANT ALL ON public.couple_verdict_leads TO service_role;
ALTER TABLE public.couple_verdict_leads ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins can view couple verdict leads" ON public.couple_verdict_leads
  FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE INDEX couple_verdict_leads_email_idx ON public.couple_verdict_leads (lower(email));
CREATE INDEX couple_verdict_leads_ip_idx ON public.couple_verdict_leads (ip_hash, created_at);
CREATE TRIGGER update_couple_verdict_leads_updated_at BEFORE UPDATE ON public.couple_verdict_leads
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();