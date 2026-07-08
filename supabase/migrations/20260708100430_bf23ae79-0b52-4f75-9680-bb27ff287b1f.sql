CREATE TABLE public.feature_usage_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  feature_key TEXT NOT NULL,
  period_key TEXT NOT NULL,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_feature_usage_user_feature_period
  ON public.feature_usage_log(user_id, feature_key, period_key);
CREATE INDEX idx_feature_usage_created
  ON public.feature_usage_log(created_at DESC);

GRANT SELECT ON public.feature_usage_log TO authenticated;
GRANT ALL ON public.feature_usage_log TO service_role;

ALTER TABLE public.feature_usage_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own usage"
  ON public.feature_usage_log FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all usage"
  ON public.feature_usage_log FOR SELECT
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));