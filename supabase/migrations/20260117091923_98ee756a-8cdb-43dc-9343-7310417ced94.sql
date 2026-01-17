-- Add subscription tracking columns to crm_contact_profiles
ALTER TABLE crm_contact_profiles 
ADD COLUMN IF NOT EXISTS subscription_tier TEXT DEFAULT NULL;

ALTER TABLE crm_contact_profiles 
ADD COLUMN IF NOT EXISTS subscription_status TEXT DEFAULT NULL;