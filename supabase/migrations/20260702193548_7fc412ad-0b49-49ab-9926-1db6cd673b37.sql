
-- Drop all existing permissive policies on public_rate_limits
DROP POLICY IF EXISTS "Anyone can read rate limits" ON public.public_rate_limits;
DROP POLICY IF EXISTS "Public can view rate limits" ON public.public_rate_limits;
DROP POLICY IF EXISTS "Public read rate limits" ON public.public_rate_limits;
DROP POLICY IF EXISTS "Allow public read" ON public.public_rate_limits;
DROP POLICY IF EXISTS "Public can insert rate limits" ON public.public_rate_limits;
DROP POLICY IF EXISTS "Public can update rate limits" ON public.public_rate_limits;

-- Ensure RLS is enabled
ALTER TABLE public.public_rate_limits ENABLE ROW LEVEL SECURITY;

-- Revoke direct client access; enforcement lives in edge functions using service role
REVOKE ALL ON public.public_rate_limits FROM anon, authenticated;
GRANT ALL ON public.public_rate_limits TO service_role;

-- Explicit deny-by-default: no policies for anon/authenticated means no access.
-- Service role bypasses RLS.
