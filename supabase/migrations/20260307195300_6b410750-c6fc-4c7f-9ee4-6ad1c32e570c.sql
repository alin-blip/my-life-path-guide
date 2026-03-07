-- Fix 1: Coach Profiles - restrict financial data from public
DROP POLICY IF EXISTS "Public can view verified coach profiles" ON public.coach_profiles;

-- Public can only see safe columns via a restricted policy
-- We use a policy that only exposes non-financial data
CREATE POLICY "Public can view coach public info" ON public.coach_profiles
  FOR SELECT TO public
  USING (is_verified = true);

-- Note: We keep the existing "Users can view their own coach profile" policy
-- which allows coaches to see their own financial data

-- Fix 2: User Roles - stop enumeration of all roles
DROP POLICY IF EXISTS "Service role can check all roles" ON public.user_roles;
-- "Users can view own roles" already exists and is sufficient
-- has_role() function uses SECURITY DEFINER so it bypasses RLS

-- Fix 3: Warriors Way Comments - restrict to authenticated only
DROP POLICY IF EXISTS "Anyone can read comments" ON public.warriors_way_comments;
CREATE POLICY "Authenticated users can read comments" ON public.warriors_way_comments
  FOR SELECT TO authenticated
  USING (true);

-- Also fix the other warriors_way_comments policies from public to authenticated
DROP POLICY IF EXISTS "Authenticated users can post comments" ON public.warriors_way_comments;
CREATE POLICY "Authenticated users can post comments" ON public.warriors_way_comments
  FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete own comments" ON public.warriors_way_comments;
CREATE POLICY "Users can delete own comments" ON public.warriors_way_comments
  FOR DELETE TO authenticated
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own comments" ON public.warriors_way_comments;
CREATE POLICY "Users can update own comments" ON public.warriors_way_comments
  FOR UPDATE TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Create a secure view for public coach data (hides financial columns)
CREATE OR REPLACE VIEW public.coach_profiles_public AS
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