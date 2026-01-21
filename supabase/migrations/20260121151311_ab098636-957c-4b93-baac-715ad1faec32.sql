-- Clean up old duplicate public_rate_limits policies
DROP POLICY IF EXISTS "Allow update own rate limit" ON public.public_rate_limits;
DROP POLICY IF EXISTS "Allow insert rate limit entry" ON public.public_rate_limits;