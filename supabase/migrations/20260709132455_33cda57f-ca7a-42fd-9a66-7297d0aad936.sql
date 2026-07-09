ALTER TABLE public.subscribers ADD COLUMN IF NOT EXISTS attribution_utm JSONB DEFAULT '{}'::jsonb;
ALTER TABLE public.subscribers ADD COLUMN IF NOT EXISTS attribution_first_touch TIMESTAMPTZ;
CREATE INDEX IF NOT EXISTS idx_subscribers_utm_source ON public.subscribers ((attribution_utm->>'utm_source'));
CREATE INDEX IF NOT EXISTS idx_subscribers_utm_campaign ON public.subscribers ((attribution_utm->>'utm_campaign'));

DROP VIEW IF EXISTS public.retargeting_audiences_v;

CREATE VIEW public.retargeting_audiences_v AS
WITH lead_emails AS (
  SELECT lower(email) AS email,
         MAX(created_at) AS last_seen_at,
         (array_agg(metadata->>'utm_source' ORDER BY created_at DESC))[1] AS utm_source,
         (array_agg(metadata->>'utm_campaign' ORDER BY created_at DESC))[1] AS utm_campaign
  FROM public.email_leads
  WHERE email IS NOT NULL
  GROUP BY lower(email)
),
sub_emails AS (
  SELECT lower(email) AS email, user_id, subscribed, subscription_tier, created_at, attribution_utm
  FROM public.subscribers WHERE email IS NOT NULL
),
challenge_start AS (SELECT DISTINCT user_id FROM public.challenge_progress),
challenge_done AS (SELECT user_id FROM public.challenge_progress GROUP BY user_id HAVING MAX(day_number) >= 7),
checkout_init AS (
  SELECT lower(COALESCE(metadata->>'email','')) AS email, MAX(created_at) AS last_seen
  FROM public.checkout_events
  WHERE event_type = 'checkout_initiated' AND created_at > now() - interval '7 days'
  GROUP BY lower(COALESCE(metadata->>'email',''))
),
checkout_done AS (
  SELECT DISTINCT lower(COALESCE(metadata->>'email','')) AS email
  FROM public.checkout_events
  WHERE event_type IN ('session_created','completed') AND created_at > now() - interval '7 days'
)
SELECT s.email, 'paid'::text AS stage, s.created_at AS last_seen_at,
       COALESCE(s.attribution_utm->>'utm_source', l.utm_source) AS utm_source,
       COALESCE(s.attribution_utm->>'utm_campaign', l.utm_campaign) AS utm_campaign
FROM sub_emails s LEFT JOIN lead_emails l ON l.email = s.email
WHERE s.subscribed = true AND s.subscription_tier IS NOT NULL AND s.subscription_tier <> 'free'
UNION ALL
SELECT s.email, 'completed_no_purchase', s.created_at,
       COALESCE(s.attribution_utm->>'utm_source', l.utm_source),
       COALESCE(s.attribution_utm->>'utm_campaign', l.utm_campaign)
FROM sub_emails s
JOIN challenge_done cd ON cd.user_id = s.user_id
LEFT JOIN lead_emails l ON l.email = s.email
WHERE (s.subscribed IS NOT TRUE OR s.subscription_tier IS NULL OR s.subscription_tier = 'free')
UNION ALL
SELECT s.email, 'started_no_complete', s.created_at,
       COALESCE(s.attribution_utm->>'utm_source', l.utm_source),
       COALESCE(s.attribution_utm->>'utm_campaign', l.utm_campaign)
FROM sub_emails s
JOIN challenge_start cs ON cs.user_id = s.user_id
LEFT JOIN challenge_done cd ON cd.user_id = s.user_id
LEFT JOIN lead_emails l ON l.email = s.email
WHERE cd.user_id IS NULL AND (s.subscribed IS NOT TRUE OR s.subscription_tier IS NULL OR s.subscription_tier = 'free')
UNION ALL
SELECT s.email, 'signed_up_no_start', s.created_at,
       COALESCE(s.attribution_utm->>'utm_source', l.utm_source),
       COALESCE(s.attribution_utm->>'utm_campaign', l.utm_campaign)
FROM sub_emails s
LEFT JOIN challenge_start cs ON cs.user_id = s.user_id
LEFT JOIN lead_emails l ON l.email = s.email
WHERE cs.user_id IS NULL AND (s.subscribed IS NOT TRUE OR s.subscription_tier IS NULL OR s.subscription_tier = 'free')
UNION ALL
SELECT ci.email, 'abandoned_checkout', ci.last_seen, l.utm_source, l.utm_campaign
FROM checkout_init ci
LEFT JOIN checkout_done cd ON cd.email = ci.email
LEFT JOIN lead_emails l ON l.email = ci.email
WHERE cd.email IS NULL AND ci.email <> ''
UNION ALL
SELECT l.email, 'viewed_landing', l.last_seen_at, l.utm_source, l.utm_campaign
FROM lead_emails l LEFT JOIN sub_emails s ON s.email = l.email
WHERE s.email IS NULL;

REVOKE ALL ON public.retargeting_audiences_v FROM PUBLIC;
GRANT SELECT ON public.retargeting_audiences_v TO authenticated, service_role;