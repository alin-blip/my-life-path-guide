-- Add early_bird_expires_at column to subscribers table
ALTER TABLE public.subscribers 
ADD COLUMN IF NOT EXISTS early_bird_expires_at TIMESTAMPTZ;

-- Set default for existing users (3 days from their creation date or now if no created_at)
UPDATE public.subscribers 
SET early_bird_expires_at = COALESCE(updated_at, now()) + INTERVAL '3 days'
WHERE early_bird_expires_at IS NULL;