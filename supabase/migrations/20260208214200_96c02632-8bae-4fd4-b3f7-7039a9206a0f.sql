
ALTER TABLE public.wall_posts
  ADD COLUMN IF NOT EXISTS category TEXT DEFAULT 'general',
  ADD COLUMN IF NOT EXISTS source_context TEXT DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS source_label TEXT DEFAULT NULL;

-- Index for filtering by source_context (lesson pages)
CREATE INDEX IF NOT EXISTS idx_wall_posts_source_context ON public.wall_posts(source_context);

-- Index for filtering by category (community feed)
CREATE INDEX IF NOT EXISTS idx_wall_posts_category ON public.wall_posts(category);
