
-- 1) coach_content_purchases: remove client INSERT; service role (edge function) handles inserts
DROP POLICY IF EXISTS "Authenticated users can purchase published content" ON public.coach_content_purchases;

-- 2) email_leads: drop the JWT-email-based read policy (admin policies remain)
DROP POLICY IF EXISTS "Users can read their own leads by email" ON public.email_leads;

-- 3) tribe_points: bound points value to a reasonable range
ALTER TABLE public.tribe_points DROP CONSTRAINT IF EXISTS tribe_points_amount_bounds;
ALTER TABLE public.tribe_points
  ADD CONSTRAINT tribe_points_amount_bounds
  CHECK (points BETWEEN -1000 AND 10000);
