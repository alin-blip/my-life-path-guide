-- Create email_sequence_log table for tracking sent emails
CREATE TABLE public.email_sequence_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lead_id UUID REFERENCES public.email_leads(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  sequence_type TEXT NOT NULL, -- 'warrior_power', 'challenge_7_zile', etc.
  day_number INTEGER NOT NULL,
  sent_at TIMESTAMPTZ DEFAULT now(),
  opened_at TIMESTAMPTZ,
  clicked_at TIMESTAMPTZ,
  unsubscribed_at TIMESTAMPTZ,
  tracking_id UUID DEFAULT gen_random_uuid(),
  UNIQUE(email, sequence_type, day_number)
);

-- Add subscribed column to email_leads if it doesn't exist
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'email_leads' 
    AND column_name = 'subscribed'
  ) THEN
    ALTER TABLE public.email_leads ADD COLUMN subscribed BOOLEAN DEFAULT true;
  END IF;
END $$;

-- Enable RLS on email_sequence_log
ALTER TABLE public.email_sequence_log ENABLE ROW LEVEL SECURITY;

-- Allow service role to manage sequence logs (for edge functions)
CREATE POLICY "Service role can manage sequence logs"
ON public.email_sequence_log
FOR ALL
USING (true)
WITH CHECK (true);

-- Create index for faster queries
CREATE INDEX idx_email_sequence_log_email ON public.email_sequence_log(email);
CREATE INDEX idx_email_sequence_log_sequence_type ON public.email_sequence_log(sequence_type);
CREATE INDEX idx_email_sequence_log_tracking_id ON public.email_sequence_log(tracking_id);
CREATE INDEX idx_email_leads_subscribed ON public.email_leads(subscribed) WHERE subscribed = true;