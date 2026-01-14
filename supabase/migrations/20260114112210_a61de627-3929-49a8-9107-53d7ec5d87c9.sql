-- Add new columns to course_modules for Warrior's Way course system
ALTER TABLE course_modules ADD COLUMN IF NOT EXISTS is_free BOOLEAN DEFAULT false;
ALTER TABLE course_modules ADD COLUMN IF NOT EXISTS section_name TEXT;

-- Create user_course_progress table for tracking video progress
CREATE TABLE IF NOT EXISTS user_course_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  module_id UUID REFERENCES course_modules(id) ON DELETE CASCADE,
  completed BOOLEAN DEFAULT false,
  watched_seconds INTEGER DEFAULT 0,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, module_id)
);

-- Enable RLS on user_course_progress
ALTER TABLE user_course_progress ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for user_course_progress
CREATE POLICY "Users can view their own course progress"
ON user_course_progress
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own course progress"
ON user_course_progress
FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own course progress"
ON user_course_progress
FOR UPDATE
USING (auth.uid() = user_id);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_user_course_progress_user_module ON user_course_progress(user_id, module_id);

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_user_course_progress_updated_at
BEFORE UPDATE ON user_course_progress
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();