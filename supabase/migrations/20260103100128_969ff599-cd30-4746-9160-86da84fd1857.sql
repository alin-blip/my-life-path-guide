-- Add nutrition settings columns to champion_routine_settings
ALTER TABLE public.champion_routine_settings
ADD COLUMN IF NOT EXISTS nutrition_configured boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS weight_kg numeric DEFAULT NULL,
ADD COLUMN IF NOT EXISTS height_cm numeric DEFAULT NULL,
ADD COLUMN IF NOT EXISTS age integer DEFAULT NULL,
ADD COLUMN IF NOT EXISTS activity_level text DEFAULT 'moderate',
ADD COLUMN IF NOT EXISTS calorie_target integer DEFAULT 2000,
ADD COLUMN IF NOT EXISTS protein_target integer DEFAULT 150,
ADD COLUMN IF NOT EXISTS carbs_target integer DEFAULT 250,
ADD COLUMN IF NOT EXISTS fats_target integer DEFAULT 65,
ADD COLUMN IF NOT EXISTS protein_percent integer DEFAULT 30,
ADD COLUMN IF NOT EXISTS carbs_percent integer DEFAULT 50,
ADD COLUMN IF NOT EXISTS fats_percent integer DEFAULT 20;

-- Add comment for documentation
COMMENT ON COLUMN public.champion_routine_settings.activity_level IS 'sedentary, light, moderate, active, very_active';