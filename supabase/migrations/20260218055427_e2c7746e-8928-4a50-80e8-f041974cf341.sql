
-- Points log for tribe members
CREATE TABLE public.tribe_points (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  tribe_id UUID NOT NULL REFERENCES public.tribes(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  points INTEGER NOT NULL DEFAULT 0,
  reason TEXT NOT NULL,
  source_type TEXT NOT NULL DEFAULT 'manual',
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Badge definitions per tribe
CREATE TABLE public.tribe_badges (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  tribe_id UUID NOT NULL REFERENCES public.tribes(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  icon TEXT DEFAULT '🏆',
  points_required INTEGER DEFAULT 0,
  badge_type TEXT NOT NULL DEFAULT 'achievement',
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Badges earned by users
CREATE TABLE public.tribe_user_badges (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  badge_id UUID NOT NULL REFERENCES public.tribe_badges(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  earned_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(badge_id, user_id)
);

-- Enable RLS
ALTER TABLE public.tribe_points ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tribe_badges ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tribe_user_badges ENABLE ROW LEVEL SECURITY;

-- Points policies
CREATE POLICY "Tribe members can view points"
  ON public.tribe_points FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM public.tribe_members tm
    WHERE tm.tribe_id = tribe_points.tribe_id AND tm.user_id = auth.uid()
  ));

CREATE POLICY "Coach can award points"
  ON public.tribe_points FOR INSERT
  WITH CHECK (EXISTS (
    SELECT 1 FROM public.tribe_members tm
    WHERE tm.tribe_id = tribe_points.tribe_id AND tm.user_id = auth.uid() AND tm.role IN ('admin', 'moderator')
  ));

CREATE POLICY "Coach can delete points"
  ON public.tribe_points FOR DELETE
  USING (EXISTS (
    SELECT 1 FROM public.tribe_members tm
    WHERE tm.tribe_id = tribe_points.tribe_id AND tm.user_id = auth.uid() AND tm.role = 'admin'
  ));

-- Badges policies
CREATE POLICY "Tribe members can view badges"
  ON public.tribe_badges FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM public.tribe_members tm
    WHERE tm.tribe_id = tribe_badges.tribe_id AND tm.user_id = auth.uid()
  ));

CREATE POLICY "Coach can manage badges"
  ON public.tribe_badges FOR INSERT
  WITH CHECK (EXISTS (
    SELECT 1 FROM public.tribe_members tm
    WHERE tm.tribe_id = tribe_badges.tribe_id AND tm.user_id = auth.uid() AND tm.role = 'admin'
  ));

CREATE POLICY "Coach can update badges"
  ON public.tribe_badges FOR UPDATE
  USING (EXISTS (
    SELECT 1 FROM public.tribe_members tm
    WHERE tm.tribe_id = tribe_badges.tribe_id AND tm.user_id = auth.uid() AND tm.role = 'admin'
  ));

CREATE POLICY "Coach can delete badges"
  ON public.tribe_badges FOR DELETE
  USING (EXISTS (
    SELECT 1 FROM public.tribe_members tm
    WHERE tm.tribe_id = tribe_badges.tribe_id AND tm.user_id = auth.uid() AND tm.role = 'admin'
  ));

-- User badges policies
CREATE POLICY "Tribe members can view earned badges"
  ON public.tribe_user_badges FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM public.tribe_badges tb
    JOIN public.tribe_members tm ON tm.tribe_id = tb.tribe_id
    WHERE tb.id = tribe_user_badges.badge_id AND tm.user_id = auth.uid()
  ));

CREATE POLICY "Coach can award badges"
  ON public.tribe_user_badges FOR INSERT
  WITH CHECK (EXISTS (
    SELECT 1 FROM public.tribe_badges tb
    JOIN public.tribe_members tm ON tm.tribe_id = tb.tribe_id
    WHERE tb.id = tribe_user_badges.badge_id AND tm.user_id = auth.uid() AND tm.role IN ('admin', 'moderator')
  ));

CREATE POLICY "Coach can revoke badges"
  ON public.tribe_user_badges FOR DELETE
  USING (EXISTS (
    SELECT 1 FROM public.tribe_badges tb
    JOIN public.tribe_members tm ON tm.tribe_id = tb.tribe_id
    WHERE tb.id = tribe_user_badges.badge_id AND tm.user_id = auth.uid() AND tm.role = 'admin'
  ));
