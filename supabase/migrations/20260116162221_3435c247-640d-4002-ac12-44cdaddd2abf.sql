-- =============================================
-- BROTHERHOOD COMMUNITY TABLES
-- =============================================

-- Tribes (Grupuri/Comunități)
CREATE TABLE public.tribes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  avatar_url TEXT,
  cover_image_url TEXT,
  created_by UUID NOT NULL,
  is_public BOOLEAN DEFAULT true,
  member_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Tribe Members
CREATE TABLE public.tribe_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tribe_id UUID REFERENCES public.tribes(id) ON DELETE CASCADE NOT NULL,
  user_id UUID NOT NULL,
  role TEXT DEFAULT 'member' CHECK (role IN ('owner', 'admin', 'moderator', 'member')),
  joined_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(tribe_id, user_id)
);

-- Wall Posts (Feed Social)
CREATE TABLE public.wall_posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  tribe_id UUID REFERENCES public.tribes(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  media_urls TEXT[],
  likes_count INTEGER DEFAULT 0,
  comments_count INTEGER DEFAULT 0,
  is_pinned BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Post Likes
CREATE TABLE public.wall_post_likes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id UUID REFERENCES public.wall_posts(id) ON DELETE CASCADE NOT NULL,
  user_id UUID NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(post_id, user_id)
);

