
-- 1. Journal entries
CREATE TABLE public.journal_entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  lesson TEXT,
  entry_date DATE NOT NULL DEFAULT CURRENT_DATE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.journal_entries TO authenticated;
GRANT ALL ON public.journal_entries TO service_role;
ALTER TABLE public.journal_entries ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own journal entries"
  ON public.journal_entries FOR ALL TO authenticated
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE INDEX journal_entries_user_date_idx ON public.journal_entries(user_id, entry_date DESC);
CREATE TRIGGER journal_entries_updated_at
  BEFORE UPDATE ON public.journal_entries
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- 2. Daily challenge claims
CREATE TABLE public.daily_challenge_claims (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  claim_date DATE NOT NULL DEFAULT CURRENT_DATE,
  challenge_id TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, claim_date, challenge_id)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.daily_challenge_claims TO authenticated;
GRANT ALL ON public.daily_challenge_claims TO service_role;
ALTER TABLE public.daily_challenge_claims ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own daily challenge claims"
  ON public.daily_challenge_claims FOR ALL TO authenticated
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE INDEX daily_challenge_claims_user_date_idx ON public.daily_challenge_claims(user_id, claim_date);

-- 3. Life score data column
ALTER TABLE public.user_preferences
  ADD COLUMN IF NOT EXISTS life_score_data JSONB;
