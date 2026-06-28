CREATE OR REPLACE FUNCTION public.apply_mentalitate_session_to_axes()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  axis_name TEXT;
  signal_weight NUMERIC := 0.3;
BEGIN
  IF NEW.completed = true AND (OLD.completed IS DISTINCT FROM true) THEN
    IF NEW.axes_impacted IS NOT NULL THEN
      FOREACH axis_name IN ARRAY NEW.axes_impacted
      LOOP
        INSERT INTO public.mind_axis_scores (user_id, axis, score_healthy, updated_at, last_computed_at)
        VALUES (NEW.user_id, axis_name, LEAST(100, 50 + (signal_weight * 10))::numeric, now(), now())
        ON CONFLICT (user_id, axis) DO UPDATE
          SET score_healthy = LEAST(100, public.mind_axis_scores.score_healthy + (signal_weight * 5))::numeric,
              updated_at = now(),
              last_computed_at = now();
      END LOOP;
    END IF;
  END IF;
  RETURN NEW;
END;
$$;