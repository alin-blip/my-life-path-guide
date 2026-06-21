CREATE TABLE public.mind_quiz_drafts (
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  quiz_slug TEXT NOT NULL,
  answers JSONB NOT NULL DEFAULT '{}'::jsonb,
  current_index INTEGER NOT NULL DEFAULT 0,
  language TEXT NOT NULL DEFAULT 'ro',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (user_id, quiz_slug)
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.mind_quiz_drafts TO authenticated;
GRANT ALL ON public.mind_quiz_drafts TO service_role;

ALTER TABLE public.mind_quiz_drafts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage their own quiz drafts"
  ON public.mind_quiz_drafts FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE TRIGGER update_mind_quiz_drafts_updated_at
  BEFORE UPDATE ON public.mind_quiz_drafts
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();