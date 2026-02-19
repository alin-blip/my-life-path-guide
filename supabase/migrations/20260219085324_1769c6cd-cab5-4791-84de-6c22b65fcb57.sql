
-- Drop triggers on tribe_post_likes (notification + count)
DROP TRIGGER IF EXISTS on_tribe_post_like_notify ON public.tribe_post_likes;
DROP TRIGGER IF EXISTS update_tribe_post_likes_count ON public.tribe_post_likes;

-- Drop triggers on tribe_post_comments (notification + count)
DROP TRIGGER IF EXISTS on_tribe_post_comment_notify ON public.tribe_post_comments;
DROP TRIGGER IF EXISTS update_tribe_post_comments_count ON public.tribe_post_comments;

-- Drop the three tribe post tables (comments and likes first due to FK)
DROP TABLE IF EXISTS public.tribe_post_comments;
DROP TABLE IF EXISTS public.tribe_post_likes;
DROP TABLE IF EXISTS public.tribe_posts;

-- Drop the now-orphaned trigger functions
DROP FUNCTION IF EXISTS public.update_tribe_post_likes_count();
DROP FUNCTION IF EXISTS public.update_tribe_post_comments_count();
DROP FUNCTION IF EXISTS public.notify_on_tribe_post_like();
DROP FUNCTION IF EXISTS public.notify_on_tribe_post_comment();
