
ALTER TABLE public.email_leads
  ADD COLUMN IF NOT EXISTS language text NOT NULL DEFAULT 'ro'
  CHECK (language IN ('ro','en'));

CREATE INDEX IF NOT EXISTS idx_email_leads_language ON public.email_leads(language);
