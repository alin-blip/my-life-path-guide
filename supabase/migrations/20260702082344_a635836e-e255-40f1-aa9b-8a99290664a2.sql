
REVOKE EXECUTE ON FUNCTION public.bump_axis_score(uuid, text, numeric) FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.apply_stack_session_to_axes() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.apply_user_task_to_axes() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.apply_belief_progress_to_axes() FROM PUBLIC, anon, authenticated;
