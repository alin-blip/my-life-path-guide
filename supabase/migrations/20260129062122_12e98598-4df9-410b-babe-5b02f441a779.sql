-- 1. Elimină constraint-ul existent restrictiv
ALTER TABLE public.daily_habits 
DROP CONSTRAINT IF EXISTS daily_habits_category_check;

-- 2. Adaugă constraint nou mai permisiv
-- Permite: a-z, 0-9, underscore, dash
-- Minim 2 caractere, maxim 50
ALTER TABLE public.daily_habits 
ADD CONSTRAINT daily_habits_category_valid 
CHECK (
  category ~ '^[a-z0-9_-]+$' 
  AND length(category) >= 2 
  AND length(category) <= 50
);