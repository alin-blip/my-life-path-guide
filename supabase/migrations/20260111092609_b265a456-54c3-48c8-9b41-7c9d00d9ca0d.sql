-- Setări noi pentru journaling și business
ALTER TABLE champion_routine_settings 
ADD COLUMN IF NOT EXISTS journaling_min_words INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS journaling_show_prompts BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS learn_task_type TEXT DEFAULT 'book',
ADD COLUMN IF NOT EXISTS learn_task_description TEXT,
ADD COLUMN IF NOT EXISTS apply_teach_description TEXT;

-- Log entries noi pentru learn și apply
ALTER TABLE champion_routine_logs
ADD COLUMN IF NOT EXISTS learn_completed BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS learn_notes TEXT,
ADD COLUMN IF NOT EXISTS apply_completed BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS apply_notes TEXT;