-- Relax CHECK constraints to include 'minte'
ALTER TABLE public.missions DROP CONSTRAINT IF EXISTS missions_category_check;
ALTER TABLE public.missions ADD CONSTRAINT missions_category_check
  CHECK (category = ANY (ARRAY['body'::text, 'being'::text, 'balance'::text, 'business'::text, 'minte'::text]));

ALTER TABLE public.game_journey_maps DROP CONSTRAINT IF EXISTS game_journey_maps_category_check;
ALTER TABLE public.game_journey_maps ADD CONSTRAINT game_journey_maps_category_check
  CHECK (category = ANY (ARRAY['body'::text, 'being'::text, 'balance'::text, 'business'::text, 'minte'::text]));

-- Add tracking columns for daily Mind Test in Champion Routine
ALTER TABLE public.user_preferences
  ADD COLUMN IF NOT EXISTS mind_test_skip_count INTEGER NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS last_mind_test_at TIMESTAMPTZ;