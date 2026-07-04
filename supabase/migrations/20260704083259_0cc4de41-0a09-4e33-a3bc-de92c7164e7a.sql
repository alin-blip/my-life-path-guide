
-- 1) coach_profiles: allow owner OR admin SELECT
DROP POLICY IF EXISTS "Users can view their own coach profile" ON public.coach_profiles;
CREATE POLICY "Owner or admin can view coach profile"
  ON public.coach_profiles
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id OR public.has_role(auth.uid(), 'admin'));

-- 2) tribe_invites: restrict enumeration to authenticated users only
DROP POLICY IF EXISTS "Anyone can view active invites by code" ON public.tribe_invites;
CREATE POLICY "Authenticated users can view active invites"
  ON public.tribe_invites
  FOR SELECT
  TO authenticated
  USING (is_active = true);

-- 3) Drop broad public storage SELECT policies. Public buckets still serve
--    direct object URLs without RLS, but bucket listing/enumeration is
--    disabled. Private access continues via existing owner-scoped policies.
DROP POLICY IF EXISTS "AI images are publicly readable" ON storage.objects;
DROP POLICY IF EXISTS "Feature images are publicly accessible" ON storage.objects;
DROP POLICY IF EXISTS "Anyone can view community media" ON storage.objects;

-- 4) Remove permissive USING(true)/WITH CHECK(true) on public tables
-- 4a) marriage_quiz_leads: keep public lead capture but add a minimal sanity check
DROP POLICY IF EXISTS "Anyone can submit a marriage quiz lead" ON public.marriage_quiz_leads;
CREATE POLICY "Anyone can submit a marriage quiz lead"
  ON public.marriage_quiz_leads
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (email IS NOT NULL AND length(email) > 3);

-- 4b) platform_course_referrals: restrict to service_role only
DROP POLICY IF EXISTS "Service role can insert referrals" ON public.platform_course_referrals;
DROP POLICY IF EXISTS "Service role can update referrals" ON public.platform_course_referrals;
CREATE POLICY "Service role can insert referrals"
  ON public.platform_course_referrals
  FOR INSERT
  TO service_role
  WITH CHECK (true);
CREATE POLICY "Service role can update referrals"
  ON public.platform_course_referrals
  FOR UPDATE
  TO service_role
  USING (true)
  WITH CHECK (true);

-- 5) Revoke EXECUTE on SECURITY DEFINER functions from anon/authenticated by
--    default; then re-grant only for functions truly meant to be called by
--    client roles (directly via RPC or transitively via RLS policies).
DO $$
DECLARE
  fn record;
BEGIN
  FOR fn IN
    SELECT p.oid, p.proname, pg_get_function_identity_arguments(p.oid) AS args
    FROM pg_proc p
    JOIN pg_namespace n ON n.oid = p.pronamespace
    WHERE n.nspname = 'public' AND p.prosecdef = true
  LOOP
    EXECUTE format(
      'REVOKE EXECUTE ON FUNCTION public.%I(%s) FROM PUBLIC, anon, authenticated',
      fn.proname, fn.args
    );
  END LOOP;
END$$;

-- Re-grant EXECUTE to authenticated for functions the app actually calls
GRANT EXECUTE ON FUNCTION public.has_role(uuid, app_role) TO authenticated;
GRANT EXECUTE ON FUNCTION public.is_tribe_member(uuid, uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.is_tribe_owner(uuid, uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.archive_user_tasks(text, text[]) TO authenticated;
GRANT EXECUTE ON FUNCTION public.clear_user_task_history(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_user_language_by_email(text) TO authenticated;
