-- =====================================================
-- CRITICAL SECURITY FIX: Restrict profiles table access
-- =====================================================
-- ISSUE: Profiles table exposes emails publicly
-- FIX: Restrict to owner + admins only

DROP POLICY IF EXISTS "Profiles are viewable by everyone" ON public.profiles;

-- Users can view their own complete profile
CREATE POLICY "Users can view own profile"
ON public.profiles
FOR SELECT
USING (auth.uid() = user_id);

-- Admins can view all profiles  
CREATE POLICY "Admins can view all profiles"
ON public.profiles
FOR SELECT
USING (has_role(auth.uid(), 'admin'::app_role));

-- =====================================================
-- CRITICAL SECURITY FIX: Restrict subscribers table inserts
-- =====================================================
-- ISSUE: Anyone can insert fake subscriptions
-- FIX: Restrict to authenticated users only

DROP POLICY IF EXISTS "insert_subscription" ON public.subscribers;

-- Only authenticated users can create their own subscription
CREATE POLICY "Authenticated users can create own subscription"
ON public.subscribers
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id OR auth.email() = email);