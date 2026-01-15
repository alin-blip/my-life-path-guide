-- Fix overly permissive INSERT policy - restrict to valid submissions only
DROP POLICY IF EXISTS "Anyone can insert results" ON public.warrior_power_results;

CREATE POLICY "Anyone can insert their results" 
ON public.warrior_power_results 
FOR INSERT 
WITH CHECK (
  email IS NOT NULL AND 
  email <> '' AND 
  scores IS NOT NULL
);