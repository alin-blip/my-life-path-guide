-- Add workout and meditation configuration columns to champion_routine_settings
ALTER TABLE public.champion_routine_settings
ADD COLUMN IF NOT EXISTS workout_goal text DEFAULT 'muscle',
ADD COLUMN IF NOT EXISTS workout_level text DEFAULT 'intermediate',
ADD COLUMN IF NOT EXISTS workout_location text DEFAULT 'gym',
ADD COLUMN IF NOT EXISTS workout_days_per_week integer DEFAULT 4,
ADD COLUMN IF NOT EXISTS workout_target_groups jsonb DEFAULT '[]'::jsonb,
ADD COLUMN IF NOT EXISTS meditation_default_mode text DEFAULT 'timer',
ADD COLUMN IF NOT EXISTS meditation_default_duration integer DEFAULT 15,
ADD COLUMN IF NOT EXISTS binaural_enabled boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS binaural_default_type text DEFAULT 'theta',
ADD COLUMN IF NOT EXISTS reading_book_title text,
ADD COLUMN IF NOT EXISTS reading_pages_per_day integer DEFAULT 10,
ADD COLUMN IF NOT EXISTS light_exposure_duration integer DEFAULT 10,
ADD COLUMN IF NOT EXISTS setup_completed_at timestamptz;

-- Add comment for documentation
COMMENT ON COLUMN public.champion_routine_settings.setup_completed_at IS 'Timestamp when user completed the initial setup wizard';