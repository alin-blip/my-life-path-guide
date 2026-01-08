-- Add columns for habit and task synchronization in champion routine
ALTER TABLE champion_routine_settings 
ADD COLUMN IF NOT EXISTS habit_steps JSONB DEFAULT '[]',
ADD COLUMN IF NOT EXISTS include_daily_tasks BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS step_configs JSONB DEFAULT '{}';