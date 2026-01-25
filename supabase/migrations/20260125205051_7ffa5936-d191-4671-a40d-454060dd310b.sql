-- Add project_name column to missions table to support multiple projects per category
ALTER TABLE missions ADD COLUMN IF NOT EXISTS project_name TEXT;

-- Drop the old unique index if it exists
DROP INDEX IF EXISTS missions_user_category_type_period_idx;

-- Create new unique constraint that includes project_name (using COALESCE for NULL handling)
CREATE UNIQUE INDEX missions_user_category_type_period_project_idx 
ON missions (user_id, category, mission_type, period, COALESCE(project_name, ''));