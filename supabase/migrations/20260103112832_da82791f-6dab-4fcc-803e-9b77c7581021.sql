-- Add evening routine columns to champion_routine_logs
ALTER TABLE champion_routine_logs 
ADD COLUMN IF NOT EXISTS evening_reflection_done_well TEXT,
ADD COLUMN IF NOT EXISTS evening_reflection_not_done TEXT,
ADD COLUMN IF NOT EXISTS evening_reflection_learned TEXT,
ADD COLUMN IF NOT EXISTS evening_completed BOOLEAN DEFAULT FALSE;