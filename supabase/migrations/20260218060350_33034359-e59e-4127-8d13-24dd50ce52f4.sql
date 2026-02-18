
-- Fix RLS policies for gamification tables: add 'owner' role alongside 'admin'

-- tribe_points: INSERT
DROP POLICY IF EXISTS "Coach can award points" ON public.tribe_points;
CREATE POLICY "Coach can award points" ON public.tribe_points
  FOR INSERT TO authenticated
  WITH CHECK (EXISTS (
    SELECT 1 FROM public.tribe_members tm
    WHERE tm.tribe_id = tribe_points.tribe_id 
      AND tm.user_id = auth.uid() 
      AND tm.role IN ('admin', 'owner')
  ));

-- tribe_badges: INSERT
DROP POLICY IF EXISTS "Coach can create badges" ON public.tribe_badges;
CREATE POLICY "Coach can create badges" ON public.tribe_badges
  FOR INSERT TO authenticated
  WITH CHECK (EXISTS (
    SELECT 1 FROM public.tribe_members tm
    WHERE tm.tribe_id = tribe_badges.tribe_id 
      AND tm.user_id = auth.uid() 
      AND tm.role IN ('admin', 'owner')
  ));

-- tribe_badges: UPDATE
DROP POLICY IF EXISTS "Coach can update badges" ON public.tribe_badges;
CREATE POLICY "Coach can update badges" ON public.tribe_badges
  FOR UPDATE TO authenticated
  USING (EXISTS (
    SELECT 1 FROM public.tribe_members tm
    WHERE tm.tribe_id = tribe_badges.tribe_id 
      AND tm.user_id = auth.uid() 
      AND tm.role IN ('admin', 'owner')
  ));

-- tribe_badges: DELETE
DROP POLICY IF EXISTS "Coach can delete badges" ON public.tribe_badges;
CREATE POLICY "Coach can delete badges" ON public.tribe_badges
  FOR DELETE TO authenticated
  USING (EXISTS (
    SELECT 1 FROM public.tribe_members tm
    WHERE tm.tribe_id = tribe_badges.tribe_id 
      AND tm.user_id = auth.uid() 
      AND tm.role IN ('admin', 'owner')
  ));

-- tribe_user_badges: INSERT
DROP POLICY IF EXISTS "Coach can award badges" ON public.tribe_user_badges;
CREATE POLICY "Coach can award badges" ON public.tribe_user_badges
  FOR INSERT TO authenticated
  WITH CHECK (EXISTS (
    SELECT 1 FROM public.tribe_user_badges tub
    JOIN public.tribe_badges tb ON tb.id = tub.badge_id
    JOIN public.tribe_members tm ON tm.tribe_id = tb.tribe_id
    WHERE tm.user_id = auth.uid() 
      AND tm.role IN ('admin', 'owner')
  ));
