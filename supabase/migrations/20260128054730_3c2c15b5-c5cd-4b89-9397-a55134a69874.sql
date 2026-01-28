-- =====================================================
-- SECURITY FIX: Complete subscribers RLS cleanup
-- =====================================================

-- Drop ALL existing policies on subscribers to start fresh
DROP POLICY IF EXISTS "Anyone can view subscribers" ON public.subscribers;
DROP POLICY IF EXISTS "Public read access" ON public.subscribers;
DROP POLICY IF EXISTS "Users can view own subscription" ON public.subscribers;
DROP POLICY IF EXISTS "Admins can view all subscriptions" ON public.subscribers;
DROP POLICY IF EXISTS "Service role can manage subscriptions" ON public.subscribers;

-- Create secure policies for subscribers
CREATE POLICY "Users can view own subscription" 
ON public.subscribers 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all subscriptions" 
ON public.subscribers 
FOR SELECT 
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Service role can manage subscriptions" 
ON public.subscribers 
FOR ALL 
USING (auth.role() = 'service_role');

-- =====================================================
-- NORMALIZE: Fix subscription_tier case inconsistency
-- =====================================================
UPDATE public.subscribers 
SET subscription_tier = 'Pro' 
WHERE LOWER(subscription_tier) = 'pro' AND subscription_tier != 'Pro';