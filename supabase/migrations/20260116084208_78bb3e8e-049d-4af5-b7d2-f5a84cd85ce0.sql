-- Add missing columns to champion_routine_logs for tracking all routine steps
ALTER TABLE public.champion_routine_logs
ADD COLUMN IF NOT EXISTS stack_selection_completed BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS morning_emotion_intensity INTEGER,
ADD COLUMN IF NOT EXISTS transformed_energy TEXT;

-- Note: emotional_transform_completed already exists in the schema