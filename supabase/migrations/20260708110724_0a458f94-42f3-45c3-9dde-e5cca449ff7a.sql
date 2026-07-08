-- Warrior funnel leads: capture emails from quiz soft-gate before Stripe checkout
CREATE TABLE IF NOT EXISTS public.warrior_funnel_leads (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text NOT NULL,
  warrior_type text NOT NULL,
  quiz_result_id uuid REFERENCES public.quiz_routine_results(id) ON DELETE SET NULL,
  language text NOT NULL DEFAULT 'ro',
  utm jsonb DEFAULT '{}'::jsonb,
  report_sent_at timestamptz,
  checkout_started_at timestamptz,
  trial_started_at timestamptz,
  routine_activated_at timestamptz,
  stripe_customer_id text,
  stripe_session_id text,
  user_id uuid,
  status text NOT NULL DEFAULT 'lead',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_warrior_funnel_leads_email ON public.warrior_funnel_leads (lower(email));
CREATE INDEX IF NOT EXISTS idx_warrior_funnel_leads_status ON public.warrior_funnel_leads (status);
CREATE INDEX IF NOT EXISTS idx_warrior_funnel_leads_created ON public.warrior_funnel_leads (created_at DESC);

GRANT SELECT, INSERT, UPDATE ON public.warrior_funnel_leads TO authenticated;
GRANT INSERT ON public.warrior_funnel_leads TO anon;
GRANT ALL ON public.warrior_funnel_leads TO service_role;

ALTER TABLE public.warrior_funnel_leads ENABLE ROW LEVEL SECURITY;

-- Anon can insert leads (email capture from public quiz)
CREATE POLICY "Anon can insert leads"
  ON public.warrior_funnel_leads FOR INSERT
  TO anon
  WITH CHECK (true);

-- Authenticated users can insert their own leads
CREATE POLICY "Authenticated can insert leads"
  ON public.warrior_funnel_leads FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Users can read leads matching their email or user_id
CREATE POLICY "Users read their own leads"
  ON public.warrior_funnel_leads FOR SELECT
  TO authenticated
  USING (user_id = auth.uid() OR lower(email) = lower((SELECT email FROM auth.users WHERE id = auth.uid())));

-- Admins can read everything
CREATE POLICY "Admins read all leads"
  ON public.warrior_funnel_leads FOR SELECT
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

CREATE TRIGGER trg_warrior_funnel_leads_updated_at
  BEFORE UPDATE ON public.warrior_funnel_leads
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();