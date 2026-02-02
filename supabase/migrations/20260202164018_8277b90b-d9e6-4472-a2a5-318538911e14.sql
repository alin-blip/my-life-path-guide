-- Add challenge tracking columns to crm_contact_profiles
ALTER TABLE public.crm_contact_profiles 
ADD COLUMN IF NOT EXISTS challenge_started_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS challenge_current_day INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS challenge_days_completed INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS challenge_completed_at TIMESTAMPTZ;