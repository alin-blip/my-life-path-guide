-- Add dashboard_widgets column to user_preferences table
ALTER TABLE public.user_preferences 
ADD COLUMN IF NOT EXISTS dashboard_widgets jsonb DEFAULT '{"widgets": [{"id": "objectives", "enabled": true, "order": 1, "size": "large"}, {"id": "dailyCompact", "enabled": true, "order": 2, "size": "medium"}, {"id": "habits", "enabled": true, "order": 3, "size": "medium"}]}'::jsonb;