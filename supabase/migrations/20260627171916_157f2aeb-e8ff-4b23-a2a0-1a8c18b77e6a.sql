
CREATE TABLE public.mentalitate_stack_sessions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users ON DELETE CASCADE,
  mode TEXT NOT NULL DEFAULT 'daily' CHECK (mode IN ('daily', 'deep_dive')),
  deep_dive_axis TEXT,
  phase_answers JSONB NOT NULL DEFAULT '{}'::jsonb,
  distortion_detected TEXT,
  reframe TEXT,
  action TEXT,
  axes_impacted TEXT[] NOT NULL DEFAULT '{}',
  vina_score INTEGER CHECK (vina_score IS NULL OR (vina_score >= 0 AND vina_score <= 10)),
  control_score INTEGER CHECK (control_score IS NULL OR (control_score >= 0 AND control_score <= 10)),
  pattern_summary TEXT,
  completed BOOLEAN NOT NULL DEFAULT false,
  domino_task_id UUID,
  source TEXT NOT NULL DEFAULT 'stack_page',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  completed_at TIMESTAMP WITH TIME ZONE
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.mentalitate_stack_sessions TO authenticated;
GRANT ALL ON public.mentalitate_stack_sessions TO service_role;

ALTER TABLE public.mentalitate_stack_sessions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage own mentalitate sessions"
  ON public.mentalitate_stack_sessions
  FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE INDEX idx_mentalitate_sessions_user_created ON public.mentalitate_stack_sessions(user_id, created_at DESC);
CREATE INDEX idx_mentalitate_sessions_user_mode ON public.mentalitate_stack_sessions(user_id, mode);

CREATE TRIGGER trg_mentalitate_sessions_updated_at
  BEFORE UPDATE ON public.mentalitate_stack_sessions
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Auto-set user_id if missing
CREATE OR REPLACE FUNCTION public.auto_set_mentalitate_session_defaults()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
  IF NEW.user_id IS NULL THEN NEW.user_id := auth.uid(); END IF;
  IF NEW.completed = true AND NEW.completed_at IS NULL THEN
    NEW.completed_at := now();
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_mentalitate_sessions_defaults
  BEFORE INSERT OR UPDATE ON public.mentalitate_stack_sessions
  FOR EACH ROW EXECUTE FUNCTION public.auto_set_mentalitate_session_defaults();

-- Recalculate Brain Map signal when session completed
CREATE OR REPLACE FUNCTION public.apply_mentalitate_session_to_axes()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  axis_name TEXT;
  signal_weight NUMERIC := 0.3;
BEGIN
  -- Only fire when transitioning to completed
  IF NEW.completed = true AND (OLD.completed IS DISTINCT FROM true) THEN
    IF NEW.axes_impacted IS NOT NULL THEN
      FOREACH axis_name IN ARRAY NEW.axes_impacted
      LOOP
        INSERT INTO public.mind_axis_scores (user_id, axis, score, updated_at)
        VALUES (NEW.user_id, axis_name, LEAST(100, 50 + (signal_weight * 10))::int, now())
        ON CONFLICT (user_id, axis) DO UPDATE
          SET score = LEAST(100, public.mind_axis_scores.score + (signal_weight * 5))::int,
              updated_at = now();
      END LOOP;
    END IF;
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_mentalitate_apply_axes
  AFTER UPDATE ON public.mentalitate_stack_sessions
  FOR EACH ROW EXECUTE FUNCTION public.apply_mentalitate_session_to_axes();
