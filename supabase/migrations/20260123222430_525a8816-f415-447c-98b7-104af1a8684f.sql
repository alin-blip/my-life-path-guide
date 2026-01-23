-- Drop the problematic RLS policy that tries to access auth.users directly
DROP POLICY IF EXISTS "Users can read their own leads by email" ON public.email_leads;

-- Recreate using auth.jwt() which doesn't require access to auth.users table
CREATE POLICY "Users can read their own leads by email" 
ON public.email_leads 
FOR SELECT 
USING (
  email = (auth.jwt() ->> 'email')::text
);