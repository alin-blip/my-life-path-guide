-- Fix overly permissive RLS policies for likes and comments

-- Drop the permissive policies
DROP POLICY IF EXISTS "Users can like posts" ON public.wall_post_likes;
DROP POLICY IF EXISTS "Users can comment" ON public.wall_post_comments;
DROP POLICY IF EXISTS "Users can update own comments" ON public.wall_post_comments;

-- Recreate with proper restrictions (user can only like/comment on posts they can see)
CREATE POLICY "Users can like visible posts" ON public.wall_post_likes
  FOR INSERT TO authenticated WITH CHECK (
    auth.uid() = user_id AND
    EXISTS (
      SELECT 1 FROM public.wall_posts wp 
      WHERE wp.id = post_id AND (
        wp.tribe_id IS NULL OR
        auth.uid() IN (SELECT tm.user_id FROM public.tribe_members tm WHERE tm.tribe_id = wp.tribe_id)
      )
    )
  );

CREATE POLICY "Users can comment on visible posts" ON public.wall_post_comments
  FOR INSERT TO authenticated WITH CHECK (
    auth.uid() = user_id AND
    EXISTS (
      SELECT 1 FROM public.wall_posts wp 
      WHERE wp.id = post_id AND (
        wp.tribe_id IS NULL OR
        auth.uid() IN (SELECT tm.user_id FROM public.tribe_members tm WHERE tm.tribe_id = wp.tribe_id)
      )
    )
  );

CREATE POLICY "Users can update own comments on visible posts" ON public.wall_post_comments
  FOR UPDATE USING (
    auth.uid() = user_id OR public.has_role(auth.uid(), 'admin')
  );