CREATE TABLE public.quiz_routine_results (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  email TEXT,
  warrior_type TEXT NOT NULL CHECK (warrior_type IN ('reactor','disciplined','experimenter','warrior')),
  scores JSONB NOT NULL DEFAULT '{}'::jsonb,
  answers JSONB NOT NULL DEFAULT '[]'::jsonb,
  source TEXT DEFAULT 'quiz-rutina',
  activated BOOLEAN NOT NULL DEFAULT false,
  activated_at TIMESTAMPTZ,
  language TEXT DEFAULT 'ro',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_quiz_routine_user ON public.quiz_routine_results(user_id);
CREATE INDEX idx_quiz_routine_email ON public.quiz_routine_results(lower(email));
CREATE INDEX idx_quiz_routine_created ON public.quiz_routine_results(created_at DESC);

GRANT SELECT, INSERT, UPDATE ON public.quiz_routine_results TO authenticated;
GRANT INSERT ON public.quiz_routine_results TO anon;
GRANT ALL ON public.quiz_routine_results TO service_role;

ALTER TABLE public.quiz_routine_results ENABLE ROW LEVEL SECURITY;

-- Anyone can submit a result (anonymous quiz)
CREATE POLICY "Anyone can submit quiz result"
  ON public.quiz_routine_results FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

-- Authenticated users can view own results (by user_id OR matching email)
CREATE POLICY "Users can view own quiz results"
  ON public.quiz_routine_results FOR SELECT
  TO authenticated
  USING (
    auth.uid() = user_id
    OR (email IS NOT NULL AND lower(email) = lower((auth.jwt() ->> 'email')))
  );

-- Users can update their own results (e.g. to mark activated, attach user_id)
CREATE POLICY "Users can update own quiz results"
  ON public.quiz_routine_results FOR UPDATE
  TO authenticated
  USING (
    auth.uid() = user_id
    OR (email IS NOT NULL AND lower(email) = lower((auth.jwt() ->> 'email')))
  )
  WITH CHECK (
    auth.uid() = user_id
    OR (email IS NOT NULL AND lower(email) = lower((auth.jwt() ->> 'email')))
  );

-- Admins can view all
CREATE POLICY "Admins can view all quiz results"
  ON public.quiz_routine_results FOR SELECT
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

CREATE TRIGGER update_quiz_routine_results_updated_at
  BEFORE UPDATE ON public.quiz_routine_results
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();