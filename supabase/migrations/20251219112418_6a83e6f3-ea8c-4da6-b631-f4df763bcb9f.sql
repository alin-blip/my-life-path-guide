-- Fix security definer view by recreating with SECURITY INVOKER
DROP VIEW IF EXISTS public.leaderboard_stats;

CREATE VIEW public.leaderboard_stats 
WITH (security_invoker = true) AS
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