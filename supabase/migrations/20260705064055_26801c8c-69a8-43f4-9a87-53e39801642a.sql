DROP POLICY IF EXISTS "Authenticated users can view active invites" ON public.tribe_invites;

CREATE POLICY "Owners and members can view tribe invites"
  ON public.tribe_invites
  FOR SELECT
  TO authenticated
  USING (
    is_active = true
    AND (
      public.is_tribe_owner(auth.uid(), tribe_id)
      OR public.is_tribe_member(auth.uid(), tribe_id)
    )
  );