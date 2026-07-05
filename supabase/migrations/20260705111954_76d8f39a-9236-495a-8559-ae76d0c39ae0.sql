
-- 1. Manual enrollment table
CREATE TABLE IF NOT EXISTS public.challenge_reactivation_manual (
  email TEXT PRIMARY KEY,
  enrolled_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  audience TEXT NOT NULL DEFAULT 'no_start',  -- 'no_start' | 'started_no_complete'
  source TEXT,
  completed_at TIMESTAMPTZ,
  unsubscribed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

GRANT SELECT ON public.challenge_reactivation_manual TO authenticated;
GRANT ALL ON public.challenge_reactivation_manual TO service_role;

ALTER TABLE public.challenge_reactivation_manual ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can view reactivation enrollments"
  ON public.challenge_reactivation_manual FOR SELECT
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can manage reactivation enrollments"
  ON public.challenge_reactivation_manual FOR ALL
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE INDEX IF NOT EXISTS idx_reactivation_enrolled_at
  ON public.challenge_reactivation_manual (enrolled_at)
  WHERE completed_at IS NULL AND unsubscribed_at IS NULL;

-- 2. Pause old auto-recovery cron (keep the function intact as fallback)
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM cron.job WHERE jobname = 'send-challenge-recovery-daily') THEN
    PERFORM cron.unschedule('send-challenge-recovery-daily');
  END IF;
END $$;

-- 3. Schedule new controlled reactivation cron (daily 09:00 UTC)
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM cron.job WHERE jobname = 'send-challenge-reactivation-daily') THEN
    PERFORM cron.unschedule('send-challenge-reactivation-daily');
  END IF;
  PERFORM cron.schedule(
    'send-challenge-reactivation-daily',
    '0 9 * * *',
    $cron$
      SELECT net.http_post(
        url := 'https://exsbnfmaadjyfblperas.supabase.co/functions/v1/send-challenge-reactivation',
        headers := jsonb_build_object(
          'Content-Type', 'application/json',
          'x-cron-secret', (SELECT decrypted_secret FROM vault.decrypted_secrets WHERE name = 'CRON_SECRET' LIMIT 1)
        ),
        body := '{"mode":"cron"}'::jsonb
      );
    $cron$
  );
END $$;
