-- 1. Adăugare coloane noi în crm_contact_profiles pentru MQL/SQL tracking
ALTER TABLE crm_contact_profiles 
ADD COLUMN IF NOT EXISTS mql_at TIMESTAMPTZ DEFAULT NULL,
ADD COLUMN IF NOT EXISTS sql_at TIMESTAMPTZ DEFAULT NULL,
ADD COLUMN IF NOT EXISTS days_in_current_stage INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS funnel_stage_changed_at TIMESTAMPTZ DEFAULT NULL;

-- 2. Adăugare sequence_type în email_sequence_log pentru nurture tracking
ALTER TABLE email_sequence_log 
ADD COLUMN IF NOT EXISTS sequence_type TEXT DEFAULT 'challenge';

-- 3. Index pentru nurture sequence queries
CREATE INDEX IF NOT EXISTS idx_email_sequence_type 
ON email_sequence_log(email, sequence_type);

-- 4. Index pentru funnel stage queries
CREATE INDEX IF NOT EXISTS idx_crm_funnel_stage_date 
ON crm_contact_profiles(funnel_stage, lead_captured_at);

-- 5. Index pentru finding unconverted leads quickly
CREATE INDEX IF NOT EXISTS idx_crm_lead_captured 
ON crm_contact_profiles(funnel_stage, lead_captured_at) 
WHERE funnel_stage = 'lead';

-- 6. Creare tabel pentru challenge recovery tracking
CREATE TABLE IF NOT EXISTS challenge_recovery_emails (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id),
  email TEXT NOT NULL,
  stuck_on_day INTEGER NOT NULL,
  sent_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  opened_at TIMESTAMPTZ,
  clicked_at TIMESTAMPTZ,
  converted BOOLEAN DEFAULT false,
  converted_at TIMESTAMPTZ
);

-- Enable RLS
ALTER TABLE challenge_recovery_emails ENABLE ROW LEVEL SECURITY;

-- Admin can view all recovery emails
CREATE POLICY "Admins can view all recovery emails"
ON challenge_recovery_emails
FOR SELECT
USING (public.has_role(auth.uid(), 'admin'));

-- Admin can insert recovery emails
CREATE POLICY "Admins can insert recovery emails"
ON challenge_recovery_emails
FOR INSERT
WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Service role can do everything (for edge functions)
CREATE POLICY "Service role full access to recovery emails"
ON challenge_recovery_emails
FOR ALL
USING (auth.role() = 'service_role');

-- 7. Index for recovery email queries
CREATE INDEX IF NOT EXISTS idx_recovery_emails_user 
ON challenge_recovery_emails(user_id, stuck_on_day);