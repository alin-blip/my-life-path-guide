
-- 1. search_path hardening for email queue helpers
ALTER FUNCTION public.enqueue_email(text, jsonb) SET search_path = public, pg_temp;
ALTER FUNCTION public.read_email_batch(text, integer, integer) SET search_path = public, pg_temp;
ALTER FUNCTION public.delete_email(text, bigint) SET search_path = public, pg_temp;
ALTER FUNCTION public.move_to_dlq(text, text, bigint, jsonb) SET search_path = public, pg_temp;

-- 2. Scope always-true service policies to service_role (behavior unchanged)
DROP POLICY IF EXISTS "Service role can manage rate limits" ON public.rate_limits;
CREATE POLICY "Service role can manage rate limits" ON public.rate_limits
  FOR ALL TO service_role USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Service role full access to email_sequence_log" ON public.email_sequence_log;
CREATE POLICY "Service role full access to email_sequence_log" ON public.email_sequence_log
  FOR ALL TO service_role USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Service role manages subscriptions" ON public.subscribers;
CREATE POLICY "Service role manages subscriptions" ON public.subscribers
  FOR ALL TO service_role USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Service role can insert referrals" ON public.platform_course_referrals;
CREATE POLICY "Service role can insert referrals" ON public.platform_course_referrals
  FOR INSERT TO service_role WITH CHECK (true);

DROP POLICY IF EXISTS "Service role can update referrals" ON public.platform_course_referrals;
CREATE POLICY "Service role can update referrals" ON public.platform_course_referrals
  FOR UPDATE TO service_role USING (true);

-- 3. ai_generated_images: owner can view their own
CREATE POLICY "Users can view own ai generated images"
  ON public.ai_generated_images
  FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

-- 4. community-media: owner UPDATE + upload confined to user's folder
DROP POLICY IF EXISTS "Users can update their own community media" ON storage.objects;
CREATE POLICY "Users can update their own community media"
  ON storage.objects
  FOR UPDATE TO authenticated
  USING (bucket_id = 'community-media' AND auth.uid()::text = (storage.foldername(name))[1])
  WITH CHECK (bucket_id = 'community-media' AND auth.uid()::text = (storage.foldername(name))[1]);

DROP POLICY IF EXISTS "Authenticated users can upload community media" ON storage.objects;
CREATE POLICY "Users upload community media to own folder"
  ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'community-media' AND auth.uid()::text = (storage.foldername(name))[1]);
