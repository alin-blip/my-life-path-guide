ALTER TABLE public.user_preferences
  ADD COLUMN IF NOT EXISTS vision_quiz_scores jsonb;