-- Add position column to missions table for ordering
ALTER TABLE public.missions 
ADD COLUMN IF NOT EXISTS position integer DEFAULT 0;

-- Create index for efficient ordering queries
CREATE INDEX IF NOT EXISTS idx_missions_parent_position 
ON public.missions(parent_mission_id, position);