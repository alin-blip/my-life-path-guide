-- Add emotional check-in columns to champion_routine_logs
ALTER TABLE public.champion_routine_logs
ADD COLUMN IF NOT EXISTS morning_emotion TEXT,
ADD COLUMN IF NOT EXISTS morning_emotion_intensity INTEGER,
ADD COLUMN IF NOT EXISTS emotional_transform_completed BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS transformed_energy TEXT;