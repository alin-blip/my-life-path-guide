
-- Fix 1: wall_post_comments — restrict SELECT to tribe members / public tribes / post author.
DROP POLICY IF EXISTS "Comments visible to post viewers" ON public.wall_post_comments;
CREATE POLICY "Comments visible to post viewers"
ON public.wall_post_comments
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.wall_posts wp
    WHERE wp.id = wall_post_comments.post_id
      AND (
        wp.tribe_id IS NULL
        OR wp.user_id = auth.uid()
        OR public.has_role(auth.uid(), 'admin'::app_role)
        OR EXISTS (
          SELECT 1 FROM public.tribes t
          WHERE t.id = wp.tribe_id
            AND (t.is_public = true OR public.is_tribe_member(auth.uid(), t.id))
        )
      )
  )
);

-- Fix 2: tribe_members INSERT — user cannot self-assign owner/admin/moderator role.
DROP POLICY IF EXISTS "Tribe members: insert" ON public.tribe_members;
CREATE POLICY "Tribe members: insert"
ON public.tribe_members
FOR INSERT
TO authenticated
WITH CHECK (
  auth.uid() = user_id
  AND role = 'member'
  AND (
    public.has_role(auth.uid(), 'admin'::app_role)
    OR EXISTS (
      SELECT 1 FROM public.tribes t
      WHERE t.id = tribe_members.tribe_id
        AND (t.is_public = true OR t.created_by = auth.uid())
    )
  )
);
