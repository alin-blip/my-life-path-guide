-- Tighten overly permissive SELECT policies flagged by the security scanner.

-- 1) wall_post_likes: likes are visible only on posts the viewer can already see
--    (mirrors the "View posts policy" on wall_posts — no behavior change).
DROP POLICY IF EXISTS "Likes visible to all authenticated" ON public.wall_post_likes;
CREATE POLICY "Likes visible to post viewers"
  ON public.wall_post_likes
  FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.wall_posts wp
      WHERE wp.id = post_id
        AND (wp.tribe_id IS NULL OR public.is_tribe_member(auth.uid(), wp.tribe_id))
    )
  );

-- 2) mind_shift_beliefs: global catalog content; only active entries are served.
DROP POLICY IF EXISTS "Beliefs readable by authenticated users" ON public.mind_shift_beliefs;
CREATE POLICY "Beliefs readable by authenticated users"
  ON public.mind_shift_beliefs
  FOR SELECT TO authenticated
  USING (active);

-- 3) mind_shift_distortions: global catalog content; only active entries are served.
DROP POLICY IF EXISTS "Distortions readable by authenticated users" ON public.mind_shift_distortions;
CREATE POLICY "Distortions readable by authenticated users"
  ON public.mind_shift_distortions
  FOR SELECT TO authenticated
  USING (active);