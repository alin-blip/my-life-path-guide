
-- Tribe posts (feed)
CREATE TABLE public.tribe_posts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  tribe_id UUID NOT NULL REFERENCES public.tribes(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  content TEXT NOT NULL,
  media_url TEXT,
  is_pinned BOOLEAN DEFAULT false,
  likes_count INTEGER DEFAULT 0,
  comments_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.tribe_posts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Members can view tribe posts" ON public.tribe_posts
  FOR SELECT USING (public.is_tribe_member(auth.uid(), tribe_id));

CREATE POLICY "Members can create posts" ON public.tribe_posts
  FOR INSERT WITH CHECK (auth.uid() = user_id AND public.is_tribe_member(auth.uid(), tribe_id));

CREATE POLICY "Authors can update own posts" ON public.tribe_posts
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Authors or owners can delete posts" ON public.tribe_posts
  FOR DELETE USING (auth.uid() = user_id OR public.is_tribe_owner(auth.uid(), tribe_id));

-- Tribe post likes
CREATE TABLE public.tribe_post_likes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  post_id UUID NOT NULL REFERENCES public.tribe_posts(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(post_id, user_id)
);

ALTER TABLE public.tribe_post_likes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Members can view likes" ON public.tribe_post_likes
  FOR SELECT USING (EXISTS (
    SELECT 1 FROM public.tribe_posts p WHERE p.id = post_id AND public.is_tribe_member(auth.uid(), p.tribe_id)
  ));

CREATE POLICY "Users can like" ON public.tribe_post_likes
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can unlike" ON public.tribe_post_likes
  FOR DELETE USING (auth.uid() = user_id);

-- Tribe post comments
CREATE TABLE public.tribe_post_comments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  post_id UUID NOT NULL REFERENCES public.tribe_posts(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.tribe_post_comments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Members can view comments" ON public.tribe_post_comments
  FOR SELECT USING (EXISTS (
    SELECT 1 FROM public.tribe_posts p WHERE p.id = post_id AND public.is_tribe_member(auth.uid(), p.tribe_id)
  ));

CREATE POLICY "Members can comment" ON public.tribe_post_comments
  FOR INSERT WITH CHECK (auth.uid() = user_id AND EXISTS (
    SELECT 1 FROM public.tribe_posts p WHERE p.id = post_id AND public.is_tribe_member(auth.uid(), p.tribe_id)
  ));

CREATE POLICY "Authors can delete own comments" ON public.tribe_post_comments
  FOR DELETE USING (auth.uid() = user_id);

-- Tribe invites
CREATE TABLE public.tribe_invites (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  tribe_id UUID NOT NULL REFERENCES public.tribes(id) ON DELETE CASCADE,
  invite_code TEXT NOT NULL UNIQUE,
  created_by UUID NOT NULL,
  max_uses INTEGER,
  uses_count INTEGER DEFAULT 0,
  expires_at TIMESTAMPTZ,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.tribe_invites ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Owners can manage invites" ON public.tribe_invites
  FOR ALL USING (public.is_tribe_owner(auth.uid(), tribe_id));

CREATE POLICY "Anyone can view active invites by code" ON public.tribe_invites
  FOR SELECT USING (is_active = true);

-- Tribe join requests
CREATE TABLE public.tribe_join_requests (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  tribe_id UUID NOT NULL REFERENCES public.tribes(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  message TEXT,
  reviewed_by UUID,
  reviewed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(tribe_id, user_id)
);

ALTER TABLE public.tribe_join_requests ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own requests" ON public.tribe_join_requests
  FOR SELECT USING (auth.uid() = user_id OR public.is_tribe_owner(auth.uid(), tribe_id));

CREATE POLICY "Users can create requests" ON public.tribe_join_requests
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Owners can update requests" ON public.tribe_join_requests
  FOR UPDATE USING (public.is_tribe_owner(auth.uid(), tribe_id));

-- Triggers for post like/comment counts
CREATE OR REPLACE FUNCTION public.update_tribe_post_likes_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE public.tribe_posts SET likes_count = likes_count + 1 WHERE id = NEW.post_id;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE public.tribe_posts SET likes_count = likes_count - 1 WHERE id = OLD.post_id;
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE TRIGGER trigger_tribe_post_likes_count
AFTER INSERT OR DELETE ON public.tribe_post_likes
FOR EACH ROW EXECUTE FUNCTION public.update_tribe_post_likes_count();

CREATE OR REPLACE FUNCTION public.update_tribe_post_comments_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE public.tribe_posts SET comments_count = comments_count + 1 WHERE id = NEW.post_id;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE public.tribe_posts SET comments_count = comments_count - 1 WHERE id = OLD.post_id;
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE TRIGGER trigger_tribe_post_comments_count
AFTER INSERT OR DELETE ON public.tribe_post_comments
FOR EACH ROW EXECUTE FUNCTION public.update_tribe_post_comments_count();

-- Add requires_approval to tribes
ALTER TABLE public.tribes ADD COLUMN IF NOT EXISTS requires_approval BOOLEAN DEFAULT false;

-- Enable realtime for posts
ALTER PUBLICATION supabase_realtime ADD TABLE public.tribe_posts;
