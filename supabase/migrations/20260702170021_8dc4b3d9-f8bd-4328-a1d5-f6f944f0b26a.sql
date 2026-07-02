
-- 1. Fix user_roles INSERT: only admins can insert roles (prevent self-escalation)
DROP POLICY IF EXISTS "Only admins can manage roles" ON public.user_roles;
CREATE POLICY "Only admins can insert roles"
  ON public.user_roles FOR INSERT TO authenticated
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- 2. coach_profiles: remove public SELECT on full table (financial cols exposed).
-- Public reads go through the public view which excludes stripe_connect_id, commission_rate, total_earnings, pending_payout.
DROP POLICY IF EXISTS "Public can view coach public info" ON public.coach_profiles;

-- 3. leaderboard_profiles: remove public SELECT (exposes user_id UUIDs).
-- Public reads go through leaderboard_profiles_public view which masks user_id.
DROP POLICY IF EXISTS "Anyone can view visible leaderboard profiles" ON public.leaderboard_profiles;
-- Keep authenticated users able to see visible profiles (needed for messaging, etc.)
CREATE POLICY "Authenticated can view visible leaderboard profiles"
  ON public.leaderboard_profiles FOR SELECT TO authenticated
  USING (is_visible = true);

-- 4. warrior_power_results: allow anonymous submitters no further access;
-- ensure admin cannot self-assign role (already fixed via user_roles above).
-- Add automatic 30-day purge of anonymous PII via a scheduled function
CREATE OR REPLACE FUNCTION public.purge_anonymous_warrior_results()
RETURNS void
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  DELETE FROM public.warrior_power_results
  WHERE user_id IS NULL
    AND created_at < now() - interval '30 days';
$$;
REVOKE EXECUTE ON FUNCTION public.purge_anonymous_warrior_results() FROM anon, authenticated;
