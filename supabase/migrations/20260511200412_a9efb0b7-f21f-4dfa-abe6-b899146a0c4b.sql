-- Cleanup any existing duplicates first (keep the most recent row per logical key)
WITH ranked AS (
  SELECT id,
         ROW_NUMBER() OVER (
           PARTITION BY user_id, week_key, list_type, COALESCE(day_of_week, ''), title
           ORDER BY created_at DESC NULLS LAST, id DESC
         ) AS rn
  FROM public.hot_list_items
)
DELETE FROM public.hot_list_items h
USING ranked r
WHERE h.id = r.id AND r.rn > 1;

-- Performance index for week loads and delete-by-week
CREATE INDEX IF NOT EXISTS hot_list_items_user_week_idx
  ON public.hot_list_items (user_id, week_key, list_type);

-- Unique guard against duplicates (title-based since item_id may be absent)
CREATE UNIQUE INDEX IF NOT EXISTS hot_list_items_unique_per_week
  ON public.hot_list_items (user_id, week_key, list_type, COALESCE(day_of_week, ''), title);