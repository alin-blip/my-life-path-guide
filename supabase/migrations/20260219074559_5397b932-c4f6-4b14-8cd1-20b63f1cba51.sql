-- Add new columns to tribe_events for Skool-style calendar
ALTER TABLE public.tribe_events ADD COLUMN IF NOT EXISTS cover_image_url text;
ALTER TABLE public.tribe_events ADD COLUMN IF NOT EXISTS timezone text;
ALTER TABLE public.tribe_events ADD COLUMN IF NOT EXISTS duration_minutes integer;
ALTER TABLE public.tribe_events ADD COLUMN IF NOT EXISTS remind_before boolean DEFAULT false;

-- Set default tribe_id on wall_posts to prevent future NULL tribe_id posts
ALTER TABLE public.wall_posts ALTER COLUMN tribe_id SET DEFAULT '07825fb0-4d6c-4716-b2f3-27a1708cf680';