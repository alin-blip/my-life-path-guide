-- Update default dashboard_widgets to empty for new users
ALTER TABLE public.user_preferences 
ALTER COLUMN dashboard_widgets SET DEFAULT '{"widgets": []}'::jsonb;