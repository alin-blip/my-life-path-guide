
CREATE OR REPLACE FUNCTION public.bump_axis_score(_user_id uuid, _axis text, _weight numeric)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.mind_axis_scores (user_id, axis, score_healthy, updated_at, last_computed_at)
  VALUES (_user_id, _axis, LEAST(100, 50 + (_weight * 10))::numeric, now(), now())
  ON CONFLICT (user_id, axis) DO UPDATE
    SET score_healthy = LEAST(100, public.mind_axis_scores.score_healthy + (_weight * 5))::numeric,
        updated_at = now(),
        last_computed_at = now();
END;
$$;

CREATE OR REPLACE FUNCTION public.apply_stack_session_to_axes()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF NEW.completed = true AND (OLD.completed IS DISTINCT FROM true) THEN
    PERFORM public.bump_axis_score(NEW.user_id, 'mind', 0.25);
  END IF;
  RETURN NEW;
END; $$;

DROP TRIGGER IF EXISTS trg_stack_session_axes ON public.stack_sessions;
CREATE TRIGGER trg_stack_session_axes
AFTER UPDATE OF completed ON public.stack_sessions
FOR EACH ROW EXECUTE FUNCTION public.apply_stack_session_to_axes();

CREATE OR REPLACE FUNCTION public.apply_user_task_to_axes()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF NEW.completed = true AND (OLD.completed IS DISTINCT FROM true) THEN
    PERFORM public.bump_axis_score(NEW.user_id, 'business', 0.15);
  END IF;
  RETURN NEW;
END; $$;

DROP TRIGGER IF EXISTS trg_user_task_axes ON public.user_tasks;
CREATE TRIGGER trg_user_task_axes
AFTER UPDATE OF completed ON public.user_tasks
FOR EACH ROW EXECUTE FUNCTION public.apply_user_task_to_axes();

CREATE OR REPLACE FUNCTION public.apply_belief_progress_to_axes()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF NEW.completed_at IS NOT NULL AND (OLD.completed_at IS DISTINCT FROM NEW.completed_at) THEN
    PERFORM public.bump_axis_score(NEW.user_id, 'being', 0.2);
  END IF;
  RETURN NEW;
END; $$;

DROP TRIGGER IF EXISTS trg_belief_progress_axes ON public.belief_chapter_progress;
CREATE TRIGGER trg_belief_progress_axes
AFTER INSERT OR UPDATE OF completed_at ON public.belief_chapter_progress
FOR EACH ROW EXECUTE FUNCTION public.apply_belief_progress_to_axes();
