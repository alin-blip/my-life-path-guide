-- ============================================================
-- FAZA 1: Mind Category Infrastructure
-- ============================================================

-- 1. mind_quiz_responses
CREATE TABLE public.mind_quiz_responses (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  quiz_slug TEXT NOT NULL,
  answers JSONB NOT NULL DEFAULT '{}'::jsonb,
  raw_score NUMERIC,
  max_score NUMERIC,
  score_healthy NUMERIC,
  band TEXT,
  axes_distribution JSONB DEFAULT '{}'::jsonb,
  language TEXT NOT NULL DEFAULT 'ro',
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_mind_quiz_responses_user ON public.mind_quiz_responses(user_id, quiz_slug, completed_at DESC);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.mind_quiz_responses TO authenticated;
GRANT ALL ON public.mind_quiz_responses TO service_role;
ALTER TABLE public.mind_quiz_responses ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage own mind quiz responses"
  ON public.mind_quiz_responses
  FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE TRIGGER trg_mind_quiz_responses_updated
  BEFORE UPDATE ON public.mind_quiz_responses
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- 2. mind_axis_scores
CREATE TABLE public.mind_axis_scores (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  axis TEXT NOT NULL,
  score_healthy NUMERIC NOT NULL DEFAULT 0,
  contributing_quizzes INTEGER NOT NULL DEFAULT 0,
  status TEXT,
  details JSONB DEFAULT '{}'::jsonb,
  last_computed_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, axis)
);

CREATE INDEX idx_mind_axis_scores_user ON public.mind_axis_scores(user_id);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.mind_axis_scores TO authenticated;
GRANT ALL ON public.mind_axis_scores TO service_role;
ALTER TABLE public.mind_axis_scores ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage own mind axis scores"
  ON public.mind_axis_scores
  FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE TRIGGER trg_mind_axis_scores_updated
  BEFORE UPDATE ON public.mind_axis_scores
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- 3. mind_belief_matrix (Matricea Credințelor Antreprenorului)
CREATE TABLE public.mind_belief_matrix (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  belief_key TEXT NOT NULL,
  data JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, belief_key)
);

CREATE INDEX idx_mind_belief_matrix_user ON public.mind_belief_matrix(user_id);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.mind_belief_matrix TO authenticated;
GRANT ALL ON public.mind_belief_matrix TO service_role;
ALTER TABLE public.mind_belief_matrix ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage own belief matrix"
  ON public.mind_belief_matrix
  FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE TRIGGER trg_mind_belief_matrix_updated
  BEFORE UPDATE ON public.mind_belief_matrix
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- 4. mind_psa_reconstruction (PSA Toxice CEO)
CREATE TABLE public.mind_psa_reconstruction (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  belief_key TEXT NOT NULL,
  data JSONB NOT NULL DEFAULT '{}'::jsonb,
  progress_percent INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, belief_key)
);

CREATE INDEX idx_mind_psa_user ON public.mind_psa_reconstruction(user_id);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.mind_psa_reconstruction TO authenticated;
GRANT ALL ON public.mind_psa_reconstruction TO service_role;
ALTER TABLE public.mind_psa_reconstruction ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage own psa reconstruction"
  ON public.mind_psa_reconstruction
  FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE TRIGGER trg_mind_psa_updated
  BEFORE UPDATE ON public.mind_psa_reconstruction
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();