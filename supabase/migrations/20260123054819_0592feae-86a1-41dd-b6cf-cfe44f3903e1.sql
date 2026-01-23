
-- Fix the overly permissive INSERT policy on coach_content_purchases
-- Replace WITH CHECK (true) with proper validation

DROP POLICY IF EXISTS "System can insert purchases" ON public.coach_content_purchases;

-- Only allow inserts where the content exists and is published
CREATE POLICY "Authenticated users can purchase published content"
  ON public.coach_content_purchases
  FOR INSERT
  WITH CHECK (
    auth.uid() IS NOT NULL 
    AND user_id = auth.uid()
    AND content_id IN (
      SELECT id FROM public.coach_content WHERE is_published = true
    )
  );
