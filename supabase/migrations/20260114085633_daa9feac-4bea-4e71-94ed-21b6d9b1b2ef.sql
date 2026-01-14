-- Allow public inserts to email_leads table for lead magnets (no auth required)
CREATE POLICY "Allow public insert to email_leads"
ON public.email_leads
FOR INSERT
TO anon, authenticated
WITH CHECK (true);

-- Allow reading own leads for authenticated users
CREATE POLICY "Users can read their own leads by email"
ON public.email_leads
FOR SELECT
TO authenticated
USING (email = (SELECT email FROM auth.users WHERE id = auth.uid()));