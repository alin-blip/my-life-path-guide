
DROP VIEW IF EXISTS public.coach_profiles_public CASCADE;
DROP VIEW IF EXISTS public.leaderboard_profiles_public CASCADE;

CREATE VIEW public.coach_profiles_public
WITH (security_invoker = true) AS
SELECT id, user_id, display_name, bio, avatar_url, referral_code,
       commission_rate, total_referrals, is_verified, created_at
FROM public.coach_profiles
WHERE is_verified = true;

GRANT SELECT ON public.coach_profiles_public TO anon, authenticated;

CREATE VIEW public.leaderboard_profiles_public
WITH (security_invoker = true) AS
SELECT id, display_name, avatar_emoji, created_at
FROM public.leaderboard_profiles
WHERE is_visible = true;

GRANT SELECT ON public.leaderboard_profiles_public TO anon, authenticated;
