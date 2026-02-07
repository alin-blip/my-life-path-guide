
-- Allow admins to delete any comment in warriors_way_comments
CREATE POLICY "Admins can delete any comment"
  ON public.warriors_way_comments FOR DELETE
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- Enable realtime for warriors_way_comments to support live chat
ALTER PUBLICATION supabase_realtime ADD TABLE public.warriors_way_comments;
