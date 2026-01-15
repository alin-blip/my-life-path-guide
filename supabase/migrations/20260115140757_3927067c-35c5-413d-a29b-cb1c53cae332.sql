-- Fix warrior_power_results RLS policy to prevent data exposure
-- Remove the "OR user_id IS NULL" condition that exposes anonymous submissions to authenticated users

-- Drop the existing policy
DROP POLICY IF EXISTS "Users can view their own results" ON warrior_power_results;

-- Create a tighter policy that only allows users to see their own results
CREATE POLICY "Users can view only their own results"
ON warrior_power_results FOR SELECT
USING (auth.uid() = user_id);
