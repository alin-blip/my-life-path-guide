-- Fix permissive RLS policy on referrals insert
-- Drop the overly permissive policy and create a more restrictive one

DROP POLICY IF EXISTS "System can insert referrals" ON public.referrals;

-- Only allow insert if the referral is for the current user (they're being referred)
-- OR if it's a coach creating a referral for a new user they're tracking
CREATE POLICY "Users can be referred"
ON public.referrals FOR INSERT TO authenticated
WITH CHECK (
  referred_user_id = auth.uid()
  OR coach_id IN (SELECT id FROM public.coach_profiles WHERE user_id = auth.uid())
);