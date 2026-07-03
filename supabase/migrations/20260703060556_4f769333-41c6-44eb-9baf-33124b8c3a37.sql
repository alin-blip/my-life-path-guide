
DROP POLICY IF EXISTS "Allow check own rate limit" ON public.public_rate_limits;
DROP POLICY IF EXISTS "Allow insert rate limit with ip" ON public.public_rate_limits;
DROP POLICY IF EXISTS "Allow update rate limit by ip" ON public.public_rate_limits;

REVOKE ALL ON public.public_rate_limits FROM anon, authenticated;
GRANT ALL ON public.public_rate_limits TO service_role;

CREATE POLICY "Service role manages rate limits"
  ON public.public_rate_limits
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);
