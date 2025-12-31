-- Drop the existing check constraint and recreate it with 'quarterly' type included
ALTER TABLE public.missions DROP CONSTRAINT IF EXISTS missions_mission_type_check;

ALTER TABLE public.missions ADD CONSTRAINT missions_mission_type_check 
CHECK (mission_type IN ('monthly', 'annual', 'weekly', 'quarterly'));