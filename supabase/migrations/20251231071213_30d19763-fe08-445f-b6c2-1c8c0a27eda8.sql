-- Create email_leads table for storing lead magnet signups
CREATE TABLE public.email_leads (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT NOT NULL,
  name TEXT,
  lead_magnet TEXT NOT NULL DEFAULT 'core4_framework',
  source TEXT,
  ip_address TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  subscribed BOOLEAN DEFAULT true,
  metadata JSONB DEFAULT '{}'::jsonb
);

-- Create unique index on email + lead_magnet to prevent duplicates
CREATE UNIQUE INDEX idx_email_leads_email_magnet ON public.email_leads(email, lead_magnet);

-- Enable RLS
ALTER TABLE public.email_leads ENABLE ROW LEVEL SECURITY;

-- Allow anyone to insert (public lead capture)
CREATE POLICY "Anyone can submit lead magnet form"
ON public.email_leads
FOR INSERT
WITH CHECK (true);

-- Only admins can view leads
CREATE POLICY "Admins can view all leads"
ON public.email_leads
FOR SELECT
USING (has_role(auth.uid(), 'admin'::app_role));

-- Only admins can update leads
CREATE POLICY "Admins can update leads"
ON public.email_leads
FOR UPDATE
USING (has_role(auth.uid(), 'admin'::app_role));

-- Only admins can delete leads
CREATE POLICY "Admins can delete leads"
ON public.email_leads
FOR DELETE
USING (has_role(auth.uid(), 'admin'::app_role));