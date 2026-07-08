
CREATE TABLE public.achievement_unlocks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  achievement_key text NOT NULL,
  unlocked_at timestamptz NOT NULL DEFAULT now(),
  seen boolean NOT NULL DEFAULT false,
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, achievement_key)
);

CREATE INDEX idx_achievement_unlocks_user ON public.achievement_unlocks(user_id, unlocked_at DESC);

GRANT SELECT, INSERT, UPDATE ON public.achievement_unlocks TO authenticated;
GRANT ALL ON public.achievement_unlocks TO service_role;

ALTER TABLE public.achievement_unlocks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users view own achievements"
  ON public.achievement_unlocks FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users mark own achievements seen"
  ON public.achievement_unlocks FOR UPDATE TO authenticated
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Service role manages achievements"
  ON public.achievement_unlocks FOR ALL TO service_role
  USING (true) WITH CHECK (true);
