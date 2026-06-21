CREATE TABLE public.mind_psa_history (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  belief_key TEXT NOT NULL,
  data JSONB NOT NULL DEFAULT '{}'::jsonb,
  progress_percent INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_mind_psa_history_user_key_time
  ON public.mind_psa_history (user_id, belief_key, created_at DESC);

GRANT SELECT, INSERT, DELETE ON public.mind_psa_history TO authenticated;
GRANT ALL ON public.mind_psa_history TO service_role;

ALTER TABLE public.mind_psa_history ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage own PSA history"
  ON public.mind_psa_history
  FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);