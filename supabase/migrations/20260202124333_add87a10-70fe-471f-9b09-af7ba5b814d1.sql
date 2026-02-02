-- 1. Actualizăm project_name NULL la string gol pentru consistență
UPDATE public.missions 
SET project_name = '' 
WHERE project_name IS NULL;

-- 2. Ștergem indexul vechi care folosește COALESCE
DROP INDEX IF EXISTS public.missions_user_category_type_period_project_idx;

-- 3. Creăm un CONSTRAINT unic pe coloane simple (nu funcție)
ALTER TABLE public.missions 
ADD CONSTRAINT missions_unique_user_category_type_period_project 
UNIQUE (user_id, category, mission_type, period, project_name);

-- 4. Setăm default pentru project_name să fie string gol în loc de NULL
ALTER TABLE public.missions 
ALTER COLUMN project_name SET DEFAULT '';