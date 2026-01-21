-- Fix public_rate_limits with correct column names
CREATE POLICY "Allow update rate limit by ip"
ON public.public_rate_limits
FOR UPDATE
TO anon, authenticated
USING (ip_address IS NOT NULL);

CREATE POLICY "Allow insert rate limit with ip"
ON public.public_rate_limits
FOR INSERT
TO anon, authenticated
WITH CHECK (ip_address IS NOT NULL AND endpoint IS NOT NULL);