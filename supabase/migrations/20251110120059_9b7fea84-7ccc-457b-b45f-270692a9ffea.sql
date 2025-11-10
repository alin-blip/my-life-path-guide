-- Add unique constraint on daily_progress table for user_id and date
-- This allows upsert operations to work correctly

ALTER TABLE public.daily_progress
ADD CONSTRAINT daily_progress_user_date_unique UNIQUE (user_id, date);