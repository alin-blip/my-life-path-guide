-- Clean up remaining duplicate policies on email_leads
DROP POLICY IF EXISTS "Anyone can submit lead magnet form" ON email_leads;
DROP POLICY IF EXISTS "Allow public insert for lead capture" ON email_leads;