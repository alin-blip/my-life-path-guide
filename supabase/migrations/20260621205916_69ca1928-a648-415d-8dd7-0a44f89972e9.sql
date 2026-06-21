UPDATE public.weekly_planning
SET domino_title = (
  SELECT string_agg(kp->>'title', ' + ')
  FROM jsonb_array_elements(key_points) AS kp
),
week_goal = (
  SELECT string_agg(COALESCE(NULLIF(kp->>'objective',''), kp->>'title'), '; ')
  FROM jsonb_array_elements(key_points) AS kp
)
WHERE domino_title LIKE '[CONTEXT AUTOMAT]%' OR week_goal LIKE '[CONTEXT AUTOMAT]%';