CREATE OR REPLACE FUNCTION public.trigger_send_challenge_recovery()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $fn$
DECLARE
  v_secret text;
BEGIN
  SELECT decrypted_secret INTO v_secret FROM vault.decrypted_secrets WHERE name = 'CRON_SECRET' LIMIT 1;
  PERFORM net.http_post(
    url := 'https://exsbnfmaadjyfblperas.supabase.co/functions/v1/send-challenge-recovery',
    headers := jsonb_build_object('Content-Type','application/json','x-cron-secret', COALESCE(v_secret,'')),
    body := '{}'::jsonb
  );
END;
$fn$;

REVOKE ALL ON FUNCTION public.trigger_send_challenge_recovery() FROM PUBLIC;