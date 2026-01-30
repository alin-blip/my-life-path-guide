-- Add sound settings columns to user_preferences
ALTER TABLE public.user_preferences 
ADD COLUMN IF NOT EXISTS sound_muted boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS sound_volume numeric DEFAULT 0.5,
ADD COLUMN IF NOT EXISTS preferred_tts_voice text,
ADD COLUMN IF NOT EXISTS onboarding_completed jsonb DEFAULT '{}'::jsonb;