-- Fix remaining security issues

-- 1. Fix crm_activity_timeline: Restrict INSERT to authenticated users or admins
DROP POLICY IF EXISTS "Anyone can insert activities" ON public.crm_activity_timeline;

CREATE POLICY "Authenticated users can insert their own activities"
ON public.crm_activity_timeline
FOR INSERT
TO authenticated
WITH CHECK (user_id = auth.uid() OR public.has_role(auth.uid(), 'admin'::public.app_role));

CREATE POLICY "Anonymous tracking allowed with session_id"
ON public.crm_activity_timeline
FOR INSERT
TO anon
WITH CHECK (user_id IS NULL AND session_id IS NOT NULL);

-- 2. Fix checkout_events: Already has admin policy, need to make INSERT more restrictive
DROP POLICY IF EXISTS "Allow inserts from anyone" ON public.checkout_events;

CREATE POLICY "Allow checkout event tracking"
ON public.checkout_events
FOR INSERT
TO anon, authenticated
WITH CHECK (session_id IS NOT NULL OR user_id = auth.uid());