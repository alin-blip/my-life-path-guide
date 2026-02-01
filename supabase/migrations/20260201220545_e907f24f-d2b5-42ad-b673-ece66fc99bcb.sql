-- Add columns for habit-goal integration
ALTER TABLE public.daily_habits 
ADD COLUMN IF NOT EXISTS source_mission_id UUID REFERENCES public.missions(id) ON DELETE SET NULL,
ADD COLUMN IF NOT EXISTS sync_to_routine BOOLEAN DEFAULT true;

-- Add index for faster lookups
CREATE INDEX IF NOT EXISTS idx_daily_habits_source_mission ON public.daily_habits(source_mission_id) WHERE source_mission_id IS NOT NULL;

-- Comment for documentation
COMMENT ON COLUMN public.daily_habits.source_mission_id IS 'Links habit to the mission it was created from (via Goal Wizard)';
COMMENT ON COLUMN public.daily_habits.sync_to_routine IS 'Whether this habit should appear in Warrior Routine automatically';