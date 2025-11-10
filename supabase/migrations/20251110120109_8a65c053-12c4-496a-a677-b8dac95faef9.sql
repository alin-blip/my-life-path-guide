-- Add unique constraint on user_progress table for user_id and activity_type
-- This allows upsert operations to work correctly for core and daily four progress

ALTER TABLE public.user_progress
ADD CONSTRAINT user_progress_user_activity_unique UNIQUE (user_id, activity_type);