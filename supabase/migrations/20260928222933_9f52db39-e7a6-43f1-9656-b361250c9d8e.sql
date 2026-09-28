DROP POLICY IF EXISTS "Anyone can view reactions" ON public.warriors_comment_reactions;
REVOKE SELECT ON public.warriors_comment_reactions FROM anon;
CREATE POLICY "Signed-in users can view reactions on visible comments"
  ON public.warriors_comment_reactions FOR SELECT TO authenticated
  USING (EXISTS (SELECT 1 FROM public.warriors_way_comments c WHERE c.id = comment_id));