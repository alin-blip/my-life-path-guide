-- Fix the SECURITY DEFINER view issue by using SECURITY INVOKER
DROP VIEW IF EXISTS public.coach_profiles_public;
CREATE OR REPLACE VIEW public.coach_profiles_public 
WITH (security_invoker = true) AS
SELECT 
  id,
  user_id,
  display_name,
  bio,
  avatar_url,
  referral_code,
  is_verified,
  created_at
FROM public.coach_profiles
WHERE is_verified = true;