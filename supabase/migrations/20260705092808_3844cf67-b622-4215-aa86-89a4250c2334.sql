-- Attribution columns on subscribers
ALTER TABLE public.subscribers ADD COLUMN IF NOT EXISTS attribution_utm JSONB NOT NULL DEFAULT '{}'::jsonb;
ALTER TABLE public.subscribers ADD COLUMN IF NOT EXISTS attribution_first_touch TIMESTAMPTZ;
CREATE INDEX IF NOT EXISTS idx_subscribers_utm_source ON public.subscribers ((attribution_utm->>'utm_source'));
CREATE INDEX IF NOT EXISTS idx_subscribers_utm_campaign ON public.subscribers ((attribution_utm->>'utm_campaign'));

-- Manual ads spend table
CREATE TABLE IF NOT EXISTS public.ads_spend_manual (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  utm_source TEXT NOT NULL,
  utm_campaign TEXT NOT NULL DEFAULT '(all)',
  spend_amount NUMERIC(10,2) NOT NULL,
  currency TEXT NOT NULL DEFAULT 'EUR',
  period_start DATE NOT NULL,
  period_end DATE NOT NULL,
  notes TEXT,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (utm_source, utm_campaign, period_start, period_end)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.ads_spend_manual TO authenticated;
GRANT ALL ON public.ads_spend_manual TO service_role;
ALTER TABLE public.ads_spend_manual ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins manage ads spend"
  ON public.ads_spend_manual
  FOR ALL
  USING (public.has_role(auth.uid(),'admin'))
  WITH CHECK (public.has_role(auth.uid(),'admin'));
CREATE TRIGGER trg_ads_spend_updated
  BEFORE UPDATE ON public.ads_spend_manual
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Retargeting audiences view (challenge funnel stages)
CREATE OR REPLACE VIEW public.retargeting_audiences_v AS
WITH leads AS (
  SELECT DISTINCT lower(email) AS email,
         MAX(created_at) AS last_seen_at,
         (array_agg(metadata->>'utm_source' ORDER BY created_at DESC))[1] AS utm_source,
         (array_agg(metadata->>'utm_campaign' ORDER BY created_at DESC))[1] AS utm_campaign
  FROM public.email_leads
  WHERE source ILIKE 'challenge%'
  GROUP BY lower(email)
),
subs AS (
  SELECT lower(email) AS email, user_id, subscription_tier, subscribed, created_at
  FROM public.subscribers
),
progress AS (
  SELECT user_id,
         MAX(day_number) FILTER (WHERE completed) AS max_completed_day,
         MAX(day_number) AS max_started_day
  FROM public.challenge_progress
  GROUP BY user_id
),
checkouts AS (
  SELECT user_id,
         BOOL_OR(event_type = 'checkout_initiated') AS initiated,
         BOOL_OR(event_type IN ('session_created','checkout_completed')) AS completed,
         MAX(created_at) AS last_checkout_at
  FROM public.checkout_events
  WHERE created_at > now() - interval '30 days'
  GROUP BY user_id
)
SELECT
  l.email,
  COALESCE(s.user_id::text, '') AS user_id,
  CASE
    WHEN s.subscription_tier IS NOT NULL AND s.subscription_tier NOT IN ('free','trial','') THEN 'paid'
    WHEN c.initiated AND NOT COALESCE(c.completed, false) THEN 'abandoned_checkout'
    WHEN p.max_completed_day >= 7 THEN 'completed_no_purchase'
    WHEN p.max_started_day >= 1 THEN 'started_no_complete'
    WHEN s.user_id IS NOT NULL THEN 'signed_up_no_start'
    ELSE 'viewed_landing'
  END AS stage,
  GREATEST(l.last_seen_at, COALESCE(s.created_at, l.last_seen_at), COALESCE(c.last_checkout_at, l.last_seen_at)) AS last_seen_at,
  l.utm_source,
  l.utm_campaign,
  s.subscription_tier
FROM leads l
LEFT JOIN subs s ON s.email = l.email
LEFT JOIN progress p ON p.user_id = s.user_id
LEFT JOIN checkouts c ON c.user_id = s.user_id;

GRANT SELECT ON public.retargeting_audiences_v TO authenticated;
GRANT SELECT ON public.retargeting_audiences_v TO service_role;