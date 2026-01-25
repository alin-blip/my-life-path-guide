-- Fix weekly_planning_history table - add missing columns for trigger
ALTER TABLE weekly_planning_history 
ADD COLUMN IF NOT EXISTS hit_list_snapshot jsonb,
ADD COLUMN IF NOT EXISTS hot_list_snapshot jsonb,
ADD COLUMN IF NOT EXISTS do_list_snapshot jsonb;