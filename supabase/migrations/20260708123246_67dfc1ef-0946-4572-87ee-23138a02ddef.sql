-- Allow anon (unauthenticated funnel visitor) to update ONLY the checkout progress
-- fields on the lead row they just created. Row identification is via random UUID
-- (lead.id) already held only by the client that submitted the email.
GRANT UPDATE (checkout_started_at, status, updated_at) ON public.warrior_funnel_leads TO anon;

CREATE POLICY "Anon can mark checkout started"
  ON public.warrior_funnel_leads FOR UPDATE
  TO anon
  USING (status IN ('lead', 'checkout'))
  WITH CHECK (status IN ('lead', 'checkout'));