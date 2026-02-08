
-- ============================================
-- 1. Auto-enroll trigger for NEW users
-- ============================================
CREATE OR REPLACE FUNCTION public.handle_new_user_community()
RETURNS trigger AS $$
BEGIN
  -- Create leaderboard profile
  INSERT INTO public.leaderboard_profiles (user_id, display_name, is_visible)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'display_name', split_part(NEW.email, '@', 1)),
    true
  )
  ON CONFLICT (user_id) DO NOTHING;

  -- Add to main tribe (Warrior Tribe)
  INSERT INTO public.tribe_members (tribe_id, user_id, role)
  VALUES ('07825fb0-4d6c-4716-b2f3-27a1708cf680', NEW.id, 'member')
  ON CONFLICT (tribe_id, user_id) DO NOTHING;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Drop if exists to avoid duplicate trigger
DROP TRIGGER IF EXISTS on_auth_user_created_community ON auth.users;

CREATE TRIGGER on_auth_user_created_community
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user_community();

-- ============================================
-- 2. Direct Messages table
-- ============================================
CREATE TABLE IF NOT EXISTS public.direct_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sender_id UUID NOT NULL,
  receiver_id UUID NOT NULL,
  content TEXT NOT NULL,
  is_read BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.direct_messages ENABLE ROW LEVEL SECURITY;

-- Users can read messages they sent or received
CREATE POLICY "Users can read own direct messages"
  ON public.direct_messages FOR SELECT
  USING (auth.uid() = sender_id OR auth.uid() = receiver_id);

-- Users can send messages
CREATE POLICY "Users can send direct messages"
  ON public.direct_messages FOR INSERT
  WITH CHECK (auth.uid() = sender_id);

-- Users can mark messages as read (only receiver)
CREATE POLICY "Users can update own received messages"
  ON public.direct_messages FOR UPDATE
  USING (auth.uid() = receiver_id);

-- Enable realtime
ALTER PUBLICATION supabase_realtime ADD TABLE public.direct_messages;

-- Performance indexes
CREATE INDEX IF NOT EXISTS idx_dm_sender ON public.direct_messages(sender_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_dm_receiver ON public.direct_messages(receiver_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_dm_receiver_unread ON public.direct_messages(receiver_id, is_read) WHERE is_read = false;
