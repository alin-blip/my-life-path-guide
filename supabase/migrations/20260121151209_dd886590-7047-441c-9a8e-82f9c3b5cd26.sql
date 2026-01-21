-- Fix lead_magnet_events to require session_id
DROP POLICY IF EXISTS "Anyone can insert lead magnet events" ON public.lead_magnet_events;

CREATE POLICY "Allow lead magnet event tracking with session"
ON public.lead_magnet_events
FOR INSERT
TO anon, authenticated
WITH CHECK (session_id IS NOT NULL AND event_type IS NOT NULL);

-- Fix email_leads to add basic validation in policy
DROP POLICY IF EXISTS "Allow public insert to email_leads" ON public.email_leads;

CREATE POLICY "Allow lead capture with valid email"
ON public.email_leads
FOR INSERT
TO anon, authenticated
WITH CHECK (email IS NOT NULL AND email <> '' AND lead_magnet IS NOT NULL);