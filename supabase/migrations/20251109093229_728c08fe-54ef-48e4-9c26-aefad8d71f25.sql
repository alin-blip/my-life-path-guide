-- Add missing columns to courses table
ALTER TABLE public.courses 
  ADD COLUMN IF NOT EXISTS is_published BOOLEAN DEFAULT true;

-- Add notes column to daily_progress
ALTER TABLE public.daily_progress 
  ADD COLUMN IF NOT EXISTS notes TEXT;