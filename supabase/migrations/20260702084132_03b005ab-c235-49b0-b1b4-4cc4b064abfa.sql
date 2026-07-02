
CREATE TABLE public.shadow_coach_daily_snapshots (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  date date NOT NULL,
  counts_by_axis jsonb NOT NULL DEFAULT '{}'::jsonb,
  total_count integer NOT NULL DEFAULT 0,
  top_events jsonb NOT NULL DEFAULT '[]'::jsonb,
  axes_scores jsonb NOT NULL DEFAULT '{}'::jsonb,
  reflection jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(user_id, date)
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.shadow_coach_daily_snapshots TO authenticated;
GRANT ALL ON public.shadow_coach_daily_snapshots TO service_role;

ALTER TABLE public.shadow_coach_daily_snapshots ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage own shadow snapshots"
  ON public.shadow_coach_daily_snapshots
  FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE INDEX idx_shadow_snapshots_user_date
  ON public.shadow_coach_daily_snapshots(user_id, date DESC);

CREATE TRIGGER trg_shadow_snapshots_updated_at
  BEFORE UPDATE ON public.shadow_coach_daily_snapshots
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
