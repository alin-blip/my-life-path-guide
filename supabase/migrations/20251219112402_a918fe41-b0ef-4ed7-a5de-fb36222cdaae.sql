-- Create leaderboard profiles table for users who want to appear publicly
CREATE TABLE public.leaderboard_profiles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE,
  display_name TEXT NOT NULL,
  avatar_emoji TEXT DEFAULT '📚',
  is_visible BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.leaderboard_profiles ENABLE ROW LEVEL SECURITY;

-- Users can manage their own profile
CREATE POLICY "Users can manage their own leaderboard profile"
ON public.leaderboard_profiles
FOR ALL
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Everyone can view visible profiles (for leaderboard)
CREATE POLICY "Anyone can view visible leaderboard profiles"
ON public.leaderboard_profiles
FOR SELECT
USING (is_visible = true);

-- Create a view for leaderboard stats
CREATE OR REPLACE VIEW public.leaderboard_stats AS
SELECT 
  lp.user_id,
  lp.display_name,
  lp.avatar_emoji,
  COUNT(DISTINCT brp.page_number) as pages_read,
  COUNT(DISTINCT CASE WHEN brp.action_completed = true THEN brp.id END) as actions_completed,
  COUNT(DISTINCT brp.principle) as principles_touched,
  MAX(brp.read_at) as last_activity
FROM public.leaderboard_profiles lp
LEFT JOIN public.book_reading_progress brp ON brp.user_id = lp.user_id
WHERE lp.is_visible = true
GROUP BY lp.user_id, lp.display_name, lp.avatar_emoji
ORDER BY pages_read DESC, actions_completed DESC;

-- Grant access to the view
GRANT SELECT ON public.leaderboard_stats TO authenticated;
GRANT SELECT ON public.leaderboard_stats TO anon;