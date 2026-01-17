-- Add subscription_status column to subscribers table
ALTER TABLE subscribers 
ADD COLUMN IF NOT EXISTS subscription_status TEXT DEFAULT NULL;

-- Add comment for clarity
COMMENT ON COLUMN subscribers.subscription_status IS 'Stripe subscription status: trialing, active, canceled, past_due, etc.';