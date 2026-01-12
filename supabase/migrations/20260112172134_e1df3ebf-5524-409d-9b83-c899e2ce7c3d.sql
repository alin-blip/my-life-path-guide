-- Drop existing overly permissive policies on email_leads
DROP POLICY IF EXISTS "Anyone can insert email leads" ON public.email_leads;
DROP POLICY IF EXISTS "Anyone can view email leads" ON public.email_leads;
DROP POLICY IF EXISTS "Public can view email_leads" ON public.email_leads;
DROP POLICY IF EXISTS "Allow public insert to email_leads" ON public.email_leads;

-- Create proper RLS policies for email_leads
-- Allow public INSERT (for lead magnets - this is intentional)
CREATE POLICY "Allow public insert for lead capture" 
ON public.email_leads 
FOR INSERT 
TO public
WITH CHECK (true);

-- Only admins can SELECT email leads
CREATE POLICY "Only admins can view email leads" 
ON public.email_leads 
FOR SELECT 
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- Only admins can UPDATE email leads
CREATE POLICY "Only admins can update email leads" 
ON public.email_leads 
FOR UPDATE 
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- Only admins can DELETE email leads
CREATE POLICY "Only admins can delete email leads" 
ON public.email_leads 
FOR DELETE 
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));