-- Add unique constraint for proper upsert on missions table
CREATE UNIQUE INDEX IF NOT EXISTS missions_user_category_type_period_idx 
ON public.missions (user_id, category, mission_type, period);

-- Add comment explaining the constraint
COMMENT ON INDEX missions_user_category_type_period_idx IS 'Enables upsert operations by user_id, category, mission_type, and period';