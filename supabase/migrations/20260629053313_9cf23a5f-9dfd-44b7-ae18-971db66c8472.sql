CREATE TABLE public.marriage_quiz_leads (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT NOT NULL,
  first_name TEXT,
  language TEXT NOT NULL DEFAULT 'ro' CHECK (language IN ('ro','en')),
  answers JSONB NOT NULL DEFAULT '[]'::jsonb,
  axis_scores JSONB NOT NULL DEFAULT '{}'::jsonb,
  overall_score NUMERIC,
  health_band TEXT,
  ai_diagnosis TEXT,
  ai_plan JSONB,
  marketing_consent BOOLEAN NOT NULL DEFAULT false,
  source TEXT DEFAULT 'marriage-quiz',
  user_agent TEXT,
  ip_hash TEXT,
  email_sent_at TIMESTAMPTZ,
  converted_user_id UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

GRANT INSERT ON public.marriage_quiz_leads TO anon, authenticated;
GRANT SELECT, UPDATE ON public.marriage_quiz_leads TO authenticated;
GRANT ALL ON public.marriage_quiz_leads TO service_role;

ALTER TABLE public.marriage_quiz_leads ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can submit a marriage quiz lead"
  ON public.marriage_quiz_leads FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

CREATE POLICY "Admins can view all marriage quiz leads"
  ON public.marriage_quiz_leads FOR SELECT
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update marriage quiz leads"
  ON public.marriage_quiz_leads FOR UPDATE
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

CREATE TRIGGER trg_marriage_quiz_leads_updated_at
  BEFORE UPDATE ON public.marriage_quiz_leads
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE INDEX idx_marriage_quiz_leads_email ON public.marriage_quiz_leads(email);
CREATE INDEX idx_marriage_quiz_leads_created_at ON public.marriage_quiz_leads(created_at DESC);