-- Post Comments
CREATE TABLE public.wall_post_comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id UUID REFERENCES public.wall_posts(id) ON DELETE CASCADE NOT NULL,
  user_id UUID NOT NULL,
  content TEXT NOT NULL,
  parent_comment_id UUID REFERENCES public.wall_post_comments(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Brotherhood Chat Messages (Real-time)
CREATE TABLE public.brotherhood_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tribe_id UUID REFERENCES public.tribes(id) ON DELETE CASCADE,
  sender_id UUID NOT NULL,
  receiver_id UUID,
  content TEXT NOT NULL,
  message_type TEXT DEFAULT 'text' CHECK (message_type IN ('text', 'image', 'file', 'system')),
  media_url TEXT,
  is_read BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Push Notifications
CREATE TABLE public.push_notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sender_id UUID NOT NULL,
  recipient_id UUID,
  tribe_id UUID REFERENCES public.tribes(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  notification_type TEXT DEFAULT 'general',
  is_read BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- User Activity Log (pentru Admin tracking)
CREATE TABLE public.user_activity_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  activity_type TEXT NOT NULL,
  activity_data JSONB,
  page_path TEXT,
  ip_address TEXT,
  user_agent TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Admin Impersonation Audit Log
CREATE TABLE public.admin_impersonation_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_id UUID NOT NULL,
  target_user_id UUID NOT NULL,
  action TEXT NOT NULL CHECK (action IN ('start', 'end')),
  reason TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- =============================================
-- INDEXES FOR PERFORMANCE
-- =============================================
CREATE INDEX idx_tribe_members_user ON public.tribe_members(user_id);
CREATE INDEX idx_tribe_members_tribe ON public.tribe_members(tribe_id);
CREATE INDEX idx_wall_posts_user ON public.wall_posts(user_id);
CREATE INDEX idx_wall_posts_tribe ON public.wall_posts(tribe_id);
CREATE INDEX idx_wall_posts_created ON public.wall_posts(created_at DESC);
CREATE INDEX idx_brotherhood_messages_tribe ON public.brotherhood_messages(tribe_id);
CREATE INDEX idx_brotherhood_messages_sender ON public.brotherhood_messages(sender_id);
CREATE INDEX idx_brotherhood_messages_created ON public.brotherhood_messages(created_at DESC);
CREATE INDEX idx_push_notifications_recipient ON public.push_notifications(recipient_id);
CREATE INDEX idx_user_activity_log_user ON public.user_activity_log(user_id);
CREATE INDEX idx_user_activity_log_created ON public.user_activity_log(created_at DESC);
CREATE INDEX idx_admin_impersonation_admin ON public.admin_impersonation_log(admin_id);

-- =============================================
-- ENABLE ROW LEVEL SECURITY
-- =============================================
ALTER TABLE public.tribes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tribe_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.wall_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.wall_post_likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.wall_post_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.brotherhood_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.push_notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_activity_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_impersonation_log ENABLE ROW LEVEL SECURITY;

-- =============================================
-- RLS POLICIES
-- =============================================

-- TRIBES: Public tribes visible to all, private only to members
CREATE POLICY "Public tribes visible to all" ON public.tribes
  FOR SELECT USING (is_public = true OR auth.uid() IN (
    SELECT user_id FROM public.tribe_members WHERE tribe_id = id
  ) OR public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Authenticated users can create tribes" ON public.tribes
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Tribe owners and admins can update" ON public.tribes
  FOR UPDATE USING (
    auth.uid() = created_by OR 
    auth.uid() IN (SELECT user_id FROM public.tribe_members WHERE tribe_id = id AND role IN ('owner', 'admin')) OR
    public.has_role(auth.uid(), 'admin')
  );

CREATE POLICY "Tribe owners can delete" ON public.tribes
  FOR DELETE USING (auth.uid() = created_by OR public.has_role(auth.uid(), 'admin'));

-- TRIBE MEMBERS
CREATE POLICY "Members visible to tribe members" ON public.tribe_members
  FOR SELECT USING (
    auth.uid() IN (SELECT user_id FROM public.tribe_members tm WHERE tm.tribe_id = tribe_id) OR
    public.has_role(auth.uid(), 'admin')
  );

CREATE POLICY "Users can join public tribes" ON public.tribe_members
  FOR INSERT TO authenticated WITH CHECK (
    auth.uid() = user_id AND
    (EXISTS (SELECT 1 FROM public.tribes t WHERE t.id = tribe_id AND t.is_public = true) OR
    public.has_role(auth.uid(), 'admin'))
  );

CREATE POLICY "Users can leave tribes" ON public.tribe_members
  FOR DELETE USING (auth.uid() = user_id OR public.has_role(auth.uid(), 'admin'));

-- WALL POSTS
CREATE POLICY "Posts visible to tribe members or public" ON public.wall_posts
  FOR SELECT USING (
    tribe_id IS NULL OR
    auth.uid() IN (SELECT user_id FROM public.tribe_members WHERE tribe_id = wall_posts.tribe_id) OR
    public.has_role(auth.uid(), 'admin')
  );

CREATE POLICY "Authenticated users can create posts" ON public.wall_posts
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own posts" ON public.wall_posts
  FOR UPDATE USING (auth.uid() = user_id OR public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Users can delete own posts" ON public.wall_posts
  FOR DELETE USING (auth.uid() = user_id OR public.has_role(auth.uid(), 'admin'));

-- WALL POST LIKES
CREATE POLICY "Likes visible to all authenticated" ON public.wall_post_likes
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Users can like posts" ON public.wall_post_likes
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can unlike" ON public.wall_post_likes
  FOR DELETE USING (auth.uid() = user_id);

-- WALL POST COMMENTS
CREATE POLICY "Comments visible to post viewers" ON public.wall_post_comments
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Users can comment" ON public.wall_post_comments
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own comments" ON public.wall_post_comments
  FOR UPDATE USING (auth.uid() = user_id OR public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Users can delete own comments" ON public.wall_post_comments
  FOR DELETE USING (auth.uid() = user_id OR public.has_role(auth.uid(), 'admin'));

-- BROTHERHOOD MESSAGES
CREATE POLICY "Messages visible to participants" ON public.brotherhood_messages
  FOR SELECT USING (
    auth.uid() = sender_id OR 
    auth.uid() = receiver_id OR
    (tribe_id IS NOT NULL AND auth.uid() IN (SELECT user_id FROM public.tribe_members WHERE tribe_id = brotherhood_messages.tribe_id)) OR
    public.has_role(auth.uid(), 'admin')
  );

CREATE POLICY "Users can send messages" ON public.brotherhood_messages
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = sender_id);

CREATE POLICY "Users can delete own messages" ON public.brotherhood_messages
  FOR DELETE USING (auth.uid() = sender_id OR public.has_role(auth.uid(), 'admin'));

-- PUSH NOTIFICATIONS
CREATE POLICY "Users see own notifications" ON public.push_notifications
  FOR SELECT USING (auth.uid() = recipient_id OR public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can create notifications" ON public.push_notifications
  FOR INSERT TO authenticated WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Users can mark as read" ON public.push_notifications
  FOR UPDATE USING (auth.uid() = recipient_id OR public.has_role(auth.uid(), 'admin'));

-- USER ACTIVITY LOG (Admin only read, system insert)
CREATE POLICY "Admins can view activity" ON public.user_activity_log
  FOR SELECT USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "System can insert activity" ON public.user_activity_log
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

-- ADMIN IMPERSONATION LOG (Admin only)
CREATE POLICY "Admins can view impersonation log" ON public.admin_impersonation_log
  FOR SELECT USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can log impersonation" ON public.admin_impersonation_log
  FOR INSERT TO authenticated WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- =============================================
-- ENABLE REALTIME
-- =============================================
ALTER PUBLICATION supabase_realtime ADD TABLE public.brotherhood_messages;
ALTER PUBLICATION supabase_realtime ADD TABLE public.wall_posts;
ALTER PUBLICATION supabase_realtime ADD TABLE public.push_notifications;

-- =============================================
-- TRIGGERS FOR UPDATED_AT
-- =============================================
CREATE TRIGGER update_tribes_updated_at
  BEFORE UPDATE ON public.tribes
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_wall_posts_updated_at
  BEFORE UPDATE ON public.wall_posts
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_wall_post_comments_updated_at
  BEFORE UPDATE ON public.wall_post_comments
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- =============================================
-- FUNCTION: Update tribe member count
-- =============================================
CREATE OR REPLACE FUNCTION public.update_tribe_member_count()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE public.tribes SET member_count = member_count + 1 WHERE id = NEW.tribe_id;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE public.tribes SET member_count = member_count - 1 WHERE id = OLD.tribe_id;
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$;

CREATE TRIGGER trigger_update_tribe_member_count
  AFTER INSERT OR DELETE ON public.tribe_members
  FOR EACH ROW EXECUTE FUNCTION public.update_tribe_member_count();

-- =============================================
-- FUNCTION: Update post likes count
-- =============================================
CREATE OR REPLACE FUNCTION public.update_post_likes_count()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE public.wall_posts SET likes_count = likes_count + 1 WHERE id = NEW.post_id;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE public.wall_posts SET likes_count = likes_count - 1 WHERE id = OLD.post_id;
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$;

CREATE TRIGGER trigger_update_post_likes_count
  AFTER INSERT OR DELETE ON public.wall_post_likes
  FOR EACH ROW EXECUTE FUNCTION public.update_post_likes_count();

-- =============================================
-- FUNCTION: Update post comments count
-- =============================================
CREATE OR REPLACE FUNCTION public.update_post_comments_count()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE public.wall_posts SET comments_count = comments_count + 1 WHERE id = NEW.post_id;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE public.wall_posts SET comments_count = comments_count - 1 WHERE id = OLD.post_id;
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$;

CREATE TRIGGER trigger_update_post_comments_count
  AFTER INSERT OR DELETE ON public.wall_post_comments
  FOR EACH ROW EXECUTE FUNCTION public.update_post_comments_count();