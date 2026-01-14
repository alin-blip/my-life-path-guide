
-- Add video_url column to warriors_way_lesson_content table
ALTER TABLE public.warriors_way_lesson_content 
ADD COLUMN IF NOT EXISTS video_url TEXT;

-- Add aha_moment column for highlights
ALTER TABLE public.warriors_way_lesson_content 
ADD COLUMN IF NOT EXISTS aha_moment TEXT;
