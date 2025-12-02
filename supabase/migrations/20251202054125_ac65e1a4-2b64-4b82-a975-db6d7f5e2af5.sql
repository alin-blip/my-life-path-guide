-- Allow current_principle to be 0 for document review phase
ALTER TABLE public.napoleon_hill_projects 
  ALTER COLUMN current_principle SET DEFAULT 0;

-- Add check constraint to allow 0-14
ALTER TABLE public.napoleon_hill_projects
  DROP CONSTRAINT IF EXISTS napoleon_hill_projects_current_principle_check;

ALTER TABLE public.napoleon_hill_projects
  ADD CONSTRAINT napoleon_hill_projects_current_principle_check 
  CHECK (current_principle >= 0 AND current_principle <= 14);