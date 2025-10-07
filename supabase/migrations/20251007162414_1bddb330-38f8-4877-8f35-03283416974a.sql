-- Fix RLS policies for profiles table
-- Drop existing policies
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
DROP POLICY IF EXISTS "Admins can view all profiles" ON public.profiles;

-- Create new secure policies
-- Users can view their own profile with email
CREATE POLICY "Users can view own profile"
ON public.profiles
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

-- Admins can view all profiles with emails
CREATE POLICY "Admins can view all profiles"
ON public.profiles
FOR SELECT
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role));

-- Fix RLS policies for subscribers table
-- Drop existing policies with OR email condition
DROP POLICY IF EXISTS "select_own_subscription" ON public.subscribers;
DROP POLICY IF EXISTS "update_own_subscription" ON public.subscribers;
DROP POLICY IF EXISTS "Authenticated users can create own subscription" ON public.subscribers;

-- Create new secure policies based only on user_id
CREATE POLICY "Users can view own subscription"
ON public.subscribers
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Users can update own subscription"
ON public.subscribers
FOR UPDATE
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Users can create own subscription"
ON public.subscribers
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

-- Admins can view all subscriptions
CREATE POLICY "Admins can view all subscriptions"
ON public.subscribers
FOR SELECT
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role));